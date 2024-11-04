import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { handleUpdateUserPubKey } from './authClient';
import {
  generateKeyPairSync, privateDecrypt, randomBytes,
  createCipheriv, createDecipheriv,
} from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

function generateKeyPair() {
  // Generate an RSA key pair with 2048 bits
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048, // Key size in bits
    publicKeyEncoding: {
      type: 'spki', // Recommended format for public keys
      format: 'pem' // PEM format
    },
    privateKeyEncoding: {
      type: 'pkcs8', // Recommended format for private keys
      format: 'pem', // PEM format
    }
  });

  return { publicKey, privateKey };
}

function saveClientUser(data: any) {
  const dirPath = path.join(__dirname, '..', 'userInfo');
  const filePath = path.join(dirPath, 'info.json');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function initializeSession(token: string, uId: number) {
  const dirPath = path.join(__dirname, '..', 'userInfo');
  const filePath = path.join(dirPath, 'info.json');

  if (!fs.existsSync(filePath)) {
    const keys = generateKeyPair();
    const data = {
      uId: uId,
      token: token,
      pubKey: keys.publicKey,
      priKey: keys.privateKey
    };

    saveClientUser(data);
    handleUpdateUserPubKey(token, uId, data.pubKey);

    const clientData = {
      uId: uId,
      token: token,
      pubKey: Buffer.from(keys.publicKey),
      priKey: Buffer.from(keys.privateKey),
    };

    return clientData;
  } else {
    let clientData;
    try {
      const clientJson = fs.readFileSync(filePath, 'utf-8');
      clientData = JSON.parse(clientJson);
    } catch (err: any) {
      console.log(err.message);
      console.log(`Something is wrong with user: ${uId} data!!!!`);
    }

    if (clientData.uId === uId) {
      const data = {
        uId: clientData.uId,
        token: token,
        pubKey: Buffer.from(clientData.pubKey),
        priKey: Buffer.from(clientData.priKey),
      };

      return data;
    } else {
      console.log('If you login as different user in this device, you will all your past data');
      return undefined;
    }
  }
}

// function to encrypt message
function encryptMessage(data: any, sessionKey: Buffer) {
  const iv = randomBytes(12); // 12-byte IV for AES-GCM
  const cipher = createCipheriv('aes-256-gcm', sessionKey, iv);

  let encryptedMessage = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encryptedMessage += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedMessage: encryptedMessage,
    iv: iv.toString('hex'),
    authTag: authTag,
  };
}

function decryptSessionKey(encryptedSessionKey: string, privateKey: Buffer): Buffer {
  // Decrypt the session key
  const decryptedSessionKey = privateDecrypt(privateKey, Buffer.from(encryptedSessionKey, 'hex'));
  return decryptedSessionKey;
}

//  Decrypt function with private key
function decryptMessage(encryptedData: any, sessionKey: Buffer) {
  // Use the session key to decrypt the message
  const decipher = createDecipheriv('aes-256-gcm', sessionKey, Buffer.from(encryptedData.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decryptedMessage = decipher.update(encryptedData.encryptedMessage, 'hex', 'utf8');
  decryptedMessage += decipher.final('utf8');

  return JSON.parse(decryptedMessage);
}

export {
  saveClientUser, initializeSession,
  decryptMessage, encryptMessage,
  decryptSessionKey,
};
