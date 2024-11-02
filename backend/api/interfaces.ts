// Storage details
export interface User {
    uId: number,
    email: string,
    password: string,
    nameFirst: string,
    nameLast: string,
    nickName: string,
}

export interface EncryptedMessage {
    encryptedMessage: string,
    iv: string,
    authTag: string,
}

export interface Message {
    messageId: number;
    uId: number;
    dmId: number;
    encryptedMessage: string;
    timeSent: number;
    iv: string,
    authTag: string,
}

export interface MessageList {
    messageEncryptedData: Message[],
    sessionKey: string,
    start: number,
    end: number,
}

export interface Member {
    uId: number;
    nickname: string;
}

export interface Dm {
    dmId: number;
    dmName: string;
    messageIds: number[];
    members: Member[];
}

export interface LiveUser {
    uId: number,
    email: string,
    password: string,
    token: string | null,
    nickName: string,
    userIdDmWith: number[],
    publicKey: string
}

export interface Data {
    users: LiveUser[];
    messagesId: number[];
    dms: Dm[];
}
