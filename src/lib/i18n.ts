import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.drivers': 'Drivers',
      'nav.enterprises': 'Enterprises', 
      'nav.contacts': 'Contacts',
      'nav.jobOffers': 'Job Offers',
      'nav.logout': 'Logout',
      
      // Authentication
      'auth.login': 'Login',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.signIn': 'Sign In',
      'auth.invalidCredentials': 'Invalid credentials',
      
      // Dashboard
      'dashboard.title': 'Admin Dashboard',
      'dashboard.overview': 'Overview',
      'dashboard.totalDrivers': 'Total Drivers',
      'dashboard.pendingDrivers': 'Pending Drivers',
      'dashboard.totalEnterprises': 'Total Enterprises',
      'dashboard.newEnterprises': 'New Enterprises',
      'dashboard.unreadContacts': 'Unread Contacts',
      'dashboard.activeJobOffers': 'Active Job Offers',
      'dashboard.recentActivity': 'Recent Activity',
      
      // Drivers
      'drivers.title': 'Driver Applications',
      'drivers.pending': 'Pending',
      'drivers.approved': 'Approved',
      'drivers.rejected': 'Rejected',
      'drivers.all': 'All',
      'drivers.name': 'Name',
      'drivers.email': 'Email',
      'drivers.phone': 'Phone',
      'drivers.city': 'City',
      'drivers.experience': 'Experience',
      'drivers.vehicle': 'Vehicle',
      'drivers.status': 'Status',
      'drivers.actions': 'Actions',
      'drivers.view': 'View',
      'drivers.approve': 'Approve',
      'drivers.reject': 'Reject',
      'drivers.export': 'Export',
      
      // Enterprises
      'enterprises.title': 'Enterprise Requests',
      'enterprises.new': 'New',
      'enterprises.contacted': 'Contacted',
      'enterprises.converted': 'Converted',
      'enterprises.rejected': 'Rejected',
      'enterprises.name': 'Company',
      'enterprises.contact': 'Contact Person',
      'enterprises.industry': 'Industry',
      'enterprises.deliveries': 'Monthly Deliveries',
      
      // Contacts
      'contacts.title': 'Contact Messages',
      'contacts.read': 'Read',
      'contacts.unread': 'Unread',
      'contacts.markAsRead': 'Mark as Read',
      'contacts.reply': 'Reply',
      
      // Job Offers
      'jobOffers.title': 'Job Offers',
      'jobOffers.active': 'Active',
      'jobOffers.inactive': 'Inactive',
      'jobOffers.applications': 'Applications',
      'jobOffers.addNew': 'Add New Offer',
      
      // Common
      'common.search': 'Search...',
      'common.filter': 'Filter',
      'common.reset': 'Reset',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.loading': 'Loading...',
      'common.noData': 'No data available',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.date': 'Date',
      'common.createdAt': 'Created',
      'common.updatedAt': 'Updated',
    }
  },
  fr: {
    translation: {
      // Navigation
      'nav.dashboard': 'Tableau de Bord',
      'nav.drivers': 'Chauffeurs',
      'nav.enterprises': 'Entreprises',
      'nav.contacts': 'Contacts',
      'nav.jobOffers': 'Offres d\'Emploi',
      'nav.logout': 'Déconnexion',
      
      // Authentication
      'auth.login': 'Connexion',
      'auth.email': 'Email',
      'auth.password': 'Mot de passe',
      'auth.forgotPassword': 'Mot de passe oublié?',
      'auth.signIn': 'Se connecter',
      'auth.invalidCredentials': 'Identifiants invalides',
      
      // Dashboard
      'dashboard.title': 'Tableau de Bord Admin',
      'dashboard.overview': 'Vue d\'ensemble',
      'dashboard.totalDrivers': 'Total Chauffeurs',
      'dashboard.pendingDrivers': 'Chauffeurs en Attente',
      'dashboard.totalEnterprises': 'Total Entreprises',
      'dashboard.newEnterprises': 'Nouvelles Entreprises',
      'dashboard.unreadContacts': 'Contacts Non Lus',
      'dashboard.activeJobOffers': 'Offres Actives',
      'dashboard.recentActivity': 'Activité Récente',
      
      // Drivers
      'drivers.title': 'Candidatures Chauffeurs',
      'drivers.pending': 'En Attente',
      'drivers.approved': 'Approuvé',
      'drivers.rejected': 'Rejeté',
      'drivers.all': 'Tous',
      'drivers.name': 'Nom',
      'drivers.email': 'Email',
      'drivers.phone': 'Téléphone',
      'drivers.city': 'Ville',
      'drivers.experience': 'Expérience',
      'drivers.vehicle': 'Véhicule',
      'drivers.status': 'Statut',
      'drivers.actions': 'Actions',
      'drivers.view': 'Voir',
      'drivers.approve': 'Approuver',
      'drivers.reject': 'Rejeter',
      'drivers.export': 'Exporter',
      
      // Enterprises
      'enterprises.title': 'Demandes Entreprises',
      'enterprises.new': 'Nouveau',
      'enterprises.contacted': 'Contacté',
      'enterprises.converted': 'Converti',
      'enterprises.rejected': 'Rejeté',
      'enterprises.name': 'Entreprise',
      'enterprises.contact': 'Personne de Contact',
      'enterprises.industry': 'Secteur',
      'enterprises.deliveries': 'Livraisons Mensuelles',
      
      // Contacts
      'contacts.title': 'Messages de Contact',
      'contacts.read': 'Lu',
      'contacts.unread': 'Non Lu',
      'contacts.markAsRead': 'Marquer comme Lu',
      'contacts.reply': 'Répondre',
      
      // Job Offers
      'jobOffers.title': 'Offres d\'Emploi',
      'jobOffers.active': 'Actives',
      'jobOffers.inactive': 'Inactives',
      'jobOffers.applications': 'Candidatures',
      'jobOffers.addNew': 'Nouvelle Offre',
      
      // Common
      'common.search': 'Rechercher...',
      'common.filter': 'Filtrer',
      'common.reset': 'Réinitialiser',
      'common.save': 'Sauvegarder',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.loading': 'Chargement...',
      'common.noData': 'Aucune donnée disponible',
      'common.yes': 'Oui',
      'common.no': 'Non',
      'common.date': 'Date',
      'common.createdAt': 'Créé le',
      'common.updatedAt': 'Modifié le',
    }
  },
  pt: {
    translation: {
      // Navigation
      'nav.dashboard': 'Painel',
      'nav.drivers': 'Motoristas',
      'nav.enterprises': 'Empresas',
      'nav.contacts': 'Contatos',
      'nav.jobOffers': 'Ofertas de Emprego',
      'nav.logout': 'Sair',
      
      // Authentication
      'auth.login': 'Login',
      'auth.email': 'Email',
      'auth.password': 'Senha',
      'auth.forgotPassword': 'Esqueceu a senha?',
      'auth.signIn': 'Entrar',
      'auth.invalidCredentials': 'Credenciais inválidas',
      
      // Dashboard
      'dashboard.title': 'Painel Administrativo',
      'dashboard.overview': 'Visão Geral',
      'dashboard.totalDrivers': 'Total Motoristas',
      'dashboard.pendingDrivers': 'Motoristas Pendentes',
      'dashboard.totalEnterprises': 'Total Empresas',
      'dashboard.newEnterprises': 'Novas Empresas',
      'dashboard.unreadContacts': 'Contatos Não Lidos',
      'dashboard.activeJobOffers': 'Ofertas Ativas',
      'dashboard.recentActivity': 'Atividade Recente',
      
      // Drivers
      'drivers.title': 'Candidaturas de Motoristas',
      'drivers.pending': 'Pendente',
      'drivers.approved': 'Aprovado',
      'drivers.rejected': 'Rejeitado',
      'drivers.all': 'Todos',
      'drivers.name': 'Nome',
      'drivers.email': 'Email',
      'drivers.phone': 'Telefone',
      'drivers.city': 'Cidade',
      'drivers.experience': 'Experiência',
      'drivers.vehicle': 'Veículo',
      'drivers.status': 'Status',
      'drivers.actions': 'Ações',
      'drivers.view': 'Ver',
      'drivers.approve': 'Aprovar',
      'drivers.reject': 'Rejeitar',
      'drivers.export': 'Exportar',
      
      // Enterprises
      'enterprises.title': 'Solicitações de Empresas',
      'enterprises.new': 'Novo',
      'enterprises.contacted': 'Contatado',
      'enterprises.converted': 'Convertido',
      'enterprises.rejected': 'Rejeitado',
      'enterprises.name': 'Empresa',
      'enterprises.contact': 'Pessoa de Contato',
      'enterprises.industry': 'Setor',
      'enterprises.deliveries': 'Entregas Mensais',
      
      // Contacts
      'contacts.title': 'Mensagens de Contato',
      'contacts.read': 'Lido',
      'contacts.unread': 'Não Lido',
      'contacts.markAsRead': 'Marcar como Lido',
      'contacts.reply': 'Responder',
      
      // Job Offers
      'jobOffers.title': 'Ofertas de Emprego',
      'jobOffers.active': 'Ativas',
      'jobOffers.inactive': 'Inativas',
      'jobOffers.applications': 'Candidaturas',
      'jobOffers.addNew': 'Nova Oferta',
      
      // Common
      'common.search': 'Pesquisar...',
      'common.filter': 'Filtrar',
      'common.reset': 'Redefinir',
      'common.save': 'Salvar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Deletar',
      'common.edit': 'Editar',
      'common.loading': 'Carregando...',
      'common.noData': 'Nenhum dado disponível',
      'common.yes': 'Sim',
      'common.no': 'Não',
      'common.date': 'Data',
      'common.createdAt': 'Criado em',
      'common.updatedAt': 'Atualizado em',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n