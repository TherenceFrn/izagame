import { useState } from 'react'
import SudokuCell from './SudokuCell'

function SudokuGrid({ puzzle, locked, isGameOver, handleChange }) {
    // État pour la cellule en cours de survol (-1 = aucune)
    const [hoveredCell, setHoveredCell] = useState(-1)

    /**
     * Calcule les classes Tailwind supplémentaires pour bien marquer
     * les blocs 3x3 (et la bordure extérieure).
     */
    const getBorderClasses = (index) => {
        const row = Math.floor(index / 9)
        const col = index % 9

        let classes =
            'w-[40px] h-[40px] flex items-center justify-center ' +
            'text-md text-center ' +
            'border border-gray-300 '

        // Bordures extérieures plus épaisses
        if (col === 0) classes += ' border-l-2'
        if (col === 8) classes += ' border-r-2'
        if (row === 0) classes += ' border-t-2'
        if (row === 8) classes += ' border-b-2'

        // Bordures internes pour séparer les 3x3
        if (col === 3 || col === 6) {
            classes += ' border-l-2'
        } else if (col === 2 || col === 5) {
            classes += ' border-r-2'
        }
        if (row === 3 || row === 6) {
            classes += ' border-t-2'
        } else if (row === 2 || row === 5) {
            classes += ' border-b-2'
        }

        return classes
    }

    return (
        <div className="grid grid-cols-9 grid-rows-9 gap-1 w-fit">
            {puzzle.map((value, cellIndex) => {
                const cellLocked = locked[cellIndex] || isGameOver
                const extraClasses = getBorderClasses(cellIndex)

                const row = Math.floor(cellIndex / 9)
                const col = cellIndex % 9

                return (
                    <SudokuCell
                        key={cellIndex}
                        value={value}
                        locked={cellLocked}
                        onChange={(e) => handleChange(e, cellIndex)}
                        extraClasses={extraClasses}
                        row={row}
                        col={col}
                        hoveredCell={hoveredCell}
                        setHoveredCell={setHoveredCell}
                        isGameOver={isGameOver}
                    />
                )
            })}
        </div>
    )
}

export default SudokuGrid
