import { Data, User, LiveUser } from './interfaces';
import { setData, getData, encrypt, saveUser, generateKeyPair } from './dataHandler';
import { isLiveUser } from './utils/interfaceChecker';
import HTTPError from 'http-errors';
import { randomBytes } from 'crypto';

import {
  generateToken, hashPassword,
  validateEmail, validateName, validatePassword,
} from './utils/authHelpers';

import {
  getUserByEmail, getUserbyId,
  getUserKeyFromStorage,
  generateHash,
} from './utils/generalHelper';

// ========================================================================= //

function authRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): { uId: number } {
  const data: Data = getData();

  // Valdating all the information
  validateEmail(email, data);
  validateName(nameFirst);
  validateName(nameLast);
  validatePassword(password);

  const id = data.users.length + 1;
  const secretKey = randomBytes(32);
  const nickName: string = nameFirst + ' ' + nameLast;

  const newUser: User = {
    uId: id,
    email: email,
    password: hashPassword(password, secretKey),
    nameFirst: nameFirst,
    nameLast: nameLast,
    nickName: nickName,
  };

  // Saving as encrypted data
  const encryptedUser = encrypt(newUser, secretKey);
  saveUser(newUser.uId, encryptedUser);

  const { publicKey } = generateKeyPair();

  // Keeping some simple live data for checking efficiency
  const liveUser: LiveUser = {
    uId: newUser.uId,
    email: newUser.email,
    password: hashPassword(password, secretKey),
    token: null,
    nickName: nickName,
    userIdDmWith: [],
    publicKey: publicKey,
  };

  // Update live data
  data.users.push(liveUser);
  setData(data);

  return { uId: id };
}

// ========================================================================= //

function authLogin(email: string, password: string): { token: string, uId: number } {
  const user: LiveUser | undefined = getUserByEmail(email);

  if (!user || !isLiveUser(user)) {
    throw HTTPError(400, 'Invalid email');
  }

  const userKey: Buffer = getUserKeyFromStorage(user.uId);

  if (user.password !== hashPassword(password, userKey)) {
    throw HTTPError(400, 'Invalid password');
  }

  const token = generateToken();
  const hashedToken = generateHash(token, userKey);
  const data: Data = getData();
  const userIndex: number = data.users.findIndex(u => u.email === email);
  data.users[userIndex].token = hashedToken;
  setData(data);

  return { token: token, uId: user.uId };
}

// ========================================================================= //

function authLogout(token: string, uId: number): Record<string, never> {
  const user: LiveUser | undefined = getUserbyId(uId);

  if (!user || !isLiveUser(user)) {
    throw HTTPError(403, 'Invalid uId section');
  }

  const userKey: Buffer = getUserKeyFromStorage(user.uId);
  const hashedToken = generateHash(token, userKey);

  if (user.token !== hashedToken) {
    throw HTTPError(403, 'Invalid token');
  }

  const liveData: Data = getData();
  const userIndex: number = liveData.users.findIndex(u => u.uId === user.uId);
  liveData.users[userIndex].token = null;
  setData(liveData);

  return {};
}

export { authRegister, authLogin, authLogout };
