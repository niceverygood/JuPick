import { NextRequest, NextResponse } from "next/server"
import { auth, canManageUser } from "@/lib/auth"
import prisma from "@/lib/prisma"

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

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      select: { userId: true, serviceType: true, endDate: true },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      )
    }

    // Check if user can manage this user
    const canAccess = session.user.role === "MASTER" || 
      await canManageUser(session.user.id, subscription.userId)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { endDate, status } = body

    const updateData: Record<string, unknown> = {}

    if (endDate !== undefined) {
      updateData.endDate = new Date(endDate)
      
      // Log extension
      const oldEndDate = subscription.endDate
      const newEndDate = new Date(endDate)
      const extensionDays = Math.ceil(
        (newEndDate.getTime() - oldEndDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (extensionDays > 0) {
        await prisma.log.create({
          data: {
            type: "SUBSCRIPTION_EXTENDED",
            creatorId: session.user.id,
            targetId: subscription.userId,
            serviceType: subscription.serviceType,
            days: extensionDays,
          },
        })
      }
    }

    if (status !== undefined) {
      updateData.status = status
      
      if (status === "EXPIRED") {
        await prisma.log.create({
          data: {
            type: "SUBSCRIPTION_EXPIRED",
            creatorId: session.user.id,
            targetId: subscription.userId,
            serviceType: subscription.serviceType,
          },
        })
      }
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json(
      { error: "Failed to update subscription" },
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

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      )
    }

    // Check if user can manage this user
    const canAccess = session.user.role === "MASTER" || 
      await canManageUser(session.user.id, subscription.userId)
    
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.subscription.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subscription:", error)
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    )
  }
}

