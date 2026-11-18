import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exportlead.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Leads table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_person TEXT NOT NULL,
        company_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT DEFAULT '',
        website TEXT DEFAULT '',
        country TEXT NOT NULL,
        state TEXT DEFAULT '',
        city TEXT DEFAULT '',
        buyer_category TEXT NOT NULL,
        product_interest TEXT NOT NULL,
        lead_source TEXT NOT NULL,
        email_status TEXT DEFAULT 'Not Checked',
        email_validation_details TEXT DEFAULT '',
        ai_classification TEXT DEFAULT 'Pending',
        ai_reasoning TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        is_demo INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Campaigns table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        body_template TEXT NOT NULL,
        status TEXT DEFAULT 'Draft',
        is_demo_mode INTEGER DEFAULT 1,
        attachment_name TEXT DEFAULT '',
        total_recipients INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        delivered_count INTEGER DEFAULT 0,
        opened_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        filter_country TEXT DEFAULT 'All',
        filter_category TEXT DEFAULT 'All',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Campaign Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS campaign_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER,
        lead_id INTEGER,
        recipient_email TEXT NOT NULL,
        recipient_name TEXT DEFAULT '',
        company_name TEXT DEFAULT '',
        subject TEXT DEFAULT '',
        status TEXT DEFAULT 'Sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT DEFAULT '',
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL
    )
    """)

    # Email Templates
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS email_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        is_default INTEGER DEFAULT 0
    )
    """)

    # Settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed default settings if not exists
    cursor.execute("SELECT COUNT(*) FROM settings")
    if cursor.fetchone()[0] == 0:
        default_settings = {
            "gemini_api_key": "",
            "gemini_model": "gemini-2.5-flash",
            "gmail_connected": "false",
            "gmail_email": "",
            "gmail_client_id": "",
            "gmail_client_secret": "",
            "company_name": "Vedic Sound & Crafts India Pvt Ltd",
            "contact_person": "Rajesh Sharma",
            "contact_email": "export@vedicsoundcrafts.com",
            "contact_phone": "+91 98112 34567",
            "contact_website": "https://www.vedicsoundcrafts.com",
            "default_product": "Handcrafted Tibetan Singing Bowls, Brass Meditation Bells & Healing Chimes",
            "export_port": "ICD Tughlakabad / Delhi Air Cargo, India",
            "email_demo_mode": "true",
            "batch_send_delay": "2"
        }
        for k, v in default_settings.items():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, v))
        conn.commit()

    # Seed default templates if not exists
    cursor.execute("SELECT COUNT(*) FROM email_templates")
    if cursor.fetchone()[0] == 0:
        seed_default_templates(cursor)
        conn.commit()

    conn.close()

def seed_default_templates(cursor):
    templates = [
        {
            "name": "B2B Importer Introduction & Catalog",
            "subject": "Direct Manufacturer Inquiry: Premium Handcrafted {{product_interest}} from India",
            "category": "Introduction",
            "body": """Dear {{contact_person}},

Hope you are having a productive week.

I came across {{company_name}} and was impressed by your curated collection and distribution reach in {{country}}.

We are {{sender_company}}, leading artisan manufacturers and direct exporters of {{product_interest}} based in New Delhi, India. For over 15 years, we have been supplying premium-grade hand-hammered singing bowls, brass bells, and meditation accessories to premier wholesalers and specialty retailers across North America and Europe.

Key advantages for your supply chain:
- Direct artisan pricing (saving 30-40% compared to tier-1 trading hubs)
- Certified 7-metal acoustic alloy formulation with sustained harmonic resonance
- Low MOQ trial shipments with custom logo engraving and retail packaging
- Door-to-door DDP air and sea freight logistics directly to {{city}}, {{country}}

Please find attached our latest Product Catalog & Wholesale Export Price List (PDF).

Could you spare 5 minutes next Tuesday for a quick introductory exchange?

Warm regards,

{{sender_name}}
Export Director | {{sender_company}}
Email: {{sender_email}} | Phone: {{sender_phone}}
Website: {{sender_website}}

To unsubscribe from future trade inquiries, reply with 'Unsubscribe'."""
        },
        {
            "name": "Wholesale Pricing & Sample Request",
            "subject": "Wholesale Catalog & Free Sample Offer for {{company_name}}",
            "category": "Wholesale",
            "body": """Hello {{contact_person}},

Greetings from India!

We noticed that {{company_name}} is a prominent buyer of wellness and artisanal products in {{city}}, {{country}}.

As direct manufacturers of export-grade {{product_interest}}, we would love to offer {{company_name}} an exclusive trial sample set to evaluate our acoustic resonance and finish firsthand before placing bulk orders.

Highlights of our wholesale program:
- Volume tiered discounts starting at just 50 units
- Tested lead-free bell bronze and 7-metal alloys
- Fast turnaround (7-10 business days courier to {{country}})
- Attached complete wholesale catalog with FOB & CIF terms

If you are open to reviewing samples, simply let us know your preferred shipping address and we will dispatch a complimentary sample set at zero obligation.

Best regards,

{{sender_name}}
{{sender_company}}
{{sender_website}}"""
        },
        {
            "name": "Trade Fair & Seasonal Stocking Follow-up",
            "subject": "Seasonal Inventory Preparation for {{company_name}} - Export Inquiry",
            "category": "Seasonal",
            "body": """Dear {{contact_person}},

With retail demand gearing up for the upcoming holiday and wellness season, we are currently scheduling production slots for our international partners in {{country}}.

{{company_name}} has an admirable market presence in the {{buyer_category}} space. We would be delighted to support your catalog with authentic, master-crafted {{product_interest}}.

Would you be interested in receiving our latest seasonal inventory sheet with ready-to-ship stock?

Looking forward to your thoughts.

Sincerely,

{{sender_name}}
{{sender_company}}"""
        }
    ]

    for t in templates:
        cursor.execute(
            "INSERT INTO email_templates (name, subject, body, category, is_default) VALUES (?, ?, ?, ?, 1)",
            (t["name"], t["subject"], t["body"], t["category"])
        )

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
