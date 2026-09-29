import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { BottomNav } from './components/BottomNav'
import { RecordGate } from './components/RecordGate'
import { RequireAuth, PublicOnly } from './components/SessionGate'
import { useSession } from './session/store'
import { Begin } from './pages/Begin'
import { DayComplete } from './pages/DayComplete'
import { Direction } from './pages/Direction'
import { Identity } from './pages/Identity'
import { Journey } from './pages/Journey'
import { Path } from './pages/Path'
import { Profile } from './pages/Profile'
import { Progress } from './pages/Progress'
import { Register } from './pages/Register'
import { SignIn } from './pages/SignIn'
import { Today } from './pages/Today'

export default function App() {
  const bootstrap = useSession((state) => state.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path="/" element={<SignIn />} />
          <Route path="/sign-in" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<RecordGate />}>
            <Route path="/begin" element={<Begin />} />
            <Route path="/identity" element={<Identity />} />
            <Route path="/direction" element={<Direction />} />
            <Route path="/path" element={<Path />} />
            <Route element={<BottomNav />}>
              <Route path="/today" element={<Today />} />
              <Route path="/journey" element={<Journey />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/day-complete" element={<DayComplete />} />
          </Route>
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
