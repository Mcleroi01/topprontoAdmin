import { supabase } from '../../lib/supabase'

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type SurveyListItem = {
  id: string
  company_name: string | null
  partnership_duration: number | string | null
  locale: string | null
  created_at: string
  answers_json: Record<string, JsonValue> | null
}

export type SurveyDetail = {
  id: string
  company_name: string | null
  partnership_duration: number | string | null
  locale: string | null
  user_agent: string | null
  created_at: string
  answers_json: Record<string, JsonValue> | null
}

export type SurveyFilters = {
  locale?: string
  partnershipDuration?: number | string
  dateFrom?: string // ISO date
  dateTo?: string   // ISO date
}

export async function getSurveys({
  limit = 20,
  offset = 0,
  filters = {},
}: {
  limit?: number
  offset?: number
  filters?: SurveyFilters
}): Promise<SurveyListItem[]> {
  let query = supabase
    .from('surveys')
    .select(
      'id, created_at, company_name, partnership_duration, locale, answers_json',
      { head: false }
    )
    .order('created_at', { ascending: false })

  if (filters.locale) {
    query = query.eq('locale', filters.locale)
  }

  if (filters.partnershipDuration !== undefined && filters.partnershipDuration !== null && filters.partnershipDuration !== '') {
    const dur = filters.partnershipDuration
    if (typeof dur === 'string') {
      const trimmed = dur.trim()
      if (/^\d+\s*-\s*\d+$/.test(trimmed)) {
        const [minStr, maxStr] = trimmed.split('-').map((s) => s.trim())
        const min = Number(minStr)
        const max = Number(maxStr)
        if (!Number.isNaN(min)) query = query.gte('partnership_duration', min)
        if (!Number.isNaN(max)) query = query.lte('partnership_duration', max)
      } else if (/^>\s*\d+$/.test(trimmed)) {
        const n = Number(trimmed.replace('>', '').trim())
        if (!Number.isNaN(n)) query = query.gt('partnership_duration', n)
      } else if (/^>=\s*\d+$/.test(trimmed)) {
        const n = Number(trimmed.replace('>=', '').trim())
        if (!Number.isNaN(n)) query = query.gte('partnership_duration', n)
      } else if (/^<\s*\d+$/.test(trimmed)) {
        const n = Number(trimmed.replace('<', '').trim())
        if (!Number.isNaN(n)) query = query.lt('partnership_duration', n)
      } else if (/^<=\s*\d+$/.test(trimmed)) {
        const n = Number(trimmed.replace('<=', '').trim())
        if (!Number.isNaN(n)) query = query.lte('partnership_duration', n)
      } else {
        // Fallback to exact match if unknown format
        query = query.eq('partnership_duration', dur)
      }
    } else {
      query = query.eq('partnership_duration', dur)
    }
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    // add one day to include the end date if only a date is provided
    const to = new Date(filters.dateTo)
    if (!isNaN(to.getTime())) {
      const plusOne = new Date(to.getTime())
      plusOne.setDate(plusOne.getDate() + 1)
      query = query.lt('created_at', plusOne.toISOString())
    } else {
      query = query.lte('created_at', filters.dateTo)
    }
  }

  const rangeFrom = offset
  const rangeTo = offset + limit - 1
  const { data, error } = await query.range(rangeFrom, rangeTo)

  if (error) {
    throw error
  }

  return (data || []) as SurveyListItem[]
}

export async function getSurveyById(id: string): Promise<SurveyDetail> {
  const { data, error } = await supabase
    .from('surveys')
    .select('id, created_at, company_name, partnership_duration, locale, user_agent, answers_json')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data as SurveyDetail
}

export type SurveyStats = {
  total: number
  last7Days: number
  byLocale: Record<string, number>
}

export async function getSurveyStats(filters: SurveyFilters = {}): Promise<SurveyStats> {
  // Builder that starts with select for count typing, then applies filters
  const buildCountQuery = () => {
    let q = supabase.from('surveys').select('*', { count: 'exact', head: true })
    if (filters.locale) q = q.eq('locale', filters.locale)
    if (filters.partnershipDuration !== undefined && filters.partnershipDuration !== null && filters.partnershipDuration !== '') {
      const dur = filters.partnershipDuration
      if (typeof dur === 'string') {
        const trimmed = dur.trim()
        if (/^\d+\s*-\s*\d+$/.test(trimmed)) {
          const [minStr, maxStr] = trimmed.split('-').map((s) => s.trim())
          const min = Number(minStr)
          const max = Number(maxStr)
          if (!Number.isNaN(min)) q = q.gte('partnership_duration', min)
          if (!Number.isNaN(max)) q = q.lte('partnership_duration', max)
        } else if (/^>\s*\d+$/.test(trimmed)) {
          const n = Number(trimmed.replace('>', '').trim())
          if (!Number.isNaN(n)) q = q.gt('partnership_duration', n)
        } else if (/^>=\s*\d+$/.test(trimmed)) {
          const n = Number(trimmed.replace('>=', '').trim())
          if (!Number.isNaN(n)) q = q.gte('partnership_duration', n)
        } else if (/^<\s*\d+$/.test(trimmed)) {
          const n = Number(trimmed.replace('<', '').trim())
          if (!Number.isNaN(n)) q = q.lt('partnership_duration', n)
        } else if (/^<=\s*\d+$/.test(trimmed)) {
          const n = Number(trimmed.replace('<=', '').trim())
          if (!Number.isNaN(n)) q = q.lte('partnership_duration', n)
        } else {
          q = q.eq('partnership_duration', dur)
        }
      } else {
        q = q.eq('partnership_duration', dur)
      }
    }
    if (filters.dateFrom) q = q.gte('created_at', filters.dateFrom)
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      if (!isNaN(to.getTime())) {
        const plusOne = new Date(to.getTime())
        plusOne.setDate(plusOne.getDate() + 1)
        q = q.lt('created_at', plusOne.toISOString())
      } else {
        q = q.lte('created_at', filters.dateTo)
      }
    }
    return q
  }

  // Total
  const { count: totalCount, error: totalError } = await buildCountQuery()
  if (totalError) throw totalError

  // Last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { count: last7, error: last7Err } = await buildCountQuery().gte('created_at', sevenDaysAgo.toISOString())
  if (last7Err) throw last7Err

  // By locale
  const locales = ['pt', 'en', 'fr']
  const byLocale: Record<string, number> = {}
  for (const loc of locales) {
    const { count, error } = await buildCountQuery().eq('locale', loc)
    if (error) throw error
    byLocale[loc] = count ?? 0
  }

  return {
    total: totalCount ?? 0,
    last7Days: last7 ?? 0,
    byLocale,
  }
}
