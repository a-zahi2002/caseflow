import Link from 'next/link'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <span className="text-xl font-semibold text-gray-900">Caseflow</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/cases" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Cases
          </Link>
          <Link href="/progress" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            My Progress
          </Link>
          <Link href="/discussions" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Discussions
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  )
}
