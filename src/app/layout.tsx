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
  title: "여주 체험버스 (Yeoju EduBus) - 체험학습 버스 신청 & 정산",
  description: "여주 관내 학교들의 편리하고 신속한 체험학습 버스 신청 및 정산을 지원하는 에듀버스 서비스입니다.",
};

import GlobalHeader from "@/components/global-header";
import { getSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GlobalHeader session={session} />
        {children}
      </body>
    </html>
  );
}

