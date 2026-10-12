import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'

import { loadAnalytics, type Analytics, type Cohort, type CohortDay } from '../api/admin'
import { errorMessage } from '../api/client'
import { Screen } from '../components/look'
import { useSession } from '../session/store'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function Admin() {
  const user = useSession((state) => state.user)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') return
    void loadAnalytics()
      .then(setAnalytics)
      .catch((caught: unknown) => setError(errorMessage(caught)))
  }, [user?.role])

  if (user && user.role !== 'admin') return <Navigate to="/today" replace />

  return (
    <Screen className="max-w-3xl pb-16">
      <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Internal</p>
      <h1 className="mt-2 text-[32px] font-extrabold tracking-tight">Where people stop</h1>
      <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">
        Return is a later day they opened the app. Closed is that day finished. Signing up today is not a miss.
        These numbers show where people stop.
      </p>
      <Link to="/profile" className="mt-4 inline-block text-sm font-bold text-primary">
        Back to profile
      </Link>

      {error ? <p className="mt-8 text-sm font-semibold text-destructive">{error}</p> : null}
      {!analytics && !error ? <p className="mt-8 text-sm text-muted-foreground">Loading</p> : null}
      {analytics ? <Dashboard analytics={analytics} /> : null}
    </Screen>
  )
}

function Dashboard({ analytics }: { analytics: Analytics }) {
  const { overview, funnel } = analytics
  const widest = Math.max(1, ...funnel.map((step) => step.count))

  return (
    <>
      <section className="mt-10">
        <h2 className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Opened today and closed today are people. Promises completed and skipped are commitments.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Total users" value={String(overview.total_users)} />
          <Stat label="New today" value={String(overview.new_users_today)} />
          <Stat label="New, 7 days" value={String(overview.new_users_7d)} />
          <Stat label="New, 30 days" value={String(overview.new_users_30d)} />
          <Stat label="Started a path" value={String(overview.started_path)} />
          <Stat label="Days completed" value={String(overview.days_completed)} />
          <Stat label="Opened today" value={String(overview.opened_today)} />
          <Stat label="Closed today" value={String(overview.closed_today)} />
          <Stat label="Promises completed" value={String(overview.commitments_done)} />
          <Stat label="Promises skipped" value={String(overview.commitments_skipped)} />
          <Stat label="Active, last 7 days" value={String(overview.active_users)} />
          <Stat label="Returned next day" value={percent(overview.return_1d)} />
          <Stat label="Closed next day" value={percent(overview.closed_1d)} />
          <Stat label="Returned, day 3" value={percent(overview.return_3d)} />
          <Stat label="Closed, day 3" value={percent(overview.closed_3d)} />
          <Stat label="Returned, day 7" value={percent(overview.return_7d)} />
          <Stat label="Closed, day 7" value={percent(overview.closed_7d)} />
          <Stat label="Day 1 closure" value={percent(overview.day1_closure)} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Activation</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {funnel.map((step, index) => (
            <li key={step.key}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[16px] font-semibold">{step.label}</p>
                <p className="text-[20px] font-extrabold">{step.count}</p>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-empty">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(step.count / widest) * 100}%` }}
                />
              </div>
              {index > 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {percent(step.percent_of_previous)} of the previous step
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">Cohorts</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Each cell is who returned, then who closed that day. A dash means that day has not arrived.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground">
                <th className="py-2 pr-4 font-extrabold">Cohort</th>
                <th className="py-2 pr-4 font-extrabold">People</th>
                <th className="py-2 pr-4 font-extrabold">Day 1</th>
                <th className="py-2 pr-4 font-extrabold">Day 3</th>
                <th className="py-2 pr-4 font-extrabold">Day 7</th>
                <th className="py-2 font-extrabold">Day 14</th>
              </tr>
            </thead>
            <tbody>
              {analytics.cohorts.map((row) => (
                <tr key={row.date} className="border-b border-white/8">
                  <td className="py-3 pr-4 font-semibold">{cohortLabel(row)}</td>
                  <td className="py-3 pr-4">{row.size}</td>
                  <td className="py-3 pr-4">{pair(row.day_1)}</td>
                  <td className="py-3 pr-4">{pair(row.day_3)}</td>
                  <td className="py-3 pr-4">{pair(row.day_7)}</td>
                  <td className="py-3">{pair(row.day_14)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3">
      <p className="text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[26px] font-extrabold">{value}</p>
    </div>
  )
}

function percent(value: number | null): string {
  if (value == null) return '—'
  return `${value}%`
}

function pair(value: CohortDay | null): string {
  if (value == null) return '—'
  return `${percent(value.returned)} / ${percent(value.closed)}`
}

function cohortLabel(row: Cohort): string {
  const [, month, day] = row.date.split('-').map(Number)
  return `${MONTHS[(month ?? 1) - 1]} ${day}`
}
