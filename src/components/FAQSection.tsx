'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { FAQItem } from '@/types'

const faqs: FAQItem[] = [
  {
    question: "Who can claim items from SSG GiveBox?",
    answer: "All bonafide students of CTU Daanbantayan Campus can claim items. Just bring your valid CTU ID when you visit the SSG Office."
  },
  {
    question: "When can I pick up items?",
    answer: "Items are available for pickup every Friday during office hours (8:00 AM - 9:00 PM). Check the announcements for specific times each week."
  },
  {
    question: "How many items can I claim?",
    answer: "To ensure fair distribution, students can typically claim 1-2 items per visit depending on availability. This may vary based on the type and quantity of donations."
  },
  {
    question: "Where is the pickup location?",
    answer: "Items can be claimed beside the SSG Office. Look for the GiveBox sign!"
  },
  {
    question: "How do I know when new items are available?",
    answer: "New items are announced every Thursday. You can check this website, follow our social media, or subscribe to notifications using the bell icon."
  },
  {
    question: "Can I donate items?",
    answer: "Yes! We welcome donations of school supplies, clothing, hygiene products, and food items. Please bring donations to the SSG Office during office hours."
  },
  {
    question: "What happens to unclaimed items?",
    answer: "Unclaimed items remain available for the following weeks. Items that are not claimed after several weeks may be donated to other charitable organizations."
  },
  {
    question: "Is there a limit to how often I can claim items?",
    answer: "Students can visit every Friday to check available items. We encourage taking only what you need so others can benefit too."
  }
]

function FAQItemComponent({ faq, isOpen, onClick }: { faq: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-b border-[var(--border)] last:border-0"
    >
      <button
        onClick={onClick}
        className="w-full py-4 flex items-center justify-between gap-4 text-left hover:text-[var(--accent)] transition-colors"
      >
        <span className="font-medium text-[var(--text-primary)] text-sm sm:text-base pr-4">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <HelpCircle className="w-7 h-7 text-white" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base">
            Everything you need to know about SSG GiveBox
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-4 sm:p-6"
        >
          {faqs.map((faq, index) => (
            <FAQItemComponent
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-[var(--text-secondary)]">
            Still have questions?{' '}
            <span className="text-[var(--accent)] font-medium">
              Visit the SSG Office or message us on Facebook
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
