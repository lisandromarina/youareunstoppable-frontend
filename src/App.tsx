import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { BottomNav } from './components/BottomNav'
import { RequireAuth, PublicOnly } from './components/SessionGate'
import { useSession } from './session/store'
import { Becoming } from './pages/Becoming'
import { FutureSelf } from './pages/FutureSelf'
import { Onboarding } from './pages/Onboarding'
import { Profile } from './pages/Profile'
import { Pro } from './pages/Pro'
import { Register } from './pages/Register'
import { SignIn } from './pages/SignIn'
import { Transformation } from './pages/Transformation'
import { CheckIn, Coach, DayComplete, Journal, Journey, Today } from './pages/places'
import { useDay } from './data/day'

export default function App() {
  const bootstrap = useSession((state) => state.bootstrap)
  const toast = useDay((state) => state.toast)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <BrowserRouter>
      {toast ? (
        <p className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-bold whitespace-nowrap text-primary-foreground">
          {toast}
        </p>
      ) : null}
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path="/" element={<Onboarding />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/becoming" element={<Becoming />} />
          <Route path="/future-self" element={<FutureSelf />} />
          <Route path="/transformation" element={<Transformation />} />
          <Route element={<BottomNav />}>
            <Route path="/today" element={<Today />} />
            <Route path="/journey" element={<Journey />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/day-complete" element={<DayComplete />} />
          <Route path="/pro" element={<Pro />} />
        </Route>
        <Route path="*" element={<Fallback />} />
      </Routes>
    </BrowserRouter>
  )
}

function Fallback() {
  const status = useSession((state) => state.status)
  if (status === 'unknown') return null
  return <Navigate to={status === 'authenticated' ? '/today' : '/'} replace />
}
