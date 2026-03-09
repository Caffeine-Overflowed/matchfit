import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ApolloWrapper from "@/shared/api/apollo/apolloProvider";
import { RouteProvider } from "@/shared/providers/router-provider";
import { Theme } from "@/shared/providers/theme";
import { Toaster } from "@/shared/components/toaster";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
    title: "MatchFit",
    description: "Find your companion for sports and activities with MatchFit",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased`}>
                <ApolloWrapper>
                    <RouteProvider>
                        <Theme>
                            {children}
                            <Toaster />
                        </Theme>
                    </RouteProvider>
                </ApolloWrapper>
            </body>
        </html>
    );
}
