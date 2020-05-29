import Grid from "./grid";
import { Node } from './node';

export type Solution = {
    node: Node;
    isPath: boolean;
};

export default interface Solver {
    solve: (grid: Grid) => Generator<Solution>;
}