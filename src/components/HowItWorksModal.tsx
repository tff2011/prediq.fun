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
    // Remove focus do botão quando modal fecha para evitar borda azul
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  return (
    <Dialog onOpenChange={(open) => !open && handleClose()}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 focus-ring">
          <Info size={16} />
          {t('button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border border-border shadow-xl sm:rounded-2xl backdrop-blur-sm">
        <div className="space-y-6 p-2">
          <DialogHeader>
            <div className="flex justify-center items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">{step + 1}/{tutorialSteps.length}</span>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">
              {currentStep?.title}
            </DialogTitle>
          </DialogHeader>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-3">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-3 w-3 rounded-full transition-all duration-200 ${
                  index === step
                    ? 'bg-primary scale-110 shadow-sm'
                    : index < step
                    ? 'bg-primary/60'
                    : 'border-2 border-border bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex flex-col items-center space-y-4 py-6">
            <p className="text-center text-foreground text-lg leading-relaxed px-6 max-w-md font-medium">
              {currentStep?.description}
            </p>
          </div>
          
          <DialogFooter className="flex justify-center pt-2 !flex-row !space-x-0">
            {step < tutorialSteps.length - 1 ? (
              <Button 
                onClick={handleNext} 
                className="max-w-xs w-full mx-auto cursor-pointer bg-green-600 text-white hover:bg-green-700 border-none shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 focus-ring"
                size="lg"
              >
                {t('nextButton')}
              </Button>
            ) : (
              <DialogClose asChild>
                <Button 
                  onClick={handleClose} 
                  variant="default"
                  className="max-w-xs w-full mx-auto cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md focus-ring" 
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
