import Link from 'next/link'

export default function EducatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <span className="text-xl font-semibold text-gray-900">Caseflow</span>
          <span className="block text-xs text-gray-500 mt-0.5">Educator</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/educator/cases" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            My Cases
          </Link>
          <Link href="/educator/create" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Create Case
          </Link>
          <Link href="/educator/analytics" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Analytics
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  )
}
