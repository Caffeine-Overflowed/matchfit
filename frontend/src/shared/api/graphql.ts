import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

/** Результат аутентификации */
export type AuthResult = {
  __typename?: 'AuthResult';
  /** токены */
  tokens: TokensType;
  /** Данные пользователя */
  user: UserType;
};

/** Detailed chat information */
export type ChatInfoType = {
  __typename?: 'ChatInfoType';
  /** Event associated with this chat (if any) */
  event?: Maybe<EventType>;
  /** Chat ID */
  id: Scalars['String']['output'];
  /** Chat image filename */
  imageFileName?: Maybe<Scalars['String']['output']>;
  /** Whether chat is deleted */
  isDeleted: Scalars['Boolean']['output'];
  /** Profile associated with this chat (if any) */
  profile?: Maybe<ProfileType>;
  /** Chat name/title */
  title?: Maybe<Scalars['String']['output']>;
  /** Chat kind */
  type: ChatKind;
};

export enum ChatKind {
  Channel = 'CHANNEL',
  Direct = 'DIRECT',
  Group = 'GROUP'
}

/** Chat participant */
export type ChatParticipantType = {
  __typename?: 'ChatParticipantType';
  /** Whether user is host */
  isHost: Scalars['Boolean']['output'];
  /** When user joined */
  joinedAt: Scalars['DateTime']['output'];
  /** ID of last read message */
  lastReadMessageId?: Maybe<Scalars['String']['output']>;
  /** User ID */
  userId: Scalars['String']['output'];
};

/** Chat */
export type ChatType = {
  __typename?: 'ChatType';
  /** When chat was created */
  createdAt: Scalars['DateTime']['output'];
  /** Whether user has unread messages */
  hasUnreadMessages: Scalars['Boolean']['output'];
  /** Chat ID */
  id: Scalars['String']['output'];
  /** Chat image filename (chat avatar for groups/channels or user avatar for direct chats) */
  imageFileName?: Maybe<Scalars['String']['output']>;
  /** Last message in chat (for chat list) */
  lastMessage?: Maybe<LastMessagePreview>;
  /** Other user info (for direct chats only) */
  otherUser?: Maybe<UserType>;
  /** Chat participants */
  participants: Array<ChatParticipantType>;
  /** Chat title */
  title?: Maybe<Scalars['String']['output']>;
  /** Chat kind */
  type: ChatKind;
  /** Number of unread messages */
  unreadCount: Scalars['Int']['output'];
};

export enum Chronotype {
  EarlyBird = 'EARLY_BIRD',
  NightOwl = 'NIGHT_OWL',
  Pigeon = 'PIGEON'
}

/** Данные для создания события */
export type CreateEventInput = {
  /** Категория события */
  category?: EventCategory;
  /** Тип чата события (GROUP или CHANNEL) */
  chatType: ChatKind;
  /** Описание события */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Уровень сложности */
  difficulty?: DifficultyLevel;
  /** Время окончания (UTC) */
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  /** Файл изображения события (image) */
  imageFileName: Scalars['Upload']['input'];
  /** Широта */
  lat: Scalars['Float']['input'];
  /** Долгота */
  lon: Scalars['Float']['input'];
  /** Максимальное количество участников */
  maxParticipants?: InputMaybe<Scalars['Int']['input']>;
  /** Приватность события */
  privacy?: EventPrivacy;
  /** ID видов спорта */
  sportIds?: Array<Scalars['Int']['input']>;
  /** Время начала (UTC) */
  startTime: Scalars['DateTime']['input'];
  /** Желаемое количество участников */
  targetParticipants?: InputMaybe<Scalars['Int']['input']>;
  /** Название события */
  title: Scalars['String']['input'];
};

/** Input for deleting a chat */
export type DeleteChatInput = {
  /** Chat ID */
  chatId: Scalars['String']['input'];
};

export enum DifficultyLevel {
  Easy = 'EASY',
  Hard = 'HARD',
  Medium = 'MEDIUM',
  NA = 'N_A'
}

/** Параметры для эхо-запроса */
export type EchoInput = {
  /** Сообщение для эхо */
  message: Scalars['String']['input'];
};

export enum EventCategory {
  Lecture = 'LECTURE',
  Sport = 'SPORT',
  Trip = 'TRIP',
  Workshop = 'WORKSHOP'
}

/** Пагинированный список событий */
export type EventConnection = {
  __typename?: 'EventConnection';
  /** Есть ли ещё события */
  hasMore: Scalars['Boolean']['output'];
  /** Список событий */
  items: Array<EventType>;
  /** Общее количество */
  totalCount: Scalars['Int']['output'];
};

/** Краткая информация об организаторе события */
export type EventHostType = {
  __typename?: 'EventHostType';
  /** URL аватара */
  avatarUrl?: Maybe<Scalars['String']['output']>;
  /** UUID пользователя */
  id: Scalars['String']['output'];
  /** Имя пользователя */
  name?: Maybe<Scalars['String']['output']>;
};

export enum EventPrivacy {
  FriendsOnly = 'FRIENDS_ONLY',
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export enum EventStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Scheduled = 'SCHEDULED'
}

