import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth, canManageUser } from "@/lib/auth"
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

    // Check if user can access this user
    const canAccess = session.user.role === "MASTER" || 
      await canManageUser(session.user.id, id)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, loginId: true, name: true, role: true },
        },
        children: {
          select: { id: true, loginId: true, name: true, role: true },
        },
        subscriptions: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
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

    const { id } = await params
    const body = await req.json()

    // Check if user can manage this user
    const canAccess = session.user.role === "MASTER" || 
      await canManageUser(session.user.id, id)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { name, password, dailyRate, memo, isActive } = body

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (memo !== undefined) updateData.memo = memo
    if (isActive !== undefined) updateData.isActive = isActive
    
    // Only master can update dailyRate
    if (dailyRate !== undefined && session.user.role === "MASTER") {
      updateData.dailyRate = dailyRate
    }

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
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

    const { id } = await params

    // Check if user can manage this user
    const canAccess = session.user.role === "MASTER" || 
      await canManageUser(session.user.id, id)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if user has children
    const childCount = await prisma.user.count({
      where: { parentId: id },
    })

    if (childCount > 0) {
      return NextResponse.json(
        { error: "하위 계정이 있는 사용자는 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    // Get user info for log
    const user = await prisma.user.findUnique({
      where: { id },
      select: { loginId: true, role: true },
    })

    // Delete user (cascades to subscriptions)
    await prisma.user.delete({
      where: { id },
    })

    // Create log
    await prisma.log.create({
      data: {
        type: "USER_DELETED",
        creatorId: session.user.id,
        metadata: { loginId: user?.loginId, role: user?.role },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}

