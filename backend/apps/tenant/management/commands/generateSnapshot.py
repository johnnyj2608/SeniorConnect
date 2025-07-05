from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.utils.supabase import upload_file_to_supabase
from backend.utils.pdf_utils import generateSnapshotPdf
from backend.apps.tenant.models.sadc_model import Sadc
from backend.apps.tenant.models.snapshot_model import Snapshot

SNAPSHOT_TYPES = ['members', 'birthdays', 'absences', 'enrollments']

class Command(BaseCommand):
    help = 'Generate all snapshot PDFs for all SADCs and upload to Supabase'

    def handle(self, *args, **options):
        sadcs = Sadc.objects.all()
        if not sadcs.exists():
            return

        for sadc in sadcs:
            for snapshot_type in SNAPSHOT_TYPES:
                try:
                    file = generateSnapshotPdf(sadc.id, snapshot_type)

                    now = timezone.now()
                    date_str = now.strftime("%B_%Y").lower()
                    filename = f"{snapshot_type}_{date_str}.pdf"
                    file.name = filename

                    new_path = f"{sadc.id}/snapshots/{snapshot_type}/{filename}"
                    public_url, error = upload_file_to_supabase(
                        file,
                        new_path,
                        old_path=None,
                    )

                    if not error:
                        snapshot_date = now.replace(day=1).date()
                        Snapshot.objects.create(
                            sadc=sadc,
                            date=snapshot_date,
                            type=snapshot_type,
                            file=public_url
                        )
                except Exception as e:
                    pass