/** Событие */
export type EventType = {
  __typename?: 'EventType';
  /** Категория события */
  category: EventCategory;
  /** Информация о чате события */
  chat?: Maybe<ChatInfoType>;
  /** Дата создания */
  createdAt: Scalars['DateTime']['output'];
  /** Описание события */
  description?: Maybe<Scalars['String']['output']>;
  /** Уровень сложности */
  difficulty: DifficultyLevel;
  /** Время окончания */
  endTime?: Maybe<Scalars['DateTime']['output']>;
  /** Информация об организаторе */
  host?: Maybe<EventHostType>;
  /** UUID организатора */
  hostId: Scalars['String']['output'];
  /** UUID события */
  id: Scalars['String']['output'];
  /** URL изображения события */
  imageFileName: Scalars['String']['output'];
  /** Является ли текущий пользователь организатором события */
  isHost: Scalars['Boolean']['output'];
  /** Является ли текущий пользователь участником события */
  isParticipant: Scalars['Boolean']['output'];
  /** Широта */
  lat: Scalars['Float']['output'];
  /** Долгота */
  lon: Scalars['Float']['output'];
  /** Максимальное количество участников */
  maxParticipants?: Maybe<Scalars['Int']['output']>;
  /** Количество участников события */
  participantsCount: Scalars['Int']['output'];
  /** Приватность события */
  privacy: EventPrivacy;
  /** ID видов спорта */
  sportIds: Array<Scalars['Int']['output']>;
  /** Время начала */
  startTime: Scalars['DateTime']['output'];
  /** Статус события */
  status: EventStatus;
  /** Желаемое количество участников */
  targetParticipants?: Maybe<Scalars['Int']['output']>;
  /** Название события */
  title: Scalars['String']['output'];
};

