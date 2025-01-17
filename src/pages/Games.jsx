import { Link } from 'react-router-dom'

function Games() {
    return (
        <div className="flex flex-col items-center mt-16">
            <h1 className="text-2xl mb-4 font-bold">Tous les jeux</h1>

            <div className="flex gap-6">
                {/* Lien vers le Lobby, en précisant le jeu sudoku */}
                <Link
                    to="/lobby?game=sudoku"
                    className="px-4 py-2 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200"
                >
                    Sudoku
                </Link>

                {/* Lien pour un autre jeu */}
                <button
                    disabled
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded cursor-not-allowed"
                >
                    Memory (bientôt)
                </button>
            </div>
        </div>
    )
}

export default Games
