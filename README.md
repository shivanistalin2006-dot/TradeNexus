# TradeNexus – Smart Global Buyer Discovery & Outreach

> **Design Theme:** Simple Olive Green (Minimal, Elegant, Business SaaS)  
> **Footer Credit:** Made with ❤️ by Shivani Stalin

**TradeNexus** is an enterprise-grade SaaS web application built specifically for Indian exporters, manufacturers, and trade houses to discover overseas B2B buyers, validate business email deliverability, qualify prospects using Google Gemini AI, and dispatch personalized, compliant marketing outreach campaigns with attached product catalogs.

---

## 🌿 Design Theme – Simple Olive Green

TradeNexus is crafted with a clean, minimal, premium olive-green visual identity:

| Element | Color Hex | Description |
| :--- | :--- | :--- |
| **Primary Olive** | `#606B3F` | Brand primary color, action buttons, active indicators |
| **Dark Olive** | `#424B2D` | Sidebar background, primary headings, emphasized states |
| **Soft Olive** | `#89936B` | Highlights, chart series, badge borders |
| **Light Background** | `#F7F8F3` | Main dashboard canvas background |
| **Card Background** | `#FFFFFF` | Elevated cards, tables, modal containers |
| **Borders** | `#E5E8DC` | Subtle dividers, card borders, and input strokes |
| **Main Text** | `#292D24` | Primary high-contrast readable typography |
| **Secondary Text** | `#777D70` | Subtle metadata, subtitles, labels |

---

## 🌟 Key Functional Modules

### 1. Executive Overview
- **Live Database-Driven Metrics:** Real-time counters for Total Buyers Discovered, Deliverable Valid Emails, Invalid/Bounced Mailboxes, Verified Commercial B2B Buyers, and Total Outreach Dispatches.
- **Olive-Green Visual Charts:**
  - Geographic Buyer Distribution by Country (Horizontal Bar Chart in Primary Olive `#606B3F`)
  - Email Health & Deliverability Breakdown (Donut Chart)
  - Buyer Category Segmentation (Pie Chart in Olive tones)
  - Channel Sourcing Origins (Bar Chart in Soft Olive `#89936B`)
  - Recent Discovered Buyers table with rapid drill-down
  - Campaign Activity Tracker with simulated open and delivery rates

### 2. Multi-Channel Buyer Discovery
- **Configurable Search Parameters:** Product Name (*Tibetan Singing Bowls, Brass Meditation Bells*), Target Country, State/Province, City, and Buyer Category (*Importers, Wholesalers, Retailers, Distributors, Wellness Businesses, Home Decor Stores*).
- **Direct 1-Click Platform Operators:** Pre-calibrated advanced Google Search Dorks, Google Maps queries, LinkedIn Company search links, ImportYeti US Customs Bills of Lading queries, Trade Show exhibitor directories (*Ambiente, Maison&Objet, ASD Market Week*), and ThomasNet/Europages registries.
- **Contextual Discovery Preview:** Generates realistic candidate buyer profiles tailored to the search parameters.
- **1-Click Selective Import:** Import any or all discovered leads into your local persistent SQLite leads database with duplicate prevention.

### 3. Comprehensive Lead Management (CRUD)
- **Detailed Trade Metadata:** Contact Person, Company Name, Email, Phone/WhatsApp, Website, Country, City/State, Buyer Category, Product Interest, Lead Source, Email Status, and AI Qualification.
- **Search & Multi-Dimensional Filtering:** Real-time text search across all attributes, plus dropdown filters by Country, Buyer Category, Email Status, AI Qualification, and Lead Source.
- **Column Sorting & Bulk Actions:** Sort by Company, Contact, Date, or Status; select all or multiple leads for batch deletion, bulk validation, or batch AI qualification.
- **CSV Data Exchange:**
  - **CSV Export:** Download all leads with full diagnostic records in standard CSV format (`/api/leads/export-csv`).
  - **CSV Import:** Upload external buyer lists (`sample_buyers.csv` included) with automated header mapping and duplicate email skipping.

### 4. Enterprise-Grade Email Validation Engine
- **RFC 5322 Syntax Verification:** Strict standard regex compliance for email local parts and domain syntax.
- **Disposable Domain Blocker:** Detects and flags temporary email providers (*Mailinator, TempMail, 10MinuteMail, GuerrillaMail, etc.*).
- **Authoritative DNS MX Record Lookup:** Resolves live mail exchange (MX) DNS records using `dnspython` with fallback socket verification.
- **Duplicate Prevention:** Identifies duplicate emails across records to safeguard sender reputation.
- **Single Email Inspector:** Test any international email address in real time with immediate DNS diagnostics.

### 5. AI Buyer Classification (Google Gemini + Fallback)
- **Gemini API Integration:** Uses Google Gemini (`gemini-2.5-flash`) via the `google-genai` SDK to synthesize company profiles, websites, and notes to categorize prospects into:
  - *Potential B2B Buyer*
  - *Importer*
  - *Wholesaler*
  - *Distributor*
  - *Retailer*
  - *Individual Customer*
  - *Irrelevant Lead*
- **Intelligent Rule-Based Fallback:** If a Gemini API key is not configured, a rule engine evaluates corporate legal designations (`GmbH`, `LLC`, `Corp`, `Srl`, `B.V.`), customs source metadata, email domain types, and industry keywords.
- **Manual Override:** Review detailed qualification reasoning and manually change any lead's category at any time.

