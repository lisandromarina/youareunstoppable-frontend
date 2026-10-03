import { releaseDate, version } from '../../package.json'

import { cn } from 'cn'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function writtenDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const name = months[month - 1]
  if (!year || !name || !day) return iso
  return `${day} ${name} ${year}`
}

export function ReleaseNote({ className }: { className?: string }) {
  const year = releaseDate.slice(0, 4)
  return (
    <div className={cn('text-[13px] leading-relaxed text-muted-foreground', className)}>
      <p>
        Release <span className="font-semibold text-foreground/80">{version}</span>, from {writtenDate(releaseDate)}.
      </p>
      <p className="mt-1">© {year} YouAreUnstoppable. All rights reserved.</p>
    </div>
  )
}
