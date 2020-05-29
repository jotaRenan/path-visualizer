import { Node } from './node';
import { allowDiagonal } from '../utils/constants';

export default class Grid {
    public readonly nodes: Node[][];
    private _startNode: Node | undefined = undefined;
    private _finishNode: Node | undefined = undefined;
    private templateWalls: Set<number>;

    constructor(rows: number, columns: number) {
        this.templateWalls = new Set();
        const hash = window.location.hash.slice(1).split('&')[2];
        if (hash) {
            const entries = hash.split(':').map(x => parseInt(x, 10));
            this.templateWalls = new Set(entries);
        }
        this.nodes = this.generateNodes(rows, columns);
    }

    set startNode(node: Node | undefined) {
        this.startNode?.unsetAsStart();
        this._startNode = node;
        node?.setAsStart();
    }

    get startNode() {
        return this._startNode;
    }

    set finishNode(node: Node | undefined) {
        this.finishNode?.unsetAsFinish();
        this._finishNode = node;
        node?.setAsFinish();
    }

    get finishNode() {
        return this._finishNode;
    }

    public reset() {
        this.nodes.forEach(row => row.forEach(node => node.reset()));
    }

    private generateNodes(rows: number, columns: number) {
        const nodesGrid = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < columns; j++) {
                const nodeId = i * columns + j;
                const newNode = new Node(nodeId, i, j);
                if (this.templateWalls.has(nodeId)) {
                    newNode.markAsWall(true);
                }
                row.push(newNode);
            }
            nodesGrid.push(row);
        }

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const neighbors = [];
                if (i !== 0) {
                    if (allowDiagonal && j !== 0) neighbors.push(nodesGrid[i - 1][j - 1]); // above left
                    neighbors.push(nodesGrid[i - 1][j]); // above
                    if (allowDiagonal && j !== columns - 1) neighbors.push(nodesGrid[i - 1][j + 1]); // above right
                }
                if (j !== columns - 1) {
                    neighbors.push(nodesGrid[i][j + 1]); // right
                }
                if (i !== rows - 1) {
                    if (allowDiagonal && j !== 0) neighbors.push(nodesGrid[i + 1][j - 1]); // below left
                    neighbors.push(nodesGrid[i + 1][j]); // below
                    if (allowDiagonal && j !== columns - 1) neighbors.push(nodesGrid[i + 1][j + 1]); // below right
                }
                if (j !== 0) {
                    neighbors.push(nodesGrid[i][j - 1]); // left
                }
                const node = nodesGrid[i][j];
                node.neighbors = neighbors;
            }
        }
        return nodesGrid;
    }
}