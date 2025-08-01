import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "PredIQ.fun - Mercados de Previsão",
  description: "Plataforma de mercados de previsão descentralizados",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TRPCReactProvider>{children}</TRPCReactProvider>
  );
}
