import authApollo from "@/shared/api/apollo/authApollo";
import {GraphQLErrorCode} from "@/shared/api/types";
import {useUserStore} from "@/shared/store/user-store";
import {toast} from "sonner";
import {GraphQLError} from "graphql";
import {ApolloLink, Observable} from "@apollo/client";
import {RefreshTokensDocument} from "@/shared/api";

export const getRefreshedAccessTokenPromise = async (refreshTokenStr: string) => {
    const {tokens, unAuthorize, refreshTokens} = useUserStore.getState();

    console.log("[Refresh] Starting token refresh...");

    try {
        const { data } = await authApollo.mutate({
            mutation: RefreshTokensDocument,
            variables: {data: {refreshToken: refreshTokenStr}},
        });

        const refreshTokensData = data?.refreshTokens;

        if (refreshTokensData === undefined) {
            console.warn("[Refresh] Mutation succeeded but data is empty (undefined)");
            return;
        }

        console.log("[Refresh] Tokens successfully refreshed:", {
            accessToken: !!refreshTokensData.accessToken,
            refreshToken: !!refreshTokensData.refreshToken
        });

        refreshTokens(refreshTokensData);

        return refreshTokensData.accessToken;
    } catch (error: unknown) {
        console.error("[Refresh] Mutation error:", error);

        const getGraphQLErrors = (err: unknown): readonly GraphQLError[] | undefined => {
            if (
                err &&
                typeof err === 'object' &&
                'graphQLErrors' in err &&
                Array.isArray((err as { graphQLErrors: unknown }).graphQLErrors)
            ) {
                return (err as { graphQLErrors: readonly GraphQLError[] }).graphQLErrors;
            }
            return undefined;
        };

        const gqlErrors = getGraphQLErrors(error);
        console.log("[Refresh] Extracted GraphQLErrors:", gqlErrors);

        const isUnauthenticated = (errors: readonly GraphQLError[] | undefined): boolean => {
            if (!errors) {
                console.log("[Refresh] No GraphQL errors in the error object");
                return false;
            }

            return errors.some((err) => {
                const msg = err.message;
                const isAuthErr = msg === GraphQLErrorCode.UNAUTHORIZED ||
                                 msg === GraphQLErrorCode.INVALID_REFRESH_TOKEN;

                console.log(`[Refresh] Checking message: "${msg}" -> Auth error? ${isAuthErr}`);
                return isAuthErr;
            });
        };

        const authFailed = isUnauthenticated(gqlErrors);
        console.log(`[Refresh] Unauthenticated check result: ${authFailed}`);

        if (authFailed) {
            console.warn("[Refresh] Critical auth error. Executing unAuthorize()...");
            toast.info("Authorization error");
            unAuthorize();
        } else {
            console.log("[Refresh] Error is not auth-related (possibly network or 500)");
        }

        return undefined;
    }
};

let pendingRefreshPromise: Promise<string | undefined> | null = null;

/**
 * Deduplicated token refresh.
 * If refresh is already in progress, returns the existing promise.
 * Used in both authLink and errorLink.
 */
export const refreshTokenWithDedup = (): Promise<string | undefined> => {
    const {tokens, unAuthorize} = useUserStore.getState();

    if (!tokens) {
        return Promise.resolve(undefined);
    }

    if (tokens.refreshTokenExpire < Date.now()) {
        console.log(`Refresh time expired, ${JSON.stringify(tokens)}`);
        toast.info("Authorization error");
        unAuthorize();
        return Promise.resolve(undefined);
    }

    if (!pendingRefreshPromise) {
        pendingRefreshPromise = getRefreshedAccessTokenPromise(tokens.refreshToken).finally(
            () => (pendingRefreshPromise = null),
        );
    }

    return pendingRefreshPromise;
};

const getAccessTokenPromise = (): Promise<string | undefined> => {
    const {tokens, isAuthorized, user} = useUserStore.getState();
    console.log(`tokens ${tokens}, isAuthorized ${isAuthorized}, user ${user}`)

    if (!tokens) {
        console.log("No tokens");
        return Promise.resolve(undefined);
    }

    if (tokens.accessTokenExpire > Date.now()) {
        return Promise.resolve(tokens.accessToken);
    }

    return refreshTokenWithDedup();
};

/*
const authLink = setContext(async (_, {headers}) => {
    const accessToken = await getAccessTokenPromise();
    if (!accessToken) return {headers};

    return {
        headers: {
            ...headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
    };
});*/

const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    getAccessTokenPromise()
      .then((accessToken) => {
        operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: {
            ...headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }));

        const subscriber = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });

        return () => subscriber.unsubscribe();
      })
      .catch((err: Error) => {
        observer.error(err);
      });
  });
});

export default authLink;
