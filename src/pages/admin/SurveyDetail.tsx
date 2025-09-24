import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, Calendar, Globe } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { getSurveyById, SurveyDetail as SurveyDetailType, JsonValue } from '../../services/supabase/surveyAdminService'

function Stars({ value = 0 }: { value?: number }) {
  const safe = Math.max(0, Math.min(5, Number(value) || 0))
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={i < safe ? 'currentColor' : 'none'}
          className={i < safe ? 'w-4 h-4 text-yellow-400' : 'w-4 h-4 text-gray-300 dark:text-gray-600 stroke-current'}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.176 0l-2.803 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.17-3.292z"
          />
        </svg>
      ))}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-xs">
      {children}
    </span>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border border-gray-200 shadow-sm h-full">
      <CardContent className="p-4 md:p-5 h-full">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h3>
        <div className="text-sm text-gray-800 divide-y divide-gray-100">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

function isPlainObject(val: unknown): val is Record<string, JsonValue> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

function Row({ label, value }: { label: string; value: JsonValue | unknown }) {
  // Render by type
  if (typeof value === 'number') {
    // Possible rating (0-5)
    if (value >= 0 && value <= 5) {
      return (
        <div className="flex items-center justify-between py-3">
          <span className="text-gray-500">{label}</span>
          <Stars value={value} />
        </div>
      )
    }
  }

  if (Array.isArray(value)) {
    return (
      <div className="py-3">
        <div className="text-gray-500">{label}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((v, i) => (
            <Chip key={i}>{String(v)}</Chip>
          ))}
        </div>
      </div>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-gray-500">{label}</span>
        <Chip>{value ? 'Yes' : 'No'}</Chip>
      </div>
    )
  }

  if (isPlainObject(value)) {
    return (
      <div className="py-3">
        <div className="text-gray-500 mb-2">{label}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(value).map(([k, v]) => (
            <Row key={k} label={k} value={v} />
          ))}
        </div>
      </div>
    )
  }

  // Default string/number
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{String(value ?? '-') }</span>
    </div>
  )
}

export default function SurveyDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery<SurveyDetailType>({
    queryKey: ['admin-survey', id],
    queryFn: async () => await getSurveyById(id as string),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">{t('loading', 'Carregando...')}</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">{t('errors.failed_to_load', 'Falha ao carregar o inquérito.')}</div>
        <button
          className="mt-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          onClick={() => navigate(-1)}
        >
          {t('actions.back', 'Voltar')}
        </button>
      </div>
    )
  }

  const answers: Record<string, JsonValue> = (data.answers_json || {}) as Record<string, JsonValue>

  // Try to map sections by common keys. Fallback to a generic bucket.
  const sections: { title: string; content: Record<string, JsonValue> }[] = []
  const general: Record<string, JsonValue> = {}
  const experience: Record<string, JsonValue> = {}
  const service: Record<string, JsonValue> = {}
  const suggestions: string[] = []

  Object.entries(answers).forEach(([key, value]) => {
    const k = key.toLowerCase()
    if (k.includes('sugest') || k.includes('suggest') || k.includes('comment')) {
      if (value) suggestions.push(String(value))
      return
    }
    if (k.includes('exper') || k.includes('satisf') || k.includes('rate')) {
      experience[key] = value
      return
    }
    if (k.includes('serv') || k.includes('support') || k.includes('delivery')) {
      service[key] = value
      return
    }
    general[key] = value
  })

  if (Object.keys(general).length) sections.push({ title: t('sections.general_info', 'Informações Gerais'), content: general })
  if (Object.keys(experience).length) sections.push({ title: t('sections.overall_experience', 'Experiência Geral'), content: experience })
  if (Object.keys(service).length) sections.push({ title: t('sections.service', 'Serviço'), content: service })

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 p-4 md:p-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                {data.company_name || t('labels.unknown_company', 'Empresa desconhecida')}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-green-100">
                <span className="inline-flex items-center gap-1 text-sm"><Calendar className="h-4 w-4" /> {new Date(data.created_at).toLocaleString()}</span>
                <span className="inline-flex items-center gap-1 text-sm"><Globe className="h-4 w-4" /> {data.locale?.toUpperCase() || '-'}</span>
              </div>
            </div>
            <div>
              <Link to="/admin/surveys">
                <Button variant="ghost" className="text-gray-100 border border-gray-200 hover:bg-gray-400">
                  <ArrowLeft className="h-4 w-4 mr-2" /> {t('actions.back', 'Voltar')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* First row: General + Experience */}
          {Object.keys(general).length > 0 && (
            <SectionCard title={t('sections.general_info', 'Informações Gerais')}>
              {Object.entries(general).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
            </SectionCard>
          )}
          {Object.keys(experience).length > 0 && (
            <SectionCard title={t('sections.overall_experience', 'Experiência Geral')}>
              {Object.entries(experience).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
            </SectionCard>
          )}

          {/* Next: Service if present */}
          {Object.keys(service).length > 0 && (
            <SectionCard title={t('sections.service', 'Serviço')}>
              {Object.entries(service).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
            </SectionCard>
          )}

          {/* Metadata last */}
          <SectionCard title={t('sections.metadata', 'Metadados')}>
            <Row label={t('columns.company', 'Empresa')} value={data.company_name || '-'} />
            <Row label={t('columns.partnership_duration', 'Tempo de parceria')} value={data.partnership_duration ?? '-'} />
            <Row label={t('columns.locale', 'Localização')} value={data.locale?.toUpperCase() || '-'} />
            <Row label="User Agent" value={data.user_agent || '-'} />
          </SectionCard>
        </div>
      </motion.div>
    </div>
  )
}
