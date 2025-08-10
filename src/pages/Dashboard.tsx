import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Users, Building2, MessageCircle, Briefcase, TrendingUp, Clock } from 'lucide-react'
import { StatsCard } from '../components/stats/StatsCard'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { driversApi, enterprisesApi, contactsApi, jobOffersApi } from '../services/api'
import { format } from 'date-fns'

export function Dashboard() {
  const { t } = useTranslation()

  const { data: driversStats, isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers-stats'],
    queryFn: () => driversApi.getStats(),
  })

  const { data: enterprisesStats, isLoading: loadingEnterprises } = useQuery({
    queryKey: ['enterprises-stats'], 
    queryFn: () => enterprisesApi.getStats(),
  })

  const { data: unreadContacts, isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts-unread'],
    queryFn: () => contactsApi.getUnreadCount(),
  })

  const { data: activeJobOffers, isLoading: loadingJobOffers } = useQuery({
    queryKey: ['job-offers-active'],
    queryFn: () => jobOffersApi.getActiveCount(),
  })

  const { data: recentDrivers } = useQuery({
    queryKey: ['recent-drivers'],
    queryFn: () => driversApi.getAll({ status: 'all' }),
  })

  const { data: recentEnterprises } = useQuery({
    queryKey: ['recent-enterprises'],
    queryFn: () => enterprisesApi.getAll({ status: 'all' }),
  })

  const recentActivity = [
    ...(recentDrivers?.slice(0, 5).map(driver => ({
      type: 'driver',
      title: `${driver.first_name} ${driver.last_name}`,
      subtitle: driver.email,
      status: driver.status,
      date: driver.created_at,
    })) || []),
    ...(recentEnterprises?.slice(0, 5).map(enterprise => ({
      type: 'enterprise',
      title: enterprise.name,
      subtitle: enterprise.contact_person,
      status: enterprise.status,
      date: enterprise.created_at,
    })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  const getStatusBadge = (status: string, type: 'driver' | 'enterprise') => {
    if (type === 'driver') {
      switch (status) {
        case 'pending':
          return <Badge variant="warning">{t('drivers.pending')}</Badge>
        case 'approved':
          return <Badge variant="success">{t('drivers.approved')}</Badge>
        case 'rejected':
          return <Badge variant="danger">{t('drivers.rejected')}</Badge>
        default:
          return <Badge>{status}</Badge>
      }
    } else {
      switch (status) {
        case 'new':
          return <Badge variant="info">{t('enterprises.new')}</Badge>
        case 'contacted':
          return <Badge variant="warning">{t('enterprises.contacted')}</Badge>
        case 'converted':
          return <Badge variant="success">{t('enterprises.converted')}</Badge>
        case 'rejected':
          return <Badge variant="danger">{t('enterprises.rejected')}</Badge>
        default:
          return <Badge>{status}</Badge>
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('dashboard.overview')}
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao painel administrativo da TopPronto
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('dashboard.totalDrivers')}
          value={driversStats?.total || 0}
          icon={Users}
          color="blue"
          loading={loadingDrivers}
        />
        <StatsCard
          title={t('dashboard.pendingDrivers')}
          value={driversStats?.pending || 0}
          icon={Clock}
          color="yellow"
          loading={loadingDrivers}
        />
        <StatsCard
          title={t('dashboard.totalEnterprises')}
          value={enterprisesStats?.total || 0}
          icon={Building2}
          color="green"
          loading={loadingEnterprises}
        />
        <StatsCard
          title={t('dashboard.unreadContacts')}
          value={unreadContacts || 0}
          icon={MessageCircle}
          color="red"
          loading={loadingContacts}
        />
        <StatsCard
          title={t('dashboard.newEnterprises')}
          value={enterprisesStats?.new || 0}
          icon={TrendingUp}
          color="purple"
          loading={loadingEnterprises}
        />
        <StatsCard
          title={t('dashboard.activeJobOffers')}
          value={activeJobOffers || 0}
          icon={Briefcase}
          color="blue"
          loading={loadingJobOffers}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('dashboard.recentActivity')}
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(activity.status, activity.type as 'driver' | 'enterprise')}
                      <span className="text-xs text-gray-400">
                        {format(new Date(activity.date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  {t('common.noData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Estatísticas Rápidas
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Chauffeurs Aprovados</span>
                <span className="text-sm font-medium">{driversStats?.approved || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Empresas Convertidas</span>
                <span className="text-sm font-medium">{enterprisesStats?.converted || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa de Aprovação</span>
                <span className="text-sm font-medium">
                  {driversStats?.total ? Math.round((driversStats.approved / driversStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa de Conversão</span>
                <span className="text-sm font-medium">
                  {enterprisesStats?.total ? Math.round((enterprisesStats.converted / enterprisesStats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}