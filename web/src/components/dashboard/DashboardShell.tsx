import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, CalendarDays, Inbox, ShieldCheck } from 'lucide-react'
import { cn } from 'cn'

const navigation = [
  { to: '/dashboard/analysis', label: 'Student Analysis', icon: BarChart3 },
  { to: '/dashboard/requests', label: 'Requests', icon: Inbox },
  { to: '/dashboard/schedule', label: 'Schedule', icon: CalendarDays },
]

export function DashboardShell() {
  return (
    <div className="dashboard-theme flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface sm:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid size-8 place-items-center rounded-[10px] bg-brand-orange">
            <ShieldCheck className="size-4 text-white" />
          </span>
          <div className="leading-tight">
            <div className="text-[0.82rem] font-semibold tracking-tight text-ink">Counsellor&apos;s</div>
            <div className="text-[0.82rem] font-semibold tracking-tight text-ink">Dashboard</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-2 rounded-xl border border-transparent px-3.5 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'border-blue-200 bg-blue-50 text-brand-orange shadow-[0_2px_10px_rgba(23,105,170,0.08)]'
                    : 'text-ink-mid hover:bg-blue-50 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-2.5">
                    <Icon className={cn('size-4', isActive ? 'text-brand-orange' : 'text-ink-dim')} />
                    {label}
                  </span>
                  {isActive && (
                    <span className="grid size-4 place-items-center rounded-full border-2 border-brand-orange">
                      <span className="size-1.5 rounded-full bg-brand-orange" />
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between gap-3 px-5 py-5">
          <div className="leading-tight">
            <div className="text-[0.82rem] font-medium text-ink">Counsellor&apos;s</div>
            <div className="text-[0.82rem] font-medium text-ink">Dashboard</div>
          </div>
          <span className="grid size-9 place-items-center rounded-full border border-blue-200 bg-blue-50 text-brand-orange">
            <ShieldCheck className="size-4" />
          </span>
        </div>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** Nav that replaces the sidebar below the sm breakpoint. */
function MobileNav() {
  return (
    <nav className="sticky top-0 z-40 flex gap-1 overflow-x-auto border-b border-line bg-surface/90 px-4 py-2.5 backdrop-blur-xl sm:hidden">
      {navigation.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[0.8rem] font-medium transition-colors',
              isActive
                ? 'border-blue-200 bg-blue-50 text-brand-orange shadow-[0_2px_8px_rgba(23,105,170,0.08)]'
                : 'border-transparent text-ink-dim',
            )
          }
        >
          <Icon className="size-3.5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
