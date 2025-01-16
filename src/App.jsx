import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Games from './pages/Games'
import Sudoku from './pages/Sudoku'
import Party from './pages/Party'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                {/* Liste de tous les jeux */}
                <Route path="/" element={<Games />} />

                {/* Page spécifique pour “créer une partie Sudoku” */}
                <Route path="/sudoku" element={<Sudoku />} />

                {/* Page de la partie (multi) : /party?id=xxx */}
                <Route path="/party" element={<Party />} />
            </Routes>
        </Router>
    )
}

export default App
