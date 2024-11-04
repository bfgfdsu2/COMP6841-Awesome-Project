import readline from 'readline';

export function prompt(query: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });

    // Override _writeToOutput to suppress characters if hidden
    if (hidden) {
      (rl as any)._writeToOutput = (stringToWrite: string) => {
        (rl as any).output.write('*');
      };
    }
  });
}

export function clearTerminal() {
  console.clear(); // Clear the terminal
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function redirecting() {
  process.stdout.write('\nPlease wait. Redirecting');

  for (let i = 0; i < 3; i++) {
    await sleep(1000);
    process.stdout.write('.'); // Adds a dot without a new line
  }

  process.stdout.write('\n'); // Move to a new line after the loading dots
  clearTerminal();
}

export function sessionCommandMenu() {
  console.log('Please enter one of the following command: ');
  console.log('\n(logout): for logging out of the session');
  console.log('\n(list): listing all the user');
}