/** Фильтры для списка событий */
export type GetEventsInput = {
  /** Фильтр по категориям (пусто = все) */
  categories?: Array<EventCategory>;
  /** Фильтр по сложности (пусто = все) */
  difficulties?: Array<DifficultyLevel>;
  /** События начиная с даты */
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Фильтр по организатору (для 'мои события') */
  hostId?: InputMaybe<Scalars['String']['input']>;
  /** Количество записей */
  limit?: Scalars['Int']['input'];
  /** Смещение */
  offset?: Scalars['Int']['input'];
  /** Фильтр по приватности (None = PUBLIC + FRIENDS_ONLY от друзей) */
  privacy?: InputMaybe<EventPrivacy>;
  /** Радиус поиска в километрах (обязательный) */
  radiusKm: Scalars['Float']['input'];
  /** Поиск по названию (пустая строка = без фильтра) */
  search?: Scalars['String']['input'];
  /** Фильтр по видам спорта (пусто = все) */
  sportIds?: Array<Scalars['Int']['input']>;
  /** Фильтр по статусам (пусто = все для своих, SCHEDULED для чужих) */
  statuses?: Array<EventStatus>;
  /** События до даты */
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Input for fetching messages with pagination */
export type GetMessagesInput = {
  /** Chat ID */
  chatId: Scalars['String']['input'];
  /** Cursor: ID of last message */
  cursorId?: InputMaybe<Scalars['String']['input']>;
  /** Cursor: sent_at timestamp of last message */
  cursorSentAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** Number of messages to fetch (max 100) */
  limit?: InputMaybe<Scalars['Int']['input']>;
};

/** Фильтры для списка моих событий */
export type GetMyEventsInput = {
  /** Количество записей */
  limit?: Scalars['Int']['input'];
  /** Смещение */
  offset?: Scalars['Int']['input'];
  /** Фильтр по статусам (пусто = все) */
  statuses?: Array<EventStatus>;
};

/** Параметры получения уведомлений */
export type GetNotificationsInput = {
  /** Количество уведомлений */
  limit?: Scalars['Int']['input'];
  /** Смещение для пагинации */
  offset?: Scalars['Int']['input'];
  /** Только непрочитанные */
  unreadOnly?: Scalars['Boolean']['input'];
};

/** Цель пользователя */
export type GoalType = {
  __typename?: 'GoalType';
  description?: Maybe<Scalars['String']['output']>;
  iconUrl: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

/** Данные для Google OAuth */
export type GoogleAuthInput = {
  /** Authorization code от Google */
  code: Scalars['String']['input'];
  /** State для верификации */
  state: Scalars['String']['input'];
};

/** URL для авторизации через Google */
export type GoogleAuthUrlResult = {
  __typename?: 'GoogleAuthUrlResult';
  /** State для верификации (сохранить для callback) */
  state: Scalars['String']['output'];
  /** URL для редиректа на Google OAuth */
  url: Scalars['String']['output'];
};

/** Результат проверки здоровья сервиса */
export type HealthResult = {
  __typename?: 'HealthResult';
  /** Дополнительное сообщение */
  message?: Maybe<Scalars['String']['output']>;
  /** Статус сервиса */
  status: Scalars['String']['output'];
  /** Время ответа */
  timestamp: Scalars['DateTime']['output'];
};

/** Last message preview */
export type LastMessagePreview = {
  __typename?: 'LastMessagePreview';
  /** Message content */
  content: Scalars['String']['output'];
  /** Message ID */
  id: Scalars['String']['output'];
  /** Whether message was read by current user */
  isRead: Scalars['Boolean']['output'];
  /** Sender email */
  senderEmail?: Maybe<Scalars['String']['output']>;
  /** Sender user ID */
  senderId: Scalars['String']['output'];
  /** When message was sent */
  sentAt: Scalars['DateTime']['output'];
};

/** Данные для входа */
export type LoginInput = {
  /** Email пользователя */
  email: Scalars['String']['input'];
  /** Пароль */
  password: Scalars['String']['input'];
};

/** Результат отметки всех уведомлений прочитанными */
export type MarkAllNotificationsReadResult = {
  __typename?: 'MarkAllNotificationsReadResult';
  /** Количество отмеченных уведомлений */
  count: Scalars['Int']['output'];
};

/** Input for marking chat as read */
export type MarkAsReadInput = {
  /** Chat ID */
  chatId: Scalars['String']['input'];
};

/** Mark as read result */
export type MarkAsReadResult = {
  __typename?: 'MarkAsReadResult';
  /** Whether operation succeeded */
  success: Scalars['Boolean']['output'];
};

/** ID уведомления для отметки прочитанным */
export type MarkNotificationReadInput = {
  /** UUID уведомления */
  notificationId: Scalars['String']['input'];
};

/** Результат отметки уведомления прочитанным */
export type MarkNotificationReadResult = {
  __typename?: 'MarkNotificationReadResult';
  /** ID уведомления */
  notificationId: Scalars['String']['output'];
  /** Успешно ли отмечено */
  success: Scalars['Boolean']['output'];
};

/** Message sender info */
export type MessageSenderType = {
  __typename?: 'MessageSenderType';
  /** User email */
  email: Scalars['String']['output'];
  /** User ID */
  id: Scalars['String']['output'];
};

/** Message */
export type MessageType = {
  __typename?: 'MessageType';
  /** Chat ID */
  chatId: Scalars['String']['output'];
  /** Message content */
  content: Scalars['String']['output'];
  /** Message ID */
  id: Scalars['String']['output'];
  /** Message sender */
  sender: MessageSenderType;
  /** When message was sent */
  sentAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Авторизация через Google */
  authGoogle: AuthResult;
  /** Отменить событие (только организатор) */
  cancelEvent: EventType;
  /** Создание нового события */
  createEvent: EventType;
  /** Создание профиля при онбординге */
  createProfile: ProfileType;
  /** Delete a chat (only host can delete channels/groups) */
  deleteChat: MarkAsReadResult;
  /** Эхо-запрос с сообщением */
  echo: HealthResult;
  /** Получить URL для авторизации через Google */
  googleAuthUrl: GoogleAuthUrlResult;
  /** Присоединиться к событию */
  joinEvent: EventType;
  /** Вход в систему */
  login: AuthResult;
  /** Отметить все уведомления как прочитанные */
  markAllNotificationsRead: MarkAllNotificationsReadResult;
  /** Mark all messages in a chat as read */
  markAsRead: MarkAsReadResult;
  /** Отметить уведомление как прочитанное */
  markNotificationRead: MarkNotificationReadResult;
  /** Обновление токенов */
  refreshTokens: TokensType;
  /** Регистрация нового пользователя */
  register: AuthResult;
  /** Send a message to a chat */
  sendMessage: MessageType;
  /** обработка свайпа */
  swipe: Scalars['Boolean']['output'];
  /** Обновить событие (только организатор) */
  updateEvent: EventType;
  /** Обновление только локации профиля */
  updateLocation: ProfileType;
  /** Изменение профиля */
  updateProfile: ProfileType;
};


export type MutationAuthGoogleArgs = {
  data: GoogleAuthInput;
};


export type MutationCancelEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationCreateEventArgs = {
  eventData: CreateEventInput;
};


export type MutationCreateProfileArgs = {
  data: ProfileInput;
};


export type MutationDeleteChatArgs = {
  input: DeleteChatInput;
};


export type MutationEchoArgs = {
  data: EchoInput;
};


export type MutationJoinEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  data: LoginInput;
};


export type MutationMarkAsReadArgs = {
  input: MarkAsReadInput;
};


export type MutationMarkNotificationReadArgs = {
  data: MarkNotificationReadInput;
};


export type MutationRefreshTokensArgs = {
  data: RefreshInput;
};


export type MutationRegisterArgs = {
  data: RegisterInput;
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationSwipeArgs = {
  isLiked: Scalars['Boolean']['input'];
  targetId: Scalars['String']['input'];
};


export type MutationUpdateEventArgs = {
  eventData: UpdateEventInput;
};


export type MutationUpdateLocationArgs = {
  data: UpdateLocationInput;
};


export type MutationUpdateProfileArgs = {
  data: ProfileInput;
};

/** Ближайшее событие с расстоянием */
export type NearbyEventType = {
  __typename?: 'NearbyEventType';
  /** Расстояние до события в км */
  distanceKm: Scalars['Float']['output'];
  /** Событие */
  event: EventType;
};

/** Пагинированный список уведомлений */
export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  /** Есть ли еще уведомления */
  hasMore: Scalars['Boolean']['output'];
  /** Список уведомлений */
  items: Array<NotificationType>;
  /** Общее количество */
  totalCount: Scalars['Int']['output'];
};

/** Типы уведомлений */
export enum NotificationKind {
  EventCancelled = 'EVENT_CANCELLED',
  EventReminder = 'EVENT_REMINDER',
  EventStatusChanged = 'EVENT_STATUS_CHANGED',
  EventUpdated = 'EVENT_UPDATED',
  MatchConfirmed = 'MATCH_CONFIRMED',
  MatchDeclined = 'MATCH_DECLINED',
  NewMatch = 'NEW_MATCH',
  NewParticipant = 'NEW_PARTICIPANT',
  ParticipantLeft = 'PARTICIPANT_LEFT',
  SystemMessage = 'SYSTEM_MESSAGE'
}

/** Уведомление */
export type NotificationType = {
  __typename?: 'NotificationType';
  /** Время создания */
  createdAt: Scalars['DateTime']['output'];
  /** UUID уведомления */
  id: Scalars['String']['output'];
  /** Прочитано ли уведомление */
  isRead: Scalars['Boolean']['output'];
  /** Тип уведомления */
  kind: NotificationKind;
  /** Данные уведомления (event_id, user_id, etc.) */
  payload: Scalars['JSON']['output'];
  /** Время прочтения (null = не прочитано) */
  readAt?: Maybe<Scalars['DateTime']['output']>;
  /** Текст уведомления (локализованный) */
  text: Scalars['String']['output'];
  /** Заголовок уведомления (локализованный) */
  title: Scalars['String']['output'];
  /** UUID получателя */
  userId: Scalars['String']['output'];
};

/** Paginated messages response */
export type PaginatedMessagesType = {
  __typename?: 'PaginatedMessagesType';
  /** Whether there are more messages */
  hasMore: Scalars['Boolean']['output'];
  /** List of messages */
  messages: Array<MessageType>;
  /** Cursor for next page: message ID */
  nextCursorId?: Maybe<Scalars['String']['output']>;
  /** Cursor for next page: sent_at */
  nextCursorSentAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Фильтры для поиска похожих профилей */
export type ProfileFilterInput = {
  /** Макс. возраст */
  ageMax?: InputMaybe<Scalars['Int']['input']>;
  /** Мин. возраст */
  ageMin?: InputMaybe<Scalars['Int']['input']>;
  /** Хронотип */
  chronotype?: InputMaybe<Array<Chronotype>>;
  /** Макс. расстояние в км */
  distanceKm?: InputMaybe<Scalars['Int']['input']>;
  /** Пол (male/female или None для любого) */
  gender?: InputMaybe<Scalars['String']['input']>;
  /** Фильтр по целям */
  goalIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Макс. рост в см */
  heightMax?: InputMaybe<Scalars['Float']['input']>;
  /** Мин. рост в см */
  heightMin?: InputMaybe<Scalars['Float']['input']>;
  /** Языки */
  languages?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Фильтр по спортам */
  sportIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Макс. вес в кг */
  weightMax?: InputMaybe<Scalars['Float']['input']>;
  /** Мин. вес в кг */
  weightMin?: InputMaybe<Scalars['Float']['input']>;
};

/** Данные для создания/изменения профиля */
export type ProfileInput = {
  /** Файл аватара (image) */
  avatar: Scalars['Upload']['input'];
  /** О себе (до 500 символов) */
  bio?: InputMaybe<Scalars['String']['input']>;
  /** Месяц рождения */
  birthMonth: Scalars['Int']['input'];
  /** Год рождения */
  birthYear: Scalars['Int']['input'];
  /** Хронотип */
  chronotype: Chronotype;
  /** Пол */
  gender: Scalars['String']['input'];
  /** айди выбранных целей */
  goalIds: Array<Scalars['Int']['input']>;
  /** Рост в см */
  height?: InputMaybe<Scalars['Float']['input']>;
  /** Языки (ISO 639-1 коды: ru, en, de...) */
  languages?: Array<Scalars['String']['input']>;
  /** Широта */
  lat?: InputMaybe<Scalars['Float']['input']>;
  /** Долгота */
  lon?: InputMaybe<Scalars['Float']['input']>;
  /** Имя пользователя */
  name: Scalars['String']['input'];
  /** айди выбранных спортов */
  sportIds: Array<Scalars['Int']['input']>;
  /** Вес в кг */
  weight?: InputMaybe<Scalars['Float']['input']>;
};

/** Профиль пользователя */
export type ProfileType = {
  __typename?: 'ProfileType';
  /** Возраст пользователя (лет) */
  age: Scalars['Int']['output'];
  /** URL аватара */
  avatarUrl: Scalars['String']['output'];
  /** О себе */
  bio: Scalars['String']['output'];
  /** Хронотипы */
  chronotype: Chronotype;
  /** Расстояние до пользователя (км) */
  distance?: Maybe<Scalars['Int']['output']>;
  /** Пол */
  gender: Scalars['String']['output'];
  /** цели пользователя */
  goals: Array<GoalType>;
  /** Рост пользователя (см) */
  height?: Maybe<Scalars['Float']['output']>;
  /** Языки (ISO 639-1 коды) */
  languages: Array<Scalars['String']['output']>;
  /** Название локации (город/страна) */
  locationName?: Maybe<Scalars['String']['output']>;
  /** Имя пользователя */
  name: Scalars['String']['output'];
  /** спорты пользователя */
  sports: Array<SportType>;
  /** Дата последнего обновления */
  updatedAt: Scalars['DateTime']['output'];
  /** ID пользователя (UUID) */
  userId: Scalars['String']['output'];
  /** Вес пользователя (кг) */
  weight?: Maybe<Scalars['Float']['output']>;
};

export type Query = {
  __typename?: 'Query';
  /** Get a specific chat by ID */
  chatInfo: ChatInfoType;
  /** Get messages in a chat with cursor-based pagination */
  chatMessages: PaginatedMessagesType;
  /** Получить событие по ID */
  event: EventType;
  /** Получить список событий с фильтрами */
  events: EventConnection;
  /** Получить список всех целей */
  goals: Array<GoalType>;
  /** Получить текущего авторизованного пользователя */
  me: UserType;
  /** Get all chats for current user with last message and unread status */
  myChats: Array<ChatType>;
  /** Получить мои события (где я организатор или участник) */
  myEvents: EventConnection;
  /** Получить свой профиль */
  myProfile?: Maybe<ProfileType>;
  /** Получить неактивированные метчи пользователя */
  myRecentMatches: Array<UnstartedMatchType>;
  /** Получить ближайшие события с сортировкой по расстоянию (до 20 штук, макс. 200 км) */
  nearbyEvents: Array<NearbyEventType>;
  /** Получить уведомления текущего пользователя */
  notifications: NotificationConnection;
  /** Проверка доступности сервиса */
  ping: HealthResult;
  /** Получить профиль пользователя */
  profile: ProfileType;
  /** Подобрать похожие профили */
  similarProfiles: Array<ProfileType>;
  /** Получить список всех видов спорта */
  sports: Array<SportType>;
  /** Количество непрочитанных уведомлений */
  unreadNotificationsCount: Scalars['Int']['output'];
};


export type QueryChatInfoArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryChatMessagesArgs = {
  input: GetMessagesInput;
};


export type QueryEventArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  params: GetEventsInput;
};


export type QueryMyChatsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyEventsArgs = {
  params: GetMyEventsInput;
};


export type QueryNearbyEventsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryNotificationsArgs = {
  params?: InputMaybe<GetNotificationsInput>;
};


export type QueryProfileArgs = {
  userId: Scalars['String']['input'];
};


export type QuerySimilarProfilesArgs = {
  filters: ProfileFilterInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

/** Данные для обновления токенов */
export type RefreshInput = {
  /** Refresh token */
  refreshToken: Scalars['String']['input'];
};

/** Данные для регистрации */
export type RegisterInput = {
  /** Email пользователя */
  email: Scalars['String']['input'];
  /** Пароль (минимум 8 символов) */
  password: Scalars['String']['input'];
};

/** Input for sending a message */
export type SendMessageInput = {
  /** Chat ID */
  chatId: Scalars['String']['input'];
  /** Message content */
  content: Scalars['String']['input'];
};

/** Вид спорта */
export type SportType = {
  __typename?: 'SportType';
  iconUrl: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to new messages in a chat */
  messageReceived: MessageType;
  /** Подписка на новые уведомления в реальном времени */
  notificationReceived: NotificationType;
};


export type SubscriptionMessageReceivedArgs = {
  chatId: Scalars['String']['input'];
};

/** Результат токенов */
export type TokensType = {
  __typename?: 'TokensType';
  /** Новый JWT access token */
  accessToken: Scalars['String']['output'];
  /** время в unix истекания */
  accessTokenExpire: Scalars['Int']['output'];
  /** Новый refresh token */
  refreshToken: Scalars['String']['output'];
  /** время в unix истекания */
  refreshTokenExpire: Scalars['Int']['output'];
};

/** Match */
export type UnstartedMatchType = {
  __typename?: 'UnstartedMatchType';
  /** айди чата */
  chatId: Scalars['String']['output'];
  /** профиль пользователя, с которым произошел match */
  matcherProfile: ProfileType;
};

/** Данные для полного обновления события */
export type UpdateEventInput = {
  /** Категория события */
  category?: EventCategory;
  /** Тип чата события (GROUP или CHANNEL) */
  chatType: ChatKind;
  /** Описание события */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Уровень сложности */
  difficulty?: DifficultyLevel;
  /** Время окончания (UTC) */
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  /** ID события */
  eventId: Scalars['String']['input'];
  /** Файл изображения события (image) */
  imageFile: Scalars['Upload']['input'];
  /** Широта */
  lat: Scalars['Float']['input'];
  /** Долгота */
  lon: Scalars['Float']['input'];
  /** Максимальное количество участников */
  maxParticipants?: InputMaybe<Scalars['Int']['input']>;
  /** Приватность события */
  privacy?: EventPrivacy;
  /** ID видов спорта */
  sportIds?: Array<Scalars['Int']['input']>;
  /** Время начала (UTC) */
  startTime: Scalars['DateTime']['input'];
  /** Желаемое количество участников */
  targetParticipants?: InputMaybe<Scalars['Int']['input']>;
  /** Название события */
  title: Scalars['String']['input'];
};

/** Данные для обновления локации */
export type UpdateLocationInput = {
  /** Широта */
  lat: Scalars['Float']['input'];
  /** Долгота */
  lon: Scalars['Float']['input'];
};

/** Пользователь */
export type UserType = {
  __typename?: 'UserType';
  /** Дата регистрации */
  createdAt: Scalars['DateTime']['output'];
  /** Email пользователя */
  email: Scalars['String']['output'];
  /** UUID пользователя */
  id: Scalars['String']['output'];
};

export type AuthResultFragment = { __typename?: 'AuthResult', user: { __typename?: 'UserType', id: string, email: string, createdAt: any }, tokens: { __typename?: 'TokensType', accessToken: string, accessTokenExpire: number, refreshToken: string, refreshTokenExpire: number } };

export type NotificationTypeFragment = { __typename?: 'NotificationType', id: string, kind: NotificationKind, text: string, payload: any, isRead: boolean, readAt?: any | null, createdAt: any };

export type ProfileFragmentFragment = { __typename?: 'ProfileType', userId: string, name: string, age: number, gender: string, chronotype: Chronotype, avatarUrl: string, bio: string, height?: number | null, weight?: number | null, languages: Array<string>, locationName?: string | null, updatedAt: any, goals: Array<{ __typename?: 'GoalType', id: number, name: string, iconUrl: string }>, sports: Array<{ __typename?: 'SportType', id: number, name: string }> };

export type AuthTokensFragment = { __typename?: 'TokensType', accessToken: string, accessTokenExpire: number, refreshToken: string, refreshTokenExpire: number };

export type UserFragment = { __typename?: 'UserType', id: string, email: string, createdAt: any };

export type RegisterMutationVariables = Exact<{
  data: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthResult', user: { __typename?: 'UserType', id: string, email: string, createdAt: any }, tokens: { __typename?: 'TokensType', accessToken: string, accessTokenExpire: number, refreshToken: string, refreshTokenExpire: number } } };

export type GoogleAuthUrlMutationVariables = Exact<{ [key: string]: never; }>;


export type GoogleAuthUrlMutation = { __typename?: 'Mutation', googleAuthUrl: { __typename?: 'GoogleAuthUrlResult', url: string, state: string } };

export type AuthGoogleMutationVariables = Exact<{
  data: GoogleAuthInput;
}>;


export type AuthGoogleMutation = { __typename?: 'Mutation', authGoogle: { __typename?: 'AuthResult', user: { __typename?: 'UserType', id: string, email: string, createdAt: any }, tokens: { __typename?: 'TokensType', accessToken: string, accessTokenExpire: number, refreshToken: string, refreshTokenExpire: number } } };

export type LoginMutationVariables = Exact<{
  data: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResult', user: { __typename?: 'UserType', id: string, email: string, createdAt: any }, tokens: { __typename?: 'TokensType', accessToken: string, accessTokenExpire: number, refreshToken: string, refreshTokenExpire: number } } };

export type SendMessageMutationVariables = Exact<{
  input: SendMessageInput;
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'MessageType', id: string, chatId: string, content: string, sentAt: any, sender: { __typename?: 'MessageSenderType', id: string, email: string } } };

export type MarkAsReadMutationVariables = Exact<{
  input: MarkAsReadInput;
}>;


export type MarkAsReadMutation = { __typename?: 'Mutation', markAsRead: { __typename?: 'MarkAsReadResult', success: boolean } };

export type CreateEventMutationVariables = Exact<{
  eventData: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null } };

export type JoinEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type JoinEventMutation = { __typename?: 'Mutation', joinEvent: { __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null } };

export type CancelEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type CancelEventMutation = { __typename?: 'Mutation', cancelEvent: { __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null } };

export type UpdateEventMutationVariables = Exact<{
  eventData: UpdateEventInput;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent: { __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null } };

export type UpdateLocationMutationVariables = Exact<{
  data: UpdateLocationInput;
}>;


export type UpdateLocationMutation = { __typename?: 'Mutation', updateLocation: { __typename?: 'ProfileType', userId: string, name: string, age: number, gender: string, chronotype: Chronotype, avatarUrl: string, bio: string, height?: number | null, weight?: number | null, languages: Array<string>, locationName?: string | null, updatedAt: any, goals: Array<{ __typename?: 'GoalType', id: number, name: string, iconUrl: string }>, sports: Array<{ __typename?: 'SportType', id: number, name: string }> } };

export type MarkNotificationReadMutationVariables = Exact<{
  data: MarkNotificationReadInput;
}>;


export type MarkNotificationReadMutation = { __typename?: 'Mutation', markNotificationRead: { __typename?: 'MarkNotificationReadResult', notificationId: string, success: boolean } };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: { __typename?: 'MarkAllNotificationsReadResult', count: number } };

export type CreateProfileMutationVariables = Exact<{
  data: ProfileInput;
}>;


export type CreateProfileMutation = { __typename?: 'Mutation', createProfile: { __typename?: 'ProfileType', userId: string, name: string, age: number, gender: string, chronotype: Chronotype, avatarUrl: string, bio: string, height?: number | null, weight?: number | null, languages: Array<string>, locationName?: string | null, updatedAt: any, goals: Array<{ __typename?: 'GoalType', id: number, name: string, iconUrl: string }>, sports: Array<{ __typename?: 'SportType', id: number, name: string }> } };

export type UpdateProfileMutationVariables = Exact<{
  data: ProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'ProfileType', userId: string, name: string, age: number, gender: string, chronotype: Chronotype, avatarUrl: string, bio: string, height?: number | null, weight?: number | null, languages: Array<string>, locationName?: string | null, updatedAt: any, goals: Array<{ __typename?: 'GoalType', id: number, name: string, iconUrl: string }>, sports: Array<{ __typename?: 'SportType', id: number, name: string }> } };

