// src/lib/mockData.ts
// 플랜별 테스트용 더미 데이터 - Free 유저들이 혹하게 만드는 데이터

export const MOCK_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    stockCode: '247540',
    stockName: '에코프로비엠',
    currentPrice: 195000,
    targetPrice: 280358,
    stopLoss: 175000,
    reason: '테슬라향 공급 확대 기대. 캐파 증설로 실적 점프 전망. 2차전지 업황 개선으로 수혜 예상.',
    confidence: 92,
    category: '급등주',
    isHotStock: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rec-2',
    stockCode: '086520',
    stockName: '에코프로',
    currentPrice: 420000,
    targetPrice: 580000,
    stopLoss: 380000,
    reason: '양극재 시장 점유율 확대. ESS 수요 급증으로 신규 수주 기대. 미국 IRA 수혜주.',
    confidence: 88,
    category: '급등주',
    isHotStock: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rec-3',
    stockCode: '012450',
    stockName: '한화에어로스페이스',
    currentPrice: 180000,
    targetPrice: 245000,
    stopLoss: 165000,
    reason: '방산 수출 호조. K-9 자주포 폴란드 추가 수주 임박. 우주항공 사업 성장 기대.',
    confidence: 91,
    category: '성장주',
    isHotStock: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rec-4',
    stockCode: '000270',
    stockName: '기아',
    currentPrice: 95800,
    targetPrice: 131993,
    stopLoss: 90990,
    reason: '전기차 수출 호조로 역대 최고 실적 예상. 밸류에이션 매력 부각. EV9 판매 호조.',
    confidence: 93,
    category: '가치주',
    isHotStock: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rec-5',
    stockCode: '003670',
    stockName: '포스코퓨처엠',
    currentPrice: 298000,
    targetPrice: 413439,
    stopLoss: 277762,
    reason: '2차전지 양극재 시장 점유율 확대. 대규모 투자 발표 임박. 글로벌 배터리 업체 수주 기대.',
    confidence: 89,
    category: '급등주',
    isHotStock: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const MOCK_SIGNALS = [
  {
    id: 'sig-1',
    stockCode: '005930',
    stockName: '삼성전자',
    signalType: 'BUY' as const,
    price: 72500,
    targetPrice: 85000,
    stopLoss: 68000,
    reason: '기술적 지지선 돌파. 외국인 순매수 급증. AI 반도체 수요 증가 기대.',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
  },
  {
    id: 'sig-2',
    stockCode: '000660',
    stockName: 'SK하이닉스',
    signalType: 'BUY' as const,
    price: 180000,
    targetPrice: 210000,
    stopLoss: 170000,
    reason: 'HBM3E 공급 확대 기대감. 삼성전자 대비 밸류에이션 매력.',
    isRead: false,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40분 전
  },
  {
    id: 'sig-3',
    stockCode: '035720',
    stockName: '카카오',
    signalType: 'SELL' as const,
    price: 52800,
    targetPrice: 45000,
    stopLoss: 56000,
    reason: '규제 리스크 지속. 광고 매출 둔화 우려. 기술적 저항선 도달.',
    isRead: false,
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50분 전
  },
  {
    id: 'sig-4',
    stockCode: '005380',
    stockName: '현대차',
    signalType: 'BUY' as const,
    price: 215000,
    targetPrice: 260000,
    stopLoss: 200000,
    reason: '미국 공장 가동률 상승. 제네시스 판매 호조. 배당 매력 부각.',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1시간 전
  },
  {
    id: 'sig-5',
    stockCode: '035420',
    stockName: 'NAVER',
    signalType: 'BUY' as const,
    price: 195000,
    targetPrice: 230000,
    stopLoss: 185000,
    reason: 'AI 검색 서비스 출시 기대. 커머스 사업 성장. 일본 LINE 시너지.',
    isRead: false,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1시간 30분 전
  },
]

