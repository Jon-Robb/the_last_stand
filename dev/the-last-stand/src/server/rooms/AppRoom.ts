//  Nom du fichier : AppRoom.ts
//  Contexte : Un fichier de type TypeScript qui permet de gérer la communication entre le serveur et le client au niveau de l'application.
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Références : https://chat.openai.com/

import { Room, Client } from 'colyseus';
import { AppState } from './states/AppState';
import { userModel as User } from '../api/models/user';
import { conversationModel as Conversation } from '../api/models/conversation';
import { IMessageMapper } from '../../typescript/interfaces/IMessageMapper';
import { CUserMapper } from '../../typescript/classes/CUserMapper';
import { MongoClient, ChangeStream } from 'mongodb';
import dotenv from 'dotenv';
import { EMessage } from '../../typescript/enumerations/EMessage';
dotenv.config();
const { MONGO_URI } = process.env;

interface IHandleMessageKwargs {
  conversationId: string;
  content: string;
}
export class AppRoom extends Room<AppState> {
  private client: MongoClient;
  private conversationsChangeStream?: ChangeStream;
  private usersChangeStream?: ChangeStream;
  private messagesChangeStream?: ChangeStream;

  constructor() {
    super();
    this.client = new MongoClient(MONGO_URI!);

    const updateFullDocumentWithIdPipeline = [
      {
        $match: {
          operationType: 'update',
        },
      },
      {
        $project: {
          _id: 1,
          fullDocument: 1,
        },
      },
    ];

    const start = async () => {
      await this.client.connect();
      const db = this.client.db('tls');
      const users = db.collection('users');
      this.usersChangeStream = users.watch(updateFullDocumentWithIdPipeline, { fullDocument: 'updateLookup' });

      this.usersChangeStream.on('change', (change: any) => {
        const data = {
          _id: change.fullDocument._id.toString(),
          username: change.fullDocument.username,
          userNo: change.fullDocument.userNo,
          title: change.fullDocument.title,
          lastOnline: change.fullDocument.lastOnline.toString(),
          activeConversationsIds: change.fullDocument.activeConversationsIds,
        };
        this.broadcast(EMessage.UsersChange, data);

        this.state.users.forEach((user: any) => {
          if (user._id === data._id) {
            const userMapper = new CUserMapper();
            userMapper._id = data._id;
            userMapper.username = data.username;
            userMapper.userNo = data.userNo;
            userMapper.title = data.title;
            userMapper.lastOnline = data.lastOnline;
            userMapper.sessionId = user.sessionId;
            this.state.users.set(data._id, userMapper);
          }
        });
      });

      const conversations = db.collection('conversations');
      this.conversationsChangeStream = conversations.watch(updateFullDocumentWithIdPipeline, { fullDocument: 'updateLookup' });
      this.conversationsChangeStream.on('change', (change: any) => {
        const data = {
          _id: change.fullDocument._id,
          messages: change.fullDocument.messages,
        };
        this.broadcast(EMessage.ConversationsChange, data);
      });

      const messages = db.collection('messages');
      this.messagesChangeStream = messages.watch();
      this.messagesChangeStream.on('change', (change) => {
        this.broadcast('messagesChange', change);
      });
    };
    start();
  }

  onCreate(options: any) {
    this.roomId = 'app';
    this.setState(new AppState());
    this.onMessage('message', (client, message) => {
      this.state.users.forEach((user: any) => {
        if (user.sessionId === client.sessionId) {
          if (user.username !== 'guest') {
            this.handleMessage(message, user._id, user.username, user.userNo);
          }
        }
      });
    });
    this.onMessage(EMessage.ToggleConversation, (client, conversationId) => {
      this.state.users.forEach((user: any) => {
        if (user.sessionId === client.sessionId) {
          this.handleToggleConversation(user._id, conversationId);
        }
      });
    });
  }

  // onAuth(client: Client, user: any) {
  //   const { _id } = user;
  //   if (this.state.users.get(_id)) {
  //     return false;
  //   }
  //   return true;
  // }

  async onJoin(client: Client, user: any) {
    const { _id, username, userNo, title, lastOnline } = user;
    const globalChat = await Conversation.findOne({ isGlobal: true });

    if (username !== 'guest') {
      // TODO : Find a clean way to manage this message without polluting global chat.
      //this.handleMessage({ conversationId: globalChat._id, content: `${username}#${userNo} joined the global chat.` }, _id, username, userNo, 'Server');
    }

    const userMapper = new CUserMapper();
    userMapper._id = _id;
    userMapper.username = username;
    userMapper.userNo = userNo;
    userMapper.title = title;
    userMapper.lastOnline = lastOnline;
    userMapper.sessionId = client.sessionId;
    this.state.users.set(_id, userMapper);
  }

  updateLastOnline = async (_id: string) => {
    try {
      await User.findOneAndUpdate({ _id }, { lastOnline: new Date() });
    } catch (error) {
      console.error('Error updating lastOnline date:', error);
    }
  };

  handleMessage = async (message: IHandleMessageKwargs, _id?: string, username?: string, userNo?: string, sender?: string) => {
    const messageMapper = new IMessageMapper();
    if (sender) {
      messageMapper.userId = '0000';
      messageMapper.username = sender;
      messageMapper.userNo = '0000';
    } else {
      messageMapper.userId = _id;
      messageMapper.username = username;
      messageMapper.userNo = userNo;
    }
    messageMapper.content = message.content;
    this.broadcast('message', messageMapper);
    try {
      await Conversation.findOneAndUpdate({ _id: message.conversationId }, { $push: { messages: messageMapper } });
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  handleToggleConversation = async (userId: string, conversationId: string) => {
    try {
      const { activeConversationsIds } = await User.findOne({ _id: userId }, { activeConversationsIds: 1, _id: 0 });

      if (!activeConversationsIds.includes(conversationId)) {
        await User.findOneAndUpdate({ _id: userId }, { $addToSet: { activeConversationsIds: conversationId } });
      } else {
        await User.findOneAndUpdate({ _id: userId }, { $pull: { activeConversationsIds: conversationId } });
      }
    } catch (error) {
      console.error('Error finding conversation:', error);
    }
  };

  async onLeave(client: Client, consented: boolean) {
    const globalChat = await Conversation.findOne({ isGlobal: true });
    this.state.users.forEach((user: any) => {
      if (user.sessionId === client.sessionId) {
        if (user.username !== 'guest') {
          const { _id, username, userNo } = user;
          // TODO : Find a clean way to manage this message without polluting global chat.
          // this.handleMessage({ conversationId: globalChat._id, content: `${username + userNo} left the global chat.` }, _id, username, userNo, 'Server');
          this.updateLastOnline(_id);
        }
        this.state.users.delete(user._id);
      }
    });
  }

  async onDispose() {
    this.state.users.forEach((user: any) => {
      this.updateLastOnline(user._id);
    });
    await this.usersChangeStream?.close();
    await this.messagesChangeStream?.close();
    await this.conversationsChangeStream?.close();
    await this.client.close();
  }
}
