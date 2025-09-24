import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MKM Poster",
  description: "Magic Card Market price manager and poster desktop app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
