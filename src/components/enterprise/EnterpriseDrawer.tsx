import { X, Mail, Phone, MapPin, Globe, Building, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Enterprise } from '@/types/enterprise';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EnterpriseDrawerProps {
  enterprise: Enterprise | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (enterpriseId: string, newStatus: Enterprise['status']) => void;
}

export function EnterpriseDrawer({ enterprise, isOpen, onClose, onStatusChange }: EnterpriseDrawerProps) {
  if (!enterprise) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPPp', { locale: ptBR });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date inconnue';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {enterprise.name}
                <StatusBadge status={enterprise.status} />
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Créé le {formatDate(enterprise.created_at)}
                {enterprise.updated_at && ` • Dernière mise à jour le ${formatDate(enterprise.updated_at)}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 -mt-2 -mr-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                Informations générales
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{enterprise.email || 'Non spécifié'}</p>
                  </div>
                </div>
                {enterprise.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{enterprise.phone}</p>
                    </div>
                  </div>
                )}
                {enterprise.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Site web</p>
                      <a
                        href={enterprise.website.startsWith('http') ? enterprise.website : `https://${enterprise.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-green-600 hover:underline"
                      >
                        {enterprise.website}
                      </a>
                    </div>
                  </div>
                )}
                {enterprise.siret && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">SIRET</p>
                      <p className="font-mono text-sm">{enterprise.siret}</p>
                    </div>
                  </div>
                )}
              </div>

              {(enterprise.address || enterprise.postal_code || enterprise.city || enterprise.country) && (
                <div className="pt-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </h4>
                  <div className="space-y-1">
                    {enterprise.address && <p className="text-sm">{enterprise.address}</p>}
                    {(enterprise.postal_code || enterprise.city) && (
                      <p className="text-sm">
                        {enterprise.postal_code} {enterprise.city}
                      </p>
                    )}
                    {enterprise.country && <p className="text-sm">{enterprise.country}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Contacts */}
            {enterprise.contacts && enterprise.contacts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Contacts
                </h3>
                <div className="space-y-4">
                  {enterprise.contacts.map((contact, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{contact.name}</h4>
                          {contact.position && (
                            <p className="text-sm text-muted-foreground">{contact.position}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-green-600 hover:underline"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${contact.phone}`} className="hover:underline">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {enterprise.notes && enterprise.notes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <div className="space-y-4">
                {enterprise.notes.map((note, index) => (
                  <div key={index} className="border-l-4 border-green-600 pl-4 py-2">
                    <p className="text-sm">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.created_at)}
                      </span>
                      {note.user && (
                        <span className="text-xs text-muted-foreground">
                          • Par {note.user.name} ({note.user.role})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="space-x-2">
            {Object.keys(statusLabels).map((status) => {
              const statusKey = status as Enterprise['status'];
              return (
                <Button
                  key={statusKey}
                  variant={enterprise.status === statusKey ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStatusChange(enterprise.id, statusKey)}
                  disabled={enterprise.status === statusKey}
                  className="capitalize"
                >
                  {statusLabels[statusKey]}
                </Button>
              );
            })}
          </div>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
