"use client"

import { Badge } from "@/components/ui/badge"
import { ROLE_LABELS } from "@/lib/constants"
import type { UserRole } from "@/types"

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variant = role.toLowerCase() as "master" | "distributor" | "agency" | "user"
  
  return (
    <Badge variant={variant}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}


