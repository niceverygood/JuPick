import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "JUPICK | AI 종목추천 관리 플랫폼",
  description: "주식/코인/코인선물 AI 종목추천 서비스의 내부 정산 및 회원관리 대시보드",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster 
              position="top-right" 
              richColors 
              theme="dark"
              closeButton
            />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
