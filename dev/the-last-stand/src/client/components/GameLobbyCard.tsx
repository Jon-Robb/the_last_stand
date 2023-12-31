//  Nom du fichier : GameLobbyCard.tsx
//  Contexte : Composant fonctionnel React servant à créer des cartes de personnages ou de scenes
//  Nom de l'auteur : Jonathan Robinson
//  Autres étudiants : Andrzej Wisniowski
//  Références : https://chat.openai.com/ - https://react.dev/


const gl_characterCardStyle = 'relative min-w-[50px] min-h-[50px] max-w-[200px] max-h-[200px] w-full h-full bg-cover bg-center bg-no-repeat rounded-lg shadow-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-xl';
const gl_characterCardTextContainerStyle = 'absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent rounded-b-lg';
const gl_characterCardTextStyle = 'text-2xl font-bold text-center text-white';

export type gl_GridCardData = {
    id: number,
    name: string,
    image: string,
    description?: string,
}

interface IGameLobbyCharacterCardProps {
    character: gl_GridCardData,
    onSelect: (character: gl_GridCardData) => void,
    isSelected: boolean,
}


const GameLobbyCharacterCard: React.FC<IGameLobbyCharacterCardProps> = ({ character, onSelect, isSelected }) => {
    const { name, image } = character;
    const selectedBordertyle = isSelected ? 'border-4 border-green-500 scale-110' : '';

    return (
        <div
            className={`${gl_characterCardStyle} ${selectedBordertyle}`}
            style={{ backgroundImage: `url(${image})` }}
            onClick={() => onSelect(character)}
        >
            <div className={gl_characterCardTextContainerStyle}>
                <p className={gl_characterCardTextStyle}>{name}</p>
            </div>
        </div>

    );
};

export default GameLobbyCharacterCard;