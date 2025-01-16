import { useState, useEffect } from 'react'
import sudoku from 'sudoku'
import './App.css'

function App() {
    // Stocke la grille Sudoku (tableau de 81 cases) pour l'affichage / édition
    const [puzzle, setPuzzle] = useState([])
    // Stocke la solution complète (tableau de 81 cases) pour vérif
    const [solution, setSolution] = useState([])
    // Indique si une case est verrouillée (pré-remplie ou validée)
    const [locked, setLocked] = useState([])
    // Nombre de chiffres placés
    const [placedCount, setPlacedCount] = useState(0)
    // Nombre de vies
    const [lives, setLives] = useState(3)
    // Difficulté (0 = très facile, jusqu’à 4 = très difficile)
    const [difficulty, setDifficulty] = useState(1) // Par défaut : 1 (moyen)

    useEffect(() => {
        generateNewPuzzle(difficulty)
        // eslint-disable-next-line
    }, [])

    /**
     * Génère un nouveau Sudoku d’un certain niveau de difficulté.
     * difficultyLevel ∈ [0..4]
     */
    const generateNewPuzzle = (difficultyLevel) => {
        // On va tenter de trouver un puzzle dont le rating correspond à difficultyLevel
        // Pour éviter les boucles infinies, on limite le nombre d’essais (ex : 1000).
        let puzzleBoard = null
        let rating = -1

        for (let i = 0; i < 1000; i++) {
            const tempPuzzle = sudoku.makepuzzle() // tableau 81 éléments (0..8 ou null)
            const tempRating = sudoku.ratepuzzle(tempPuzzle, 4)
            // ratepuzzle(...) renvoie un entier 0..4

            if (tempRating === difficultyLevel) {
                puzzleBoard = tempPuzzle
                rating = tempRating
                break
            }
        }

        // Si on n’a pas trouvé de puzzle après 1000 essais, on prend juste un puzzle random
        if (!puzzleBoard) {
            console.warn(
                `Impossible de trouver un puzzle de difficulté ${difficultyLevel} après 1000 essais ! 
        On génère un puzzle aléatoire.`
            )
            puzzleBoard = sudoku.makepuzzle()
            rating = sudoku.ratepuzzle(puzzleBoard, 4)
        }

        // Générer la solution associée
        const rawSolution = sudoku.solvepuzzle(puzzleBoard)

        // Convertir puzzle en tableau [0..9] (0 = vide, 1..9 = chiffre)
        const normalizedPuzzle = puzzleBoard.map((val) => (val === null ? 0 : val + 1))
        // Convertir solution en tableau [1..9]
        const normalizedSolution = rawSolution.map((val) => val + 1)

        // Créer un tableau locked[] pour chaque cellule
        // Si puzzle[i] != 0 => c'est un chiffre initial => locked = true
        // Sinon => locked = false
        const newLocked = normalizedPuzzle.map((val) => (val !== 0))

        // Compter le nombre de chiffres placés
        const initialCount = normalizedPuzzle.reduce(
            (acc, cell) => (cell !== 0 ? acc + 1 : acc),
            0
        )

        setPuzzle(normalizedPuzzle)
        setSolution(normalizedSolution)
        setLocked(newLocked)
        setPlacedCount(initialCount)
        setLives(3) // Réinitialiser les vies à 3
    }

    /** Lorsqu’on modifie la valeur d’une case (clavier), on vérifie la validité */
    const handleChange = (e, index) => {
        // Récupérer la valeur tapée (ex : '5')
        const inputValue = e.target.value

        // On n’accepte que [1..9], et on ne fait rien si la valeur est vide ou non numérique
        if (!/^[1-9]$/.test(inputValue)) {
            // On peut vider le champ si c’est invalide
            e.target.value = ''
            return
        }

        const numberValue = parseInt(inputValue, 10)

        // Vérifier la solution
        if (numberValue === solution[index]) {
            // Bonne réponse
            const newPuzzle = [...puzzle]
            newPuzzle[index] = numberValue

            const newLocked = [...locked]
            newLocked[index] = true // Verrouiller la case (correcte)

            setPuzzle(newPuzzle)
            setLocked(newLocked)
            setPlacedCount((prev) => prev + 1)
        } else {
            // Mauvaise réponse => retirer 1 vie
            setLives((prev) => {
                if (prev === 1) {
                    alert('Game Over !')
                }
                return prev - 1
            })
        }

        // On vide la valeur de l’input après vérif pour éviter de bloquer le champ
        e.target.value = ''
    }

    // Tableau des chiffres disponibles (optionnel)
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    // Savoir si on doit bloquer complètement la grille quand lives=0
    const isGameOver = lives <= 0

    return (
        <div className="mt-[40px] flex flex-col items-center">
            <h1 className="text-xl text-gray-700 font-bold mb-8">Sudoku</h1>

            {/* Sélection de la difficulté */}
            <div className="flex items-center gap-2 mb-4">
                <label htmlFor="difficulty" className="text-gray-700">Difficulté :</label>
                <select
                    id="difficulty"
                    className="border border-gray-300 p-1 rounded"
                    value={difficulty}
                    onChange={(e) => {
                        const level = parseInt(e.target.value, 10)
                        setDifficulty(level)
                        generateNewPuzzle(level) // Générer immédiatement un nouveau puzzle
                    }}
                >
                    <option value={0}>Très facile (0)</option>
                    <option value={1}>Facile / Moyen (1)</option>
                    <option value={2}>Difficile (2)</option>
                    <option value={3}>Très difficile (3)</option>
                    <option value={4}>Extrême (4)</option>
                </select>
            </div>

            {/* Affichage des vies */}
            <div className="mb-4 text-red-600 font-semibold">
                Vies restantes : {lives}
            </div>

            {/* Grille 9x9 */}
            <div className="grid grid-cols-9 grid-rows-9 gap-2 w-fit">
                {puzzle.map((value, cellIndex) => {
                    // La case est verrouillée si locked[cellIndex] = true ou si game over
                    const cellLocked = locked[cellIndex] || isGameOver
                    return (
                        <div
                            key={cellIndex}
                            className="w-[40px] h-[40px] bg-gray-100 border-[1px]
                         border-gray-300 text-center text-md flex items-center justify-center"
                        >
                            {cellLocked ? (
                                // On affiche la valeur dans la case
                                <span className="font-bold text-blue-600">
                  {value !== 0 ? value : ''}
                </span>
                            ) : (
                                // Sinon, un input pour permettre la saisie
                                <input
                                    className="w-full h-full text-center bg-white"
                                    type="text"
                                    maxLength={1}
                                    onChange={(e) => handleChange(e, cellIndex)}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Liste des chiffres disponibles (exemple) */}
            <div className="mt-8 flex flex-col items-center">
                <div className="mb-2 text-gray-700">Chiffres disponibles :</div>
                <div className="flex space-x-2">
                    {digits.map((num) => (
                        <button
                            key={num}
                            onClick={() => {
                                // Ici on pourrait gérer un mode "sélectionne un chiffre",
                                // puis un clic sur une case, etc. (non implémenté ici)
                                console.log(`Vous avez cliqué sur ${num}`)
                            }}
                            className="w-8 h-8 bg-blue-100 border border-blue-300 text-blue-700 rounded hover:bg-blue-200"
                            disabled={isGameOver}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                {/* Nombre de chiffres placés */}
                <div className="mt-4 text-gray-700">
                    Nombre de chiffres placés : <span className="font-bold">{placedCount}</span>
                </div>

                {/* Bouton pour regénérer un puzzle (même difficulté) */}
                <div className="mt-4">
                    <button
                        onClick={() => generateNewPuzzle(difficulty)}
                        className="px-4 py-2 bg-green-100 border border-green-300
                       text-green-700 rounded hover:bg-green-200"
                    >
                        Nouveau Sudoku
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App
