import { AquamanStep } from './Types';
export declare const aquamanNext: (data?: any) => {
    type: AquamanStep.NEXT;
    data?: any;
};
export declare const aquamanPrevious: () => {
    type: AquamanStep.PREVIOUS;
};
export declare const aquamanClose: () => {
    type: AquamanStep.CLOSE;
};
export declare const aquamanForceFlow: (key: string) => {
    type: AquamanStep.FORCE_FLOW;
    key: string;
};
