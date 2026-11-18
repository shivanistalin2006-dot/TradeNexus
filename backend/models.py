from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any

class LeadBase(BaseModel):
    contact_person: str
    company_name: str
    email: str
    phone: Optional[str] = ""
    website: Optional[str] = ""
    country: str
    state: Optional[str] = ""
    city: Optional[str] = ""
    buyer_category: str
    product_interest: str
    lead_source: str = "Manual Entry"
    email_status: Optional[str] = "Not Checked"
    email_validation_details: Optional[str] = ""
    ai_classification: Optional[str] = "Pending"
    ai_reasoning: Optional[str] = ""
    notes: Optional[str] = ""
    is_demo: Optional[int] = 0

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    contact_person: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    buyer_category: Optional[str] = None
    product_interest: Optional[str] = None
    lead_source: Optional[str] = None
    email_status: Optional[str] = None
    email_validation_details: Optional[str] = None
    ai_classification: Optional[str] = None
    ai_reasoning: Optional[str] = None
    notes: Optional[str] = None
    is_demo: Optional[int] = None

class LeadOut(LeadBase):
    id: int
    created_at: str
    updated_at: str

class EmailValidationItem(BaseModel):
    lead_id: Optional[int] = None
    email: str

class BatchValidationRequest(BaseModel):
    lead_ids: Optional[List[int]] = None
    validate_all_unverified: Optional[bool] = False

class AIClassificationRequest(BaseModel):
    lead_ids: Optional[List[int]] = None
    classify_all_pending: Optional[bool] = False

class ManualClassificationUpdate(BaseModel):
    classification: str
    reasoning: Optional[str] = "Manually verified by user."

class DiscoveryQueryRequest(BaseModel):
    product_name: str
    target_country: str
    state: Optional[str] = ""
    city: Optional[str] = ""
    buyer_category: str

class DiscoverySaveLeadRequest(BaseModel):
    leads: List[LeadCreate]

class CampaignCreate(BaseModel):
    name: str
    subject: str
    body_template: str
    filter_country: Optional[str] = "All"
    filter_category: Optional[str] = "All"
    selected_lead_ids: Optional[List[int]] = None
    is_demo_mode: Optional[bool] = True
    attachment_name: Optional[str] = ""

class CampaignSendRequest(BaseModel):
    is_demo_mode: Optional[bool] = True
    delay_seconds: Optional[float] = 1.0

class TemplateCreate(BaseModel):
    name: str
    subject: str
    body: str
    category: Optional[str] = "General"

class SettingsModel(BaseModel):
    settings: Dict[str, str]
