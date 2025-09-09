from supabase import create_client, Client
from django.conf import settings
from PIL import Image
from io import BytesIO
from uuid import uuid4

# Module-level cache for the Supabase client
_supabase_client: Client | None = None

def get_supabase_client() -> Client:
    """Return a cached Supabase client using settings."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client

def upload_file_to_supabase(file_obj, new_path, old_path=None, photo=False):
    """Uploads a file (image or other type) to Supabase and returns the public URL."""
    supabase = get_supabase_client()
    try:
        if not hasattr(file_obj, 'read') or not hasattr(file_obj, 'name'):
            return None, "Invalid file object."
        
        if old_path:
            try:
                delete_file_from_supabase(old_path)
            except Exception as e:
                print(f"Error deleting file: {str(e)}")

        if photo:
            file_obj.seek(0, 2)
            file_size = file_obj.tell()
            file_obj.seek(0)

            image = Image.open(file_obj)
            width, height = image.size
            raw_size = width * height * 3
            threshold = raw_size * 0.1

            if file_size < threshold:
                file_obj.seek(0)
                content = file_obj.read()
                content_type = getattr(file_obj, 'content_type', 'application/octet-stream')
                file_extension = file_obj.name.split('.')[-1].lower()
            else:
                image = image.convert("RGB")
                image.thumbnail((400, 400), Image.Resampling.LANCZOS)
                buffer = BytesIO()
                image.save(buffer, format="JPEG", optimize=True, quality=75)
                buffer.seek(0)
                content = buffer.read()
                content_type = "image/jpeg"
                file_extension = "jpg"
        else:
            file_extension = file_obj.name.split('.')[-1].lower()
            content_type = 'application/pdf' if file_extension == 'pdf' else getattr(file_obj, 'content_type', 'application/octet-stream')
            file_obj.seek(0)
            content = file_obj.read()

        short_id = uuid4().hex[:4]
        file_path = f"{new_path}_{short_id}.{file_extension}"

        response = supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
            file_path,
            content,
            {"content-type": content_type}
        )

        if isinstance(response, dict) and 'error' in response:
            return None, response['error']

        public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/{file_path}"
        return public_url, None

    except Exception as e:
        return None, str(e)

def delete_file_from_supabase(file_path):
    """Deletes a file from Supabase storage using a full public URL."""
    supabase = get_supabase_client()
    try:
        relative_path = get_relative_path_of_supabase(file_path)
        response = supabase.storage.from_(settings.SUPABASE_BUCKET).remove([relative_path])

        if isinstance(response, list) and response and isinstance(response[0], dict) and 'error' in response[0]:
            raise Exception(f"Supabase deletion error: {response[0]['error']}")
    except Exception as e:
        print(f"Error deleting file from Supabase: {str(e)}")

def delete_folder_from_supabase(folder_prefix: str):
    """Deletes all objects under a given folder prefix (from a full public URL) in Supabase storage."""
    supabase = get_supabase_client()
    try:
        relative_prefix = get_relative_path_of_supabase(folder_prefix)
        files = supabase.storage.from_(settings.SUPABASE_BUCKET).list(path=relative_prefix)

        if isinstance(files, list):
            file_paths = [f"{relative_prefix}{f['name']}" for f in files if 'name' in f]
            if file_paths:
                supabase.storage.from_(settings.SUPABASE_BUCKET).remove(file_paths)
                print(f"Deleted folder '{relative_prefix}' with {len(file_paths)} files.")
    except Exception as e:
        print(f"Error deleting folder '{folder_prefix}' from Supabase: {e}")

def get_relative_path_of_supabase(file_path):
    """Extracts the relative path to a file in Supabase storage from the full public URL."""
    base = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/"
    return file_path.replace(base, "")
