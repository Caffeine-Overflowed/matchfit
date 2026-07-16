import {ErrorLink} from "@apollo/client/link/error";
import {CombinedGraphQLErrors} from "@apollo/client/errors";
import {Observable} from "@apollo/client";
import {useUserStore} from "@/shared/store/user-store";
import {toast} from "sonner";
import {errorTranslation} from "@/shared/constants/errorTranslation";
import {GraphQLErrorCode} from "@/shared/api/types";
import {refreshTokenWithDedup} from "@/shared/api/apollo/links/authLink";

const forceLogout = () => {
    useUserStore.getState().unAuthorize();
    if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
    }
};

export const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (CombinedGraphQLErrors.is(error)) {
        // Exact match only: substring matching would also hit domain errors
        // like "unauthorized_to_send" / "unauthorized_to_delete".
        const isUnauthorized = error.errors.some(
            (err) =>
                err.extensions?.code === "UNAUTHENTICATED" ||
                err.message === GraphQLErrorCode.UNAUTHORIZED,
        );

        if (isUnauthorized) {
            // Try one refresh-and-retry before nuking the session: the access
            // token may have expired server-side while still looking valid to
            // authLink's client-clock check.
            if (!operation.getContext().retriedAfterRefresh) {
                operation.setContext({ retriedAfterRefresh: true });

                return new Observable((observer) => {
                    let subscription: { unsubscribe: () => void } | undefined;
                    let cancelled = false;

                    refreshTokenWithDedup()
                        .then((accessToken) => {
                            if (cancelled) return;
                            if (!accessToken) {
                                forceLogout();
                                observer.error(error);
                                return;
                            }
                            // authLink re-runs on retry and attaches the new token.
                            subscription = forward(operation).subscribe(observer);
                        })
                        .catch(() => {
                            forceLogout();
                            observer.error(error);
                        });

                    return () => {
                        cancelled = true;
                        subscription?.unsubscribe();
                    };
                });
            }

            forceLogout();
            return;
        }

        for (const err of error.errors) {
            toast.info(errorTranslation[err.message])
            console.log(err)
        }
    } else {
        // Network or other error
        const errorMessage = error?.message || "";
        if (errorMessage.includes("401")) {
            forceLogout();
        }
    }
});
