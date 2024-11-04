import axios from 'axios';
import { prompt } from './utils';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'http://localhost:6841/cryptochat/auth';

interface AuthResponse {
  token: string;
  uId: number;
}

// ===================================SERVER REQUEST FUNCTION====================================== //

export async function registerUser(email: string, password: string, nameFirst: string, nameLast: string): Promise<AuthResponse> {
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      email,
      password,
      nameFirst,
      nameLast,
    });
    return response.data;
  } catch (error: any) {
    console.error('Registration failed:', error.message);
    throw error;
  }
}

export async function loginUser(email: string, password: string, pubKey: string): Promise<AuthResponse> {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email,
      password,
      pubKey,
    });
    return response.data;
  } catch (error: any) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

export async function logoutUser(token: string, uId: number): Promise<AuthResponse> {
  try {
    const response = await axios.post(
      `${BASE_URL}/logout`,
      { uId },
      {
        headers: {
          token: token, // Pass token as header
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Logout failed:', error.message);
    throw error;
  }
}

export async function updateUserPubKey(token: string, uId: number, pubKey: string): Promise<AuthResponse> {
  try {
    const response = await axios.post(
      `${BASE_URL}/updatePubKey`,
      { uId, pubKey },
      {
        headers: {
          token: token, // Pass token as header
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Update public key failed:', error.message);
    throw error;
  }
}

// ===================================AUTH CLIENT HANDLER====================================== //

// Function to check password rank and prompt user if password is too common
async function checkPasswordRanking(password: string): Promise<number | null> {
  const dirPath = path.join(__dirname, '..', 'data');
  const filePath = path.join(dirPath, 'top-10000.txt');
  const passwordList = readFileSync(filePath, 'utf-8').split('\n').map(p => p.trim());

  const rank = passwordList.indexOf(password);
  if (rank !== -1) {
    console.log(`\nYour password is too common! It ranks at #${rank + 1} in common leaked passwords.`);
    return rank + 1;
  }
  return null;
}

export async function handleUserRegistration() {
  const email: any = await prompt('Enter your email: ');

  let password: any;
  let passwordRank: number | null = null;
  do {
    password = await prompt('Enter your password: ', true);
    passwordRank = await checkPasswordRanking(password);
    if (passwordRank !== null) {
      console.log('Please choose a more secure password.\n');
    }
  } while (passwordRank !== null);

  const nameFirst: any = await prompt('Enter your first name: ');
  const nameLast: any = await prompt('Enter your last name: ');

  try {
    const result = await registerUser(email, password, nameFirst, nameLast);
    console.log('User registered successfully:', result);
    return result;
  } catch (error: any) {
    console.error('Error during registration:', error.message);
  }
}

export async function handleUserLogin(): Promise<AuthResponse | null> {
  const email: any = await prompt('Enter your email: ');
  const password: any = await prompt('Enter your password: ', true);
  const pubkey = 'sth';

  try {
    const result = await loginUser(email, password, pubkey);
    console.log('User logged in successfully:', result.uId);
    return result;
  } catch (error: any) {
    console.error('Error during login:', error.message);
    return null;
  }
}

export async function handleUserLogout(token: string, uId: number): Promise<void> {
  try {
    const result = await logoutUser(token, uId);
    console.log('User logged out successfully:', result);
  } catch (error: any) {
    console.error('Error during login:', error.message);
  }
}

export async function handleUpdateUserPubKey(token: string, uId: number, pubKey: string): Promise<void> {
  try {
    await updateUserPubKey(token, uId, pubKey);
    console.log('Update user\'s public key successfully\n');
  } catch (error: any) {
    console.error('Error during login:', error.message);
  }
}
