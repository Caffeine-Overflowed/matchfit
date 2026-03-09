import io
from enum import Enum
from strawberry.file_uploads import Upload
from miniopy_async import Minio

from app import Config


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
    async def upload_object(cls, folder: MinioFolder, object_name: str, file: bytes):
        return await cls._client.put_object(
            bucket_name=Config.minio.bucket_name,
            object_name=f"{folder.value}/{object_name}",
            data=io.BytesIO(file),
            length=len(file),
        )
    @staticmethod
    async def delete_object(folder: MinioFolder, object_name: str):
        return await MinioService._client.remove_object(
            bucket_name=Config.minio.bucket_name,
            object_name=f"{folder.value}/{object_name}",
        )

    @staticmethod
    def form_link(folder: MinioFolder, object_name: str) -> str:
        return f"/cdn/{Config.minio.bucket_name}/{folder.value}/{object_name}"

    @staticmethod
    def form_avatar_name(avatar: Upload, user_id: str):
        ext = avatar.filename.split(".")[-1] if "." in avatar.filename else "jpg"
        avatar_name = f"{user_id}.{ext}"
        return avatar_name
