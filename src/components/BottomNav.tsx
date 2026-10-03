import { NavLink, Outlet } from 'react-router'

import { cn } from 'cn'

const links = [
  { to: '/today', label: 'Today', mark: 'today' },
  { to: '/journey', label: 'Journey', mark: 'journey' },
  { to: '/progress', label: 'Progress', mark: 'progress' },
  { to: '/profile', label: 'Profile', mark: 'profile' },
] as const

export function BottomNav() {
  return (
    <div className="flex min-h-svh w-full flex-col">
      <div className="order-1 flex flex-1 flex-col md:order-2">
        <Outlet />
      </div>
      <nav
        className="order-2 sticky bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/90 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:static md:order-1 md:flex md:items-center md:gap-1 md:border-t-0 md:border-b md:px-8 md:py-3 lg:px-12"
        aria-label="Primary"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1.5 px-2 py-1.5 text-[10.5px] font-bold text-muted-foreground md:flex-row md:gap-2 md:rounded-xl md:px-4 md:py-2 md:text-sm',
                isActive && 'text-primary',
              )
            }
          >
            <NavMark kind={link.mark} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function NavMark({ kind }: { kind: (typeof links)[number]['mark'] }) {
  const common = {
    viewBox: '0 0 18 18',
    className: 'size-[18px]',
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
        <rect x="10.5" y="2.5" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4" />
        <rect x="2.5" y="10.5" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4" />
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
