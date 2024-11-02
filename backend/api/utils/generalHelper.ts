import { getData } from '../dataHandler';
import fs from 'fs';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { LiveUser } from '../interfaces';

export function generateHash(information: string, key: Buffer) {
  information = information + key;
  const hash = crypto.createHash('sha512').update(information).digest('hex');
  return hash;
}

export function getUserByEmail(email: string): LiveUser | undefined {
  const data = getData();
  return data.users.find((u: LiveUser) => u.email === email);
}

export function getUserByToken(token: string): LiveUser | undefined {
  const data = getData();
  return data.users.find((u: LiveUser) => u.token === token);
}

export function getUserbyId(uId: number): LiveUser | undefined {
  const data = getData();
  return data.users.find((u: LiveUser) => u.uId === uId);
}

export function getUserKeyFromStorage(uId: number): Buffer {
  let userData;

  try {
    const userJson = fs.readFileSync(`dataStoring/users/${uId}.json`, 'utf-8');
    userData = JSON.parse(userJson);
  } catch (err: any) {
    console.log(err.message);
    console.log(`Something is wrong with user: ${uId} data!!!!`);

    throw HTTPError(404, 'Please try again later');
  }

  const userKey = Buffer.from(userData.dataKey, 'hex');

  return userKey;
}
