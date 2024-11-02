import validator from 'validator';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { Data } from '../interfaces';

export function generateToken(): string {
  const token = Math.floor(Math.random() * 10000000);
  const tokenStr = token.toString();
  return tokenStr;
}

export function hashPassword(password: string, key: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(key + password);
  return hash.digest('hex');
}

export function validateEmail(email: string, data: Data): void {
  // Make sure the input is a valid email
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email');
  }

  for (const user of data.users) {
    if (user.email === email) {
      throw HTTPError(400, 'Email have been used');
    }
  }
}

export function validateName(name: string): void {
  if (name.length < 1 || name.length > 50) {
    throw HTTPError(400, 'invalid name length < 1 or > 50');
  }
}

export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw HTTPError(400, 'invalid password length < 6');
  }

  // Stricter validator later
}

// ========================================================================= //