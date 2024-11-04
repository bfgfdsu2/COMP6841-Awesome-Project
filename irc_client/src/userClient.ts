import axios from 'axios';
import { handleDmCreate } from './dmClient';
import { prompt, redirecting } from './utils';
import { dmChattingListening } from './messageClient';

const BASE_URL = 'http://localhost:6841/cryptochat/user';

interface UserListRes {
    uId: number,
    nickname: string,
};

// ===================================SERVER REQUEST FUNCTION====================================== //

export async function userList(token: string, uId: number): Promise<UserListRes[]> {
  try {
    const response = await axios.get(`${BASE_URL}/list`, {
      params: { uId }, // Include uId as a query parameter
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

// ===================================USER CLIENT HANDLER====================================== //

export async function handleUserList(token: string, uId: number): Promise<UserListRes[]> {
  try {
    const result = await userList(token, uId);
    console.log('Listing user successfully:');
    return result;
  } catch (error: any) {
    console.error('Error during login:', error.message);
    return [];
  }
}

function displayUsersMenu() {
  console.log('\nPlease enter the user name that you wih to chat with from the list above (case sensitive)');
  console.log('exit: to escape this mode');
  console.log('refresh: to refresh the user list');
}

export async function userListListeningMode(token: string, uId: number, priKey: Buffer) {
  while (true) {
    await redirecting();
    const userList: UserListRes[] = await handleUserList(token, uId);

    userList.forEach((user) => {
      console.log(`(${user.nickname})`);
    });

    displayUsersMenu();
    const action = await prompt('Pleas enter command: ');

    if (action.toLowerCase() === 'exit') {
      console.log('\nRedirecting to main page');
      break;
    } else if (action.toLowerCase() === 'refresh') {
      continue;
    } else {
      const member: UserListRes[] = userList.filter((user) => user.nickname === action);
      if (member.length > 0 && member.length < 2) {
        const dm: any = await handleDmCreate(token, uId, member[0].uId);
        await dmChattingListening(token, uId, dm.dmId, priKey);
      } else {
        console.log('Invalid name or command!!!!\n\nPlease try again in 3s');
      }
    }
  }
}
