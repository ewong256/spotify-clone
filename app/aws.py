import os

# Flask automatically loads .flaskenv, so we can use os.getenv
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

import boto3

# Initialize S3 client
s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

def upload_file_to_s3(file, filename, content_type):
    """
    Uploads a file to S3 and returns the URL.
    """
    try:
        s3.upload_fileobj(
            file,
            AWS_BUCKET_NAME,
            filename,
            ExtraArgs={"ACL": "public-read", "ContentType": content_type}
        )
        return f"https://{AWS_BUCKET_NAME}.s3.amazonaws.com/{filename}"
    except Exception as e:
        print("Error uploading file:", str(e))
        return None

def delete_file_from_s3(file_key, bucket_name="app-academy-spotify-clone"):
    try:
        s3.delete_object(Bucket=bucket_name, Key=file_key)
        return True
    except Exception as e:
        print(f"Error deleting file: {e}")
        return False
