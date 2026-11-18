import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def create_catalog_pdf(output_path: str):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0F172A'),
        alignment=TA_CENTER
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#059669'),
        alignment=TA_CENTER
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    accent_box = ParagraphStyle(
        'AccentBox',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#0F766E')
    )

    elements = []

    # Header / Brand banner
    elements.append(Paragraph("VEDIC SOUND & CRAFTS INDIA PVT. LTD.", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Master Artisans & Direct Exporters of Acoustic Healing Instruments | New Delhi, India", subtitle_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#059669'), spaceBefore=2, spaceAfter=14))

    # Company & Catalog overview
    elements.append(Paragraph("2026/2027 EXPORT PRODUCT SPECIFICATION & B2B WHOLESALE CATALOG", h2_style))
    elements.append(Paragraph(
        "Established in 2008, Vedic Sound & Crafts is an ISO 9001:2015 certified manufacturer and recognized export house by the Ministry of Commerce & Industry, Government of India. We produce authentic hand-hammered singing bowls, bronze temple bells, tuning forks, and meditation accessories utilizing traditional 7-metal metallurgical formulations (Bell Bronze Cu-Sn, Gold, Silver, Iron, Lead, Mercury, Zinc traces).",
        body_style
    ))
    elements.append(Spacer(1, 12))

    # Key Export Advantages Table
    adv_data = [
        [Paragraph("<b>Key Feature</b>", body_style), Paragraph("<b>Specification / Quality Standard</b>", body_style), Paragraph("<b>Buyer Benefit</b>", body_style)],
        [Paragraph("Acoustic Certification", body_style), Paragraph("Precision tuned to 432 Hz / 528 Hz harmonic solfeggio scales", body_style), Paragraph("Zero pitch variance; high appeal to therapy studios", body_style)],
        [Paragraph("Metallurgical Purity", body_style), Paragraph("7-Metal bell bronze (Cu 78%, Sn 22% primary alloy)", body_style), Paragraph("Sustained resonance (>45 sec sustain time)", body_style)],
        [Paragraph("Custom Branding", body_style), Paragraph("Laser engraving of logo, silk pouches, gift boxes, barcodes", body_style), Paragraph("Ready for immediate shelf display / Amazon FBA", body_style)],
        [Paragraph("Export Logistics", body_style), Paragraph("FOB Delhi / JNPT Mumbai, CIF & DDP Door-to-Door available", body_style), Paragraph("Hassle-free customs clearance with full compliance docs", body_style)]
    ]

    t_adv = Table(adv_data, colWidths=[130, 240, 160])
    t_adv.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    elements.append(t_adv)
    elements.append(Spacer(1, 14))

    # Product Line Showcase Table
    elements.append(Paragraph("CORE EXPORT PRODUCT LINES & WHOLESALE PRICING (USD FOB)", h2_style))
    prod_data = [
        [Paragraph("<b>Item Code</b>", body_style), Paragraph("<b>Product Description</b>", body_style), Paragraph("<b>Size (Dia)</b>", body_style), Paragraph("<b>Weight</b>", body_style), Paragraph("<b>MOQ</b>", body_style), Paragraph("<b>FOB Unit ($)</b>", body_style)],
        [Paragraph("VS-TB-101", body_style), Paragraph("Hand-Hammered Antique Singing Bowl", body_style), Paragraph("5.0 - 5.5 inch", body_style), Paragraph("450 - 550g", body_style), Paragraph("25 pcs", body_style), Paragraph("$14.50", body_style)],
        [Paragraph("VS-TB-102", body_style), Paragraph("7-Chakra Tuned Singing Bowl Set (7 pcs)", body_style), Paragraph("4.5 - 9.0 inch", body_style), Paragraph("5.2 kg / set", body_style), Paragraph("5 sets", body_style), Paragraph("$118.00", body_style)],
        [Paragraph("VS-TB-103", body_style), Paragraph("Full Moon Certified Acoustic Healing Bowl", body_style), Paragraph("8.0 - 8.5 inch", body_style), Paragraph("1,200g", body_style), Paragraph("10 pcs", body_style), Paragraph("$38.00", body_style)],
        [Paragraph("VS-TB-104", body_style), Paragraph("Engraved Mantra Bronze Meditation Bowl", body_style), Paragraph("6.0 inch", body_style), Paragraph("700g", body_style), Paragraph("20 pcs", body_style), Paragraph("$19.50", body_style)],
        [Paragraph("VS-AC-201", body_style), Paragraph("Rosewood Suede Striker Mallet & Ring Cushion", body_style), Paragraph("Standard", body_style), Paragraph("120g", body_style), Paragraph("50 pcs", body_style), Paragraph("$2.20", body_style)]
    ]

    t_prod = Table(prod_data, colWidths=[70, 200, 80, 70, 50, 60])
    t_prod.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    elements.append(t_prod)
    elements.append(Spacer(1, 14))

    # Terms & Ordering Information
    elements.append(Paragraph("INTERNATIONAL TRADE & LOGISTICS TERMS", h2_style))
    terms_text = """
    <b>HS Code:</b> 9206.00.00 (Percussion Musical Instruments / Singing Bowls)<br/>
    <b>Port of Loading:</b> ICD Tughlakabad / Delhi Air Cargo / JNPT Mumbai, India<br/>
    <b>Standard Lead Time:</b> 12-18 days for orders under 500 pcs; 25 days for container loads<br/>
    <b>Payment Terms:</b> 30% advance deposit with order confirmation, 70% against Bill of Lading (B/L) copy or Irrevocable Letter of Credit (L/C at sight)<br/>
    <b>Sample Policy:</b> Free evaluation samples provided to verified commercial buyers (freight collect or pre-arranged account)
    """
    elements.append(Paragraph(terms_text, body_style))
    elements.append(Spacer(1, 10))

    # Contact & Sign-off footer
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#94A3B8'), spaceBefore=8, spaceAfter=8))
    contact_box = """
    <b>Export Contact:</b> Rajesh Sharma (Export Director) | <b>Direct Cell/WhatsApp:</b> +91 98112 34567<br/>
    <b>Corporate Email:</b> export@vedicsoundcrafts.com | <b>Website:</b> https://www.vedicsoundcrafts.com<br/>
    <b>Registered Office:</b> B-42, Okhla Industrial Area Phase-II, New Delhi 110020, India
    """
    elements.append(Paragraph(contact_box, accent_box))

    doc.build(elements)
    print(f"Catalog PDF created successfully at: {output_path}")

if __name__ == "__main__":
    target_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_product_presentation.pdf")
    static_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "sample_product_presentation.pdf")
    create_catalog_pdf(target_path)
    create_catalog_pdf(static_path)
