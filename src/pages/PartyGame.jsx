import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import sudoku from 'sudoku'
import SudokuGrid from '../components/SudokuGrid'
import PartyRanking from './PartyRanking'  // ou '../components/PartyRanking'
import { motion } from 'framer-motion'

function PartyGame() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const gameParam = searchParams.get('game') || 'sudoku'
    const partyId = searchParams.get('id') || ''

    // Ex. Si le jeu n’est pas "sudoku", on pourrait afficher autre chose
    // Pour l’instant, on se concentre sur Sudoku
    const [puzzle, setPuzzle] = useState([])
    const [solution, setSolution] = useState([])
    const [locked, setLocked] = useState([])
    const [placedCount, setPlacedCount] = useState(0)
    const [lives, setLives] = useState(3)
    const [showRanking, setShowRanking] = useState(false)
    const [lifeShake, setLifeShake] = useState(false)

    useEffect(() => {
        if (gameParam === 'sudoku') {
            generateNewPuzzle()
        }
        // eslint-disable-next-line
    }, [gameParam])

    const generateNewPuzzle = () => {
        const puzzleBoard = sudoku.makepuzzle()
        const rawSolution = sudoku.solvepuzzle(puzzleBoard)

        const normalizedPuzzle = puzzleBoard.map((val) => (val === null ? 0 : val + 1))
        const normalizedSolution = rawSolution.map((val) => val + 1)
        const newLocked = normalizedPuzzle.map((val) => val !== 0)
        const initialCount = normalizedPuzzle.reduce((acc, cell) => (cell !== 0 ? acc + 1 : acc), 0)

        setPuzzle(normalizedPuzzle)
        setSolution(normalizedSolution)
        setLocked(newLocked)
        setPlacedCount(initialCount)
        setLives(3)
        setShowRanking(false)
    }

    const handleChange = (e, index, gridErrorCallback) => {
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

            if (placedCount + 1 === 81) {
                setShowRanking(true)
            }
        } else {
            if (gridErrorCallback) {
                gridErrorCallback()
                handleLoseLife()
            }

            setLives((prev) => {
                if (prev === 1) {
                    setShowRanking(true)
                }
                return prev - 1
            })
        }
        e.target.value = ''
    }

    const handleLoseLife = () => {
        setLifeShake(true)
        setTimeout(() => setLifeShake(false), 500)
    }

    // On simule un scoreboard
    const scoreboard = [
        { username: 'Bob', placedCount: placedCount, lives },
        { username: 'Alice', placedCount: 50, lives: 1 },
        { username: 'Charlie', placedCount: 20, lives: 0 },
    ]

    if (showRanking) {
        // On peut afficher le PartyRanking ici,
        // ou naviguer vers /partyRanking?game=sudoku&id=xxx
        return (
            <PartyRanking
                partyId={partyId}
                scoreboard={scoreboard}
                currentUser={'Bob'}  // ex. le joueur actuel
                onRematch={generateNewPuzzle}
            />
        )
        /*
        // Alternative : navigate vers la page ranking
        // navigate(`/partyRanking?game=${gameParam}&id=${partyId}`)
        // return null
        */
    }

    // Sinon, on affiche le jeu
    if (gameParam !== 'sudoku') {
        return (
            <div className="mt-16 text-center">
                <h2>Jeu {gameParam} non implémenté pour l’instant</h2>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center mt-4">
            <h1 className="text-xl text-gray-700 font-bold mb-2">
                Partie {gameParam.toUpperCase()} - ID: {partyId}
            </h1>

            <div className="mb-4 text-red-600 font-semibold">
                <motion.span
                    animate={lifeShake ? { scale: [1, 1.2, 1], color: '#f87171' } : {}}
                    transition={{ duration: 0.5 }}
                >
                    Vies restantes : {lives}
                </motion.span>
            </div>

            <SudokuGrid
                puzzle={puzzle}
                locked={locked}
                isGameOver={lives <= 0}
                handleChange={handleChange}
            />

            <div className="mt-4 text-gray-700">
                Nombre de chiffres placés : <span className="font-bold">{placedCount}</span>
            </div>

            <button
                onClick={generateNewPuzzle}
                className="mt-4 px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded hover:bg-green-200"
            >
                Nouveau Puzzle
            </button>

            <button
                onClick={() => setShowRanking(true)}
                className="mt-2 px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded hover:bg-red-200"
            >
                Terminer la partie
            </button>
        </div>
    )
}

export default PartyGame
