import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import sudoku from 'sudoku'
import SudokuGrid from '../components/SudokuGrid'
import PartyRanking from './PartyRanking'  // ou '../components/PartyRanking'
import { motion } from 'framer-motion'

const socket = io('http://localhost:3000')

function PartyGame() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const gameParam = searchParams.get('game') || 'sudoku'
    const partyId = searchParams.get('id') || ''
    const [username, setUsername] = useState('Player'+Math.floor(Math.random()*1000))

    // Ex. Si le jeu n’est pas "sudoku", on pourrait afficher autre chose
    // Pour l’instant, on se concentre sur Sudoku
    const [puzzle, setPuzzle] = useState([])
    const [solution, setSolution] = useState([])
    const [locked, setLocked] = useState([])
    const [placedCount, setPlacedCount] = useState(0)
    const [lives, setLives] = useState(3)
    const [showRanking, setShowRanking] = useState(false)
    const [lifeShake, setLifeShake] = useState(false)
    const [scoreboard, setScoreboard] = useState({}) // pour stocker data de partyFinished

    useEffect(() => {
        // 1) Se connecter à la room
        socket.emit('joinParty', { partyId, username })

        // 2) Ecouter l'événement "partyFinished"
        socket.on('partyFinished', (data) => {
            // data = partyData[partyId] => ex.: { "Bob": { placedCount, lives, finished }, ... }
            setScoreboard(data)
            setShowRanking(true)
        })

        // 3) Charger/générer Sudoku local
        generateNewPuzzle()

        // Cleanup : remove listener quand on démonte le composant
        return () => {
            socket.off('partyFinished')
        }
        // eslint-disable-next-line
    }, [])

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

        // Variables locales pour stocker la nouvelle valeur
        let newPlacedCount = placedCount
        let newLives = lives

        if (numberValue === solution[index]) {
            // ----- Réponse correcte -----
            const newPuzzle = [...puzzle]
            newPuzzle[index] = numberValue

            const newLocked = [...locked]
            newLocked[index] = true

            setPuzzle(newPuzzle)
            setLocked(newLocked)

            // On incrémente localement
            newPlacedCount = placedCount + 1
            setPlacedCount(newPlacedCount)

            // Si on a rempli toutes les cases => partie terminée
            if (newPlacedCount === 81) {
                setShowRanking(true)
                // Émettre l'événement "playerFinish"
                socket.emit('playerFinish', {
                    partyId,
                    username,
                    placedCount: newPlacedCount,
                    lives: newLives,
                })
            }

        } else {
            // ----- Réponse incorrecte -----
            if (gridErrorCallback) {
                gridErrorCallback() // (ex: animation de grille)
                handleLoseLife()
            }

            // Si on tombe à 0 vie => fin de partie pour ce joueur
            if (lives === 1) {
                setShowRanking(true)
                // signale au serveur qu'on a fini (même si c'est "game over")
                socket.emit('playerFinish', {
                    partyId,
                    username,
                    placedCount,
                    lives: 0,
                })
                newLives = 0
            } else {
                newLives = lives - 1
            }
            setLives(newLives)
        }

        // On vide le champ
        e.target.value = ''

        // ----- Envoi d'un "playerUpdate" après chaque action -----
        // On transmet les valeurs locales (newPlacedCount, newLives) pour être sûr
        // qu’elles correspondent à l’état mis à jour.
        socket.emit('playerUpdate', {
            partyId,
            username,
            placedCount: newPlacedCount,
            lives: newLives,
        })
    }

    const handleLoseLife = () => {
        setLifeShake(true)
        setTimeout(() => setLifeShake(false), 500)
    }

    if (showRanking) {
        const scoreboardArray = Object.keys(scoreboard).map((u) => ({
            username: u,
            placedCount: scoreboard[u].placedCount,
            lives: scoreboard[u].lives,
        }))
        // On peut afficher le PartyRanking ici,
        // ou naviguer vers /partyRanking?game=sudoku&id=xxx
        return (
            <PartyRanking
                partyId={partyId}
                scoreboard={scoreboardArray}
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
