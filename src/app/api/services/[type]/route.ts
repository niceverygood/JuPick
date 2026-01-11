import { NextRequest, NextResponse } from "next/server"
import { ServiceType } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const SERVICE_TYPE_MAP: Record<string, ServiceType> = {
  stock: "STOCK",
  coin: "COIN",
  futures: "COIN_FUTURES",
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type } = await params
    const serviceType = SERVICE_TYPE_MAP[type]

    if (!serviceType) {
      return NextResponse.json(
        { error: "Invalid service type" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const userRole = session.user.role
    const userId = session.user.id

    // Get subordinate IDs
    let subordinateIds: string[] = []

    if (userRole === "MASTER") {
      const allUsers = await prisma.user.findMany({ select: { id: true } })
      subordinateIds = allUsers.map((u) => u.id)
    } else if (userRole === "DISTRIBUTOR") {
      const directChildren = await prisma.user.findMany({
        where: { parentId: userId },
        select: { id: true },
      })
      const grandchildren = await prisma.user.findMany({
        where: { parentId: { in: directChildren.map((c) => c.id) } },
        select: { id: true },
      })
      subordinateIds = [...directChildren, ...grandchildren].map((u) => u.id)
    } else if (userRole === "AGENCY") {
      const children = await prisma.user.findMany({
        where: { parentId: userId },
        select: { id: true },
      })
      subordinateIds = children.map((u) => u.id)
    }

    const now = new Date()
    const sevenDays = new Date(now)
    sevenDays.setDate(now.getDate() + 7)

    // Build where clause
    const whereClause: Record<string, unknown> = {
      userId: { in: subordinateIds },
      serviceType,
    }

    if (status) {
      if (status === "active") {
        whereClause.status = "ACTIVE"
        whereClause.endDate = { gt: sevenDays }
      } else if (status === "expiring") {
        whereClause.status = "ACTIVE"
        whereClause.endDate = { gte: now, lte: sevenDays }
      } else if (status === "expired") {
        whereClause.OR = [
          { status: "EXPIRED" },
          { endDate: { lt: now } },
        ]
      } else if (status === "freeTest") {
        whereClause.isFreeTest = true
        whereClause.status = "ACTIVE"
      }
    }

    // Add search filter
    if (search) {
      const matchingUsers = await prisma.user.findMany({
        where: {
          id: { in: subordinateIds },
          OR: [
            { loginId: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      })
      whereClause.userId = { in: matchingUsers.map((u) => u.id) }
    }

    const [subscriptions, total, stats] = await Promise.all([
      prisma.subscription.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              loginId: true,
              name: true,
              role: true,
              parent: {
                select: { id: true, loginId: true, name: true },
              },
            },
          },
        },
        orderBy: { endDate: "asc" },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where: whereClause }),
      // Get stats
      Promise.all([
        // Active
        prisma.subscription.count({
          where: {
            userId: { in: subordinateIds },
            serviceType,
            status: "ACTIVE",
            endDate: { gt: sevenDays },
          },
        }),
        // Expiring
        prisma.subscription.count({
          where: {
            userId: { in: subordinateIds },
            serviceType,
            status: "ACTIVE",
            endDate: { gte: now, lte: sevenDays },
          },
        }),
        // Expired
        prisma.subscription.count({
          where: {
            userId: { in: subordinateIds },
            serviceType,
            OR: [{ status: "EXPIRED" }, { endDate: { lt: now } }],
          },
        }),
      ]),
    ])

    return NextResponse.json({
      subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        active: stats[0],
        expiring: stats[1],
        expired: stats[2],
      },
    })
  } catch (error) {
    console.error("Error fetching service subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    )
  }
}

