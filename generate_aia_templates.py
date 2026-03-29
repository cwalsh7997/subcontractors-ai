#!/usr/bin/env python3
"""
Generate professional AIA construction form templates as PDF documents.
Creates all 8 standard construction industry forms used for subcontractor management.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, black, white, lightgrey
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from datetime import datetime
import os

# Constants
FOOTER_TEXT = "Downloaded from Subcontractors.ai | Free Construction Templates | Not for resale"
OUTPUT_DIR = "/tmp/subcontractors-ai/templates/"

def create_page_template(c, doc):
    """Add footer to every page."""
    c.setFont("Helvetica", 7)
    c.drawString(0.5 * inch, 0.3 * inch, FOOTER_TEXT)

def generate_g702_payment_application():
    """Generate AIA G702 - Application and Certificate for Payment"""
    filepath = os.path.join(OUTPUT_DIR, "aia-g702-payment-application.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter,
                           leftMargin=0.5*inch, rightMargin=0.5*inch,
                           topMargin=0.5*inch, bottomMargin=0.5*inch)

    c = canvas.Canvas(filepath, pagesize=letter)

    # Header
    c.setFillColor(HexColor("#1a1a1a"))
    c.rect(0.5*inch, 10*inch, 7.5*inch, 0.4*inch, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(0.7*inch, 10.15*inch, "APPLICATION AND CERTIFICATE FOR PAYMENT")
    c.setFont("Helvetica", 8)
    c.drawRightString(7.7*inch, 10.15*inch, "AIA DOCUMENT G702")

    # Reset to black for content
    c.setFillColor(black)

    # Top section fields
    y = 9.7
    line_height = 0.25

    c.setFont("Helvetica", 8)
    c.drawString(0.7*inch, y*inch, "TO (Owner):")
    c.line(1.8*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "FROM (Contractor):")
    c.line(5.4*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "PROJECT:")
    c.line(1.3*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "APPLICATION NO.:")
    c.line(5.2*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "PROJECT ADDRESS:")
    c.line(1.5*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "PERIOD TO:")
    c.line(5.0*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "ARCHITECT:")
    c.line(1.4*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "CONTRACT DATE:")
    c.line(5.2*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    # Payment application table
    y -= 0.6
    table_y_start = y

    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "CONTRACTOR'S APPLICATION FOR PAYMENT")

    y -= 0.3

    # Draw payment table
    payment_items = [
        "1. ORIGINAL CONTRACT SUM",
        "2. Net change by Change Orders",
        "3. CONTRACT SUM TO DATE (1+2)",
        "4. TOTAL COMPLETED & STORED TO DATE",
        "5. RETAINAGE:",
        "    a. ___% of Completed Work",
        "    b. ___% of Stored Material",
        "6. TOTAL EARNED LESS RETAINAGE (4-5)",
        "7. LESS PREVIOUS CERTIFICATES FOR PAYMENT",
        "8. CURRENT PAYMENT DUE (6-7)",
        "9. BALANCE TO FINISH (3-6)"
    ]

    c.setFont("Helvetica", 7)
    for item in payment_items:
        c.drawString(1.0*inch, y*inch, item)
        c.line(4.5*inch, (y-0.12)*inch, 7.0*inch, (y-0.12)*inch)
        y -= 0.25

    # Signature section
    y -= 0.3
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "CONTRACTOR CERTIFICATION")
    y -= 0.2
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "I certify that the above data is correct.")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Contractor Signature: ___________________________  Date: __________")

    y -= 0.35
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "ARCHITECT'S CERTIFICATION")
    y -= 0.2
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "Based on on-site observations and the data above, the Architect certifies to the Owner")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "that work has progressed as indicated and payment is due as shown.")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Architect Signature: ___________________________  Date: __________")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "Amount Certified: $ _______________________________")

    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, 0.3*inch, FOOTER_TEXT)

    c.save()
    return filepath

def generate_g703_continuation_sheet():
    """Generate AIA G703 - Continuation Sheet"""
    filepath = os.path.join(OUTPUT_DIR, "continuation-sheet-g703.pdf")

    c = canvas.Canvas(filepath, pagesize=letter)

    # Header
    c.setFillColor(HexColor("#1a1a1a"))
    c.rect(0.5*inch, 10*inch, 7.5*inch, 0.4*inch, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(0.7*inch, 10.15*inch, "CONTINUATION SHEET")
    c.setFont("Helvetica", 8)
    c.drawRightString(7.7*inch, 10.15*inch, "AIA DOCUMENT G703")

    c.setFillColor(black)

    # Reference fields
    y = 9.7
    c.setFont("Helvetica", 8)
    c.drawString(0.7*inch, y*inch, "APPLICATION NO.:")
    c.line(1.5*inch, (y-0.15)*inch, 3*inch, (y-0.15)*inch)
    c.drawString(3.5*inch, y*inch, "APPLICATION DATE:")
    c.line(4.5*inch, (y-0.15)*inch, 6*inch, (y-0.15)*inch)
    c.drawString(6.2*inch, y*inch, "PERIOD TO:")
    c.line(7.0*inch, (y-0.15)*inch, 7.8*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "ARCHITECT'S PROJECT NO.:")
    c.line(1.7*inch, (y-0.15)*inch, 3*inch, (y-0.15)*inch)

    # Table header
    y -= 0.5
    c.setFont("Helvetica-Bold", 7)

    col_x = [0.7, 1.2, 2.5, 3.8, 4.8, 5.8, 6.5, 6.95, 7.5, 7.8]
    col_labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    col_descriptions = ["ITEM", "DESCRIPTION", "SCHEDULED\nVALUE", "PREV\nCOMPL.", "THIS\nPERIOD", "MATERIALS\nSTORED", "TOTAL\nCOMPL.", "%", "BALANCE", "RETAINAGE"]

    for i, (x, label, desc) in enumerate(zip(col_x, col_labels, col_descriptions)):
        c.setFont("Helvetica-Bold", 6)
        c.drawString(x*inch, y*inch, label)
        c.setFont("Helvetica", 6)
        c.drawString(x*inch, (y-0.15)*inch, desc)

    # Draw table grid
    c.setLineWidth(0.5)

    # Header line
    c.line(0.7*inch, (y-0.35)*inch, 7.8*inch, (y-0.35)*inch)

    # Line items (15 rows)
    row_height = 0.25
    y -= 0.4
    for i in range(15):
        c.drawString(0.75*inch, y*inch, str(i+1))
        y -= row_height
        c.line(0.7*inch, y*inch, 7.8*inch, y*inch)

    # Totals row
    c.setFont("Helvetica-Bold", 7)
    c.drawString(0.75*inch, y*inch, "TOTALS")
    y -= row_height
    c.line(0.7*inch, y*inch, 7.8*inch, y*inch)

    # Vertical lines for columns
    for x in col_x[1:]:
        c.line(x*inch, (y+15*row_height+0.4)*inch, x*inch, y*inch)

    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, 0.3*inch, FOOTER_TEXT)

    c.save()
    return filepath

def generate_conditional_progress_waiver():
    """Generate Conditional Waiver on Progress Payment"""
    filepath = os.path.join(OUTPUT_DIR, "conditional-progress-lien-waiver.pdf")

    c = canvas.Canvas(filepath, pagesize=letter)

    # Header
    c.setFillColor(HexColor("#1a1a1a"))
    c.rect(0.5*inch, 10*inch, 7.5*inch, 0.4*inch, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.7*inch, 10.15*inch, "CONDITIONAL WAIVER AND RELEASE")
    c.drawString(0.7*inch, 9.9*inch, "ON PROGRESS PAYMENT")

    c.setFillColor(HexColor("#ffff00"))
    c.rect(0.7*inch, 9.4*inch, 7.1*inch, 0.4*inch, fill=1)

    c.setFillColor(black)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(0.75*inch, 9.55*inch, "NOTICE: This document waives the claimant's lien, stop payment notice, and")
    c.drawString(0.75*inch, 9.35*inch, "payment bond rights effective on RECEIPT OF PAYMENT. Do not sign if you have not received payment.")

    # Content
    y = 9.0
    c.setFont("Helvetica", 8)

    c.drawString(0.7*inch, y*inch, "TO: _______________________________________________  DATE: __________")
    c.drawString(0.7*inch, (y-0.3)*inch, "Claimant Name: _________________________________________________")
    c.drawString(0.7*inch, (y-0.6)*inch, "Job Location: ____________________________________________________")
    c.drawString(0.7*inch, (y-0.9)*inch, "Owner: ___________________________________________________________")
    c.drawString(0.7*inch, (y-1.2)*inch, "Through Date: ____________________________________________________")
    c.drawString(0.7*inch, (y-1.5)*inch, "Amount: $ ________________________________________________________")

    y -= 2.0
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "The undersigned, for and in consideration of payment in the amount shown above and other good")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "and valuable consideration, hereby waives and releases any and all liens, claims, demands, and rights")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "arising out of labor, materials, equipment, and services furnished to the above project, conditional upon")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "receipt and clearing of the check or electronic payment in the amount stated above.")

    y -= 0.4
    c.drawString(0.7*inch, y*inch, "This waiver is conditional and the claimant retains all rights if payment is not received or is stopped.")

    y -= 0.5
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "CLAIMANT CERTIFICATION")
    y -= 0.25
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "Claimant Signature: ___________________________  Date: __________")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Print Name: ______________________________  Title: ______________")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Company: _________________________________________________________")

    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, 0.3*inch, FOOTER_TEXT)

    c.save()
    return filepath

def generate_unconditional_progress_waiver():
    """Generate Unconditional Waiver on Progress Payment"""
    filepath = os.path.join(OUTPUT_DIR, "unconditional-progress-lien-waiver.pdf")

    c = canvas.Canvas(filepath, pagesize=letter)

    # Header
    c.setFillColor(HexColor("#1a1a1a"))
    c.rect(0.5*inch, 10*inch, 7.5*inch, 0.4*inch, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.7*inch, 10.15*inch, "UNCONDITIONAL WAIVER AND RELEASE")
    c.drawString(0.7*inch, 9.9*inch, "ON PROGRESS PAYMENT")

    c.setFillColor(HexColor("#ff6666"))
    c.rect(0.7*inch, 9.2*inch, 7.1*inch, 0.6*inch, fill=1)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(0.75*inch, 9.65*inch, "WARNING: THIS DOCUMENT WAIVES AND RELEASES LIEN, STOP PAYMENT NOTICE,")
    c.drawString(0.75*inch, 9.45*inch, "AND PAYMENT BOND RIGHTS IMMEDIATELY UPON SIGNING, NOT AFTER PAYMENT RECEIPT.")
    c.drawString(0.75*inch, 9.25*inch, "Do not sign until you have received payment.")

    c.setFillColor(black)

    # Content
    y = 8.8
    c.setFont("Helvetica", 8)

    c.drawString(0.7*inch, y*inch, "TO: _______________________________________________  DATE: __________")
    c.drawString(0.7*inch, (y-0.3)*inch, "Claimant Name: _________________________________________________")
    c.drawString(0.7*inch, (y-0.6)*inch, "Job Location: ____________________________________________________")
    c.drawString(0.7*inch, (y-0.9)*inch, "Owner: ___________________________________________________________")
    c.drawString(0.7*inch, (y-1.2)*inch, "Through Date: ____________________________________________________")
    c.drawString(0.7*inch, (y-1.5)*inch, "Amount: $ ________________________________________________________")

    y -= 2.0
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "The undersigned, for and in consideration of payment in the amount shown above and other good")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "and valuable consideration, hereby UNCONDITIONALLY waives and releases any and all liens,")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "claims, demands, and rights arising out of labor, materials, equipment, and services furnished to")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "the above project. This waiver is UNCONDITIONAL and final.")

    y -= 0.4
    c.drawString(0.7*inch, y*inch, "By signing, claimant waives ALL lien rights immediately, regardless of payment status.")

    y -= 0.5
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "CLAIMANT CERTIFICATION")
    y -= 0.25
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "Claimant Signature: ___________________________  Date: __________")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Print Name: ______________________________  Title: ______________")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Company: _________________________________________________________")

    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, 0.3*inch, FOOTER_TEXT)

    c.save()
    return filepath

def generate_conditional_final_waiver():
    """Generate Conditional Waiver on Final Payment"""
    filepath = os.path.join(OUTPUT_DIR, "conditional-final-lien-waiver.pdf")

    c = canvas.Canvas(filepath, pagesize=letter)

    # Header
    c.setFillColor(HexColor("#1a1a1a"))
    c.rect(0.5*inch, 10*inch, 7.5*inch, 0.4*inch, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.7*inch, 10.15*inch, "CONDITIONAL WAIVER AND RELEASE")
    c.drawString(0.7*inch, 9.9*inch, "ON FINAL PAYMENT")

    c.setFillColor(HexColor("#ffff00"))
    c.rect(0.7*inch, 9.4*inch, 7.1*inch, 0.4*inch, fill=1)

    c.setFillColor(black)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(0.75*inch, 9.55*inch, "NOTICE: This document waives final lien rights effective on RECEIPT OF PAYMENT.")
    c.drawString(0.75*inch, 9.35*inch, "Do not sign if you have not received final payment.")

    # Content
    y = 9.0
    c.setFont("Helvetica", 8)

    c.drawString(0.7*inch, y*inch, "TO: _______________________________________________  DATE: __________")
    c.drawString(0.7*inch, (y-0.3)*inch, "Claimant Name: _________________________________________________")
    c.drawString(0.7*inch, (y-0.6)*inch, "Job Location: ____________________________________________________")
    c.drawString(0.7*inch, (y-0.9)*inch, "Owner: ___________________________________________________________")
    c.drawString(0.7*inch, (y-1.2)*inch, "Project Completion Date: __________________________________________")
    c.drawString(0.7*inch, (y-1.5)*inch, "Final Amount: $ ___________________________________________________")

    y -= 2.0
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "The undersigned certifies that all work has been completed and all claims are settled. For and in")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "consideration of receipt of the final payment shown above, the undersigned hereby waives and")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "releases any and all liens, claims, demands, and all rights against the project, conditional upon")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "receipt and clearing of the payment.")

    y -= 0.4
    c.drawString(0.7*inch, y*inch, "This waiver constitutes a release of all claims against the owner and surety.")

    y -= 0.5
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "CLAIMANT CERTIFICATION")
    y -= 0.25
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "Claimant Signature: ___________________________  Date: __________")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Print Name: ______________________________  Title: ______________")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Company: _________________________________________________________")

    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, 0.3*inch, FOOTER_TEXT)

    c.save()
    return filepath

def generate_unconditional_final_waiver():
    """Generate Unconditional Waiver on Final Payment"""
    filepath = os.path.join(OUTPUT_DIR, "unconditional-final-lien-waiver.pdf")

    c = canvas.Canvas(filepath, pagesize=letter)

    # Header
    c.setFillColor(HexColor("#1a1a1a"))
    c.rect(0.5*inch, 10*inch, 7.5*inch, 0.4*inch, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.7*inch, 10.15*inch, "UNCONDITIONAL WAIVER AND RELEASE")
    c.drawString(0.7*inch, 9.9*inch, "ON FINAL PAYMENT")

    c.setFillColor(HexColor("#ff6666"))
    c.rect(0.7*inch, 9.2*inch, 7.1*inch, 0.6*inch, fill=1)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(0.75*inch, 9.65*inch, "WARNING: THIS DOCUMENT WAIVES AND RELEASES ALL LIEN RIGHTS IMMEDIATELY")
    c.drawString(0.75*inch, 9.45*inch, "UPON SIGNING. THIS IS FINAL AND UNCONDITIONAL.")
    c.drawString(0.75*inch, 9.25*inch, "Do not sign until you have received final payment.")

    c.setFillColor(black)

    # Content
    y = 8.8
    c.setFont("Helvetica", 8)

    c.drawString(0.7*inch, y*inch, "TO: _______________________________________________  DATE: __________")
    c.drawString(0.7*inch, (y-0.3)*inch, "Claimant Name: _________________________________________________")
    c.drawString(0.7*inch, (y-0.6)*inch, "Job Location: ____________________________________________________")
    c.drawString(0.7*inch, (y-0.9)*inch, "Owner: ___________________________________________________________")
    c.drawString(0.7*inch, (y-1.2)*inch, "Project Completion Date: __________________________________________")
    c.drawString(0.7*inch, (y-1.5)*inch, "Final Amount: $ ___________________________________________________")

    y -= 2.0
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "The undersigned certifies that all work has been completed and all material has been furnished.")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "For and in consideration of receipt of the final payment shown above, the undersigned hereby")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "UNCONDITIONALLY waives and releases all liens, claims, demands, and all rights against the")
    y -= 0.2
    c.drawString(0.7*inch, y*inch, "project. This waiver is final and cannot be revoked.")

    y -= 0.4
    c.drawString(0.7*inch, y*inch, "All claims are fully settled and released.")

    y -= 0.5
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "CLAIMANT CERTIFICATION")
    y -= 0.25
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "Claimant Signature: ___________________________  Date: __________")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Print Name: ______________________________  Title: ______________")
    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Company: _________________________________________________________")

    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, 0.3*inch, FOOTER_TEXT)

    c.save()
    return filepath

def generate_change_order():
    """Generate Change Order Request (AIA G701 format)"""
    filepath = os.path.join(OUTPUT_DIR, "change-order-request.pdf")

    c = canvas.Canvas(filepath, pagesize=letter)

    # Header
    c.setFillColor(HexColor("#1a1a1a"))
    c.rect(0.5*inch, 10*inch, 7.5*inch, 0.4*inch, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(3.5*inch, 10.15*inch, "CHANGE ORDER")

    c.setFillColor(black)

    # Info fields
    y = 9.6
    c.setFont("Helvetica", 8)

    c.drawString(0.7*inch, y*inch, "PROJECT:")
    c.line(1.5*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "CHANGE ORDER NO.:")
    c.line(5.5*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "CONTRACTOR:")
    c.line(1.5*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "DATE:")
    c.line(5.5*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "OWNER:")
    c.line(1.5*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "CONTRACT DATE:")
    c.line(5.5*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "ARCHITECT:")
    c.line(1.5*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "CONTRACT FOR:")
    c.line(5.5*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    # Description section
    y -= 0.5
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "DESCRIPTION OF CHANGES")

    y -= 0.25
    c.setFont("Helvetica", 7)
    for i in range(6):
        c.line(0.7*inch, y*inch, 7.5*inch, y*inch)
        y -= 0.25

    # Cost breakdown
    y -= 0.2
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "ADJUSTMENT TO CONTRACT SUM")

    y -= 0.3
    c.setFont("Helvetica", 8)
    c.drawString(0.7*inch, y*inch, "Additions: $ ____________________________")
    c.drawString(4.2*inch, y*inch, "Deductions: $ ____________________________")

    y -= 0.35
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "New Contract Sum: $ ____________________________")

    # Time adjustment
    y -= 0.35
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "ADJUSTMENT TO CONTRACT TIME")

    y -= 0.3
    c.setFont("Helvetica", 8)
    c.drawString(0.7*inch, y*inch, "Addition: ______ days    Deduction: ______ days")

    y -= 0.35
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "New Completion Date: ____________________________")

    # Signature blocks
    y -= 0.5
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "SIGNATURES")

    y -= 0.3
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "OWNER:")
    c.line(1.2*inch, (y-0.15)*inch, 3*inch, (y-0.15)*inch)
    c.drawString(3.2*inch, y*inch, "DATE:")
    c.line(3.7*inch, (y-0.15)*inch, 4.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "CONTRACTOR:")
    c.line(1.5*inch, (y-0.15)*inch, 3*inch, (y-0.15)*inch)
    c.drawString(3.2*inch, y*inch, "DATE:")
    c.line(3.7*inch, (y-0.15)*inch, 4.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "ARCHITECT:")
    c.line(1.5*inch, (y-0.15)*inch, 3*inch, (y-0.15)*inch)
    c.drawString(3.2*inch, y*inch, "DATE:")
    c.line(3.7*inch, (y-0.15)*inch, 4.5*inch, (y-0.15)*inch)

    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, 0.3*inch, FOOTER_TEXT)

    c.save()
    return filepath

def generate_monthly_billing_summary():
    """Generate Monthly Billing Summary"""
    filepath = os.path.join(OUTPUT_DIR, "monthly-billing-summary.pdf")

    c = canvas.Canvas(filepath, pagesize=letter)

    # Header
    c.setFillColor(HexColor("#1a1a1a"))
    c.rect(0.5*inch, 10*inch, 7.5*inch, 0.4*inch, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(2.8*inch, 10.15*inch, "MONTHLY BILLING SUMMARY")

    c.setFillColor(black)

    # Project info fields
    y = 9.6
    c.setFont("Helvetica", 8)

    c.drawString(0.7*inch, y*inch, "Project Name:")
    c.line(1.6*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "Period:")
    c.line(4.7*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "Project No.:")
    c.line(1.6*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "Contractor:")
    c.line(4.8*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    y -= 0.35
    c.drawString(0.7*inch, y*inch, "Owner:")
    c.line(1.6*inch, (y-0.15)*inch, 4*inch, (y-0.15)*inch)
    c.drawString(4.2*inch, y*inch, "GC/Operator:")
    c.line(4.8*inch, (y-0.15)*inch, 7.5*inch, (y-0.15)*inch)

    # Summary table
    y -= 0.5
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "BILLING SUMMARY")

    y -= 0.3
    c.setFont("Helvetica", 7)

    summary_items = [
        ("Contract Amount:", "$"),
        ("Previous Billing:", "$"),
        ("Current Billing:", "$"),
        ("Total Billed To Date:", "$"),
        ("Retainage (_____%):", "$"),
        ("Balance to Finish:", "$")
    ]

    for label, currency in summary_items:
        c.drawString(1.0*inch, y*inch, label)
        c.line(2.8*inch, (y-0.12)*inch, 4.5*inch, (y-0.12)*inch)
        c.drawString(4.6*inch, y*inch, currency)
        y -= 0.25

    # Detail table
    y -= 0.3
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "LINE ITEM DETAIL")

    y -= 0.3
    c.setFont("Helvetica-Bold", 6)

    col_positions = [0.7, 1.5, 3.0, 4.2, 5.2, 6.2, 7.0]
    col_headers = ["ITEM", "DESCRIPTION", "CONTRACT\nAMT", "PREV\nBILLED", "THIS\nPERIOD", "TOTAL\nBILLED", "%"]

    for x, header in zip(col_positions, col_headers):
        c.drawString(x*inch, y*inch, header)

    # Table grid
    c.setLineWidth(0.5)
    c.line(0.7*inch, (y-0.2)*inch, 7.5*inch, (y-0.2)*inch)

    y -= 0.3
    row_height = 0.25

    for i in range(12):
        c.setFont("Helvetica", 7)
        c.drawString(0.75*inch, y*inch, str(i+1))
        y -= row_height
        c.line(0.7*inch, y*inch, 7.5*inch, y*inch)

    # Totals row
    c.setFont("Helvetica-Bold", 7)
    c.drawString(0.75*inch, y*inch, "TOTALS")
    y -= row_height
    c.line(0.7*inch, y*inch, 7.5*inch, y*inch)

    # Vertical lines
    for x in col_positions[1:]:
        c.line(x*inch, (y+13*row_height+0.2)*inch, x*inch, y*inch)

    # Certification
    y -= 0.3
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.7*inch, y*inch, "CONTRACTOR CERTIFICATION")

    y -= 0.25
    c.setFont("Helvetica", 7)
    c.drawString(0.7*inch, y*inch, "I certify that the billing shown above is correct and represents work completed and material furnished.")

    y -= 0.25
    c.drawString(0.7*inch, y*inch, "Signature: ___________________________  Date: __________  Title: ______________")

    # Footer
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, 0.3*inch, FOOTER_TEXT)

    c.save()
    return filepath

def main():
    """Generate all PDF templates"""
    print("Generating AIA construction form templates...")
    print(f"Output directory: {OUTPUT_DIR}\n")

    # Create all PDFs
    templates = [
        ("AIA G702 - Payment Application", generate_g702_payment_application),
        ("AIA G703 - Continuation Sheet", generate_g703_continuation_sheet),
        ("Conditional Progress Waiver", generate_conditional_progress_waiver),
        ("Unconditional Progress Waiver", generate_unconditional_progress_waiver),
        ("Conditional Final Waiver", generate_conditional_final_waiver),
        ("Unconditional Final Waiver", generate_unconditional_final_waiver),
        ("Change Order Request", generate_change_order),
        ("Monthly Billing Summary", generate_monthly_billing_summary)
    ]

    generated_files = []
    for name, generator in templates:
        try:
            filepath = generator()
            generated_files.append(filepath)
            print(f"✓ {name}")
        except Exception as e:
            print(f"✗ {name}: {str(e)}")

    # Verify files
    print("\n" + "="*70)
    print("FILE VERIFICATION")
    print("="*70)

    total_size = 0
    for filepath in generated_files:
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            total_size += size
            filename = os.path.basename(filepath)
            size_kb = size / 1024
            print(f"{filename:<45} {size_kb:>8.1f} KB")
        else:
            print(f"{filepath} - FILE NOT FOUND")

    print("="*70)
    print(f"Total: {len(generated_files)} files | {total_size/1024:.1f} KB")
    print("="*70)

if __name__ == "__main__":
    main()
