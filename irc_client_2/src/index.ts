// import { connectToIRCServer } from './ircHandler';
import { prompt, redirecting, sleep, sessionCommandMenu } from './utils';
import { initializeSession } from './dataClientHandler';
import { userListListeningMode } from './userClient';
import {
  handleUserRegistration, handleUserLogin,
  handleUserLogout,
} from './authClient';

async function startIRCClient() {
  console.log('🚀🚀 Welcome to crypto chat 🚀🚀\n');

  while (true) {
    await redirecting();
    const action = await prompt('Do you want to (register), (login), or (exit)? ');

    if (action.toLowerCase() === 'register') {
      await handleUserRegistration();

      console.log('Registered successfully. Please login again.');
      console.log('You will be redirected in 5s');
      await sleep(2000);
    } else if (action.toLowerCase() === 'login') {
      const data: any = await handleUserLogin();
      const token: string = data.token;
      const uId: number = data.uId;

      if (token && uId) {
        const clientData = initializeSession(token, uId);

        if (clientData !== undefined) {
          await serverListeningMode(clientData.token, clientData.uId, clientData.priKey);
        }
      }
    } else if (action.toLowerCase() === 'exit') {
      console.log('Exiting the client. Goodbye!');
      await redirecting();
      break;
    } else {
      console.log('Invalid option!!! Try again in 3s');
    }
  }
}

// Function to enter a listening mode with the IRC server after login
async function serverListeningMode(token: string, uId: number, priKey: Buffer) {
  // const client = connectToIRCServer(token);

  console.log('Connected to the IRC server.');

  while (true) {
    await redirecting();
    sessionCommandMenu();
    const command = await prompt('\nEnter a command: ');

    if (command.toLowerCase() === 'logout') {
      console.log('Logging out...');
      await handleUserLogout(token, uId);

      await sleep(2000); // Waiting 2s before kill the session
      // client.quit(); // Disconnect from the IRC server
      break;
    } else if (command.toLocaleLowerCase() === 'list') {
      await userListListeningMode(token, uId, priKey);
    } else {
      console.log('Unknown command! Type "logout" to disconnect.');
    }
  }
}

startIRCClient();
