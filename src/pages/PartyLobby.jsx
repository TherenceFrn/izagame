import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { FaUser, FaMeh, FaFrown } from 'react-icons/fa' // Importer les icônes
import { ClipLoader } from 'react-spinners' // Importer le spinner
import socket from '../socket' // Importer le socket singleton

function PartyLobby() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const gameParam = searchParams.get('game') || 'sudoku'
    const idParam = searchParams.get('id') || ''

    const [partyId, setPartyId] = useState(idParam)
    const [isPartyCreated, setIsPartyCreated] = useState(!!idParam)
    const [msg, setMsg] = useState('')
    const [players, setPlayers] = useState([]) // Liste réelle des joueurs dans le lobby

    const [username] = useState(() => {
        const existing = localStorage.getItem('username')
        if (existing) return existing
        const newUsername = 'Player' + Math.floor(Math.random() * 1000) + '-' + uuidv4().slice(0, 4)
        localStorage.setItem('username', newUsername)
        return newUsername
    })

    // Sélection de la difficulté (par défaut: Moyenne)
    const [difficulty, setDifficulty] = useState('medium')

    // Indicateur de chargement
    const [isLoading, setIsLoading] = useState(false)

    // Flag pour éviter les doubles émissions
    const hasJoinedLobby = useRef(false)

    useEffect(() => {
        // Gestion des événements du serveur
        const handleLobbyState = (data) => {
            console.log('Received lobbyState:', data.players)
            setPlayers(data.players || [])
        }

        const handlePartyStarted = (data) => {
            console.log('Received partyStarted:', data)
            setIsLoading(false) // Désactiver le chargement
            // Naviguer vers PartyGame en passant les données du puzzle via l'état
            navigate(`/partyGame?game=${gameParam}&id=${data.partyId}`, { state: { puzzle: data.puzzle, solution: data.solution, difficulty } })
        }

        socket.on('lobbyState', handleLobbyState)
        socket.on('partyStarted', handlePartyStarted)

        return () => {
            socket.off('lobbyState', handleLobbyState)
            socket.off('partyStarted', handlePartyStarted)
        }
    }, [gameParam, navigate, difficulty])

    useEffect(() => {
        if (idParam && !hasJoinedLobby.current) {
            setPartyId(idParam)
            setIsPartyCreated(true)

            // Définir le flag avant d'émettre
            hasJoinedLobby.current = true
            socket.emit('joinLobby', { partyId: idParam, username })
            console.log("Auto-join => joinLobby", idParam, username)
        }
    }, [idParam, username])

    const handleCreateParty = () => {
        if (isPartyCreated) {
            // Déjà dans un lobby, ne rien faire
            return
        }

        let newPartyId = partyId
        if (!partyId) {
            newPartyId = uuidv4()
            setPartyId(newPartyId)

            // Mettre à jour l'URL
            navigate(`/lobby?game=${gameParam}&id=${newPartyId}`, { replace: true })
        }
        setIsPartyCreated(true)

        // Définir le flag avant d'émettre
        if (!hasJoinedLobby.current) {
            hasJoinedLobby.current = true
            socket.emit('joinLobby', { partyId: newPartyId, username })
            console.log("Created new lobby and joinLobby", newPartyId, username)
        }
    }

    const handleCopyLink = () => {
        const link = `${window.location.origin}/lobby?game=${gameParam}&id=${partyId}`
        navigator.clipboard.writeText(link)
        setMsg('Lien copié dans le presse-papier !')
    }

    const handleStartParty = () => {
        setIsLoading(true) // Activer le chargement
        socket.emit('startParty', { partyId, difficulty }) // Inclure la difficulté
        console.log("Start party emitted for", partyId, "with difficulty", difficulty)
    }

    return (
        <div className="flex flex-col items-center mt-16 p-4">
            <h1 className="text-2xl font-bold mb-4">
                Lobby pour le jeu : {gameParam.toUpperCase()}
            </h1>

            {!isPartyCreated ? (
                <>
                    <p className="mb-4">Créez ou rejoignez une partie pour inviter vos amis.</p>
                    <button
                        onClick={handleCreateParty}
                        className="px-4 py-2 bg-green-100 border border-green-300
                          text-green-700 rounded hover:bg-green-200"
                    >
                        Créer/Rejoindre le lobby
                    </button>
                </>
            ) : (
                <>
                    {/* Sélection de la difficulté */}
                    <div className="mb-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-2">Choisissez la difficulté :</h2>
                        <div className="w-full flex space-x-2 items-center justify-between">
                            {/* Easy */}
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value="easy"
                                    checked={difficulty === 'easy'}
                                    onChange={() => setDifficulty('easy')}
                                    className="hidden"
                                />
                                <span
                                    className={`flex items-center px-4 py-2 rounded-md border 
                                    ${difficulty === 'easy' ? 'bg-blue-200 border-blue-500' : 'bg-white border-gray-300'}
                                    transition-colors duration-200`}
                                >
                                    <FaMeh className="mr-2 text-blue-600" />
                                    Facile
                                </span>
                            </label>

                            {/* Medium */}
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value="medium"
                                    checked={difficulty === 'medium'}
                                    onChange={() => setDifficulty('medium')}
                                    className="hidden"
                                />
                                <span
                                    className={`flex items-center px-4 py-2 rounded-md border 
                                    ${difficulty === 'medium' ? 'bg-yellow-200 border-yellow-500' : 'bg-white border-gray-300'}
                                    transition-colors duration-200`}
                                >
                                    <FaMeh className="mr-2 text-yellow-600" />
                                    Moyenne
                                </span>
                            </label>

                            {/* Hard */}
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value="hard"
                                    checked={difficulty === 'hard'}
                                    onChange={() => setDifficulty('hard')}
                                    className="hidden"
                                />
                                <span
                                    className={`flex items-center px-4 py-2 rounded-md border 
                                    ${difficulty === 'hard' ? 'bg-red-200 border-red-500' : 'bg-white border-gray-300'}
                                    transition-colors duration-200`}
                                >
                                    <FaFrown className="mr-2 text-red-600" />
                                    Difficile
                                </span>
                            </label>
                        </div>
                    </div>

                    <p className="mb-2 font-semibold">Partie ID : {partyId}</p>
                    <div className="mb-4 text-center">
                        Lien d'invitation :
                        <br />
                        <span className="text-blue-600 break-all">
                            {`${window.location.origin}/lobby?game=${gameParam}&id=${partyId}`}
                        </span>
                    </div>

                    <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-green-100 border border-green-300
                          text-green-700 rounded hover:bg-green-200"
                    >
                        Copier le lien
                    </button>

                    {/* Liste des joueurs connectés */}
                    <div className="flex flex-col items-center gap-2 mt-6 w-full max-w-md">
                        <div className="font-semibold">Joueurs connectés :</div>
                        {players.map((pl) => (
                            <div key={`${pl.socketId}-${pl.username}`} className="flex items-center gap-2">
                                <FaUser className="text-gray-700 w-4 h-4" />
                                <span>{pl.username}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {players.length} joueur(s) connectés
                    </p>

                    {/* Afficher le spinner si en cours de chargement */}
                    {isLoading ? (
                        <div className="mt-6 flex flex-col items-center">
                            <ClipLoader color="#3b82f6" loading={isLoading} size={50} />
                            <p className="mt-2 text-blue-600">Démarrage de la partie, veuillez patienter...</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleStartParty}
                            className="mt-6 px-4 py-2 bg-blue-100 border border-blue-300
                              text-blue-700 rounded hover:bg-blue-200"
                        >
                            Démarrer la partie
                        </button>
                    )}
                </>
            )}

            {msg && <p className="mt-2 text-red-500">{msg}</p>}
        </div>
    )

}

export default PartyLobby
