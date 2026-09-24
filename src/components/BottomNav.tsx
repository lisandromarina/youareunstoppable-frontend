import { NavLink, Outlet } from 'react-router'

import { cn } from 'cn'

const links = [
  { to: '/today', label: 'Today' },
  { to: '/journey', label: 'Journey' },
  { to: '/journal', label: 'Journal' },
  { to: '/profile', label: 'Profile' },
]

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
            <span className="size-[18px] rounded-md border-2 border-current" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
