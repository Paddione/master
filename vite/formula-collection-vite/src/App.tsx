import React, { useState } from 'react'
import FormulaCollection from './FormulaCollection'
import ITIStudyGuide from './ITIStudyGuide'
import KonzepteViewer from './KonzepteViewer'
import HomePage from './HomePage'
import './App.css'

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<string>('home')

    const navigateTo = (page: string) => {
        setCurrentPage(page)
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage navigateTo={navigateTo} />
            case 'formulas':
                return <FormulaCollection />
            case 'iti-guide':
                return <ITIStudyGuide />
            case 'konzepte':
                return <KonzepteViewer />
            default:
                return <HomePage navigateTo={navigateTo} />
        }
    }

    return (
        <div className="app">
            <header className="app-header">
                {currentPage !== 'home' && (
                    <button
                        onClick={() => navigateTo('home')}
                        className="home-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Zurück zur Startseite
                    </button>
                )}
            </header>
            <main>
                {renderPage()}
            </main>
        </div>
    )
}

export default App