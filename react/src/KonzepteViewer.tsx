import React, { useState } from 'react';

// Interface for a single concept entry
interface KonzeptEntry {
    begriff: string; // Concept/Term
    beschreibung: string; // Description
    kategorie?: string; // Optional category
}

// Raw text content extracted from Konzepte.pdf
// In a real app, this would likely be fetched or passed as a prop.
const pdfTextContent = `
"Allgemeine Grundlagen
","Eine mathematische Theorie aus der Wahrscheinlichkeitstheorie und Statistik, die sich mit der
"
"Informationstheorie
","mathematische Definition des Informationsbegriffs sowie den Grundlagen der Informationsübertragung
 und Codierung beschäftigt. Information wird quantitativ und strukturell analysiert (Def. 1.1).
"
// ... rest of your pdfTextContent
`;

const KonzepteViewer: React.FC = () => {
    const [konzepte, setKonzepte] = useState<KonzeptEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Parse the konzept entries from the text content
    React.useEffect(() => {
        // Split the content into chunks that each represent a concept or section header
        const chunks = pdfTextContent.trim().split(/\n"/).filter(Boolean);
        const parsedKonzepte: KonzeptEntry[] = [];
        let currentCategory = "Allgemeine Grundlagen"; // Default category

        chunks.forEach(chunk => {
            // Clean up the chunk
            const cleanChunk = chunk.replace(/\r?\n/g, ' ').trim();

            // Check if this chunk is a section header (no comma after the first quote)
            if (cleanChunk.startsWith('"') && !cleanChunk.includes('","')) {
                // This is a section header, update the current category
                currentCategory = cleanChunk.replace(/"/g, '').trim();
                // We might want to add this as an entry too, to make it visible in the UI
                parsedKonzepte.push({
                    begriff: currentCategory,
                    beschreibung: "",
                    kategorie: "Kategorie"
                });
            }
            // Check if this is a concept (has a term and description)
            else if (cleanChunk.includes('","')) {
                // Get the term and description
                const parts = cleanChunk.split('","');
                if (parts.length >= 2) {
                    const begriff = parts[0].replace(/^"/, '').trim();
                    const beschreibung = parts[1].replace(/"$/, '').trim();

                    // Special handling for incomplete entries (like "Äquivokation H(X" and "Y)")
                    if (begriff === "Aquivokation H(X" && parts[1].trim() === "Y)") {
                        parsedKonzepte.push({
                            begriff: "Äquivokation H(X|Y)",
                            beschreibung: "Die Information, die im Kanal verloren geht. Teil der Transinformationsformel.",
                            kategorie: currentCategory
                        });
                    }
                    // Special handling for "Irrelevanz"
                    else if (begriff === "Irrelevanz H(Y" && parts[1].trim() === "X)") {
                        parsedKonzepte.push({
                            begriff: "Irrelevanz H(Y|X)",
                            beschreibung: "Information, die der Empfänger erhält, die nicht von der Quelle stammt (Störungen). Teil der Transinformationsformel.",
                            kategorie: currentCategory
                        });
                    }
                    // Special handling for "Übergangswahrscheinlichkeit" (empty description)
                    else if (begriff === "Übergangswahrscheinlichkeit P(x_{1})" && beschreibung === "") {
                        parsedKonzepte.push({
                            begriff: "Übergangswahrscheinlichkeit P(xj|xi)",
                            beschreibung: "Die bedingte Wahrscheinlichkeit, dass auf ein Zeichen xi ein Zeichen xj folgt. Wichtig für Quellen mit Gedächtnis.",
                            kategorie: currentCategory
                        });
                    }
                    // Handle cases for split fields in Tastverhältnis and Frequenzspektrum
                    else if (begriff === "Tastverhältnis (D)" && beschreibung.includes("im Frequenzbereich")) {
                        // Split the description at the point where the Frequenzspektrum description starts
                        const parts = beschreibung.split("im Frequenzbereich");

                        // Add the Tastverhältnis with its correct description
                        parsedKonzepte.push({
                            begriff,
                            beschreibung: parts[0].trim(),
                            kategorie: currentCategory
                        });

                        // Add Frequenzspektrum separately with its correct description
                        if (parts[1]) {
                            parsedKonzepte.push({
                                begriff: "Frequenzspektrum",
                                beschreibung: "Die Darstellung eines Signals im Frequenzbereich, " + parts[1].trim(),
                                kategorie: currentCategory
                            });
                        }
                    }
                    // Normal case
                    else if (begriff && beschreibung) {
                        // Fix HTML entities and escape sequences
                        const fixedBeschreibung = beschreibung
                            .replace(/&lt;0xE2>&lt;0x82>&lt;0x98>/g, '′') // Prime symbol
                            .replace(/&lt;0xE2>&lt;0x82>&lt;0x89>/g, '₁') // Subscript 1
                            .replace(/&lt;0xE2>&lt;0x82>&lt;0x86>/g, 'ₘ') // Subscript m
                            .replace(/&lt;0xE2>&lt;0x82>&lt;0xA6>/g, 'ₐ') // Subscript a
                            .replace(/&lt;0xE2>&lt;0x82>&lt;0x99>/g, 'ₙ') // Subscript n
                            .replace(/&lt;0xE2>&lt;0x82>&lt;s>/g, 's') // Symbol s
                            .replace(/&lt;s>/g, 's'); // Symbol s

                        parsedKonzepte.push({
                            begriff,
                            beschreibung: fixedBeschreibung,
                            kategorie: currentCategory
                        });
                    }
                }
            }
        });

        // Update state with the parsed concepts
        setKonzepte(parsedKonzepte);
    }, []); // Empty dependency array means this runs once on component mount

    // Filter concepts based on search term and active category
    const filteredKonzepte = React.useMemo(() => {
        return konzepte.filter(konzept => {
            const matchesSearch = searchTerm === '' ||
                konzept.begriff.toLowerCase().includes(searchTerm.toLowerCase()) ||
                konzept.beschreibung.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = activeCategory === null ||
                konzept.kategorie === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [konzepte, searchTerm, activeCategory]);

    // Get unique categories for the filter dropdown
    const categories = React.useMemo(() => {
        const uniqueCategories = new Set<string>();
        konzepte.forEach(konzept => {
            if (konzept.kategorie && konzept.kategorie !== "Kategorie") {
                uniqueCategories.add(konzept.kategorie);
            }
        });
        return Array.from(uniqueCategories);
    }, [konzepte]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Konzepte und Definitionen</h1>

            {/* Search and filter */}
            <div className="mb-4 flex flex-wrap gap-4">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Begriff oder Beschreibung suchen..."
                        className="w-full p-2 border rounded"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        className="p-2 border rounded"
                        value={activeCategory || ''}
                        onChange={(e) => setActiveCategory(e.target.value || null)}
                    >
                        <option value="">Alle Kategorien</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Display concepts */}
            <div className="space-y-4">
                {filteredKonzepte.map((konzept, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg shadow ${
                            konzept.kategorie === "Kategorie"
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : "bg-white"
                        }`}
                    >
                        <h2 className={`font-bold ${konzept.kategorie === "Kategorie" ? "text-xl text-blue-700" : "text-lg"}`}>
                            {konzept.begriff}
                        </h2>
                        {konzept.beschreibung && (
                            <p className="mt-2">{konzept.beschreibung}</p>
                        )}
                        {konzept.kategorie && konzept.kategorie !== "Kategorie" && (
                            <div className="mt-2">
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                    {konzept.kategorie}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredKonzepte.length === 0 && (
                <div className="text-center p-4">
                    <p>Keine Konzepte gefunden für die aktuelle Filterung.</p>
                </div>
            )}
        </div>
    );
};

export default KonzepteViewer;