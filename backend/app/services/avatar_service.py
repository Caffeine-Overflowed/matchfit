import uuid

import avinit

from app.utils.minio import MinioFolder, MinioService


class AvatarService:
    """Сервис для генерации аватарок."""

    # Цвета для аватарок
    AVATAR_COLORS = [
        "#1abc9c",
        "#2ecc71",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#16a085",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
        "#f1c40f",
        "#e67e22",
        "#e74c3c",
        "#95a5a6",
        "#f39c12",
        "#d35400",
        "#c0392b",
        "#7f8c8d",
    ]

    @classmethod
    async def generate_chat_avatar(cls, title: str) -> str:
        """
        Генерирует SVG аватарку для чата по названию.

        Args:
            title: Название чата

        Returns:
            filename сохраненного файла в MinIO
        """
        filename = f"{uuid.uuid4()}.svg"

        svg_content = avinit.get_svg_avatar(
            title,
            colors=cls.AVATAR_COLORS,
        )
        svg_bytes = svg_content.encode("utf-8")

        await MinioService.upload_object(
            folder=MinioFolder.CHAT_AVATARS,
            object_name=filename,
            file=svg_bytes,
        )

        return filename
