import Solver, { Solution } from './solver.interface';
import Grid from "./grid";
import { Node } from "./node";

export class DijkstraSolver implements Solver {
    private visited: Node[];
    private unvisited: Node[];
    private distances: WeakMap<Node, number>;
    private previous: WeakMap<Node, Node>;

    reset() {
        this.visited = [];
        this.unvisited = [];
        this.distances = new WeakMap();
        this.previous = new WeakMap();
    }

    * solve(grid: Grid): Generator<Solution> {
        this.reset();
        if (grid.startNode === undefined) return { success: false, visitedInOrder: [] };

        const flattenedNodes = grid.nodes.flat().reverse();
        flattenedNodes.forEach(node => {
            this.unvisited.push(node);
            this.distances.set(node, Infinity);
        });
        grid.startNode.distance = 0;
        let closest: Node;
        while (this.unvisited.length !== 0) {
            this.unvisited.sort((a, b) => {
                if (a.distance > b.distance) {
                    return 1;
                } else if (a.distance < b.distance) {
                    return -1;
                }
                const closestId = closest?.id ?? grid.startNode.id;
                const aDist = a.id - closestId;
                const bDist = b.id - closestId;
                if (aDist > bDist) {
                    return -1;
                } else if (aDist < bDist) {
                    return 1;
                } else {
                    return 0;
                }
            });
            closest = this.unvisited.shift() as Node;
            if (closest.isWall) continue;
            if (closest.distance === Infinity) {
                yield { node: closest, isPath: false };
                return;
            }
            if (closest === grid.finishNode) {
                const path = this.getPathTo(closest);
                for (const node of path) {
                    yield { node, isPath: true };
                }
                return;
            }
            this.visited.push(closest);
            closest.visitationOrder = this.visited.length;
            yield { node: closest, isPath: false };

            for (const neighbor of closest?.neighbors.filter(n => !n.isWall)) {
                const currentNeighborDistance = neighbor.distance;
                const distanceThroughCurrent = closest.distance + 1;
                if (distanceThroughCurrent < currentNeighborDistance) {
                    neighbor.distance = distanceThroughCurrent;
                    this.previous.set(neighbor, closest);
                }
            }
        }
        return { success: false, visitedInOrder: this.visited };
    }

    getPathTo(target: Node | undefined, currentPath: Node[] = []): Node[] {
        if (target == undefined) return currentPath;
        return this.getPathTo(this.previous.get(target), [...currentPath, target]);
    }

}