import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useImages } from './provider/ImageProvider';

// Datos de las 54 cartas de la Lotería Mexicana
const loteriaCards = [
    { id: 1, name: 'El Gallo', }, { id: 2, name: 'El Diablito' }, { id: 3, name: 'La Dama' },
    { id: 4, name: 'El Catrín' }, { id: 5, name: 'El Paraguas' }, { id: 6, name: 'La Sirena' },
    { id: 7, name: 'La Escalera' }, { id: 8, name: 'La Botella' }, { id: 9, name: 'El Barril' },
    { id: 10, name: 'El Árbol' }, { id: 11, name: 'El Melón' }, { id: 12, name: 'El Valiente' },
    { id: 13, name: 'El Gorrito' }, { id: 14, name: 'La Muerte' }, { id: 15, name: 'La Pera' },
    { id: 16, name: 'La Bandera' }, { id: 17, name: 'El Bandolón' }, { id: 18, name: 'El Violoncello' },
    { id: 19, name: 'La Garza' }, { id: 20, name: 'El Pájaro' }, { id: 21, name: 'La Mano' },
    { id: 22, name: 'La Bota' }, { id: 23, name: 'La Luna' }, { id: 24, name: 'El Cotorro' },
    { id: 25, name: 'El Borracho' }, { id: 26, name: 'El Negrito' }, { id: 27, name: 'El Corazón' },
    { id: 28, name: 'La Sandía' }, { id: 29, name: 'El Tambor' }, { id: 30, name: 'El Camarón' },
    { id: 31, name: 'Las Jaras' }, { id: 32, name: 'El Músico' }, { id: 33, name: 'La Araña' },
    { id: 34, name: 'El Soldado' }, { id: 35, name: 'La Estrella' }, { id: 36, name: 'El Cazo' },
    { id: 37, name: 'El Mundo' }, { id: 38, name: 'El Apache' }, { id: 39, name: 'El Nopal' },
    { id: 40, name: 'El Alacrán' }, { id: 41, 'name': 'La Rosa' }, { id: 42, name: 'La Calavera' },
    { id: 43, name: 'La Campana' }, { id: 44, name: 'El Cantarito' }, { id: 45, name: 'El Venado' },
    { id: 46, name: 'El Sol' }, { id: 47, name: 'La Corona' }, { id: 48, name: 'La Chalupa' },
    { id: 49, name: 'El Pino' }, { id: 50, name: 'El Pescado' }, { id: 51, name: 'La Palma' },
    { id: 52, name: 'La Maceta' }, { id: 53, name: 'El Arpa' }, { id: 54, name: 'La Rana' },
];

// Componente para una sola carta de lotería
const LoteriaCard = ({ card, getImageById }) => {
    return (
        // Contenedor principal de la tarjeta, que asegura que sea cuadrada.
        // Usa `relative` y un `div` interno `absolute inset-0` para manejar el padding y el contenido de forma robusta.
        <div className="relative w-full aspect-square border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden bg-blue-200"> {/* Added bg-blue-200 for debugging */}
            {/* Contenedor interno para el padding y el contenido (SVG) */}
            <div className="absolute inset-0 flex items-center justify-center p-1">
                {/* Placeholder SVG para simular la imagen */}
                {getImageById(1)}
                {/* <svg viewBox="0 0 100 100" className="w-full h-full text-gray-500">
                    <rect x="0" y="0" width="100" height="100" fill="#f0f0f0" rx="8" ry="8" />
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#555" className="font-semibold">
                        {card.id}
                    </text>
                    <text x="50" y="75" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#777" className="font-medium">
                        {card.name}
                    </text>
                </svg> */}
            </div>
        </div>
    );
};

// Componente para un tablero de lotería (4x4)
const LoteriaBoard = React.forwardRef(({ boardData, getImageById }, ref) => {
    // Las dimensiones en 'mm' se aplican solo para la exportación a PDF.
    // Para la visualización en pantalla, usamos clases de Tailwind para responsividad.
    return (
        <div
            ref={ref}
            className="loteria-board grid grid-cols-4 gap-1.5 p-2.5 border-2 border-amber-700 rounded-xl bg-amber-50 shadow-lg
                       w-full max-w-sm aspect-square bg-red-100" // Added bg-red-100 for debugging
        >
            {boardData.map((card, index) => (
                <LoteriaCard key={index} card={card} getImageById={getImageById} />
            ))}
        </div>
    );
});

