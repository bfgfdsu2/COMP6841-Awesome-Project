import { getData } from '../dataHandler';
import { Dm, Message, Data } from '../interfaces';
import fs from 'fs';

export function getDmById(dmId: number): Dm | undefined {
  const data = getData();
  return data.dms.find((d) => d.dmId === dmId);
}

export function getnDmMessageFromStorage(dmId: number, messageIds: number[]): Message[] {
  const messages: Message[] = [];

  messageIds.forEach((id) => {
    try {
      const messageData = fs.readFileSync(`dataStoring/dms/${dmId}/${id}.json`, 'utf-8');
      messages.push(JSON.parse(messageData));
    } catch (err: any) {
      console.log(err.message);
      console.log(`Something is wrong with message: ${id} data in dm: ${dmId}!!!!`);
    }
  });

  return messages;
}

export function getUserDmSessionKeyFromStorage(uId: number, dmId: number): string {
  let dmSessionKeyData;

  try {
    const keyJson = fs.readFileSync(`dataStoring/dms/${dmId}/sessionKey.json`, 'utf-8');
    dmSessionKeyData = JSON.parse(keyJson);
  } catch (err: any) {
    console.log(err.message);
    console.log(`Something is wrong with dm: ${dmId} key data!!!!`);
  }

  const dmUserSessionKey = dmSessionKeyData[uId];

  return dmUserSessionKey;
}

export function findDmIfExists(data: Data, uId: number, memberId: number): number | undefined {
  const dm = data.dms.find((dm) => {
    // Check if both the creator and the member are in the DM's member list
    const hasCreator = dm.members.some((member) => member.uId === uId);
    const hasMember = dm.members.some((member) => member.uId === memberId);

    // Return true if both users are found in the members list
    return hasCreator && hasMember;
  });

  // Return the dmId if found, otherwise undefined
  return dm ? dm.dmId : undefined;
}
