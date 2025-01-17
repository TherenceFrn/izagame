import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { FaUser } from 'react-icons/fa'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')
// ou l'adresse de ton serveur

function PartyLobby() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const gameParam = searchParams.get('game') || 'sudoku'
    const idParam = searchParams.get('id') // potentiellement déjà créé ?

    const [partyId, setPartyId] = useState(idParam || '')
    const [isPartyCreated, setIsPartyCreated] = useState(false)
    const [msg, setMsg] = useState('')
    const [players, setPlayers] = useState([]) // Liste réelle des joueurs dans le lobby

    // On simule un username local
    // On regarde si on a déjà un username dans localStorage
    const existingUsername = localStorage.getItem('username')
    if (!existingUsername) {
        const newUsername = 'Player' + Math.floor(Math.random() * 1000)
        localStorage.setItem('username', newUsername)
    }
    const [username, setUsername] = useState(localStorage.getItem('username'))

    // Flag pour éviter les doubles émissions
    const hasJoinedLobby = useRef(false)

    useEffect(() => {
        // Écoute l'événement "lobbyState"
        socket.on('lobbyState', (data) => {
            setPlayers(data.players || [])
        })

        // Écoute l'événement "partyStarted"
        socket.on('partyStarted', (data) => {
            navigate(`/partyGame?game=${gameParam}&id=${data.partyId}`)
        })

        return () => {
            socket.off('lobbyState')
            socket.off('partyStarted')
        }
    }, [gameParam, navigate])

    useEffect(() => {
        if (idParam && !hasJoinedLobby.current) {
            setPartyId(idParam)
            setIsPartyCreated(true)

            // Émettre "joinLobby" une seule fois
            socket.emit('joinLobby', { partyId: idParam, username })
            console.log("Auto-join => joinLobby", idParam, username)

            hasJoinedLobby.current = true
            console.log("Auto-join => joinLobby", idParam, username)
        }
    }, [idParam, username])

    // 3) handleCreateParty => joinLobby
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

        // Émettre "joinLobby" seulement si pas encore rejoint
        if (!hasJoinedLobby.current) {
            socket.emit('joinLobby', { partyId: newPartyId, username })
            console.log("Created new lobby and joinLobby", newPartyId, username)
            hasJoinedLobby.current = true
        }
        console.log("Created new lobby and joinLobby", newPartyId, username)
    }

    const handleCopyLink = () => {
        const link = `${window.location.origin}/lobby?game=${gameParam}&id=${partyId}`
        navigator.clipboard.writeText(link)
        setMsg('Lien copié dans le presse-papier !')
    }

    const handleStartParty = () => {
        // On émet "startParty" => le serveur broadcast "partyStarted"
        socket.emit('startParty', { partyId })
        // on pourrait naviguer direct, mais on veut que
        // TOUT le monde reçoive l'info => see "partyStarted" in useEffect
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

                    {/* Liste réelle des joueurs connectés */}
                    <div className="flex flex-col items-center gap-2 mt-6">
                        <div className="font-semibold">Joueurs connectés :</div>
                        {players.map((pl) => (
                            <div key={pl.socketId} className="flex items-center gap-2">
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
