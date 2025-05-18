import React from 'react';

// Interface for a single concept entry
interface KonzeptEntry {
    begriff: string; // Concept/Term
    beschreibung: string; // Description
}

// Raw text content extracted from Konzepte.pdf
// In a real app, this would likely be fetched or passed as a prop.
// This content is based on the PDF provided earlier.
const pdfTextContent = `
"Allgemeine Grundlagen
","Eine mathematische Theorie aus der Wahrscheinlichkeitstheorie und Statistik, die sich mit der
"
"Informationstheorie
","mathematischen Definition des Informationsbegriffs sowie den Grundlagen der Informationsübertragung
 und Codierung beschäftigt. Information wird quantitativ und strukturell analysiert (Def. 1.1).
"
"Shannons Informationsbegriff
","Information ist die Beseitigung von Ungewissheit (Unsicherheit). Etwas vorher nicht Bekanntes wird nach
 Zuführung der Information bekannt (Def. 1.2).
"
"Bit
","(Binary Digit) Maßeinheit für den Informationsgehalt. 1 Bit ist der Informationsgehalt, der aus der Auswahl
 aus zwei gleich wahrscheinlichen Möglichkeiten resultiert (Def. 1.3).
"
"Daten
","Zeichen bzw. Zeichenfolgen oder kontinuierliche Funktionen, die zum Zweck der Verarbeitung Informationen
 darstellen.
"
"Nachrichten
","Zeichen bzw. Zeichenfolgen oder kontinuierliche Funktionen, die zum Zweck der Weitergabe Informationen
 darstellen.
"
"Zeichen
","Ein elementares Informationselement (z. B. Buchstabe, Ziffer, 0, 1).
"
"Alphabet (Zeichenvorrat)
","Ein endlich großer Vorrat einer Menge von Zeichen, aus dem Zeichen entnommen werden..
"
"Signale
","Träger von Informationen, d.h. die physikalische Darstellung von Nachrichten oder Daten.
"
"Quantifizierung von Information
",
"Informationsgehalt
","Die statistische Signifikanz eines Zeichens. Der Informationsgehalt einer Nachricht ist eine logarithmische
 Größe, die angibt, wie viel Information übertragen wurde (Def. 1.4).
"
"Entscheidungsgehalt ( H_{0})
","Der Informationsgehalt, wenn alle m möglichen Zustände (Zeichen) die gleiche Wahrscheinlichkeit haben
 (P(x_{i})=1/m) Formel: H_{0}=log_{2} m.
"
"Mittlerer Informationsgehalt (Entropie H)
","Ein Maß fur den mittleren Informationsgehalt einer Nachricht. Gibt die Anzahl von Binärentscheidungen an,
 die man im Mittel zur Kennzeichnung eines Zustandes braucht, wenn die Zustände verschiedene
 Wahrscheinlichkeiten P(x_{i}) haben. Formel: H=-\\Sigma P(x_{i}) log P(x_{i}) (Def. 1.5).
"
"Quellenredundanz (R&lt;0xE2>&lt;0x82>&lt;0x98>)
","Die Differenz zwischen der maximalen Entropie (Entscheidungsgehalt (H_{0}) und der tatsächlichen Entropie H
 einer Quelle. Gibt an, wie stark die Entropie einer Quelle von der maximal möglichen Entropie abweicht.
 Formel: R&lt;0xE2>&lt;0x82>&lt;0x98> =H_{n}-H
"
"Informationsübertragung
",
"Grundmodell der Informationsübertragung
","Ein von Shannon entwickeltes Modell, bestehend aus Informationsquelle, Sender, Kanal, Empfänger und
 Ziel (Senke), das den Prozess der Informationsübermittlung beschreibt.
"
"Informationsquelle
","Erzeugt eine Nachricht oder eine Folge von Nachrichten, die übertragen werden sollen.
"
"Sender
","Passt die Nachricht an die physikalischen Eigenschaften des Kanals an und erzeugt das Sendesignal.
"
"Kanal
","Das Medium zur Übertragung der Signale (z.B. Kabel, Luft), kann von Störungen beeinflusst werden.
"
"Empfänger
","Wandelt das empfangene Signal in die Nachricht um; führt die inverse Operation zum Sender aus.
"
"Ziel (Senke)
","Der Bestimmungsort der Nachricht.
"
"Zustandswahrscheinlichkeit P(xi)
","Die Wahrscheinlichkeit, dass ein Zeichen x von der Quelle ausgewählt und gesendet wird.
"
"Quellen mit unabhängigen Ereignissen
","Quellen, bei denen aufeinanderfolgende Zeichen unabhängig voneinander sind ( P(x_{i},x_{j})=P(x_{i})\\cdot P(x_{j})). Auch
 ""Quellen ohne Gedächtnis"" genannt.
"
"Quellen mit abhängigen Ereignissen
","Quellen, bei denen das Auftreten eines Ereignisses von vorherigen Ereignissen abhängt. Auch ""Quellen mit
 Gedächtnis"" oder Markow-Quellen genannt.
"
"Übergangswahrscheinlichkeit P(x_{1})
",
"Verbundquelle
","Eine Quelle, die aus mehreren Teilquellen besteht. Zeichenfolgen werden aus der Kombination der Zeichen
 der Einzelquellen generiert.
"
"Verbundentropie H(X,Y)
","Die Entropie einer Verbundquelle. Für unabhängige Quellen: H(X,Y)=H(X)+H(Y). Für abhängige Quellen:
 H(X,Y)=H(X)+H(Y
"
"Transinformation H(X;Y)
","Die beim Empfänger ankommende Information, die tatsächlich von der Quelle stammt. Formel: H(X Y) =
 H(X)+H(Y)-H(X,Y),
"
"Aquivokation H(X
","Y)
"
"Irrelevanz H(Y
","X)
"
"Symmetrisch gestörter Binärkanal
","Ein Übertragungskanal, der nur die binären Zeichen 0 und 1 überträgt, wobei beide Zeichen mit der gleichen
 Wahrscheinlichkeit p (Bitfehterwahrscheinlichkeit) verfälscht werden.
"
"Bitfehlerrate (BER)
","Ein Maß für die Häufigkeit von Bitfehlern bei der Übertragung. Gibt das Verhältnis von fehlerhaft
 empfangenen Bits zur Gesamtzahl der übertragenen Bits an.
"
"Informationsfluss (1)
","Die pro Zeiteinheit übertragene Information. Für Quellen ohne Gedächtnis: I=H(X)
 v&lt;0xE2>&lt;0x82>&lt;s> (Symbolrate). Maßeinheit: bit/s.
"
"Symbolrate (v&lt;s>)
","(Schrittgeschwindigkeit, Baudrate) Die Anzahl der pro Sekunde übertragenen Symbole oder
 Signalzustandsänderungen. Einheit: Baud (Bd).
"
"Kanalkapazität (C)
","Der größtmögliche Informationsfluss, der über einen gestörten Kanal fehlerfrei übertragen werden kann
 (Def. 2.1). Für AWGN-Kanäle: C  Blog(1+ P&lt;0xE2>&lt;0x82>&lt;s>/P&lt;0xE2>&lt;0x82>&lt;0x99>)
 (Shannon-Hartley-Gesetz).
"
"Signale und Signalübertragung
",
"Analoge Signale
","Zeit- und wertkontinuierliche Signale, d.h. sie können zu jedem Zeitpunkt jeden Wert innerhalb eines
 bestimmten Bereichs annehmen..
"
"Digitale Signale
","Zeit- und wertdiskrete Signale, d.h. sie können nur zu bestimmten Zeitpunkten bestimmte Werte annehmen.
"
"Tastverhältnis (D)
","Bei periodischen Impulsen das Verhältnis der Impulsdauer T&lt;0xE2>&lt;0x82>&lt;0x89> zur Periodendauer
 T_{g}. Formel: D= T&lt;0xE2>&lt;0x82>&lt;0x89>/To
 im Frequenzbereich, die zeigt, welche Frequenzen mit welchen Amplituden im
"
"Frequenzspektrum
","Die Darstellung eines Signals
 Signal enthalten sind.
"
"Bandbreite (B)
","Die Differenz zwischen der höchsten und niedrigsten Frequenz eines Signals oder der Frequenzbereich, den
 ein Kanal übertragen kann.
"
"Dynamik (eines Signals)
","Das Verhältnis zwischen dem größten und dem kleinsten Wert eines Signals.
"
"Nachrichtenquader (Signalquader)
","Eine grafische Veranschaulichung der Eigenschaften Bandbreite, Dynamik und Zeit eines Signals. Das
 Produkt dieser drei Größen (Volumen) ist für eine bestimmte Nachricht konstant.
"
"Digitalisierung analoger Signale
","Der Prozess der Umwandlung analoger Signale in digitale Signale, bestehend aus Abtastung, Quantisierung
 und Codierung.
"
"Abtastung
","Die Entnahme von Signalproben aus einem analogen Signal zu diskreten Zeitpunkten.
"
"Quantisierung
","Die Zuordnung der bei der Abtastung gewonnenen kontinuierlichen Werte zu einer endlichen Anzahl von
 diskreten Amplitudenstufen.
"
"Codierung (bei Digitalisierung)
","Die Zuweisung von digitalen (meist binären) Codewörtern zu den quantisierten Amplitudenstufen.
"
"Abtastfrequenz (f&lt;0xE2>&lt;0x82>&lt;0xA6>)
","Die Häufigkeit, mit der ein analoges Signal abgetastet wird (Anzahl der Abtastungen pro Sekunde).
"
"Nyquist-Shannon-Abtasttheorem
","(WKS-Abtasttheorem) Besagt, dass ein analoges Signal fehlerfrei rekonstruiert werden kann, wenn die
 Abtastfrequenz f&lt;0xE2>&lt;0x82>&lt;0xA6> mindestens doppelt so hoch ist wie die höchste im Signal
 enthaltene Frequenz f&lt;0xE2>&lt;0x82>&lt;0x86> (f&lt;0xE2>&lt;0x82>&lt;0xA6> 2
 21&lt;0xE2>&lt;0x82>&lt;0x86>).
"
"Zeitbereich
","Die Darstellung eines Signals als Funktion der Zeit.
"
"Frequenzbereich (Bildbereich)
","Die Darstellung eines Signals als Funktion der Frequenz (Spektrum).
"
"Modulation
","Die Veränderung von Parametern (Amplitude, Frequenz, Phase) eines analogen Trägersignals gemäß der zu
 übertragenden Information.
"
"Umtastung
","Die Veränderung von Parametern eines analogen Trägersignals gemäß einer digitalen Information.
"
"Fourier-Transformation
","Ein mathematisches Verfahren zur Umwandlung eines Signals vom Zeitbereich in den Frequenzbereich und
 umgekehrt.
"
"Fourier-Reihe
","Eine Darstellung einer periodischen Zeitfunktion als Summe (Überlagerung) von Sinus- und
 Kosinusfunktionen (harmonische Schwingungen) unterschiedlicher Frequenzen und Amplituden.
"
"Fourier-Koeffizienten
","Die Amplituden der einzelnen Sinus- und Kosinusfunktionen in der Fourier-Reihe.
"
"Grundfrequenz ( t_{\\circ})
","Die niedrigste Frequenzkomponente eines periodischen Signals; die Frequenz, mit der sich das Signal
 wiederholt.
"
"Grenzfrequenz (f&lt;0xE2>&lt;0x82>&lt;0x86>)
","Eine kritische Frequenz, bis zu der die Frequenzanteile eines Signals übertragen werden müssen, um es
 beim Empfänger noch rekonstruieren zu können. Für einen Rechteckimpuls der Dauer
 T&lt;0xE2>&lt;0x82>&lt;0x89> ist f&lt;0xE2>&lt;0x82>&lt;0x86>= 1/T&lt;0xE2>&lt;0x82>&lt;0x89>.
"
"Übertragungskapazität von Kanälen
",
"Nyquist-Bandbreite
","Die Mindestbandbreite B=v8elt;s>/2 die für die störungsfreie Übertragung von Abtastwerten mit der
 Symbolrate v&lt;s> benötigt wird.
"
"AWGN-Kanal
","(Additive White Gaussian Noise) Ein Kanalmodell, das einen wertkontinuierlichen Übertragungskanal
 beschreibt, der durch additives weißes gaußsches Rauschen gestort wird.
"
"Signal-Rausch-Verhältnis (SNR)
","Das Verhältnis der mittleren Signalleistung (P&lt;0xE2>&lt;0x82>&lt;s>) zur mittleren Rauschleistung
 (P&lt;0xE2>&lt;0x82>&lt;0x99>). Oft in Dezibel (dB) angegeben: SNR [dB]=10
 logo (P&lt;0xE2>&lt;0x82>&lt;s>/P&lt;0xE2>&lt;0x82>&lt;0x99>).
"
"Kanalfenster
","Ein Modell zur Veranschaulichung der Beschränkungen eines Kanals hinsichtlich Bandbreite und Dynamik.
 Der Nachrichtenquader des zu übertragenden Signals muss durch dieses Fenster passen.
"
"Basisbandübertragung
","Die Übertragung von Signalen in ihrem ursprünglichen Frequenzbereich, ohne dass eine
 Frequenzverschiebung (Modulation auf einen Träger) stattfindet.
"
"Breitbandübertragung
","Die Übertragung von Signalen, nachdem sie durch Modulation in ein anderes, meist höheres Frequenzband
 verschoben wurden. Ermöglicht die gleichzeitige Übertragung mehrerer Signale über ein Medium.
"
"DSL (Digital Subscriber Line)
","Eine Technologie zur Breitbanddatenübertragung über Telefonleitungen.
"
"Multiplexverfahren
","Techniken, die es ermöglichen, ein Übertragungsmedium von mehreren Benutzern oder Signalen gleichzeitig
 zu nutzen.
"
"Raummultiplex (SDM)
","(Space Division Multiplex) Nutzung separater physischer Übertragungswege (z. B. Adernpaare, Funkzellen)
 für verschiedene Signale.
"
"Frequenzmultiplex (FDM)
","(Frequency Division Multiplex) Aufteilung des verfugbaren Frequenzbandes eines Übertragungsmediums in
 mehrere separate Frequenzkanāle, die gleichzeitig für unterschiedliche Signale genutzt werden.
"
"Zeitmultiplex (TDM)
","(Time Division Multiplex) Zeitlich verschachtelte Übertragung von Datenpaketen oder Signalen mehrerer
 Quellen über einen gemeinsamen Kanal. Jedem Signal wird ein bestimmter Zeitschlitz zugewiesen.
"
"Codemultiplex (CDM)
","(Code Division Multiplex) Ein Verfahren, bei dem verschiedene Signale durch eindeutige Codes
 unterschieden werden und gleichzeitig im selben Frequenzband übertragen werden können.
"
"Codec
","Eine Hardware-oder Softwarekomponente, die Daten codiert und/oder decodiert. Oft als Kombination von
 A/D- und D/A-Wandler für die Übertragung analoger Signale über digitale Kanäle.
"
"Einführung in die Codierung
",
"Code
","Entsteht durch die umkehrbar eindeutige Abbildung eines Quellenalphabets in ein Codealphabet, wobei das
 Codealphabet bestimmte gewünschte Eigenschaften aufweist (Def. 5.1).
"
"Quellencodierung
","Verfahren zur Reduktion der Datenmenge (Datenkompression) durch Entfernung von Redundanz und/oder
 Irrelevanz aus den Quelldaten. Ziel ist eine effizientere Speicherung oder Übertragung. Kann verlustfrei oder
 verlustbehaftet sein..
"
"Kanalcodierung
","Verfahren, bei den den Nutzdaten gezielt Redundanz hinzugefugt wird, um Fehler, die während der
 Übertragung oder Speicherung auftreten, erkennen oder korrigieren zu können.
"
"Leitungscodierung
","Verfahren zur Anpassung des digitalen (meist binären) Signals an die physikalischen Eigenschaften des
 Übertragungsmediums. Ziele sind u.a. Taktrückgewinnung, Gleichspannungsfreiheit und eine günstige
 spektrale Verteilung.
"
"Binärcode
","Ein Code, der nur zwei verschiedene Symbole (üblicherweise 0 und 1) zur Darstellung von Information
 verwendet.
"
"ASCII-Code
","(American Standard Code for Information Interchange) Ein 7-Bit (oder erweitert 8-Bit) Zeichencode zur
 Darstellung von Buchstaben, Zahlen und Sonderzeichen.
"
"Strichcode (Barcode)
","Eine optisch maschinenlesbare Darstellung von Daten durch verschieden breite, parallele Striche und
 Lücken.
"
"QR-Code
","(Quick Response Code) Ein zweidimensionaler Matrixcode, der aus schwarzen und weißen Quadraten
 besteht und eine große Menge an Informationen speichern kann.
"
"what3words
","Ein globales Adresssystem, das die Welt in 3m x 3m Quadrate einteilt und jedem Quadrat eine eindeutige
 Adresse aus drei Wörtern zuweist.
"
"Blockcode
","Ein Code, bei dem alle Codewörter die gleiche Länge haben. Im Kontext der Kanalcodierung: Ein Datenblock
 der Länge k wird auf einen Codeblock der Länge n abgebildet.
"
"Mittlere Codewortlänge (L)
","Die durchschnittliche Länge der Codewörter eines Codes, gewichtet mit den Auftrittswahrscheinlichkeiten
 der entsprechenden Quellensymbole. Formel: L=\\Sigma pil. Es gilt H\\le1
"
"Coderedundanz (R<sub>Code</sub>)
","Die Differenz zwischen der mittleren Codewortlänge L eines Codes und der Entropie H der Quelle. Formel:
 R<sub>Code</sub> =L-H.
"
"Präfix-Code
","Ein Code, bei dem kein Codewort der Anfang (Präfix) eines anderen Codewortes ist. Dies ermöglicht eine
 eindeutige Decodierung ohne spezielle Trennzeichen.
"
"Huffman-Code
","Ein Algorithmus zur Erzeugung eines optimalen Präfix-Codes (minimale mittlere Codewortlänge) für eine
 gegebene Wahrscheinlichkeitsverteilung von Quellensymbolen (verlustfreie Quellencodierung).
"
"Lauflängencodierung (RLE)
","(Run Length Encoding) Ein einfaches verlustfreies Datenkompressionsverfahren, das Folgen identischer
 Zeichen durch die Angabe des Zeichens und der Anzahl seiner Wiederholungen ersetzt.
"
"MP3
","Ein weit verbreitetes verlustbehaftetes Audiokompressionsformat (Quellencodierung), das
 psychoakustische Modelle nutzt, um für den Menschen nicht oder kaum hörbare Anteile zu entfernen.
"
"Coderate (R<sub>C</sub>) (Kanalcodierung)
","Das Verhältnis der Anzahl der Informationsbits k zur Gesamtzahl der Bits n im Codewort
 (R<sub>C</sub> = k/n). Sie ist ein Maß für die dem Code hinzugefügte Redundanz.
"
"Fehlererkennung
","Die Fähigkeit eines Kanalcodes, das Vorhandensein von Übertragungsfehlern in einem empfangenen
 Codewort festzustellen.
"
"Fehlerkorrektur
","Die Fähigkeit eines Kanalcodes, Übertragungsfehler nicht nur zu erkennen, sondern auch zu berichtigen und
 das ursprüngliche Codewort wiederherzustellen.
"
"Hamming-Distanz (d<sub>min</sub>)
","Der kleinste Abstand zwischen allen Paaren von gültigen Codewörtern in einem Code, wobei der Abstand die
 Anzahl der Bitpositionen ist, in denen sich zwei Codewörter unterscheiden (Def. 5.3).
"
"Fehlergewicht (e)
","Die Anzahl der fehlerhaften Bits in einem empfangenen Codewort im Vergleich zum gesendeten Codewort.
"
"Paritätscode
","Ein einfacher Kanalcode zur Fehlererkennung, der jeden Datenblock ein zusätzliches Paritätsbit hinzufugt,
 so dass die Gesamtzahl der '1'-Bits im Codewort entweder gerade (gerade Parität) oder ungerade (ungerade
 Parität) ist. Kann Einfachfehler erkennen.
"
"Hamming-Code
","Typ von fehlerkorrigierendem Blockcode, der eine bestimmte Anzahl von Fehlern erkennen und
 korrigieren kann (z.B. der (7,4)-Hamming-Code kann Einfachfehler korrigieren).
"
"Zyklische Codes (z.B. CRC)
","Klasse von linearen Blockcodes mit der Eigenschaft, dass jede zyklische Verschiebung eines
 Codewortes wieder ein gültiges Codewort des Codes ergibt. Sie werden oft durch Generatorpolynome
 definiert und für die Fehlererkennung verwendet (z.B. CRC - Cyclic Redundancy Check).
"
"Generatorpolynom G(x)
","Polynom, das einen zyklischen Code definiert. Jedes Codewort des zyklischen Codes ist durch das
 Generatorpolynom ohne Rest teilbar.
"
"NRZ (Non Return to Zero)
","Leitungscode, bei dem der Signalpegel für eine binäre '0' und '1' während der gesamten Bitdauer konstant
 bleibt (z.B. '0'= niedriger Pegel, '1' = hoher Pegel).
"
"RZ (Return to Zero)
","Ein Leitungscode, bei dem der Signalpegel (z. B. fur eine '1') nur für einen Teil der Bitdauer auf dem aktiven
 Pegel bleibt und dann auf einen Ruhepegel (Null) zurückkehrt.
"
"Manchestercode
","Ein Leitungscode (Biphase-Code), bei dem jede Bitperiode einen Pegelwechsel in der Mitte aufweist. Der
 Übergang codiert sowohl das Datensignal als auch das Taktsignal. Ist gleichspannungsfrei.
"
"MLT-3 (Multilevel Transmission Encoding)
","Ein ternärer Leitungscode, der drei Spannungspegel verwendet. Bei einer binären '1' wechselt der Pegel
 zyklisch durch die Sequenz (0,+,0,-), bei einer '0' bleibt der Pegel unverändert. Reduziert die benötigte
 Bandbreite.
"
"4B/5B, 8B/10B
","Blockbasierte Leitungscodes, die m Datenbits (z.B. 4 oder 8) auf n Codebits (z.B. 5 oder 10) abbilden. Ziel ist
 es, günstige Übertragungseigenschaften wie eine ausreichende Anzahl von Pegelwechseln (für
 Taktrückgewinnung) und eine annähernde Gleichspannungsfreiheit zu erreichen.
"
"5-PAM (5-Level Pulse Amplitude Modulation)
","Ein Leitungscodierverfahren, das fünf verschiedene Amplitudenstufen verwendet, um mehrere Bits pro
 Symbol zu übertragen (hier 2 Bits pro Symbol, wobei ein Zustand für Fehlerbehandlung genutzt werden
 kann).
"
`;

