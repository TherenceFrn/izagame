import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSmile, FaMeh, FaFrown, FaAngry, FaSkull } from 'react-icons/fa'

function Home() {
    const [difficulty, setDifficulty] = useState(1) // Diff. par défaut
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    // Liste des difficultés, avec label, icône, et une couleur pour l’arrière-plan
    const difficulties = [
        { value: 0, label: 'Très facile', icon: <FaSmile className="text-green-600" />, color: 'bg-green-100' },
        { value: 1, label: 'Facile / Moyen', icon: <FaMeh className="text-blue-600" />, color: 'bg-blue-100' },
        { value: 2, label: 'Difficile', icon: <FaFrown className="text-yellow-600" />, color: 'bg-yellow-100' },
        { value: 3, label: 'Très difficile', icon: <FaAngry className="text-red-600" />, color: 'bg-red-100' },
        { value: 4, label: 'Extrême', icon: <FaSkull className="text-purple-600" />, color: 'bg-purple-100' },
    ]

    // Mise à jour de la difficulté lors d’un clic sur un bloc
    const handleDifficultyClick = (value) => {
        setDifficulty(value)
    }

    // Simulation d’un chargement
    const handleStartGame = () => {
        setIsLoading(true)

        // Pour l’exemple, on affiche le loader pendant 1,5 seconde.
        // Tu peux naviguer instantanément si tu préfères.
        setTimeout(() => {
            navigate(`/sudoku?difficulty=${difficulty}`)
        }, 1500)
    }

    return (
        <div className="flex flex-col items-center mt-16">
            <h1 className="text-2xl mb-4 font-bold">Bienvenue sur Sudoku</h1>

            <p className="text-gray-700 mb-2">Choisissez la difficulté :</p>

            {/* Blocs de difficultés */}
            <div className="flex gap-4 mb-4">
                {difficulties.map((diff) => {
                    const isSelected = diff.value === difficulty
                    return (
                        <div
                            key={diff.value}
                            onClick={() => handleDifficultyClick(diff.value)}
                            className={`
                cursor-pointer w-20 h-20 rounded-lg flex flex-col items-center justify-center 
                transition-transform ease-in-out duration-200
                ${diff.color}
                ${isSelected ? 'scale-105 border-4 border-blue-400' : 'border border-gray-300'}
                hover:scale-105 
              `}
                        >
                            {/* Icône */}
                            {diff.icon}
                            {/* Label en petit */}
                            <span className="text-xs font-semibold mt-1 text-gray-700">{diff.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Bouton "Lancer le Sudoku" avec loader */}
            <div className="relative">
                <button
                    onClick={handleStartGame}
                    disabled={isLoading}
                    className="relative px-4 py-2 bg-green-100 border border-green-300
                     text-green-700 rounded hover:bg-green-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Chargement...' : 'Lancer le Sudoku'}
                </button>

                {/* Loader animé au-dessus du bouton quand isLoading = true */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-t-transparent border-green-700 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home
