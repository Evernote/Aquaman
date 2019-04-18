import { Store, Dispatch } from 'redux';
import { ControlledFlow } from './DispatchController';
import { FlowObj, MapReduxToConfig, AquamanConfig } from './Types';
export declare class FlowStarter {
    constructor(flows: FlowObj[], mapReduxToConfig: MapReduxToConfig, store: Store, dispatch: Dispatch<any>);
    flows: FlowObj[];
    store: Store;
    dispatch: Dispatch<any>;
    config: AquamanConfig;
    currentFlow: ControlledFlow | null;
    done: boolean;
    initializeFlow: () => void;
    flowPicker: () => FlowObj;
    forceFlow: (flowKey: string) => void;
    next: (data?: any) => void;
    previous: () => void;
    close: () => void;
}
