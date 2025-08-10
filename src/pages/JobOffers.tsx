import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Plus, Eye, Edit, Trash2, Users } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table'
import { jobOffersApi, jobApplicationsApi } from '../services/api'
import { format } from 'date-fns'

export function JobOffers() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)

  const { data: jobOffers, isLoading } = useQuery({
    queryKey: ['job-offers', { isActive: activeFilter, search: searchQuery }],
    queryFn: () => jobOffersApi.getAll({ 
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
      search: searchQuery || undefined 
    }),
  })

  const { data: applications } = useQuery({
    queryKey: ['job-applications', selectedOffer],
    queryFn: () => selectedOffer ? jobApplicationsApi.getByJobOffer(selectedOffer) : Promise.resolve([]),
    enabled: !!selectedOffer,
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      jobOffersApi.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] })
      queryClient.invalidateQueries({ queryKey: ['job-offers-active'] })
    },
  })

  const deleteOfferMutation = useMutation({
    mutationFn: (id: string) => jobOffersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] })
      queryClient.invalidateQueries({ queryKey: ['job-offers-active'] })
    },
  })

  const activeOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: t('jobOffers.active') },
    { value: 'inactive', label: t('jobOffers.inactive') },
  ]

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta oferta?')) {
      deleteOfferMutation.mutate(id)
    }
  }

  const viewApplications = (offerId: string) => {
    setSelectedOffer(offerId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (selectedOffer) {
    const offer = jobOffers?.find(o => o.id === selectedOffer)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedOffer(null)}
              className="mb-4"
            >
              ← Voltar às ofertas
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidaturas para: {offer?.title}
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Experiência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.first_name} {application.last_name}
                    </TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>{application.phone}</TableCell>
                    <TableCell>{application.experience_years} anos</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          application.status === 'accepted' ? 'success' :
                          application.status === 'rejected' ? 'danger' :
                          application.status === 'reviewed' ? 'warning' : 'default'
                        }
                      >
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {applications?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma candidatura ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('jobOffers.title')}
        </h1>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          {t('jobOffers.addNew')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Offers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Candidaturas</TableHead>
                <TableHead>{t('common.createdAt')}</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobOffers?.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">
                    {offer.title}
                  </TableCell>
                  <TableCell>{offer.location}</TableCell>
                  <TableCell>{offer.employment_type}</TableCell>
                  <TableCell>{offer.salary_range || 'A combinar'}</TableCell>
                  <TableCell>
                    <Badge variant={offer.is_active ? 'success' : 'default'}>
                      {offer.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewApplications(offer.id)}
                      className="flex items-center"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      {offer.applications_count}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {format(new Date(offer.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(offer.id, offer.is_active)}
                        loading={toggleActiveMutation.isPending}
                      >
                        {offer.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(offer.id)}
                        loading={deleteOfferMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {jobOffers?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('common.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}