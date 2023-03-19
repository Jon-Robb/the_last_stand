import HeroMapCard from './HeroMapCard';
import Arrow from './Arrow';
import { useEffect, useState } from 'react';
import IHeroMapCard from '../../typescript/interfaces/IHeroMapCard';

const cardMenuContainerCSS = 'flex-col justify-center items-center gap-4 space-y-4 transition-all duration-300 ease-in-out transform-gpu';

interface IHeroMapCardMenuProps {
  cardsArray: IHeroMapCard[];
  visibleCards?: number;
  selectedId?: number;
  onCardSelected: (card: IHeroMapCard) => void;
}

const getOddNumber = (number: number) => {
  return number % 2 === 0 ? number + 1 : number;
};

const HeroMapCardMenu: React.FC<IHeroMapCardMenuProps> = ({ cardsArray, selectedId, onCardSelected, visibleCards = 3 }: IHeroMapCardMenuProps) => {
  // make sure the number of visible cards is odd
  visibleCards = getOddNumber(visibleCards);
  // get the index of the center card
  const centerCardIndex = Math.floor(visibleCards / 2);

  // set the selected heroMapCard id to the center card
  const [selectedHeroMapCardId, setSelectedHeroMapCardId] = useState(cardsArray[centerCardIndex].id);
  const [carrouselStartIndex, setCarrouselStartIndex] = useState(0);

  const handleCardClick = (card: IHeroMapCard, index: number) => {
    // update selected heroMapCard id
    setSelectedHeroMapCardId(card.id);
    onCardSelected(card);

    //update carrousel start index when clicking on a card
    if (index !== centerCardIndex) {
      setCarrouselStartIndex((prevIndex) => {
        // get the new index
        const newIndex = prevIndex + (index - centerCardIndex);
        // if the new index is negative, add the length of the array to it else get the modulo
        return newIndex < 0 ? cardsArray.length + newIndex : newIndex % cardsArray.length;
      });
    }
  };

  // go to the previous or next card according to the isPrevious boolean
  const goToCard = (isPrevious: boolean) => {
    setCarrouselStartIndex((prevIndex) => {
      //
      const newIndex = isPrevious ? prevIndex - 1 : prevIndex + 1;
      const updateIndex = newIndex < 0 ? cardsArray.length + newIndex : newIndex % cardsArray.length;
      const selectedHeroMapCardIndex = (updateIndex + centerCardIndex) % cardsArray.length;

      // if the selected heroMapCard index is valid, update the selected heroMapCard id
      if (selectedHeroMapCardIndex >= 0 && selectedHeroMapCardIndex < cardsArray.length) {
        setSelectedHeroMapCardId(cardsArray[selectedHeroMapCardIndex].id);
        // onCardSelected(cardsArray[selectedHeroMapCardIndex]);
      }
      return updateIndex;
    });
  };

  // useEffect to avoid side effects when the component is rendered while the Heros page is rendered as well 
  useEffect(() => {
    const selectedHeroMapCardIndex = (carrouselStartIndex + centerCardIndex) % cardsArray.length;
    onCardSelected(cardsArray[selectedHeroMapCardIndex]);
  }, [carrouselStartIndex, cardsArray, centerCardIndex, onCardSelected]);

  const getVisibleHeroMapCards = (startIndex: number) => {
    // get the wanted visible cards
    let visibleHeroMapCards = [];
    // if the start index is negative, add the length of the array to it
    for (let i = 0; i < visibleCards; i++) {
      const heroMapCardIndex = (startIndex + i) % cardsArray.length;
      const heroMapCard = cardsArray[heroMapCardIndex < 0 ? cardsArray.length + heroMapCardIndex : heroMapCardIndex];
      visibleHeroMapCards.push(heroMapCard);
    }
    return visibleHeroMapCards;
  };

  return (
    <div className={cardMenuContainerCSS}>
      <Arrow
        direction='up'
        onClick={() => goToCard(true)}
      />

      {/* use our function to get the array of wanted visible cards and map throught it to render them*/}
      {getVisibleHeroMapCards(carrouselStartIndex).map((heroMapCard, index) => (
        <HeroMapCard
          key={heroMapCard.id}
          card={{ id: heroMapCard.id, name: heroMapCard.name, image: heroMapCard.image }}
          isSelected={heroMapCard.id === selectedHeroMapCardId}
          onClick={() => handleCardClick(heroMapCard, index)}
        />
      ))}

      <Arrow
        direction='down'
        onClick={() => goToCard(false)}
      />
    </div>
  );
};

export default HeroMapCardMenu;