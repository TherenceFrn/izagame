// src/components/NumberFrequencyCard.jsx
import React from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { motion } from 'framer-motion'

function NumberFrequencyCard({ number, count, isCompleted }) {
    const maxCount = 9
    const percentage = (count / maxCount) * 100

    // Définir la couleur de la bordure circulaire en fonction de la progression
    const progressColor = percentage === 100
        ? '#16a34a' // Vert pour complété
        : percentage >= 66
            ? '#fbbf24' // Jaune pour bien avancé
            : '#ef4444' // Rouge pour peu avancé

    // Calcul des propriétés SVG pour le cercle de progression
    const radius = 26
    const stroke = 4
    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center bg-white shadow-md rounded-full p-2 cursor-pointer transition-transform duration-300"
        >
            <div className="relative flex items-center justify-center">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                >
                    <circle
                        stroke="#e5e7eb" // Couleur de fond du cercle
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke={progressColor}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-md font-bold text-gray-800">{number}</span>
                    {isCompleted && (
                        <FaCheckCircle className="text-green-500 mt-1" title="Completé" />
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default NumberFrequencyCard
