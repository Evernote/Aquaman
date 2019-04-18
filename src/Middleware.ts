import { MiddlewareAPI, Dispatch, AnyAction, Store } from 'redux';
import { FlowStarter } from './FlowStarter';
import { FlowObj, MapReduxToConfig, AquamanStep } from './Types';

export function Aquaman(flows: FlowObj[], mapReduxToConfig: MapReduxToConfig): any {
  return (store: MiddlewareAPI<Dispatch<any>, any>) => (next: Dispatch<any>) => {
    const flow = new FlowStarter(
      flows,
      mapReduxToConfig,
      store as Store<any, AnyAction>,
      store.dispatch
    );

    return (action: any) => {
      flow.initializeFlow();
      switch (action.type) {
        case AquamanStep.NEXT:
          flow.next(action.data);
          break;
        case AquamanStep.PREVIOUS:
          flow.previous();
          break;
        case AquamanStep.CLOSE:
          flow.close();
          break;
        case AquamanStep.FORCE_FLOW:
          flow.forceFlow(action.key);
          break;
        default:
          break;
      }

      return next(action);
    };
  };
}