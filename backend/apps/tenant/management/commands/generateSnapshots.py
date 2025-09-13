from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.apps.common.utils.supabase import upload_file_to_supabase
from backend.apps.common.utils.pdf_utils import generateSnapshotPdf
from backend.apps.tenant.models.sadc_model import Sadc
from backend.apps.tenant.models.snapshot_model import Snapshot

SNAPSHOT_TYPES = ['birthdays', 'members', 'absences', 'enrollments', 'gifts']

class Command(BaseCommand):
    help = 'Generate all snapshot PDFs for all SADCs and upload to Supabase'

    def handle(self, *args, **options):
        now = timezone.now()
        sadcs = Sadc.objects.all()
        if not sadcs.exists():
            return

        for sadc in sadcs:
            for snapshot_type in SNAPSHOT_TYPES:
                try:
                    file, file_name, pages = generateSnapshotPdf(sadc.id, snapshot_type)

                    new_path = f"{sadc.id}/snapshots/{snapshot_type}/{file.name}"
                    file_path, error = upload_file_to_supabase(
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
                            file=file_path,
                            name=file_name,
                            pages=pages,
                        )
                except Exception as e:
                    print(f"Failed to generate/upload snapshot for SADC {sadc.id}, type {snapshot_type}: {e}")