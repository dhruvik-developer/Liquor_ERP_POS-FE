const DashboardShell = ({ sidebar, topbar, children }) => (
  <div className="min-h-screen bg-slate-100 text-slate-900">
    <div className="mx-auto flex min-h-screen max-w-[1600px]">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          {topbar}
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  </div>
)

export default DashboardShell

