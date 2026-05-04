import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoveRevi - 時間が証明する、本当の価値",
  description: "購入・体験から1日以上経過した後にのみ投稿できるレビューSNS。「まだ使ってる」が、最高のレビューである。",
  keywords: ["レビュー", "熟成レビュー", "長期レビュー", "愛用品", "LoveRevi"],
  authors: [{ name: "LoveRevi" }],
  openGraph: {
    title: "LoveRevi - 時間が証明する、本当の価値",
    description: "購入・体験から1日以上経過した後にのみ投稿できるレビューSNS。「まだ使ってる」が、最高のレビューである。",
    url: "https://lovereview.vercel.app",
    siteName: "LoveRevi",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://lovereview.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "LoveRevi - 時間が証明する、本当の価値",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoveRevi - 時間が証明する、本当の価値",
    description: "購入・体験から1日以上経過した後にのみ投稿できるレビューSNS",
    images: ["https://lovereview.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}