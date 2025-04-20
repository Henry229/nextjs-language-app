export const SENDER = {
  USER: 'user',
  AI: 'ai',
} as const;

export type SenderType = (typeof SENDER)[keyof typeof SENDER];

export interface Message {
  sender: SenderType;
  text: string;
}
