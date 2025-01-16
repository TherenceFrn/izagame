function PartyRanking({
                          partyId,
                          scoreboard = [],
                          currentUser,
                          onRematch,
                      }) {
    // On trie le scoreboard du plus grand placedCount au plus petit
    const sortedScoreboard = [...scoreboard].sort((a, b) => b.placedCount - a.placedCount)

    return (
        <div className="flex flex-col items-center mt-16">
            <h1 className="text-2xl font-bold mb-4">Fin de la partie</h1>
            <p className="mb-2">Party ID : {partyId}</p>

            {/* Tableau du classement */}
            <div className="bg-gray-50 p-4 rounded mb-4">
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-200">
                    <tr>
                        <th className="px-3 py-2 border-r border-gray-300">Rang</th>
                        <th className="px-3 py-2 border-r border-gray-300">Joueur</th>
                        <th className="px-3 py-2 border-r border-gray-300">Cases placées</th>
                        <th className="px-3 py-2">Vies restantes</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedScoreboard.map((player, index) => {
                        const isCurrent = player.username === currentUser
                        return (
                            <tr
                                key={player.username}
                                className={`
                    border-b border-gray-300 
                    ${isCurrent ? 'bg-green-100 font-semibold' : 'hover:bg-gray-100'}
                  `}
                            >
                                <td className="px-3 py-2 border-r border-gray-300 text-center">
                                    {index + 1}
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300">
                                    {player.username}
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300 text-center">
                                    {player.placedCount}
                                </td>
                                <td className="px-3 py-2 text-center">
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
                className="px-4 py-2 bg-green-100 border border-green-300
                   text-green-700 rounded hover:bg-green-200"
            >
                Nouvelle partie
            </button>
        </div>
    )
}

export default PartyRanking
