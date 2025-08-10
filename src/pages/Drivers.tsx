import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Download, Eye, Check, X } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table'
import { driversApi } from '../services/api'
import { format } from 'date-fns'

export function Drivers() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers', { status: statusFilter, search: searchQuery }],
    queryFn: () => driversApi.getAll({ 
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchQuery || undefined 
    }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'approved' | 'rejected' }) =>
      driversApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      queryClient.invalidateQueries({ queryKey: ['drivers-stats'] })
    },
  })

  const statusOptions = [
    { value: 'all', label: t('drivers.all') },
    { value: 'pending', label: t('drivers.pending') },
    { value: 'approved', label: t('drivers.approved') },
    { value: 'rejected', label: t('drivers.rejected') },
  ]

  const getStatusBadge = (status: string) => {
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
  }

  const handleStatusUpdate = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    updateStatusMutation.mutate({ id, status })
  }

  const exportToCSV = () => {
    if (!drivers) return

    const headers = [
      'Nome',
      'Email', 
      'Telefone',
      'Cidade',
      'Tem Veículo',
      'Tipo de Veículo',
      'Anos de Experiência',
      'Status',
      'Data de Criação'
    ]

    const csvContent = [
      headers.join(','),
      ...drivers.map(driver => [
        `"${driver.first_name} ${driver.last_name}"`,
        driver.email,
        driver.phone,
        driver.city,
        driver.has_vehicle ? 'Sim' : 'Não',
        driver.vehicle_type || '',
        driver.experience_years,
        driver.status,
        format(new Date(driver.created_at), 'dd/MM/yyyy')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'chauffeurs.csv'
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
          {t('drivers.title')}
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

      {/* Drivers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('drivers.name')}</TableHead>
                <TableHead>{t('drivers.email')}</TableHead>
                <TableHead>{t('drivers.phone')}</TableHead>
                <TableHead>{t('drivers.city')}</TableHead>
                <TableHead>{t('drivers.vehicle')}</TableHead>
                <TableHead>{t('drivers.experience')}</TableHead>
                <TableHead>{t('drivers.status')}</TableHead>
                <TableHead>{t('common.createdAt')}</TableHead>
                <TableHead>{t('drivers.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers?.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">
                    {driver.first_name} {driver.last_name}
                  </TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.city}</TableCell>
                  <TableCell>
                    {driver.has_vehicle ? (
                      <span className="text-green-600">
                        {driver.vehicle_type}
                      </span>
                    ) : (
                      <span className="text-red-600">Não</span>
                    )}
                  </TableCell>
                  <TableCell>{driver.experience_years} anos</TableCell>
                  <TableCell>{getStatusBadge(driver.status)}</TableCell>
                  <TableCell>
                    {format(new Date(driver.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {driver.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleStatusUpdate(driver.id, 'approved')}
                            loading={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleStatusUpdate(driver.id, 'rejected')}
                            loading={updateStatusMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {drivers?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('common.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}