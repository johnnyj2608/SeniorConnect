from supabase import create_client, Client
from django.conf import settings
from PIL import Image
from io import BytesIO
from uuid import uuid4

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def upload_to_supabase(file_path, content, content_type):
    """Uploads content to Supabase and returns the public URL."""
    response = supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        file_path,
        content,
        {"content-type": content_type}
    )

    if isinstance(response, dict) and 'error' in response:
        return None, response['error']

    public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/{file_path}"
    return public_url, None

def upload_photo_to_supabase(photo_obj, new_path, old_path):
    """Deletes old photo if present, optimizes and uploads a new photo to Supabase."""
    try:
        if not hasattr(photo_obj, 'read'):
            return None, "Invalid file object."

        try:
            if old_path:
                relative_path = "/".join(old_path.split("/")[-2:])
                delete_photo_from_supabase(relative_path)
        except Exception as e:
            print(f"Error deleting file: {str(e)}")

        image = Image.open(photo_obj).convert("RGB")
        image.thumbnail((400, 400), Image.Resampling.LANCZOS)
        buffer = BytesIO()
        image.save(buffer, format="JPEG", optimize=True, quality=75)
        buffer.seek(0)
        content = buffer.read()
        content_type = "image/jpeg"

        short_id = uuid4().hex[:4]
        file_path = f"{new_path}_{short_id}.jpg"
        return upload_to_supabase(file_path, content, content_type)

    except Exception as e:
        return None, str(e)

def delete_photo_from_supabase(file_path):
    """Deletes a file from Supabase storage."""
    try:
        response = supabase.storage.from_(settings.SUPABASE_BUCKET).remove([file_path])

        if isinstance(response, list) and response and isinstance(response[0], dict) and 'error' in response[0]:
            raise Exception(f"Supabase deletion error: {response[0]['error']}")

    except Exception as e:
        print(f"Error deleting photo from Supabase: {str(e)}")

def delete_folder_from_supabase(folder_prefix: str):
    """Deletes all objects under a given folder prefix in Supabase storage."""
    try:
        files = supabase.storage.from_(settings.SUPABASE_BUCKET).list(path=folder_prefix)

        if isinstance(files, list):
            file_paths = [f"{folder_prefix}{f['name']}" for f in files if 'name' in f]
            if file_paths:
                supabase.storage.from_(settings.SUPABASE_BUCKET).remove(file_paths)
                print(f"Deleted folder '{folder_prefix}' with {len(file_paths)} files.")
    except Exception as e:
        print(f"Error deleting folder '{folder_prefix}' from Supabase: {e}")
