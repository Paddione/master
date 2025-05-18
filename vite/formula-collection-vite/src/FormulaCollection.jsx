import React, { useState } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const FormulaCollection = () => {
    const [activeCategory, setActiveCategory] = useState('informationstheorie');

    // Configuration for MathJax
    const config = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true
        },
        svg: {
            fontCache: 'global'
        }
    };

    // Formula categories and their formulas
    const formulaCategories = {
        informationstheorie: {
            name: 'Informationstheorie',
            formulas: [
                {
                    name: 'Informationsgehalt (Einzelzeichen)',
                    formula: '$$I(x_i) = \\log_2 \\frac{1}{p(x_i)} = -\\log_2 p(x_i)$$',
                    description: 'Der Informationsgehalt eines Zeichens $x_i$ ist abhängig von seiner Wahrscheinlichkeit $p(x_i)$. Je unwahrscheinlicher ein Zeichen, desto höher sein Informationsgehalt.',
                    unit: 'Bit'
                },
                {
                    name: 'Entropie (Mittlerer Informationsgehalt)',
                    formula: '$$H(X) = -\\sum_{i=1}^{m} p(x_i) \\cdot \\log_2 p(x_i)$$',
                    description: 'Die Entropie beschreibt den mittleren Informationsgehalt einer Quelle mit Zeichenvorrat $X = \\{x_1, x_2, ..., x_m\\}$ und den Wahrscheinlichkeiten $p(x_i)$.',
                    unit: 'Bit/Zeichen'
                },
                {
                    name: 'Maximale Entropie (Entscheidungsgehalt)',
                    formula: '$$H_0 = \\log_2 m$$',
                    description: 'Die maximale Entropie (auch Entscheidungsgehalt) tritt auf, wenn alle $m$ Zeichen gleich wahrscheinlich sind ($p(x_i) = 1/m$).',
                    unit: 'Bit/Zeichen'
                },
                {
                    name: 'Redundanz',
                    formula: '$$R = H_0 - H$$',
                    description: 'Die Differenz zwischen maximal möglicher Entropie $H_0$ und tatsächlicher Entropie $H$.',
                    unit: 'Bit/Zeichen'
                },
                {
                    name: 'Relative Redundanz',
                    formula: '$$r = \\frac{R}{H_0} = 1 - \\frac{H}{H_0}$$',
                    description: 'Die relative Redundanz ist das Verhältnis von Redundanz zur maximalen Entropie.',
                    unit: 'dimensionslos'
                },
                {
                    name: 'Transinformation',
                    formula: '$$I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)$$',
                    description: 'Die beim Empfänger ankommende Information, die tatsächlich von der Quelle stammt.',
                    unit: 'Bit/Zeichen'
                },
                {
                    name: 'Informationsfluss',
                    formula: '$$I = \\nu_s \\cdot H(X)$$',
                    description: 'Der Informationsfluss gibt an, wie viel Information pro Zeiteinheit übertragen wird. $\\nu_s$ ist die Symbolrate (Symbole pro Sekunde).',
                    unit: 'Bit/s'
                },
                {
                    name: 'Shannon-Hartley-Gesetz (Kanalkapazität)',
                    formula: '$$C = B \\cdot \\log_2(1 + \\frac{S}{N})$$',
                    description: 'Die maximale Informationsrate eines gestörten Kanals. $B$ ist die Bandbreite, $S/N$ das Signal-Rausch-Verhältnis.',
                    unit: 'Bit/s'
                }
            ]
        },
        codierung: {
            name: 'Codierung',
            formulas: [
                {
                    name: 'Mittlere Codewortlänge',
                    formula: '$$L = \\sum_{i=1}^{m} p(x_i) \\cdot l_i$$',
                    description: 'Die durchschnittliche Länge der Codewörter eines Codes, gewichtet mit den Wahrscheinlichkeiten der Zeichen. $l_i$ ist die Länge des Codewortes für $x_i$.',
                    unit: 'Zeichen'
                },
                {
                    name: 'Coderedundanz',
                    formula: '$$R_{Code} = L - H$$',
                    description: 'Die Differenz zwischen der mittleren Codewortlänge und der Entropie der Quelle.',
                    unit: 'Bit/Zeichen'
                },
                {
                    name: 'Relative Coderedundanz',
                    formula: '$$r_{Code} = \\frac{L - H}{L}$$',
                    description: 'Das Verhältnis von Coderedundanz zur mittleren Codewortlänge.',
                    unit: 'dimensionslos'
                },
                {
                    name: 'Kraft-Ungleichung',
                    formula: '$$\\sum_{i=1}^{m} D^{-l_i} \\leq 1$$',
                    description: 'Eine notwendige und hinreichende Bedingung für die Existenz eines eindeutig decodierbaren Codes. $D$ ist die Größe des Codealphabets, $l_i$ sind die Codewortlängen.',
                    unit: 'dimensionslos'
                },
                {
                    name: 'Hamming-Distanz',
                    formula: '$$d(x,y) = \\sum_{i=1}^{n} |x_i - y_i|$$',
                    description: 'Die Anzahl der Positionen, an denen sich zwei Codewörter unterscheiden.',
                    unit: 'dimensionslos'
                },
                {
                    name: 'Minimale Hamming-Distanz eines Codes',
                    formula: '$$d_{min} = \\min_{x \\neq y} d(x,y)$$',
                    description: 'Die kleinste Hamming-Distanz zwischen beliebigen zwei verschiedenen Codewörtern eines Codes.',
                    unit: 'dimensionslos'
                },
                {
                    name: 'Fehlererkennungskapazität',
                    formula: '$$t_{detect} = d_{min} - 1$$',
                    description: 'Die maximale Anzahl von Bitfehlern, die ein Code mit minimaler Hamming-Distanz $d_{min}$ garantiert erkennen kann.',
                    unit: 'Fehler'
                },
                {
                    name: 'Fehlerkorrekturkapazität',
                    formula: '$$t_{correct} = \\lfloor \\frac{d_{min} - 1}{2} \\rfloor$$',
                    description: 'Die maximale Anzahl von Bitfehlern, die ein Code mit minimaler Hamming-Distanz $d_{min}$ garantiert korrigieren kann.',
                    unit: 'Fehler'
                }
            ]
        },
        signale: {
            name: 'Signale und Übertragung',
            formulas: [
                {
                    name: 'Nyquist-Shannon-Abtasttheorem',
                    formula: '$$f_s \\geq 2 \\cdot f_{max}$$',
                    description: 'Die Abtastrate $f_s$ muss mindestens doppelt so hoch sein wie die höchste im Signal enthaltene Frequenz $f_{max}$, um das Signal verlustfrei rekonstruieren zu können.',
                    unit: 'Hz'
                },
                {
                    name: 'Nyquist-Grenze (max. Bitrate ohne Intersymbolinterferenz)',
                    formula: '$$R_{max} = 2 \\cdot B \\cdot \\log_2 M$$',
                    description: 'Die maximale Bitrate, die über einen Kanal mit Bandbreite $B$ ohne Intersymbolinterferenz übertragen werden kann. $M$ ist die Anzahl unterscheidbarer Signalzustände.',
                    unit: 'Bit/s'
                },
                {
                    name: 'Signal-Rausch-Verhältnis (SNR)',
                    formula: '$$SNR = \\frac{P_S}{P_N}$$',
                    description: 'Das Verhältnis der Signalleistung $P_S$ zur Rauschleistung $P_N$.',
                    unit: 'dimensionslos, oft in dB: $SNR_{dB} = 10 \\cdot \\log_{10}(SNR)$'
                },
                {
                    name: 'Fourier-Reihe (periodisches Signal)',
                    formula: '$$x(t) = a_0 + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos(n \\omega_0 t) + b_n \\sin(n \\omega_0 t) \\right]$$',
                    description: 'Darstellung eines periodischen Signals als Summe von Sinus- und Kosinusfunktionen. $\\omega_0 = 2\\pi/T$ ist die Grundfrequenz, $T$ die Periodendauer.',
                    unit: 'abhängig vom Signal'
                },
                {
                    name: 'Fourierkoeffizienten',
                    formula: '$$a_0 = \\frac{1}{T} \\int_{0}^{T} x(t) dt, \\quad a_n = \\frac{2}{T} \\int_{0}^{T} x(t) \\cos(n \\omega_0 t) dt, \\quad b_n = \\frac{2}{T} \\int_{0}^{T} x(t) \\sin(n \\omega_0 t) dt$$',
                    description: 'Berechnung der Koeffizienten der Fourier-Reihe für ein periodisches Signal $x(t)$ mit Periode $T$.',
                    unit: 'abhängig vom Signal'
                },
                {
                    name: 'Fourier-Transformation (nicht-periodisches Signal)',
                    formula: '$$X(f) = \\int_{-\\infty}^{\\infty} x(t) \\cdot e^{-j2\\pi ft} dt$$',
                    description: 'Transformation eines zeitkontinuierlichen Signals $x(t)$ in den Frequenzbereich. $X(f)$ ist die komplexe Spektralfunktion.',
                    unit: 'abhängig vom Signal'
                },
                {
                    name: 'Inverse Fourier-Transformation',
                    formula: '$$x(t) = \\int_{-\\infty}^{\\infty} X(f) \\cdot e^{j2\\pi ft} df$$',
                    description: 'Rücktransformation einer Spektralfunktion $X(f)$ in den Zeitbereich.',
                    unit: 'abhängig vom Signal'
                }
            ]
        },
        kanalmodelle: {
            name: 'Kanalmodelle und Fehlerwahrscheinlichkeiten',
            formulas: [
                {
                    name: 'Bitfehlerwahrscheinlichkeit (BER) für BPSK in AWGN',
                    formula: '$$P_b = Q\\left(\\sqrt{\\frac{2E_b}{N_0}}\\right)$$',
                    description: 'Die Wahrscheinlichkeit eines Bitfehlers bei BPSK-Modulation in einem AWGN-Kanal. $E_b$ ist die Energie pro Bit, $N_0$ die Rauschleistungsdichte, $Q$ die Q-Funktion.',
                    unit: 'dimensionslos'
                },
                {
                    name: 'Q-Funktion',
                    formula: '$$Q(x) = \\frac{1}{\\sqrt{2\\pi}} \\int_{x}^{\\infty} e^{-\\frac{t^2}{2}} dt$$',
                    description: 'Die Q-Funktion ist das Integral der Standardnormalverteilung von $x$ bis Unendlich.',
                    unit: 'dimensionslos'
                },
                {
                    name: 'Kapazität des binären symmetrischen Kanals (BSC)',
                    formula: '$$C = 1 - H(p) = 1 + p \\log_2 p + (1-p) \\log_2 (1-p)$$',
                    description: 'Die Kanalkapazität eines BSC mit Übergangswahrscheinlichkeit (Fehlerwahrscheinlichkeit) $p$. $H(p)$ ist die binäre Entropie.',
                    unit: 'Bit/Übertragung'
                },
                {
                    name: 'Kapazität des binären Auslöschungskanals (BEC)',
                    formula: '$$C = 1 - \\epsilon$$',
                    description: 'Die Kanalkapazität eines BEC mit Auslöschungswahrscheinlichkeit $\\epsilon$.',
                    unit: 'Bit/Übertragung'
                },
                {
                    name: 'Binäre Entropie',
                    formula: '$$H(p) = -p \\log_2 p - (1-p) \\log_2 (1-p)$$',
                    description: 'Die Entropie einer binären Quelle mit Wahrscheinlichkeit $p$ für eine 1 und $(1-p)$ für eine 0.',
                    unit: 'Bit'
                },
                {
                    name: 'Übergangswahrscheinlichkeitsmatrix',
                    formula: '$$P = \\begin{pmatrix} P(y_1|x_1) & P(y_2|x_1) & \\cdots & P(y_n|x_1) \\\\ P(y_1|x_2) & P(y_2|x_2) & \\cdots & P(y_n|x_2) \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ P(y_1|x_m) & P(y_2|x_m) & \\cdots & P(y_n|x_m) \\end{pmatrix}$$',
                    description: 'Beschreibt die bedingten Wahrscheinlichkeiten $P(y_j|x_i)$, dass am Ausgang des Kanals $y_j$ empfangen wird, wenn $x_i$ gesendet wurde.',
                    unit: 'dimensionslos'
                }
            ]
        }
    };

    return (
        <MathJaxContext config={config}>
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                    Formelsammlung Informationstechnik
                </h1>

                {/* Category selection */}
                <div className="mb-8">
                    <div className="flex flex-wrap justify-center gap-2">
                        {Object.entries(formulaCategories).map(([key, category]) => (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    activeCategory === key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Formulas for the selected category */}
                <div className="space-y-8">
                    {formulaCategories[activeCategory].formulas.map((formula, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                                <h2 className="text-xl font-semibold text-gray-800">{formula.name}</h2>
                            </div>
                            <div className="p-4">
                                <div className="bg-gray-50 p-4 mb-4 overflow-x-auto">
                                    <MathJax>{formula.formula}</MathJax>
                                </div>
                                <div className="mb-3">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Beschreibung:</h3>
                                    <p className="text-gray-700">
                                        <MathJax>{formula.description}</MathJax>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Einheit:</h3>
                                    <p className="text-gray-700">
                                        <MathJax>{formula.unit}</MathJax>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MathJaxContext>
    );
};

export default FormulaCollection;