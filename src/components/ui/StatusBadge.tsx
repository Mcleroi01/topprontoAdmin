import { cn } from '@/lib/utils';
import { EnterpriseStatus } from '@/types/enterprise';

interface StatusBadgeProps {
  status: EnterpriseStatus;
  className?: string;
}

export const statusVariants = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  client: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
} as const;

export const statusLabels: Record<EnterpriseStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  client: 'Client',
  inactive: 'Inactif',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusVariants[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
