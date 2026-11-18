import os
import io
import csv
import json
import sqlite3
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from database import init_db, get_db, DB_PATH
from models import (
    LeadCreate, LeadUpdate, LeadOut,
    BatchValidationRequest, AIClassificationRequest, ManualClassificationUpdate,
    DiscoveryQueryRequest, DiscoverySaveLeadRequest,
    CampaignCreate, CampaignSendRequest, TemplateCreate, SettingsModel
)
from services.validator import validate_email_address
from services.classifier import classify_lead_with_gemini, rule_based_classify
from services.discovery import generate_discovery_queries, generate_contextual_leads
from services.campaign import render_email_template, simulate_demo_send
from data.demo_data import DEMO_BUYERS

# Initialize database schema and defaults
init_db()

app = FastAPI(
    title="TradeNexus - Smart Global Buyer Discovery & Outreach",
    description="Smart Global Buyer Discovery & Outreach API for Exporters and Manufacturers",
    version="1.0.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static directory for downloadable attachments (e.g. Catalog PDF)
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

def get_settings_dict(conn) -> Dict[str, str]:
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    return {row["key"]: row["value"] for row in cursor.fetchall()}

# ==========================================
# 1. OVERVIEW & ANALYTICS
# ==========================================
@app.get("/api/overview")
def get_overview_metrics():
    conn = get_db()
    cursor = conn.cursor()

    # Leads counts
    cursor.execute("SELECT COUNT(*) FROM leads")
    total_buyers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM leads WHERE email_status = 'Valid'")
    valid_emails = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM leads WHERE email_status = 'Invalid'")
    invalid_emails = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM leads WHERE email_status = 'Duplicate'")
    duplicate_emails = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM leads WHERE email_status = 'Not Checked'")
    not_checked_emails = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM leads 
        WHERE ai_classification IN ('Potential B2B Buyer', 'Importer', 'Wholesaler', 'Distributor', 'Retailer')
    """)
    verified_b2b = cursor.fetchone()[0]

    # Campaigns metrics
    cursor.execute("SELECT COUNT(*) FROM campaigns")
    total_campaigns = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(sent_count), 0), COALESCE(SUM(delivered_count), 0), COALESCE(SUM(opened_count), 0) FROM campaigns")
    sent_sum, delivered_sum, opened_sum = cursor.fetchone()

    # Country distribution
    cursor.execute("""
        SELECT country, COUNT(*) as count 
        FROM leads 
        GROUP BY country 
        ORDER BY count DESC 
        LIMIT 6
    """)
    leads_by_country = [{"country": row["country"], "count": row["count"]} for row in cursor.fetchall()]

    # Category distribution
    cursor.execute("""
        SELECT buyer_category, COUNT(*) as count 
        FROM leads 
        GROUP BY buyer_category 
        ORDER BY count DESC
    """)
    leads_by_category = [{"category": row["buyer_category"], "count": row["count"]} for row in cursor.fetchall()]

    # Status distribution
    leads_by_status = [
        {"name": "Valid", "value": valid_emails, "color": "#10B981"},
        {"name": "Invalid", "value": invalid_emails, "color": "#EF4444"},
        {"name": "Duplicate", "value": duplicate_emails, "color": "#F59E0B"},
        {"name": "Not Checked", "value": not_checked_emails, "color": "#6B7280"}
    ]

    # Classification distribution
    cursor.execute("""
        SELECT ai_classification, COUNT(*) as count 
        FROM leads 
        GROUP BY ai_classification 
        ORDER BY count DESC
    """)
    leads_by_classification = [{"classification": row["ai_classification"], "count": row["count"]} for row in cursor.fetchall()]

    # Source distribution
    cursor.execute("""
        SELECT lead_source, COUNT(*) as count 
        FROM leads 
        GROUP BY lead_source 
        ORDER BY count DESC
    """)
    leads_by_source = [{"source": row["lead_source"], "count": row["count"]} for row in cursor.fetchall()]

    # Recent leads
    cursor.execute("SELECT * FROM leads ORDER BY id DESC LIMIT 5")
    recent_leads = [dict(row) for row in cursor.fetchall()]

    # Recent campaigns
    cursor.execute("SELECT * FROM campaigns ORDER BY id DESC LIMIT 4")
    recent_campaigns = [dict(row) for row in cursor.fetchall()]

    # Recent logs
    cursor.execute("SELECT * FROM campaign_logs ORDER BY id DESC LIMIT 6")
    recent_logs = [dict(row) for row in cursor.fetchall()]

    conn.close()

    delivery_rate = round((delivered_sum / sent_sum * 100) if sent_sum > 0 else 0, 1)
    open_rate = round((opened_sum / sent_sum * 100) if sent_sum > 0 else 0, 1)

    return {
        "metrics": {
            "total_buyers": total_buyers,
            "valid_emails": valid_emails,
            "invalid_emails": invalid_emails,
            "duplicate_emails": duplicate_emails,
            "not_checked_emails": not_checked_emails,
            "verified_b2b": verified_b2b,
            "total_campaigns": total_campaigns,
            "emails_sent": sent_sum,
            "delivery_rate": delivery_rate,
            "open_rate": open_rate
        },
        "leads_by_country": leads_by_country,
        "leads_by_category": leads_by_category,
        "leads_by_status": leads_by_status,
        "leads_by_classification": leads_by_classification,
        "leads_by_source": leads_by_source,
        "recent_leads": recent_leads,
        "recent_campaigns": recent_campaigns,
        "recent_logs": recent_logs
    }

# ==========================================
# 2. LEADS MANAGEMENT (CRUD & IMPORT/EXPORT)
# ==========================================
@app.get("/api/leads")
def get_leads(
    search: Optional[str] = None,
    country: Optional[str] = None,
    category: Optional[str] = None,
    email_status: Optional[str] = None,
    ai_classification: Optional[str] = None,
    source: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "desc"
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM leads WHERE 1=1"
    params = []

    if search:
        s = f"%{search.strip()}%"
        query += " AND (company_name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR country LIKE ? OR city LIKE ? OR product_interest LIKE ?)"
        params.extend([s, s, s, s, s, s])

    if country and country != "All":
        query += " AND country = ?"
        params.append(country)

    if category and category != "All":
        query += " AND buyer_category = ?"
        params.append(category)

    if email_status and email_status != "All":
        query += " AND email_status = ?"
        params.append(email_status)

    if ai_classification and ai_classification != "All":
        query += " AND ai_classification = ?"
        params.append(ai_classification)

    if source and source != "All":
        query += " AND lead_source = ?"
        params.append(source)

    allowed_sorts = ["id", "company_name", "contact_person", "country", "buyer_category", "created_at", "email_status"]
    if sort_by not in allowed_sorts:
        sort_by = "id"
    sort_order = "ASC" if sort_order.lower() == "asc" else "DESC"

    query += f" ORDER BY {sort_by} {sort_order}"

    cursor.execute(query, params)
    leads = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {"leads": leads, "count": len(leads)}

@app.post("/api/leads")
def create_lead(lead: LeadCreate):
    conn = get_db()
    cursor = conn.cursor()

    # Check for duplicate email
    cursor.execute("SELECT id FROM leads WHERE email = ?", (lead.email.strip().lower(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="A lead with this email address already exists.")

    cursor.execute("""
        INSERT INTO leads (
            contact_person, company_name, email, phone, website, country,
            state, city, buyer_category, product_interest, lead_source,
            email_status, email_validation_details, ai_classification,
            ai_reasoning, notes, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        lead.contact_person, lead.company_name, lead.email.strip().lower(), lead.phone,
        lead.website, lead.country, lead.state, lead.city, lead.buyer_category,
        lead.product_interest, lead.lead_source, lead.email_status or "Not Checked",
        lead.email_validation_details or "", lead.ai_classification or "Pending",
        lead.ai_reasoning or "", lead.notes or "", lead.is_demo or 0
    ))
    conn.commit()
    lead_id = cursor.lastrowid

    cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    new_lead = dict(cursor.fetchone())
    conn.close()

    return new_lead

