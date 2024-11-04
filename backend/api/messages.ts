import HTTPError from 'http-errors';
import { getData, setData, saveMessage } from './dataHandler';
import { getDmById } from './utils/dmHelpers';

import {
  getUserbyId, getUserKeyFromStorage,
  generateHash,
} from './utils/generalHelper';
import {
  LiveUser, Member, Dm,
  Data, Message,
} from './interfaces';

function messageSend(
  token: string,
  uId: number,
  dmId: number,
  encryptedMessage: string,
  iv: string,
  authTag: string
): { messageId: number } {
  const user: LiveUser | undefined = getUserbyId(uId);
  if (!user) {
    throw HTTPError(403, 'Invalid user ID');
  }

  const userKey: Buffer = getUserKeyFromStorage(user.uId);
  const hashedToken = generateHash(token, userKey);

  if (user.token !== hashedToken) {
    throw HTTPError(403, 'Invalid token');
  }

  const dm: Dm | undefined = getDmById(dmId);
  if (!dm) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const member: Member | undefined = dm.members.find((m) => m.uId === user.uId);
  if (!member) {
    throw HTTPError(403, 'Not a member of dm');
  }

  if (!encryptedMessage) {
    throw HTTPError(400, 'Invalid encrypted message data');
  }

  if (!iv) {
    throw HTTPError(400, 'Invalid iv data');
  }

  if (!authTag) {
    throw HTTPError(400, 'Invalid authTag data');
  }

  const data: Data = getData();
  const messageId = data.messagesId.length + 1;

  const newMessage: Message = {
    messageId: messageId,
    uId: user.uId,
    nickname: user.nickName,
    dmId: dm.dmId,
    encryptedMessage: encryptedMessage,
    timeSent: Date.now() / 1000,
    iv: iv,
    authTag: authTag,
  };

  // Save message to an file
  saveMessage(dmId, newMessage.messageId, newMessage);

  // Saving some important info for live data
  data.messagesId.push(messageId);
  data.dms[dmId - 1].messageIds.push(messageId);

  setData(data);

  return { messageId: messageId };
}

export { messageSend };