export type SwipeMutationVariables = Exact<{
  targetId: Scalars['String']['input'];
  isLiked: Scalars['Boolean']['input'];
}>;


export type SwipeMutation = { __typename?: 'Mutation', swipe: boolean };

export type RefreshTokensMutationVariables = Exact<{
  data: RefreshInput;
}>;


export type RefreshTokensMutation = { __typename?: 'Mutation', refreshTokens: { __typename?: 'TokensType', accessToken: string, accessTokenExpire: number, refreshToken: string, refreshTokenExpire: number } };

export type MyChatsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyChatsQuery = { __typename?: 'Query', myChats: Array<{ __typename?: 'ChatType', id: string, title?: string | null, type: ChatKind, imageFileName?: string | null, unreadCount: number, hasUnreadMessages: boolean, otherUser?: { __typename?: 'UserType', id: string, email: string } | null, lastMessage?: { __typename?: 'LastMessagePreview', id: string, content: string, senderId: string, senderEmail?: string | null, sentAt: any, isRead: boolean } | null, participants: Array<{ __typename?: 'ChatParticipantType', userId: string, isHost: boolean }> }> };

export type ChatInfoQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type ChatInfoQuery = { __typename?: 'Query', chatInfo: { __typename?: 'ChatInfoType', id: string, title?: string | null, type: ChatKind, imageFileName?: string | null, profile?: { __typename?: 'ProfileType', userId: string, name: string, avatarUrl: string } | null } };

