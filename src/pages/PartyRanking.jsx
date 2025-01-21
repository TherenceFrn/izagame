// src/pages/PartyRanking.jsx
import React from 'react'
import { FaCheckCircle } from 'react-icons/fa'

function PartyRanking({ partyId, scoreboard = [], currentUser, onRematch }) {

    console.log('Received scoreboard:', scoreboard)

    // Vérifier que le scoreboard est un tableau
    if (!Array.isArray(scoreboard)) {
        console.error('Scoreboard doit être un tableau.')
        return null
    }

    // Trier le classement du plus grand placedCount au plus petit, puis par lives
    const sortedScoreboard = [...scoreboard].sort((a, b) => {
        if (b.placedCount === a.placedCount) {
            return b.lives - a.lives
        }
        return b.placedCount - a.placedCount
    })

    return (
        <div className="flex flex-col items-center mt-16 p-4">
            <h1 className="text-3xl font-bold mb-4">Fin de la partie</h1>
            <p className="mb-2">Party ID : <span className="font-semibold">{partyId}</span></p>

            {/* Tableau du classement */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6 w-full max-w-2xl">
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2 border-r border-gray-300">Rang</th>
                        <th className="px-4 py-2 border-r border-gray-300">Joueur</th>
                        <th className="px-4 py-2 border-r border-gray-300">Cases placées</th>
                        <th className="px-4 py-2">Vies restantes</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedScoreboard.map((player, index) => {
                        const isCurrent = player.username === currentUser
                        return (
                            <tr
                                key={`${player.username}-${index}`}
                                className={`
                                        border-b border-gray-300 
                                        ${isCurrent ? 'bg-green-100 font-semibold' : 'hover:bg-gray-100'}
                                    `}
                            >
                                <td className="px-4 py-2 border-r border-gray-300 text-center">
                                    {index + 1}
                                    {isCurrent && <FaCheckCircle className="inline ml-2 text-green-500" title="Vous" />}
                                </td>
                                <td className="px-4 py-2 border-r border-gray-300">
                                    {player.username}
                                </td>
                                <td className="px-4 py-2 border-r border-gray-300 text-center">
                                    {player.placedCount}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    {player.lives}
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>

            {/* Bouton “Nouvelle partie” */}
            <button
                onClick={onRematch}
                className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors duration-200"
            >
                Nouvelle partie
            </button>
        </div>
    )
}

export default PartyRanking
