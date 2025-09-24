import React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Filter, ChevronDown, Loader2 } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table'
import { getSurveys, SurveyListItem, SurveyFilters } from '../../services/supabase/surveyAdminService'

const PAGE_SIZE = 20

function ShimmerRow() {
  return (
    <TableRow className="animate-pulse">
      <TableCell className="px-6 py-4">
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
      </TableCell>
    </TableRow>
  )
}

function MobileCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm animate-pulse space-y-3">
      <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

export default function SurveysList() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialFilters: SurveyFilters = {
    locale: searchParams.get('locale') || undefined,
    partnershipDuration: searchParams.get('duration') || undefined,
    dateFrom: searchParams.get('from') || undefined,
    dateTo: searchParams.get('to') || undefined,
  }

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['admin-surveys', initialFilters],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getSurveys({ limit: PAGE_SIZE, offset: pageParam, filters: initialFilters })
      return { items: res, nextOffset: (res?.length || 0) === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined }
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  })

  const surveys: SurveyListItem[] = React.useMemo(
    () => data?.pages.flatMap((p) => p.items) || [],
    [data]
  )

  function onFilterChange(partial: Partial<SurveyFilters>) {
    const next = new URLSearchParams(searchParams)
    if ('locale' in partial) {
      if (partial.locale) {
        next.set('locale', String(partial.locale))
      } else {
        next.delete('locale')
      }
    }
    if ('partnershipDuration' in partial) {
      if (partial.partnershipDuration !== undefined && partial.partnershipDuration !== '') {
        next.set('duration', String(partial.partnershipDuration))
      } else {
        next.delete('duration')
      }
    }
    if ('dateFrom' in partial) {
      if (partial.dateFrom) {
        next.set('from', String(partial.dateFrom))
      } else {
        next.delete('from')
      }
    }
    if ('dateTo' in partial) {
      if (partial.dateTo) {
        next.set('to', String(partial.dateTo))
      } else {
        next.delete('to')
      }
    }
    setSearchParams(next)
    // Refetch with new filters
    refetch()
  }

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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
            {t('admin.surveys.title', 'Satisfaction Surveys')}
          </h1>
          <p className="text-green-200 mt-1">
            {t('admin.surveys.subtitle', 'Visualisez et filtrez les enquêtes de satisfaction')}
          </p>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t('filters.from', 'From')}
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 bg-white text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.get('from') || ''}
                  onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
                  aria-label={t('filters.from', 'From')}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t('filters.to', 'To')}
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 bg-white text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.get('to') || ''}
                  onChange={(e) => onFilterChange({ dateTo: e.target.value })}
                  aria-label={t('filters.to', 'To')}
                />
              </div>
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1">
                  {t('filters.partnership_duration', 'Partnership duration')}
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="appearance-none w-full bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  value={searchParams.get('duration') || ''}
                  onChange={(e) => onFilterChange({ partnershipDuration: e.target.value })}
                  aria-label={t('filters.partnership_duration', 'Partnership duration')}
                >
                  <option value="">{t('filters.any_duration', 'Any duration')}</option>
                  <option value="0-6">0-6</option>
                  <option value="6-12">6-12</option>
                  <option value=">12">{t('filters.more_than_12', 'More than 12')}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none mt-6">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1">
                  {t('filters.locale', 'Locale')}
                </label>
                <select
                  className="appearance-none w-full bg-white border border-gray-300 rounded-md pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer px-3"
                  value={searchParams.get('locale') || ''}
                  onChange={(e) => onFilterChange({ locale: e.target.value })}
                  aria-label={t('filters.locale', 'Locale')}
                >
                  <option value="">{t('filters.any_locale', 'Any locale')}</option>
                  <option value="pt">PT</option>
                  <option value="en">EN</option>
                  <option value="fr">FR</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none mt-6">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:bg-gray-100"
                  onClick={() => {
                    setSearchParams(new URLSearchParams())
                    refetch()
                  }}
                >
                  {t('actions.clear_filters', 'Clear filters')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.company', 'Empresa')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.partnership_duration', 'Tempo de parceria')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.date', 'Data')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.locale', 'Localização')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.status', 'Status')}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('columns.actions', 'Ações')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && Array.from({ length: 6 }).map((_, i) => <ShimmerRow key={i} />)}
                  {!isLoading && surveys.map((s) => (
                    <TableRow key={s.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {s.company_name || t('labels.unknown_company', 'N/D')}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {String(s.partnership_duration ?? t('labels.na', 'N/A'))}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {new Date(s.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {s.locale?.toUpperCase() || '-'}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {t('status.received', 'Recebido')}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/surveys/${s.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {t('actions.view_details', 'Ver Detalhes')}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

      {/* Mobile cards */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <MobileCardSkeleton key={i} />)}
        {!isLoading && surveys.map((s) => (
          <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">{s.company_name || t('labels.unknown_company', 'N/D')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(s.created_at).toLocaleString()}</div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                {t('status.received', 'Recebido')}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
              {t('columns.partnership_duration', 'Tempo de parceria')}: {String(s.partnership_duration ?? t('labels.na', 'N/A'))}
            </div>
            <div className="mt-3">
              <Link
                to={`/admin/surveys/${s.id}`}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {t('actions.view_details', 'Ver Detalhes')}
              </Link>
            </div>
          </div>
        ))}
      </div>

        {/* Load more */}
        {!isLoading && (
          <div className="flex justify-center py-4">
            {hasNextPage ? (
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2"
              >
                {isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('actions.loading', 'Carregando...')}</span>
                ) : (
                  t('actions.load_more', 'Carregar mais')
                )}
              </Button>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('labels.end_of_list', 'Fim da lista')}</span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
