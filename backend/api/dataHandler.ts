import fs from 'fs';
import path from 'path';
import { Data } from './interfaces';
import {
  createCipheriv, createDecipheriv,
  publicEncrypt, randomBytes
} from 'crypto';

function encrypt(data: any, key: Buffer) {
  const iv = randomBytes(12); // 12-byte IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  const dataKey = key.toString('hex');

  const userInfo = { encrypted, iv: iv.toString('hex'), authTag, dataKey };

  return userInfo;
};

// Save encrypted user data to JSON file
function saveUser(uId: number, encryptedData: any) {
  const dirPath = path.join(__dirname, '..', 'dataStoring', 'users');
  const filePath = path.join(dirPath, `${uId}.json`);

  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write the encrypted data to the file
  fs.writeFileSync(filePath, JSON.stringify(encryptedData, null, 2));
}

function saveMessage(dmId: number, messageId: number, encryptedData: any) {
  const dirPath = path.join(__dirname, '..', 'dataStoring', 'dms', `${dmId}`);
  const filePath = path.join(dirPath, `${messageId}.json`);

  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write the encrypted data to the file
  fs.writeFileSync(filePath, JSON.stringify(encryptedData, null, 2));
}

function saveNewDm(dmId: number, sessionKey: Record<string, string>) {
  const dirPath = path.join(__dirname, '..', 'dataStoring', 'dms', `${dmId}`);
  const filePath = path.join(dirPath, 'sessionKey.json');

  // Create the directory
  fs.mkdirSync(dirPath, { recursive: true });

  // Write the encrypted data to the file
  fs.writeFileSync(filePath, JSON.stringify(sessionKey, null, 2));
}

function decrypt(encrypted: string, ivHex: string, authTagHex: string, key: Buffer) {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
};

function initializeSession(publicKeys: Record<string, Buffer>) {
  // Generate a session key (256 bits for AES-256-GCM)
  const sessionKey = randomBytes(32);

  // Encrypt the session key for each user with their public key
  const encryptedSessionKeys = Object.entries(publicKeys).reduce((acc, [userId, publicKey]) => {
    const encryptedSessionKey = publicEncrypt(publicKey, sessionKey).toString('hex');
    acc[userId] = encryptedSessionKey;
    return acc;
  }, {} as Record<string, string>);

  return { sessionKey, encryptedSessionKeys };
}

const data: Data = {
  users: [],
  messagesId: [],
  dms: [],
};

function getData(): Data {
  let readData = data;

  try {
    const jsonstr = fs.readFileSync('sysBackup.json');
    readData = JSON.parse(String(jsonstr));
  } catch {
    setData(readData);
  }

  return readData;
}

function setData(newData: Data): void {
  fs.writeFileSync('sysBackup.json', JSON.stringify(newData, null, 2));
}

function clear() {
  const dataTwo: Data = {
    users: [],
    messagesId: [],
    dms: [],
  };
  setData(dataTwo);
}

async function deleteFolder(folderPath: string) {
  try {
    const files = await fs.promises.readdir(folderPath);

    for (const file of files) {
      const currentPath = path.join(folderPath, file);
      const stat = await fs.promises.lstat(currentPath);

      if (stat.isDirectory()) {
        await deleteFolder(currentPath);
      } else {
        await fs.promises.unlink(currentPath);
      }
    }

    await fs.promises.rmdir(folderPath);
    // console.log(`Successfully nuke ${folderPath}`);
  } catch (error) {
    console.error(`Error while deleting ${folderPath}:`, error);
  }
}

async function nukeYourself() {
  const dataFolder = path.join(__dirname, '../dataStoring');
  await deleteFolder(dataFolder);
}

export {
  saveUser, encrypt, decrypt, clear,
  getData, setData, saveNewDm, nukeYourself,
  saveMessage, initializeSession,
};
