const FlowGraph = require("./Graph").default;
const Node = require("./Graph").Node;
const branch = require("./Branch").branch;

describe("FlowGraph", () => {
  const actionSeries = [
    "action1",
    "action2",
    "action3",
    branch(
      ["action4"],
      ["action5"],
      ["action6", branch(["action7"], ["action8"])]
    ),
    "action9",
  ];

  describe("#makeSubGraph", () => {
    it("handles an empty actionSeries", () => {
      expect(FlowGraph.makeSubGraph([])).toBeNull();
    });

    it("correctly generates the graph", () => {
      Node.resetCounterGen();

      const node904 = new Node("action9", [], "6");
      const node903 = new Node("action9", [], "4");
      const node902 = new Node("action9", [], "2");
      const node901 = new Node("action9", [], "0");
      const node8 = new Node("action8", [node904], "7");
      const node7 = new Node("action7", [node903], "5");
      const node6 = new Node("action6", [node7, node8], "8");
      const node5 = new Node("action5", [node902], "3");
      const node4 = new Node("action4", [node901], "1");
      const node3 = new Node("action3", [node4, node5, node6], "9");
      const node2 = new Node("action2", [node3], "10");
      const node1 = new Node("action1", [node2], "11");

      node901.setParent(node4);
      node902.setParent(node5);
      node903.setParent(node7);
      node904.setParent(node8);
      node8.setParent(node6);
      node7.setParent(node6);
      node6.setParent(node3);
      node5.setParent(node3);
      node4.setParent(node3);
      node3.setParent(node2);
      node2.setParent(node1);

      expect(FlowGraph.makeSubGraph(actionSeries)).toEqual(node1);
    });
  });

  describe("#next", () => {
    it("can step through a graph, returning the correct values", () => {
      const graph = new FlowGraph(actionSeries);

      expect(graph.next()).toBe("action1");
      expect(graph.next()).toBe("action2");
      expect(graph.next()).toBe("action3");
      expect(graph.next(2)).toBe("action6");
      expect(graph.next(1)).toBe("action8");
      expect(graph.next()).toBe("action9");
      expect(graph.next()).toBeNull();
    });
  });

  describe("#previous", () => {
    it("can navigate back and forth through the graph", () => {
      const graph = new FlowGraph(actionSeries);

      expect(graph.next()).toBe("action1");
      expect(graph.next()).toBe("action2");
      expect(graph.previous()).toBe("action1");
      expect(graph.next()).toBe("action2");
      expect(graph.next()).toBe("action3");
      expect(graph.next(2)).toBe("action6");
      expect(graph.previous()).toBe("action3");
      expect(graph.next(1)).toBe("action5");
      expect(graph.next()).toBe("action9");
      expect(graph.previous()).toBe("action5");
      expect(graph.previous()).toBe("action3");
      expect(graph.previous()).toBe("action2");
      expect(graph.previous()).toBe("action1");
      expect(graph.previous()).toBe("action1");
    });
  });

  describe("Symbol.iterator", () => {
    it("can traverse the graph and find every node", () => {
      const graph = new FlowGraph(actionSeries);

      expect([...graph].length).toBe(12);
    });

    it("gets all the unique ids", () => {
      const graph = new FlowGraph(actionSeries);

      expect(new Set([...graph].map((node) => node.nodeId)).size).toBe(12);
    });

    it("won't error out with an empty actionSeries", () => {
      const graph = new FlowGraph([]);

      expect([...graph].length).toBe(0);
    });
  });

  describe("#setPosition", () => {
    it("can recover a posistion in the graph", () => {
      const graph = new FlowGraph(actionSeries);

      graph.setPosition("3");

      expect(graph.next()).toBe("action5");
      expect(graph.next()).toBe("action9");
    });
  });
});
