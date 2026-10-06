import { create } from 'zustand'

import { api, installSessionHandlers } from '../api/client'
import { useRecord } from '../data/record'
import type { SessionStatus, User } from './types'

type SessionState = {
  status: SessionStatus
  user: User | null
  closedMessage: string | null
  bootstrap: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signInWithGoogle: (idToken: string) => Promise<void>
  setPassword: (password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<User>
  clearClosedMessage: () => void
}

async function postUser(path: string, body: unknown): Promise<User> {
  return api<User>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const useSession = create<SessionState>((set) => ({
  status: 'unknown',
  user: null,
  closedMessage: null,

  bootstrap: async () => {
    try {
      const user = await api<User>('/api/me')
      set({ status: 'authenticated', user, closedMessage: null })
    } catch {
      if (useSession.getState().status === 'unknown') {
        set({ status: 'anonymous', user: null })
      }
    }
  },

  register: async (email, password) => {
    const user = await postUser('/api/auth/register', { email, password })
    useRecord.getState().forget()
    set({ status: 'authenticated', user, closedMessage: null })
  },

  login: async (email, password) => {
    const user = await postUser('/api/auth/login', { email, password })
    useRecord.getState().forget()
    set({ status: 'authenticated', user, closedMessage: null })
  },

  signInWithGoogle: async (idToken) => {
    const user = await postUser('/api/auth/google', { id_token: idToken })
    useRecord.getState().forget()
    set({ status: 'authenticated', user, closedMessage: null })
  },

  setPassword: async (password) => {
    await api<void>('/api/auth/password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    set((state) => ({
      user: state.user ? { ...state.user, has_password: true } : null,
    }))
  },

  logout: async () => {
    await api<void>('/api/auth/logout', { method: 'POST' })
    useRecord.getState().forget()
    set({ status: 'anonymous', user: null, closedMessage: null })
  },

  refreshUser: async () => {
    const user = await api<User>('/api/me')
    set({ status: 'authenticated', user, closedMessage: null })
    return user
  },

  clearClosedMessage: () => set({ closedMessage: null }),
}))

installSessionHandlers({
  onUnauthenticated() {
    useRecord.getState().forget()
    useSession.setState({ status: 'anonymous', user: null })
  },
  onClosed(message) {
    useRecord.getState().forget()
    useSession.setState({ status: 'anonymous', user: null, closedMessage: message })
  },
})