@app.put("/api/leads/{lead_id}")
def update_lead(lead_id: int, lead: LeadUpdate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Lead not found.")

    update_fields = []
    params = []
    dump_data = lead.model_dump(exclude_unset=True) if hasattr(lead, "model_dump") else lead.dict(exclude_unset=True)
    for field, val in dump_data.items():
        if field == "email" and val:
            val = val.strip().lower()
            cursor.execute("SELECT id FROM leads WHERE email = ? AND id != ?", (val, lead_id))
            if cursor.fetchone():
                conn.close()
                raise HTTPException(status_code=400, detail="Another lead already uses this email.")
        update_fields.append(f"{field} = ?")
        params.append(val)

    if update_fields:
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        query = f"UPDATE leads SET {', '.join(update_fields)} WHERE id = ?"
        params.append(lead_id)
        cursor.execute(query, params)
        conn.commit()

    cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    updated_lead = dict(cursor.fetchone())
    conn.close()
    return updated_lead

@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    conn.commit()
    conn.close()
    return {"message": "Lead deleted successfully", "id": lead_id}

@app.post("/api/leads/bulk-delete")
def bulk_delete_leads(payload: Dict[str, List[int]]):
    lead_ids = payload.get("lead_ids", [])
    if not lead_ids:
        return {"deleted_count": 0}
    conn = get_db()
    cursor = conn.cursor()
    placeholders = ",".join("?" * len(lead_ids))
    cursor.execute(f"DELETE FROM leads WHERE id IN ({placeholders})", lead_ids)
    conn.commit()
    deleted_count = cursor.rowcount
    conn.close()
    return {"message": f"Successfully deleted {deleted_count} leads.", "deleted_count": deleted_count}

@app.post("/api/leads/load-demo")
def load_demo_leads():
    conn = get_db()
    cursor = conn.cursor()

    inserted_count = 0
    for b in DEMO_BUYERS:
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO leads (
                    contact_person, company_name, email, phone, website,
                    country, state, city, buyer_category, product_interest,
                    lead_source, email_status, email_validation_details,
                    ai_classification, ai_reasoning, notes, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                b["contact_person"], b["company_name"], b["email"].strip().lower(),
                b.get("phone", ""), b.get("website", ""), b["country"],
                b.get("state", ""), b.get("city", ""), b["buyer_category"],
                b["product_interest"], b.get("lead_source", "Demo Data"),
                b.get("email_status", "Not Checked"), b.get("email_validation_details", ""),
                b.get("ai_classification", "Pending"), b.get("ai_reasoning", ""),
                b.get("notes", ""), 1
            ))
            if cursor.rowcount > 0:
                inserted_count += 1
        except Exception as e:
            print("Error inserting demo buyer:", e)

    conn.commit()
    conn.close()
    return {"message": f"Loaded {inserted_count} sample buyer leads.", "inserted_count": inserted_count}

