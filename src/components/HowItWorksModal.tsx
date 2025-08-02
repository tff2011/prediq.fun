'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

type TutorialStep = {
  title: string
  description: string
}

export function HowItWorksModal() {
  const t = useTranslations('howItWorks')
  const [step, setStep] = useState(0)

  // As `useTranslations` não funciona bem com arrays de objetos diretamente,
  // então montamos o array de steps manualmente.
  const tutorialSteps: TutorialStep[] = [
    {
      title: t('steps.0.title'),
      description: t('steps.0.description')
    },
    {
      title: t('steps.1.title'),
      description: t('steps.1.description')
    },
    {
      title: t('steps.2.title'),
      description: t('steps.2.description')
    },
    {
      title: t('steps.3.title'),
      description: t('steps.3.description')
    }
  ]

  const currentStep = tutorialSteps[step]

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1)
    }
  }

  const handleClose = () => {
    setStep(0)
  }

  return (
    <Dialog onOpenChange={(open) => !open && handleClose()}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105">
          <Info size={16} />
          {t('button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl sm:rounded-2xl">
        <div className="space-y-6 p-2">
          <DialogHeader>
            <div className="flex justify-center items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">{step + 1}/{tutorialSteps.length}</span>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-card-foreground">
              {currentStep?.title}
            </DialogTitle>
          </DialogHeader>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-3">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === step
                    ? 'bg-primary scale-110'
                    : index < step
                    ? 'bg-primary/60'
                    : 'border-2 border-muted bg-background'
                }`}
              />
            ))}
          </div>
          
          <div className="flex flex-col items-center space-y-4 py-6">
            <p className="text-center text-card-foreground text-lg leading-relaxed px-6 max-w-md font-medium">
              {currentStep?.description}
            </p>
          </div>
          
          <DialogFooter className="flex justify-center pt-2 !flex-row !space-x-0">
            {step < tutorialSteps.length - 1 ? (
              <Button 
                onClick={handleNext} 
                className="max-w-xs w-full mx-auto cursor-pointer bg-[hsl(var(--yes))] text-white hover:bg-[hsl(var(--yes)/.85)] border-none shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                size="lg"
              >
                {t('nextButton')}
              </Button>
            ) : (
              <DialogClose asChild>
                <Button 
                  onClick={handleClose} 
                  variant="default"
                  className="max-w-xs w-full mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" 
                  size="lg"
                >
                  {t('getStartedButton')}
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
