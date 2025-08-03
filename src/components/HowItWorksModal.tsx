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
        <Button variant="ghostTransparent" className="flex items-center gap-2 cursor-pointer focus-ring">
          <Info size={16} />
          {t('button')}
        </Button>
      </DialogTrigger>

      {/* Dialog com visual glass moderno */}
      <DialogContent className="sm:max-w-[600px] rounded-2xl border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--card)/0.35)] backdrop-blur-md shadow-web3-2 p-0 overflow-hidden">
        {/* Header com gradient-border sutil e espaço p/ botão de fechar */}
        <div className="relative gradient-border rounded-t-2xl p-[1px]">
          <div className="rounded-t-[calc(1rem-1px)] bg-[hsl(var(--card)/0.25)] pl-6 pr-12 py-4">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {currentStep?.title}
                </DialogTitle>
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {step + 1}/{tutorialSteps.length}
                </span>
              </div>
            </DialogHeader>
            {/* Botão fechar reposicionado fora do fluxo do título */}
            <DialogClose asChild>
              <button
                aria-label="Fechar"
                className="absolute right-3 top-3 h-8 w-8 rounded-full flex items-center justify-center hover:bg-[hsl(var(--card)/0.5)] focus-ring"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-muted-foreground">
                  <path fill="currentColor" d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </DialogClose>
          </div>
        </div>

        {/* Conteúdo com respiração maior */}
        <div className="space-y-7 px-8 py-6">
          {/* Dots de progresso minimalistas */}
          <div className="flex justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-7 rounded-full transition-all ease-web3 duration-200 ${
                  index === step
                    ? 'bg-[hsl(var(--primary))]'
                    : 'bg-[hsl(var(--border)/0.45)]'
                }`}
              />
            ))}
          </div>

          {/* Texto central */}
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-foreground text-base leading-relaxed px-2 max-w-[38ch]">
              {currentStep?.description}
            </p>
          </div>

          {/* CTA */}
          <DialogFooter className="flex justify-center pt-1 !flex-row !space-x-0">
            {step < tutorialSteps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="primaryGradient"
                className="max-w-xs w-full mx-auto cursor-pointer"
                size="lg"
              >
                {t('nextButton')}
              </Button>
            ) : (
              <DialogClose asChild>
                <Button
                  onClick={handleClose}
                  variant="primaryGradient"
                  className="max-w-xs w-full mx-auto cursor-pointer"
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
