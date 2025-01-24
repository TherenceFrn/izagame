// src/pages/PartyGame.jsx
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import socket from '../socket' // Importer le socket singleton
import SudokuGrid from '../components/SudokuGrid'
import PartyRanking from './PartyRanking'
import { motion } from 'framer-motion'
import NumberFrequencyCard from "../components/NumberFrequencyCard.jsx";

function PartyGame() {
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const gameParam = searchParams.get('game') || 'sudoku'
    const partyId = searchParams.get('id') || ''

    const [username] = useState(() => {
        const existing = localStorage.getItem('username')
        if (existing) return existing
        const newUsername = 'Player' + Math.floor(Math.random() * 1000) + '-' + uuidv4().slice(0, 4)
        localStorage.setItem('username', newUsername)
        return newUsername
    })

    const [puzzle, setPuzzle] = useState([])
    const [solution, setSolution] = useState([])
    const [locked, setLocked] = useState([])
    const [placedCount, setPlacedCount] = useState(0)
    const [lives, setLives] = useState(3)
    const [showRanking, setShowRanking] = useState(false)
    const [lifeShake, setLifeShake] = useState(false)
    const [scoreboard, setScoreboard] = useState([]) // Initialiser comme tableau

    // Flag pour éviter les doubles émissions
    const hasJoinedParty = useRef(false)

    useEffect(() => {
        // Récupérer les données passées via la navigation
        if (location.state && location.state.puzzle && location.state.solution) {
            console.log('Received puzzle and solution via navigation:', location.state)
            setPuzzle(location.state.puzzle)
            setSolution(location.state.solution)
            setLocked(location.state.puzzle.map(val => val !== 0))
            const initialCount = location.state.puzzle.reduce((acc, cell) => (cell !== 0 ? acc + 1 : acc), 0)
            setPlacedCount(initialCount)
            setLives(3)
            setShowRanking(false)
        } else {
            // Si aucune donnée n'est passée via navigation, écouter l'événement 'partyStarted'
            const handlePartyStarted = (data) => {
                console.log('Received partyStarted:', data)
                setPuzzle(data.puzzle)
                setSolution(data.solution)
                setLocked(data.puzzle.map(val => val !== 0))
                const initialCount = data.puzzle.reduce((acc, cell) => (cell !== 0 ? acc + 1 : acc), 0)
                setPlacedCount(initialCount)
                setLives(3)
                setShowRanking(false)

                // Log the updated state
                console.log('Puzzle:', data.puzzle)
                console.log('Solution:', data.solution)
                console.log('Locked:', data.puzzle.map(val => val !== 0))
            }

            const handlePartyFinished = (data) => {
                console.log('Received partyFinished:', data)
                if (data.scoreboard && Array.isArray(data.scoreboard)) {
                    setScoreboard(data.scoreboard)
                } else {
                    console.error('Scoreboard reçu invalide:', data.scoreboard)
                    setScoreboard([])
                }
                setShowRanking(true)
            }

            // Attacher les écouteurs
            socket.on('partyStarted', handlePartyStarted)
            socket.on('partyFinished', handlePartyFinished)

            // Émettre 'joinLobby' seulement si les données n'ont pas été reçues via navigation
            if (partyId && !hasJoinedParty.current) {
                hasJoinedParty.current = true
                socket.emit('joinLobby', { partyId, username })
                console.log("Auto-join => joinLobby", partyId, username)
            }

            // Nettoyer les écouteurs lors du démontage
            return () => {
                socket.off('partyStarted', handlePartyStarted)
                socket.off('partyFinished', handlePartyFinished)
            }
        }
    }, [location.state, partyId, username])

    useEffect(() => {
        // Ajouter un useEffect pour suivre les mises à jour du puzzle
        console.log('Puzzle state updated:', puzzle)
        console.log('Locked state updated:', locked)
    }, [puzzle, locked])

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
                // Signale au serveur qu'on a fini (même si c'est "game over")
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

    // Calculer la fréquence des chiffres placés
    const numberFrequency = puzzle.reduce((acc, val) => {
        if (val !== 0) acc[val] = (acc[val] || 0) + 1
        return acc
    }, {})

    if (showRanking) {
        return (
            <PartyRanking
                partyId={partyId}
                scoreboard={scoreboard}
                currentUser={username}  // Utiliser le username actuel
                onRematch={() => {
                    // Relancer la partie en demandant au serveur de générer un nouveau Sudoku
                    socket.emit('startParty', { partyId, difficulty: location.state?.difficulty || 'medium' })
                }}
            />
        )
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

            {/* Nouvelle Section : Grille des Chiffres avec Indicateurs */}
            <div className="mb-6 grid grid-cols-9 gap-2">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((number) => {
                    const count = numberFrequency[number] || 0
                    const isCompleted = count === 9
                    return (
                        <NumberFrequencyCard
                            key={number}
                            number={number}
                            count={count}
                            isCompleted={isCompleted}
                        />
                    )
                })}
            </div>

            <button
                onClick={() => {
                    // Émettre 'playerFinish' lorsque le joueur veut terminer la partie
                    socket.emit('playerFinish', {
                        partyId,
                        username,
                        placedCount,
                        lives,
                    })
                    setShowRanking(true)
                }}
                className="mt-2 px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded hover:bg-red-200"
            >
                Terminer la partie
            </button>
        </div>
    )
}

export default PartyGame
