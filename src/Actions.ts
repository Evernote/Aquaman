import { AquamanStep } from './Types';

export const aquamanNext = (
  data?: any
): {
  type: AquamanStep.NEXT;
  data?: any;
} => ({
  type: AquamanStep.NEXT,
  data,
});
export const aquamanPrevious = (): {
  type: AquamanStep.PREVIOUS;
} => ({
  type: AquamanStep.PREVIOUS,
});
export const aquamanClose = (): {
  type: AquamanStep.CLOSE;
} => ({
  type: AquamanStep.CLOSE,
});
export const aquamanForceFlow = (
  key: string,
  soft?: boolean,
): {
  type: AquamanStep.FORCE_FLOW;
  key: string;
  soft?: boolean;
} => ({
  type: AquamanStep.FORCE_FLOW,
  key,
  soft,
});