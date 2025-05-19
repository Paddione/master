import React, { useState } from 'react';
import FormulaCollection from './FormulaCollection';
import ITIStudyGuide from './ITIStudyGuide';
import KonzepteViewer from './KonzepteViewer';
import HomePage from './HomePage';
import '../../formula-app-fresh/src/App.css';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<string>('home');

    // Navigation function to be passed to components that need to navigate
    const navigateTo = (page: string) => {
        setCurrentPage(page);
    };

    // Render the appropriate component based on currentPage
    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage navigateTo={navigateTo} />;
            case 'formulas':
                return <FormulaCollection />;
            case 'iti-guide':
                return <ITIStudyGuide />;
            case 'konzepte':
                return <KonzepteViewer />;
            default:
                return <HomePage navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-blue-600 text-white p-4 shadow-md">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Informationstechnik Lernhilfe</h1>
                    {currentPage !== 'home' && (
                        <button
                            onClick={() => navigateTo('home')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Zurück zur Startseite
                        </button>
                    )}
                </div>
            </header>

            <main className="container mx-auto py-8 px-4">
                {renderPage()}
            </main>

            <footer className="bg-gray-800 text-white py-4 mt-auto">
                <div className="container mx-auto text-center">
                    <p>© {new Date().getFullYear()} Informationstechnik Lernhilfe</p>
                </div>
            </footer>
        </div>
    );
};

export default App;