import { branchIterator } from "./Branch";
import { AquamanAction, ActionSeries, Branch } from "./Types";

export class Node {
  value: AquamanAction;
  children: Node[];
  parent?: Node;
  nodeId: string;

  constructor(value: AquamanAction, children: Node[], id?: string) {
    this.value = value;
    this.children = children;
    this.nodeId = id || String(Node.counterGen.next().value);
  }

  setParent(node: Node): void {
    this.parent = node;
  }

  static *counter(): IterableIterator<number> {
    let count = 0;
    while (true) {
      yield (count += 1);
    }
  }

  static counterGen = Node.counter();

  static resetCounterGen(): void {
    Node.counterGen = Node.counter();
  }
}

export default class Graph implements Iterable<Node> {
  currentNode?: Node;
  initial: boolean = true;

  constructor(series: ActionSeries) {
    Node.resetCounterGen();
    this.currentNode = Graph.makeSubGraph(series) as Node;
  }

  getCurrent(): AquamanAction | null {
    if (!this.currentNode) {
      return null;
    }

    return this.currentNode.value;
  }

  next(indexOrData?: any): AquamanAction | null {
    if (!this.currentNode) {
      return null;
    }

    if (this.initial) {
      this.initial = false;
      return this.currentNode.value;
    }

    const { children } = this.currentNode;
    this.currentNode =
      indexOrData && typeof indexOrData === "number"
        ? children[indexOrData]
        : children[0];

    if (!this.currentNode) {
      return null;
    }

    return this.currentNode.value;
  }

  getCurrentNodeId(): string {
    const node = this.currentNode;
    if (node) {
      return node.nodeId;
    }
    return "";
  }

  previous(): AquamanAction | null {
    if (!this.currentNode) {
      return null;
    }

    const { parent } = this.currentNode;
    if (parent) {
      this.currentNode = parent;
    }

    return this.currentNode.value;
  }

  setPosition(nodeId: string): AquamanAction | null {
    for (const node of this) {
      if (nodeId === node.nodeId) {
        this.initial = true;
        this.currentNode = node;
        return this.currentNode.value;
      }
    }

    return null;
  }

  *traverse(): IterableIterator<Node> {
    if (!this.currentNode) {
      return;
    }

    let stack = [this.currentNode];

    while (stack.length) {
      const current = stack.pop() as Node;
      yield current;

      stack = stack.concat(current.children);
    }
  }

  [Symbol.iterator] = this.traverse;

  static makeSubGraph([step, ...remainingSteps]: ActionSeries):
    | Node
    | Node[]
    | null {
    if (!step) {
      return null;
    }

    // eslint-disable-next-line no-underscore-dangle
    if ((step as Branch).__BRANCH__) {
      (step as Branch)[Symbol.iterator] = branchIterator;

      /** A Branch object has action series on it's numbered properties. Here,
       * we iterate through each of those arrays, append the remaining steps,
       * and recursively make subgraphs for those complete action series.
       */

      // error indicating Branch does not have Symbol.iterator, even though we
      // add it on line above.
      // @ts-ignore
      return [...(step as Branch)]
        .map((substep) => substep.concat(remainingSteps))
        .map((currentSeries: ActionSeries) =>
          this.makeSubGraph(currentSeries)
        ) as Node[];
    }

    const children = this.makeChildren(remainingSteps);

    const node = new Node(step, children as Node[]);
    (children as Node[]).forEach((child) => {
      child.setParent(node);
    });

    return node;
  }

  static makeChildren(remainingSteps: ActionSeries): Node[] | Node[][] {
    const subSeries = this.makeSubGraph(remainingSteps);
    return ((): Node[] => {
      if (subSeries && (subSeries as Node[]).length) {
        return subSeries as Node[];
      }

      return [subSeries] as Node[];
    })().filter((val) => val != null);
  }
}
