import React, { useState } from 'react';

const ITIStudyGuide = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedTopic, setExpandedTopic] = useState(null);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setExpandedTopic(null);
    };

    const toggleTopic = (topic) => {
        setExpandedTopic(expandedTopic === topic ? null : topic);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white p-6 shadow-md">
                <h1 className="text-3xl font-bold">Informationstechnologie (ITI) - Studienführer</h1>
                <p className="mt-2 text-lg">Basierend auf Übungsklausuren der Wilhelm Büchner Hochschule</p>
            </header>

            <nav className="bg-white shadow-md">
                <ul className="flex p-4 space-x-4 overflow-x-auto">
                    <li
                        className={`px-4 py-2 rounded cursor-pointer ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                        onClick={() => handleTabClick('overview')}
                    >
                        Überblick
                    </li>
                    <li
                        className={`px-4 py-2 rounded cursor-pointer ${activeTab === 'layer1' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                        onClick={() => handleTabClick('layer1')}
                    >
                        Layer 1
                    </li>
                    <li
                        className={`px-4 py-2 rounded cursor-pointer ${activeTab === 'layer2' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                        onClick={() => handleTabClick('layer2')}
                    >
                        Layer 2
                    </li>
                    <li
                        className={`px-4 py-2 rounded cursor-pointer ${activeTab === 'layer3' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                        onClick={() => handleTabClick('layer3')}
                    >
                        Layer 3-4
                    </li>
                    <li
                        className={`px-4 py-2 rounded cursor-pointer ${activeTab === 'security' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                        onClick={() => handleTabClick('security')}
                    >
                        Sicherheit
                    </li>
                    <li
                        className={`px-4 py-2 rounded cursor-pointer ${activeTab === 'infotheory' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                        onClick={() => handleTabClick('infotheory')}
                    >
                        Informationstheorie
                    </li>
                </ul>
            </nav>

            <main className="flex-grow p-6">
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Übersicht OSI-Schichtenmodell</h2>
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <p className="mb-4">Das ISO/OSI-Modell ist ein 7-schichtiges Referenzmodell für Netzwerkkommunikation.</p>

                            <h3 className="text-xl font-semibold mb-2">OSI vs. TCP/IP-Protokoll</h3>
                            <p>TCP/IP hat nur 4 Schichten und fasst mehrere OSI-Schichten zusammen:</p>
                            <ul className="list-disc pl-6 mb-4">
                                <li>Application: entspricht OSI-Schichten 5-7</li>
                                <li>Transport: entspricht OSI-Schicht 4</li>
                                <li>Internet: entspricht OSI-Schicht 3</li>
                                <li>Host-to-Network: entspricht OSI-Schichten 1-2</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold mb-4">Übliche Prüfungsthemen</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-2">Layer 1: Bitübertragung</h3>
                                <ul className="list-disc pl-6">
                                    <li>Netzwerktopologien</li>
                                    <li>Kabeltypen (Twisted-Pair, LWL)</li>
                                    <li>Übertragungstechniken</li>
                                </ul>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-2">Layer 2: Sicherung</h3>
                                <ul className="list-disc pl-6">
                                    <li>Kollisionsdomänen</li>
                                    <li>Switches und Bridges</li>
                                    <li>MAC-Adressen</li>
                                </ul>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-2">Layer 3: Vermittlung</h3>
                                <ul className="list-disc pl-6">
                                    <li>IP-Adressierung</li>
                                    <li>Routing-Protokolle</li>
                                    <li>Subnetting</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'layer1' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Layer 1: Physical Layer (Bitübertragungsschicht)</h2>
                        <p>Inhalt für Layer 1 wird bald verfügbar sein.</p>
                    </div>
                )}

                {activeTab === 'layer2' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Layer 2: Data Link Layer (Sicherungsschicht)</h2>
                        <p>Inhalt für Layer 2 wird bald verfügbar sein.</p>
                    </div>
                )}

                {activeTab === 'layer3' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Layer 3-4: Network & Transport Layer</h2>
                        <p>Inhalt für Layer 3-4 wird bald verfügbar sein.</p>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Netzwerksicherheit</h2>
                        <p>Inhalt für Netzwerksicherheit wird bald verfügbar sein.</p>
                    </div>
                )}

                {activeTab === 'infotheory' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Informationstheorie</h2>
                        <p>Inhalt für Informationstheorie wird bald verfügbar sein.</p>
                    </div>
                )}
            </main>

            <footer className="bg-gray-700 text-white p-4 text-center">
                <p>© {new Date().getFullYear()} Wilhelm Büchner Hochschule - ITI-Studienführer</p>
            </footer>
        </div>
    );
};

export default ITIStudyGuide;