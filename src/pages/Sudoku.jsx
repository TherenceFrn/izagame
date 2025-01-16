import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import sudoku from 'sudoku'
import SudokuGrid from '../components/SudokuGrid' // exemple de composant

function Sudoku() {
    const [searchParams] = useSearchParams()
    // Si aucune difficulté n’est passée, on prend 1 par défaut
    const difficultyFromUrl = searchParams.get('difficulty') || '1'
    const initialDifficulty = parseInt(difficultyFromUrl, 10)

    // States
    const [puzzle, setPuzzle] = useState([])
    const [solution, setSolution] = useState([])
    const [locked, setLocked] = useState([])
    const [placedCount, setPlacedCount] = useState(0)
    const [lives, setLives] = useState(3)
    const [difficulty, setDifficulty] = useState(initialDifficulty)

    useEffect(() => {
        generateNewPuzzle(difficulty)
        // eslint-disable-next-line
    }, [])

    const generateNewPuzzle = (difficultyLevel) => {
        let puzzleBoard = null
        for (let i = 0; i < 1000; i++) {
            const tempPuzzle = sudoku.makepuzzle()
            const tempRating = sudoku.ratepuzzle(tempPuzzle, 4)
            if (tempRating === difficultyLevel) {
                puzzleBoard = tempPuzzle
                break
            }
        }
        if (!puzzleBoard) {
            puzzleBoard = sudoku.makepuzzle()
        }
        const rawSolution = sudoku.solvepuzzle(puzzleBoard)

        const normalizedPuzzle = puzzleBoard.map((val) => (val === null ? 0 : val + 1))
        const normalizedSolution = rawSolution.map((val) => val + 1)

        const newLocked = normalizedPuzzle.map((val) => (val !== 0))
        const initialCount = normalizedPuzzle.reduce(
            (acc, cell) => (cell !== 0 ? acc + 1 : acc),
            0
        )

        setPuzzle(normalizedPuzzle)
        setSolution(normalizedSolution)
        setLocked(newLocked)
        setPlacedCount(initialCount)
        setLives(3)
        setDifficulty(difficultyLevel)
    }

    const handleChange = (e, index) => {
        const inputValue = e.target.value
        if (!/^[1-9]$/.test(inputValue)) {
            e.target.value = ''
            return
        }
        const numberValue = parseInt(inputValue, 10)

        if (numberValue === solution[index]) {
            const newPuzzle = [...puzzle]
            newPuzzle[index] = numberValue

            const newLocked = [...locked]
            newLocked[index] = true

            setPuzzle(newPuzzle)
            setLocked(newLocked)
            setPlacedCount((prev) => prev + 1)
        } else {
            setLives((prev) => {
                if (prev === 1) {
                    alert('Game Over !')
                }
                return prev - 1
            })
        }
        e.target.value = ''
    }

    const isGameOver = lives <= 0

    return (
        <div className="flex flex-col items-center mt-4">
            <h1 className="text-xl text-gray-700 font-bold mb-2">
                Sudoku (difficulté {difficulty})
            </h1>
            <div className="mb-4 text-red-600 font-semibold">Vies restantes : {lives}</div>

            {/* Grille Sudoku via un composant dédié */}
            <SudokuGrid
                puzzle={puzzle}
                locked={locked}
                isGameOver={isGameOver}
                handleChange={handleChange}
            />

            {/* Stats */}
            <div className="mt-4 text-gray-700">
                Nombre de chiffres placés : <span className="font-bold">{placedCount}</span>
            </div>

            {/* Bouton pour regénérer un puzzle de la même difficulté */}
            <div className="mt-4">
                <button
                    onClick={() => generateNewPuzzle(difficulty)}
                    className="px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded hover:bg-green-200"
                >
                    Nouveau Sudoku
                </button>
            </div>
        </div>
    )
}

export default Sudoku
