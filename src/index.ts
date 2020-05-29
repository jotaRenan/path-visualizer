import { generateGrid, solve } from './application/grid-orchestrator';
import { Columns, Rows } from './utils/constants';
import { getParams } from './utils/helper';


(function () {
    const gridContainer = document.getElementById('GridContainer');
    let grid = generateGrid(Rows, Columns, gridContainer);

    document.getElementById('solveButton').onclick = () => solve(grid);
    document.getElementById('resetButton').onclick = () => grid.reset();
    document.getElementById('testButton').onclick = () => window.history.pushState(null, null, '#15&30&1:10:11:12:13:14:15:16:90:91');

    window.onhashchange = function () {
        const { rows, columns } = getParams();
        grid = generateGrid(rows, columns, gridContainer);
    }

    window.onload = () => {
        const { rows, columns } = getParams();
        document.documentElement.style.setProperty('--rows', rows.toString());
        document.documentElement.style.setProperty('--columns', columns.toString());
    }
})();