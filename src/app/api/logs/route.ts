import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const userRole = session.user.role
    const userId = session.user.id

    // Build where clause
    const whereClause: Record<string, unknown> = {}

    if (userRole !== "MASTER") {
      // Get subordinate IDs
      let subordinateIds: string[] = [userId]

      if (userRole === "DISTRIBUTOR") {
        const directChildren = await prisma.user.findMany({
          where: { parentId: userId },
          select: { id: true },
        })
        const grandchildren = await prisma.user.findMany({
          where: { parentId: { in: directChildren.map((c) => c.id) } },
          select: { id: true },
        })
        subordinateIds = [
          userId,
          ...directChildren.map((c) => c.id),
          ...grandchildren.map((c) => c.id),
        ]
      } else if (userRole === "AGENCY") {
        const children = await prisma.user.findMany({
          where: { parentId: userId },
          select: { id: true },
        })
        subordinateIds = [userId, ...children.map((c) => c.id)]
      }

      whereClause.OR = [
        { creatorId: { in: subordinateIds } },
        { targetId: { in: subordinateIds } },
      ]
    }

    if (type && type !== "all") {
      whereClause.type = type
    }

    if (startDate) {
      whereClause.createdAt = {
        ...((whereClause.createdAt as object) || {}),
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      whereClause.createdAt = {
        ...((whereClause.createdAt as object) || {}),
        lte: new Date(endDate),
      }
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where: whereClause,
        include: {
          creator: {
            select: { id: true, loginId: true, name: true, role: true },
          },
          target: {
            select: { id: true, loginId: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.log.count({ where: whereClause }),
    ])

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    )
  }
}


