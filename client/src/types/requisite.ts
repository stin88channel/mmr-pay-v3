export type RequisiteType = {
  id: string;
  bank: string;
  requisites: string;
  fullName: string;
  limits: {
    daily: number;
    monthly: number;
  };
  turnover: number;
  isActive: boolean;
  createdAt?: Date;
  lastUsed?: Date;
  description?: string;
  category?: 'personal' | 'business' | 'partner' | 'transgran';
  verification?: 'verified' | 'pending' | 'rejected';
};
