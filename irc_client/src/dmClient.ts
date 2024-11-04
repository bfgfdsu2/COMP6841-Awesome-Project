import axios from 'axios';
import { MessageList } from './messageClient';
const BASE_URL = 'http://localhost:6841/cryptochat/dm';

interface DmCreateRes {
    dmId: number,
};

// ===================================SERVER REQUEST FUNCTION====================================== //

export async function dmCreate(token: string, uId: number, memberId: number): Promise<DmCreateRes> {
  try {
    const response = await axios.post(
      `${BASE_URL}/create`,
      { uId, memberId },
      {
        headers: {
          token: token, // Pass token as header
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Registration failed:', error.message);
    throw error;
  }
}

export async function dmMessageList(token: string, uId: number, dmId: number, start: number): Promise<MessageList[]> {
  try {
    const response = await axios.get(`${BASE_URL}/messages`, {
      params: { uId, dmId, start }, // Include query parameters
      headers: {
        token: token, // Pass token as header
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Listing user failed:', error.message);
    throw error;
  }
}

// ===================================DM CLIENT HANDLER====================================== //

export async function handleDmCreate(token: string, uId: number, memberId: number): Promise<DmCreateRes | undefined> {
  try {
    const result = await dmCreate(token, uId, memberId);
    console.log('Create dm successfully:', result);
    return result;
  } catch (error: any) {
    console.error('Error during login:', error.message);
    return undefined;
  }
}

export async function handleDmMessageList(token: string, uId: number, dmId: number, start: number): Promise<MessageList[] | undefined> {
  try {
    const result = await dmMessageList(token, uId, dmId, start);
    console.log(`Fetch messages from dm ${dmId} successfully`);
    return result;
  } catch (error: any) {
    console.error('Error during fetching messages:', error.message);
    return undefined;
  }
}
