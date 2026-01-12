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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where: { isPublished: true },
        include: {
          author: {
            select: { id: true, loginId: true, name: true },
          },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.notice.count({ where: { isPublished: true } }),
    ])

    return NextResponse.json({
      notices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching notices:", error)
    return NextResponse.json(
      { error: "Failed to fetch notices" },
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

    // Only master can create notices
    if (session.user.role !== "MASTER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, isPinned, isPublished } = body

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        isPinned: isPinned || false,
        isPublished: isPublished !== false,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error("Error creating notice:", error)
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    )
  }
}