const KonzepteViewer: React.FC = () => {
    // State to hold the parsed Konzept entries
    const [konzepte, setKonzepte] = React.useState<KonzeptEntry[]>([]);

    // Effect to parse the PDF text content on component mount
    React.useEffect(() => {
        const lines = pdfTextContent.trim().split(/\r?\n/);
        const parsedKonzepte: KonzeptEntry[] = [];

        // Iterating through lines to parse concepts.
        // This logic assumes a pattern where a concept title is on one line,
        // and its description follows on the next, both enclosed in quotes
        // and separated by a comma and newline in the raw text.
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Heuristic to identify a line that might be a concept title.
            // Example pattern: "Begriff","
            if (line.startsWith('"') && line.endsWith('","')) {
                const begriff = line.substring(1, line.length - 3).trim(); // Extract term

                let beschreibung = "Keine separate Beschreibung gefunden."; // Default description

                // Check if the next line could be the description for the current term.
                // Example pattern for description: "Beschreibung."
                if (i + 1 < lines.length) {
                    const nextLine = lines[i+1].trim();
                    if (nextLine.startsWith('"') && nextLine.endsWith('"')) {
                        beschreibung = nextLine.substring(1, nextLine.length - 1).trim(); // Extract description
                        i++; // Increment i to skip the description line in the next iteration
                    } else {
                        // If the next line doesn't fit the description pattern,
                        // it might be another concept or a section header.
                        // The current 'begriff' will use the default 'beschreibung'.
                        // This part can be refined if there are multiple description lines or different patterns.
                    }
                }
                parsedKonzepte.push({ begriff, beschreibung });

            } else if (line.startsWith('"') && line.endsWith('"') && !lines[i-1]?.endsWith('","')) {
                // This handles cases that might be section titles or terms without the specific '","' ending,
                // but are still quoted.
                // For simplicity, these are added as terms with a placeholder description.
                // This avoids them being missed if they don't strictly follow the primary pattern.
                const begriff = line.substring(1, line.length - 1).trim();
                // Avoid adding duplicates if the previous line was a title for this (less likely with current logic but a safeguard)
                if (!parsedKonzepte.find(k => k.beschreibung === begriff && k.begriff === lines[i-1]?.substring(1, lines[i-1].length - 3).trim())) {
                    parsedKonzepte.push({
                        begriff: begriff,
                        beschreibung: "Dies könnte ein Abschnittstitel oder ein Konzept mit anderer Formatierung sein.",
                    });
                }
            }
        }
        setKonzepte(parsedKonzepte);
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // Display a loading message or if no concepts were parsed
    if (konzepte.length === 0) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                    Konzepte der Informationstheorie
                </h1>
                <p className="text-center text-gray-600">Lade Konzepte oder keine Einträge gefunden...</p>
                <p className="text-center text-xs text-gray-500 mt-2">Hinweis: Die Darstellung basiert auf der Textextraktion aus der PDF-Datei.</p>
            </div>
        );
    }

    // Render the table of concepts
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                Konzepte der Informationstheorie
            </h1>
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-1/3">
                            Begriff
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-2/3">
                            Beschreibung
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {konzepte.map((konzept, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors duration-150'}>
                            <td className="px-4 py-3 whitespace-normal align-top">
                                <strong className="font-semibold text-gray-800">{konzept.begriff}</strong>
                            </td>
                            <td className="px-4 py-3 whitespace-normal align-top text-sm text-gray-700 leading-relaxed">
                                {/* Replace escaped less-than/greater-than for HTML display if necessary, e.g. for Redundanz */}
                                {konzept.beschreibung.replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
                Hinweis: Diese Tabelle wurde automatisch aus dem Text der PDF-Datei "Konzepte.pdf" generiert.
                Die Genauigkeit der Zuordnung von Begriff und Beschreibung hängt von der Textstruktur der PDF ab.
            </p>
        </div>
    );
};

export default KonzepteViewer;
