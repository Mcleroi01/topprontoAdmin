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
    <aside className="w-64  text-gray-900 shadow-sm">
      <div className="p-6 flex items-center justify-center border-b border-gray-400">
        <h1 className=' text-3xl font-bold text-green-700'>Topronto</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${isActive
                    ? 'bg-yellow-500 text-green-900 shadow-md transform -translate-x-1'
                    : 'text-gray-700 hover:bg-gray-700 hover:text-white hover:pl-6'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 ">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-gray-900 hover:bg-gray-700 hover:text-white rounded-lg py-3 text-left transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          {t('auth.signOut')}
        </Button>
      </div>
    </aside>
  )
}