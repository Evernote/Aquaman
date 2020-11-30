const { FlowStarter } = require("./FlowStarter");

describe("Aquaman", () => {
  const onEndFlow = jest.fn();
  const onStep = jest.fn();
  const shouldStartFlow = jest.fn();
  shouldStartFlow.mockReturnValue(true);
  const onWillChooseFlow = jest.fn();
  const functionMap = {};
  const store = {
    getState: jest.fn(),
    subscribe: jest.fn(),
  };
  const dispatch = jest.fn();

  function mapReduxToConfig() {
    return {
      onEndFlow,
      onStep,
      shouldStartFlow,
      onWillChooseFlow,
      functionMap,
    };
  }
  jest.useFakeTimers();

  beforeEach(() => {
    jest.clearAllTimers();
    onEndFlow.mockReset();
    onStep.mockReset();
    shouldStartFlow.mockReset();
    shouldStartFlow.mockReturnValue(true);
    onWillChooseFlow.mockReset();
    store.getState.mockReset();
    dispatch.mockReset();
  });

  describe("initialization", () => {
    it("has its externally facing properties", () => {
      const aquaman = new FlowStarter([], mapReduxToConfig, store, dispatch);

      expect(aquaman).toHaveProperty("initializeFlow");
      expect(aquaman).toHaveProperty("next");
      expect(aquaman).toHaveProperty("previous");
      expect(aquaman).toHaveProperty("close");
    });
  });

  describe.skip("#initializeFlow", () => {
    const flows = [
      {
        flowId: "default",
        actionSeries: [{ type: "dothing" }],
        condition: () => true,
        persist: false,
      },
    ];

    it("will set a current flow with valid flows", () => {
      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);

      expect(aquaman.currentFlow).not.toBeNull;
    });

    it.skip("will call shouldStartFlow", () => {
      new FlowStarter([], mapReduxToConfig, store, dispatch);

      expect(shouldStartFlow).toHaveBeenCalledTimes(1);
    });

    it("will not set a current flow if shouldStartFlow returns false", () => {
      function mapReduxToConfigLocal() {
        return {
          shouldStartFlow: () => false,
        };
      }
      const aquaman = new FlowStarter(
        flows,
        mapReduxToConfigLocal,
        store,
        dispatch
      );

      expect(aquaman.currentFlow).toBeNull;
    });

    it("will not set a current flow if flow is not done", () => {
      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);
      aquaman.inProgress = false;

      expect(aquaman.currentFlow).toBeNull;
    });

    it("will call #onStep and #next and dispatch the first step", () => {
      new FlowStarter(flows, mapReduxToConfig, store, dispatch);

      expect(onStep).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({ type: "dothing" });
    });

    it("will pick the first flow with a true returning condition", () => {
      const localFlows = [
        {
          flowId: "flow1",
          actionSeries: [{ type: "flowAction1" }],
          condition: () => false,
          persist: false,
        },
        {
          flowId: "flow2",
          actionSeries: [{ type: "flowAction2" }],
          condition: () => true,
          persist: false,
        },
        {
          flowId: "flow3",
          actionSeries: [{ type: "flowAction3" }],
          condition: () => true,
          persist: false,
        },
      ];

      new FlowStarter(localFlows, mapReduxToConfig, store, dispatch);

      expect(dispatch).not.toHaveBeenCalledWith({ type: "flowAction1" });
      expect(dispatch).toHaveBeenCalledWith({ type: "flowAction2" });
      expect(dispatch).not.toHaveBeenCalledWith({ type: "flowAction3" });
    });

    it("can persist a position in the flow", () => {
      const actionSeries = [
        { type: "step1" },
        { type: "step2" },
        { type: "step3" },
      ];

      const localFlows = [
        {
          flowId: "flow1",
          actionSeries,
          condition: () => true,
          persist: true,
        },
      ];

      const aquaman = new FlowStarter(
        localFlows,
        mapReduxToConfig,
        store,
        dispatch
      );
      aquaman.next();

      // Simulate refresh
      const aquaman2 = new FlowStarter(
        localFlows,
        mapReduxToConfig,
        store,
        dispatch
      );

      expect(dispatch).lastCalledWith({ type: "step2" });

      expect(dispatch).not.toHaveBeenCalledWith({ type: "step3" });
    });

    it("can select another flow once the first one is done", () => {
      let flow1NotDone = true;
      const actionSeries1 = [
        { type: "step1" },
        { type: "step2" },
        [
          () => {
            flow1NotDone = false;
          },
          "__Aquaman_END_FLOW__",
        ],
      ];
      const actionSeries2 = [{ type: "step3" }, { type: "step4" }];

      const localFlows = [
        {
          flowId: "flow1",
          actionSeries: actionSeries1,
          condition: () => flow1NotDone,
          persist: true,
        },
        {
          flowId: "flow2",
          actionSeries: actionSeries2,
          condition: () => true,
          persist: true,
        },
      ];

      const aquaman = new FlowStarter(
        localFlows,
        mapReduxToConfig,
        store,
        dispatch
      );
      aquaman.next();

      // Simulate refresh
      const aquaman2 = new FlowStarter(
        localFlows,
        mapReduxToConfig,
        store,
        dispatch
      );

      expect(flow1NotDone).toBeTruthy;
      expect(dispatch).toHaveBeenCalledWith({ type: "step2" });

      aquaman2.next();

      expect(flow1NotDone).toBeFalsy;
      expect(dispatch).toHaveBeenCalledWith({ type: "step3" });

      aquaman2.next();
      expect(dispatch).toHaveBeenCalledWith({ type: "step4" });

      // Simulate refresh
      const aquaman3 = new FlowStarter(
        localFlows,
        mapReduxToConfig,
        store,
        dispatch
      );

      aquaman3.next();
      expect(dispatch).toHaveBeenLastCalledWith({ type: "step4" });

      expect(aquaman3.inProgress).toBeFalsy;
    });
  });

  describe.skip("#next", () => {
    it("will end the flow when called on last step of series", () => {
      const flows = [
        {
          flowId: "default",
          actionSeries: [{ type: "dothing" }],
          condition: () => true,
          persist: false,
        },
      ];

      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);
      aquaman.next();

      expect(onStep).toHaveBeenCalledTimes(2);
      expect(aquaman.inProgress).toBeFalsy;
      expect(onEndFlow).toHaveBeenCalledTimes(1);
      expect(onEndFlow).toBeCalledWith("default");
    });

    it("can handle branching", () => {
      const actionSeries = [
        { type: "step1" },
        {
          __BRANCH__: true,
          0: [{ type: "branch0" }],
          1: [
            { type: "branch1" },
            {
              __BRANCH__: true,
              0: [{ type: "branch3" }],
              1: [{ type: "branch4" }],
            },
            { type: "step4" },
          ],
        },
        {
          type: "step5",
        },
      ];

      const flows = [
        {
          flowId: "branched",
          actionSeries,
          condition: () => true,
          persist: false,
        },
      ];

      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);
      aquaman.next(1);
      aquaman.next(0);
      aquaman.next();
      aquaman.next();

      expect(dispatch).toHaveBeenCalledWith({ type: "step1" });
      expect(dispatch).not.toHaveBeenCalledWith({ type: "branch0" });
      expect(dispatch).toHaveBeenCalledWith({ type: "branch1" });
      expect(dispatch).not.toHaveBeenCalledWith({ type: "branch4" });
      expect(dispatch).toHaveBeenCalledWith({ type: "step4" });
      expect(dispatch).toHaveBeenCalledWith({ type: "step5" });
    });

    it("can handle actionCreators", () => {
      const actionSeries = [
        { type: "step1" },
        (data) => ({
          type: "step2",
          data,
        }),
      ];

      const flows = [
        {
          flowId: "actionCreators",
          actionSeries,
          condition: () => true,
          persist: false,
        },
      ];

      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);

      aquaman.next("someData");

      expect(dispatch).toHaveBeenCalledWith({
        type: "step2",
        data: "someData",
      });
    });

    it("can handle multi action steps", () => {
      const actionSeries = [
        { type: "step1" },
        [{ type: "action1" }, { type: "action2" }, "__Aquaman_END_FLOW__"],
      ];

      const flows = [
        {
          flowId: "actionCreators",
          actionSeries,
          condition: () => true,
          persist: false,
        },
      ];

      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);

      aquaman.next();

      expect(dispatch).toHaveBeenCalledWith({ type: "action1" });
      expect(dispatch).toHaveBeenCalledWith({ type: "action2" });
      expect(aquaman.inProgress).toBeFalsy;
    });

    it("can handle a normal function with no dispatch", () => {
      const stepFunc = jest.fn();

      const actionSeries = [
        { type: "step1" },
        [stepFunc, "__Aquaman_END_FLOW__"],
      ];

      const flows = [
        {
          flowId: "function",
          actionSeries,
          condition: () => true,
          persist: false,
        },
      ];

      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);

      aquaman.next();

      expect(stepFunc).toHaveBeenCalledTimes(1);
      // Called only on first step
      expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("can handle a mapped function", () => {
      const stepFunc = jest.fn();

      function localMapReduxToConfig() {
        return {
          functionMap: { stepFunc },
        };
      }

      const actionSeries = [
        { type: "step1" },
        [
          {
            __Aquaman_FUNCTION__: true,
            functionName: "stepFunc",
            args: ["a", "b"],
          },
          "__Aquaman_END_FLOW__",
        ],
      ];

      const flows = [
        {
          flowId: "functionMap",
          actionSeries,
          condition: () => true,
          persist: false,
        },
      ];

      const aquaman = new FlowStarter(
        flows,
        localMapReduxToConfig,
        store,
        dispatch
      );

      aquaman.next();

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(stepFunc).toHaveBeenCalledWith("a", "b");
    });
  });

  describe.skip("#previous", () => {
    it("steps backward", () => {
      const actionSeries = [{ type: "step1" }, { type: "step2" }];

      const flows = [
        {
          flowId: "previous",
          actionSeries,
          condition: () => true,
          persist: false,
        },
      ];

      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);
      aquaman.next();

      aquaman.previous();

      expect(dispatch).toHaveBeenLastCalledWith({ type: "step1" });
    });
  });

  describe.skip("#close", () => {
    it("ends the flow early", () => {
      const actionSeries = [
        { type: "step1" },
        { type: "step2" },
        { type: "step3" },
      ];

      const flows = [
        {
          flowId: "close",
          actionSeries,
          condition: () => true,
          persist: false,
        },
      ];

      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);
      aquaman.next();

      aquaman.close();

      expect(aquaman.inProgress).toBeFalsy;

      aquaman.next();

      expect(onEndFlow).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({ type: "step2" });
      expect(dispatch).not.toHaveBeenCalledWith({ type: "step3" });
    });
  });

  describe("#forceFlow", () => {
    it("allows selecting a specific flow", () => {
      const actionSeries = [
        { type: "step1" },
        { type: "step2" },
        { type: "step3" },
      ];

      const flows = [
        {
          flowId: "flow",
          actionSeries: [{ type: "step4" }],
          condition: () => false,
          persist: false,
          key: "flow1",
        },
        {
          flowId: "flow",
          actionSeries,
          condition: () => false,
          persist: false,
          key: "flow2",
        },
      ];

      const aquaman = new FlowStarter(flows, mapReduxToConfig, store, dispatch);
      aquaman.next();

      expect(aquaman.inProgress).toBeFalsy;

      aquaman.forceFlow("flow2");

      expect(aquaman.inProgress).toBeTruthy;
      expect(dispatch).toHaveBeenCalledWith({ type: "step1" });
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).not.toHaveBeenCalledWith({ type: "step4" });
    });
  });
});
