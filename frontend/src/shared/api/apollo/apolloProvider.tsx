"use client";

import type { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/shared/api/apollo/apolloClient";

interface Props {
    children: ReactNode;
}

const ApolloWrapper = ({ children }: Props) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloWrapper;
