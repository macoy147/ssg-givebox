'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Search items..." }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur()
        setIsFocused(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md mx-auto"
    >
      <motion.div
        animate={{
          width: isFocused ? '100%' : '90%',
          boxShadow: isFocused 
            ? '0 0 0 2px var(--accent), 0 10px 40px -10px rgba(0,0,0,0.2)' 
            : '0 4px 20px -5px rgba(0,0,0,0.1)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative rounded-2xl overflow-hidden mx-auto"
      >
        <div className="absolute inset-0 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl" />
        
        <div className="relative flex items-center">
          <motion.div
            animate={{ scale: isFocused ? 1.1 : 1 }}
            className="absolute left-4 pointer-events-none"
          >
            <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
          </motion.div>
          
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full py-3.5 pl-12 pr-12 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none text-sm sm:text-base transition-all duration-300"
          />

          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onChange('')}
                className="absolute right-3 p-1.5 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {!value && !isFocused && (
            <div className="hidden sm:flex items-center gap-1 mr-3 px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-xs">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Search hint */}
      <AnimatePresence>
        {isFocused && !value && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-2 text-center text-xs text-[var(--text-muted)]"
          >
            Type to search for items by name or description
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
