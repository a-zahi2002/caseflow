import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <span className="text-xl font-semibold text-gray-900">Caseflow</span>
          <span className="block text-xs text-gray-500 mt-0.5">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin/users" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Users
          </Link>
          <Link href="/admin/moderation" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Content Queue
          </Link>
          <Link href="/admin/settings" className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Settings
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  )
}
