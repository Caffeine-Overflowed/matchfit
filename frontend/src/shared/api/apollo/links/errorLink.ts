import {ErrorLink} from "@apollo/client/link/error";
import {CombinedGraphQLErrors} from "@apollo/client/errors";
import {useUserStore} from "@/shared/store/user-store";
import {toast} from "sonner";
import {errorTranslation} from "@/shared/constants/errorTranslation";

export const errorLink = new ErrorLink(({ error }) => {
    if (CombinedGraphQLErrors.is(error)) {
        for (const err of error.errors) {
            const isUnauthorized =
                err.extensions?.code === "UNAUTHENTICATED" ||
                err.message.toLowerCase().includes("unauthorized");

            if (isUnauthorized) {
                useUserStore.getState().unAuthorize();
                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login";
                }
                break;
            }
            toast.info(errorTranslation[err.message])
            console.log(err)
        }
    } else {
        // Network or other error
        const errorMessage = error?.message?.toLowerCase() || "";
        if (errorMessage.includes("unauthorized") || errorMessage.includes("401")) {
            useUserStore.getState().unAuthorize();
            if (typeof window !== "undefined") {
                window.location.href = "/auth/login";
            }
        }
    }
});
