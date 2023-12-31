//  Nom du fichier : ColyseusProvider.tsx
//  Contexte : Un composant React qui créé un contexte global pour les variables partagées entre les composants de l'application
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Référence : https://chat.openai.com/

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { Room, Client } from 'colyseus.js';
import { WS_PROTOCOL, HOST_NAME, HOST_PORT } from '../appConfig';
import { IUser } from '../../typescript/interfaces/IUser';
import { AppState } from '../../server/rooms/states/AppState';
import { patchCurrentUser, getCurrentUser, getUsers } from '../fetches/fetchUsers';
import { IMessageMapper } from '../../typescript/interfaces/IMessageMapper';
import { EMessage } from '../../typescript/enumerations/EMessage';
import IGameOptions from '../../typescript/interfaces/IGameOptions';
import { use } from 'passport';

interface ColyseusContextProps {
  client: Client | null;
  appRoom: Room<AppState> | null;
  user: IUser | null;
  users: IUser[];
  messages: IMessageMapper[];
  userGameOptions: IGameOptions | null;
  setUserGameOptions: (userGameOptions: IGameOptions) => void;
}

export const ColyseusContext = createContext<ColyseusContextProps>({
  client: null,
  appRoom: null,
  user: null,
  users: [],
  messages: [],
  userGameOptions: null,
  setUserGameOptions: () => {},
});

interface ColyseusServerProviderProps {
  children: React.ReactNode;
}

const ColyseusServerProvider = ({ children }: ColyseusServerProviderProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [appRoom, setAppRoom] = useState<Room<AppState> | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [messages, setMessages] = useState<IMessageMapper[]>([]);
  const [userGameOptions, setUserGameOptions] = useState<IGameOptions | null>(null);

  const connect = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const avatarPathOptions = ['/assets/heroes/logan/avatar.png', '/assets/heroes/chuck/avatar.png', '/assets/heroes/solana/avatar.png'];
      const updatedUser = {
        lastOnline: 'now',
        avatar: avatarPathOptions[Math.floor(Math.random() * avatarPathOptions.length)],
      };
      const patchedUser = await patchCurrentUser(updatedUser);
      setUser(patchedUser);
    } else {
      console.log('no user found');
    }
    const currentUsers = await getUsers();
    setUsers(currentUsers);
    const userData = currentUser ?? { username: 'guest', userNo: String(Math.floor(Math.random() * 10000)).padStart(4, '0') };
    const client = new Client(`${WS_PROTOCOL}://${HOST_NAME}:${HOST_PORT}`);
    try {
      const appRoom: Room<AppState> = await client.joinOrCreate('app_room', userData);
      appRoom.onMessage(EMessage.UsersChange, (updatedUser: any) => {
        if (updatedUser._id === userData._id) {
          setUser((prevUser) => {
            return {
              ...prevUser,
              username: updatedUser.username ?? prevUser!.username,
              userNo: updatedUser.userNo ?? prevUser!.userNo,
              title: updatedUser.title ?? prevUser!.title,
              lastOnline: updatedUser.lastOnline ?? prevUser!.lastOnline,
              activeConversationsIds: updatedUser.activeConversationsIds ?? prevUser!.activeConversationsIds,
            };
          });
        }
        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.map((prevUser) => {
            if (prevUser) {
              if (prevUser._id === updatedUser._id) {
                return updatedUser;
              } else {
                return prevUser;
              }
            }
          });
          return updatedUsers;
        });
      });

      appRoom.onMessage('message', (message: IMessageMapper) => {
        setMessages((prev) => [...prev, message]);
      });
      setClient(client);
      setAppRoom(appRoom);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!client && !appRoom && !user) {
        connect();
      }
    }
    fetchData();

    return () => {
      if (appRoom) {
        appRoom.leave();
      }
      async function fetchData() {
        if (user) {
          const updatedUser = {
            lastOnline: new Date(),
          };

          patchCurrentUser(updatedUser);
        }
      }
      fetchData();
    };
  }, []);

  const contextValue = useMemo(() => ({ client, appRoom, user, users, messages, userGameOptions, setUserGameOptions }), [client, appRoom, user, users, messages, userGameOptions, setUserGameOptions]);
  return <ColyseusContext.Provider value={contextValue}>{children}</ColyseusContext.Provider>;
};

export default ColyseusServerProvider;
