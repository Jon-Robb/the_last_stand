//  Nom du fichier : conversations.ts
//  Contexte : Un fichier de type TypeScript qui permet de gérer les routes des conversations
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Références : https://chat.openai.com/, https://www.youtube.com/watch?v=98BzS5Oz5E4

import express from 'express';
import { createGlobalConversation as createGlobalConversation, readConversations, readGlobalConversation, readConversationById, readConversationByUsers as readOrCreateConversationByUsers } from '../controllers/conversations';

const conversationsRouter = express.Router();

conversationsRouter.get('/', readConversations);
conversationsRouter.get('/global', readGlobalConversation);
conversationsRouter.get('/id/:id', readConversationById);
conversationsRouter.post('/userIds/:userIds', readOrCreateConversationByUsers);
conversationsRouter.post('/global', createGlobalConversation);

export default conversationsRouter;
