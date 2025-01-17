import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Games from './pages/Games'
import PartyLobby from './pages/PartyLobby'
import PartyGame from './pages/PartyGame'
import PartyRanking from './pages/PartyRanking'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                {/* Page listant tous les jeux */}
                <Route path="/" element={<Games />} />

                {/* Lobby : on crée ou rejoint une partie (quelle que soit le jeu) */}
                <Route path="/lobby" element={<PartyLobby />} />

                {/* Page de jeu en cours : /partyGame?game=sudoku&id=xxx */}
                <Route path="/partyGame" element={<PartyGame />} />

                {/* Page de classement final */}
                <Route path="/partyRanking" element={<PartyRanking />} />
            </Routes>
        </Router>
    )
}

export default App