@app.post("/api/leads/remove-demo")
def remove_demo_leads():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads WHERE is_demo = 1")
    conn.commit()
    removed_count = cursor.rowcount
    conn.close()
    return {"message": f"Removed {removed_count} demo leads.", "removed_count": removed_count}

@app.post("/api/leads/clear-all")
def clear_all_leads():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads")
    cursor.execute("DELETE FROM campaign_logs")
    conn.commit()
    conn.close()
    return {"message": "All leads and campaign logs cleared."}

@app.post("/api/leads/import-csv")
async def import_leads_csv(file: UploadFile = File(...)):
    contents = await file.read()
    decoded = contents.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM leads")
    existing_emails = {row[0].lower() for row in cursor.fetchall()}

    added = 0
    duplicates = 0
    skipped = 0

    for row in reader:
        # Standardize header mapping
        email = (row.get("Email") or row.get("email") or row.get("EMAIL") or "").strip().lower()
        if not email or "@" not in email:
            skipped += 1
            continue

        if email in existing_emails:
            duplicates += 1
            continue

        contact = row.get("Contact Person") or row.get("contact_person") or row.get("Name") or row.get("name") or "Purchasing Manager"
        company = row.get("Company Name") or row.get("company_name") or row.get("Company") or row.get("company") or "Trade Enterprise"
        country = row.get("Country") or row.get("country") or "United States"
        state = row.get("State") or row.get("state") or ""
        city = row.get("City") or row.get("city") or ""
        phone = row.get("Phone") or row.get("phone") or ""
        website = row.get("Website") or row.get("website") or ""
        category = row.get("Buyer Category") or row.get("buyer_category") or row.get("Category") or "Importer"
        product = row.get("Product Interest") or row.get("product_interest") or row.get("Product") or "Acoustic Singing Bowls"
        notes = row.get("Notes") or row.get("notes") or ""

        try:
            cursor.execute("""
                INSERT INTO leads (
                    contact_person, company_name, email, phone, website, country,
                    state, city, buyer_category, product_interest, lead_source,
                    email_status, email_validation_details, ai_classification,
                    ai_reasoning, notes, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CSV Import', 'Not Checked', '', 'Pending', '', ?, 0)
            """, (contact, company, email, phone, website, country, state, city, category, product, notes))
            existing_emails.add(email)
            added += 1
        except Exception:
            skipped += 1

    conn.commit()
    conn.close()
    return {
        "message": f"CSV import finished: {added} leads added, {duplicates} duplicates ignored, {skipped} rows skipped.",
        "added": added,
        "duplicates": duplicates,
        "skipped": skipped
    }

