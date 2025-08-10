import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Filter, Mail, Phone, CheckCircle, Circle, Loader2, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table'
import { contactsApi } from '../services/api'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

// Animation variants
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
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function Contacts() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [readFilter, setReadFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Close drawer when selectedContact changes to null
  useEffect(() => {
    if (!selectedContact) {
      setIsDrawerOpen(false)
    } else {
      setIsDrawerOpen(true)
    }
  }, [selectedContact])

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isDrawerOpen && !target.closest('#contact-drawer') && !target.closest(`[data-contact-id]`)) {
        setSelectedContact(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDrawerOpen])

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
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-lg font-medium text-gray-600">
          Carregando motoristas...
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.div variants={container} className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 bg-gradient-to-r from-green-800 to-green-700 bg-clip-text text-transparent">
            {t("contacts.title")}
          </h1>
          <p className="text-gray-600"></p>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
              >
                {readOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <motion.div variants={item} className="overflow-hidden">
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Nome
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Contato
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Assunto
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Mensagem
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("common.createdAt")}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts?.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className={`cursor-pointer ${!contact.is_read ? "bg-blue-50" : ""} hover:bg-gray-50`}
                    onClick={() => setSelectedContact(contact)}
                    data-contact-id={contact.id}
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {contact.is_read ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {contact.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
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
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {contact.subject}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div
                        className="max-w-xs truncate"
                        title={contact.message}
                      >
                        {contact.message}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {format(new Date(contact.created_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center space-x-2">
                        {!contact.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(contact.id)}
                            loading={markAsReadMutation.isPending}
                          >
                            {t("contacts.markAsRead")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            window.open(
                              `mailto:${contact.email}?subject=Re: ${contact.subject}`
                            )
                          }
                        >
                          {t("contacts.reply")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {contacts?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t("common.noData")}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Contact Details Drawer */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isDrawerOpen}
      >
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedContact(null)}
        />
        
        {/* Drawer */}
        <motion.div
          id="contact-drawer"
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          initial={{ x: '100%' }}
          animate={{ x: isDrawerOpen ? 0 : '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          {selectedContact && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedContact.name}
                </h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <a 
                    href={`mailto:${selectedContact.email}`}
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {selectedContact.email}
                  </a>
                </div>

                {selectedContact.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                    <a 
                      href={`tel:${selectedContact.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedContact.phone}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-gray-900">
                    {format(new Date(selectedContact.created_at), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sujet</h3>
                  <p className="text-gray-900">{selectedContact.subject}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Message</h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex space-x-3">
                {!selectedContact.is_read && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleMarkAsRead(selectedContact.id);
                      setSelectedContact({...selectedContact, is_read: true});
                    }}
                    loading={markAsReadMutation.isPending}
                    className="flex-1"
                  >
                    {t("contacts.markAsRead")}
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => window.open(
                    `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`,
                    '_blank'
                  )}
                  className="flex-1"
                >
                  {t("contacts.reply")}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}