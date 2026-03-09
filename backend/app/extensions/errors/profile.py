from app.extensions.errors.base import BaseDomainError


class ProfileNotFoundError(BaseDomainError):
    CODE = "profile_not_found"

class OnboardingAlreadyCompletedError(BaseDomainError):
    CODE = "onboarding_already_completed"

class NotOnboardedError(BaseDomainError):
    CODE = "profile_not_onboarded"