import React, { useState } from 'react';
import HomePage from './HomePage';
import FormulaCollection from './FormulaCollection.jsx';
import ITIStudyGuide from './ITIStudyGuide.tsx';
import KonzepteViewer from './KonzepteViewer.tsx';

// Define possible page identifiers.
type PageId = 'home' | 'formulas' | 'iti-guide' | 'konzepte'; // Add 'konzepte'

function App() {
    // State to keep track of the current page, initialized to 'home'
    const [currentPage, setCurrentPage] = useState<PageId>('home');

    // Function to change the current page
    const navigateTo = (page: string) => {
        setCurrentPage(page as PageId);
    };

    // Function to render the component based on the currentPage state
    const renderPage = () => {
        switch (currentPage) {
            case 'formulas':
                return <FormulaCollection />;
            case 'iti-guide':
                return <ITIStudyGuide />;
            case 'konzepte': // Add case for 'konzepte'
                return <KonzepteViewer />;
            case 'home':
            default:
                return <HomePage navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {currentPage !== 'home' && (
                <div className="p-4">
                    <button
                        onClick={() => navigateTo('home')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out fixed top-4 left-4 z-20"
                    >
                        &larr; Back to Home
                    </button>
                </div>
            )}
            <div className={currentPage !== 'home' ? 'pt-20' : ''}>
                {renderPage()}
            </div>
        </div>
    );
}

export default App;
