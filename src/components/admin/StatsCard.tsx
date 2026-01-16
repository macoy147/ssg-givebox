import { Card } from '@/components/ui'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'red' | 'orange' | 'yellow' | 'green'
}

export function StatsCard({ title, value, icon: Icon, trend, color = 'red' }: StatsCardProps) {
  const colors = {
    red: 'from-[var(--primary)] to-[var(--primary-light)]',
    orange: 'from-[var(--secondary)] to-[var(--secondary-light)]',
    yellow: 'from-[var(--accent)] to-[var(--accent-light)]',
    green: 'from-emerald-500 to-emerald-400'
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-secondary)] text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm font-medium mt-2',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-gradient-to-br', colors[color])}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  )
}
