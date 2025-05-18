import React from 'react';

const FormulaCollection = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Formelsammlung: Informationstheoretische und physikalische Grundlagen</h1>

            {/* 1. Grundlagen der Informationstheorie */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">1. Grundlagen der Informationstheorie</h2>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">1.1 Wahrscheinlichkeiten und Fundamentalsatz</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono">∑<sub>i=1</sub><sup>n</sup> P(x<sub>i</sub>) = 1</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">1.2 Informationsgehalt und Entscheidungsgehalt</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">H<sub>0</sub> = log<sub>2</sub> m = ld m</p>
                        <p className="font-mono mb-2">P(x<sub>i</sub>) = 1/m</p>
                        <p className="font-mono mb-2">m = 2<sup>H<sub>0</sub></sup></p>
                        <p className="font-mono">log<sub>2</sub> x = log<sub>10</sub> x / log<sub>10</sub> 2 = ln x / ln 2</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">1.3 Mittlerer Informationsgehalt (Entropie) H</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">H = -∑<sub>i=1</sub><sup>n</sup> P(x<sub>i</sub>) · log<sub>2</sub> P(x<sub>i</sub>)</p>
                        <p className="font-mono mb-2">H = log<sub>2</sub> m = H<sub>0</sub> (gleich wahrscheinliche Zustände)</p>
                        <p className="font-mono">H = 0 (sicheres Ereignis)</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">1.4 Redundanz</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">R<sub>Q</sub> = H<sub>0</sub> - H</p>
                        <p className="font-mono">r = R<sub>Q</sub>/H<sub>0</sub> = (H<sub>0</sub> - H)/H<sub>0</sub></p>
                    </div>
                </div>
            </div>

            {/* 2. Informationsübertragung */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">2. Informationsübertragung</h2>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">2.1 Quellen mit unabhängigen Ereignissen</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">P(x<sub>i</sub>, x<sub>j</sub>) = P(x<sub>i</sub>) · P(x<sub>j</sub>)</p>
                        <p className="font-mono">P(x<sub>i</sub>, x<sub>j</sub>, x<sub>k</sub>) = P(x<sub>i</sub>) · P(x<sub>j</sub>) · P(x<sub>k</sub>)</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">2.2 Quellen mit abhängigen Ereignissen (Markow-Quellen)</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">P(x<sub>j</sub>|x<sub>i</sub>) = Wahrscheinlichkeit für x<sub>j</sub> nach Eintreten von x<sub>i</sub></p>
                        <p className="font-mono">P(x<sub>j</sub>) = ∑<sub>i=1</sub><sup>n</sup> P(x<sub>i</sub>) · P(x<sub>j</sub>|x<sub>i</sub>)</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">2.3 Entropien bei Verbundquellen</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">H(X,Y) = H(X) + H(Y) (unabhängige Quellen)</p>
                        <p className="font-mono mb-2">H(X,Y) = H(X) + H(Y|X) = H(Y) + H(X|Y) (abhängige Quellen)</p>
                        <p className="font-mono mb-2">H(Y|X) = -∑<sub>i=1</sub><sup>m</sup> ∑<sub>j=1</sub><sup>n</sup> P(x<sub>i</sub>, y<sub>j</sub>) · log<sub>2</sub> P(y<sub>j</sub>|x<sub>i</sub>)</p>
                        <p className="font-mono mb-2">H(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X) = H(X) + H(Y) - H(X,Y)</p>
                        <p className="font-mono mb-2">H(X|Y) = H(X,Y) - H(Y) (Äquivokation)</p>
                        <p className="font-mono">H(Y|X) = H(X,Y) - H(X) (Irrelevanz)</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">2.4 Symmetrisch gestörter Binärkanal</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">H(X;Y) = 1 + p · ld p + (1-p) · ld(1-p)</p>
                        <p className="font-mono">Optimale Transinformation bei P(x<sub>1</sub>) = P(x<sub>2</sub>) = 0,5</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">2.5 Informationsfluss und Kanalkapazität</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">I = H(X<sub>1</sub>, X<sub>2</sub>, ... X<sub>N</sub>)/T = N·H(X)/(N·t) = H(X)/t = v<sub>s</sub>·H(X)</p>
                        <p className="font-mono">C = I<sub>max</sub> = v<sub>s</sub>·H(X;Y)<sub>max</sub></p>
                    </div>
                </div>
            </div>

            {/* 3. Signale und Signalübertragung */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">3. Signale und Signalübertragung</h2>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">3.1 Rechteckimpuls</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">D = T<sub>I</sub>/T<sub>0</sub> (Tastverhältnis)</p>
                        <p className="font-mono mb-2">f<sub>0</sub> = 1/T<sub>0</sub> (Grundfrequenz)</p>
                        <p className="font-mono">ω<sub>0</sub> = 2π · f<sub>0</sub> (Kreisfrequenz)</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">3.2 Abtasttheorem</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono">f<sub>A</sub> ≥ 2f<sub>G</sub> (Abtastfrequenz mindestens doppelte Grenzfrequenz)</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">3.3 Fourier-Reihe für periodische Signale</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">y(t) = A<sub>0</sub> + ∑<sub>n=1</sub><sup>∞</sup> [A<sub>n</sub> · cos(nω<sub>0</sub>t) + B<sub>n</sub> · sin(nω<sub>0</sub>t)]</p>
                        <p className="font-mono mb-2">A<sub>0</sub> = (1/T<sub>0</sub>) ∫<sub>0</sub><sup>T<sub>0</sub></sup> y(t) dt</p>
                        <p className="font-mono mb-2">A<sub>n</sub> = (2/T<sub>0</sub>) ∫<sub>0</sub><sup>T<sub>0</sub></sup> y(t) · cos(nω<sub>0</sub>t) dt</p>
                        <p className="font-mono">B<sub>n</sub> = (2/T<sub>0</sub>) ∫<sub>0</sub><sup>T<sub>0</sub></sup> y(t) · sin(nω<sub>0</sub>t) dt</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">3.4 Grenzfrequenz</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono">f<sub>G</sub> = 1/T<sub>I</sub> (Grenzfrequenz für Rechteckimpuls)</p>
                    </div>
                </div>
            </div>

            {/* 4. Übertragungskapazität von Kanälen */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">4. Übertragungskapazität von Kanälen</h2>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">4.1 Idealer Kanal ohne Störungen (Gesetz von Hartley)</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">C = 2 · B · log<sub>2</sub> n [bit/s]</p>
                        <p className="font-mono mb-2">B: Bandbreite</p>
                        <p className="font-mono">n: Anzahl unterscheidbarer Amplitudenstufen</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">4.2 Kanal mit Störungen (Shannon-Hartley-Gesetz)</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">C = B · log<sub>2</sub>(1 + P<sub>S</sub>/P<sub>N</sub>) [bit/s]</p>
                        <p className="font-mono mb-2">P<sub>S</sub>: mittlere Signalleistung</p>
                        <p className="font-mono mb-2">P<sub>N</sub>: mittlere Rauschleistung</p>
                        <p className="font-mono">SNR = 10 · log<sub>10</sub>(P<sub>S</sub>/P<sub>N</sub>) [dB]</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">4.3 Übertragung analoger Signale über digitale Kanäle</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">b<sub>Kmax</sub> ≥ f<sub>A</sub> · log<sub>2</sub> n ≥ 2f<sub>Smax</sub> · log<sub>2</sub> n</p>
                        <p className="font-mono">b = Symbolrate · log<sub>2</sub> n</p>
                    </div>
                </div>
            </div>

            {/* 5. Codierung */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">5. Codierung</h2>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">5.1 Quellencodierung</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">L = ∑<sub>i=1</sub><sup>N</sup> p<sub>i</sub> · l<sub>i</sub> (Mittlere Codewortlänge bei variabler Länge)</p>
                        <p className="font-mono mb-2">L ≥ log<sub>2</sub> N (Mittlere Codewortlänge bei Blockcode)</p>
                        <p className="font-mono mb-2">R<sub>Code</sub> = L - H (Coderedundanz)</p>
                        <p className="font-mono">H ≤ L &lt; H + 1 (Shannon-Quellencodierungstheorem)</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">5.2 Kanalcodierung</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">d<sub>min</sub> = kleinster Abstand zwischen zulässigen Codewörtern</p>
                        <p className="font-mono mb-2">d<sub>min</sub> ≥ e + 1 (Fehlererkennbarkeit, e = Fehlergewicht)</p>
                        <p className="font-mono mb-2">d<sub>min</sub> ≥ 2e + 1 (Fehlerkorrigierbarkeit)</p>
                        <p className="font-mono mb-2">R<sub>C</sub> = k/n (Coderate, k = Anzahl Informationsbits, n = Gesamtlänge)</p>
                        <p className="font-mono">2<sup>r</sup> ≥ n + 1 bzw. r ≥ log<sub>2</sub>(n+1) (Anzahl Prüfstellen für Einfachfehlerkorrektur)</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">5.3 Leitungscodierung</h3>
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="font-mono mb-2">b = Symbolrate · log<sub>2</sub> n</p>
                        <p className="font-mono">Symbol- und Übertragungsrate identisch bei n = 2</p>
                    </div>
                </div>
            </div>

            {/* Variablentabelle */}
            <div>
                <h2 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-1 mb-4">Variablen und Bezeichnungen</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                        <tr className="bg-blue-100">
                            <th className="py-2 px-4 border-b border-r border-gray-300 text-left">Symbol</th>
                            <th className="py-2 px-4 border-b border-gray-300 text-left">Bedeutung</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">P(x<sub>i</sub>)</td>
                            <td className="py-2 px-4 border-b border-gray-300">Wahrscheinlichkeit des Ereignisses x<sub>i</sub></td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">P(x<sub>i</sub>, x<sub>j</sub>)</td>
                            <td className="py-2 px-4 border-b border-gray-300">Verbundwahrscheinlichkeit der Ereignisse x<sub>i</sub> und x<sub>j</sub></td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">P(x<sub>j</sub>|x<sub>i</sub>)</td>
                            <td className="py-2 px-4 border-b border-gray-300">Bedingte Wahrscheinlichkeit (Übergangswahrscheinlichkeit)</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">H</td>
                            <td className="py-2 px-4 border-b border-gray-300">Entropie, mittlerer Informationsgehalt</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">H<sub>0</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Entscheidungsgehalt</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">H(X,Y)</td>
                            <td className="py-2 px-4 border-b border-gray-300">Verbundentropie</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">H(X|Y)</td>
                            <td className="py-2 px-4 border-b border-gray-300">Bedingte Entropie, Äquivokation</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">H(Y|X)</td>
                            <td className="py-2 px-4 border-b border-gray-300">Bedingte Entropie, Irrelevanz</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">H(X;Y)</td>
                            <td className="py-2 px-4 border-b border-gray-300">Transinformation</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">R<sub>Q</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Quellenredundanz</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">r</td>
                            <td className="py-2 px-4 border-b border-gray-300">Relative Redundanz</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">I</td>
                            <td className="py-2 px-4 border-b border-gray-300">Informationsfluss</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">C</td>
                            <td className="py-2 px-4 border-b border-gray-300">Kanalkapazität</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">v<sub>s</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Symbolrate (auch Baudrate)</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">T<sub>0</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Periodendauer</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">T<sub>I</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Impulsdauer</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">D</td>
                            <td className="py-2 px-4 border-b border-gray-300">Tastverhältnis</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">f<sub>0</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Grundfrequenz</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">f<sub>G</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Grenzfrequenz</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">f<sub>A</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Abtastfrequenz</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">B</td>
                            <td className="py-2 px-4 border-b border-gray-300">Bandbreite</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">n</td>
                            <td className="py-2 px-4 border-b border-gray-300">Anzahl unterscheidbarer Zustände/Amplitudenstufen</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">P<sub>S</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Signalleistung</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">P<sub>N</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Rauschleistung</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">SNR</td>
                            <td className="py-2 px-4 border-b border-gray-300">Signal-Rausch-Verhältnis</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">L</td>
                            <td className="py-2 px-4 border-b border-gray-300">Mittlere Codewortlänge</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">R<sub>Code</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Coderedundanz</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">d<sub>min</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Hamming-Distanz</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">e</td>
                            <td className="py-2 px-4 border-b border-gray-300">Fehlergewicht</td>
                        </tr>
                        <tr className="hover:bg-gray-100 bg-gray-50">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">R<sub>C</sub></td>
                            <td className="py-2 px-4 border-b border-gray-300">Coderate</td>
                        </tr>
                        <tr className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-r border-gray-300 font-mono">b</td>
                            <td className="py-2 px-4 border-b border-gray-300">Bitrate (Übertragungsrate)</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FormulaCollection;