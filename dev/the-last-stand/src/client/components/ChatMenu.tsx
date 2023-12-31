//  Nom du fichier : ChatMenu.tsx
//  Contexte : Un composant React qui contient la liste des chatbox actives de l'utilisateur
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Référence : https://chat.openai.com/

import Chatbox from './Chatbox';
import { useContext } from 'react';
import { ColyseusContext } from './ColyseusProvider';

const ChatMenu = () => {
  const { user } = useContext<any>(ColyseusContext);

  return (
    <div className='z-30 flex flex-col relative gap-4 py-8 items-end '>
      {user &&
        user.activeConversationsIds.map((conversationId: any) => (
          <Chatbox
            key={conversationId}
            id={conversationId}
          />
        ))}
    </div>
  );
};

export default ChatMenu;
