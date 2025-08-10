import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.title')}
        </h1>
        
        {/* Language selector */}
        <div className="relative">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-400" />
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
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