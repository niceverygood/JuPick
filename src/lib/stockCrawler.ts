// 한국 주식 실시간 데이터 크롤링 서비스
// 네이버 금융 API 활용

export interface StockData {
  symbol: string           // 종목코드
  name: string            // 종목명
  currentPrice: number    // 현재가
  change: number          // 전일대비
  changePercent: number   // 등락률
  volume: number          // 거래량
  marketCap: number       // 시가총액
  high: number            // 고가
  low: number             // 저가
  open: number            // 시가
  previousClose: number   // 전일종가
  per: number             // PER
  pbr: number             // PBR
  eps: number             // EPS
  foreignRatio: number    // 외국인비율
  tradingValue: number    // 거래대금
}

export interface MarketIndex {
  name: string
  value: number
  change: number
  changePercent: number
}

// 네이버 금융에서 주식 정보 가져오기
export async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    // 네이버 금융 API
    const response = await fetch(
      `https://m.stock.naver.com/api/stock/${symbol}/basic`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    )

    if (!response.ok) {
      console.error(`Failed to fetch stock ${symbol}:`, response.status)
      return null
    }

    const data = await response.json()
    
    return {
      symbol: data.stockItemId || symbol,
      name: data.stockName || "",
      currentPrice: parseFloat(data.closePrice) || 0,
      change: parseFloat(data.compareToPreviousClosePrice) || 0,
      changePercent: parseFloat(data.fluctuationsRatio) || 0,
      volume: parseInt(data.accumulatedTradingVolume) || 0,
      marketCap: parseInt(data.marketValue) || 0,
      high: parseFloat(data.highPrice) || 0,
      low: parseFloat(data.lowPrice) || 0,
      open: parseFloat(data.openPrice) || 0,
      previousClose: parseFloat(data.previousClosePrice) || 0,
      per: parseFloat(data.per) || 0,
      pbr: parseFloat(data.pbr) || 0,
      eps: parseFloat(data.eps) || 0,
      foreignRatio: parseFloat(data.foreignerHoldingRatio) || 0,
      tradingValue: parseInt(data.accumulatedTradingValue) || 0,
    }
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error)
    return null
  }
}

// 주요 종목 리스트 (시가총액 상위 + 주요 섹터별)
export const MAJOR_STOCKS = [
  // 대형주
  { symbol: "005930", name: "삼성전자", sector: "반도체" },
  { symbol: "000660", name: "SK하이닉스", sector: "반도체" },
  { symbol: "373220", name: "LG에너지솔루션", sector: "2차전지" },
  { symbol: "207940", name: "삼성바이오로직스", sector: "바이오" },
  { symbol: "005380", name: "현대차", sector: "자동차" },
  { symbol: "000270", name: "기아", sector: "자동차" },
  { symbol: "006400", name: "삼성SDI", sector: "2차전지" },
  { symbol: "051910", name: "LG화학", sector: "화학/2차전지" },
  { symbol: "035420", name: "NAVER", sector: "IT/플랫폼" },
  { symbol: "035720", name: "카카오", sector: "IT/플랫폼" },
  { symbol: "005490", name: "POSCO홀딩스", sector: "철강" },
  { symbol: "055550", name: "신한지주", sector: "금융" },
  { symbol: "105560", name: "KB금융", sector: "금융" },
  { symbol: "096770", name: "SK이노베이션", sector: "에너지/2차전지" },
  { symbol: "034730", name: "SK", sector: "지주" },
  
  // 중형 성장주
  { symbol: "247540", name: "에코프로비엠", sector: "2차전지" },
  { symbol: "086520", name: "에코프로", sector: "2차전지" },
  { symbol: "003670", name: "포스코퓨처엠", sector: "2차전지" },
  { symbol: "042700", name: "한미반도체", sector: "반도체장비" },
  { symbol: "000990", name: "DB하이텍", sector: "반도체" },
  { symbol: "402340", name: "SK스퀘어", sector: "지주/투자" },
  { symbol: "012330", name: "현대모비스", sector: "자동차부품" },
  { symbol: "066570", name: "LG전자", sector: "전자" },
  { symbol: "003550", name: "LG", sector: "지주" },
  { symbol: "028260", name: "삼성물산", sector: "건설/지주" },
  
  // 바이오/헬스케어
  { symbol: "068270", name: "셀트리온", sector: "바이오" },
  { symbol: "091990", name: "셀트리온헬스케어", sector: "바이오" },
  { symbol: "326030", name: "SK바이오팜", sector: "바이오" },
  { symbol: "302440", name: "SK바이오사이언스", sector: "바이오" },
  { symbol: "145720", name: "덴티움", sector: "의료기기" },
  
  // IT/소프트웨어
  { symbol: "263750", name: "펄어비스", sector: "게임" },
  { symbol: "259960", name: "크래프톤", sector: "게임" },
  { symbol: "036570", name: "엔씨소프트", sector: "게임" },
  { symbol: "251270", name: "넷마블", sector: "게임" },
  { symbol: "377300", name: "카카오페이", sector: "핀테크" },
  
  // 엔터테인먼트
  { symbol: "352820", name: "하이브", sector: "엔터" },
  { symbol: "041510", name: "에스엠", sector: "엔터" },
  { symbol: "122870", name: "와이지엔터테인먼트", sector: "엔터" },
  { symbol: "035900", name: "JYP Ent.", sector: "엔터" },
  
  // 방산/조선
  { symbol: "012450", name: "한화에어로스페이스", sector: "방산" },
  { symbol: "047810", name: "한국항공우주", sector: "방산" },
  { symbol: "329180", name: "HD현대중공업", sector: "조선" },
  { symbol: "009540", name: "HD한국조선해양", sector: "조선" },
]

