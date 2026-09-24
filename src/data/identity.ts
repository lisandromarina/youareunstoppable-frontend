import { create } from 'zustand'

export const TRAITS = [
  'Disciplined',
  'Strong',
  'Focused',
  'Confident',
  'Healthy',
  'Successful',
  'Creative',
  'Fearless',
] as const

type IdentityState = {
  traits: string[]
  futureSelf: string
  toggleTrait: (trait: string) => void
  setFutureSelf: (value: string) => void
}

export const useIdentity = create<IdentityState>((set) => ({
  traits: [],
  futureSelf: '',
  toggleTrait: (trait) =>
    set((state) => ({
      traits: state.traits.includes(trait)
        ? state.traits.filter((item) => item !== trait)
        : [...state.traits, trait],
    })),
  setFutureSelf: (futureSelf) => set({ futureSelf }),
}))
