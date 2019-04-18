import { AquamanAction, ActionSeries } from './Types';
export declare class Node {
    value: AquamanAction;
    children: Node[];
    parent?: Node;
    nodeId: string;
    constructor(value: AquamanAction, children: Node[], id?: string);
    setParent(node: Node): void;
    static counter(): IterableIterator<number>;
    static counterGen: IterableIterator<number>;
    static resetCounterGen(): void;
}
export default class Graph implements Iterable<Node> {
    currentNode?: Node;
    initial: boolean;
    constructor(series: ActionSeries);
    getCurrent(): AquamanAction | null;
    next(indexOrData?: any): AquamanAction | null;
    getCurrentNodeId(): string;
    previous(): AquamanAction | null;
    setPosition(nodeId: string): AquamanAction | null;
    traverse(): IterableIterator<Node>;
    [Symbol.iterator]: () => IterableIterator<Node>;
    static makeSubGraph([step, ...remainingSteps]: ActionSeries): Node | Node[] | null;
    static makeChildren(remainingSteps: ActionSeries): Node[] | Node[][];
}
