export type StatusType = 'active' | 'checking' | 'closed' | 'cancelled';

export interface RequestType {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: StatusType;
  method: string;
  bank: string;
  requisites: string;
}
