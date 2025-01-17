import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import sudoku from 'sudoku'
import SudokuGrid from '../components/SudokuGrid'
import PartyRanking from "../components/PartyRanking.jsx";
import { motion } from 'framer-motion'

function Party() {
    const [searchParams] = useSearchParams()
    const partyId = searchParams.get('id') // ex: "144ed87eza..."

    // States habituels pour le Sudoku
    const [puzzle, setPuzzle] = useState([])
    const [solution, setSolution] = useState([])
    const [locked, setLocked] = useState([])
    const [placedCount, setPlacedCount] = useState(0)
    const [lives, setLives] = useState(3)

    // Nouvel état pour afficher ou non le classement final
    const [showRanking, setShowRanking] = useState(false)

    // Quand on perds une vie
    const [lifeShake, setLifeShake] = useState(false)

    useEffect(() => {
        generateNewPuzzle()
        // eslint-disable-next-line
    }, [])

    const generateNewPuzzle = () => {
        // Génération simplifiée
        const puzzleBoard = sudoku.makepuzzle()
        const rawSolution = sudoku.solvepuzzle(puzzleBoard)

        const normalizedPuzzle = puzzleBoard.map((val) => (val === null ? 0 : val + 1))
        const normalizedSolution = rawSolution.map((val) => val + 1)

        const newLocked = normalizedPuzzle.map((val) => val !== 0)
        const initialCount = normalizedPuzzle.reduce(
            (acc, cell) => (cell !== 0 ? acc + 1 : acc),
            0
        )

        setPuzzle(normalizedPuzzle)
        setSolution(normalizedSolution)
        setLocked(newLocked)
        setPlacedCount(initialCount)
        setLives(3)
        setShowRanking(false) // On repasse en mode "jeu" si on relance
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

            // Vérifier si la grille est terminée : 81 cases != 0
            if (placedCount + 1 === 81) {
                // La partie est finie, on affiche le classement
                setShowRanking(true)
            }

        } else {
            // Mauvaise réponse => on déclenche l’animation
            if (gridErrorCallback) {
                gridErrorCallback()
                handleLoseLife()
            }

            // Mauvaise réponse
            setLives((prev) => {
                if (prev === 1) {
                    // Game Over => on affiche quand même un classement
                    setShowRanking(true)
                }
                return prev - 1
            })
        }
        e.target.value = ''
    }

    const isGameOver = lives <= 0

    // ======= Rendu principal =======
    if (showRanking) {
        // On affiche le "classement" final pour cette partie
        return (
            <PartyRanking
                partyId={partyId}
                placedCount={placedCount}
                lives={lives}
                onRematch={generateNewPuzzle}
            />
        )
    }

    const handleLoseLife = () => {
        setLifeShake(true)
        setTimeout(() => setLifeShake(false), 500)
    }

    // Sinon, on affiche la grille Sudoku
    return (
        <div className="flex flex-col items-center mt-4">
            <h1 className="text-xl text-gray-700 font-bold mb-2">
                Partie Sudoku - ID: {partyId}
            </h1>

            <div className="mb-4 text-red-600 font-semibold">
                <motion.span
                    animate={lifeShake ? {scale: [1, 1.2, 1], color: '#f87171'} : {}}
                    transition={{duration: 0.5}}
                >
                    Vies restantes : {lives}
                </motion.span>
            </div>

            <SudokuGrid
                puzzle={puzzle}
                locked={locked}
                isGameOver={isGameOver}
                handleChange={handleChange}
            />

            <div className="mt-4 text-gray-700">
                Nombre de chiffres placés : <span className="font-bold">{placedCount}</span>
            </div>

            {/* Bouton pour générer un nouveau puzzle (même partie) */}
            <button
                onClick={generateNewPuzzle}
                className="mt-4 px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded hover:bg-green-200"
            >
                Nouveau Puzzle
            </button>

            {/* Bouton "Terminer la partie" => affiche le classement final */}
            <button
                onClick={() => setShowRanking(true)}
                className="mt-2 px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded hover:bg-red-200"
            >
                Terminer la partie
            </button>
        </div>
    )
}

export default Party
