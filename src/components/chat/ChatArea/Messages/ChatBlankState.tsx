'use client'

import { motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import React from 'react'
import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'

const SAMPLE_PROMPTS = [
  {
    id: 1,
    text: 'Analyze vehicle utilization trends',
    category: 'Analytics'
  },
  {
    id: 2,
    text: 'Generate performance report',
    category: 'Reports'
  },
  {
    id: 3,
    text: 'Compare HRS data year over year',
    category: 'Analysis'
  },
  {
    id: 4,
    text: 'Summarize key insights from Excel',
    category: 'Data'
  },
  {
    id: 5,
    text: 'Create visualization for trends',
    category: 'Visualization'
  },
  {
    id: 6,
    text: 'Extract metrics from spreadsheets',
    category: 'Processing'
  },
  {
    id: 7,
    text: 'Identify performance bottlenecks',
    category: 'Optimization'
  },
  {
    id: 8,
    text: 'Generate automated insights',
    category: 'AI Analysis'
  }
]

const firstRow = SAMPLE_PROMPTS.slice(0, SAMPLE_PROMPTS.length / 2)
const secondRow = SAMPLE_PROMPTS.slice(SAMPLE_PROMPTS.length / 2)

const PromptCard = ({
  text,
  category
}: {
  text: string
  category: string
}) => {
  return (
    <figure
      className={cn(
        'relative h-full w-64 cursor-pointer overflow-hidden rounded-xl p-2 transition-all duration-200',
        'border-border bg-background-secondary hover:bg-accent'
      )}
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {category}
        </span>
        <blockquote className="text-sm font-medium text-primary">
          {text}
        </blockquote>
      </div>
    </figure>
  )
}

const ChatBlankState = () => {
  return (
    <section
      className="font-geist relative flex min-h-screen w-full flex-col items-center justify-center text-center"
      aria-label="Welcome message"
    >
      {/* Background noise overlay */}

      <div className="relative z-10 flex max-w-3xl flex-col gap-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-[600] tracking-tight"
        >
          <div className="flex items-center justify-center gap-x-2 whitespace-nowrap font-medium">
              <div className="translate-x-3 transition-transform duration-1000 hover:rotate-[405deg] relative">
                <Icon type="gemini" size="lg" className="relative z-10" />
              </div>
            <div className="translate-y-3 rotate-45 transition-transform duration-1000 hover:rotate-[405deg]">
              <Icon type="gemini" size="lg" />
            </div>
            <span className="flex items-center font-[600]">IntelliChat</span>
            {/* <span className="inline-flex translate-y-[10px] scale-125 items-center transition-transform duration-200 hover:rotate-6">
          <Link
          href={EXTERNAL_LINKS.agno}
          target="_blank"
          rel="noopener"
          className="cursor-pointer"
          >
          <Icon type="agno-tag" size="default" />
          </Link>
        </span>
        <span className="flex items-center font-[600]">
          Agent UI, built with
        </span>
        <span className="inline-flex translate-y-[5px] scale-125 items-center">
          <div className="relative ml-2 h-[40px] w-[90px]">
          {TECH_ICONS.map((icon) => (
            <motion.div
            key={icon.type}
            className={`absolute ${icon.position} top-0`}
            style={{ zIndex: icon.zIndex }}
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
            animate={hoveredIcon === icon.type ? 'hover' : 'exit'}
            onHoverStart={() => setHoveredIcon(icon.type)}
            onHoverEnd={() => setHoveredIcon(null)}
            >
            <Link
              href={icon.link}
              target="_blank"
              rel="noopener"
              className="relative block cursor-pointer"
            >
              <div>
              <Icon type={icon.type} size="default" />
              </div>
              <motion.div
              className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 transform whitespace-nowrap rounded bg-neutral-800 px-2 py-1 text-xs text-primary"
              variants={tooltipVariants}
              initial="hidden"
              animate={
                hoveredIcon === icon.type ? 'visible' : 'hidden'
              }
              >
              {icon.name}
              </motion.div>
            </Link>
            </motion.div>
          ))}
          </div>
        </span> */}
          </div>
          {/* <p>For the full experience, visit the AgentOS</p> */}
        </motion.h1>
        {/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center gap-4"
      >
        <ActionButton
        href={EXTERNAL_LINKS.documentation}
        variant="primary"
        text="GO TO DOCS"
        />
        <ActionButton href={EXTERNAL_LINKS.agenOS} text="VISIT AGENTOS" />
      </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="relative mt-8 flex w-full flex-col items-center justify-center overflow-hidden"
        >
          <h2 className="text-muted mb-6 text-sm font-medium uppercase tracking-wider">
            An Intelligent Agent for all you needs.
          </h2>
          <div className="w-full">
            <Marquee pauseOnHover className="[--duration:25s]">
              {firstRow.map((prompt) => (
                <PromptCard key={prompt.id} {...prompt} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:25s]">
              {secondRow.map((prompt) => (
                <PromptCard key={prompt.id} {...prompt} />
              ))}
            </Marquee>
          </div>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
        </motion.div>
      </div>
    </section>
  )
}

export default ChatBlankState
