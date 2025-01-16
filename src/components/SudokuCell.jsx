function SudokuCell({
                        value,
                        locked,
                        onChange,
                        extraClasses,
                        row,
                        col,
                        hoveredCell,
                        setHoveredCell,
                        isGameOver,
                    }) {
    // ID (unique) de la cellule en cours
    const myCellIndex = row * 9 + col

    // Calcule si on fait partie de la même ligne/colonne que hoveredCell
    const isHoveredRow =
        hoveredCell !== -1 && Math.floor(hoveredCell / 9) === row
    const isHoveredCol =
        hoveredCell !== -1 && hoveredCell % 9 === col

    // Gère l’événement "onMouseEnter"
    const handleMouseEnter = () => {
        // Si le jeu est fini, on n’actualise pas
        if (!isGameOver) {
            setHoveredCell(myCellIndex)
        }
    }

    // Gère l’événement "onMouseLeave"
    const handleMouseLeave = () => {
        setHoveredCell(-1)
    }

    // Détermine la couleur de fond dynamique
    let backgroundClass = 'bg-gray-100' // par défaut

    // Si on survole une cellule (hoveredCell != -1)
    // et que cette case est alignée (même row ou col),
    // on applique un background plus clair ou plus sombre
    if (isHoveredRow || isHoveredCol) {
        if (value !== 0 || locked) {
            // cellule verrouillée ou déjà remplie => plus sombre
            backgroundClass = 'bg-blue-200'
        } else {
            // cellule vide => plus clair
            backgroundClass = 'bg-blue-100'
        }
    }

    // Combine backgroundClass avec extraClasses (bordures, etc.)
    const containerClasses = `${locked ? '' : 'bg-white' } ${extraClasses} ${backgroundClass}`

    // Si la case est locked => on affiche la valeur
    if (locked) {
        return (
            <div
                className={containerClasses}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <span className="font-bold text-blue-600">
                    {value !== 0 ? value : ''}
                </span>
            </div>
        )
    }

    // Sinon, on affiche un <input>
    return (
        <div
            className={containerClasses}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <input
                className="w-full h-full text-center bg-transparent outline-none"
                type="text"
                maxLength={1}
                onChange={onChange}
            />
        </div>
    )
}

export default SudokuCell
