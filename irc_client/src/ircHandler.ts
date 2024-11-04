import IRC from 'irc-framework';

export function connectToIRCServer(token: string) {
  const client = new IRC.Client();
  client.connect({ host: 'irc.example.com', port: 6667, nick: 'user' });

  client.on('message', (event: any) => {
    console.log(`${event.nick}: ${event.message}`);
  });

  return client;
}
