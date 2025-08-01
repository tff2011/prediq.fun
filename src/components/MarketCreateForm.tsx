'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Info, Plus } from 'lucide-react'

interface MarketFormData {
  question: string
  description: string
  category: string
  endsAt: string
}

const categories = [
  { id: 'politics', name: 'Política', variant: 'politics' as const },
  { id: 'crypto', name: 'Cripto', variant: 'crypto' as const },
  { id: 'sports', name: 'Esportes', variant: 'sports' as const },
  { id: 'economics', name: 'Economia', variant: 'economics' as const },
]

export function MarketCreateForm() {
  const t = useTranslations('createMarket')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<MarketFormData>()

  const watchedCategory = watch('category')

  const onSubmit = async (data: MarketFormData) => {
    setIsSubmitting(true)
    try {
      // Mock submission - replace with actual API call
      console.log('Creating market:', data)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to the new market page
      router.push('/pt/markets')
    } catch (error) {
      console.error('Error creating market:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set minimum date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Question Field */}
          <div className="space-y-2">
            <Label htmlFor="question">{t('fields.question')}</Label>
            <Input
              id="question"
              placeholder={t('fields.questionHint')}
              {...register('question', { 
                required: 'A pergunta é obrigatória',
                minLength: { value: 10, message: 'A pergunta deve ter pelo menos 10 caracteres' }
              })}
              className={errors.question ? 'border-destructive' : ''}
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>{t('fields.category')}</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? cat.variant : 'outline'}
                  className="cursor-pointer py-2 px-4"
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setValue('category', cat.id)
                  }}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
            <input type="hidden" {...register('category', { required: 'Selecione uma categoria' })} />
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Closing Date */}
          <div className="space-y-2">
            <Label htmlFor="endsAt">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              {t('fields.closingDate')}
            </Label>
            <Input
              id="endsAt"
              type="date"
              min={minDate}
              {...register('endsAt', { 
                required: 'A data de fechamento é obrigatória',
                validate: value => new Date(value) > new Date() || 'A data deve ser futura'
              })}
              className={errors.endsAt ? 'border-destructive' : ''}
            />
            {errors.endsAt && (
              <p className="text-sm text-destructive">{errors.endsAt.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('fields.description')}</Label>
            <Textarea
              id="description"
              placeholder={t('fields.descriptionHint')}
              rows={4}
              {...register('description', { 
                required: 'A descrição é obrigatória',
                minLength: { value: 20, message: 'A descrição deve ter pelo menos 20 caracteres' }
              })}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
            <Info className="w-5 h-5 text-info mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-semibold mb-1">Regras do mercado:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>O mercado deve ter uma pergunta clara com resposta SIM ou NÃO</li>
                <li>A resolução será baseada em fontes confiáveis e públicas</li>
                <li>Taxa de criação: R$ 10,00 (reembolsável se o mercado atingir 100 apostas)</li>
                <li>Liquidez inicial será fornecida automaticamente</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando mercado...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                {t('title')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}