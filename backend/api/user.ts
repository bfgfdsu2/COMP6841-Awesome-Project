import { Data, UserList, LiveUser } from './interfaces';
import { getData } from './dataHandler';
import HTTPError from 'http-errors';

import {
  getUserbyId,
  getUserKeyFromStorage,
  generateHash,
} from './utils/generalHelper';

function userList(token: string, uId: number): UserList[] {
  const user: LiveUser | undefined = getUserbyId(uId);
  if (!user) {
    throw HTTPError(403, 'Invalid user ID');
  }

  const userKey: Buffer = getUserKeyFromStorage(user.uId);
  const hashedToken = generateHash(token, userKey);

  if (user.token !== hashedToken) {
    throw HTTPError(403, 'Invalid token');
  }

  const data: Data = getData();
  const userList: UserList[] = [];

  data.users.forEach((user) => {
    if (user.uId !== uId) {
      const userData = {
        uId: user.uId,
        nickname: user.nickName
      };

      userList.push(userData);
    }
  });

  return userList;
};

export { userList };
