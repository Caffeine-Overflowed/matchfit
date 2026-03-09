import strawberry

from .middlewares.error_extension import ErrorMaskExtension
from .mutations.auth_mutations import AuthMutations
from .mutations.event_mutations import EventMutations
from .mutations.health_mutations import HealthMutations
from .mutations.match_mutation import MatchMutations
from .mutations.notification_mutations import NotificationMutations
from .mutations.profile_mutations import ProfileMutations
from .mutations.chat_mutations import ChatMutations
from .queries.chat_queries import ChatQueries

from .queries.event_queries import EventQueries
from .queries.goal_queries import GoalQueries
from .queries.health_queries import HealthQueries
from .queries.match_queries import MatchQueries
from .queries.notification_queries import NotificationQueries
from .queries.profile_queries import ProfileQueries
from .queries.sport_queries import SportQueries
from .queries.user_queries import UserQueries
from .subscriptions.chat_subscriptions import ChatSubscriptions
from .subscriptions.notification_subscriptions import NotificationSubscriptions


@strawberry.type
class Query(ChatQueries, EventQueries, GoalQueries, HealthQueries, MatchQueries, NotificationQueries, ProfileQueries, SportQueries, UserQueries):
    """Корневой тип для всех запросов"""

    pass


@strawberry.type
class Mutation(
    AuthMutations, ChatMutations, EventMutations, HealthMutations, MatchMutations, NotificationMutations, ProfileMutations
):
    """Корневой тип для всех мутаций"""

    pass


@strawberry.type
class Subscription(ChatSubscriptions, NotificationSubscriptions):
    """Корневой тип для всех подписок"""

    pass


schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription,
    extensions=[ErrorMaskExtension],
)
