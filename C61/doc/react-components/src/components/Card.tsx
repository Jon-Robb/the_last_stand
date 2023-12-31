const cardCSS = 'bg-cover bg-center bg-no-repeat rounded-lg cursor-pointer overflow-hidden shadow-md flex justify-center items-center hover:scale-110 transition-all durantion-500 ease-in-out'
const selectedCardCSS = 'border-2 border-blue-500'
const cardTextCSS = 'text-2xl text-white text-center bg-transparent'
interface Card {
    id: number;
    reference: string;
    image: string;

}
interface ICardProps {
    card: Card;
    isSelected: boolean;
    onClick: () => void;
    width?: number;
    height?: number;
}

const Card = ({ card, isSelected, onClick, width = 400, height = 250 }: ICardProps) => {
    const cardOpacityCSS = isSelected ? '' : 'opacity-30'
    return (
        <div         
            className={`${cardCSS} ${isSelected ? selectedCardCSS : ''} ${cardOpacityCSS}`}
            style=
            {{
                backgroundImage: `url(${card.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width : `${width}px`,
                height : `${height}px`
            }}
            onClick={onClick}
        >
            <div className={cardTextCSS}>
                {card.reference}
            </div>
        </div>
    );
};

export default Card;