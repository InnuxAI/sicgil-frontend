'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const thinkingStates = ['Thinking...', 'Analyzing...', 'Calling LLMs...']

const AgentThinkingLoader = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % thinkingStates.length)
    }, 2500) // Change text every 2.5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex items-center min-h-[24px] min-w-[140px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
          transition={{ duration: 0.4 }}
          className="absolute left-0 text-sm text-primary/60"
        >
          {thinkingStates[currentIndex].split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 0.3,
                delay: index * 0.03
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AgentThinkingLoader
