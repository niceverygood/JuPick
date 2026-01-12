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
    const loginId = searchParams.get("loginId")

    if (!loginId) {
      return NextResponse.json(
        { error: "loginId is required" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { loginId },
      select: { id: true },
    })

    return NextResponse.json({ available: !existingUser })
  } catch (error) {
    console.error("Error checking login ID:", error)
    return NextResponse.json(
      { error: "Failed to check login ID" },
      { status: 500 }
    )
  }
}