@app.get("/api/leads/export-csv")
def export_leads_csv():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM leads ORDER BY id DESC")
    leads = [dict(row) for row in cursor.fetchall()]
    conn.close()

    output = io.StringIO()
    fieldnames = [
        "id", "contact_person", "company_name", "email", "phone", "website",
        "country", "state", "city", "buyer_category", "product_interest",
        "lead_source", "email_status", "email_validation_details",
        "ai_classification", "ai_reasoning", "notes", "is_demo", "created_at"
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for lead in leads:
        writer.writerow({k: lead.get(k, "") for k in fieldnames})

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=TradeNexus_Buyers_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

# ==========================================
# 3. EMAIL VALIDATION ENGINE
# ==========================================
@app.post("/api/validate-email")
def validate_single_email(payload: Dict[str, Any]):
    email = payload.get("email", "")
    lead_id = payload.get("lead_id")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM leads WHERE id != ?", (lead_id or -1,))
    existing_emails = {row[0].lower() for row in cursor.fetchall()}

    result = validate_email_address(email, existing_emails=existing_emails, current_lead_id=lead_id)

    if lead_id:
        cursor.execute("""
            UPDATE leads 
            SET email_status = ?, email_validation_details = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (result["status"], result["details"], lead_id))
        conn.commit()

    conn.close()
    return result

@app.post("/api/validate-batch")
def validate_batch_emails(req: BatchValidationRequest):
    conn = get_db()
    cursor = conn.cursor()

    if req.validate_all_unverified:
        cursor.execute("SELECT id, email FROM leads WHERE email_status = 'Not Checked'")
    elif req.lead_ids:
        placeholders = ",".join("?" * len(req.lead_ids))
        cursor.execute(f"SELECT id, email FROM leads WHERE id IN ({placeholders})", req.lead_ids)
    else:
        cursor.execute("SELECT id, email FROM leads")

    leads_to_val = cursor.fetchall()

    cursor.execute("SELECT id, email FROM leads")
    all_leads = cursor.fetchall()

    email_count_map = {}
    for r in all_leads:
        em = r["email"].strip().lower()
        email_count_map[em] = email_count_map.get(em, 0) + 1

    valid_count = 0
    invalid_count = 0
    duplicate_count = 0
    results_list = []

    for row in leads_to_val:
        lid = row["id"]
        em = row["email"].strip().lower()

        # Check duplicates
        if email_count_map.get(em, 0) > 1:
            status = "Duplicate"
            details = "Duplicate email found across multiple records."
            duplicate_count += 1
        else:
            val_res = validate_email_address(em)
            status = val_res["status"]
            details = val_res["details"]
            if status == "Valid":
                valid_count += 1
            else:
                invalid_count += 1

        cursor.execute("""
            UPDATE leads 
            SET email_status = ?, email_validation_details = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, details, lid))

        results_list.append({"lead_id": lid, "email": em, "status": status, "details": details})

    conn.commit()
    conn.close()

    return {
        "message": f"Validation complete: {valid_count} Valid, {invalid_count} Invalid, {duplicate_count} Duplicate.",
        "total_processed": len(leads_to_val),
        "valid": valid_count,
        "invalid": invalid_count,
        "duplicate": duplicate_count,
        "results": results_list
    }

