import io
from enum import Enum
from uuid import uuid4
from strawberry.file_uploads import Upload
from miniopy_async import Minio

from app import Config


ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


class MinioFolder(str, Enum):
    AVATARS = "avatars"
    CHAT_AVATARS = "chat-avatars"
    EVENT_IMAGES = "event-images"


class MinioService:
    _client = Minio(
        Config.minio.endpoint,
        access_key=Config.minio.access_key,
        secret_key=Config.minio.secret_key,
        secure=Config.minio.secure,
        cert_check=False,
    )

    @classmethod
    async def upload_object(
        cls,
        folder: MinioFolder,
        object_name: str,
        file: bytes,
        content_type: str | None = None,
    ):
        # Без content-type MinIO отдаёт объект как application/octet-stream
        return await cls._client.put_object(
            bucket_name=Config.minio.bucket_name,
            object_name=f"{folder.value}/{object_name}",
            data=io.BytesIO(file),
            length=len(file),
            content_type=content_type or "application/octet-stream",
        )
    @staticmethod
    async def delete_object(folder: MinioFolder, object_name: str):
        return await MinioService._client.remove_object(
            bucket_name=Config.minio.bucket_name,
            object_name=f"{folder.value}/{object_name}",
        )

    @staticmethod
    def form_link(folder: MinioFolder, object_name: str | None) -> str | None:
        if not object_name:
            return None
        return f"/cdn/{Config.minio.bucket_name}/{folder.value}/{object_name}"

    @staticmethod
    def form_avatar_name(avatar: Upload, user_id: str):
        filename = avatar.filename or ""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            ext = "jpg"
        # уникальное имя на загрузку — тот же URL иначе кешируется браузером со старой авой
        return f"{user_id}-{uuid4().hex[:12]}.{ext}"
