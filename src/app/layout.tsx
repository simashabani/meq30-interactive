import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.meq-30.com"),
  title: "MEQ-30 Assessment & Psychedelic Mystical Experience Journal",
  description:
    "Explore and assess mystical experiences using the MEQ-30 (Mystical Experience Questionnaire). A research-based private journal for psychedelic researchers and individuals.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "MEQ-30 Assessment & Psychedelic Mystical Experience Journal",
    description:
      "Explore and assess mystical experiences using the MEQ-30 (Mystical Experience Questionnaire). A research-based private journal for psychedelic researchers and individuals.",
    type: "website",
    url: "https://app.meq-30.com",
    siteName: "MEQ-30",
  },
  twitter: {
    card: "summary_large_image",
    title: "MEQ-30 Assessment & Psychedelic Mystical Experience Journal",
    description:
      "Explore and assess mystical experiences using the MEQ-30 (Mystical Experience Questionnaire). A research-based private journal for psychedelic researchers and individuals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
