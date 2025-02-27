import { useCallback, useEffect, useState } from "react";
import styles from './styles.module.css'
import Board from "./Board";

function divideRows(one_d: boolean[], size: number) {
    const rows = []
    for (let i = 0; i < size; i++) {
        const row = one_d.slice((i * size), ((i + 1) * size))
        rows.push(row)
    }
    return rows
}

function countNeighbors(one_d: boolean[], size: number) {
    const neighbor_rows = []
    const mine_rows = divideRows(one_d, size)
    function calcSameRowNeighbors(row: number, col: number) {
        let n = 0;
        if (col > 0)
            if (mine_rows[row][col - 1]) {
                n += 1
            }
        if (col < size - 1) {
            if (mine_rows[row][col + 1]) {
                n += 1
            }
        }
        return n
    }
    function calcAdjacentRowNeighbors(row: number, col: number) {
        let m = 0;
        if (row > 0) {
            m += calcSameRowNeighbors((row - 1), col)
            if (mine_rows[row - 1][col]) {
                m += 1
            }
        }
        if (row < size - 1) {
            m += calcSameRowNeighbors((row + 1), col)
            if (mine_rows[row + 1][col]) {
                m += 1
            }
        }
        return m
    }

    for (let i = 0; i < size; i++) {
        const neighbor_row = []
        for (let j = 0; j < size; j++) {
            let neighbors = 0
            neighbors += calcSameRowNeighbors(i, j)
            neighbors += calcAdjacentRowNeighbors(i, j)
            neighbor_row.push(neighbors)
        }
        neighbor_rows.push(neighbor_row)
    }
    return neighbor_rows
}

function mineTotal(size: number) {
    const number_of_mines = (size ** 2) * 0.2
    return Math.floor(number_of_mines)
}

export default function Game() {
    const [size, setSize] = useState<number>(10)
    const [gameIsOver, setGameIsOver] = useState<boolean>(false)
    const [gameIsLost, setGameIsLost] = useState<boolean>(false)
    const [tilesShown, setTilesShown] = useState<boolean[][]>(Array(size).fill(Array(size).fill(false)));
    const [tilesMarked, setTilesMarked] = useState<boolean[][]>(Array(size).fill(Array(size).fill(false)));
    const [mines, setMines] = useState<boolean[]>([])
    const [totalMines, setTotalMines] = useState<number>(mineTotal(size))
    const [tilesToUncover, setTilesToUncover] = useState<number>((size ** 2) - totalMines)

    const generateMines = useCallback(() => {
        const genmines = Array(size ** 2).fill(false)
        let i = 0
        while (i < totalMines) {
            const rndIdx = Math.floor((Math.random() * (genmines.length - 1)))
            if (!genmines[rndIdx]) {
                genmines[rndIdx] = true
                i++
            } else {
                continue
            }
        }
        return genmines
    }, [totalMines, size])


    useEffect(() => {
        setTotalMines(mineTotal(size))
        setTilesShown(Array(size).fill(Array(size).fill(false)))
        setTilesMarked(Array(size).fill(Array(size).fill(false)))
        setMines(generateMines)
        setTilesToUncover((size ** 2) - totalMines)
    }, [size, totalMines, generateMines])


    const mine_rows = divideRows(mines, size)
    const neighbor_rows = countNeighbors(mines, size)
    const markTotal = tilesMarked.flat().filter((mark) =>  mark == true).length

    useEffect(() => {
        if (markTotal == totalMines) {
            if (tilesToUncover == 0) {
                setGameIsOver(true)
            }
        }
    }, [tilesMarked, tilesShown, markTotal, tilesToUncover, totalMines])

    function checkForVictory() {
        if (markTotal == totalMines) {
            if (tilesToUncover == 0) {
                setGameIsOver(true)
            }
        }
    }
    
    function revealTile(row: number, col: number) {
        if (tilesShown[row][col]) {
            return
        }
        const newTileValues = tilesShown.slice()
        const newTileRow = tilesShown[row].slice()
        newTileRow[col] = true
        newTileValues[row] = newTileRow
        setTilesShown(newTileValues)
        if (mine_rows[row][col]) {
            setGameIsOver(true)
            setGameIsLost(true)
        }
        setTilesToUncover(tilesToUncover - 1)
        checkForVictory()
    }
    
    function markMine(row: number, col: number) {
        const tmpMarkedRows = tilesMarked.slice()
        const tmpMarkedRow = tmpMarkedRows[row].slice()
        tmpMarkedRow[col] = !tmpMarkedRow[col]
        tmpMarkedRows[row] = tmpMarkedRow
        setTilesMarked(tmpMarkedRows)
        checkForVictory()
    }
    
    function hideTiles() {
        setTilesShown(Array(size).fill(Array(size).fill(false)))
    }
    
    function resetMarks() {
        setTilesMarked(Array(size).fill(Array(size).fill(false)))
    }
    
    function newGame() {
        console.log('making new game')
        setGameIsLost(false)
        setGameIsOver(false)
        resetMarks()
        hideTiles()
        setTilesShown(Array(size).fill(Array(size).fill(false)))
        setMines(generateMines)
        setTilesToUncover((size ** 2) - totalMines)
    }
    function ActiveGameMessage() {
        return (
            <div>
                <h3> {markTotal} / {mineTotal(size)} bunnies located</h3>
            </div>
        )
    }

    function LossMessage() {
        return (
            <div>
                <p>
                    Oh no, you stumbled too close to some sleeping bunnies.
                    Startled, they bolted awake, zoomed around and woke up all the others!
                    Bunnies are zooming everywhere, it's complete (adorable) chaos!
                </p>
                <button onClick={newGame} className={styles.controlButton}>
                    Try again
                </button>
            </div>
        )
    }

    function VictoryMessage() {
        return (
            <div>
                <p>
                    Hooray!  You correctly mapped out the forest, so the bunnies will wake up well-rested.
                </p>
                <button onClick={newGame} className={styles.controlButton}>
                    New Game
                </button>
            </div>
        )
    }
    return (
        <div>
            <h1>
                BunnySweeper!
            </h1>
            <div>
                You need to navigate through a forest full of sleeping rabbits.
                They are good at hiding themselves, but will easily startle awake if you get too close.
                Uncover a tile by clicking on it.
                Each tile you check will reveal how many bunnies are asleep in adjacent tiles.
                Carefully mark out all their locations by right-clicking the correct tiles, and uncovering all the unoccupied tiles.
            </div>
            {gameIsLost ? <LossMessage/> : <ActiveGameMessage/>}
            {gameIsOver && !gameIsLost && <VictoryMessage/>}
            <Board
                markMine={markMine}
                mine_rows={mine_rows}
                neighbor_rows={neighbor_rows}
                tileValues={tilesShown}
                marked_rows={tilesMarked}
                revealTile={revealTile}
            >
            </Board>
            <div>
                <button onClick={() => {
                    setSize(10);
                    newGame()
                }} className={styles.controlButton}>
                    small
                </button>
                <button onClick={() => {
                    setSize(15);
                    newGame()
                }} className={styles.controlButton}>
                    medium
                </button>
                <button onClick={() => {
                    setSize(20);
                    newGame()
                }} className={styles.controlButton}>
                    large
                </button>
            </div>
        </div>
    )

}
