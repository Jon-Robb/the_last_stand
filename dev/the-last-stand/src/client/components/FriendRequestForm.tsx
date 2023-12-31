//  Nom du fichier : FriendRequestForm.tsx
//  Contexte : Un composant React qui permet d'envoyer une demande d'ami à un autre joueur.
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Référence : https://chat.openai.com/, https://www.youtube.com/watch?v=GGo3MVBFr1A, https://blog.logrocket.com/usestate-vs-useref/

import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import UpcomingOverlay from './UpcomingOverlay';

const FriendRequestForm = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const [userNo, setUserNo] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    //TODO : Implement friend request
    console.log(`Request sent to ${usernameRef.current?.value}${userNo}`);
  };

  const handleChange = (e: any) => {
    const { value } = e.target;

    setUserNo(value === '#' ? '' : value.length === 1 ? '#' + value : value.length === 6 ? userNo : value);
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    isOpen && usernameRef.current?.focus();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {}, []);

  return (
    <div>
      <h4
        className={`hover:cursor-pointer`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleOpen}>
        Friend Request <span className={`${isHovered ? 'opacity-100' : 'opacity-0'} transition `}>{isOpen ? '▲' : '▼'}</span>
      </h4>
      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-2 relative'>
          <UpcomingOverlay />
          <p className='text-sm'>Enter the username and number of the player you want to invite.</p>
          <div>
            <input
              className='w-1/2 placeholder-pink-900 placeholder-opacity-50 text-pink-900'
              ref={usernameRef}
              type='text'
              placeholder='Username'
            />
            <input
              type='text'
              value={userNo}
              placeholder='#0000'
              onChange={handleChange}
              className='w-1/2 placeholder-pink-900 placeholder-opacity-50 text-pink-900'
            />
          </div>
          <p className='text-xs'>(psst! It's cAsE sEnSiTiVe!)</p>
          <Button text='Send friend request' />
        </form>
      )}
    </div>
  );
};

export default FriendRequestForm;
