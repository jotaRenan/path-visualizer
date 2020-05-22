import { fromEvent } from 'rxjs';
import { skip } from 'rxjs/operators';
import { NodeTuple as DomNodeTuple } from './application/node-tuple';
import { Node, NodeStatus } from './domain/node';
import Grid from './domain/grid';
import { DijkstraSolver } from './domain/dijkstraSolver';
import { AnimationDelay, Rows, Columns } from './utils/constants';
import Solver from './domain/solver';

window.onload = () => {
    const { rows, columns } = getParams();
    document.documentElement.style.setProperty('--rows', rows.toString());
    document.documentElement.style.setProperty('--columns', columns.toString());
}
let grid = generateGrid(Rows, Columns);

function getParams() {
    const hashInfo = window.location.hash.slice(1);
    const [rows, columns, wallsString = ''] = hashInfo.split('&');
    const wallsIds = wallsString.split(':').map(id => parseInt(id, 10));
    return {
        rows: rows ? parseInt(rows, 10) : Rows,
        columns: columns ? parseInt(columns, 10) : Columns,
        wallsIds,
    };
}

function generateGrid(rows: number, columns: number) {
    const grid = new Grid(rows, columns);
    generateDOMGrid(grid);

    grid.startNode = grid.nodes[0][0];
    grid.finishNode = grid.nodes[rows - 1][columns - 1];
    return grid;
};

function generateDOMGrid(grid: Grid) {
    const gridContainer = document.getElementById('GridContainer');
    while (gridContainer.firstChild) {
        gridContainer.firstChild.remove();
    }
    gridContainer.removeChild
    const tuples = grid.nodes.flat().map(node => generateDOMItem(grid, node));
    tuples.map(t => t.DOMnode).forEach(a => gridContainer.appendChild(a));
}

const wallEditState = { isMouseDown: false, willBuildWall: false };

function generateDOMItem(grid: Grid, node: Node): DomNodeTuple<Node> {
    const domNode = document.createElement('div');
    domNode.classList.add('cell');

    node.isStart$.pipe(skip(1)).subscribe((isStart: boolean) => {
        if (isStart) domNode.classList.add('start');
        else domNode.classList.remove('start');
    });
    node.isFinish$.pipe(skip(1)).subscribe((isFinish: boolean) => {
        if (isFinish) domNode.classList.add('finish');
        else domNode.classList.remove('finish');
    });
    node.status$.pipe(skip(1)).subscribe((status: NodeStatus) => {
        if (status === NodeStatus.Path) domNode.classList.add('path');
        if (status === NodeStatus.Visited) domNode.classList.add('visited');
        if (status === NodeStatus.Unvisited) {
            domNode.classList.remove('path');
            domNode.classList.remove('visited');
        }
    });
    node.isWall$.subscribe(isWall => {
        if (isWall) domNode.classList.add('wall');
        else domNode.classList.remove('wall');
    });

    fromEvent(domNode, 'click').subscribe(() => grid.startNode = node);
    fromEvent(domNode, 'dblclick').subscribe(() => grid.finishNode = node);
    fromEvent(domNode, 'mousedown').subscribe(() => {
        wallEditState.isMouseDown = true;
        wallEditState.willBuildWall = !node.isWall;
        node.markAsWall(!node.isWall);
    });
    fromEvent(domNode, 'mouseup').subscribe(() => wallEditState.isMouseDown = false);
    fromEvent(domNode, 'mouseenter').subscribe(() => {
        if (wallEditState.isMouseDown) {
            node.markAsWall(wallEditState.willBuildWall);
        }
    });

    return { DOMnode: domNode, model: node };
}

window.onhashchange = function () {
    const { rows, columns } = getParams();
    grid = generateGrid(rows, columns);
}

const solver: Solver = new DijkstraSolver();
document.getElementById('solveButton').onclick = solve;
document.getElementById('resetButton').onclick = () => grid.reset();
document.getElementById('testButton').onclick = () => window.history.pushState(null, null, '#15&30&1:10:11:12:13:14:15:16:90:91');

function solve() {
    solver.solve(grid).then(({ success, path, visitedInOrder }) => {

        if (!success) {
            for (let i = 0; i < (visitedInOrder as Node[]).length; i++) {
                setTimeout(() => {
                    (visitedInOrder as Node[])[i].markAsVisited();
                }, i * AnimationDelay);

            }
        } else {
            for (let i = 0; i <= (visitedInOrder as Node[]).length; i++) {
                if (i === (visitedInOrder as Node[]).length) {
                    setTimeout(() => visualizePath(path as Node[]), i * AnimationDelay);
                    return;
                }
                setTimeout(() => {
                    (visitedInOrder as Node[])[i].markAsVisited();
                }, i * AnimationDelay);

            }
        }
    })
}

function visualizePath(path: Node[]) {
    for (let i = 0; i < path.length; i++) {
        const node = path[i];
        setTimeout(() => {
            node.markAsPath();
        }, i * AnimationDelay);
    }
}