// Componente principal de la aplicación
function App() {
    const [numBoards, setNumBoards] = useState(1);
    const [layoutOption, setLayoutOption] = useState('one-per-page'); // 'one-per-page' or 'two-per-page'
    const [generatedBoards, setGeneratedBoards] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const boardRefs = useRef([]); // Para referenciar los tableros para html2canvas
    const { getImageById } = useImages();


    // Función para generar un tablero único
    const generateSingleBoard = useCallback((existingBoards) => {
        const MAX_RETRIES = 100; // Número máximo de reintentos para encontrar un tablero único
        let retries = 0;

        while (retries < MAX_RETRIES) {
            // Seleccionar 16 cartas únicas al azar
            const shuffledCards = [...loteriaCards].sort(() => 0.5 - Math.random());
            const newBoardCards = shuffledCards.slice(0, 16);
            const newBoardCardIds = new Set(newBoardCards.map(card => card.id));

            let isUniqueEnough = true;
            for (const existingBoard of existingBoards) {
                const existingBoardCardIds = new Set(existingBoard.map(card => card.id));
                let commonCardsCount = 0;
                for (const cardId of newBoardCardIds) {
                    if (existingBoardCardIds.has(cardId)) {
                        commonCardsCount++;
                    }
                }
                // 50% de coincidencia significa 8 cartas
                if (commonCardsCount > 8) {
                    isUniqueEnough = false;
                    break;
                }
            }

            if (isUniqueEnough) {
                return newBoardCards;
            }
            retries++;
        }
        return null; // No se pudo generar un tablero único después de los reintentos
    }, []);

    // Función para generar múltiples tableros de forma eficiente
    const handleGenerateBoards = async () => {
        setErrorMessage('');
        if (numBoards < 1 || numBoards > 200) {
            setErrorMessage('El número de tableros debe estar entre 1 y 200.');
            return;
        }

        setIsGenerating(true);
        setGeneratedBoards([]);
        boardRefs.current = []; // Resetear las referencias

        const newBoards = [];
        for (let i = 0; i < numBoards; i++) {
            const board = generateSingleBoard(newBoards);
            if (board) {
                newBoards.push(board);
            } else {
                setErrorMessage(`No se pudo generar un tablero único para el tablero #${i + 1} después de varios intentos. Intenta un número menor de tableros o relaja la restricción de unicidad.`);
                break;
            }
            // Pequeña pausa para evitar bloquear la UI
            if (i % 5 === 0) { // Ceder el control cada 5 tableros
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        setGeneratedBoards(newBoards);
        console.log('Tableros generados:', newBoards); // Log para depuración
        setIsGenerating(false);
    };

    // Función para exportar los tableros a PDF
    const handleExportPdf = async () => {
        if (generatedBoards.length === 0) {
            setErrorMessage('Por favor, genera algunos tableros primero.');
            return;
        }

        setIsExporting(true);
        setErrorMessage('');

        const doc = new jsPDF({
            orientation: layoutOption === 'one-per-page' ? 'p' : 'l', // 'p' for portrait, 'l' for landscape
            unit: 'mm',
            format: 'letter' // Tamaño carta (215.9 x 279.4 mm)
        });

        const letterWidth = 215.9; // mm
        const letterHeight = 279.4; // mm

        const boardMargin = 5; // Margen alrededor de cada tablero en mm
        let boardWidth, boardHeight;

        if (layoutOption === 'one-per-page') {
            // Un tablero por página (vertical)
            boardWidth = letterWidth - (boardMargin * 2);
            boardHeight = boardWidth * (260 / 200); // Mantener la proporción de la carta individual para el tablero

            if (boardHeight > (letterHeight - (boardMargin * 2))) {
                boardHeight = letterHeight - (boardMargin * 2);
                boardWidth = boardHeight * (200 / 260);
            }

        } else {
            // Dos tableros por página (horizontal)
            boardWidth = (letterHeight / 2) - (boardMargin * 2);
            boardHeight = boardWidth * (260 / 200); // Mantener la proporción

            if (boardHeight > (letterWidth - (boardMargin * 2))) {
                boardHeight = letterWidth - (boardMargin * 2);
                boardWidth = boardHeight * (200 / 260);
            }
        }

        for (let i = 0; i < generatedBoards.length; i++) {
            const boardElement = boardRefs.current[i];
            if (!boardElement) continue;

            // Ajustar el estilo del tablero para la captura de html2canvas
            const originalStyle = boardElement.style.cssText;
            boardElement.style.width = `${boardWidth}mm`;
            boardElement.style.height = `${boardHeight}mm`;
            boardElement.style.margin = '0'; // Eliminar márgenes para captura precisa

            // Capturar el tablero como imagen
            const canvas = await html2canvas(boardElement, {
                scale: 3, // Mayor escala para mejor calidad
                useCORS: true,
                logging: false,
            });

            // Restaurar el estilo original del tablero
            boardElement.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/png');

            if (layoutOption === 'one-per-page') {
                if (i > 0) doc.addPage();
                doc.addImage(imgData, 'PNG', boardMargin, boardMargin, boardWidth, boardHeight);
            } else {
                // Dos tableros por página
                if (i % 2 === 0) { // Si es el primer tablero de un par, añadir nueva página
                    if (i > 0) doc.addPage();
                    doc.addImage(imgData, 'PNG', boardMargin, boardMargin, boardWidth, boardHeight);
                } else { // Si es el segundo tablero, añadirlo al lado del primero
                    doc.addImage(imgData, 'PNG', letterHeight / 2 + boardMargin, boardMargin, boardWidth, boardHeight);
                }
            }
            // Pequeña pausa para evitar bloquear la UI durante la exportación
            if (i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        doc.save('tableros_loteria.pdf');
        setIsExporting(false);
    };

    // Crear referencias para cada tablero generado
    useEffect(() => {
        boardRefs.current = generatedBoards.map((_, i) => boardRefs.current[i] ?? React.createRef());
    }, [generatedBoards]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 to-yellow-500 p-6 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto bg-white py-10 px-8 rounded-xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-center text-red-700 mb-8">
                    Generador de Tableros de Lotería Mexicana
                </h1>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8 py-8 px-6 bg-red-50 rounded-lg shadow-inner border border-red-200">
                    <div className="flex flex-col items-center">
                        <label htmlFor="numBoards" className="text-lg font-semibold text-red-800 mb-2">
                            Número de Tableros a Generar:
                        </label>
                        <input
                            type="number"
                            id="numBoards"
                            value={numBoards}
                            onChange={(e) => setNumBoards(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                            min="1"
                            max="200"
                            className="w-24 p-2 border-2 border-red-300 rounded-md text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <p className="text-sm text-gray-600 mt-1">(Máximo 200)</p>
                    </div>

                    <div className="flex flex-col items-center md:ml-8">
                        <span className="text-lg font-semibold text-red-800 mb-2">
                            Opciones de Impresión:
                        </span>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <label className="inline-flex items-center text-gray-700">
                                <input
                                    type="radio"
                                    name="layout"
                                    value="one-per-page"
                                    checked={layoutOption === 'one-per-page'}
                                    onChange={() => setLayoutOption('one-per-page')}
                                    className="form-radio h-5 w-5 text-red-600"
                                />
                                <span className="ml-2 text-md">1 Tarjeta por Hoja (Vertical)</span>
                            </label>
                            <label className="inline-flex items-center text-gray-700">
                                <input
                                    type="radio"
                                    name="layout"
                                    value="two-per-page"
                                    checked={layoutOption === 'two-per-page'}
                                    onChange={() => setLayoutOption('two-per-page')}
                                    className="form-radio h-5 w-5 text-red-600"
                                />
                                <span className="ml-2 text-md">2 Tarjetas por Hoja (Horizontal)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={handleGenerateBoards}
                        disabled={isGenerating || isExporting}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Generando...' : 'Generar Tableros'}
                    </button>
                    <button
                        onClick={handleExportPdf}
                        disabled={generatedBoards.length === 0 || isExporting || isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? 'Exportando PDF...' : 'Exportar a PDF'}
                    </button>
                </div>

                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline"> {errorMessage}</span>
                    </div>
                )}

                {(isGenerating || isExporting) && (
                    <div className="text-center text-lg font-semibold text-gray-700 mb-4">
                        {isGenerating ? 'Generando tableros, por favor espera...' : 'Preparando PDF, esto puede tomar un momento...'}
                    </div>
                )}

                {/* Contenedor para los tableros generados, con scroll si hay muchos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center p-4 min-h-[300px] max-h-[600px] overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                    {generatedBoards.length > 0 ? (
                        generatedBoards.map((board, index) => (
                            <LoteriaBoard key={index} boardData={board} getImageById={getImageById} ref={el => (boardRefs.current[index] = el)} />
                        ))
                    ) : (
                        <div className="text-center text-gray-600 p-4 col-span-full flex items-center justify-center">
                            {isGenerating ? (
                                <p>Generando tableros, por favor espera...</p>
                            ) : (
                                <p>Haz clic en "Generar Tableros" para comenzar.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
