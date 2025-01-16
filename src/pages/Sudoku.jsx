import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { FaUser, FaUserAlt, FaUserCircle } from 'react-icons/fa'

function Sudoku() {
    const navigate = useNavigate()
    const [msg, setMsg] = useState('')
    const [partyId, setPartyId] = useState('')
    const [isPartyCreated, setIsPartyCreated] = useState(false)

    const handleCreateParty = () => {
        // Génère un ID unique, ex: "144ed87e-..."
        const newPartyId = uuidv4()
        setPartyId(newPartyId)
        setIsPartyCreated(true)
    }

    const handleCopyLink = () => {
        const link = `${window.location.origin}/party?id=${partyId}`
        navigator.clipboard.writeText(link)
        setMsg('Lien copié dans le presse-papier !')
    }

    const handleStartParty = () => {
        // Lorsque l’hôte décide de démarrer,
        // on redirige vers la page de la partie
        navigate(`/party?id=${partyId}`)
    }

    return (
        <div className="flex flex-col items-center mt-16">
            <h1 className="text-2xl font-bold mb-4">Sudoku</h1>

            {/*
        Si la partie n'est pas encore créée, on propose de la créer.
        Sinon, on affiche le lien d'invitation,
        des icônes d'utilisateurs "fake", et un bouton pour lancer la partie.
      */}
            {!isPartyCreated ? (
                <>
                    <p className="mb-4">Créez une partie pour inviter vos amis.</p>
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
                    <p className="mb-2 font-semibold">Partie créée !</p>
                    <div className="mb-4 text-center">
                        Lien d'invitation :<br />
                        <span className="text-blue-600 break-all">
              {`${window.location.origin}/party?id=${partyId}`}
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
                        <FaUserCircle className="text-gray-700 w-6 h-6" />
                        <FaUser className="text-gray-700 w-6 h-6" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">4 utilisateurs (fictifs) connectés</p>

                    {/* Bouton pour “l’hôte” qui démarre réellement le jeu */}
                    <button
                        onClick={handleStartParty}
                        className="mt-6 px-4 py-2 bg-blue-100 border border-blue-300
                       text-blue-700 rounded hover:bg-blue-200"
                    >
                        Démarrer la partie
                    </button>
                </>
            )}

            {/* Affiche un message si on vient de cliquer sur "Copier le lien" */}
            {msg && <p className="mt-2 text-red-500">{msg}</p>}
        </div>
    )
}

export default Sudoku