export const MOCK_HOT_STOCKS = [
  {
    id: 'hot-1',
    stockCode: '000270',
    stockName: '기아',
    currentPrice: 95800,
    targetPrice: 131993,
    stopLoss: 90990,
    reason: '전기차 수출 호조로 역대 최고 실적 예상. 밸류에이션 매력 부각.',
    confidence: 93,
    category: '급등주',
    isHotStock: true,
    expectedReturn: '+37.8%',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hot-2',
    stockCode: '003670',
    stockName: '포스코퓨처엠',
    currentPrice: 298000,
    targetPrice: 413439,
    stopLoss: 277762,
    reason: '2차전지 양극재 시장 점유율 확대. 대규모 투자 발표 임박.',
    confidence: 89,
    category: '급등주',
    isHotStock: true,
    expectedReturn: '+38.7%',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hot-3',
    stockCode: '009150',
    stockName: '삼성전기',
    currentPrice: 148000,
    targetPrice: 181397,
    stopLoss: 129943,
    reason: 'MLCC 업황 회복 기대. AI 서버향 수요 증가로 수혜 전망.',
    confidence: 93,
    category: '급등주',
    isHotStock: true,
    expectedReturn: '+22.6%',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hot-4',
    stockCode: '018260',
    stockName: '삼성에스디에스',
    currentPrice: 165000,
    targetPrice: 231158,
    stopLoss: 154034,
    reason: 'AI 클라우드 사업 성장. IT서비스 업황 호조 지속.',
    confidence: 93,
    category: '급등주',
    isHotStock: true,
    expectedReturn: '+40.1%',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hot-5',
    stockCode: '373220',
    stockName: 'LG에너지솔루션',
    currentPrice: 385000,
    targetPrice: 520000,
    stopLoss: 360000,
    reason: 'GM 합작공장 가동률 상승. 유럽 전기차 수요 회복.',
    confidence: 87,
    category: '급등주',
    isHotStock: true,
    expectedReturn: '+35.1%',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const MOCK_PAST_PERFORMANCE = [
  { name: '에코프로', recommendPrice: 420000, actualReturn: 16.2 },
  { name: 'POSCO홀딩스', recommendPrice: 380000, actualReturn: 12.5 },
  { name: '한화에어로스페이스', recommendPrice: 110000, actualReturn: 14.8 },
  { name: '삼성SDI', recommendPrice: 520000, actualReturn: 11.3 },
  { name: 'LG에너지솔루션', recommendPrice: 380000, actualReturn: 18.7 },
]

export const MOCK_REPORTS = [
  {
    id: 'report-1',
    title: '2026년 1월 2주차 주간 시장 전망',
    reportType: 'WEEKLY',
    reportDate: new Date().toISOString(),
    summary: '코스피 2,650~2,780 박스권 예상. 반도체·2차전지 업종 주목.',
    content: `
## 거시경제 환경
- 미국 금리 동결 기조 유지 예상
- 달러/원 환율 1,300원대 안정세
- 국내 수출 전년 대비 10% 증가 예상

## 섹터별 분석
### [반도체]
- AI 서버용 HBM 수요 지속 증가
- 삼성전자, SK하이닉스 실적 개선 기대
- 투자의견: 비중확대
    `,
    hasPremiumContent: true,
    previewText: '프리미엄 분석: AI 예측 모델 기반 다음 주 코스피 예상 범위...',
  },
]

export const MOCK_PORTFOLIO_ANALYSIS = {
  id: 'portfolio-1',
  totalValue: 52500000,
  totalProfit: 8750000,
  profitRate: 20.0,
  riskScore: 45,
  diversificationScore: 72,
  
  // 섹터별 배분 (Premium 전용)
  sectorAllocation: [
    { sector: '반도체', weight: 51.5, color: '#10b981' },
    { sector: '플랫폼', weight: 25.7, color: '#6366f1' },
    { sector: '2차전지', weight: 22.9, color: '#f59e0b' },
  ],
  
  // 벤치마크 대비 성과 (Premium 전용)
  benchmarkComparison: {
    portfolioReturn: 20.0,
    kospiReturn: 8.5,
    kosdaqReturn: 12.3,
    outperformance: 11.5,
  },
  
  // AI 리밸런싱 제안 (Premium 전용)
  rebalancingSuggestions: [
    {
      action: 'SELL',
      stock: '카카오',
      currentWeight: 10.5,
      targetWeight: 5.0,
      reason: '규제 리스크 증가, 실적 부진 예상',
      urgency: 'HIGH'
    },
    {
      action: 'BUY',
      stock: '삼성바이오로직스',
      currentWeight: 0,
      targetWeight: 10.0,
      reason: '바이오 업종 성장세, 분산투자 필요',
      urgency: 'MEDIUM'
    },
    {
      action: 'HOLD',
      stock: '삼성전자',
      currentWeight: 28.6,
      targetWeight: 25.0,
      reason: 'AI 반도체 수혜 지속, 소폭 차익실현 고려',
      urgency: 'LOW'
    }
  ],
  
  // 예상 배당 수익 (Premium 전용)
  dividendForecast: {
    annualDividend: 1250000,
    dividendYield: 2.4,
    nextPaymentDate: '2026-03-15',
    topDividendStocks: [
      { name: '삼성전자', dividend: 750000, yield: 2.1 },
      { name: 'SK하이닉스', dividend: 500000, yield: 1.8 },
    ]
  },
  
  // 세금 최적화 팁 (Premium 전용)
  taxOptimization: {
    estimatedTax: 1750000,
    savingOpportunity: 350000,
    tips: [
      '카카오 손절 시 양도차익과 상계하여 세금 절감 가능',
      'ISA 계좌 활용으로 배당소득세 절감 가능',
      '해외주식 250만원 비과세 한도 활용 권장'
    ]
  },
  
  // 위험 분석 상세 (Premium 전용)
  riskAnalysis: {
    volatility: 18.5,
    maxDrawdown: -12.3,
    sharpeRatio: 1.45,
    beta: 1.12,
    riskLevel: '중간',
    riskFactors: [
      { factor: '금리 인상', impact: 'HIGH', description: '기술주 비중이 높아 금리 민감도 높음' },
      { factor: '환율 변동', impact: 'MEDIUM', description: '수출 비중 높은 종목 다수 보유' },
      { factor: '섹터 집중', impact: 'MEDIUM', description: '반도체 섹터 과집중 리스크' },
    ]
  },
  
  suggestions: [
    '🔥 [긴급] 카카오 10% → 5%로 비중 축소 권장 (규제 리스크)',
    '💡 헬스케어/바이오 섹터 10% 신규 편입으로 분산 필요',
    '📈 현재 포트폴리오 코스피 대비 +11.5% 초과 수익 중',
    '💰 예상 연간 배당 125만원, 배당주 추가 시 200만원 가능',
    '🛡️ 현금 비중 10% 확보로 하락장 대비 권장',
  ],
  
  holdings: [
    { name: '삼성전자', code: '005930', value: 15000000, weight: 28.6, avgPrice: 68000, currentPrice: 72500, profit: 662000, profitRate: 6.6, analysis: '긍정적', recommendation: 'HOLD', targetPrice: 85000 },
    { name: 'SK하이닉스', code: '000660', value: 12000000, weight: 22.9, avgPrice: 155000, currentPrice: 180000, profit: 1935000, profitRate: 16.1, analysis: '긍정적', recommendation: 'BUY', targetPrice: 220000 },
    { name: 'NAVER', code: '035420', value: 8000000, weight: 15.2, avgPrice: 190000, currentPrice: 195000, profit: 210000, profitRate: 2.6, analysis: '중립', recommendation: 'HOLD', targetPrice: 230000 },
    { name: '카카오', code: '035720', value: 5500000, weight: 10.5, avgPrice: 58000, currentPrice: 52800, profit: -538000, profitRate: -9.0, analysis: '부정적', recommendation: 'SELL', targetPrice: 45000 },
    { name: '에코프로', code: '086520', value: 12000000, weight: 22.9, avgPrice: 380000, currentPrice: 420000, profit: 1263000, profitRate: 10.5, analysis: '긍정적', recommendation: 'BUY', targetPrice: 550000 },
  ],
  
  createdAt: new Date().toISOString(),
}

export const MOCK_CONSULTATIONS = [
  {
    id: 'consult-1',
    status: 'COMPLETED',
    question: '현재 보유 중인 삼성전자 물량을 어떻게 해야 할까요?',
    answer: '현재 삼성전자는 기술적으로 지지선 부근에 있어 추가 매수 타이밍으로 판단됩니다. 분할 매수 전략으로 평단가를 낮추시는 것을 권장드립니다.',
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expert: {
      name: '김주식',
      title: '수석 애널리스트',
      experience: '15년',
      specialty: '반도체/IT',
      rating: 4.9,
      totalConsultations: 1247,
    },
    followUpReport: {
      title: '삼성전자 투자 전략 보고서',
      summary: '분할 매수 전략 상세 가이드 및 목표가 분석',
      downloadUrl: '#',
    },
    satisfaction: 5,
  },
  {
    id: 'consult-2',
    status: 'SCHEDULED',
    question: '2차전지 관련주 중 가장 유망한 종목은?',
    answer: null,
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expert: {
      name: '박배터리',
      title: '섹터 전문가',
      experience: '12년',
      specialty: '2차전지/신재생',
      rating: 4.8,
      totalConsultations: 892,
    },
    meetingType: 'VIDEO', // VIDEO, PHONE, CHAT
    meetingLink: 'https://meet.jupick.com/consult-2',
  },
]

// Premium 전문가 상담 추가 정보
export const MOCK_EXPERT_PROFILES = [
  {
    id: 'expert-1',
    name: '김주식',
    title: '수석 애널리스트',
    photo: '/experts/kim.jpg',
    experience: '15년',
    specialty: ['반도체', 'IT', '대형주'],
    rating: 4.9,
    totalConsultations: 1247,
    successRate: 78.5,
    bio: '삼성증권 출신, 국내 대형주 분석 전문가. 반도체 업황 예측 적중률 85%',
    available: true,
    nextAvailable: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'expert-2', 
    name: '박배터리',
    title: '섹터 전문가',
    photo: '/experts/park.jpg',
    experience: '12년',
    specialty: ['2차전지', '신재생에너지', '소재'],
    rating: 4.8,
    totalConsultations: 892,
    successRate: 82.3,
    bio: 'LG에너지솔루션 IR 출신, 배터리 밸류체인 분석 1위',
    available: true,
    nextAvailable: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'expert-3',
    name: '이바이오',
    title: '헬스케어 전문가',
    photo: '/experts/lee.jpg',
    experience: '10년',
    specialty: ['바이오', '헬스케어', '제약'],
    rating: 4.7,
    totalConsultations: 654,
    successRate: 75.8,
    bio: '삼성바이오로직스 출신, 바이오텍 기업 가치평가 전문',
    available: false,
    nextAvailable: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// VIP 상담 혜택 (Premium 전용)
export const PREMIUM_CONSULTATION_BENEFITS = {
  monthlyLimit: 2,
  consultationDuration: 45, // 분
  priorityQueue: true,
  videoCallEnabled: true,
  followUpReport: true,
  directMessaging: true,
  portfolioReview: true,
  emergencySupport: true, // 긴급 상담 지원
  satisfactionGuarantee: true, // 만족 보장
}

// 플랜별 놓친 수익 계산
export function getMissedProfitData(plan: string) {
  const data = {
    FREE: {
      missedAmount: 2535000,
      proAverage: 2847000,
      freeAverage: 312000,
    },
    BASIC: {
      missedAmount: 1820000,
      proAverage: 2847000,
      basicAverage: 1027000,
    },
    PRO: {
      missedAmount: 0,
      proAverage: 2847000,
      currentAverage: 2847000,
    },
    PREMIUM: {
      missedAmount: 0,
      premiumAverage: 3250000,
      currentAverage: 3250000,
    },
  }
  return data[plan as keyof typeof data] || data.FREE
}

// 블러 카드용 예상 수익률 데이터
export const BLURRED_RETURNS = [
  '+15.8%', '+22.4%', '+18.1%', '+31.2%', '+27.5%',
  '+19.3%', '+24.7%', '+16.9%', '+28.4%', '+21.6%',
]

export function getRandomBlurredReturn() {
  return BLURRED_RETURNS[Math.floor(Math.random() * BLURRED_RETURNS.length)]
}