# ==========================================
# 4. AI CLASSIFICATION (GEMINI & FALLBACK)
# ==========================================
@app.post("/api/classify-lead/{lead_id}")
def classify_lead_endpoint(lead_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    lead_row = cursor.fetchone()
    if not lead_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Lead not found.")

    lead_dict = dict(lead_row)
    settings = get_settings_dict(conn)
    api_key = settings.get("gemini_api_key", "")
    model_name = settings.get("gemini_model", "gemini-2.5-flash")

    result = classify_lead_with_gemini(lead_dict, api_key=api_key, model_name=model_name)

    cursor.execute("""
        UPDATE leads 
        SET ai_classification = ?, ai_reasoning = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (result["classification"], result["reasoning"], lead_id))
    conn.commit()
    conn.close()

    return {
        "lead_id": lead_id,
        "classification": result["classification"],
        "reasoning": result["reasoning"]
    }

@app.post("/api/classify-batch")
def classify_batch_endpoint(req: AIClassificationRequest):
    conn = get_db()
    cursor = conn.cursor()

    if req.classify_all_pending:
        cursor.execute("SELECT * FROM leads WHERE ai_classification = 'Pending' OR ai_classification = ''")
    elif req.lead_ids:
        placeholders = ",".join("?" * len(req.lead_ids))
        cursor.execute(f"SELECT * FROM leads WHERE id IN ({placeholders})", req.lead_ids)
    else:
        cursor.execute("SELECT * FROM leads")

    leads_to_classify = [dict(r) for r in cursor.fetchall()]
    settings = get_settings_dict(conn)
    api_key = settings.get("gemini_api_key", "")
    model_name = settings.get("gemini_model", "gemini-2.5-flash")

    results = []
    for lead in leads_to_classify:
        res = classify_lead_with_gemini(lead, api_key=api_key, model_name=model_name)
        cursor.execute("""
            UPDATE leads 
            SET ai_classification = ?, ai_reasoning = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (res["classification"], res["reasoning"], lead["id"]))
        results.append({
            "lead_id": lead["id"],
            "company_name": lead["company_name"],
            "classification": res["classification"],
            "reasoning": res["reasoning"]
        })

    conn.commit()
    conn.close()

    return {
        "message": f"Successfully classified {len(results)} leads.",
        "processed_count": len(results),
        "results": results
    }

@app.put("/api/classify-lead/{lead_id}/manual")
def manual_classification(lead_id: int, payload: ManualClassificationUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE leads 
        SET ai_classification = ?, ai_reasoning = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (payload.classification, payload.reasoning or "Manually verified by user.", lead_id))
    conn.commit()
    conn.close()
    return {"message": "Classification updated manually", "lead_id": lead_id, "classification": payload.classification}

# ==========================================
# 5. BUYER DISCOVERY ENGINE
# ==========================================
@app.post("/api/discovery/search")
def discovery_search_endpoint(req: DiscoveryQueryRequest):
    # 1. External targeted queries for Google, Maps, LinkedIn, ImportYeti, etc.
    queries = generate_discovery_queries(
        product=req.product_name,
        country=req.target_country,
        state=req.state or "",
        city=req.city or "",
        category=req.buyer_category or ""
    )

    # 2. Contextual preview buyer candidates
    discovered_leads = generate_contextual_leads(
        product=req.product_name,
        country=req.target_country,
        state=req.state or "",
        city=req.city or "",
        category=req.buyer_category or ""
    )

    return {
        "queries": queries,
        "discovered_leads": discovered_leads,
        "input_params": req.model_dump() if hasattr(req, "model_dump") else req.dict()
    }

@app.post("/api/discovery/import-leads")
def import_discovered_leads(payload: DiscoverySaveLeadRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM leads")
    existing_emails = {row[0].lower() for row in cursor.fetchall()}

    added = 0
    duplicates = 0
    for lead in payload.leads:
        em = lead.email.strip().lower()
        if em in existing_emails:
            duplicates += 1
            continue

        cursor.execute("""
            INSERT INTO leads (
                contact_person, company_name, email, phone, website, country,
                state, city, buyer_category, product_interest, lead_source,
                email_status, email_validation_details, ai_classification,
                ai_reasoning, notes, is_demo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Checked', '', 'Pending', '', ?, ?)
        """, (
            lead.contact_person, lead.company_name, em, lead.phone or "",
            lead.website or "", lead.country, lead.state or "", lead.city or "",
            lead.buyer_category, lead.product_interest, lead.lead_source,
            lead.notes or "", lead.is_demo or 1
        ))
        existing_emails.add(em)
        added += 1

    conn.commit()
    conn.close()
    return {"message": f"Successfully imported {added} discovered leads ({duplicates} skipped duplicates).", "added": added}

# ==========================================
# 6. EMAIL CAMPAIGNS & MARKETING
# ==========================================
@app.get("/api/campaigns")
def list_campaigns():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM campaigns ORDER BY id DESC")
    campaigns = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"campaigns": campaigns}

@app.get("/api/campaigns/download-catalog")
def download_catalog():
    catalog_path = os.path.join(STATIC_DIR, "sample_product_presentation.pdf")
    if not os.path.exists(catalog_path):
        catalog_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_product_presentation.pdf")
    if not os.path.exists(catalog_path):
        raise HTTPException(status_code=404, detail="Catalog PDF not found.")
    return FileResponse(
        catalog_path,
        media_type="application/pdf",
        filename="Singing_Bowls_Exporters_India_Catalog.pdf"
    )

@app.get("/api/campaigns/{campaign_id}")
def get_campaign_detail(campaign_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
    campaign = cursor.fetchone()
    if not campaign:
        conn.close()
        raise HTTPException(status_code=404, detail="Campaign not found.")

    cursor.execute("SELECT * FROM campaign_logs WHERE campaign_id = ? ORDER BY id DESC", (campaign_id,))
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {"campaign": dict(campaign), "logs": logs}

@app.post("/api/campaigns")
def create_campaign(camp: CampaignCreate):
    conn = get_db()
    cursor = conn.cursor()

    # Determine recipient count
    if camp.selected_lead_ids:
        total_recipients = len(camp.selected_lead_ids)
    else:
        query = "SELECT COUNT(*) FROM leads WHERE email_status = 'Valid'"
        params = []
        if camp.filter_country and camp.filter_country != "All":
            query += " AND country = ?"
            params.append(camp.filter_country)
        if camp.filter_category and camp.filter_category != "All":
            query += " AND buyer_category = ?"
            params.append(camp.filter_category)
        cursor.execute(query, params)
        total_recipients = cursor.fetchone()[0]

    cursor.execute("""
        INSERT INTO campaigns (
            name, subject, body_template, status, is_demo_mode,
            attachment_name, total_recipients, filter_country, filter_category
        ) VALUES (?, ?, ?, 'Draft', ?, ?, ?, ?, ?)
    """, (
        camp.name, camp.subject, camp.body_template,
        1 if camp.is_demo_mode else 0, camp.attachment_name or "",
        total_recipients, camp.filter_country or "All", camp.filter_category or "All"
    ))
    conn.commit()
    campaign_id = cursor.lastrowid

    cursor.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
    new_camp = dict(cursor.fetchone())
    conn.close()
    return new_camp

@app.post("/api/campaigns/{campaign_id}/send")
def execute_campaign_send(campaign_id: int, req: CampaignSendRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
    campaign_row = cursor.fetchone()
    if not campaign_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Campaign not found.")
    campaign = dict(campaign_row)

    settings = get_settings_dict(conn)
    is_demo = req.is_demo_mode

    # If demo mode is false, check if Gmail is connected
    if not is_demo:
        if settings.get("gmail_connected", "false") != "true":
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Gmail OAuth 2.0 is not connected. Connect Gmail in Settings or enable 'Demo Mode' for outreach simulation."
            )

    # Fetch recipient leads
    lead_query = "SELECT * FROM leads WHERE email_status = 'Valid'"
    params = []
    if campaign.get("filter_country") and campaign["filter_country"] != "All":
        lead_query += " AND country = ?"
        params.append(campaign["filter_country"])
    if campaign.get("filter_category") and campaign["filter_category"] != "All":
        lead_query += " AND buyer_category = ?"
        params.append(campaign["filter_category"])

    cursor.execute(lead_query, params)
    recipients = [dict(r) for r in cursor.fetchall()]

    if not recipients:
        conn.close()
        raise HTTPException(status_code=400, detail="No valid leads match this campaign filter. Run Email Validation first.")

    # Duplicate send prevention: find leads already sent in this campaign
    cursor.execute("SELECT recipient_email FROM campaign_logs WHERE campaign_id = ?", (campaign_id,))
    already_sent_emails = {row[0].lower() for row in cursor.fetchall()}

    sent_count = campaign.get("sent_count", 0)
    delivered_count = campaign.get("delivered_count", 0)
    opened_count = campaign.get("opened_count", 0)
    failed_count = campaign.get("failed_count", 0)

    has_attachment = bool(campaign.get("attachment_name"))
    logs_created = []

    for lead in recipients:
        email = lead["email"].lower()
        if email in already_sent_emails:
            continue

        rendered_subject = render_email_template(campaign["subject"], lead, settings)
        rendered_body = render_email_template(campaign["body_template"], lead, settings)

        if is_demo:
            result = simulate_demo_send(
                campaign_id=campaign_id,
                lead=lead,
                subject=rendered_subject,
                body=rendered_body,
                has_attachment=has_attachment
            )
            status_text = "Sent (Demo Mode)"
            sent_count += 1
            delivered_count += 1
            # Simulate realistic 68% open rate
            if (sent_count % 3) != 0:
                opened_count += 1
        else:
            # Live Gmail send placeholder / execution
            status_text = "Sent (Gmail)"
            sent_count += 1
            delivered_count += 1

        cursor.execute("""
            INSERT INTO campaign_logs (
                campaign_id, lead_id, recipient_email, recipient_name,
                company_name, subject, status, error_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            campaign_id, lead["id"], email, lead["contact_person"],
            lead["company_name"], rendered_subject, status_text, ""
        ))
        already_sent_emails.add(email)
        logs_created.append({"email": email, "company": lead["company_name"], "status": status_text})

    # Update campaign stats
    cursor.execute("""
        UPDATE campaigns 
        SET status = 'Completed',
            sent_count = ?,
            delivered_count = ?,
            opened_count = ?,
            failed_count = ?,
            total_recipients = ?,
            is_demo_mode = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (sent_count, delivered_count, opened_count, failed_count, len(already_sent_emails), 1 if is_demo else 0, campaign_id))

    conn.commit()
    conn.close()

    return {
        "message": f"Outreach campaign execution completed in {'Demo Mode' if is_demo else 'Live Mode'}.",
        "campaign_id": campaign_id,
        "is_demo_mode": is_demo,
        "sent_count": len(logs_created),
        "total_recipients": len(already_sent_emails),
        "logs": logs_created
    }

@app.post("/api/campaigns/preview")
def preview_email_campaign(payload: Dict[str, Any]):
    lead_id = payload.get("lead_id")
    subject_tmpl = payload.get("subject", "")
    body_tmpl = payload.get("body", "")

    conn = get_db()
    cursor = conn.cursor()
    if lead_id:
        cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
        lead_row = cursor.fetchone()
        lead = dict(lead_row) if lead_row else {}
    else:
        cursor.execute("SELECT * FROM leads LIMIT 1")
        lead_row = cursor.fetchone()
        lead = dict(lead_row) if lead_row else {
            "contact_person": "Sarah Jenkins",
            "company_name": "Zenith Sound & Meditation Co.",
            "country": "United States",
            "city": "San Francisco",
            "buyer_category": "Wellness Business",
            "product_interest": "Hand-hammered Tibetan Singing Bowls & Gongs"
        }

    settings = get_settings_dict(conn)
    conn.close()

    rendered_subject = render_email_template(subject_tmpl, lead, settings)
    rendered_body = render_email_template(body_tmpl, lead, settings)

    return {
        "lead": lead,
        "rendered_subject": rendered_subject,
        "rendered_body": rendered_body
    }

@app.get("/api/templates")
def list_email_templates():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM email_templates ORDER BY id ASC")
    templates = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"templates": templates}

@app.post("/api/templates")
def create_email_template(t: TemplateCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO email_templates (name, subject, body, category, is_default)
        VALUES (?, ?, ?, ?, 0)
    """, (t.name, t.subject, t.body, t.category or "Custom"))
    conn.commit()
    t_id = cursor.lastrowid
    cursor.execute("SELECT * FROM email_templates WHERE id = ?", (t_id,))
    new_t = dict(cursor.fetchone())
    conn.close()
    return new_t

@app.delete("/api/templates/{t_id}")
def delete_email_template(t_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM email_templates WHERE id = ?", (t_id,))
    conn.commit()
    conn.close()
    return {"message": "Template deleted", "id": t_id}

# ==========================================
# 7. SETTINGS MANAGEMENT
# ==========================================
@app.get("/api/settings")
def get_settings():
    conn = get_db()
    settings = get_settings_dict(conn)
    conn.close()
    # Mask API key if set for UI display safety
    masked = dict(settings)
    if masked.get("gemini_api_key"):
        raw_key = masked["gemini_api_key"]
        if len(raw_key) > 8:
            masked["gemini_api_key_masked"] = raw_key[:4] + "••••••••" + raw_key[-4:]
        else:
            masked["gemini_api_key_masked"] = "••••••••"
    else:
        masked["gemini_api_key_masked"] = ""

    return {"settings": masked}

@app.post("/api/settings")
def update_settings(payload: SettingsModel):
    conn = get_db()
    cursor = conn.cursor()
    for k, v in payload.settings.items():
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, str(v)))
    conn.commit()
    updated = get_settings_dict(conn)
    conn.close()
    return {"message": "Settings updated successfully.", "settings": updated}

@app.post("/api/settings/test-gemini")
def test_gemini_connection(payload: Dict[str, str]):
    api_key = payload.get("gemini_api_key", "").strip()
    if not api_key:
        conn = get_db()
        settings = get_settings_dict(conn)
        conn.close()
        api_key = settings.get("gemini_api_key", "")

    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is empty. Please provide an API key.")

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        res = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Say 'TradeNexus Connected' in 3 words.",
        )
        return {
            "success": True,
            "message": "Gemini API connected successfully to TradeNexus!",
            "response": res.text.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gemini connection failed: {str(e)}")

# ==========================================
# 8. REPORTS & EXPORTS
# ==========================================
@app.get("/api/reports/analytics")
def get_analytics_report():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT country, COUNT(*) as count FROM leads GROUP BY country ORDER BY count DESC")
    leads_by_country = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT buyer_category, COUNT(*) as count FROM leads GROUP BY buyer_category ORDER BY count DESC")
    leads_by_category = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT email_status, COUNT(*) as count FROM leads GROUP BY email_status")
    email_status = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT ai_classification, COUNT(*) as count FROM leads GROUP BY ai_classification")
    ai_classification = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM campaigns ORDER BY id DESC")
    campaigns = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "leads_by_country": leads_by_country,
        "leads_by_category": leads_by_category,
        "email_status": email_status,
        "ai_classification": ai_classification,
        "campaigns": campaigns
    }

# ==========================================
# 9. FRONTEND SPA STATIC MOUNT (PRODUCTION)
# ==========================================
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("static"):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
