import { create } from 'zustand'
import type { SessionUser } from '@/types'

interface AuthState {
  user: SessionUser | null
  isLoading: boolean
  setUser: (user: SessionUser | null) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))


