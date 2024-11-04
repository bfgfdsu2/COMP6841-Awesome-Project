import { Data, User, LiveUser } from './interfaces';
import { setData, getData, encrypt, saveUser } from './dataHandler';
import { isLiveUser } from './utils/interfaceChecker';
import HTTPError from 'http-errors';
import { randomBytes } from 'crypto';

import {
  validateEmail, validateName, validatePassword,
  generateToken, hashPassword, verifyPassword,
} from './utils/authHelpers';

import {
  getUserByEmail, getUserbyId,
  getUserKeyFromStorage,
  generateHash,
} from './utils/generalHelper';

// ========================================================================= //

async function authRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): Promise<{ uId: number }> {
  const data: Data = getData();

  // Valdating all the information
  validateEmail(email, data);
  validateName(nameFirst);
  validateName(nameLast);
  validatePassword(password);

  const id = data.users.length + 1;
  const secretKey = randomBytes(32);
  const nickName: string = nameFirst + ' ' + nameLast;

  const hashedPassword = await hashPassword(password);

  const newUser: User = {
    uId: id,
    email: email,
    password: hashedPassword,
    nameFirst: nameFirst,
    nameLast: nameLast,
    nickName: nickName,
  };

  // Saving as encrypted data
  const encryptedUser = encrypt(newUser, secretKey);
  saveUser(newUser.uId, encryptedUser);

  // Keeping some simple live data for checking efficiency
  const liveUser: LiveUser = {
    uId: newUser.uId,
    email: newUser.email,
    password: hashedPassword,
    token: null,
    nickName: nickName,
    userIdDmWith: [],
    publicKey: 'defaultPublicKey',
  };

  // Update live data
  data.users.push(liveUser);
  setData(data);

  return { uId: id };
}

// ========================================================================= //

async function authLogin(email: string, password: string): Promise<{ token: string; uId: number; }> {
  const user: LiveUser | undefined = getUserByEmail(email);

  if (!user || !isLiveUser(user)) {
    throw HTTPError(400, 'Invalid email');
  }

  const userKey: Buffer = getUserKeyFromStorage(user.uId);

  const hashedPassword = await hashPassword(password);
  console.log(hashedPassword);

  const isCorrectPassword = await verifyPassword(password, user.password);
  if (isCorrectPassword === false) {
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

// async function authLogin(email: string, password: string): Promise<{ token: string; uId: number; }> {
//   try {
//     const user: LiveUser | undefined = getUserByEmail(email);

//     if (!user || !isLiveUser(user)) {
//       throw HTTPError(400, 'Invalid email');
//     }

//     const userKey: Buffer = getUserKeyFromStorage(user.uId);

//     const hashedPassword = await hashPassword(password);

//     if (user.password !== hashedPassword) {
//       throw HTTPError(400, 'Invalid password');
//     }

//     const token = generateToken();
//     const hashedToken = generateHash(token, userKey);
//     const data: Data = getData();
//     const userIndex: number = data.users.findIndex(u => u.email === email);
//     data.users[userIndex].token = hashedToken;
//     setData(data);

//     return { token: token, uId: user.uId };
//   } catch (error) {
//     console.error('Error in authLogin:', error);
//     throw error; // rethrow to handle in the main express error handler
//   }
// }

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

// ========================================================================= //

function authUpdatePubKey(token: string, uId: number, pubKey: string): Record<string, never> {
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
  liveData.users[userIndex].publicKey = pubKey;
  setData(liveData);

  return {};
}

export { authRegister, authLogin, authLogout, authUpdatePubKey };
