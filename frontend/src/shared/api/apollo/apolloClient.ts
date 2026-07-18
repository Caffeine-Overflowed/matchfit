"use client";

import { ApolloClient, ApolloLink, InMemoryCache, split } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { useUserStore } from "@/shared/store/user-store";
import authLink, { getAccessTokenPromise } from "@/shared/api/apollo/links/authLink";
import {errorLink} from "@/shared/api/apollo/links/errorLink";

const isProd = process.env.NODE_ENV === "production";
const apiUrl = `${isProd ? "https" : "http"}://${process.env.NEXT_PUBLIC_URL}/graphql`;
const wsUrl = `${isProd ? "wss" : "ws"}://${process.env.NEXT_PUBLIC_URL}/graphql`;

/*
const authLink = new ApolloLink((operation, forward) => {
    const accessToken = useUserStore.getState().tokens?.accessToken;

    operation.setContext(({ headers = {} }) => ({
        headers: {
            ...headers,
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
    }));

    return forward(operation);
});
*/

const uploadLink = new UploadHttpLink({
    uri: apiUrl,
});

const httpLink = ApolloLink.from([errorLink, authLink, uploadLink]);

// graphql-ws opens a browser WebSocket, so the socket link is only built on
// the client; during SSR every operation stays on HTTP.
const link =
    typeof window === "undefined"
        ? httpLink
        : split(
              ({ query }) => {
                  const definition = getMainDefinition(query);
                  return (
                      definition.kind === "OperationDefinition" &&
                      definition.operation === "subscription"
                  );
              },
              new GraphQLWsLink(
                  createClient({
                      url: wsUrl,
                      connectionParams: async () => {
                          const accessToken = await getAccessTokenPromise();
                          return accessToken
                              ? { Authorization: `Bearer ${accessToken}` }
                              : {};
                      },
                  }),
              ),
              httpLink,
          );

export const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

