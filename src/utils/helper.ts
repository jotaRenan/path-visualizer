import { Rows, Columns } from "./constants";

export function getParams() {
    const hashInfo = window.location.hash.slice(1);
    const [rows, columns, wallsString = ''] = hashInfo.split('&');
    const wallsIds = wallsString.split(':').map(id => parseInt(id, 10));
    return {
        rows: rows ? parseInt(rows, 10) : Rows,
        columns: columns ? parseInt(columns, 10) : Columns,
        wallsIds,
    };
}

export const unary = (fn: Function) => {
    return (arg) => {
        return fn(arg)
    };
} 