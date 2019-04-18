import { Branch, ActionSeries } from './Types';
export declare function branch(...args: ActionSeries[]): Branch;
export declare function branchIterator(this: Branch): IterableIterator<ActionSeries>;
