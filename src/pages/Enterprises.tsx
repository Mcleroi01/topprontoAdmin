import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Download, Phone, Mail } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table'
import { enterprisesApi } from '../services/api'
import { format } from 'date-fns'

export function Enterprises() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: enterprises, isLoading } = useQuery({
    queryKey: ['enterprises', { status: statusFilter, search: searchQuery }],
    queryFn: () => enterprisesApi.getAll({ 
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchQuery || undefined 
    }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'new' | 'contacted' | 'converted' | 'rejected' }) =>
      enterprisesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] })
      queryClient.invalidateQueries({ queryKey: ['enterprises-stats'] })
    },
  })

  const statusOptions = [
    { value: 'all', label: t('drivers.all') },
    { value: 'new', label: t('enterprises.new') },
    { value: 'contacted', label: t('enterprises.contacted') },
    { value: 'converted', label: t('enterprises.converted') },
    { value: 'rejected', label: t('enterprises.rejected') },
  ]

  const getStatusBadge = (status: string) => {
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

  const handleStatusUpdate = (id: string, status: 'new' | 'contacted' | 'converted' | 'rejected') => {
    updateStatusMutation.mutate({ id, status })
  }

  const exportToCSV = () => {
    if (!enterprises) return

    const headers = [
      'Empresa',
      'Email',
      'Telefone', 
      'Pessoa de Contato',
      'Cargo',
      'Cidade',
      'Setor',
      'Tipo de Veículo',
      'Entregas Mensais',
      'Status',
      'Data de Criação'
    ]

    const csvContent = [
      headers.join(','),
      ...enterprises.map(enterprise => [
        `"${enterprise.name}"`,
        enterprise.email,
        enterprise.phone,
        `"${enterprise.contact_person}"`,
        enterprise.position,
        enterprise.city,
        enterprise.industry,
        enterprise.vehicle_type,
        enterprise.monthly_deliveries,
        enterprise.status,
        format(new Date(enterprise.created_at), 'dd/MM/yyyy')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'empresas.csv'
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('enterprises.title')}
        </h1>
        <Button onClick={exportToCSV} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          {t('drivers.export')}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enterprises Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('enterprises.name')}</TableHead>
                <TableHead>{t('enterprises.contact')}</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>{t('enterprises.industry')}</TableHead>
                <TableHead>{t('enterprises.deliveries')}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>{t('common.createdAt')}</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enterprises?.map((enterprise) => (
                <TableRow key={enterprise.id}>
                  <TableCell className="font-medium">
                    {enterprise.name}
                    <div className="text-sm text-gray-500">{enterprise.city}</div>
                  </TableCell>
                  <TableCell>
                    {enterprise.contact_person}
                    <div className="text-sm text-gray-500">{enterprise.position}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <a 
                        href={`mailto:${enterprise.email}`}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {enterprise.email}
                      </a>
                      <a 
                        href={`tel:${enterprise.phone}`}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {enterprise.phone}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    {enterprise.industry}
                    <div className="text-sm text-gray-500">{enterprise.vehicle_type}</div>
                  </TableCell>
                  <TableCell>{enterprise.monthly_deliveries}</TableCell>
                  <TableCell>{getStatusBadge(enterprise.status)}</TableCell>
                  <TableCell>
                    {format(new Date(enterprise.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <select
                      value={enterprise.status}
                      onChange={(e) => handleStatusUpdate(enterprise.id, e.target.value as any)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="new">Novo</option>
                      <option value="contacted">Contatado</option>
                      <option value="converted">Convertido</option>
                      <option value="rejected">Rejeitado</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {enterprises?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('common.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}