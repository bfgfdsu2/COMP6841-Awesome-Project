import axios from 'axios';
import { decryptMessage, encryptMessage, decryptSessionKey } from './dataClientHandler';
import { handleDmMessageList } from './dmClient';
import { redirecting, prompt } from './utils';

const BASE_URL = 'http://localhost:6841/cryptochat/message';

interface MessageSendRes {
  messageId: number,
};

interface Message {
  messageId: number;
  uId: number;
  nickname: string,
  dmId: number;
  encryptedMessage: string,
  timeSent: number;
  iv: string,
  authTag: string,
}

export interface MessageList {
  messageEncryptedData: Message[],
  sessionKey: string,
  start: number,
  end: number,
}

// ===================================SERVER REQUEST FUNCTION====================================== //

export async function sendMessage(
  token: string,
  uId: number,
  dmId: number,
  encryptedMessage: string,
  iv: string,
  authTag: string
): Promise<MessageSendRes> {
  try {
    const response = await axios.post(
      `${BASE_URL}/send`,
      { uId, dmId, encryptedMessage, iv, authTag },
      {
        headers: {
          token: token, // Pass token as header
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed send message:', error.message);
    throw error;
  }
}

// ===================================MESSAGE CLIENT HANDLER====================================== //

export async function handleMessageSend(token: string,
  uId: number,
  dmId: number,
  encryptedMessage: string,
  iv: string,
  authTag: string
): Promise<void> {
  try {
    await sendMessage(token, uId, dmId, encryptedMessage, iv, authTag);
    console.log('Successfully send message');
  } catch (error: any) {
    console.error('Failed to send message:', error.message);
  }
}

export async function dmChattingListening(token: string, uId: number, dmId: number, priKey: Buffer) {
  while (true) {
    await redirecting();
    const dmMessagesList: any = await handleDmMessageList(token, uId, dmId, 0);
    const encryptedSessionKey = dmMessagesList.sessionKey;
    const decryptedSessionKey = decryptSessionKey(encryptedSessionKey, priKey);

    if (dmMessagesList.messageEncryptedData.length > 0 && dmMessagesList) {
      const messages = dmMessagesList.messageEncryptedData;
      for (let i = messages.length - 1; i >= 0; i--) {
        const encryptedMessageData = messages[i];
        const encryptedData = {
          encryptedMessage: encryptedMessageData.encryptedMessage,
          iv: encryptedMessageData.iv,
          authTag: encryptedMessageData.authTag,
        };
        const decryptedMessage = decryptMessage(encryptedData, decryptedSessionKey);
        console.log(`${encryptedMessageData.nickname}: ${decryptedMessage}`);
      }
    }

    messageSessionCommandMenu();
    const action = await prompt('\nPlease enter your command or message to dm: ');

    if (action.toLowerCase() === '/exit') {
      console.log('\nExiting the dm chat session');
      break;
    } else if (action.toLowerCase() === '/refresh') {
      continue;
    } else {
      const encryptedMessage = encryptMessage(action, decryptedSessionKey);
      await handleMessageSend(token, uId, dmId, encryptedMessage.encryptedMessage, encryptedMessage.iv, encryptedMessage.authTag);
    }
  }
}

function messageSessionCommandMenu() {
  console.log('\nCommand can use during message: ');
  console.log('(/exit): exit the current dm session');
  console.log('(/refresh):  refresh the message listing');
  console.log('Enter normally will be treated as message to send to dm');
}
