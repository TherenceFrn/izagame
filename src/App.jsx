import { useState } from 'react'
import './App.css'

function App() {
    // Tableau de 81 cellules pour la grille Sudoku
    const cells = Array.from({ length: 81 }, (_, index) => index)
    // Tableau des chiffres disponibles
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    // État pour compter le nombre de chiffres placés
    const [placedCount, setPlacedCount] = useState(0)

    return (
        <div className="mt-[40px] flex flex-col items-center">
            <h1 className="text-xl text-gray-700 font-bold mb-8">Sudoku</h1>

            {/* Grille 9x9 */}
            <div className="grid grid-cols-9 grid-rows-9 gap-2 w-fit">
                {cells.map((cellIndex) => (
                    <div
                        key={cellIndex}
                        className="w-[40px] h-[40px] bg-gray-100 border-[1px] border-gray-300 text-center text-md"
                    >
                        {/* Vide pour l’instant */}
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
                                // Par exemple, on pourrait appeler une fonction
                                // pour placer ce chiffre dans la grille, etc.
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
                    Nombre de chiffres placés :{' '}
                    <span className="font-bold">{placedCount}</span>
                </div>
            </div>
        </div>
    )
}

export default App