// 여러 종목 데이터 병렬 조회
export async function fetchMultipleStocks(symbols: string[]): Promise<Map<string, StockData>> {
  const results = new Map<string, StockData>()
  
  // 5개씩 배치로 처리 (API 부하 방지)
  const batchSize = 5
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    const promises = batch.map(symbol => fetchStockData(symbol))
    const batchResults = await Promise.all(promises)
    
    batchResults.forEach((data, index) => {
      if (data) {
        results.set(batch[index], data)
      }
    })
    
    // 배치 간 딜레이
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  return results
}

// 시장 지수 가져오기
export async function fetchMarketIndices(): Promise<MarketIndex[]> {
  try {
    const indices = [
      { code: "KOSPI", name: "KOSPI" },
      { code: "KOSDAQ", name: "KOSDAQ" },
    ]
    
    const results: MarketIndex[] = []
    
    for (const index of indices) {
      const response = await fetch(
        `https://m.stock.naver.com/api/index/${index.code}/basic`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        results.push({
          name: index.name,
          value: parseFloat(data.closePrice) || 0,
          change: parseFloat(data.compareToPreviousClosePrice) || 0,
          changePercent: parseFloat(data.fluctuationsRatio) || 0,
        })
      }
    }
    
    return results
  } catch (error) {
    console.error("Error fetching market indices:", error)
    return []
  }
}

// 상승률 상위 종목
export async function fetchTopGainers(limit: number = 10): Promise<StockData[]> {
  try {
    const response = await fetch(
      `https://m.stock.naver.com/api/stocks/up?page=1&pageSize=${limit}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    return (data.stocks || []).map((stock: any) => ({
      symbol: stock.itemCode,
      name: stock.stockName,
      currentPrice: parseFloat(stock.closePrice) || 0,
      change: parseFloat(stock.compareToPreviousClosePrice) || 0,
      changePercent: parseFloat(stock.fluctuationsRatio) || 0,
      volume: parseInt(stock.accumulatedTradingVolume) || 0,
      marketCap: 0,
      high: 0,
      low: 0,
      open: 0,
      previousClose: 0,
      per: 0,
      pbr: 0,
      eps: 0,
      foreignRatio: 0,
      tradingValue: 0,
    }))
  } catch (error) {
    console.error("Error fetching top gainers:", error)
    return []
  }
}

// 하락률 상위 종목
export async function fetchTopLosers(limit: number = 10): Promise<StockData[]> {
  try {
    const response = await fetch(
      `https://m.stock.naver.com/api/stocks/down?page=1&pageSize=${limit}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    return (data.stocks || []).map((stock: any) => ({
      symbol: stock.itemCode,
      name: stock.stockName,
      currentPrice: parseFloat(stock.closePrice) || 0,
      change: parseFloat(stock.compareToPreviousClosePrice) || 0,
      changePercent: parseFloat(stock.fluctuationsRatio) || 0,
      volume: parseInt(stock.accumulatedTradingVolume) || 0,
      marketCap: 0,
      high: 0,
      low: 0,
      open: 0,
      previousClose: 0,
      per: 0,
      pbr: 0,
      eps: 0,
      foreignRatio: 0,
      tradingValue: 0,
    }))
  } catch (error) {
    console.error("Error fetching top losers:", error)
    return []
  }
}

