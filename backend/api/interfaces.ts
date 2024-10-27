// Storage details
export interface User {
    uId: number,
    email: string,
    password: string,
    nameFirst: string,
    nameLast: string,
    token: string
}

interface Message {
    messageId: number;
    uId: number;
    dmId: number;
    message: string;
    timeSent: number;
}

interface Member {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
}

interface Dm {
    dmId: number;
    dmName: string;
    messages: Message[];
    members: Member[];
}

export interface Data {
    users: User[];
    messagesId: number[];
    dms: Dm[];
}
