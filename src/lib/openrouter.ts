// OpenRouter AI Service
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"

interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

interface OpenRouterResponse {
  id: string
  choices: {
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function chat(
  messages: Message[],
  model: string = "anthropic/claude-3.5-sonnet"
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not configured")
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3333",
      "X-Title": "JUPICK AI Recommendations",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0]?.message?.content || ""
}

// AI 종목 추천 타입
export interface StockRecommendation {
  symbol: string
  name: string
  action: "BUY" | "SELL" | "HOLD"
  currentPrice: string
  targetPrice: string
  stopLoss: string
  confidence: number // 0-100
  reason: string
  timeframe: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  createdAt: string
}

export interface MarketAnalysis {
  serviceType: "STOCK" | "COIN" | "COIN_FUTURES"
  marketSentiment: "BULLISH" | "BEARISH" | "NEUTRAL"
  recommendations: StockRecommendation[]
  summary: string
  disclaimer: string
  generatedAt: string
}

// 주식 AI 추천 생성 (실시간 데이터 기반)
export async function generateStockRecommendations(marketData?: string): Promise<MarketAnalysis> {
  const systemPrompt = `당신은 전문 주식 애널리스트입니다. 한국 주식 시장(KOSPI, KOSDAQ)에 대한 매수/매도 추천을 제공합니다.

실시간 시장 데이터를 분석하여 정확한 투자 추천을 제공해야 합니다.

다음 JSON 형식으로만 응답하세요:
{
  "marketSentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "summary": "시장 전반 분석 요약 (2-3문장, 제공된 데이터 기반)",
  "recommendations": [
    {
      "symbol": "종목코드 (예: 005930)",
      "name": "종목명 (예: 삼성전자)",
      "action": "BUY" | "SELL" | "HOLD",
      "currentPrice": "현재가 (실제 데이터 기반, 예: 72,500원)",
      "targetPrice": "목표가 (현재가 대비 적절한 목표, 예: 85,000원)",
      "stopLoss": "손절가 (현재가 대비 적절한 손절선, 예: 68,000원)",
      "confidence": 신뢰도 (0-100 숫자),
      "reason": "추천 이유 (데이터 기반 구체적 분석, 1-2문장)",
      "timeframe": "투자 기간 (예: 단기 1-2주, 중기 1-3개월)",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}

5-7개의 종목을 추천해주세요. 반드시 제공된 실시간 데이터의 종목과 가격을 참고하세요.
상승률 상위 종목 중 추가 상승 여력이 있는 종목, 
하락 후 반등 가능성이 있는 종목, 
거래량 급증 종목 등 다양한 관점에서 분석하세요.`

  const userPrompt = marketData 
    ? `아래는 현재 한국 주식 시장의 실시간 데이터입니다. 이 데이터를 분석하여 매수/매도 추천을 제공해주세요.

${marketData}

위 실시간 데이터를 기반으로:
1. 시장 전반의 분위기를 분석하고
2. 매수 추천 종목 (상승 모멘텀, 저평가, 기술적 반등 기대)
3. 매도/관망 추천 종목 (과열, 차익실현 권고)
을 선별해주세요.`
    : `오늘의 한국 주식 시장 AI 종목 추천을 생성해주세요. 현재 시장 상황을 고려하여 매수/매도 추천을 제공해주세요.`

  try {
    const response = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      serviceType: "STOCK",
      marketSentiment: parsed.marketSentiment,
      recommendations: parsed.recommendations.map((rec: any) => ({
        ...rec,
        createdAt: new Date().toISOString(),
      })),
      summary: parsed.summary,
      disclaimer: "본 추천은 AI가 실시간 시장 데이터를 분석하여 생성한 참고 자료입니다. 투자 결정은 본인의 판단에 따라 신중하게 하시기 바랍니다. 투자 손실에 대한 책임은 투자자 본인에게 있습니다.",
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Stock recommendation error:", error)
    throw error
  }
}

// 코인 AI 추천 생성
export async function generateCoinRecommendations(): Promise<MarketAnalysis> {
  const systemPrompt = `당신은 전문 암호화폐 애널리스트입니다. 주요 암호화폐에 대한 매수/매도 추천을 제공합니다.

다음 JSON 형식으로만 응답하세요:
{
  "marketSentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "summary": "시장 전반 분석 요약 (2-3문장)",
  "recommendations": [
    {
      "symbol": "심볼 (예: BTC)",
      "name": "코인명 (예: 비트코인)",
      "action": "BUY" | "SELL" | "HOLD",
      "currentPrice": "현재가 (예: $67,500)",
      "targetPrice": "목표가 (예: $75,000)",
      "stopLoss": "손절가 (예: $62,000)",
      "confidence": 신뢰도 (0-100 숫자),
      "reason": "추천 이유 (1-2문장)",
      "timeframe": "투자 기간 (예: 단기 1-2주, 중기 1-3개월)",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}

3-5개의 코인을 추천해주세요.`

  const userPrompt = `오늘의 암호화폐 시장 AI 종목 추천을 생성해주세요. 비트코인, 이더리움 등 주요 코인에 대한 매수/매도 추천을 제공해주세요.`

  try {
    const response = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      serviceType: "COIN",
      marketSentiment: parsed.marketSentiment,
      recommendations: parsed.recommendations.map((rec: any) => ({
        ...rec,
        createdAt: new Date().toISOString(),
      })),
      summary: parsed.summary,
      disclaimer: "본 추천은 AI가 생성한 참고 자료이며, 투자 결정은 본인의 판단에 따라 신중하게 하시기 바랍니다. 암호화폐는 가격 변동성이 크므로 각별한 주의가 필요합니다.",
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Coin recommendation error:", error)
    throw error
  }
}

// 코인 선물 AI 추천 생성
export async function generateFuturesRecommendations(): Promise<MarketAnalysis> {
  const systemPrompt = `당신은 전문 암호화폐 선물 트레이더입니다. 코인 선물 거래에 대한 롱/숏 포지션 추천을 제공합니다.

다음 JSON 형식으로만 응답하세요:
{
  "marketSentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "summary": "시장 전반 분석 요약 (2-3문장)",
  "recommendations": [
    {
      "symbol": "심볼 (예: BTCUSDT)",
      "name": "선물명 (예: 비트코인 무기한 선물)",
      "action": "BUY" | "SELL",
      "currentPrice": "진입가 (예: $67,500)",
      "targetPrice": "목표가/청산가 (예: $72,000)",
      "stopLoss": "손절가 (예: $65,000)",
      "confidence": 신뢰도 (0-100 숫자),
      "reason": "추천 이유 (포지션: 롱/숏, 레버리지 권장 포함)",
      "timeframe": "포지션 유지 기간 (예: 1-3일)",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}

3-5개의 선물 포지션을 추천해주세요. BUY는 롱포지션, SELL은 숏포지션을 의미합니다.`

  const userPrompt = `오늘의 코인 선물 AI 포지션 추천을 생성해주세요. 비트코인, 이더리움 등 주요 코인 선물에 대한 롱/숏 포지션 추천을 제공해주세요.`

  try {
    const response = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      serviceType: "COIN_FUTURES",
      marketSentiment: parsed.marketSentiment,
      recommendations: parsed.recommendations.map((rec: any) => ({
        ...rec,
        createdAt: new Date().toISOString(),
      })),
      summary: parsed.summary,
      disclaimer: "본 추천은 AI가 생성한 참고 자료입니다. 선물 거래는 높은 레버리지로 인해 원금 손실 위험이 큽니다. 반드시 자신의 리스크 허용 범위 내에서 거래하시기 바랍니다.",
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Futures recommendation error:", error)
    throw error
  }
}

