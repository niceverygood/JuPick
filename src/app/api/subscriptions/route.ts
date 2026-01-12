import { NextRequest, NextResponse } from "next/server"
import { auth, canManageUser } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const serviceType = searchParams.get("serviceType")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const userRole = session.user.role
    const currentUserId = session.user.id

    // Build where clause
    const whereClause: Record<string, unknown> = {}

    if (userId) {
      // Check if user can access this user's subscriptions
      const canAccess = userRole === "MASTER" || 
        await canManageUser(currentUserId, userId)
      
      if (!canAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      whereClause.userId = userId
    } else {
      // Get all accessible subscriptions
      if (userRole !== "MASTER") {
        let subordinateIds: string[] = []
        
        if (userRole === "DISTRIBUTOR") {
          const directChildren = await prisma.user.findMany({
            where: { parentId: currentUserId },
            select: { id: true },
          })
          const grandchildren = await prisma.user.findMany({
            where: { parentId: { in: directChildren.map((c) => c.id) } },
            select: { id: true },
          })
          subordinateIds = [...directChildren, ...grandchildren].map((u) => u.id)
        } else if (userRole === "AGENCY") {
          const children = await prisma.user.findMany({
            where: { parentId: currentUserId },
            select: { id: true },
          })
          subordinateIds = children.map((u) => u.id)
        }
        
        whereClause.userId = { in: subordinateIds }
      }
    }

    if (serviceType) {
      whereClause.serviceType = serviceType
    }

    if (status) {
      if (status === "expiring") {
        const now = new Date()
        const sevenDays = new Date(now)
        sevenDays.setDate(now.getDate() + 7)
        whereClause.status = "ACTIVE"
        whereClause.endDate = { gte: now, lte: sevenDays }
      } else {
        whereClause.status = status
      }
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, loginId: true, name: true, role: true },
          },
        },
        orderBy: { endDate: "asc" },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where: whereClause }),
    ])

    return NextResponse.json({
      subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, serviceType, startDate, endDate, isFreeTest } = body

    // Check if user can manage this user
    const canAccess = session.user.role === "MASTER" || 
      await canManageUser(session.user.id, userId)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Only master can create free test
    if (isFreeTest && session.user.role !== "MASTER") {
      return NextResponse.json(
        { error: "무료 테스트는 마스터만 발급할 수 있습니다." },
        { status: 403 }
      )
    }

    // Check if user already has active subscription for this service
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        serviceType,
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: "이미 해당 서비스의 활성 구독이 있습니다. 연장을 이용해주세요." },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        serviceType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "ACTIVE",
        isFreeTest: isFreeTest || false,
        createdById: session.user.id,
      },
    })

    // Calculate days
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1

    // Create log
    await prisma.log.create({
      data: {
        type: "SUBSCRIPTION_CREATED",
        creatorId: session.user.id,
        targetId: userId,
        serviceType,
        days,
        metadata: { isFreeTest },
      },
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}


