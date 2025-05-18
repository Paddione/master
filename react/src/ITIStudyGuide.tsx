import React, { useState } from 'react';

// Definiert den Typ für den expandedTopic-State für bessere Typsicherheit
type ExpandedTopic = string | null;

const ITIStudyGuide: React.FC = () => {
    // State für den aktiven Tab, initial auf 'overview' gesetzt
    const [activeTab, setActiveTab] = useState<string>('overview');
    // State für das aktuell ausgefahrene Thema, initial auf null
    const [expandedTopic, setExpandedTopic] = useState<ExpandedTopic>(null);

    // Handler für den Klick auf einen Tab
    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setExpandedTopic(null); // Setzt das ausgefahrene Thema zurück, wenn der Tab gewechselt wird
    };

    // Handler zum Ein-/Ausklappen eines Themas
    const toggleTopic = (topic: string) => {
        setExpandedTopic(expandedTopic === topic ? null : topic);
    };

    // Rendert den Inhalt für den "Überblick"-Tab
    const renderOverviewContent = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Übersicht OSI-Schichtenmodell</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <p className="mb-4">Das ISO/OSI-Modell ist ein 7-schichtiges Referenzmodell für Netzwerkkommunikation:</p>
                <table className="w-full border-collapse mb-4">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Layer</th>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Funktion</th>
                        <th className="border p-2 text-left">Beispiele</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr><td className="border p-2">7</td><td className="border p-2">Application</td><td className="border p-2">Schnittstelle zum Anwendungsprogramm</td><td className="border p-2">HTTP, FTP, SMTP</td></tr>
                    <tr><td className="border p-2">6</td><td className="border p-2">Presentation</td><td className="border p-2">Datenformate und Verschlüsselung</td><td className="border p-2">ASCII, JPEG, MPEG</td></tr>
                    <tr><td className="border p-2">5</td><td className="border p-2">Session</td><td className="border p-2">Synchronisiert Benutzeraufgaben</td><td className="border p-2">RPC, NetBIOS</td></tr>
                    <tr><td className="border p-2">4</td><td className="border p-2">Transport</td><td className="border p-2">Fehlerfreie Übertragung</td><td className="border p-2">TCP, UDP</td></tr>
                    <tr><td className="border p-2">3</td><td className="border p-2">Network</td><td className="border p-2">Festlegung der Routen</td><td className="border p-2">IP, ICMP</td></tr>
                    <tr><td className="border p-2">2</td><td className="border p-2">Data Link</td><td className="border p-2">Verpackt Rohbits in Rahmen</td><td className="border p-2">Ethernet, WLAN</td></tr>
                    <tr><td className="border p-2">1</td><td className="border p-2">Physical</td><td className="border p-2">Physikalische Verbindung</td><td className="border p-2">Kabel, Stecker</td></tr>
                    </tbody>
                </table>

                <h3 className="text-xl font-semibold mb-2">OSI vs. TCP/IP-Protokoll</h3>
                <p>TCP/IP hat nur 4 Schichten und fasst mehrere OSI-Schichten zusammen:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Application: entspricht OSI-Schichten 5-7</li>
                    <li>Transport: entspricht OSI-Schicht 4</li>
                    <li>Internet: entspricht OSI-Schicht 3</li>
                    <li>Host-to-Network: entspricht OSI-Schichten 1-2</li>
                </ul>
                <p className="mb-4">Das TCP/IP-Modell ist praxisorientierter und wurde zum Internet-Standard, während OSI hauptsächlich als theoretisches Referenzmodell dient.</p>
            </div>

            <h2 className="text-2xl font-bold mb-4">Übliche Prüfungsthemen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Layer 1: Bitübertragung</h3>
                    <ul className="list-disc pl-6">
                        <li>Netzwerktopologien</li>
                        <li>Kabeltypen (Twisted-Pair, LWL)</li>
                        <li>Übertragungstechniken</li>
                        <li>Signale und Codierung</li>
                        <li>Multiplexing</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Layer 2: Sicherung</h3>
                    <ul className="list-disc pl-6">
                        <li>Kollisionsdomänen</li>
                        <li>Switches und Bridges</li>
                        <li>MAC-Adressen</li>
                        <li>Fehlererkennung (CRC)</li>
                        <li>Spanning Tree</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Layer 3: Vermittlung</h3>
                    <ul className="list-disc pl-6">
                        <li>IP-Adressierung</li>
                        <li>Routing-Protokolle</li>
                        <li>Subnetting</li>
                        <li>NAT/PAT</li>
                        <li>IPv6</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Layer 4: Transport</h3>
                    <ul className="list-disc pl-6">
                        <li>TCP vs. UDP</li>
                        <li>Ports und Sockets</li>
                        <li>Verbindungsaufbau</li>
                        <li>Flusskontrolle</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Informationstheorie</h3>
                    <ul className="list-disc pl-6">
                        <li>Signalklassifikation</li>
                        <li>Entropie und Redundanz</li>
                        <li>Codierung</li>
                        <li>Fehlerkorrektur</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Sicherheit</h3>
                    <ul className="list-disc pl-6">
                        <li>Symmetrische Verschlüsselung</li>
                        <li>Asymmetrische Verschlüsselung</li>
                        <li>VPN und Tunneling</li>
                        <li>Netzwerkmanagement</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    // Rendert den Inhalt für den "Layer 1"-Tab
    const renderLayer1Content = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Layer 1: Physical Layer (Bitübertragungsschicht)</h2>
            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('netzwerktopologien')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Netzwerktopologien</h3>
                    <span>{expandedTopic === 'netzwerktopologien' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'netzwerktopologien' && (
                    <div className="mt-4">
                        <ul className="list-disc pl-6 mb-4">
                            <li><strong>Ring:</strong> Geräte in Ringstruktur verbunden</li>
                            <li><strong>Sternförmige Verkabelung im topologischen Ring:</strong> Physisch als Stern, logisch als Ring</li>
                            <li><strong>Doppelter Ring:</strong> Zusätzliche Redundanz bei Kabelbruch</li>
                            <li><strong>Stern:</strong> Zentraler Knotenpunkt verbindet alle Geräte</li>
                            <li><strong>Bus:</strong> Alle Geräte an einem Kabelstrang</li>
                            <li><strong>Baum:</strong> Hierarchische Baumstruktur</li>
                            <li><strong>Maschen:</strong> Geräte mehrfach miteinander verbunden</li>
                        </ul>
                    </div>
                )}
            </div>

            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('kabeltypen')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Kabeltypen</h3>
                    <span>{expandedTopic === 'kabeltypen' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'kabeltypen' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Twisted-Pair-Kabel</h4>
                        <p className="mb-2">Adern sind ineinander verdrillt, um Störstrahlungen (Nebensprechen) zu reduzieren. Die Verdrillung schwächt Magnetfelder ab, die durch bewegte Ladungen erzeugt werden.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Patchkabel</h4>
                        <p className="mb-2">Kurze Verbindungskabel zwischen Endgerät und Anschlussdose bzw. zwischen Konzentrator und Rangierpanel.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Lichtwellenleiter-Typen</h4>
                        <ul className="list-disc pl-6">
                            <li><strong>Monomodefaser:</strong> Kerndurchmesser 8-10 μm, Gesamtdurchmesser entspricht einer Wellenlänge, Bandbreite bis zu 10 GHz, bis zu 60 km, keine Dispersion</li>
                            <li><strong>Multimodefaser mit Gradientenindex:</strong> Kerndurchmesser 50 μm, unterschiedliche verwendete Wellenlängen, Bandbreite bis zu 1 GHz, bis zu 27 km, geringe Dispersion, Brechungsindex ändert sich fließend</li>
                            <li><strong>Stufenindexfaser:</strong> Kerndurchmesser 50 μm, unterschiedliche verwendete Wellenlängen, Bandbreite bis zu 100 MHz, bis zu 1 km, unterschiedliche Signalverzögerungen</li>
                        </ul>
                    </div>
                )}
            </div>

            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('multiplexing')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Multiplexing</h3>
                    <span>{expandedTopic === 'multiplexing' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'multiplexing' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Frequenzmultiplexing</h4>
                        <p className="mb-2">Verschiedene Übertragungskanäle nutzen verschiedene Trägerfrequenzen, basiert auf Amplitudenmodulation, kann analoge und digitale Signale übertragen.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Asynchrones Zeitmultiplexing</h4>
                        <ul className="list-disc pl-6 mb-2">
                            <li>Keine einheitliche Last, unvorhersehbare Lastspitzen</li>
                            <li>Paketorientierte Übertragung (A-TDM)</li>
                            <li>Adressinformation erforderlich</li>
                            <li>Blöcke mit variabler oder fester Länge</li>
                            <li>Keine periodischen Übertragungen</li>
                            <li>Keine garantierte Übertragungskapazität</li>
                        </ul>
                        <h4 className="text-lg font-medium mb-2 mt-4">Synchrones Zeitmultiplexing</h4>
                        <ul className="list-disc pl-6">
                            <li>Jeder Kanal belegt die gesamte Übertragungskapazität für eine bestimmte Zeit (time slot)</li>
                            <li>Keine zusätzliche Adressinformation erforderlich</li>
                            <li>Konstante Blocklänge</li>
                            <li>Periodische Übertragung</li>
                            <li>Garantierte Übertragungsbandbreite</li>
                            <li>Synchronisation erforderlich</li>
                        </ul>
                    </div>
                )}
            </div>

            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('codierung')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Codierung</h3>
                    <span>{expandedTopic === 'codierung' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'codierung' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Manchester-Code</h4>
                        <p className="mb-2">Ein selbsttaktender Code durch Phasensprünge:</p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>1 = Wechsel von hoch zu niedrig in der Intervallmitte</li>
                            <li>0 = Umgekehrter Wechsel</li>
                        </ul>
                        <p className="mb-2"><strong>Vorteile:</strong> Gute Synchronisation und Taktrückgewinnung, Gleichstrom- oder Gleichspannungsfreiheit</p>
                        <p className="mb-2"><strong>Nachteil:</strong> Doppelter Bandbreitenbedarf durch Pegelwechsel innerhalb eines Datenbits</p>
                        <p><strong>Einsatz:</strong> Ethernet nach IEEE 802.3</p>
                    </div>
                )}
            </div>

            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('filter')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Filter und Signalverarbeitung</h3>
                    <span>{expandedTopic === 'filter' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'filter' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">RC-Hochpass</h4>
                        <p className="mb-2">Ein RC-Hochpass besteht aus einem Widerstand R und einem Kondensator C in Reihe geschaltet. Bei niedrigen Frequenzen ist das Übertragungsverhältnis gering, bei hohen Frequenzen geht es gegen 1.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Physikalische Gründe für schlechten Empfang</h4>
                        <ol className="list-decimal pl-6">
                            <li>Allgemeine Dämpfung</li>
                            <li>Frequenzverlust</li>
                            <li>Frequenzabhängige Dämpfung</li>
                            <li>Störung und Verzerrung</li>
                            <li>Rauschen (z.B. Gauss-Rauschen)</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );

    // Rendert den Inhalt für den "Layer 2"-Tab
    const renderLayer2Content = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Layer 2: Data Link Layer (Sicherungsschicht)</h2>
            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('bridgeswitches')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Bridges und Switches</h3>
                    <span>{expandedTopic === 'bridgeswitches' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'bridgeswitches' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Bridge-Funktionsweise</h4>
                        <p className="mb-2">Eine Bridge zerlegt einen Netzwerkstrang in zwei Kollisionsdomänen. Sie muss Daten zwischenspeichern, da sie warten muss, bis das Medium frei ist.</p>
                        <p className="mb-2"><strong>Vorteile:</strong> Kann Segmente verschiedener Zugriffsverfahren verbinden (z.B. Token Ring mit Ethernet) und Busse verschiedener Geschwindigkeit.</p>
                        <p className="mb-2"><strong>Nachteil:</strong> Zeitkosten durch Pufferung.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Switch</h4>
                        <p className="mb-2">Ein Switch ist eine erweiterte Bridge mit mehreren Ports:</p>
                        <ul className="list-disc pl-6">
                            <li>Verbindet sternförmig Netzsegmente</li>
                            <li>Leitet Daten nur in die betreffende Verbindung weiter</li>
                            <li>Gibt keine Kollisionen weiter</li>
                            <li>Erzeugt neue Signale</li>
                            <li>Schirmt Kollisionen ab</li>
                            <li>Verwendet rudimentäre Routingtabelle durch Beobachtung</li>
                        </ul>
                    </div>
                )}
            </div>

            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('spanning')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Spanning Tree</h3>
                    <span>{expandedTopic === 'spanning' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'spanning' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Layer II-Loop</h4>
                        <p className="mb-2">Ein Loop auf Layer II bedeutet, dass in einer geswitchten/gebridgten Umgebung mehrere Wege zwischen Switches/Bridges vorhanden sind. Das Netzwerk kann zusammenbrechen, da die Bridge Rechner auf beiden Seiten gleichzeitig "sieht" und nicht weiß, wohin sie senden soll.</p>
                        <p className="mb-2"><strong>Lösung:</strong> Geräte einsetzen, die Loops erkennen und betreffende Ports sperren.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Spanning-Tree-Portdelay</h4>
                        <p className="mb-2">Wenn ein Anschluss an einem Switch aktiviert wird, der Spanning-Tree fährt, schaltet dieser bei guten Geräten den neuen Port ab, bis die Topologie feststeht und klar ist, ob ein Loop entstehen wird. Dies kann bis zu 30 Sekunden dauern.</p>
                        <p>Bei Endgeräten kann man den Portdelay abschalten, bei anderen Switches sollte er aktiv bleiben.</p>
                    </div>
                )}
            </div>

            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('fehlererkennung')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Fehlererkennung</h3>
                    <span>{expandedTopic === 'fehlererkennung' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'fehlererkennung' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">CRC (Cyclic Redundancy Check)</h4>
                        <p className="mb-2">CRC findet auf OSI-Schicht 2 (Data-Link-Layer, Sicherungsschicht) statt. Die Checksumme besteht aus k Bit, wobei k der Grad des Generatorpolynoms ist.</p>
                        <p className="mb-2"><strong>Berechnung:</strong> CRC = Rest(x^k * Q(x) / G(X))</p>
                        <p className="mb-2">CRC kann nicht alle Fehlermuster erkennen, insbesondere Vielfache des Generatorpolynoms.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Fehlerkontrollverfahren</h4>
                        <ul className="list-disc pl-6">
                            <li><strong>Fehlererkennung:</strong> Prüft, ob fehlerhaft übertragene Bits vorliegen</li>
                            <li><strong>Fehlerkorrektur:</strong>
                                <ul className="list-disc pl-6">
                                    <li><strong>Vorwärtsfehlerkorrektur (Forward Error Correction):</strong> Redundante Codierung ermöglicht Fehlerbehebung ohne zusätzliche Übertragungen</li>
                                    <li><strong>Rückwärtsfehlerkorrektur (Backward Error Correction):</strong> Nach Erkennen eines Fehlers wird durch weitere Kommunikation der Fehler behoben</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('buszugriff')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Buszugriffsverfahren</h3>
                    <span>{expandedTopic === 'buszugriff' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'buszugriff' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Tokenring</h4>
                        <p className="mb-2">Beim Tokenring-Verfahren darf nur der Teilnehmer senden, der den "Token" besitzt. Der Token ist ein spezielles Telegramm, das nicht beliebig lange gehalten werden darf (max. Tokenbesitzzeit). Die Reihenfolge des Tokenumlaufs wird bei der Netzwerkeinrichtung festgelegt.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Master-Slave-Verfahren</h4>
                        <p className="mb-2">Das Master-Slave-Verfahren durchläuft drei Phasen:</p>
                        <ol className="list-decimal pl-6">
                            <li>Leer-Phase (IDLE): Keine Station sendet</li>
                            <li>Wettbewerbsphase (Contention Period): Kollisionen möglich, Übertragungen werden abgebrochen</li>
                            <li>Übertragungsphase (Transmission Period): Keine Kollision, effektiver Teil des Protokolls</li>
                        </ol>
                        <h4 className="text-lg font-medium mb-2 mt-4">CSMA/CD und Längenbeschränkung</h4>
                        <p className="mb-2">CSMA/CD (Carrier Sense Multiple Access/Collision Detection) erfordert zeitabhängige Parameter. Das Signal hat eine definierte Geschwindigkeit im Medium und muss in einer definierten Zeit das gesamte Medium durchlaufen können. Die Längenbeschränkung ergibt sich aus der maximalen Signallaufzeit.</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Rendert den Inhalt für den "Layer 3-4"-Tab
    // HINWEIS: Der ursprüngliche Guide.tsx hatte keinen spezifischen Inhalt für einen kombinierten Layer 3-4 Tab.
    // Die Themen sind unter "Übliche Prüfungsthemen" im Überblick aufgeführt.
    // Hier könnte man diese Themen detaillierter ausführen oder auf die entsprechenden Abschnitte verlinken.
    const renderLayer3_4Content = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Layer 3 (Network) & Layer 4 (Transport)</h2>
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-xl font-semibold mb-2">Layer 3: Vermittlungsschicht</h3>
                <p className="mb-2">Aufgaben:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Logische Adressierung (z.B. IP-Adressen)</li>
                    <li>Routing (Wegfindung durch das Netzwerk)</li>
                    <li>Fragmentierung von Paketen</li>
                </ul>
                <p>Wichtige Protokolle: IP (Internet Protocol), ICMP (Internet Control Message Protocol), ARP (Address Resolution Protocol), Routing-Protokolle (RIP, OSPF, BGP).</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-xl font-semibold mb-2">Layer 4: Transportschicht</h3>
                <p className="mb-2">Aufgaben:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Segmentierung von Datenströmen der Anwendungsschicht</li>
                    <li>Ende-zu-Ende-Kommunikation zwischen Prozessen</li>
                    <li>Fehlerkontrolle (bei TCP)</li>
                    <li>Flusskontrolle (bei TCP)</li>
                    <li>Port-Adressierung</li>
                </ul>
                <p>Wichtige Protokolle: TCP (Transmission Control Protocol), UDP (User Datagram Protocol).</p>
            </div>
            {/* Hier könnten ausklappbare Abschnitte für IP-Adressierung, Subnetting, TCP vs. UDP etc. hinzugefügt werden */}
        </div>
    );

    // Rendert den Inhalt für den "Sicherheit"-Tab
    const renderSecurityContent = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Netzwerksicherheit</h2>
            {/* Symmetrische Verschlüsselung */}
            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('symmetric')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Symmetrische Verschlüsselung</h3>
                    <span>{expandedTopic === 'symmetric' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'symmetric' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Grundprinzip</h4>
                        <p className="mb-2">Bei der symmetrischen Verschlüsselung wird derselbe Schlüssel sowohl für die Verschlüsselung als auch für die Entschlüsselung verwendet.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Wichtige Verfahren</h4>
                        <ul className="list-disc pl-6 mb-4">
                            <li><strong>DES (Data Encryption Standard):</strong> 56-Bit-Schlüssel, aufgrund der Schlüssellänge heute nicht mehr sicher</li>
                            <li><strong>3DES (Triple DES):</strong> Wendet DES dreimal an, sicherer als Standard-DES</li>
                            <li><strong>AES (Advanced Encryption Standard):</strong> Blockchiffre mit 128, 192 oder 256 Bit Schlüssellänge, Nachfolger von DES</li>
                            <li><strong>Blowfish:</strong> Blockchiffre mit variabler Schlüssellänge (32-448 Bit)</li>
                        </ul>
                        <h4 className="text-lg font-medium mb-2">Einsatzgebiete</h4>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Verschlüsselung großer Datenmengen</li>
                            <li>VPN-Verbindungen (in Kombination mit asymmetrischer Verschlüsselung)</li>
                            <li>Festplattenverschlüsselung</li>
                        </ul>
                        <h4 className="text-lg font-medium mb-2">Vorteile und Nachteile</h4>
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Vorteile</th>
                                <th className="border p-2 text-left">Nachteile</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="border p-2">
                                    <ul className="list-disc pl-4">
                                        <li>Schnelle Ver- und Entschlüsselung</li>
                                        <li>Geringer Rechenaufwand</li>
                                        <li>Für große Datenmengen geeignet</li>
                                    </ul>
                                </td>
                                <td className="border p-2">
                                    <ul className="list-disc pl-4">
                                        <li>Problem des Schlüsselaustauschs</li>
                                        <li>Schlüsselverteilung bei vielen Kommunikationspartnern komplex</li>
                                        <li>Beide Seiten müssen den Schlüssel geheim halten</li>
                                    </ul>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Asymmetrische Verschlüsselung */}
            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('asymmetric')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Asymmetrische Verschlüsselung</h3>
                    <span>{expandedTopic === 'asymmetric' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'asymmetric' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Grundprinzip</h4>
                        <p className="mb-2">Bei der asymmetrischen Verschlüsselung werden zwei unterschiedliche, aber mathematisch verbundene Schlüssel verwendet: ein öffentlicher Schlüssel für die Verschlüsselung und ein privater Schlüssel für die Entschlüsselung.</p>
                        <h4 className="text-lg font-medium mb-2 mt-4">Wichtige Verfahren</h4>
                        <ul className="list-disc pl-6 mb-4">
                            <li><strong>RSA (Rivest, Shamir, Adleman):</strong> Basiert auf dem Faktorisierungsproblem großer Zahlen</li>
                            <li><strong>ECC (Elliptic Curve Cryptography):</strong> Basiert auf elliptischen Kurven, kürzere Schlüssel als RSA bei gleichem Sicherheitsniveau</li>
                            <li><strong>Diffie-Hellman:</strong> Verfahren zum sicheren Schlüsselaustausch über unsichere Kommunikationskanäle</li>
                        </ul>
                        <h4 className="text-lg font-medium mb-2">Public-Key-Infrastruktur (PKI)</h4>
                        <p className="mb-2">Eine PKI besteht aus Komponenten und Diensten, die für die Verwaltung digitaler Zertifikate notwendig sind:</p>
                        <ul className="list-disc pl-6">
                            <li><strong>Zertifizierungsstelle (CA):</strong> Aussteller von Zertifikaten</li>
                            <li><strong>Registrierungsstelle (RA):</strong> Überprüft die Identität vor Zertifikatsausstellung</li>
                            <li><strong>Verzeichnisdienst:</strong> Speichert und verteilt Zertifikate</li>
                            <li><strong>Sperrliste (CRL):</strong> Liste widerrufener Zertifikate</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Hashing und Authentifizierung */}
            <div
                className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic('hashing')}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Hashing und Authentifizierung</h3>
                    <span>{expandedTopic === 'hashing' ? '▼' : '▶'}</span>
                </div>
                {expandedTopic === 'hashing' && (
                    <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Hashfunktionen</h4>
                        <p className="mb-2">Eine Hashfunktion erzeugt aus einer Eingabe beliebiger Länge einen Ausgabewert fester Länge (Hash, Fingerabdruck).</p>
                        <ul className="list-disc pl-6 mb-4">
                            <li><strong>MD5:</strong> 128 Bit, heute als unsicher eingestuft</li>
                            <li><strong>SHA-1:</strong> 160 Bit, seit 2017 als unsicher eingestuft</li>
                            <li><strong>SHA-256/SHA-512:</strong> Teil der SHA-2-Familie, sicherer als Vorgänger</li>
                            <li><strong>SHA-3:</strong> Neuester SHA-Standard, anders aufgebaut als SHA-1/SHA-2</li>
                        </ul>
                        <h4 className="text-lg font-medium mb-2 mt-4">Digitale Signaturen</h4>
                        <p className="mb-2">Digitale Signaturen kombinieren asymmetrische Verschlüsselung und Hashfunktionen:</p>
                        <ol className="list-decimal pl-6 mb-4">
                            <li>Der Absender erstellt einen Hash der Nachricht</li>
                            <li>Der Hash wird mit dem privaten Schlüssel des Absenders verschlüsselt (= Signatur)</li>
                            <li>Der Empfänger entschlüsselt die Signatur mit dem öffentlichen Schlüssel des Absenders</li>
                            <li>Der Empfänger vergleicht den entschlüsselten Hash mit dem selbst berechneten Hash</li>
                        </ol>
                        <h4 className="text-lg font-medium mb-2">Authentifizierungsverfahren</h4>
                        <ul className="list-disc pl-6">
                            <li><strong>Passwortbasierte Authentifizierung:</strong> Kenntnis eines Geheimnisses</li>
                            <li><strong>Zertifikatsbasierte Authentifizierung:</strong> Verwendung digitaler Zertifikate</li>
                            <li><strong>Zwei-Faktor-Authentifizierung (2FA):</strong> Kombination aus zwei unterschiedlichen Faktoren (Wissen, Besitz, Biometrie)</li>
                            <li><strong>OAuth:</strong> Offener Standard für die Autorisierung</li>
                            <li><strong>RADIUS (Remote Authentication Dial-In User Service):</strong> Protokoll für Authentifizierung, Autorisierung und Accounting</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );

    // Rendert den Inhalt für den "Informationstheorie"-Tab
    // HINWEIS: Der ursprüngliche Guide.tsx hatte keinen spezifischen Inhalt für diesen Tab.
    // Die Themen sind unter "Übliche Prüfungsthemen" im Überblick aufgeführt.
    // Die Formelsammlung (FormulaCollection.jsx) ist eine separate Komponente.
    const renderInfoTheoryContent = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Informationstheorie</h2>
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <p className="mb-2">Dieser Abschnitt behandelt die Grundlagen der Informationstheorie.</p>
                <p className="mb-2">Wichtige Themen umfassen:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Signalklassifikation</li>
                    <li>Informationsgehalt und Entropie</li>
                    <li>Redundanz</li>
                    <li>Quellencodierung (z.B. Huffman-Code)</li>
                    <li>Kanalcodierung und Fehlererkennung/-korrektur (z.B. Hamming-Code, CRC)</li>
                    <li>Kanalkapazität (Shannon-Hartley-Gesetz)</li>
                </ul>
                <p>Eine detaillierte Formelsammlung finden Sie im entsprechenden Bereich der Anwendung.</p>
                {/* Hier könnten ausklappbare Abschnitte für die oben genannten Themen hinzugefügt werden */}
            </div>
        </div>
    );

    // Haupt-Return-Statement der Komponente
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 font-sans"> {/* Standard-Schriftart für bessere Lesbarkeit */}
            <header className="bg-blue-700 text-white p-6 shadow-lg"> {/* Etwas dunkleres Blau und mehr Schatten */}
                <h1 className="text-4xl font-bold tracking-tight">Informationstechnologie (ITI) - Studienführer</h1> {/* Größere Schrift, engerer Buchstabenabstand */}
                <p className="mt-2 text-lg text-blue-100">Basierend auf Übungsklausuren der Wilhelm Büchner Hochschule</p>
            </header>

            <nav className="bg-white shadow-md sticky top-0 z-10"> {/* Sticky Navigationsleiste */}
                <ul className="flex p-4 space-x-2 md:space-x-4 overflow-x-auto justify-center"> {/* Zentrierte Tabs auf größeren Bildschirmen */}
                    {[
                        { id: 'overview', label: 'Überblick' },
                        { id: 'layer1', label: 'Layer 1' },
                        { id: 'layer2', label: 'Layer 2' },
                        { id: 'layer3-4', label: 'Layer 3-4' }, // ID für den Tab Layer 3-4 angepasst
                        { id: 'security', label: 'Sicherheit' },
                        { id: 'infotheory', label: 'Informationstheorie' },
                    ].map(tab => (
                        <li
                            key={tab.id}
                            className={`px-3 py-2 md:px-4 md:py-2 rounded-md cursor-pointer text-sm md:text-base font-medium transition-colors duration-150
                ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                            onClick={() => handleTabClick(tab.id)}
                        >
                            {tab.label}
                        </li>
                    ))}
                </ul>
            </nav>

            <main className="flex-grow p-4 md:p-6 lg:p-8 bg-gray-50"> {/* Hellerer Hintergrund für den Hauptinhalt */}
                {/* Bedingtes Rendern des Inhalts basierend auf dem aktiven Tab */}
                {activeTab === 'overview' && renderOverviewContent()}
                {activeTab === 'layer1' && renderLayer1Content()}
                {activeTab === 'layer2' && renderLayer2Content()}
                {activeTab === 'layer3-4' && renderLayer3_4Content()} {/* Aufruf der korrekten Render-Funktion */}
                {activeTab === 'security' && renderSecurityContent()}
                {activeTab === 'infotheory' && renderInfoTheoryContent()}
            </main>

            <footer className="bg-gray-800 text-white text-center p-4 text-sm">
                © {new Date().getFullYear()} Studienführer ITI - Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};

export default ITIStudyGuide;
