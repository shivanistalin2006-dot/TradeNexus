import re
import socket
from typing import Dict, Any, List, Optional
try:
    import dns.resolver
    HAS_DNS = True
except ImportError:
    HAS_DNS = False

# Common disposable / temporary email domains
DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
    "sharklasers.com", "yopmail.com", "throwawaymail.com", "dispostable.com",
    "fakeinbox.com", "trashmail.com", "getairmail.com", "temp-disposable-leads.xyz",
    "mohmal.com", "burnermail.io", "maildrop.cc", "crazymailing.com",
    "mytemp.email", "generator.email", "emailondeck.com"
}

# Role-based prefixes
ROLE_BASED_PREFIXES = {
    "info", "contact", "support", "sales", "admin", "office",
    "enquiry", "inquiry", "help", "billing", "marketing", "orders", "compras"
}

# Major verified corporate & commercial mail providers
WELL_KNOWN_MAIL_DOMAINS = {
    "gmail.com", "google.com", "yahoo.com", "outlook.com", "hotmail.com",
    "icloud.com", "aol.com", "zoho.com", "proton.me", "protonmail.com"
}

# RFC 5322 compliant regex for basic email syntax
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)

def validate_email_address(email: str, existing_emails: Optional[set] = None, current_lead_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Validates an email address across:
    1. Syntax (RFC 5322)
    2. Disposable domain check
    3. Role-based prefix check
    4. Domain MX DNS record resolution / host lookup
    5. Duplicate check against existing emails
    """
    email_clean = (email or "").strip().lower()
    
    if not email_clean:
        return {
            "email": email,
            "status": "Invalid",
            "is_valid": False,
            "is_disposable": False,
            "is_role_based": False,
            "has_mx": False,
            "details": "Email address is empty."
        }

    # Duplicate check
    if existing_emails and email_clean in existing_emails:
        return {
            "email": email_clean,
            "status": "Duplicate",
            "is_valid": False,
            "is_disposable": False,
            "is_role_based": False,
            "has_mx": False,
            "details": "Duplicate email already exists in leads database."
        }

    # Syntax check
    if not EMAIL_REGEX.match(email_clean):
        return {
            "email": email_clean,
            "status": "Invalid",
            "is_valid": False,
            "is_disposable": False,
            "is_role_based": False,
            "has_mx": False,
            "details": "Invalid email syntax according to RFC 5322 standard."
        }

    parts = email_clean.split("@")
    if len(parts) != 2:
        return {
            "email": email_clean,
            "status": "Invalid",
            "is_valid": False,
            "is_disposable": False,
            "is_role_based": False,
            "has_mx": False,
            "details": "Malformed email address structure."
        }

    local_part, domain = parts[0], parts[1]

    # Check for known fake TLDs or invalid dots
    if "." not in domain or domain.endswith(".fake") or domain.endswith(".invalid") or domain.endswith(".example"):
        return {
            "email": email_clean,
            "status": "Invalid",
            "is_valid": False,
            "is_disposable": False,
            "is_role_based": False,
            "has_mx": False,
            "details": f"Unresolvable domain or dummy TLD: '{domain}'."
        }

    # Disposable domain check
    is_disposable = domain in DISPOSABLE_DOMAINS
    if is_disposable:
        return {
            "email": email_clean,
            "status": "Invalid",
            "is_valid": False,
            "is_disposable": True,
            "is_role_based": False,
            "has_mx": False,
            "details": f"Disposable temporary email provider detected ({domain})."
        }

    # Role-based prefix check
    is_role_based = local_part in ROLE_BASED_PREFIXES

    # Check well-known providers first
    if domain in WELL_KNOWN_MAIL_DOMAINS:
        role_desc = " (Role-based address)" if is_role_based else ""
        return {
            "email": email_clean,
            "status": "Valid",
            "is_valid": True,
            "is_disposable": False,
            "is_role_based": is_role_based,
            "has_mx": True,
            "details": f"Valid syntax on authoritative mail exchange ({domain}){role_desc}."
        }

    # DNS MX Record resolution
    has_mx = False
    mx_record_info = ""

    if HAS_DNS:
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = 1.5
            resolver.lifetime = 1.5
            # Add public fallbacks
            resolver.nameservers = ['8.8.8.8', '1.1.1.1'] + resolver.nameservers
            records = resolver.resolve(domain, 'MX')
            if records and len(records) > 0:
                has_mx = True
                first_mx = str(records[0].exchange).rstrip('.')
                mx_record_info = f"MX found: {first_mx}"
        except Exception:
            # Fallback to system socket resolution
            try:
                socket.setdefaulttimeout(1.5)
                socket.gethostbyname(domain)
                has_mx = True
                mx_record_info = f"Host resolved: {domain}"
            except Exception:
                has_mx = False
    else:
        try:
            socket.setdefaulttimeout(1.5)
            socket.gethostbyname(domain)
            has_mx = True
            mx_record_info = f"Host resolved: {domain}"
        except Exception:
            has_mx = False

    if not has_mx:
        return {
            "email": email_clean,
            "status": "Invalid",
            "is_valid": False,
            "is_disposable": False,
            "is_role_based": is_role_based,
            "has_mx": False,
            "details": f"Domain '{domain}' has no valid MX records or host cannot be resolved."
        }

    role_desc = " (Role-based address)" if is_role_based else ""
    return {
        "email": email_clean,
        "status": "Valid",
        "is_valid": True,
        "is_disposable": False,
        "is_role_based": is_role_based,
        "has_mx": True,
        "details": f"Valid syntax and deliverable domain. {mx_record_info}{role_desc}."
    }
