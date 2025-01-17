// src/pages/PartyLobby.jsx
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { FaUser } from 'react-icons/fa'
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
            // Naviguer vers PartyGame en passant les données du puzzle via l'état
            navigate(`/partyGame?game=${gameParam}&id=${data.partyId}`, { state: { puzzle: data.puzzle, solution: data.solution } })
        }

        socket.on('lobbyState', handleLobbyState)
        socket.on('partyStarted', handlePartyStarted)

        return () => {
            socket.off('lobbyState', handleLobbyState)
            socket.off('partyStarted', handlePartyStarted)
        }
    }, [gameParam, navigate])

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
        socket.emit('startParty', { partyId })
        console.log("Start party emitted for", partyId)
    }

    return (
        <div className="flex flex-col items-center mt-16">
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
                    <div className="flex flex-col items-center gap-2 mt-6">
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

                    <button
                        onClick={handleStartParty}
                        className="mt-6 px-4 py-2 bg-blue-100 border border-blue-300
                          text-blue-700 rounded hover:bg-blue-200"
                    >
                        Démarrer la partie
                    </button>
                </>
            )}

            {msg && <p className="mt-2 text-red-500">{msg}</p>}
        </div>
    )
}

export default PartyLobby
