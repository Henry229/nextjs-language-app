export const STAGES = {
  LOAD: 'load',
  STAGE1: 'stage1',
  STAGE2: 'stage2',
  STAGE3: 'stage3',
  STAGE4: 'stage4',
} as const;

export type StageType = (typeof STAGES)[keyof typeof STAGES];
