import type {AuthResultFragment, AuthTokensFragment, UserType} from "@/shared/api";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

export interface UserStoreState {
    user: UserType | undefined;
    tokens: AuthTokensFragment | undefined;
    isAuthorized: boolean;
    authorize: (authInfo: AuthResultFragment) => void;
    unAuthorize: () => void;
    refreshTokens: (tokensInfo: AuthTokensFragment) => void;
}

const localStorage = typeof window !== "undefined" ? window.localStorage : undefined;

// Synchronous initialization from localStorage
const persistedState = (() => {
    try {
        return JSON.parse(localStorage?.getItem("user-storage") || "{}").state || {};
    } catch {
        return {};
    }
})();

export const useUserStore = create<UserStoreState>()(
    persist(
        (set) => ({
            tokens: persistedState.tokens || undefined,
            user: persistedState.user || undefined,
            isAuthorized: persistedState.isAuthorized || false,
            authorize: (authInfo: AuthResultFragment) => {
                authInfo.tokens.refreshTokenExpire = new Date(
                  new Date().getTime() + authInfo.tokens.refreshTokenExpire * 1000,
                ).getTime();
                authInfo.tokens.accessTokenExpire = new Date(
                  new Date().getTime() + authInfo.tokens.accessTokenExpire * 1000,
                ).getTime();

                set(() => ({
                    tokens: authInfo.tokens,
                    user: authInfo.user,
                    isAuthorized: true,
                }));
            },
            unAuthorize: () => {
                set(() => ({
                    isAuthorized: false,
                    tokens: undefined,
                    user: undefined,
                }));
            },
            refreshTokens: (tokensInfo: AuthTokensFragment) => {
                tokensInfo.refreshTokenExpire = new Date(
                  new Date().getTime() + tokensInfo.refreshTokenExpire * 1000,
                ).getTime();
                tokensInfo.accessTokenExpire = new Date(
                  new Date().getTime() + tokensInfo.accessTokenExpire * 1000,
                ).getTime();

                set(() => ({
                    tokens: tokensInfo
                }));
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage as Storage),
        },
    ),
);
