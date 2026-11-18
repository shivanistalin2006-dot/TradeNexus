import time
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

def render_email_template(template: str, lead: Dict[str, Any], settings: Dict[str, str]) -> str:
    """
    Substitutes all dynamic variable placeholders with lead and exporter details.
    """
    rendered = template
    replacements = {
        "{{contact_person}}": lead.get("contact_person", "Valued Partner"),
        "{{company_name}}": lead.get("company_name", "your esteemed company"),
        "{{country}}": lead.get("country", "your country"),
        "{{state}}": lead.get("state", ""),
        "{{city}}": lead.get("city", "your city"),
        "{{buyer_category}}": lead.get("buyer_category", "business"),
        "{{product_interest}}": lead.get("product_interest", settings.get("default_product", "Acoustic Singing Bowls")),
        "{{sender_company}}": settings.get("company_name", "Vedic Sound & Crafts India Pvt Ltd"),
        "{{sender_name}}": settings.get("contact_person", "Rajesh Sharma"),
        "{{sender_email}}": settings.get("contact_email", "export@vedicsoundcrafts.com"),
        "{{sender_phone}}": settings.get("contact_phone", "+91 98112 34567"),
        "{{sender_website}}": settings.get("contact_website", "https://www.vedicsoundcrafts.com"),
        "{{export_port}}": settings.get("export_port", "Delhi Air Cargo / JNPT Mumbai")
    }

    for tag, val in replacements.items():
        rendered = rendered.replace(tag, str(val))

    return rendered

def simulate_demo_send(
    campaign_id: int,
    lead: Dict[str, Any],
    subject: str,
    body: str,
    has_attachment: bool = False
) -> Dict[str, Any]:
    """
    Simulates sending an outreach email in Demo Mode.
    Records delivery timestamp, simulation latency, and duplicate verification.
    """
    # Small realistic processing delay
    time.sleep(0.15)

    recipient_email = lead.get("email", "")
    recipient_name = lead.get("contact_person", "")
    company_name = lead.get("company_name", "")

    # Check for invalid address simulation
    if lead.get("email_status") == "Invalid":
        return {
            "status": "Failed",
            "error_message": f"Simulated bounce: recipient email '{recipient_email}' is marked Invalid.",
            "recipient_email": recipient_email,
            "recipient_name": recipient_name,
            "company_name": company_name,
            "subject": subject
        }

    return {
        "status": "Sent (Demo Mode)",
        "error_message": "",
        "recipient_email": recipient_email,
        "recipient_name": recipient_name,
        "company_name": company_name,
        "subject": subject,
        "delivered": True,
        "attachment": "sample_product_presentation.pdf" if has_attachment else None
    }
