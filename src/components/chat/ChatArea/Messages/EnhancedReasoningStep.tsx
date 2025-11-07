'use client'

import { memo } from 'react'
import { Target, Zap, Info, ChevronRight } from 'lucide-react'
import { ReasoningSteps } from '@/types/os'
import { ExpandableSection, ConfidenceMeter, MetadataBadge } from '@/components/ui/MetadataDisplay'

interface EnhancedReasoningStepProps {
  step: ReasoningSteps
  index: number
}

const EnhancedReasoningStep = memo(({ step, index }: EnhancedReasoningStepProps) => {
  const hasDetails = step.reasoning || step.result || step.action || step.next_action

  return (
    <ExpandableSection
      title={
        <div className="flex items-center gap-2 flex-1">
          <span className="flex h-5 items-center rounded-md bg-accent px-2 text-[10px] font-bold uppercase">
            STEP {index + 1}
          </span>
          <span className="text-sm font-semibold">{step.title}</span>
        </div>
      }
      defaultExpanded={false}
      className="border-l-4 border-l-primary/30"
      headerClassName="hover:bg-accent/20"
    >
      <div className="space-y-3">
        {/* Confidence Score */}
        {step.confidence !== undefined && (
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/60" />
            <div className="flex-1">
              <p className="text-xs font-semibold mb-1.5 text-primary/80">Confidence:</p>
              <ConfidenceMeter value={step.confidence} size="sm" />
            </div>
          </div>
        )}

        {/* Reasoning Text */}
        {step.reasoning && (
          <div className="rounded-lg bg-background-secondary/70 p-3 border border-accent/20">
            <p className="text-xs font-semibold mb-2 text-primary flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Reasoning:
            </p>
            <p className="text-xs text-primary/80 whitespace-pre-wrap leading-relaxed">
              {step.reasoning}
            </p>
          </div>
        )}

        {/* Action Taken */}
        {step.action && (
          <div className="flex items-start gap-2">
            <MetadataBadge
              icon={<Zap className="h-3 w-3" />}
              label="Action"
              value={step.action}
              variant="info"
              size="md"
              className="w-full justify-start"
            />
          </div>
        )}

        {/* Result */}
        {step.result && (
          <div className="rounded-lg bg-green-500/10 p-3 border border-green-500/20">
            <p className="text-xs font-semibold mb-2 text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Result:
            </p>
            <p className="text-xs text-primary/80 whitespace-pre-wrap leading-relaxed">
              {step.result}
            </p>
          </div>
        )}

        {/* Next Action */}
        {step.next_action && (
          <div className="flex items-start gap-2">
            <MetadataBadge
              icon={<ChevronRight className="h-3 w-3" />}
              label="Next"
              value={step.next_action}
              variant="warning"
              size="md"
              className="w-full justify-start"
            />
          </div>
        )}

        {/* Fallback if no details */}
        {!hasDetails && (
          <p className="text-xs text-primary/50 italic text-center py-2">
            No additional details available
          </p>
        )}
      </div>
    </ExpandableSection>
  )
})

EnhancedReasoningStep.displayName = 'EnhancedReasoningStep'

export default EnhancedReasoningStep
