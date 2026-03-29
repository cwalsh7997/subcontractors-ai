#!/usr/bin/env python3
"""
Generate professional PDF templates for Subcontractors.ai
Creates 8 construction industry document templates for lien waivers and payment applications
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, grey
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime
import os

# Create templates directory
output_dir = "/tmp/subcontractors-ai/templates"
os.makedirs(output_dir, exist_ok=True)

# Color scheme for Subcontractors.ai branding
PRIMARY_COLOR = HexColor("#0066CC")
SECONDARY_COLOR = HexColor("#333333")
ACCENT_COLOR = HexColor("#F0F0F0")
TEXT_COLOR = HexColor("#1A1A1A")

def create_header(canvas_obj, width, title, subtitle=None):
    """Create professional header with branding"""
    canvas_obj.setFont("Helvetica-Bold", 16)
    canvas_obj.setFillColor(PRIMARY_COLOR)
    canvas_obj.drawString(0.5*inch, height - 0.5*inch, "Subcontractors.ai")

    canvas_obj.setFont("Helvetica-Bold", 14)
    canvas_obj.setFillColor(TEXT_COLOR)
    canvas_obj.drawString(0.5*inch, height - 0.9*inch, title)

    if subtitle:
        canvas_obj.setFont("Helvetica", 10)
        canvas_obj.setFillColor(SECONDARY_COLOR)
        canvas_obj.drawString(0.5*inch, height - 1.2*inch, subtitle)

    # Horizontal line
    canvas_obj.setLineWidth(1.5)
    canvas_obj.setStrokeColor(PRIMARY_COLOR)
    canvas_obj.line(0.5*inch, height - 1.35*inch, width - 0.5*inch, height - 1.35*inch)

def create_footer(canvas_obj, width, height):
    """Create footer with branding and download info"""
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(grey)
    footer_text = "Downloaded from Subcontractors.ai — Free Construction Templates"
    canvas_obj.drawString(0.5*inch, 0.4*inch, footer_text)

    # Page separator line
    canvas_obj.setLineWidth(0.5)
    canvas_obj.setStrokeColor(HexColor("#CCCCCC"))
    canvas_obj.line(0.5*inch, 0.55*inch, width - 0.5*inch, 0.55*inch)

def create_form_field(canvas_obj, x, y, width=2*inch, label="", label_width=1.5*inch):
    """Create a form field with label"""
    if label:
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.setFillColor(TEXT_COLOR)
        canvas_obj.drawString(x, y + 0.15*inch, label)
        x += label_width

    # Draw box for form field
    canvas_obj.setLineWidth(0.5)
    canvas_obj.setStrokeColor(TEXT_COLOR)
    canvas_obj.rect(x, y, width, 0.25*inch, fill=0)

def create_signature_block(canvas_obj, x, y, title=""):
    """Create a signature block with line and title"""
    # Signature line
    canvas_obj.setLineWidth(1)
    canvas_obj.setStrokeColor(TEXT_COLOR)
    canvas_obj.line(x, y, x + 2*inch, y)

    # Signature label
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.drawString(x, y - 0.2*inch, "Signature")

    if title:
        canvas_obj.drawString(x, y - 0.35*inch, title)

# ============================================================================
# 1. CONDITIONAL PROGRESS LIEN WAIVER
# ============================================================================
def create_conditional_progress_lien_waiver():
    filename = os.path.join(output_dir, "conditional-progress-lien-waiver.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           topMargin=1.5*inch, bottomMargin=0.75*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)

    story = []
    width, height = letter

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=TEXT_COLOR,
        spaceAfter=8,
        leading=12
    )

    story.append(Paragraph("CONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT", title_style))
    story.append(Spacer(1, 0.15*inch))

    # Form content
    form_data = [
        ["Project Name:", "_" * 60],
        ["", ""],
        ["Owner Name:", "_" * 60],
        ["", ""],
        ["General Contractor:", "_" * 60],
        ["", ""],
        ["Subcontractor/Supplier:", "_" * 60],
        ["", ""],
    ]

    form_table = Table(form_data, colWidths=[1.5*inch, 4*inch])
    form_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(form_table)
    story.append(Spacer(1, 0.2*inch))

    # Period covered
    story.append(Paragraph("<b>Period Covered:</b> From __________ To __________", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Amount information
    amount_data = [
        ["Total Contract Price:", "$_________________"],
        ["Previous Payments Received:", "$_________________"],
        ["Progress Payment This Period:", "$_________________"],
        ["Total Due to Date:", "$_________________"],
        ["Payment Received This Date:", "$_________________"],
    ]

    amount_table = Table(amount_data, colWidths=[2.5*inch, 3*inch])
    amount_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    story.append(amount_table)
    story.append(Spacer(1, 0.2*inch))

    # Legal language
    legal_text = """
    <b>WAIVER AND RELEASE:</b><br/>
    The undersigned, having been paid in full for all labor, materials, equipment, and services provided to the above project through the date herein, hereby waives and releases any and all claims, liens, and rights to lien against the property and bond for all labor, materials, equipment, and services furnished to the date of this Waiver and Release.<br/>
    <br/>
    <b>CONDITIONAL:</b> This waiver is conditioned upon receipt of the payment stated above and shall become effective only upon deposit of said check. If such check is not paid upon presentation, this waiver is null and void and the party executing this waiver shall retain all rights hereunder.
    """

    story.append(Paragraph(legal_text, body_style))
    story.append(Spacer(1, 0.2*inch))

    # Signature blocks
    sig_data = [
        ["Company Name: _____________________", "Date: ______________"],
        ["", ""],
        ["Signature: _________________________", ""],
        ["", ""],
        ["Print Name: ________________________", ""],
        ["", ""],
        ["Title: ______________________________", ""],
    ]

    sig_table = Table(sig_data, colWidths=[3.25*inch, 2.25*inch])
    sig_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    story.append(sig_table)

    doc.build(story, onFirstPage=lambda c, d: add_footer(c, letter),
              onLaterPages=lambda c, d: add_footer(c, letter))
    print(f"Created: {filename}")

# ============================================================================
# 2. UNCONDITIONAL PROGRESS LIEN WAIVER
# ============================================================================
def create_unconditional_progress_lien_waiver():
    filename = os.path.join(output_dir, "unconditional-progress-lien-waiver.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           topMargin=1.5*inch, bottomMargin=0.75*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)

    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=TEXT_COLOR,
        spaceAfter=8,
        leading=12
    )

    story.append(Paragraph("UNCONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT", title_style))
    story.append(Spacer(1, 0.15*inch))

    # Form fields
    form_data = [
        ["Project Name:", "_" * 60],
        ["Owner Name:", "_" * 60],
        ["General Contractor:", "_" * 60],
        ["Subcontractor/Supplier:", "_" * 60],
    ]

    form_table = Table(form_data, colWidths=[1.5*inch, 4*inch])
    form_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(form_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Period Covered:</b> From __________ To __________", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Amount table
    amount_data = [
        ["Total Contract Price:", "$_________________"],
        ["Previous Payments Received:", "$_________________"],
        ["Progress Payment This Period:", "$_________________"],
        ["Payment Received This Date:", "$_________________"],
    ]

    amount_table = Table(amount_data, colWidths=[2.5*inch, 3*inch])
    amount_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    story.append(amount_table)
    story.append(Spacer(1, 0.2*inch))

    # Legal language
    legal_text = """
    <b>WAIVER AND RELEASE:</b><br/>
    The undersigned, having been paid for all labor, materials, equipment, and services provided to the above project through the date herein, hereby waives and releases any and all claims, liens, and rights to lien against the property and bond for all labor, materials, equipment, and services furnished to the date of this Waiver and Release.<br/>
    <br/>
    <b>UNCONDITIONAL:</b> This waiver becomes effective immediately upon execution and is not conditioned upon receipt of payment. The undersigned relinquishes all lien rights regardless of payment status.
    """

    story.append(Paragraph(legal_text, body_style))
    story.append(Spacer(1, 0.2*inch))

    # Signature blocks
    sig_data = [
        ["Company Name: _____________________", "Date: ______________"],
        ["Signature: _________________________", ""],
        ["Print Name: ________________________", ""],
        ["Title: ______________________________", ""],
    ]

    sig_table = Table(sig_data, colWidths=[3.25*inch, 2.25*inch])
    sig_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    story.append(sig_table)

    doc.build(story, onFirstPage=lambda c, d: add_footer(c, letter),
              onLaterPages=lambda c, d: add_footer(c, letter))
    print(f"Created: {filename}")

# ============================================================================
# 3. CONDITIONAL FINAL LIEN WAIVER
# ============================================================================
def create_conditional_final_lien_waiver():
    filename = os.path.join(output_dir, "conditional-final-lien-waiver.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           topMargin=1.5*inch, bottomMargin=0.75*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)

    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=TEXT_COLOR,
        spaceAfter=8,
        leading=12
    )

    story.append(Paragraph("CONDITIONAL WAIVER AND RELEASE ON FINAL PAYMENT", title_style))
    story.append(Spacer(1, 0.15*inch))

    # Form fields
    form_data = [
        ["Project Name:", "_" * 60],
        ["Project Location:", "_" * 60],
        ["Owner Name:", "_" * 60],
        ["General Contractor:", "_" * 60],
        ["Subcontractor/Supplier:", "_" * 60],
    ]

    form_table = Table(form_data, colWidths=[1.5*inch, 4*inch])
    form_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(form_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Project Completion Date:</b> ______________", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Amount table
    amount_data = [
        ["Total Contract Price:", "$_________________"],
        ["Total Previous Payments:", "$_________________"],
        ["Final Payment Due:", "$_________________"],
    ]

    amount_table = Table(amount_data, colWidths=[2.5*inch, 3*inch])
    amount_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    story.append(amount_table)
    story.append(Spacer(1, 0.2*inch))

    # Legal language
    legal_text = """
    <b>WAIVER AND RELEASE:</b><br/>
    The undersigned, having been paid in full for all labor, materials, equipment, and services provided to the above project, hereby waives and releases any and all claims, liens, and rights to lien against the property and bond for all work performed and materials supplied for the project.<br/>
    <br/>
    <b>CONDITIONAL:</b> This waiver is conditioned upon receipt of the final payment stated above and shall become effective only upon deposit of said check. All lien rights are retained until payment is received.
    """

    story.append(Paragraph(legal_text, body_style))
    story.append(Spacer(1, 0.2*inch))

    # Signature blocks
    sig_data = [
        ["Company Name: _____________________", "Date: ______________"],
        ["Signature: _________________________", ""],
        ["Print Name: ________________________", ""],
        ["Title: ______________________________", ""],
    ]

    sig_table = Table(sig_data, colWidths=[3.25*inch, 2.25*inch])
    sig_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    story.append(sig_table)

    doc.build(story, onFirstPage=lambda c, d: add_footer(c, letter),
              onLaterPages=lambda c, d: add_footer(c, letter))
    print(f"Created: {filename}")

# ============================================================================
# 4. UNCONDITIONAL FINAL LIEN WAIVER
# ============================================================================
def create_unconditional_final_lien_waiver():
    filename = os.path.join(output_dir, "unconditional-final-lien-waiver.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           topMargin=1.5*inch, bottomMargin=0.75*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)

    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=TEXT_COLOR,
        spaceAfter=8,
        leading=12
    )

    story.append(Paragraph("UNCONDITIONAL WAIVER AND RELEASE ON FINAL PAYMENT", title_style))
    story.append(Spacer(1, 0.15*inch))

    # Form fields
    form_data = [
        ["Project Name:", "_" * 60],
        ["Project Location:", "_" * 60],
        ["Owner Name:", "_" * 60],
        ["General Contractor:", "_" * 60],
        ["Subcontractor/Supplier:", "_" * 60],
    ]

    form_table = Table(form_data, colWidths=[1.5*inch, 4*inch])
    form_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(form_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Project Completion Date:</b> ______________", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Amount table
    amount_data = [
        ["Total Contract Price:", "$_________________"],
        ["Total Previous Payments:", "$_________________"],
        ["Final Payment Due:", "$_________________"],
    ]

    amount_table = Table(amount_data, colWidths=[2.5*inch, 3*inch])
    amount_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    story.append(amount_table)
    story.append(Spacer(1, 0.2*inch))

    # Legal language
    legal_text = """
    <b>WAIVER AND RELEASE:</b><br/>
    The undersigned, in exchange for consideration received, hereby waives and releases any and all claims, liens, and rights to lien against the property and bond for all labor, materials, equipment, and services furnished to the project.<br/>
    <br/>
    <b>UNCONDITIONAL:</b> This waiver becomes effective immediately upon execution. All lien rights are unconditionally released regardless of payment status. Signatory acknowledges waiving all rights to file a mechanics lien on the project property.
    """

    story.append(Paragraph(legal_text, body_style))
    story.append(Spacer(1, 0.2*inch))

    # Signature blocks
    sig_data = [
        ["Company Name: _____________________", "Date: ______________"],
        ["Signature: _________________________", ""],
        ["Print Name: ________________________", ""],
        ["Title: ______________________________", ""],
    ]

    sig_table = Table(sig_data, colWidths=[3.25*inch, 2.25*inch])
    sig_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    story.append(sig_table)

    doc.build(story, onFirstPage=lambda c, d: add_footer(c, letter),
              onLaterPages=lambda c, d: add_footer(c, letter))
    print(f"Created: {filename}")

# ============================================================================
# 5. AIA G702 PAYMENT APPLICATION
# ============================================================================
def create_aia_g702_payment_application():
    filename = os.path.join(output_dir, "aia-g702-payment-application.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           topMargin=1.5*inch, bottomMargin=0.75*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)

    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=13,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=9,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        leading=11
    )

    story.append(Paragraph("AIA G702 - APPLICATION AND CERTIFICATE FOR PAYMENT", title_style))
    story.append(Spacer(1, 0.1*inch))

    # Project Information
    project_data = [
        ["Project Name: ___________________________", "Project Number: _______________"],
        ["Project Address: _________________________", "Contract Date: _________________"],
        ["Contractor: ______________________________", "Architect: ______________________"],
    ]

    project_table = Table(project_data, colWidths=[3.25*inch, 2.25*inch])
    project_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    story.append(project_table)
    story.append(Spacer(1, 0.15*inch))

    # Payment period
    period_text = "<b>Payment Application No.:</b> ________  <b>Period From:</b> __________ <b>To:</b> __________"
    story.append(Paragraph(period_text, body_style))
    story.append(Spacer(1, 0.1*inch))

    # Summary of Contract
    story.append(Paragraph("<b>SUMMARY OF CONTRACT</b>", body_style))

    contract_data = [
        ["Description", "Amount"],
        ["Original Contract Sum", "$_________________"],
        ["Net Change by Change Orders", "$_________________"],
        ["Current Contract Sum", "$_________________"],
        ["Total Completed & Stored to Date", "$_________________"],
        ["Retainage (____%)", "$_________________"],
        ["Total Earned Less Retainage", "$_________________"],
        ["Less: Previous Payments", "$_________________"],
        ["Balance Due This Period", "$_________________"],
    ]

    contract_table = Table(contract_data, colWidths=[4*inch, 1.5*inch])
    contract_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 9),
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#CCCCCC')),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(contract_table)
    story.append(Spacer(1, 0.15*inch))

    # Certification
    cert_text = """
    <b>CERTIFICATION:</b> The Contractor certifies that all work has been completed in accordance with the Contract Documents; all materials, equipment and labor have been provided; and that the total of all previous payments received, plus the payment requested in this Application, equals the sum to which the Contractor is entitled.
    """
    story.append(Paragraph(cert_text, body_style))
    story.append(Spacer(1, 0.15*inch))

    # Signatures
    sig_data = [
        ["By: _____________________________", "Date: ______________"],
        ["Contractor", ""],
        ["", ""],
        ["By: _____________________________", "Date: ______________"],
        ["Architect/Engineer", ""],
    ]

    sig_table = Table(sig_data, colWidths=[3.25*inch, 2.25*inch])
    sig_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))

    story.append(sig_table)

    doc.build(story, onFirstPage=lambda c, d: add_footer(c, letter),
              onLaterPages=lambda c, d: add_footer(c, letter))
    print(f"Created: {filename}")

# ============================================================================
# 6. AIA G703 CONTINUATION SHEET
# ============================================================================
def create_aia_g703_continuation_sheet():
    filename = os.path.join(output_dir, "continuation-sheet-g703.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           topMargin=1.5*inch, bottomMargin=0.75*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)

    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=13,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=9,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        leading=11
    )

    story.append(Paragraph("AIA G703 - CONTINUATION SHEET / SCHEDULE OF VALUES", title_style))
    story.append(Spacer(1, 0.1*inch))

    # Header info
    header_text = "<b>Project:</b> _____________________________ <b>Application No.:</b> ________"
    story.append(Paragraph(header_text, body_style))
    story.append(Spacer(1, 0.1*inch))

    # Schedule of Values
    story.append(Paragraph("<b>SCHEDULE OF VALUES</b>", body_style))
    story.append(Spacer(1, 0.05*inch))

    sov_data = [
        ["Line Item Description", "Scheduled Value", "Work Completed", "Stored Materials", "Total Earned"],
        ["", "$_________", "$_________", "$_________", "$_________"],
        ["", "$_________", "$_________", "$_________", "$_________"],
        ["", "$_________", "$_________", "$_________", "$_________"],
        ["", "$_________", "$_________", "$_________", "$_________"],
        ["", "$_________", "$_________", "$_________", "$_________"],
        ["TOTAL", "$_________", "$_________", "$_________", "$_________"],
    ]

    sov_table = Table(sov_data, colWidths=[2*inch, 1*inch, 1*inch, 1*inch, 1.25*inch])
    sov_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 8),
        ('FONT', (0, 1), (-1, -1), 'Helvetica', 9),
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#CCCCCC')),
        ('BACKGROUND', (0, -1), (-1, -1), HexColor('#E0E0E0')),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))

    story.append(sov_table)
    story.append(Spacer(1, 0.15*inch))

    # Summary
    summary_data = [
        ["Total Scheduled Value", "$_________________"],
        ["Less: Retainage (____%)", "$_________________"],
        ["Total Earned Less Retainage", "$_________________"],
    ]

    summary_table = Table(summary_data, colWidths=[3*inch, 2.5*inch])
    summary_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 9),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(summary_table)
    story.append(Spacer(1, 0.15*inch))

    # Notes
    notes_text = "<b>Notes / Comments:</b> __________________________________________________________________"
    story.append(Paragraph(notes_text, body_style))

    doc.build(story, onFirstPage=lambda c, d: add_footer(c, letter),
              onLaterPages=lambda c, d: add_footer(c, letter))
    print(f"Created: {filename}")

# ============================================================================
# 7. CHANGE ORDER REQUEST
# ============================================================================
def create_change_order_request():
    filename = os.path.join(output_dir, "change-order-request.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           topMargin=1.5*inch, bottomMargin=0.75*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)

    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        leading=12
    )

    story.append(Paragraph("CHANGE ORDER REQUEST", title_style))
    story.append(Spacer(1, 0.15*inch))

    # Project Information
    project_data = [
        ["Project Name: _____________________________", "Change Order No.: __________"],
        ["Project Address: ___________________________", "Date: _____________________"],
        ["Owner: _____________________________________", "Prepared By: _______________"],
    ]

    project_table = Table(project_data, colWidths=[3.25*inch, 2.25*inch])
    project_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))

    story.append(project_table)
    story.append(Spacer(1, 0.15*inch))

    # Description
    story.append(Paragraph("<b>DESCRIPTION OF CHANGE:</b>", body_style))
    story.append(Spacer(1, 0.05*inch))
    story.append(Paragraph("________________________________________________________________<br/>________________________________________________________________<br/>________________________________________________________________", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Cost breakdown
    story.append(Paragraph("<b>COST BREAKDOWN:</b>", body_style))

    cost_data = [
        ["Item Description", "Unit Cost", "Quantity", "Total Cost"],
        ["", "$_________", "_____", "$_________"],
        ["", "$_________", "_____", "$_________"],
        ["", "$_________", "_____", "$_________"],
        ["Labor", "$_________", "", ""],
        ["Materials", "$_________", "", ""],
        ["Equipment", "$_________", "", ""],
        ["Subtotal", "", "", "$_________"],
        ["Tax (____%)", "", "", "$_________"],
        ["TOTAL CHANGE ORDER AMOUNT", "", "", "$_________"],
    ]

    cost_table = Table(cost_data, colWidths=[2*inch, 1*inch, 1*inch, 1.5*inch])
    cost_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 9),
        ('FONT', (0, -3), (-1, -1), 'Helvetica-Bold', 10),
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#CCCCCC')),
        ('BACKGROUND', (0, -1), (-1, -1), HexColor('#FFE6E6')),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(cost_table)
    story.append(Spacer(1, 0.15*inch))

    # Schedule impact
    schedule_text = "<b>Schedule Impact:</b> ☐ No change    ☐ Accelerates _____ days    ☐ Delays _____ days"
    story.append(Paragraph(schedule_text, body_style))
    story.append(Spacer(1, 0.15*inch))

    # Signatures
    sig_data = [
        ["Submitted By: ________________________", "Date: ______________"],
        ["", ""],
        ["Accepted By: ___________________________", "Date: ______________"],
        ["General Contractor", ""],
        ["", ""],
        ["Approved By: ____________________________", "Date: ______________"],
        ["Owner", ""],
    ]

    sig_table = Table(sig_data, colWidths=[3.25*inch, 2.25*inch])
    sig_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))

    story.append(sig_table)

    doc.build(story, onFirstPage=lambda c, d: add_footer(c, letter),
              onLaterPages=lambda c, d: add_footer(c, letter))
    print(f"Created: {filename}")

# ============================================================================
# 8. MONTHLY BILLING SUMMARY
# ============================================================================
def create_monthly_billing_summary():
    filename = os.path.join(output_dir, "monthly-billing-summary.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           topMargin=1.5*inch, bottomMargin=0.75*inch,
                           leftMargin=0.5*inch, rightMargin=0.5*inch)

    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=TEXT_COLOR,
        spaceAfter=6,
        leading=12
    )

    story.append(Paragraph("MONTHLY BILLING SUMMARY", title_style))
    story.append(Spacer(1, 0.15*inch))

    # Header info
    header_data = [
        ["Company: _____________________________", "Month: _____________________"],
        ["Project: ______________________________", "Billing Period: From _______ To _______"],
    ]

    header_table = Table(header_data, colWidths=[3.25*inch, 2.25*inch])
    header_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))

    story.append(header_table)
    story.append(Spacer(1, 0.15*inch))

    # Billing Details
    story.append(Paragraph("<b>BILLING ACTIVITY SUMMARY</b>", body_style))

    bill_data = [
        ["Date", "Invoice No.", "Description", "Amount"],
        ["____/____ ", "________", "___________________________", "$_________"],
        ["____/____ ", "________", "___________________________", "$_________"],
        ["____/____ ", "________", "___________________________", "$_________"],
        ["____/____ ", "________", "___________________________", "$_________"],
        ["____/____ ", "________", "___________________________", "$_________"],
        ["____/____ ", "________", "___________________________", "$_________"],
    ]

    bill_table = Table(bill_data, colWidths=[1*inch, 1.2*inch, 2.5*inch, 1.3*inch])
    bill_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 9),
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#CCCCCC')),
        ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
        ('ALIGN', (0, 0), (1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(bill_table)
    story.append(Spacer(1, 0.15*inch))

    # Summary totals
    summary_data = [
        ["", "Amount"],
        ["Total Invoiced This Month", "$_________________"],
        ["Total Payments Received", "$_________________"],
        ["Accounts Receivable Outstanding", "$_________________"],
        ["Retainage Held", "$_________________"],
    ]

    summary_table = Table(summary_data, colWidths=[4*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#CCCCCC')),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    story.append(summary_table)
    story.append(Spacer(1, 0.15*inch))

    # Notes
    story.append(Paragraph("<b>Notes / Aging:</b>", body_style))
    story.append(Paragraph("________________________________________________________________<br/>________________________________________________________________", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Signature
    sig_text = "<b>Prepared By:</b> _________________________ <b>Date:</b> ______________"
    story.append(Paragraph(sig_text, body_style))

    doc.build(story, onFirstPage=lambda c, d: add_footer(c, letter),
              onLaterPages=lambda c, d: add_footer(c, letter))
    print(f"Created: {filename}")

# ============================================================================
# Helper function for footer
# ============================================================================
def add_footer(canvas_obj, page_size):
    """Add footer to PDF pages"""
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(grey)
    footer_text = "Downloaded from Subcontractors.ai — Free Construction Templates"
    canvas_obj.drawString(0.5*inch, 0.4*inch, footer_text)

    # Page separator line
    canvas_obj.setLineWidth(0.5)
    canvas_obj.setStrokeColor(HexColor("#CCCCCC"))
    canvas_obj.line(0.5*inch, 0.55*inch, page_size[0] - 0.5*inch, 0.55*inch)

# ============================================================================
# MAIN EXECUTION
# ============================================================================
if __name__ == "__main__":
    print("Generating Subcontractors.ai PDF Templates...")
    print("=" * 60)

    # Create all templates
    create_conditional_progress_lien_waiver()
    create_unconditional_progress_lien_waiver()
    create_conditional_final_lien_waiver()
    create_unconditional_final_lien_waiver()
    create_aia_g702_payment_application()
    create_aia_g703_continuation_sheet()
    create_change_order_request()
    create_monthly_billing_summary()

    print("=" * 60)
    print(f"Successfully created all 8 templates in {output_dir}/")
    print("\nTemplate files created:")
    print("  Lien Waivers:")
    print("    1. conditional-progress-lien-waiver.pdf")
    print("    2. unconditional-progress-lien-waiver.pdf")
    print("    3. conditional-final-lien-waiver.pdf")
    print("    4. unconditional-final-lien-waiver.pdf")
    print("  Payment Applications:")
    print("    5. aia-g702-payment-application.pdf")
    print("    6. continuation-sheet-g703.pdf")
    print("    7. change-order-request.pdf")
    print("    8. monthly-billing-summary.pdf")
