from io import BytesIO
from calendar import monthrange, month_name
from collections import defaultdict
from datetime import date, timedelta

from django.db.models import F, Q
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from ..models.sadc_model import Sadc
from backend.apps.core.models.member_model import Member
from backend.apps.core.models.absence_model import Absence
from backend.apps.core.models.enrollment_model import Enrollment


X_POSITIONS = {
    "Member": 50,
    "DOB": 225,
    "Gender": 300,
    "Content": 375,
}

day_map = {
    "monday": "Mon",
    "tuesday": "Tue",
    "wednesday": "Wed",
    "thursday": "Thu",
    "friday": "Fri",
    "saturday": "Sat",
    "sunday": "Sun"
}

# http://127.0.0.1:8000/tenant/snapshots/preview/1/?type=members

def previewSnapshotPdf(request, sadc_id):
    sadc = Sadc.objects.get(id=sadc_id)
    today = date.today()
    first_day = today.replace(day=1)
    last_day = today.replace(day=monthrange(today.year, today.month)[1])
    snapshot_date = first_day - timedelta(days=1)

    display_month = snapshot_date.month
    display_year = snapshot_date.year

    snapshot_type = request.GET.get("type", "members").lower()

    if snapshot_type == "birthdays":
        title = "birthdays"
        members = Member.objects.filter(
            sadc=sadc,
            active=True,
            deleted_at__isnull=True,
            birth_date__month=today.month
        )
        display_month = today.month
        display_year = today.year
    elif snapshot_type == "absences":
        title = "absences"
        members = Absence.objects.filter(
                Q(member__sadc=sadc) &
                Q(member__active=True) &
                Q(member__deleted_at__isnull=True) &
                ~Q(absence_type="assessment") &
                Q(start_date__lte=last_day) &
                Q(end_date__gte=first_day)
            ).select_related('member').annotate(
                first_name=F('member__first_name'),
                last_name=F('member__last_name'),
                sadc_member_id=F('member__sadc_member_id'),
                birth_date=F('member__birth_date'),
                gender=F('member__gender'),
                mltc_name=F('member__active_auth__mltc__name'),
            )
    elif snapshot_type == "enrollments":
        title = "enrollments"
    else:
        title = "members"
        members = Member.objects.filter(
            sadc=sadc,
            active=True,
            deleted_at__isnull=True
        )

    data = defaultdict(list)
    for item in members:
        mltc = item.mltc_name or "Unknown"
        data[mltc].append(item)

    pdf_buffer = generateSnapshot(
        sadc.name, 
        data, 
        display_month, 
        display_year,
        title,
    )
    pdf_buffer.seek(0)

    response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
    filename = f"preview_{snapshot_type}_snapshot_{sadc.name}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'

    return response

def checkPageBreak(c, y, height, font="Helvetica", font_size=12):
    if y < 35:
        c.showPage()
        y = height - 35
        c.setFont(font, font_size)
    return y

def drawSadcHeader(c, title, width, height, sadc, month, year):
    y = height - 35
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, y, sadc)
    y -= 25
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, y, f"{title.capitalize()} Snapshot - {month_name[month]} {year}")
    y -= 40
    return y

def drawMltcHeader(c, title, width, y, mltc_name):
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

    y -= box_height
    c.setFont("Helvetica-Bold", 12)
    c.drawString(X_POSITIONS["Member"], y, "Member")
    c.drawString(X_POSITIONS["DOB"], y, "DOB")
    c.drawString(X_POSITIONS["Gender"], y, "Gender")

    if title == "birthdays":
        c.drawString(X_POSITIONS["Content"]-10, y, "Turning")
    elif title == "absences":
        c.drawString(X_POSITIONS["Content"], y, "Reason")
    elif title == "enrollments":
        c.drawString(X_POSITIONS["Content"], y, "Date")
    else:
        c.drawString(X_POSITIONS["Content"], y, "Schedule")
    return y - 20

def drawMemberInfo(c, title, width, y, member):
    c.setFont("Helvetica", 12)
    c.drawString(X_POSITIONS["Member"], y, 
        f"{member.sadc_member_id}. {member.last_name}, {member.first_name}"
    )
    c.drawString(X_POSITIONS["DOB"], y, member.birth_date.strftime("%m/%d/%Y"))

    text_width = c.stringWidth(member.gender, "Helvetica", 12)
    start_x = X_POSITIONS["Gender"]+20 - (text_width / 2)
    c.drawString(start_x, y, member.gender)

    if title == "birthdays":
        age_turning = str(date.today().year - member.birth_date.year)
        text_width = c.stringWidth(age_turning, "Helvetica", 12)
        start_x = X_POSITIONS["Content"]+10 - (text_width / 2)
        c.drawString(start_x, y, age_turning)

        c.line(start_x+50, y - 2, width-30, y - 2)
    elif title == "absences":
        reason = member.get_absence_type_display() if hasattr(member, 'get_absence_type_display') else "-"
        
        start_str = member.start_date.strftime('%m/%d/%Y') if member.start_date else ""
        end_str = member.end_date.strftime('%m/%d/%Y') if getattr(member, 'end_date', None) else ""
        
        date_range = f"{start_str} - {end_str}"
        
        absence_text = f"{reason} ({date_range.strip()})" if date_range.strip() else reason
        c.drawString(X_POSITIONS["Content"], y, absence_text)
    elif title == "enrollments":
        pass
        # Enrollment - Subgroups by type, change_date (transfer to/from)
    else:
        schedule_list = member.schedule or []
        short_schedule = [day_map.get(day, day) for day in schedule_list]
        schedule_str = ", ".join(short_schedule)
        c.drawString(X_POSITIONS["Content"], y, schedule_str)

    y -= 20
    return y

def generateSnapshot(sadc, data, month, year, title):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y = drawSadcHeader(c, title, width, height, sadc, month, year)

    for mltc_name, group_members in sorted(data.items()):
        y = checkPageBreak(c, y, height)
        y = drawMltcHeader(c, title, width, y, mltc_name)

        members_count = 0
        for member in group_members:
            y = checkPageBreak(c, y, height)
            y = drawMemberInfo(c, title, width, y, member)
            members_count += 1

        c.line(30, y+5, width - 30, y+5)
        y -= 10

        c.setFont("Helvetica-Bold", 12)
        total_text = f"Total: {members_count}"
        text_width = c.stringWidth(total_text, "Helvetica-Bold", 12)
        x_position = width - 50 - text_width
        c.drawString(x_position, y, total_text)

        y -= 40
       
    c.save()
    buffer.seek(0)
    return buffer