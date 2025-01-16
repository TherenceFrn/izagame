import SudokuCell from './SudokuCell'

function SudokuGrid({ puzzle, locked, isGameOver, handleChange }) {
    /**
     * Calcule les classes Tailwind supplémentaires pour bien marquer
     * les blocs 3x3 (et la bordure extérieure).
     */
    const getBorderClasses = (index) => {
        const row = Math.floor(index / 9)
        const col = index % 9

        // Classe de base pour chaque cellule
        let classes = 'w-[40px] h-[40px] flex items-center justify-center ' +
            'text-md text-center ' +
            'bg-gray-100 border border-gray-300'

        // Bordures extérieures plus épaisses
        if (col === 0) classes += ' border-l-2'
        if (col === 8) classes += ' border-r-2'
        if (row === 0) classes += ' border-t-2'
        if (row === 8) classes += ' border-b-2'

        // Bordures internes pour séparer les 3x3
        // (après la 3e et la 6e colonne, c’est-à-dire col = 3 ou 6)
        if (col === 3 || col === 6) {
            classes += ' border-l-2 border-gray-900'
        }
        // (après la 3e et la 6e ligne, c’est-à-dire row = 3 ou 6)
        if (row === 3 || row === 6) {
            classes += ' border-t-2 border-gray-900'
        }

        return classes
    }

    return (
        <div className="grid grid-cols-9 grid-rows-9 gap-1 w-fit">
            {puzzle.map((value, cellIndex) => {
                const cellLocked = locked[cellIndex] || isGameOver
                // On calcule ici les classes spéciales pour les bordures
                const extraClasses = getBorderClasses(cellIndex)

                return (
                    <SudokuCell
                        key={cellIndex}
                        value={value}
                        locked={cellLocked}
                        onChange={(e) => handleChange(e, cellIndex)}
                        extraClasses={extraClasses}
                    />
                )
            })}
        </div>
    )
}

export default SudokuGrid
