from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import calendar
from collections import defaultdict

from django.http import HttpResponse
from datetime import date, timedelta
from ..models.sadc_model import Sadc
from django.http import HttpResponse
from backend.apps.core.models.member_model import Member

# http://127.0.0.1:8000/tenant/snapshots/preview/<sadc_id>/
def previewSnapshotPdf(request, sadc_id):
    sadc = Sadc.objects.get(id=sadc_id)
    today = date.today()
    first_day_this_month = today.replace(day=1)
    snapshot_date = first_day_this_month - timedelta(days=1)
    
    members = Member.objects.filter(
        sadc=sadc,
        active=True,
        deleted_at__isnull=True
    )

    pdf_buffer = generateMemberSnapshot(
        sadc.name, 
        members, 
        snapshot_date.month, 
        snapshot_date.year
    )
    pdf_buffer.seek(0)

    response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="preview_snapshot_{sadc.name}.pdf"'

    return response

def drawSadcHeader(c, width, height, sadc, month, year):
    y = height - 35
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, y, sadc)
    y -= 25
    c.setFont("Helvetica-Bold", 16)
    month_name = calendar.month_name[month]
    c.drawCentredString(width / 2, y, f"Member Snapshot - {month_name} {year}")
    y -= 40
    return y

def drawMltcSummary():
    return

def drawMltcHeader(c, width, y, mltc_name):
    c.setFont("Helvetica-Bold", 14)
    padding = 10
    text = mltc_name.upper()
    text_width = c.stringWidth(text, "Helvetica-Bold", 14)
    box_width = text_width + padding * 2
    box_height = 20
    box_x = 30
    box_y = y - 5

    c.rect(box_x, box_y, box_width, box_height, stroke=1, fill=0)
    c.drawString(box_x + padding, y, text)
    c.line(box_x, box_y, width - 30, box_y)

    # Column headers

    return y - box_height - 5

def drawMemberInfo(c, y, member):
    c.setFont("Helvetica", 12)
    line_1 = f"{member.sadc_member_id}. {member.formal_name} - DOB: {member.birth_date} - Gender: {member.gender}"
    schedule = member.schedule or "N/A"
    line_2 = f"Schedule: {schedule}"

    c.drawString(50, y, line_1)
    y -= 20
    c.drawString(50, y, line_2)
    y -= 30
    return y

def generateMemberSnapshot(sadc, members, month, year):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y = drawSadcHeader(c, width, height, sadc, month, year)

    groups = defaultdict(list)
    for member in members:
        mltc = member.mltc_name or "Unknown"
        groups[mltc].append(member)

    for mltc_name, group_members in sorted(groups.items()):
        if y < 35:
            c.showPage()
            y = height - 35

        y = drawMltcHeader(c, width, y, mltc_name)

        for member in group_members:
            if y < 50:
                c.showPage()
                y = height - 35
                c.setFont("Helvetica", 12)

            y = drawMemberInfo(c, y, member)

        y -= 10
        c.setFont("Helvetica-Bold", 14)

    c.save()
    buffer.seek(0)
    return buffer