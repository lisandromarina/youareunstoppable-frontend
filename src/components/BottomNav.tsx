import { NavLink, Outlet } from 'react-router'

import { cn } from 'cn'

import { ReleaseNote } from './ReleaseNote'

const links = [
  { to: '/today', label: 'Today', mark: 'today' },
  { to: '/journey', label: 'Journey', mark: 'journey' },
  { to: '/progress', label: 'Progress', mark: 'progress' },
  { to: '/profile', label: 'Profile', mark: 'profile' },
] as const

export function BottomNav() {
  return (
    <div className="flex min-h-svh w-full flex-col lg:flex-row">
      <aside className="order-2 sticky bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl lg:order-1 lg:top-0 lg:bottom-auto lg:flex lg:h-svh lg:w-60 lg:shrink-0 lg:flex-col lg:self-start lg:border-t-0 lg:border-r lg:border-white/8 lg:bg-background lg:px-5 lg:py-7 lg:backdrop-blur-none">
        <p className="mb-8 hidden text-[11px] font-extrabold tracking-[0.2em] text-muted-foreground uppercase lg:block">
          YouAreUnstoppable
        </p>
        <nav
          className="grid grid-cols-4 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:flex lg:flex-1 lg:flex-col lg:gap-1 lg:p-0"
          aria-label="Primary"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1.5 px-2 py-1.5 text-[10.5px] font-bold text-muted-foreground lg:w-fit lg:flex-row lg:gap-3 lg:rounded-xl lg:px-3.5 lg:py-2.5 lg:text-[15px]',
                  isActive && 'text-primary lg:bg-card',
                )
              }
            >
              <NavMark kind={link.mark} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <ReleaseNote variant="line" className="mt-auto hidden lg:block" />
      </aside>
      <div className="order-1 flex min-w-0 flex-1 flex-col lg:order-2">
        <Outlet />
      </div>
    </div>
  )
}

function NavMark({ kind }: { kind: (typeof links)[number]['mark'] }) {
  const common = {
    viewBox: '0 0 18 18',
    className: 'size-[18px] lg:size-5',
    'aria-hidden': true as const,
  }

  if (kind === 'today') {
    return (
      <svg {...common}>
        <circle cx="9" cy="9" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="9" cy="9" r="2.2" fill="currentColor" />
      </svg>
    )
  }

  if (kind === 'journey') {
    return (
      <svg {...common}>
        <path d="M9 3.5v11" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="4" r="1.6" fill="currentColor" />
        <circle cx="9" cy="9" r="1.6" fill="currentColor" />
        <circle cx="9" cy="14" r="1.6" fill="currentColor" />
      </svg>
    )
  }

  if (kind === 'progress') {
    return (
      <svg {...common}>
        <rect x="2.5" y="2.5" width="5" height="5" rx="1.2" fill="currentColor" />
        <rect x="10.5" y="2.5" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.45" />
        <rect x="2.5" y="10.5" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.45" />
        <rect x="10.5" y="10.5" width="5" height="5" rx="1.2" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <circle cx="9" cy="6.1" r="2.35" fill="currentColor" />
      <path
        d="M4.4 15.1c.85-2.55 2.45-3.8 4.6-3.8s3.75 1.25 4.6 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
