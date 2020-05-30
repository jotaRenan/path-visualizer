import { fromEvent, interval, never, Observable, of } from "rxjs";
import { filter, map, scan, skip, startWith, switchMap, takeWhile, tap, concatMap } from "rxjs/operators";
import { DijkstraSolver } from "../domain/dijkstraSolver";
import Grid from "../domain/grid";
import { Node, NodeStatus } from '../domain/node';
import Solver, { Solution } from "../domain/solver.interface";
import { AnimationDelay } from "../utils/constants";

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
    registerModelListeners(node, domNode);
    registerDOMListeners(domNode, node);
}

function registerModelListeners(node: Node, domNode: HTMLDivElement) {
    node.isStart$.subscribe((isStart: boolean) => {
        if (isStart) domNode.classList.add('start');
        else domNode.classList.remove('start');
    });
    node.isFinish$.subscribe((isFinish: boolean) => {
        if (isFinish) domNode.classList.add('finish');
        else domNode.classList.remove('finish');
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
        if (isWall) domNode.classList.add('wall');
        else domNode.classList.remove('wall');
    });
}

function registerDOMListeners(domNode: HTMLDivElement, node: Node) {
    fromEvent(domNode, 'click').subscribe(_ => node.setAsStart());
    fromEvent(domNode, 'dblclick').subscribe(_ => node.setAsFinish());
    fromEvent(domNode, 'mouseup').subscribe(_ => wallEditState.isMouseDown = false);
    fromEvent(domNode, 'mousedown').subscribe(_ => {
        wallEditState.isMouseDown = true;
        wallEditState.willBuildWall = !node.isWall;
        node.markAsWall(!node.isWall);
    });
    fromEvent(domNode, 'mouseenter')
        .pipe(filter(_ => wallEditState.isMouseDown))
        .subscribe(_ => node.markAsWall(wallEditState.willBuildWall));
}

export function solve(grid: Grid) {
    const solver: Solver = new DijkstraSolver();
    const solutionSteps = solver.solve(grid);
    const pauseButton = document.getElementById('pauseButton');

    const pauser = fromEvent(pauseButton, 'click')
        .pipe(
            scan((currentState) => !currentState, false),
            startWith(false)
        );

    const stepSolver$ = of(undefined).pipe(
        map(_ => solutionSteps.next()),
        takeWhile(steps => !steps.done),
        filter(step => step.value),
        map(step => step.value as Solution),
        tap(stepValue => visualizeNode(grid, stepValue))
    );

    const solver$ = interval(AnimationDelay)
        .pipe(
            switchMap(() => stepSolver$)
        );

    pauser.pipe(
        switchMap(paused => paused ? never() : solver$)
    ).subscribe();

    const nextStepButton = document.getElementById('nextStepButton');
    fromEvent(nextStepButton, 'click').pipe(
        switchMap(() => stepSolver$)
    ).subscribe();

}

function visualizeNode(grid: Grid, { isPath, node }: Solution) {
    if (node === grid.finishNode || node === grid.startNode) return;
    if (isPath) {
        node.markAsPath()
    } else {
        node.markAsVisited();
    }
}
