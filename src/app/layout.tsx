import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyPorto — Portfolio",
  description:
    "MyPorto is a stock investment tracker with live pricing, news, and portfolios.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Server-rendered theme: honour the user's explicit choice via cookie.
  // With no cookie, no class is set and `prefers-color-scheme` decides (CSS).
  const theme = (await cookies()).get("theme")?.value;
  const themeClass = theme === "dark" ? "dark" : theme === "light" ? "light" : "";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${themeClass} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
