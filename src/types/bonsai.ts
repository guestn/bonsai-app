export interface BonsaiEvent {
  id: string;
  description: string;
  date: string;
  value?: number;
  cost?: number;
}

export interface BonsaiTree {
  id: string;
  name: string;
  species: string;
  initialCost: number;
  acquisitionDate: string;
  events: BonsaiEvent[];
  images?: string[];
  notes?: string;
  status: 'active' | 'expired';
  type: 'purchased' | 'collected' | 'field';
  location?: string;
  potType?: string;
  age?: number;
}

export interface BonsaiFilters {
  search: string;
  status: string;
  type: string;
  species: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface BonsaiSortOptions {
  field:
    | 'name'
    | 'species'
    | 'acquisitionDate'
    | 'status'
    | 'type'
    | 'initialCost';
  direction: 'asc' | 'desc';
}
