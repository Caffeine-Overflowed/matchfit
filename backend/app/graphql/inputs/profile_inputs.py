from typing import List, Optional

from strawberry.file_uploads import Upload
import strawberry

from app.extensions.enums.profile_enums import Chronotype


@strawberry.input(description="Данные для создания/изменения профиля")
class ProfileInput:
    name: str = strawberry.field(description="Имя пользователя")
    birth_year: int = strawberry.field(description="Год рождения")
    birth_month: int = strawberry.field(description="Месяц рождения")
    gender: str = strawberry.field(description="Пол")
    avatar: Upload = strawberry.field(description="Файл аватара (image)")
    goal_ids: List[int] = strawberry.field(description="айди выбранных целей")
    sport_ids: List[int] = strawberry.field(description="айди выбранных спортов")
    lat: Optional[float] = strawberry.field(default=None, description="Широта")
    lon: Optional[float] = strawberry.field(default=None, description="Долгота")
    weight: Optional[float] = strawberry.field(default=None, description="Вес в кг")
    height: Optional[float] = strawberry.field(default=None, description="Рост в см")
    bio: Optional[str] = strawberry.field(default=None, description="О себе (до 500 символов)")
    languages: List[str] = strawberry.field(default_factory=list, description="Языки (ISO 639-1 коды: ru, en, de...)")
    chronotype: Chronotype = strawberry.field(description="Хронотип")

@strawberry.input(description="Данные для обновления локации")
class UpdateLocationInput:
    lat: float = strawberry.field(description="Широта")
    lon: float = strawberry.field(description="Долгота")


@strawberry.input(description="Фильтры для поиска похожих профилей")
class ProfileFilterInput:
    distance_km: Optional[int] = strawberry.field(default=None, description="Макс. расстояние в км")
    age_min: Optional[int] = strawberry.field(default=None, description="Мин. возраст")
    age_max: Optional[int] = strawberry.field(default=None, description="Макс. возраст")
    gender: Optional[str] = strawberry.field(default=None, description="Пол (male/female или None для любого)")
    goal_ids: Optional[List[int]] = strawberry.field(default=None, description="Фильтр по целям")
    sport_ids: Optional[List[int]] = strawberry.field(default=None, description="Фильтр по спортам")
    height_min: Optional[float] = strawberry.field(default=None, description="Мин. рост в см")
    height_max: Optional[float] = strawberry.field(default=None, description="Макс. рост в см")
    weight_min: Optional[float] = strawberry.field(default=None, description="Мин. вес в кг")
    weight_max: Optional[float] = strawberry.field(default=None, description="Макс. вес в кг")
    chronotype: Optional[List[Chronotype]] = strawberry.field(default=None, description="Хронотип")
    languages: Optional[List[str]] = strawberry.field(default=None, description="Языки")