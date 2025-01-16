import { useState, useEffect } from 'react'
import sudoku from 'sudoku'
import './App.css'

function App() {
    // Stocke la grille Sudoku (tableau de 81 cases)
    const [puzzle, setPuzzle] = useState([])

    // Stocke le nombre de chiffres placés (exemple, on initialise à 0)
    const [placedCount, setPlacedCount] = useState(0)

    // Génère un nouveau Sudoku à chaque montage du composant
    useEffect(() => {
        generateNewPuzzle()
    }, [])

    // Fonction qui génère un puzzle valide et l’enregistre dans le state
    const generateNewPuzzle = () => {
        // makepuzzle() renvoie un tableau de 81 éléments :
        // - valeurs de 0 à 8 pour les chiffres (donc +1 pour avoir 1..9)
        // - null pour les cases vides
        const rawPuzzle = sudoku.makepuzzle()
        // On convertit en 1..9 ou 0 pour “vide”
        const normalizedPuzzle = rawPuzzle.map((val) => (val === null ? 0 : val + 1))

        setPuzzle(normalizedPuzzle)

        // On recalcule le nombre de chiffres placés par défaut (c.-à-d. != 0)
        const initialCount = normalizedPuzzle.reduce(
            (acc, cell) => (cell !== 0 ? acc + 1 : acc),
            0
        )
        setPlacedCount(initialCount)
    }

    // Tableau des chiffres disponibles
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    return (
        <div className="mt-[40px] flex flex-col items-center">
            <h1 className="text-xl text-gray-700 font-bold mb-8">Sudoku</h1>

            {/* Grille 9x9 */}
            <div className="grid grid-cols-9 grid-rows-9 gap-2 w-fit">
                {puzzle.map((value, cellIndex) => (
                    <div
                        key={cellIndex}
                        className="w-[40px] h-[40px] bg-gray-100 border-[1px] border-gray-300 text-center text-md flex items-center justify-center"
                    >
                        {
                            value !== 0
                                ? <span className="font-bold text-blue-600">{value}</span>
                                : '' /* ou <input> si on veut une case éditable */
                        }
                    </div>
                ))}
            </div>

            {/* Liste des chiffres disponibles */}
            <div className="mt-8 flex flex-col items-center">
                <div className="mb-2 text-gray-700">Chiffres disponibles :</div>
                <div className="flex space-x-2">
                    {digits.map((num) => (
                        <button
                            key={num}
                            onClick={() => {
                                // Ici vous pouvez gérer la logique de placement du chiffre dans la grille,
                                // puis mettre à jour 'placedCount' si un nouveau chiffre est placé.
                                console.log(`Vous avez cliqué sur ${num}`)
                            }}
                            className="w-8 h-8 bg-blue-100 border border-blue-300 text-blue-700 rounded hover:bg-blue-200"
                        >
                            {num}
                        </button>
                    ))}
                </div>

                {/* Nombre de chiffres placés */}
                <div className="mt-4 text-gray-700">
                    Nombre de chiffres placés : <span className="font-bold">{placedCount}</span>
                </div>

                {/* Bouton pour regénérer un puzzle */}
                <div className="mt-4">
                    <button
                        onClick={generateNewPuzzle}
                        className="px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded hover:bg-green-200"
                    >
                        Nouveau Sudoku
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App
