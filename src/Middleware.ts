import {
  MiddlewareAPI,
  Dispatch,
  AnyAction,
  Store,
  compose,
  Reducer,
  StoreCreator,
  Middleware,
} from "redux";
import { FlowStarter } from "./FlowStarter";
import { FlowObj, MapReduxToConfig, AquamanStep } from "./Types";

function AquamanMiddleware(
  flows: FlowObj[],
  mapReduxToConfig: MapReduxToConfig
): any {
  return (store: MiddlewareAPI<Dispatch<any>, any>) => (next: Dispatch<any>) => {
    const flow = new FlowStarter(
      flows,
      mapReduxToConfig,
      store as Store<any, AnyAction>,
      store.dispatch
    );

    return (action?: { [key: string]: any; type: string; data: any }) => {
      switch (action?.type) {
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

function applyAquaman(
  aquamanMiddleware: Function,
  ...middlewares: Middleware[]
) {
  return (createStore: StoreCreator) =>
    <S, A extends AnyAction>(reducer: Reducer<S, A>, ...args: any[]) => {
      const store = createStore(reducer, ...args);
      let dispatch: Dispatch = () => {
        throw new Error(
          "Dispatching while constructing your middleware is not allowed. " +
            "Other middleware would not be applied to this dispatch."
        );
      };

      const middlewareAPI: MiddlewareAPI = {
        getState: store.getState,
        dispatch: (action, ...args) => dispatch(action, ...args),
      };
      const chain = middlewares.map((middleware: any) =>
        middleware(middlewareAPI)
      );
      chain.push(
        aquamanMiddleware({
          ...middlewareAPI,
          subscribe: store.subscribe,
        })
      );
      dispatch = compose<typeof dispatch>(...chain)(store.dispatch);

      return {
        ...store,
        dispatch,
      };
    };
}

/**
 * Use this to compose Aquaman middleware with the rest of your
 * Redux middleware.
 *
 * @param flows array of flow objects
 * @param mapReduxToConfig configuration object
 * @returns Redux middleware
 */
export function applyAquamanAndMiddleware(
  flows: FlowObj[],
  mapReduxToConfig: MapReduxToConfig
): any {
  return function (...middlewares: Middleware[]) {
    return applyAquaman(
      AquamanMiddleware(flows, mapReduxToConfig),
      ...middlewares
    );
  };
}
