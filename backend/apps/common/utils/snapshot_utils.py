from django.db.models import Q, F
from datetime import date, datetime, timedelta
from calendar import monthrange
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404

from backend.apps.core.models.member_model import Member
from backend.apps.core.models.absence_model import Absence
from backend.apps.audit.models.enrollment_model import Enrollment
from backend.apps.core.models.gifted_model import Gifted
from backend.apps.tenant.models.gift_model import Gift

X_POSITIONS = {
    "POS1": 40,
    "POS2": 250,
    "POS3": 325,
    "POS4": 395
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

def get_snapshot_dates():
    today = timezone.localdate()
    first_day = today.replace(day=1)
    last_day = today.replace(day=monthrange(today.year, today.month)[1])
    snapshot_date = first_day - timedelta(days=1)

    def to_aware(dt):
        return timezone.make_aware(datetime.combine(dt, datetime.min.time()))

    return to_aware(today), to_aware(first_day), to_aware(last_day), to_aware(snapshot_date)

def birthdays_query(sadc, today, *_):
    return {
        'title': 'birthdays',
        'members': lambda: Member.objects.filter(
            sadc=sadc,
            active=True,
            deleted_at__isnull=True,
            birth_month=today.month,
        ),
        'display_month': today.month,
        'display_year': today.year,
    }

def absences_query(sadc, _, first_day, last_day):
    return {
        'title': 'absences',
        'members': lambda: Absence.objects.filter(
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
        ),
    }

def enrollments_query(sadc, _, first_day, last_day):
    return {
        'title': 'enrollments',
        'members': lambda: Enrollment.objects.filter(
            member__sadc=sadc,
            change_date__range=(first_day, last_day)
        ).select_related('member', 'new_mltc', 'old_mltc').annotate(
            first_name=F('member__first_name'),
            last_name=F('member__last_name'),
            sadc_member_id=F('member__sadc_member_id'),
            birth_date=F('member__birth_date'),
            gender=F('member__gender'),
        ),
    }

def gifts_query(sadc, _, first_day, last_day):
    return {
        'title': 'gifts',
        'members': lambda: Gifted.objects.filter(
            member__sadc=sadc,
            created_at__range=(first_day, last_day)
        ).select_related('member', 'member__active_auth__mltc').annotate(
            first_name=F('member__first_name'),
            last_name=F('member__last_name'),
            sadc_member_id=F('member__sadc_member_id'),
            birth_date=F('member__birth_date'),
            gender=F('member__gender'),
            mltc_name=F('member__active_auth__mltc__name'),
        ),
    }

def gifts_received_query(sadc, _, __, ___, gift_id=None):
    if gift_id is None:
        raise ValueError("gift_id is required")
    gift = get_object_or_404(Gift, id=gift_id)
    return {
        'title': f'{gift.name} Received',
        'members': lambda: Gifted.objects.filter(
            member__sadc=sadc,
            gift_id=gift_id
        ).select_related('member', 'member__active_auth__mltc').annotate(
            first_name=F('member__first_name'),
            last_name=F('member__last_name'),
            sadc_member_id=F('member__sadc_member_id'),
            birth_date=F('member__birth_date'),
            gender=F('member__gender'),
            mltc_name=F('member__active_auth__mltc__name'),
        ),
    }

def gifts_unreceived_query(sadc, _, __, ___, gift_id=None):
    if gift_id is None:
        raise ValueError("gift_id is required")

    gift = Gift.objects.get(id=gift_id)

    received_member_ids = Gifted.objects.filter(gift_id=gift_id).values_list('member_id', flat=True)

    qs = Member.objects.filter(
        sadc=sadc,
        active=True,
        deleted_at__isnull=True
    ).exclude(id__in=received_member_ids)

    if gift.birth_month:
        qs = qs.filter(birth_date__month=gift.birth_month)

    if gift.mltc:
        qs = qs.filter(active_auth__mltc=gift.mltc)
    else:
        qs = qs.filter(active_auth__mltc__isnull=False)

    qs = qs.select_related('active_auth__mltc')

    return {
        'title': f'{gift.name} Unreceived',
        'members': lambda: qs,
    }

def default_query(sadc, *args, **kwargs):
    return {
        'title': 'members',
        'members': lambda: Member.objects.filter(
            sadc=sadc,
            active=True,
            deleted_at__isnull=True
        ).select_related('active_auth__mltc'),
    }

SNAPSHOT_QUERIES = {
    'birthdays': birthdays_query,
    'absences': absences_query,
    'enrollments': enrollments_query,
    'gifts': gifts_query,
    'gifts_received': gifts_received_query,
    'gifts_unreceived': gifts_unreceived_query,
    'members': default_query,
}

def draw_birthdays(c, width, y, member):
    age_turning = str(relativedelta(date.today(), member.birth_date).years)
    text_width = c.stringWidth(age_turning, "Helvetica", 12)
    start_x = X_POSITIONS["POS4"] + 10 - (text_width / 2)
    c.drawString(start_x, y, age_turning)
    c.line(start_x + 50, y - 2, width - 30, y - 2)
    return y

def draw_absences(c, width, y, member):
    start_str = member.start_date.strftime('%m/%d/%Y') if member.start_date else ""
    end_str = member.end_date.strftime('%m/%d/%Y') if getattr(member, 'end_date', None) else ""
    date_range = f"{start_str} - {end_str}".strip()
    reason = member.get_absence_type_display() if hasattr(member, 'get_absence_type_display') else "-"
    absence_text = f"{date_range} ({reason})" if date_range else reason
    c.drawString(X_POSITIONS["POS4"], y, absence_text)
    return y

def draw_enrollments(c, width, y, member):
    change_date = member.change_date.strftime("%m/%d/%Y") if member.change_date else "-"
    change_type = member.change_type.capitalize() if hasattr(member, 'change_type') else "-"
    enrollment_text = f"{change_date} ({change_type})"
    c.drawString(X_POSITIONS["POS4"], y, enrollment_text)

    if change_type == Enrollment.TRANSFER.capitalize():
        y -= 20
        transfer_text = f"{member.old_mltc.name} → {member.new_mltc.name}"
        text_width = c.stringWidth(transfer_text, "Helvetica", 12)
        c.drawString(width - text_width - 30, y, transfer_text)
    return y

def draw_gifts(c, width, y, member):
    gift_text = f"{member.name}: {member.created_at.strftime('%m/%d/%Y')}"
    c.drawString(X_POSITIONS["POS4"], y, gift_text)
    return y

def draw_schedule(c, width, y, member):
    schedule_list = getattr(member, 'schedule', []) or []
    short_schedule = [day_map.get(day, day) for day in schedule_list]
    schedule_str = ", ".join(short_schedule)
    c.drawString(X_POSITIONS["POS4"], y, schedule_str)
    return y

DRAW_FUNCTIONS = {
    "birthdays": draw_birthdays,
    "absences": draw_absences,
    "enrollments": draw_enrollments,
    "gifts": draw_gifts,
    "members": draw_schedule,
}