import HTTPError from 'http-errors';
import { getData, setData, saveNewDm, initializeSession } from './dataHandler';

import {
  getDmById, getnDmMessageFromStorage,
  getUserDmSessionKeyFromStorage,
  findDmIfExists,
} from './utils/dmHelpers';

import {
  LiveUser, Member, Dm,
  Data, MessageList, Message
} from './interfaces';

import {
  getUserbyId, getUserKeyFromStorage,
  generateHash,
} from './utils/generalHelper';

function dmCreate(token: string, uId: number, memberId: number): { dmId: number } {
  const dmCreator: LiveUser | undefined = getUserbyId(uId);
  if (!dmCreator) {
    throw HTTPError(403, 'Invalid user ID');
  }

  const userKey: Buffer = getUserKeyFromStorage(dmCreator.uId);
  const hashedToken = generateHash(token, userKey);

  if (dmCreator.token !== hashedToken) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();
  const member: LiveUser | undefined = getUserbyId(memberId);
  if (!member) {
    throw HTTPError(400, 'Invalid member ID');
  }

  if (uId === memberId) {
    throw HTTPError(400, 'Duplicate user IDs');
  }

  if (dmCreator.userIdDmWith.includes(memberId)) {
    const dmId: any = findDmIfExists(data, uId, memberId);
    console.log('Duuplicate creation');

    return { dmId };
  }

  const userPublicKeyList = {
    [dmCreator.uId]: Buffer.from(dmCreator.publicKey),
    [member.uId]: Buffer.from(member.publicKey),
  };

  const sessionKey = initializeSession(userPublicKeyList);

  // Update live user data status
  dmCreator.userIdDmWith.push(memberId);
  dmCreator.userIdDmWith = dmCreator.userIdDmWith.sort();
  data.users[dmCreator.uId - 1] = dmCreator;

  member.userIdDmWith.push(dmCreator.uId);
  member.userIdDmWith = member.userIdDmWith.sort();
  data.users[member.uId - 1] = member;

  // Create dm
  const allMemberUIds: Array<number> = [dmCreator.uId, memberId];
  const allMembersList: Member[] = allMemberUIds
    .map((uId) => {
      const user: LiveUser | undefined = getUserbyId(uId);
      if (user) {
        return {
          uId: user.uId,
          nickname: user.nickName,
        };
      } else {
        throw HTTPError(400, `Something is wrong with user: ${uId} data!!!!`);
      }
    });

  const dmName: string = allMembersList
    .map((member) => member.nickname)
    .join(', ');

  const dmId: number = data.dms.length + 1;
  const dm: Dm = {
    dmId: dmId,
    dmName: dmName,
    messageIds: [],
    members: allMembersList,
  };
  data.dms.push(dm);

  saveNewDm(dm.dmId, sessionKey.encryptedSessionKeys);
  setData(data);

  return { dmId };
}

function messagesList(token: string, uId: number, dmId: number, start: number): MessageList {
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

  const member = dm.members.find((member) => member.uId === user.uId);
  if (!member) {
    throw HTTPError(403, 'User is not a member of the DM');
  }

  const data: Data = getData();
  const dmAllMessageIds: number[] = data.dms[dmId - 1].messageIds;

  if (start > dmAllMessageIds.length || start < 0) {
    throw HTTPError(400, 'Invalid start');
  }

  const dmAllMessages = getnDmMessageFromStorage(dmId, dmAllMessageIds);

  const end = Math.min(start + 10, dmAllMessages.length);
  dmAllMessages.sort((a, b) => b.timeSent - a.timeSent);
  const dmMessagesArray: Message[] = dmAllMessages
    .slice(start, end)
    .map((m) => ({
      messageId: m.messageId,
      uId: m.uId,
      nickname: m.nickname,
      dmId: m.dmId,
      encryptedMessage: m.encryptedMessage,
      timeSent: m.timeSent,
      iv: m.iv,
      authTag: m.authTag,
    }));

  const userSessionKey = getUserDmSessionKeyFromStorage(uId, dmId);

  const dmMessages: MessageList = {
    messageEncryptedData: dmMessagesArray,
    sessionKey: userSessionKey,
    start,
    end: end === dmAllMessages.length ? -1 : end,
  };

  return dmMessages;
}

export { dmCreate, messagesList };
