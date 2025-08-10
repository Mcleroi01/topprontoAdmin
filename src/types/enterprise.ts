export type EnterpriseStatus = 'new' | 'contacted' | 'client' | 'inactive';

export interface Contact {
  name: string;
  email: string;
  phone?: string;
  position?: string;
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
  user?: {
    name: string;
    role: string;
  };
}

export interface Enterprise {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: EnterpriseStatus;
  created_at: string;
  updated_at: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  siret?: string;
  sector?: string;
  size?: string;
  contacts?: Contact[];
  notes?: Note[];
}