export type ChatMessagesQueryVariables = Exact<{
  input: GetMessagesInput;
}>;


export type ChatMessagesQuery = { __typename?: 'Query', chatMessages: { __typename?: 'PaginatedMessagesType', hasMore: boolean, nextCursorId?: string | null, nextCursorSentAt?: any | null, messages: Array<{ __typename?: 'MessageType', id: string, chatId: string, content: string, sentAt: any, sender: { __typename?: 'MessageSenderType', id: string, email: string } }> } };

export type EventFragment = { __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null };

export type EventsQueryVariables = Exact<{
  params: GetEventsInput;
}>;


export type EventsQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', totalCount: number, hasMore: boolean, items: Array<{ __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null }> } };

export type EventQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type EventQuery = { __typename?: 'Query', event: { __typename?: 'EventType', isHost: boolean, isParticipant: boolean, id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null } };

export type NearbyEventFragment = { __typename?: 'NearbyEventType', distanceKm: number, event: { __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null } };

export type NearbyEventsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type NearbyEventsQuery = { __typename?: 'Query', nearbyEvents: Array<{ __typename?: 'NearbyEventType', distanceKm: number, event: { __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null } }> };

export type MyEventsQueryVariables = Exact<{
  params: GetMyEventsInput;
}>;


export type MyEventsQuery = { __typename?: 'Query', myEvents: { __typename?: 'EventConnection', totalCount: number, hasMore: boolean, items: Array<{ __typename?: 'EventType', id: string, title: string, description?: string | null, category: EventCategory, difficulty: DifficultyLevel, status: EventStatus, privacy: EventPrivacy, imageFileName: string, lat: number, lon: number, startTime: any, endTime?: any | null, participantsCount: number, maxParticipants?: number | null, targetParticipants?: number | null, sportIds: Array<number>, chat?: { __typename?: 'ChatInfoType', id: string, type: ChatKind } | null, host?: { __typename?: 'EventHostType', id: string, name?: string | null, avatarUrl?: string | null } | null }> } };

