import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EnterpriseStatus } from '@/types/enterprise';

interface EnterpriseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: EnterpriseStatus | 'all';
  onStatusChange: (status: EnterpriseStatus | 'all') => void;
  onResetFilters: () => void;
}

export function EnterpriseFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onResetFilters,
}: EnterpriseFiltersProps) {
  const statusOptions: { value: EnterpriseStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'new', label: 'Nouveau' },
    { value: 'contacted', label: 'Contacté' },
    { value: 'client', label: 'Client' },
    { value: 'inactive', label: 'Inactif' },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Rechercher
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="search"
              type="text"
              className="pl-10 block w-full sm:text-sm"
              placeholder="Nom, email, téléphone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as EnterpriseStatus | 'all')}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={onResetFilters}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </div>
  );
}