// 거래량 상위 종목
export async function fetchMostActive(limit: number = 10): Promise<StockData[]> {
  try {
    const response = await fetch(
      `https://m.stock.naver.com/api/stocks/volume?page=1&pageSize=${limit}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    return (data.stocks || []).map((stock: any) => ({
      symbol: stock.itemCode,
      name: stock.stockName,
      currentPrice: parseFloat(stock.closePrice) || 0,
      change: parseFloat(stock.compareToPreviousClosePrice) || 0,
      changePercent: parseFloat(stock.fluctuationsRatio) || 0,
      volume: parseInt(stock.accumulatedTradingVolume) || 0,
      marketCap: 0,
      high: 0,
      low: 0,
      open: 0,
      previousClose: 0,
      per: 0,
      pbr: 0,
      eps: 0,
      foreignRatio: 0,
      tradingValue: 0,
    }))
  } catch (error) {
    console.error("Error fetching most active:", error)
    return []
  }
}

// 전체 시장 데이터 수집 (AI 분석용)
export interface MarketSnapshot {
  timestamp: string
  indices: MarketIndex[]
  majorStocks: StockData[]
  topGainers: StockData[]
  topLosers: StockData[]
  mostActive: StockData[]
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const [indices, topGainers, topLosers, mostActive] = await Promise.all([
    fetchMarketIndices(),
    fetchTopGainers(15),
    fetchTopLosers(15),
    fetchMostActive(15),
  ])
  
  // 주요 종목 데이터
  const majorSymbols = MAJOR_STOCKS.slice(0, 30).map(s => s.symbol)
  const majorStocksMap = await fetchMultipleStocks(majorSymbols)
  const majorStocks = Array.from(majorStocksMap.values())
  
  return {
    timestamp: new Date().toISOString(),
    indices,
    majorStocks,
    topGainers,
    topLosers,
    mostActive,
  }
}

// AI 분석용 데이터 포맷팅
export function formatMarketDataForAI(snapshot: MarketSnapshot): string {
  let report = `📊 한국 주식 시장 실시간 데이터 (${new Date(snapshot.timestamp).toLocaleString("ko-KR")})\n\n`
  
  // 시장 지수
  report += "【시장 지수】\n"
  snapshot.indices.forEach(idx => {
    const arrow = idx.change >= 0 ? "▲" : "▼"
    report += `${idx.name}: ${idx.value.toLocaleString()} (${arrow}${Math.abs(idx.changePercent).toFixed(2)}%)\n`
  })
  
  // 주요 종목 현황
  report += "\n【주요 종목 현황】\n"
  snapshot.majorStocks.slice(0, 20).forEach(stock => {
    const arrow = stock.change >= 0 ? "▲" : "▼"
    report += `${stock.name}(${stock.symbol}): ${stock.currentPrice.toLocaleString()}원 (${arrow}${Math.abs(stock.changePercent).toFixed(2)}%) 거래량:${(stock.volume/10000).toFixed(0)}만주\n`
  })
  
  // 상승률 TOP 10
  report += "\n【상승률 TOP 10】\n"
  snapshot.topGainers.slice(0, 10).forEach((stock, i) => {
    report += `${i+1}. ${stock.name}(${stock.symbol}): ${stock.currentPrice.toLocaleString()}원 (+${stock.changePercent.toFixed(2)}%)\n`
  })
  
  // 하락률 TOP 10
  report += "\n【하락률 TOP 10】\n"
  snapshot.topLosers.slice(0, 10).forEach((stock, i) => {
    report += `${i+1}. ${stock.name}(${stock.symbol}): ${stock.currentPrice.toLocaleString()}원 (${stock.changePercent.toFixed(2)}%)\n`
  })
  
  // 거래량 TOP 10
  report += "\n【거래량 TOP 10】\n"
  snapshot.mostActive.slice(0, 10).forEach((stock, i) => {
    const arrow = stock.change >= 0 ? "▲" : "▼"
    report += `${i+1}. ${stock.name}(${stock.symbol}): ${(stock.volume/10000).toFixed(0)}만주 (${arrow}${Math.abs(stock.changePercent).toFixed(2)}%)\n`
  })
  
  return report
}

