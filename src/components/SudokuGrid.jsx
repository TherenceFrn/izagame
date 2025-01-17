import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SudokuCell from './SudokuCell'

function SudokuGrid({ puzzle, locked, isGameOver, handleChange, onWrongInput }) {
    // État pour la cellule en cours de survol (-1 = aucune)
    const [hoveredCell, setHoveredCell] = useState(-1)

    // État pour déclencher l’effet de flash (ou tremblement)
    // onWrongInput (envoyé par le parent) appellera handleGridError() ci-dessous
    const [errorFlash, setErrorFlash] = useState(false)

    const handleGridError = () => {
        // Active le flash d'erreur
        setErrorFlash(true)
        // Désactive le flash après 500ms (durée de l’anim)
        setTimeout(() => {
            setErrorFlash(false)
        }, 500)
    }

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
        /**
         * On enveloppe la grille dans un motion.div
         * pour animer un “flash rouge” (ou un “shake”) au besoin.
         *
         * Ex. Variation 1 : “flash rouge” (background)
         */
        <motion.div
            // Si errorFlash = true, on anime le fond en rouge, sinon transparent
            animate={errorFlash ? { backgroundColor: '#fee2e2' } : { backgroundColor: 'transparent' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="inline-block p-1 rounded"
        >
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
                            onChange={(e) => handleChange(e, cellIndex, handleGridError)}
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
        </motion.div>
    )
}

export default SudokuGrid
