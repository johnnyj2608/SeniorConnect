from io import BytesIO
from calendar import month_name
from datetime import date

from django.core.files.base import ContentFile
from django.db.models import F, Count
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas as rl_canvas
from pypdf import PdfReader

from ..apps.tenant.models.sadc_model import Sadc
from ..apps.tenant.models.mltc_model import Mltc
from ..apps.core.models.member_model import Member

from .snapshot_utils import (
    X_POSITIONS,
    SNAPSHOT_QUERIES,
    DRAW_FUNCTIONS,
    get_snapshot_dates,
)

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

def generateSnapshotPdf(sadc_id, snapshot_type="members", mltc_names=None, **extra):
    sadc = Sadc.objects.get(id=sadc_id)
    today, first_day, last_day, snapshot_date = get_snapshot_dates()

    snapshot_type = snapshot_type.lower()
    query_func = SNAPSHOT_QUERIES.get(snapshot_type, SNAPSHOT_QUERIES['members'])

    query_info = query_func(sadc, today, first_day, last_day, **extra)
    title = query_info['title']
    members_qs = query_info['members']()

    display_month = query_info.get('display_month', snapshot_date.month)
    display_year = query_info.get('display_year', snapshot_date.year)
    subtitle = title.capitalize()
    if 'gifts_' in snapshot_type:
        subtitle += ' Gift'
    else:
        subtitle += f' Snapshot {month_name[display_month]} {display_year}'

    if mltc_names is None:
        mltc_names = list(Mltc.objects.filter(sadc=sadc).values_list('name', flat=True))

    if snapshot_type == "enrollments":
        base_counts = {
            'enrollment': 0,
            'disenrollment': 0,
            'transfer_in': 0,
            'transfer_out': 0,
            'net_change': 0,
            'total': 0,
        }
    else:
        base_counts = {
            'total': 0,
        }

    data = {
        mltc_name: {
            'members': [],
            'counts': base_counts.copy()
        }
        for mltc_name in mltc_names if mltc_name
    }

    for item in members_qs:
        mltc = getattr(item, 'mltc_name', None)
        if not mltc or mltc not in data:
            continue

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
        title,
        subtitle,
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

def drawSadcHeader(c, subtitle, width, height, sadc):
    y = height - 35
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, y, sadc)
    y -= 25
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, y, subtitle)
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
        
        c.drawString(X_POSITIONS["POS3"], y, pos3_header)
    else:
        pos2_header = title.title()

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
    elif title == "gifts":
        c.drawString(X_POSITIONS["POS4"], y, "Gift")
    else:
        c.drawString(X_POSITIONS["POS4"], y, "Schedule")
    return y - 20

def drawMemberInfo(c, title, width, y, member):
    c.setFont("Helvetica", 12)
    name_line = f"{member.sadc_member_id}. {member.last_name}, {member.first_name}"
    c.drawString(X_POSITIONS["POS1"], y, name_line)

    c.drawString(X_POSITIONS["POS2"], y, member.birth_date.strftime("%m/%d/%Y"))

    text_width = c.stringWidth(member.gender, "Helvetica", 12)
    start_x = X_POSITIONS["POS3"] + 20 - (text_width / 2)
    c.drawString(start_x, y, member.gender)

    draw_func = DRAW_FUNCTIONS.get(title, DRAW_FUNCTIONS["members"])
    y = draw_func(c, width, y, member)

    return y - 20

def classify_enrollment(member, mltc_name):
    new_mltc = getattr(member, 'new_mltc', None)
    old_mltc = getattr(member, 'old_mltc', None)

    return {
        "enrollments": old_mltc is None and new_mltc is not None,
        "disenrollments": old_mltc is not None and new_mltc is None,
        "transfer_in": new_mltc is not None and new_mltc.name == mltc_name,
        "transfer_out": old_mltc is not None and old_mltc.name == mltc_name,
    }

def generateSnapshot(sadc, data, title, subtitle):
    buffer = BytesIO()
    c = NumberedCanvas(buffer, pagesize=letter)
    c.setTitle(subtitle)
    width, height = letter

    y = drawSadcHeader(c, subtitle, width, height, sadc)
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