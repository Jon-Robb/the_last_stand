//  Nom du fichier : UserInfoCardSwitcher.tsx
//  Contexte : Un composant React qui permet de basculer entre l'affichage des informations de l'utilisateur et l'édition de celles-ci.
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Référence : https://chat.openai.com/

import EditButton from './EditButton';
import ShowUserInfo from './ShowUserInfo';
import EditUserInfo from './EditUserInfo';
import { useState, useContext, useRef } from 'react';
import { ColyseusContext } from './ColyseusProvider';

const UserInfoCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isDoneEditing = useRef(false);

  const { user } = useContext(ColyseusContext);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleToggleEdit = () => {
    isEditing ? (isDoneEditing.current = true) : (isDoneEditing.current = false);
    setIsEditing(!isEditing);
  };

  return (
    user && (
      <div
        className='flex gap-4 w-full justify-evenly rounded-tl-3xl transition ease-in-out duration-300'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <EditButton
          className={`absolute top-2 left-2 w-fit h-fit ${isHovered ? 'opacity-100' : 'opacity-0'} transition duration-1000`}
          onClick={handleToggleEdit}
        />
        <EditUserInfo
          className={`${isEditing ? '' : 'hidden'}`}
          user={user}
          isDoneEditing={isDoneEditing.current}
          inputFunction={handleToggleEdit}
        />
        <ShowUserInfo
          user={user}
          className={`${isEditing ? 'hidden' : ''}`}
        />
      </div>
    )
  );
};

export default UserInfoCard;