export type NotificationsQueryVariables = Exact<{
  params?: InputMaybe<GetNotificationsInput>;
}>;


export type NotificationsQuery = { __typename?: 'Query', notifications: { __typename?: 'NotificationConnection', totalCount: number, hasMore: boolean, items: Array<{ __typename?: 'NotificationType', id: string, kind: NotificationKind, text: string, payload: any, isRead: boolean, readAt?: any | null, createdAt: any }> } };

export type UnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadNotificationsCountQuery = { __typename?: 'Query', unreadNotificationsCount: number };

export type SportsQueryVariables = Exact<{ [key: string]: never; }>;


export type SportsQuery = { __typename?: 'Query', sports: Array<{ __typename?: 'SportType', id: number, name: string, iconUrl: string }> };

export type GoalsQueryVariables = Exact<{ [key: string]: never; }>;


export type GoalsQuery = { __typename?: 'Query', goals: Array<{ __typename?: 'GoalType', id: number, name: string, iconUrl: string }> };

export type SimilarProfilesQueryVariables = Exact<{
  filters: ProfileFilterInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type SimilarProfilesQuery = { __typename?: 'Query', similarProfiles: Array<{ __typename?: 'ProfileType', userId: string, name: string, age: number, avatarUrl: string, bio: string, distance?: number | null, gender: string, locationName?: string | null, languages: Array<string>, height?: number | null, weight?: number | null, goals: Array<{ __typename?: 'GoalType', id: number, name: string, iconUrl: string }>, sports: Array<{ __typename?: 'SportType', id: number, name: string, iconUrl: string }> }> };

export type MyRecentMatchesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyRecentMatchesQuery = { __typename?: 'Query', myRecentMatches: Array<{ __typename?: 'UnstartedMatchType', chatId: string, matcherProfile: { __typename?: 'ProfileType', userId: string, name: string, age: number, avatarUrl: string, bio: string, distance?: number | null, locationName?: string | null, goals: Array<{ __typename?: 'GoalType', id: number, name: string, iconUrl: string }>, sports: Array<{ __typename?: 'SportType', id: number, name: string, iconUrl: string }> } }> };

export type MyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MyProfileQuery = { __typename?: 'Query', myProfile?: { __typename?: 'ProfileType', userId: string, name: string, age: number, gender: string, chronotype: Chronotype, avatarUrl: string, bio: string, height?: number | null, weight?: number | null, languages: Array<string>, locationName?: string | null, updatedAt: any, goals: Array<{ __typename?: 'GoalType', id: number, name: string, iconUrl: string }>, sports: Array<{ __typename?: 'SportType', id: number, name: string }> } | null };

export type NotificationReceivedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NotificationReceivedSubscription = { __typename?: 'Subscription', notificationReceived: { __typename?: 'NotificationType', id: string, kind: NotificationKind, text: string, payload: any, isRead: boolean, readAt?: any | null, createdAt: any } };

export const UserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UserFragment, unknown>;
export const AuthTokensFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthTokens"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TokensType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessTokenExpire"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshTokenExpire"}}]}}]} as unknown as DocumentNode<AuthTokensFragment, unknown>;
export const AuthResultFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthResult"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tokens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthTokens"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthTokens"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TokensType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessTokenExpire"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshTokenExpire"}}]}}]} as unknown as DocumentNode<AuthResultFragment, unknown>;
export const NotificationTypeFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationType"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<NotificationTypeFragment, unknown>;
export const ProfileFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProfileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"chronotype"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"languages"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ProfileFragmentFragment, unknown>;
export const EventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<EventFragment, unknown>;
export const NearbyEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NearbyEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NearbyEventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distanceKm"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<NearbyEventFragment, unknown>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthResult"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthTokens"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TokensType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessTokenExpire"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshTokenExpire"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthResult"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tokens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthTokens"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const GoogleAuthUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"googleAuthUrl"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"googleAuthUrl"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]} as unknown as DocumentNode<GoogleAuthUrlMutation, GoogleAuthUrlMutationVariables>;
export const AuthGoogleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"authGoogle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GoogleAuthInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authGoogle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthResult"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthTokens"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TokensType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessTokenExpire"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshTokenExpire"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthResult"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tokens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthTokens"}}]}}]}}]} as unknown as DocumentNode<AuthGoogleMutation, AuthGoogleMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthResult"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthTokens"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TokensType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessTokenExpire"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshTokenExpire"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthResult"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthResult"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tokens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthTokens"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const SendMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"sendMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chatId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<SendMessageMutation, SendMessageMutationVariables>;
export const MarkAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"markAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkAsReadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<MarkAsReadMutation, MarkAsReadMutationVariables>;
export const CreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventData"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventData"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventData"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<CreateEventMutation, CreateEventMutationVariables>;
export const JoinEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"joinEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<JoinEventMutation, JoinEventMutationVariables>;
export const CancelEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"cancelEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<CancelEventMutation, CancelEventMutationVariables>;
export const UpdateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventData"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventData"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventData"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<UpdateEventMutation, UpdateEventMutationVariables>;
export const UpdateLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateLocationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProfileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"chronotype"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"languages"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateLocationMutation, UpdateLocationMutationVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"markNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkNotificationReadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationId"}},{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"markAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const CreateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProfileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"chronotype"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"languages"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateProfileMutation, CreateProfileMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProfileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"chronotype"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"languages"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const SwipeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"swipe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isLiked"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"swipe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"targetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isLiked"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isLiked"}}}]}]}}]} as unknown as DocumentNode<SwipeMutation, SwipeMutationVariables>;
export const RefreshTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"refreshTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshTokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthTokens"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthTokens"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TokensType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"accessTokenExpire"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshTokenExpire"}}]}}]} as unknown as DocumentNode<RefreshTokensMutation, RefreshTokensMutationVariables>;
export const MyChatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"myChats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myChats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasUnreadMessages"}},{"kind":"Field","name":{"kind":"Name","value":"otherUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastMessage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"senderEmail"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}},{"kind":"Field","name":{"kind":"Name","value":"participants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"isHost"}}]}}]}}]}}]} as unknown as DocumentNode<MyChatsQuery, MyChatsQueryVariables>;
export const ChatInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"chatInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chatInfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"profile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<ChatInfoQuery, ChatInfoQueryVariables>;
export const ChatMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"chatMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetMessagesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chatMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chatId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"nextCursorId"}},{"kind":"Field","name":{"kind":"Name","value":"nextCursorSentAt"}}]}}]}}]} as unknown as DocumentNode<ChatMessagesQuery, ChatMessagesQueryVariables>;
export const EventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"events"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"params"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetEventsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"params"},"value":{"kind":"Variable","name":{"kind":"Name","value":"params"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<EventsQuery, EventsQueryVariables>;
export const EventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"event"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}},{"kind":"Field","name":{"kind":"Name","value":"isHost"}},{"kind":"Field","name":{"kind":"Name","value":"isParticipant"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<EventQuery, EventQueryVariables>;
export const NearbyEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"nearbyEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"10"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nearbyEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NearbyEvent"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NearbyEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NearbyEventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distanceKm"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}}]} as unknown as DocumentNode<NearbyEventsQuery, NearbyEventsQueryVariables>;
export const MyEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"myEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"params"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetMyEventsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"params"},"value":{"kind":"Variable","name":{"kind":"Name","value":"params"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"privacy"}},{"kind":"Field","name":{"kind":"Name","value":"imageFileName"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lon"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"participantsCount"}},{"kind":"Field","name":{"kind":"Name","value":"maxParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"targetParticipants"}},{"kind":"Field","name":{"kind":"Name","value":"sportIds"}},{"kind":"Field","name":{"kind":"Name","value":"chat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MyEventsQuery, MyEventsQueryVariables>;
export const NotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"notifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"params"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetNotificationsInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"params"},"value":{"kind":"Variable","name":{"kind":"Name","value":"params"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationType"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const UnreadNotificationsCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"unreadNotificationsCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationsCount"}}]}}]} as unknown as DocumentNode<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>;
export const SportsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}}]}}]} as unknown as DocumentNode<SportsQuery, SportsQueryVariables>;
export const GoalsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}}]}}]} as unknown as DocumentNode<GoalsQuery, GoalsQueryVariables>;
export const SimilarProfilesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"similarProfiles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileFilterInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"similarProfiles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"languages"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}}]}}]} as unknown as DocumentNode<SimilarProfilesQuery, SimilarProfilesQueryVariables>;
export const MyRecentMatchesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"myRecentMatches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myRecentMatches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chatId"}},{"kind":"Field","name":{"kind":"Name","value":"matcherProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyRecentMatchesQuery, MyRecentMatchesQueryVariables>;
export const MyProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"myProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProfileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"chronotype"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"languages"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyProfileQuery, MyProfileQueryVariables>;
export const NotificationReceivedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"notificationReceived"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationReceived"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationType"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationType"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<NotificationReceivedSubscription, NotificationReceivedSubscriptionVariables>;