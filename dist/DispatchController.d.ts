import { Dispatch } from 'redux';
import { FlowObj } from './Types';
export interface ControlledFlow {
    next: (data: any) => boolean;
    previous: () => void;
    getFlowId: () => string;
}
export declare const AQUAMAN_LOCATION_ID = "AQUAMAN_LOCATION_ID";
export default function flowController({ actionSeries, flowId, persist }: FlowObj, functionMap: {
    [functionKey: string]: Function;
}, dispatch: Dispatch<any>): ControlledFlow | null;
