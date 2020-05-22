import { BehaviorSubject } from "rxjs";

export enum NodeStatus {
    'Visited',
    'Unvisited',
    'Path',
};

export class Node {

    public readonly id: number;
    public readonly row: number;
    public readonly column: number;
    public distance: number;
    public visitationOrder: number = 0;
    private _neighbors: Node[] = [];
    private _status: BehaviorSubject<NodeStatus>;
    isStart: BehaviorSubject<boolean>;
    isFinish: BehaviorSubject<boolean>;
    _isWall: BehaviorSubject<boolean>;

    constructor(id: number, row: number, column: number) {
        this.id = id;
        this.row = row;
        this.column = column;
        this.isStart = new BehaviorSubject(false);
        this.isFinish = new BehaviorSubject(false);
        this.distance = Infinity;
        this._status = new BehaviorSubject(NodeStatus.Unvisited);
        this._isWall = new BehaviorSubject(false);
    }

    public markAsWall = (isWall: boolean) => {
        this._isWall.next(isWall);
        this.unsetAsFinish();
        this.unsetAsStart();
    }

    get isWall() {
        return this._isWall.value;
    }

    get isWall$() {
        return this._isWall.asObservable();
    }

    set neighbors(neighbors: Node[]) {
        this._neighbors = neighbors;
    }

    get neighbors() {
        return [...this._neighbors];
    }

    get status() {
        return this._status.asObservable();
    }

    public markAsVisited = () => {
        this._status.next(NodeStatus.Visited);
    }

    public markAsPath = () => {
        this._status.next(NodeStatus.Path);
    }

    public setAsStart = () => {
        this.isStart.next(true);
        this.unsetAsFinish();
        this.distance = 0;
    }

    public setAsFinish = () => {
        this.isFinish.next(true);
        this.unsetAsStart();
    }

    public unsetAsStart = () => {
        this.isStart.next(false);
        this.distance = Infinity;
    }

    public unsetAsFinish = () => {
        this.isFinish.next(false);
    }

    get isVisited() {
        return this._status.value === NodeStatus.Visited;
    }

    get isPath() {
        return this._status.value === NodeStatus.Path;
    }


    reset() {
        this.distance = Infinity;
        this.visitationOrder = 0;
        this._status.next(NodeStatus.Unvisited);
    }
}
