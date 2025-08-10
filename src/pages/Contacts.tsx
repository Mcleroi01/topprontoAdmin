import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Mail, Phone, CheckCircle, Circle } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table'
import { contactsApi } from '../services/api'
import { format } from 'date-fns'

export function Contacts() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [readFilter, setReadFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', { isRead: readFilter, search: searchQuery }],
    queryFn: () => contactsApi.getAll({ 
      isRead: readFilter === 'all' ? undefined : readFilter === 'read',
      search: searchQuery || undefined 
    }),
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => contactsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts-unread'] })
    },
  })

  const readOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'unread', label: t('contacts.unread') },
    { value: 'read', label: t('contacts.read') },
  ]

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
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
          {t('contacts.title')}
        </h1>
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
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {readOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>{t('common.createdAt')}</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts?.map((contact) => (
                <TableRow key={contact.id} className={!contact.is_read ? 'bg-blue-50' : ''}>
                  <TableCell>
                    {contact.is_read ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {contact.name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <a 
                        href={`mailto:${contact.email}`}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </a>
                      {contact.phone && (
                        <a 
                          href={`tel:${contact.phone}`}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{contact.subject}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={contact.message}>
                      {contact.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {!contact.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(contact.id)}
                          loading={markAsReadMutation.isPending}
                        >
                          {t('contacts.markAsRead')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => window.open(`mailto:${contact.email}?subject=Re: ${contact.subject}`)}
                      >
                        {t('contacts.reply')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {contacts?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('common.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}