"use client";

import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from "@apollo/client";

const apiUrl = process.env.NODE_ENV === "production" && typeof window !== "undefined" ? `${window.location.origin}/graphql` : `https://${process.env.NEXT_PUBLIC_URL}/graphql`;

const httpLink = new HttpLink({
    uri: apiUrl,
});

const authApollo = new ApolloClient({
  ssrMode: false,
  link: httpLink,
  cache: new InMemoryCache(),
});

export default authApollo;
