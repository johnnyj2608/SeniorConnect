import os
import re
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from backend.utils.pdf_utils import generateSnapshotPdf
from backend.apps.tenant.models.sadc_model import Sadc

class Command(BaseCommand):
    help = 'Generate snapshot PDF manually like cron would'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            default='members',
            choices=['members', 'birthdays', 'absences', 'enrollments'],
            help='Type of snapshot PDF to generate',
        )
        # python manage.py generateSnapshot --type X

    def handle(self, *args, **options):
        snapshot_type = options['type']

        sadc = Sadc.objects.first()

        if not sadc:
            self.stderr.write("No SADC found!")
            return

        try:
            response = generateSnapshotPdf(sadc.id, options["type"])

            timestamp = timezone.now().strftime("%Y%m%d_%H%M")
            sadc_name = re.sub(r'\W+', '_', sadc.name).strip('_').lower()
            filename = f"{sadc_name}_{snapshot_type}_snapshot_{timestamp}.pdf"

            os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
            output_path = os.path.join(settings.MEDIA_ROOT, filename)

            with open(output_path, 'wb') as f:
                f.write(response)

            self.stdout.write(self.style.SUCCESS(f"PDF saved to {output_path}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error generating PDF: {e}"))