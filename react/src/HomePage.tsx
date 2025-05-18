import React from 'react';

// Interface for the resource structure
interface Resource {
    id: string;
    name: string;
    targetPage: string; // Specifies which page identifier to navigate to
}

// Define your resources here. Adding a new object to this array
// will automatically create a new button on the homepage.
const resources: Resource[] = [
    {
        id: 'formula-collection',
        name: 'Formelsammlung',
        targetPage: 'formulas',
    },
    {
        id: 'iti-study-guide',
        name: 'ITI Study Guide',
        targetPage: 'iti-guide',
    },
    { // Neuer Button für den KonzepteViewer
        id: 'konzepte',
        name: 'Konzepte', // Name des Buttons
        targetPage: 'konzepte', // PageId, die in App.tsx definiert ist
    },
    // Um einen weiteren Button hinzuzufügen, fügen Sie hier ein neues Ressourcenobjekt ein:
    // {
    //   id: 'new-resource',
    //   name: 'Neuer Ressourcenname',
    //   targetPage: 'neue-ressource-page-id',
    // },
];

// Props für HomePage, einschließlich der navigateTo Funktion
interface HomePageProps {
    navigateTo: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
    // Handler, der die navigateTo Prop aufruft
    const handleButtonClick = (targetPage: string) => {
        navigateTo(targetPage);
    };

    return (
        <div className="container mx-auto py-8 px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-10">
                Willkommen zu Ihrer Anwendung
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
                {resources.map((resource) => (
                    <button
                        key={resource.id}
                        // Ruft den aktualisierten Handler mit der targetPage-Kennung auf
                        onClick={() => handleButtonClick(resource.targetPage)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 ease-in-out w-full max-w-xs text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {resource.name}
                    </button>
                ))}
            </div>
            <p className="mt-10 text-sm text-gray-600">
                Um weitere Ressourcen hinzuzufügen, bearbeiten Sie das `resources`-Array in `HomePage.tsx`.
            </p>
        </div>
    );
};

export default HomePage;
