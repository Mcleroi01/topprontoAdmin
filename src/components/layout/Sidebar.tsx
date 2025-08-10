import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  MessageCircle, 
  Briefcase,
  LogOut,
  Truck
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

export function Sidebar() {
  const { t } = useTranslation()
  const { signOut } = useAuth()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/drivers', icon: Users, label: t('nav.drivers') },
    { to: '/enterprises', icon: Building2, label: t('nav.enterprises') },
    { to: '/contacts', icon: MessageCircle, label: t('nav.contacts') },
    { to: '/job-offers', icon: Briefcase, label: t('nav.jobOffers') },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <Truck className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">TopPronto</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  )
}