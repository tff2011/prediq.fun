import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";
import { GTMWrapper } from "@/components/GTMWrapper";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PredIQ.fun - Mercados de Previsão",
  description: "Plataforma de mercados de previsão descentralizados",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html suppressHydrationWarning>
      <head>
        <GTMWrapper gtmId={gtmId} position="head" />
      </head>
      <body className={`${inter.className} min-h-screen`} suppressHydrationWarning>
        <GTMWrapper gtmId={gtmId} position="body" />
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors closeButton />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
