import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { FaUser, FaUserAlt } from 'react-icons/fa'

function PartyLobby() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // On peut avoir ?game=sudoku&id=xxx
    const gameParam = searchParams.get('game') || 'sudoku'
    const idParam = searchParams.get('id') // potentiellement déjà créé ?

    const [partyId, setPartyId] = useState(idParam || '')
    const [isPartyCreated, setIsPartyCreated] = useState(false)
    const [msg, setMsg] = useState('')

    useEffect(() => {
        // Si on n'a pas d'id dans l'URL, on en génère un
        if (!idParam) {
            const newId = uuidv4()
            setPartyId(newId)
        } else {
            setIsPartyCreated(true)
            // on suppose qu'on a déjà un id => partie existante
        }
    }, [idParam])

    const handleCreateParty = () => {
        if (!partyId) {
            const newId = uuidv4()
            setPartyId(newId)
        }
        setIsPartyCreated(true)
    }

    const handleCopyLink = () => {
        const link = `${window.location.origin}/lobby?game=${gameParam}&id=${partyId}`
        navigator.clipboard.writeText(link)
        setMsg('Lien copié dans le presse-papier !')
    }

    const handleStartParty = () => {
        // On lance la partie => redirection vers /partyGame?game=xxx&id=xxx
        navigate(`/partyGame?game=${gameParam}&id=${partyId}`)
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
                        Créer une partie
                    </button>
                </>
            ) : (
                <>
                    <p className="mb-2 font-semibold">Partie ID : {partyId}</p>
                    <div className="mb-4 text-center">
                        Lien d'invitation :<br />
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

                    {/* Icones fake (utilisateurs connectés) */}
                    <div className="flex items-center gap-4 mt-6">
                        <FaUser className="text-gray-700 w-6 h-6" />
                        <FaUserAlt className="text-gray-700 w-6 h-6" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        2 utilisateurs (fictifs) connectés
                    </p>

                    {/* Bouton pour l’hôte qui démarre la partie */}
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
