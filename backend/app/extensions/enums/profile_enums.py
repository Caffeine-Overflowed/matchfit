from enum import Enum, unique

@unique
class Chronotype (str, Enum):
    EARLY_BIRD="EARLY_BIRD"
    NIGHT_OWL="NIGHT_OWL"
    PIGEON="PIGEON"