// Generated GraphQL types - run `npm run codegen` to regenerate
export * from "./graphql";
export * from "./types";

// Temporary types - will be replaced by generated types after codegen
export type UserType = {
    id: string;
    email: string;
    createdAt: string;
};

export type AuthenticateType = {
    user: UserType;
    accessToken: string;
};
