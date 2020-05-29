import Grid from "./grid";
import { Node } from './node';

export type Solution = {
    success: boolean;
    path?: Node[];
    visitedInOrder?: Node[];
};

export default interface Solver {
    solve: (grid: Grid) => Promise<Solution>;
}