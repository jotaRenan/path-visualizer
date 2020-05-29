import Grid from "../domain/grid";
import { NodeTuple } from "./node-tuple";
import { Node, NodeStatus } from '../domain/node';
import { skip } from "rxjs/operators";
import { fromEvent } from "rxjs";
import { AnimationDelay } from "../utils/constants";
import { DijkstraSolver } from "../domain/dijkstraSolver";
import Solver, { Solution } from "../domain/solver";

export function generateGrid(rows: number, columns: number, gridContainer: HTMLElement) {
    const grid = new Grid(rows, columns);
    grid.nodes[0][0].setAsStart();
    grid.nodes[rows - 1][columns - 1].setAsFinish();
    generateDOMGrid(grid, gridContainer);

    return grid;
};

function generateDOMGrid(grid: Grid, gridContainer: HTMLElement) {
    clearGrid(gridContainer);
    grid.nodes
        .flat()
        .map(node => generateDOMItem(node))
        .forEach(gridNode => gridContainer.appendChild(gridNode));
}

function clearGrid(gridContainer: HTMLElement) {
    while (gridContainer.firstChild) {
        gridContainer.firstChild.remove();
    }
}

function generateDOMItem(node: Node) {
    const domNode = document.createElement('div');
    domNode.classList.add('cell');
    attachEventListeners(node, domNode);
    return domNode;
}

const wallEditState = { isMouseDown: false, willBuildWall: false };
function attachEventListeners(node: Node, domNode: HTMLDivElement) {
    node.isStart$.subscribe((isStart: boolean) => {
        if (isStart)
            domNode.classList.add('start');
        else
            domNode.classList.remove('start');
    });
    node.isFinish$.subscribe((isFinish: boolean) => {
        if (isFinish)
            domNode.classList.add('finish');
        else
            domNode.classList.remove('finish');
    });
    node.status$.pipe(skip(1)).subscribe((status: NodeStatus) => {
        if (status === NodeStatus.Path)
            domNode.classList.add('path');
        if (status === NodeStatus.Visited)
            domNode.classList.add('visited');
        if (status === NodeStatus.Unvisited) {
            domNode.classList.remove('path');
            domNode.classList.remove('visited');
        }
    });
    node.isWall$.subscribe(isWall => {
        if (isWall)
            domNode.classList.add('wall');
        else
            domNode.classList.remove('wall');
    });
    fromEvent(domNode, 'click').subscribe(() => node.setAsStart());
    fromEvent(domNode, 'dblclick').subscribe(() => node.setAsFinish());
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
}

export function solve(grid: Grid) {
    const solver: Solver = new DijkstraSolver();
    solver.solve(grid).then(visualizeSolution)
}

function visualizeSolution({ success, path, visitedInOrder }: Solution) {
    for (let i = 0; i < visitedInOrder.length; i++) {
        setTimeout(() => visitedInOrder[i].markAsVisited(), i * AnimationDelay);
    }
    if (success) {
        setTimeout(() => visualizePath(path), visitedInOrder.length * AnimationDelay);
    }
}

function visualizePath(path: Node[]) {
    for (let i = 0; i < path.length; i++) {
        const node = path[i];
        setTimeout(() => {
            node.markAsPath();
        }, i * AnimationDelay);
    }
}