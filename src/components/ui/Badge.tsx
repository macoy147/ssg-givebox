import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'available' | 'claimed' | 'archived' | 'category'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'available', children, ...props }, ref) => {
    const variants = {
      available: 'bg-green-100 text-green-700',
      claimed: 'bg-gray-100 text-gray-600',
      archived: 'bg-orange-100 text-orange-700',
      category: 'bg-[var(--primary)]/10 text-[var(--primary)]'
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
