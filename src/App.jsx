import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sudoku from './pages/Sudoku'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                {/* Page d'accueil */}
                <Route path="/" element={<Home />} />

                {/* Page Sudoku */}
                <Route path="/sudoku" element={<Sudoku />} />
            </Routes>
        </Router>
    )
}

export default App
