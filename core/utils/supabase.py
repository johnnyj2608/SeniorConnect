from supabase import create_client, Client
from django.conf import settings
from PIL import Image
from io import BytesIO

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def upload_photo_to_supabase(photo_file, file_path):
    """Uploads a photo to Supabase as JPEG and returns the public URL."""
    try:
        if not hasattr(photo_file, 'read'):
            return None, "Invalid file type."

        # Convert to JPEG and optimize
        image = Image.open(photo_file).convert("RGB")
        buffer = BytesIO()
        image.save(buffer, format="JPEG", optimize=True, quality=75)
        buffer.seek(0)

        # Prepare content and file path
        content = buffer.read()
        file_path = f"{file_path.rsplit('.', 1)[0]}.jpg"

        # Upload the image to Supabase
        response = supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
            file_path,
            content,
            {"content-type": "image/jpeg"}
        )

        if isinstance(response, dict) and 'error' in response:
            return None, response['error']

        # Return the public URL
        public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/{file_path}"
        return public_url, None

    except Exception as e:
        return None, str(e)

def delete_photo_from_supabase(file_path):
    """Deletes a file from Supabase storage."""
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
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
