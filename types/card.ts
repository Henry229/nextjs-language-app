export const CARD_STATUS = {
  UNSEEN: 'unseen',
  LEARNING: 'learning',
  LEARNED: 'learned',
} as const;

export type CardStatusType = (typeof CARD_STATUS)[keyof typeof CARD_STATUS];

export interface Card {
  id: number;
  native: string;
  target: string;
  status: CardStatusType;
}
