import Grid from "./grid";
import { Node } from './node';

export default interface Solver {
    solve: (grid: Grid) => Promise<{ success: boolean, path?: Node[], visitedInOrder?: Node[] }>;
}