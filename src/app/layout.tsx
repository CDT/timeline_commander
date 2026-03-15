import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Timeline Commander",
  description:
    "Step into the role of a historical figure and change the course of history.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("tc_locale")?.value ?? "en";

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
