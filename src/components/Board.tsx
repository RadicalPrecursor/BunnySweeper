import styles from './styles.module.css'

interface TileProps {
    hidden: boolean;
    mine: boolean;
    neighbors: number;
    marked: boolean;
    onAuxClick: (row: number, col: number) => void;
    row: number;
    col: number;
    onClick: (row: number, col: number) => void;
}

function Tile(props: TileProps) {
    const tile_contents = props.mine ? '!!' : props.neighbors > 0 ? props.neighbors : ''

    return (
        <button
            className={props.hidden ? styles.hiddenTile : props.mine ? styles.mineTile : styles.clearTile}
            onClick={() => props.onClick(props.row, props.col)}
            onAuxClick={() => props.onAuxClick(props.row, props.col)}
            onContextMenu={(e) => e.preventDefault()}
        >
            {props.hidden ? props.marked ? 'B' : '' : tile_contents}
        </button>
    )
}

interface TileRowProps {
    length: number;
    row_num: number;
    row_bools: boolean[];
    mines: boolean[];
    neighbors: number[];
    marked: boolean[];
    onClick: (row: number, col: number) => void;
    onAuxClick: (row: number, col: number) => void;
}

function TileRow(props: TileRowProps) {
    const tiles = []
    for (let i = 0; i < props.length; i++) {
        tiles.push(i)
    }
    return (
        <div className={styles.row}>
            {tiles.map((i) =>
                <Tile 
                    key={i + '-' + props.row_num} 
                    row={props.row_num}
                    col={i}
                    onClick={props.onClick}
                    onAuxClick={props.onAuxClick}
                    hidden={!props.row_bools[i]}
                    mine={props.mines[i]}
                    neighbors={props.neighbors[i]}
                    marked={props.marked[i]}
                />
            )}
        </div>
    )
}

interface boardProps {
    tileValues: boolean[][];
    mine_rows: boolean[][];
    neighbor_rows: number[][];
    marked_rows: boolean[][];
    revealTile: (row: number, col: number) => void;
    markMine: (row: number, col: number) => void;}

export default function Board(props: boardProps) {
const board_size = Math.min(props.mine_rows.length, props.marked_rows.length)
const tile_rows = []
for (let i = 0; i < board_size; i++) {
    tile_rows.push(i)
}

return (
    <div className={styles.board}>
        <div>
        {tile_rows.map(
            (row) => <TileRow
                key={'row' + row}
                row_num={row}
                length={board_size}
                row_bools={props.tileValues[row]}
                mines={props.mine_rows[row]}
                neighbors={props.neighbor_rows[row]}
                marked={props.marked_rows[row]}
                onClick={props.revealTile}
                onAuxClick={props.markMine}
            />)}
        </div>
    </div>
)
}