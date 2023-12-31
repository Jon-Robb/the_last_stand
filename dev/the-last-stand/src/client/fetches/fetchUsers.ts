//  Nom du fichier : fetchUsers.ts
//  Contexte : Un fichier TypeScript qui permet d'envoyer une requête au serveur pour récupérer ou modifier l'utilisateur courant
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Référence : https://chat.openai.com/, https://www.youtube.com/watch?v=98BzS5Oz5E4

import { APP_MODE, HOST_URL, HOST_PORT } from '../appConfig';

import avatar from '../assets/heroes/chuck/avatar.png';

export const getCurrentUser = async () => {
  const response = await fetch(`${HOST_URL}:${HOST_PORT}/users/current`, {
    credentials: 'include',
  });
  let data = await response.json();

  if (response.ok) {
    return data;
  } else {
    return null;
  }
};

export const getUsers = async () => {
  const response = await fetch(`${HOST_URL}:${HOST_PORT}/users`, {
    credentials: 'include',
  });
  let data = await response.json();

  if (response.ok) {
    return data;
  } else {
    return null;
  }
};

export const patchCurrentUser = async (input: any) => {
  try {
    const response = await fetch(`${HOST_URL}:${HOST_PORT}/users/current`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      let output = await response.json();
      return output;
    } else {
      throw new Error(`Failed to patch current user: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to patch current user: ${error.message}`);
  }
};
