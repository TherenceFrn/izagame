import { io } from 'socket.io-client'

// Remplacez l'URL par celle de votre serveur si différent
const socket = io('http://localhost:3000', {
    autoConnect: true, // Se connecte automatiquement
    // Vous pouvez ajouter des options supplémentaires ici
})

export default socket