import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Header() {
  const { t, i18n } = useTranslation()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'pt', name: 'Português' },
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <header className=" shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t('dashboard.title')}
          </h1>
        </Link>
        
        {/* Language selector */}
        <div className="relative">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <Globe className="h-5 w-5 text-yellow-400" />
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-gray-900 focus:outline-none text-sm cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className=" text-gray-900">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}