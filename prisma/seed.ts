import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create Master
  const masterPassword = await bcrypt.hash("master123", 12)
  const master = await prisma.user.upsert({
    where: { loginId: "master" },
    update: {},
    create: {
      loginId: "master",
      password: masterPassword,
      name: "마스터",
      role: "MASTER",
    },
  })
  console.log("✅ Master created:", master.loginId)

  // Create Distributors
  const distPassword = await bcrypt.hash("dist123", 12)
  const dist1 = await prisma.user.upsert({
    where: { loginId: "dist_01" },
    update: {},
    create: {
      loginId: "dist_01",
      password: distPassword,
      name: "총판1",
      role: "DISTRIBUTOR",
      parentId: master.id,
      dailyRate: 100000,
    },
  })
  const dist2 = await prisma.user.upsert({
    where: { loginId: "dist_02" },
    update: {},
    create: {
      loginId: "dist_02",
      password: distPassword,
      name: "총판2",
      role: "DISTRIBUTOR",
      parentId: master.id,
      dailyRate: 150000,
    },
  })
  console.log("✅ Distributors created:", dist1.loginId, dist2.loginId)

  // Create Agencies
  const agencyPassword = await bcrypt.hash("agency123", 12)
  const agency1 = await prisma.user.upsert({
    where: { loginId: "agency_01" },
    update: {},
    create: {
      loginId: "agency_01",
      password: agencyPassword,
      name: "대행사1",
      role: "AGENCY",
      parentId: dist1.id,
    },
  })
  const agency2 = await prisma.user.upsert({
    where: { loginId: "agency_02" },
    update: {},
    create: {
      loginId: "agency_02",
      password: agencyPassword,
      name: "대행사2",
      role: "AGENCY",
      parentId: dist1.id,
    },
  })
  console.log("✅ Agencies created:", agency1.loginId, agency2.loginId)

  // Create Users
  const userPassword = await bcrypt.hash("user123", 12)
  const users = []
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { loginId: `user_${String(i).padStart(3, "0")}` },
      update: {},
      create: {
        loginId: `user_${String(i).padStart(3, "0")}`,
        password: userPassword,
        name: `유저${i}`,
        role: "USER",
        parentId: i <= 3 ? agency1.id : agency2.id,
      },
    })
    users.push(user)
  }

  // Create direct users under distributor
  for (let i = 6; i <= 8; i++) {
    const user = await prisma.user.upsert({
      where: { loginId: `user_${String(i).padStart(3, "0")}` },
      update: {},
      create: {
        loginId: `user_${String(i).padStart(3, "0")}`,
        password: userPassword,
        name: `유저${i}`,
        role: "USER",
        parentId: dist1.id,
      },
    })
    users.push(user)
  }
  console.log("✅ Users created:", users.length)

  // Create Subscriptions
  const now = new Date()
  const subscriptionsData = []

  // Active subscriptions
  for (let i = 0; i < 5; i++) {
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - Math.floor(Math.random() * 10))
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 30)

    subscriptionsData.push({
      userId: users[i].id,
      serviceType: i % 3 === 0 ? "STOCK" : i % 3 === 1 ? "COIN" : "COIN_FUTURES",
      status: "ACTIVE",
      startDate,
      endDate,
      isFreeTest: false,
      createdById: master.id,
    })
  }

  // Expiring subscriptions (within 7 days)
  for (let i = 0; i < 3; i++) {
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 25)
    const endDate = new Date(now)
    endDate.setDate(now.getDate() + Math.floor(Math.random() * 5) + 1)

    subscriptionsData.push({
      userId: users[i + 5].id,
      serviceType: "STOCK",
      status: "ACTIVE",
      startDate,
      endDate,
      isFreeTest: false,
      createdById: master.id,
    })
  }

  // Free test subscription
  const freeTestStart = new Date(now)
  const freeTestEnd = new Date(now)
  freeTestEnd.setDate(now.getDate() + 7)
  subscriptionsData.push({
    userId: users[0].id,
    serviceType: "COIN",
    status: "ACTIVE",
    startDate: freeTestStart,
    endDate: freeTestEnd,
    isFreeTest: true,
    createdById: master.id,
  })

  // Bulk create subscriptions
  await prisma.subscription.deleteMany({})
  await prisma.subscription.createMany({
    data: subscriptionsData as any,
  })
  console.log("✅ Subscriptions created:", subscriptionsData.length)

  // Create sample notices
  await prisma.notice.deleteMany({})
  await prisma.notice.createMany({
    data: [
      {
        title: "🎉 JUPICK 서비스 오픈 안내",
        content:
          "안녕하세요. JUPICK 자동매매 관리 플랫폼이 오픈했습니다.\n\n주요 기능:\n- 주식/코인/코인선물 자동매매 구독 관리\n- 계층별 회원 관리 (총판/대행사/유저)\n- 정산 내역 자동 계산\n\n문의사항은 관리자에게 연락해주세요.",
        authorId: master.id,
        isPinned: true,
        isPublished: true,
      },
      {
        title: "📋 이용 약관 변경 안내",
        content:
          "이용 약관이 일부 변경되었습니다.\n\n변경 사항:\n1. 정산 기준일 변경\n2. 무료 테스트 정책 변경\n\n자세한 내용은 약관 페이지를 확인해주세요.",
        authorId: master.id,
        isPinned: false,
        isPublished: true,
      },
      {
        title: "🔧 시스템 점검 안내",
        content:
          "시스템 점검이 예정되어 있습니다.\n\n점검 일시: 매주 일요일 04:00 ~ 06:00\n점검 중에는 서비스 이용이 제한될 수 있습니다.",
        authorId: master.id,
        isPinned: false,
        isPublished: true,
      },
    ],
  })
  console.log("✅ Notices created")

  // Create sample logs
  await prisma.log.deleteMany({})
  const logsData = []

  for (const user of users.slice(0, 5)) {
    logsData.push({
      type: "USER_CREATED" as const,
      creatorId: master.id,
      targetId: user.id,
      metadata: { role: user.role, loginId: user.loginId },
    })
  }

  logsData.push({
    type: "SUBSCRIPTION_CREATED" as const,
    creatorId: master.id,
    targetId: users[0].id,
    serviceType: "STOCK" as const,
    days: 30,
  })

  logsData.push({
    type: "LOGIN" as const,
    creatorId: master.id,
    targetId: master.id,
  })

  await prisma.log.createMany({
    data: logsData,
  })
  console.log("✅ Logs created:", logsData.length)

  console.log("\n🎉 Database seeded successfully!")
  console.log("\n📋 Test Accounts:")
  console.log("   Master:      master / master123")
  console.log("   Distributor: dist_01 / dist123")
  console.log("   Agency:      agency_01 / agency123")
  console.log("   User:        user_001 / user123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

