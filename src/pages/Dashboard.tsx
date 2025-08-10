import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Users, Building2, MessageCircle, 
  Briefcase, TrendingUp, Clock,
  ArrowUp, ArrowDown
} from 'lucide-react'
import { StatsCard } from '../components/stats/StatsCard'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { driversApi, enterprisesApi, contactsApi, jobOffersApi } from '../services/api'
import { format } from 'date-fns'
import { t } from 'i18next'

// Configuration des animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function Dashboard() {
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

  // Données pour les statistiques
  const recentStats = {
    newToday: 0,
    pending: 0,
    total: 0
  }

  return (
    <div className="space-y-8">
      {/* En-tête avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Visão Geral
        </h1>
        <p className="text-green-100 text-lg">
          Bem-vindo ao painel administrativo da Topronto
        </p>
      </motion.div>

      {/* Grille de statistiques avec animations */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <StatsCard
                  title="Total de Motoristas"
                  value={driversStats?.total || 0}
                  icon={Users}
                  color="green"
                  change={12}
                  loading={loadingDrivers}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatsCard
                  title="Novos Hoje"
                  value={recentStats.newToday || 0}
                  icon={Clock}
                  color="purple"
                  change={3}
                  loading={loadingDrivers}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatsCard
                  title="Total de Empresas"
                  value={enterprisesStats?.total || 0}
                  icon={Building2}
                  color="yellow"
                  change={5}
                  loading={loadingEnterprises}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatsCard
                  title="Mensagens"
                  value={unreadContacts || 0}
                  icon={MessageCircle}
                  color="blue"
                  change={-8}
                  loading={loadingContacts}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatsCard
                  title="Candidaturas"
                  value={activeJobOffers || 0}
                  icon={TrendingUp}
                  color="purple"
                  change={22}
                  loading={loadingJobOffers}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatsCard
                  title="Vagas Ativas"
                  value={activeJobOffers || 0}
                  icon={Briefcase}
                  color="red"
                  change={15}
                  loading={loadingJobOffers}
          />
        </motion.div>
      </motion.div>

      {/* Section Statistiques */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Resumo de Motoristas</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <span className="text-sm">Aprovados</span>
                </div>
                <span className="text-sm font-medium">
                  {driversStats?.approved || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Pendentes</span>
                </div>
                <span className="text-sm font-medium">
                  {driversStats?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                  <span className="text-sm">Rejeitados</span>
                </div>
                <span className="text-sm font-medium">
                  {(driversStats?.total || 0) - ((driversStats?.approved || 0) + (driversStats?.pending || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Resumo de Empresas</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <span className="text-sm">Convertidas</span>
                </div>
                <span className="text-sm font-medium">
                  {enterprisesStats?.converted || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Novas</span>
                </div>
                <span className="text-sm font-medium">
                  {enterprisesStats?.new || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                  <span className="text-sm">Total</span>
                </div>
                <span className="text-sm font-medium">
                  {enterprisesStats?.total || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activité récente et statistiques rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Atividade Recente</h3>
              <p className="text-sm text-gray-500">Últimas atividades no sistema</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'driver' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {activity.type === 'driver' ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            <Building2 className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(activity.status, activity.type as 'driver' | 'enterprise')}
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {format(new Date(activity.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <p>Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-3 border-t border-gray-200 text-center">
                <button className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors">
                  Ver todas as atividades
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistiques rapides avec indicateurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Estatísticas Rápidas
              </h3>
              <p className="text-sm text-gray-500">Visão geral das métricas principais</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Métrique 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Motoristas Aprovados</p>
                      <p className="text-2xl font-bold text-gray-900">{driversStats?.approved || 0}</p>
                    </div>
                    <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>12.5%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full" 
                      style={{ width: `${(driversStats?.approved || 0) / ((driversStats?.total || 1) / 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Métrique 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Empresas Convertidas</p>
                      <p className="text-2xl font-bold text-gray-900">{enterprisesStats?.converted || 0}</p>
                    </div>
                    <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>8.3%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full" 
                      style={{ width: `${(enterprisesStats?.converted || 0) / ((enterprisesStats?.total || 1) / 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Métrique 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {driversStats?.total ? Math.round((driversStats.approved / driversStats.total) * 100) : 0}%
                      </p>
                    </div>
                    <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>4.2%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${driversStats?.total ? (driversStats.approved / driversStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Métrique 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {enterprisesStats?.total ? Math.round((enterprisesStats.converted / enterprisesStats.total) * 100) : 0}%
                      </p>
                    </div>
                    <div className="flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      <span>1.8%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full" 
                      style={{ width: `${enterprisesStats?.total ? (enterprisesStats.converted / enterprisesStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Ações Rápidas</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                    <Users className="h-5 w-5 text-green-600 mb-1" />
                    <span className="text-xs font-medium">Novo Motorista</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                    <Building2 className="h-5 w-5 text-green-600 mb-1" />
                    <span className="text-xs font-medium">Nova Empresa</span>
                  </button>
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                    <Briefcase className="h-5 w-5 text-green-600 mb-1" />
                    <span className="text-xs font-medium">Nova Vaga</span>
                  </div>
                  <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                    <MessageCircle className="h-5 w-5 text-green-600 mb-1" />
                    <span className="text-xs font-medium">Mensagens</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}