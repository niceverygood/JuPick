import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const notice = await prisma.notice.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, loginId: true, name: true },
        },
      },
    })

    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 })
    }

    return NextResponse.json(notice)
  } catch (error) {
    console.error("Error fetching notice:", error)
    return NextResponse.json(
      { error: "Failed to fetch notice" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only master can update notices
    if (session.user.role !== "MASTER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const notice = await prisma.notice.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(notice)
  } catch (error) {
    console.error("Error updating notice:", error)
    return NextResponse.json(
      { error: "Failed to update notice" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only master can delete notices
    if (session.user.role !== "MASTER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    await prisma.notice.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notice:", error)
    return NextResponse.json(
      { error: "Failed to delete notice" },
      { status: 500 }
    )
  }
}


