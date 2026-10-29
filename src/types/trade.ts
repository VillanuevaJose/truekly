export type CategoryId = 
  | 'todos' 
  | 'tecnologia' 
  | 'audio-foto' 
  | 'movilidad' 
  | 'instrumentos' 
  | 'libros-cultura';

export interface UserOwner {
  name: string;
  avatar: string;
  reputation: number; // e.g. 4.9
  tradesCompleted: number;
  verified: boolean;
  city: string;
}

export interface TradeItem {
  id: string;
  title: string;
  category: CategoryId;
  estimatedValuePEN: number;
  condition: 'Como nuevo' | 'Excelente' | 'Buen estado';
  location: string;
  owner: UserOwner;
  image: string;
  seeking: string;
  description: string;
  safeMeetingPoint: string;
  tags: string[];
  createdAt: string;
}

export interface TradeProposal {
  targetItemId: string;
  offeredTitle: string;
  offeredValuePEN: number;
  cashAdjustmentPEN: number; // positive = sender pays difference, negative = sender asks difference
  meetingPoint: string;
  note: string;
}
