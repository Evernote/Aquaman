import { MiddlewareAPI, Dispatch, AnyAction, Store } from 'redux';
import { FlowStarter } from './FlowStarter';
import { FlowObj, MapReduxToConfig, AquamanStep } from './Types';

function AquamanMiddleware(flows: FlowObj[], mapReduxToConfig: MapReduxToConfig): any {
  return (store: MiddlewareAPI<Dispatch<any>, any>) => (next: Dispatch<any>) => {
    const flow = new FlowStarter(
      flows,
      mapReduxToConfig,
      store as Store<any, AnyAction>,
      store.dispatch
    );

    return (action: any) => {
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
          flow.forceFlow(action.key, action.soft);
          break;
        default:
          break;
      }

      return next(action);
    };
  };
}

function applyAquaman(middleware: any) {
  return (createStore: Function) => (...args: any[]) => {
    const store = createStore(...args);
    let dispatch = (...dispatchArgs: any[]) => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed.
          'Other middleware would not be applied to this dispatch.
          Args: ${dispatchArgs}`
      );
    };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...middlewareArgs: any[]) => dispatch(...middlewareArgs),
      subscribe: store.subscribe,
    };
    dispatch = middleware(middlewareAPI)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}

export function Aquaman(flows: FlowObj[], mapReduxToConfig: MapReduxToConfig): any {
  return applyAquaman(AquamanMiddleware(flows, mapReduxToConfig));
}