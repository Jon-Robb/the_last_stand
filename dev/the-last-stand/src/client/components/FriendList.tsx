//  Nom du fichier : FriendList.tsx
//  Contexte : Un composant React qui affiche la liste des amis de l'utilisateur
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Références : https://chat.openai.com/

import { useContext } from 'react';
import FriendInfoCard from './FriendInfoCard';
import { ColyseusContext } from './ColyseusProvider';

const FriendList = () => {
  const { users } = useContext(ColyseusContext);

  return (
    <div className='flex flex-col gap-1 w-full max-h-[50vh]'>
      <h1>Friend List</h1>
      <div className='overflow-y-scroll scrollbar-custom'>
        {users &&
          users.map(
            (user: any) =>
              user && (
                <FriendInfoCard
                  key={user._id}
                  friend={user}
                />
              )
          )}
      </div>
    </div>
  );
};

export default FriendList;
