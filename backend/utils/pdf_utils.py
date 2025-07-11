from io import BytesIO
from calendar import monthrange, month_name
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

from django.core.files.base import ContentFile
from django.db.models import F, Q, Count
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas as rl_canvas
from PyPDF2 import PdfReader

from ..apps.tenant.models.sadc_model import Sadc
from ..apps.tenant.models.mltc_model import Mltc
from ..apps.core.models.member_model import Member
from ..apps.core.models.absence_model import Absence
from ..apps.audit.models.enrollment_model import Enrollment

X_POSITIONS = {
    "POS1": 40,
    "POS2": 250,
    "POS3": 325,
    "POS4": 395,
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

class NumberedCanvas(rl_canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self.drawPageNumber(len(self._saved_page_states) + 1)
        self._saved_page_states.append(dict(self.__dict__))
        super().showPage()

    def save(self):
        """Add page info to each page (Page X of Y)"""
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.drawPageNumber(num_pages)
            super().showPage()
        super().save()

    def drawPageNumber(self, page_count):
        page = self._pageNumber
        text = f"Page {page} of {page_count}"
        self.setFont("Helvetica", 12)
        width, height = letter
        self.drawRightString(width - 30, 20, text)

def generateSnapshotPdf(sadc_id, snapshot_type="members"):
    sadc = Sadc.objects.get(id=sadc_id)
    today = date.today()
    
    first_day = today.replace(day=1)
    last_day = today.replace(day=monthrange(today.year, today.month)[1])
    snapshot_date = first_day - timedelta(days=1)

    display_month = snapshot_date.month
    display_year = snapshot_date.year

    snapshot_type = snapshot_type.lower()

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
            ).select_related('member', 'member__active_auth__mltc').annotate(
                first_name=F('member__first_name'),
                last_name=F('member__last_name'),
                sadc_member_id=F('member__sadc_member_id'),
                birth_date=F('member__birth_date'),
                gender=F('member__gender'),
                mltc_name=F('member__active_auth__mltc__name'),
            )
    elif snapshot_type == "enrollments":
        title = "enrollments"
        members = Enrollment.objects.filter(
            member__sadc=sadc,
            change_date__range=(first_day, last_day)
        ).select_related('member', 'new_mltc', 'old_mltc').annotate(
            first_name=F('member__first_name'),
            last_name=F('member__last_name'),
            sadc_member_id=F('member__sadc_member_id'),
            birth_date=F('member__birth_date'),
            gender=F('member__gender'),
        )
    else:
        title = "members"
        members = Member.objects.filter(
            sadc=sadc,
            active=True,
            deleted_at__isnull=True
        ).select_related('active_auth__mltc')

    mltc_names = (
        Mltc.objects.filter(sadc=sadc)
        .values_list('name', flat=True)
    )

    data = {
        mltc_name or "Unknown": {
            'members': [],
            'counts': {
                'enrollment': 0,
                'disenrollment': 0,
                'transfer_in': 0,
                'transfer_out': 0,
                'net_change': 0,
                'total': 0,
            }
        }
        for mltc_name in mltc_names
    }

    for item in members:
        mltc = getattr(item, 'mltc_name', None) or "Unknown"

        if snapshot_type == "enrollments":
            old_mltc_name = item.old_mltc.name if item.old_mltc else None
            new_mltc_name = item.new_mltc.name if item.new_mltc else None

            if old_mltc_name:
                data[old_mltc_name]['members'].append(item)
                data[old_mltc_name]['counts']['net_change'] -= 1
            if new_mltc_name and new_mltc_name != old_mltc_name:
                data[new_mltc_name]['members'].append(item)
                data[new_mltc_name]['counts']['net_change'] += 1

            if not old_mltc_name and new_mltc_name:
                data[new_mltc_name]['counts']['enrollment'] += 1
            elif old_mltc_name and not new_mltc_name:
                data[old_mltc_name]['counts']['disenrollment'] += 1
            else:
                data[old_mltc_name]['counts']['transfer_out'] += 1
                data[new_mltc_name]['counts']['transfer_in'] += 1
        else:
            data[mltc]['members'].append(item)
            data[mltc]['counts']['total'] += 1

    if snapshot_type == "enrollments":
        counts = (
            Member.objects.filter(
                sadc=sadc,
                active=True,
                deleted_at__isnull=True,
                active_auth__mltc__isnull=False
            )
            .values(mltc_name=F('active_auth__mltc__name'))
            .annotate(count=Count('id'))
        )
        for entry in counts:
            mltc_name = entry['mltc_name'] or "Unknown"
            if mltc_name in data:
                data[mltc_name]['counts']['total'] = entry['count']

    pdf_buffer = generateSnapshot(
        sadc.name, 
        data, 
        display_month, 
        display_year,
        title,
    )

    pdf_buffer.seek(0)

    reader = PdfReader(pdf_buffer)
    pages = len(reader.pages)

    pdf_buffer.seek(0)

    file_name = f"{title}_snapshot_{date.today().strftime('%Y%m%d')}.pdf"
    file = ContentFile(pdf_buffer.read(), name=file_name)

    return file, file_name, pages

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

def drawSectionHeader(c, width, y, header_text):
    c.setFont("Helvetica-Bold", 14)
    padding = 10
    text = header_text.upper()
    text_width = c.stringWidth(text, "Helvetica-Bold", 14)
    box_width = text_width + padding * 2
    box_height = 20
    box_x = 30
    box_y = y - 5

    c.rect(box_x, box_y, box_width, box_height, stroke=1, fill=0)
    c.drawString(box_x + padding, y, text)
    c.line(box_x, box_y, width - 30, box_y)

    return y - box_height

def drawMltcSummary(c, width, y, title, data):
    y = drawSectionHeader(c, width, y, "Summary")

    c.setFont("Helvetica-Bold", 12)
    c.drawString(X_POSITIONS["POS1"], y, "MLTC")

    if title == "enrollments":
        pos2_header = "Start"
        pos3_header = "End"
        c.drawString(X_POSITIONS["POS2"], y, pos2_header)
        c.drawString(X_POSITIONS["POS3"], y, pos3_header)
    elif title == "birthdays":
        pos2_header = "Birthdays"
        c.drawString(X_POSITIONS["POS2"], y, pos2_header)
    elif title == "absences":
        pos2_header = "Absences"
        c.drawString(X_POSITIONS["POS2"], y, pos2_header)
    else:
        pos2_header = "Members"
        c.drawString(X_POSITIONS["POS2"], y, pos2_header)

    y -= 20
    header_width = c.stringWidth(pos2_header, "Helvetica-Bold", 12)
    pos2_header_center_x = X_POSITIONS["POS2"] + (header_width / 2)
    pos3_header_center_x = X_POSITIONS["POS3"] + (header_width / 2)

    for mltc_name, value in sorted(data.items()):
        c.drawString(X_POSITIONS["POS1"], y, mltc_name)
        counts = value.get("counts", {})

        if title == "enrollments":
            total = counts.get("total", 0)
            net_change = counts.get("net_change", 0)

            end_count = total
            start_count = total - net_change

            start_count_text = str(start_count)
            end_count_text = str(end_count)

            start_width = c.stringWidth(start_count_text, "Helvetica", 12)
            end_width = c.stringWidth(end_count_text, "Helvetica", 12)

            start_x = pos2_header_center_x - (start_width / 2)
            end_x = pos3_header_center_x - (end_width / 2)

            c.drawString(start_x, y, start_count_text)
            c.drawString(end_x, y, end_count_text)
        else:
            count_text = str(counts.get("total", 0))
            count_width = c.stringWidth(count_text, "Helvetica", 12)
            count_x = pos2_header_center_x - (count_width / 2)
            c.drawString(count_x, y, count_text)

        y -= 20
    return y

def drawMltcHeader(c, title, width, y, mltc_name):
    y = drawSectionHeader(c, width, y, mltc_name)

    c.setFont("Helvetica-Bold", 12)
    c.drawString(X_POSITIONS["POS1"], y, "Member")
    c.drawString(X_POSITIONS["POS2"], y, "DoB")
    c.drawString(X_POSITIONS["POS3"], y, "Gender")

    if title == "birthdays":
        c.drawString(X_POSITIONS["POS4"]-10, y, "Turning")
    elif title == "absences":
        c.drawString(X_POSITIONS["POS4"], y, "Dates")
    elif title == "enrollments":
        c.drawString(X_POSITIONS["POS4"], y, "Date")
    else:
        c.drawString(X_POSITIONS["POS4"], y, "Schedule")
    return y - 20

def drawMemberInfo(c, title, width, y, member):
    c.setFont("Helvetica", 12)
    name_line = f"{member.sadc_member_id}. {member.last_name}, {member.first_name}"
    c.drawString(X_POSITIONS["POS1"], y, name_line)

    c.drawString(X_POSITIONS["POS2"], y, member.birth_date.strftime("%m/%d/%Y"))

    text_width = c.stringWidth(member.gender, "Helvetica", 12)
    start_x = X_POSITIONS["POS3"]+20 - (text_width / 2)
    c.drawString(start_x, y, member.gender)

    if title == "birthdays":
        age_turning = str(relativedelta(date.today(), member.birth_date).years)
        text_width = c.stringWidth(age_turning, "Helvetica", 12)
        start_x = X_POSITIONS["POS4"]+10 - (text_width / 2)
        c.drawString(start_x, y, age_turning)

        c.line(start_x+50, y - 2, width-30, y - 2)
    elif title == "absences":
        start_str = member.start_date.strftime('%m/%d/%Y') if member.start_date else ""
        end_str = member.end_date.strftime('%m/%d/%Y') if getattr(member, 'end_date', None) else ""
        date_range = f"{start_str} - {end_str}".strip()

        reason = member.get_absence_type_display() if hasattr(member, 'get_absence_type_display') else "-"
        absence_text = f"{date_range} ({reason})" if date_range else reason
        c.drawString(X_POSITIONS["POS4"], y, absence_text)
    elif title == "enrollments":
        change_date = member.change_date.strftime("%m/%d/%Y") if member.change_date else "-"
        change_type = member.change_type.capitalize() if hasattr(member, 'change_type') else "-"
        enrollment_text = f"{change_date} ({change_type})"
        c.drawString(X_POSITIONS["POS4"], y, enrollment_text)

        if change_type == Enrollment.TRANSFER.capitalize():
            y -= 20
            transfer_text = f"{member.old_mltc.name} → {member.new_mltc.name}"
            text_width = c.stringWidth(transfer_text, "Helvetica", 12)
            c.drawString(width - text_width - 30, y, transfer_text)
    else:
        schedule_list = getattr(member, 'schedule', []) or []
        short_schedule = [day_map.get(day, day) for day in schedule_list]
        schedule_str = ", ".join(short_schedule)
        c.drawString(X_POSITIONS["POS4"], y, schedule_str)

    y -= 20
    return y

def classify_enrollment(member, mltc_name):
    new_mltc = getattr(member, 'new_mltc', None)
    old_mltc = getattr(member, 'old_mltc', None)

    return {
        "enrollments": old_mltc is None and new_mltc is not None,
        "disenrollments": old_mltc is not None and new_mltc is None,
        "transfer_in": new_mltc is not None and new_mltc.name == mltc_name,
        "transfer_out": old_mltc is not None and old_mltc.name == mltc_name,
    }

def generateSnapshot(sadc, data, month, year, title):
    buffer = BytesIO()
    c = NumberedCanvas(buffer, pagesize=letter)
    pdf_title = f"{title.capitalize()} Snapshot {month_name[month]} {year}"
    c.setTitle(pdf_title)
    width, height = letter

    y = drawSadcHeader(c, title, width, height, sadc, month, year)
    y = drawMltcSummary(c, width, y, title, data)
    y -= 20

    for mltc_name, group_data in sorted(data.items()):
        y = checkPageBreak(c, y, height)
        y = drawMltcHeader(c, title, width, y, mltc_name)

        members = group_data.get('members', [])
        counts = group_data.get('counts', {})

        for member in members:
            y = checkPageBreak(c, y, height)
            y = drawMemberInfo(c, title, width, y, member)

        c.line(30, y + 5, width - 30, y + 5)
        y -= 10

        c.setFont("Helvetica-Bold", 12)

        if title == "enrollments":
            text = (
                f"Enrollments: {counts.get('enrollment', 0)} | "
                f"Disenrollments: {counts.get('disenrollment', 0)} | "
                f"Transfers In: {counts.get('transfer_in', 0)} | "
                f"Transfers Out: {counts.get('transfer_out', 0)}"
            )
            c.drawString(40, y, text)

            total_text = f"Change: {counts.get('net_change', 0)}"
        else:
            total_text = f"Total: {len(members)}"

        text_width = c.stringWidth(total_text, "Helvetica-Bold", 12)
        c.drawString(width - 40 - text_width, y, total_text)
        y -= 40

    c.save()
    buffer.seek(0)
    return buffer