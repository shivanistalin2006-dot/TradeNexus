import os
import json
import re
from typing import Dict, Any, Optional

ALLOWED_CLASSIFICATIONS = [
    "Potential B2B Buyer",
    "Importer",
    "Wholesaler",
    "Distributor",
    "Retailer",
    "Individual Customer",
    "Irrelevant Lead"
]

def rule_based_classify(lead: Dict[str, Any]) -> Dict[str, str]:
    """
    Intelligent rule-based fallback classification when Gemini API is unavailable or offline.
    Uses multi-dimensional signal weighting: company indicators, source, category, email domain, and notes.
    """
    company = (lead.get("company_name") or "").strip().lower()
    contact = (lead.get("contact_person") or "").strip().lower()
    email = (lead.get("email") or "").strip().lower()
    category = (lead.get("buyer_category") or "").strip().lower()
    source = (lead.get("lead_source") or "").strip().lower()
    product = (lead.get("product_interest") or "").strip().lower()
    notes = (lead.get("notes") or "").strip().lower()

    # 1. Check for Irrelevant / Spam leads
    spam_keywords = ["seo", "marketing agency", "spambot", "disposable", "promo", "crypto", "casino", "lead generation", "advertising"]
    if any(k in company or k in product or k in notes or k in contact for k in spam_keywords):
        return {
            "classification": "Irrelevant Lead",
            "reasoning": "Company name or product interest indicates promotional/marketing agency or spam solicitations unrelated to handicraft imports."
        }

    if "temp-disposable" in email or "xyz" in email.split("@")[-1] and "leads" in email:
        return {
            "classification": "Irrelevant Lead",
            "reasoning": "Detected disposable or promotional email address pattern without trade relevance."
        }

    # 2. Check for Individual Customer (Free webmail + lack of company structure + retail/single intent)
    free_webmails = ["@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com", "@icloud.com", "@aol.com"]
    is_free_mail = any(email.endswith(dom) for dom in free_webmails)
    has_company_structure = any(s in company for s in ["inc", "llc", "ltd", "gmbh", "sarl", "co.", "corp", "großhandel", "wholesale", "import", "distributor", "trading", "pty", "srl", "b.v."])

    if is_free_mail and not has_company_structure and ("blog" in company or "personal" in company or not company or "single" in notes):
        return {
            "classification": "Individual Customer",
            "reasoning": "Free public webmail domain without registered corporate entity structure. Indicative of individual retail consumer."
        }

    # 3. Customs / Bill of Lading / Verified Importers
    if "importyeti" in source or "importer" in category or "import" in company or "gmbh" in company and "import" in company:
        return {
            "classification": "Importer",
            "reasoning": f"Identified as direct commercial importer based on trade source ({lead.get('lead_source')}) and corporate entity records."
        }

    # 4. Wholesale / Bulk Distributors
    if "wholesaler" in category or "wholesale" in company or "großhandel" in company or "supplies" in company:
        return {
            "classification": "Wholesaler",
            "reasoning": f"B2B wholesale trading company with multi-outlet supply network in {lead.get('country', 'international market')}."
        }

    if "distributor" in category or "distribution" in company or "trading" in company or "llc" in company and "wellness" in category:
        return {
            "classification": "Distributor",
            "reasoning": f"Established regional distributor servicing boutique retailers and wellness institutions in {lead.get('city') or lead.get('country')}."
        }

    # 5. Specialized Retailers & Boutique Studios
    if "retailer" in category or "home decor" in category or "boutique" in company or "store" in company or "studio" in company or "shop" in company:
        return {
            "classification": "Retailer",
            "reasoning": f"Specialty lifestyle or decor retail establishment stocking curated artisan handcrafted collections."
        }

    # 6. Wellness & Holistic Studios
    if "wellness" in category or "meditation" in company or "sound" in company or "healing" in company or "yoga" in company:
        return {
            "classification": "Potential B2B Buyer",
            "reasoning": f"Holistic wellness enterprise with ongoing operational demand for certified acoustic and meditation products."
        }

    # 7. Default to Potential B2B Buyer if business entity
    if has_company_structure:
        return {
            "classification": "Potential B2B Buyer",
            "reasoning": f"Commercial entity identified in {lead.get('country')} with verifiable business presence."
        }

    return {
        "classification": "Potential B2B Buyer",
        "reasoning": "Commercial profile aligns with international buyer discovery parameters. Suitable for introductory outreach."
    }

def classify_lead_with_gemini(lead: Dict[str, Any], api_key: str, model_name: str = "gemini-2.5-flash") -> Dict[str, str]:
    """
    Classifies a buyer lead using the Gemini API.
    Falls back gracefully to rule_based_classify if API key is empty or error occurs.
    """
    if not api_key:
        fallback = rule_based_classify(lead)
        fallback["reasoning"] += " (Rule-based engine; configure Gemini API Key in Settings for live AI synthesis)"
        return fallback

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt = f"""
You are an expert International Trade and B2B Lead Qualification Analyst for an Indian Exporter.
Analyze the following international lead and classify it into EXACTLY ONE of these categories:
- Potential B2B Buyer
- Importer
- Wholesaler
- Distributor
- Retailer
- Individual Customer
- Irrelevant Lead

Lead Details:
- Company Name: {lead.get('company_name', 'N/A')}
- Contact Person: {lead.get('contact_person', 'N/A')}
- Email: {lead.get('email', 'N/A')}
- Website: {lead.get('website', 'N/A')}
- Country: {lead.get('country', 'N/A')}
- City: {lead.get('city', 'N/A')}
- Buyer Category Stated: {lead.get('buyer_category', 'N/A')}
- Product Interest: {lead.get('product_interest', 'N/A')}
- Lead Source: {lead.get('lead_source', 'N/A')}
- Notes: {lead.get('notes', 'N/A')}

Respond ONLY with a valid JSON object in this exact schema without markdown backticks:
{{
  "classification": "<one of the exact categories above>",
  "reasoning": "<1-2 sentences concise justification of why this lead fits this classification and commercial viability>"
}}
"""
        response = client.models.generate_content(
            model=model_name or "gemini-2.5-flash",
            contents=prompt,
        )

        response_text = response.text.strip()
        # Clean potential markdown fences
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        data = json.loads(response_text)
        classification = data.get("classification", "").strip()
        if classification not in ALLOWED_CLASSIFICATIONS:
            # Match closest or fallback
            for valid_cat in ALLOWED_CLASSIFICATIONS:
                if valid_cat.lower() in classification.lower():
                    classification = valid_cat
                    break
            else:
                classification = "Potential B2B Buyer"

        return {
            "classification": classification,
            "reasoning": data.get("reasoning", "Classified via Gemini AI model analysis.") + " (Powered by Gemini AI)"
        }
    except Exception as e:
        fallback = rule_based_classify(lead)
        fallback["reasoning"] += f" (Fallback applied: {str(e)[:80]})"
        return fallback
