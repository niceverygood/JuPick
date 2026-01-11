import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMarketSnapshot, formatMarketDataForAI } from "@/lib/stockCrawler"

// 시장 데이터 캐시
let marketCache: { data: any; expiry: number } | null = null
const CACHE_DURATION = 60 * 1000 // 1분 캐시

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 캐시 확인
    if (marketCache && marketCache.expiry > Date.now()) {
      return NextResponse.json(marketCache.data)
    }

    // 새 데이터 가져오기
    const snapshot = await getMarketSnapshot()
    const formattedData = formatMarketDataForAI(snapshot)

    const responseData = {
      ...snapshot,
      formatted: formattedData,
    }

    // 캐시 저장
    marketCache = {
      data: responseData,
      expiry: Date.now() + CACHE_DURATION,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching market data:", error)
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    )
  }
}