### 6. Email Outreach Campaigns
- **Audience Segmentation:** Filter target leads by Country, Buyer Category, or dispatch to all deliverable leads.
- **Dynamic Variable Personalization:** Automatically interpolates `{{contact_person}}`, `{{company_name}}`, `{{country}}`, `{{city}}`, `{{buyer_category}}`, `{{product_interest}}`, `{{sender_company}}`, `{{sender_name}}`, and `{{sender_email}}`.
- **Live Side-by-Side Preview:** View the exact rendered email for any selected lead before sending.
- **Product Catalog Attachment:** Toggle attachment of `Singing_Bowls_Exporters_India_Catalog.pdf` (HS Code 9206.00, FOB/CIF terms, certified 7-metal acoustic alloy specs).
- **Demo Mode Simulation vs. Gmail OAuth 2.0:**
  - **Demo Mode:** Simulates realistic batch throttling delays, delivery timestamps, and open rates without dispatching real emails.
  - **Duplicate Prevention:** Guarantees no recipient receives duplicate outreach within the same campaign.
  - **CAN-SPAM / GDPR Compliance:** Standard one-click opt-out notice automatically embedded.

### 7. Reports & Analytics
- Complete interactive analytical dashboards with cross-filtering.
- Visual charts powered by Recharts (Geographic Market Distribution, Buyer Types, Deliverability Donut, Channel Origins).
- 1-Click CSV report download.

### 8. Settings & Data Management
- **API Keys & Integrations:** Configure and test Google Gemini API key with real-time feedback.
- **Exporter Profile:** Manage company name, export port, WhatsApp hotline, corporate email, and default export products.
- **Seed & Data Controls:**
  - One-click load of **18 realistic international sample buyers** across USA, Germany, UK, Canada, Australia, France, Japan, and UAE.
  - One-click removal of demo records.
  - Database reset / wipe option.

---

## 📁 Final Folder Structure

```
TradeNexus/
├── backend/
│   ├── data/
│   │   └── demo_data.py          # 18 rich realistic international buyer records
│   ├── services/
│   │   ├── validator.py          # Email syntax, disposable & DNS MX resolver
│   │   ├── classifier.py         # Gemini AI & rule-based classification engine
│   │   ├── discovery.py          # Search query generator & contextual discovery
│   │   └── campaign.py           # Email template renderer & send simulation
│   ├── static/
│   │   └── sample_product_presentation.pdf
│   ├── database.py               # SQLite schema, tables & seed logic
│   ├── models.py                 # Pydantic data schemas
│   ├── main.py                   # FastAPI REST API & SPA static router
│   ├── generate_catalog_pdf.py   # ReportLab catalog generator
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── dist/                     # Pre-compiled production distribution
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddEditLeadModal.jsx
│   │   │   ├── CsvImportModal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Sidebar.jsx       # With "Made with ❤️ by Shivani Stalin" credit
│   │   ├── pages/
│   │   │   ├── Overview.jsx      # Olive green theme dashboard
│   │   │   ├── Discovery.jsx
│   │   │   ├── LeadManagement.jsx
│   │   │   ├── EmailValidation.jsx
│   │   │   ├── AIClassification.jsx
│   │   │   ├── EmailCampaigns.jsx
│   │   │   ├── ReportsAnalytics.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Olive green custom utilities
│   ├── package.json
│   ├── tailwind.config.js        # Olive color tokens palette
│   └── vite.config.js
├── sample_buyers.csv             # Ready-to-import CSV test dataset
├── sample_product_presentation.pdf # Export catalog PDF
├── run_all.bat                   # 1-Click Windows unified launcher
├── start_backend.bat             # FastAPI backend Windows script
├── start_frontend.bat            # Vite frontend Windows script
├── test_suite.py                 # Automated unit and integration test suite
├── .env.example                  # Environment configuration template
└── README.md                     # Comprehensive documentation
```

---

## 🚀 Execution Instructions (Windows)

### Option 1: 1-Click Windows Launcher (Recommended)
Double-click `run_all.bat` or run in PowerShell:
```powershell
.\run_all.bat
```
This automatically launches both the FastAPI backend and Vite frontend, then opens your browser at **http://localhost:5173**.

### Option 2: Unified Full-Stack Run
Because the frontend is built into `frontend/dist`, running the backend serves the entire full-stack application on a single port:
```powershell
python backend/main.py
```
Open **http://127.0.0.1:8000** in your browser. (Swagger API docs at **http://127.0.0.1:8000/docs**).

### Option 3: Separate Terminal Run
**Backend:**
```powershell
.\start_backend.bat
# Runs on http://127.0.0.1:8000
```
**Frontend:**
```powershell
.\start_frontend.bat
# Runs on http://localhost:5173
```

---

## 🔑 Features Requiring External API Credentials

| Feature | External Service | Status Without API Key |
| :--- | :--- | :--- |
| **Buyer Classification** | Google Gemini API (`gemini-2.5-flash`) | **100% Functional:** The application seamlessly falls back to the built-in rule-based classification engine. Entering a Gemini API key in **Settings** upgrades it to live AI synthesis. |
| **Email Outreach Dispatch** | Google Gmail API (OAuth 2.0) | **100% Functional via Demo Mode:** The application safely simulates SMTP dispatch, throttling, and open tracking, logging all records in SQLite without dispatching unsolicited emails. Connect Gmail OAuth 2.0 in **Settings** for live inbox sending. |

---

## 💖 Footer Credit
**Made with ❤️ by Shivani Stalin** — Displayed proudly at the bottom of the TradeNexus sidebar.
