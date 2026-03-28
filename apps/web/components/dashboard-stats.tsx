import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
}

export function StatCard({ label, value, subValue, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground">{value}</h3>
          {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
        </div>
        <div className="p-2 bg-gray-50 rounded-lg border border-border text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trend.positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          )}>
            {trend.positive ? '+' : '-'}{trend.value}
          </span>
          <span className="text-xs text-gray-400">from last week</span>
        </div>
      )}
    </div>
  )
}
