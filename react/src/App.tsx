import React, { useState } from 'react';
// Kommentiere die fehlenden Importe aus
// import KonzepteViewer from './KonzepteViewer';
// import ITIStudyGuide from './ITIStudyGuide';
import FormulaCollection from './FormulaCollection';

function App() {
    // Vereinfachen wir den State zu 'formulas', da die anderen Komponenten noch nicht existieren
    const [activeComponent, setActiveComponent] = useState<'iti' | 'konzepte' | 'formulas'>('formulas');

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-blue-700 text-white p-4 shadow-md">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-2xl font-bold mb-4 md:mb-0">ITI Studienführer</h1>
                    <nav>
                        <ul className="flex flex-wrap space-x-2 md:space-x-4">
                            <li className="mb-2 md:mb-0">
                                <button
                                    onClick={() => setActiveComponent('formulas')}
                                    className={`px-3 py-1 md:px-4 md:py-2 rounded transition-colors bg-white text-blue-700 font-medium`}
                                >
                                    Formelsammlung
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <main>
                {/* Kommentiere die nicht vorhandenen Komponenten aus */}
                {/* {activeComponent === 'iti' && <ITIStudyGuide />} */}
                {/* {activeComponent === 'konzepte' && <KonzepteViewer />} */}
                {activeComponent === 'formulas' && <FormulaCollection />}
            </main>
        </div>
    );
}

export default App;