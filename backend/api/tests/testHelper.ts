import { port, url } from '../config.json';
import request, { HttpVerb } from 'sync-request';
import { EncryptedMessage } from '../interfaces';

const SERVER_URL = `${url}:${port}`;

// ========================================================================= //

// Helper functions were taken from `lab08_quiz` in `quiz.test.ts` (from COMP1531 23T1)

function requestHelper(
  method: HttpVerb,
  path: string,
  payload: object,
  token?: string
) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  let headers = {};
  if (token) {
    headers = { token };
  }
  const res = request(method, SERVER_URL + path, { qs, json, headers });

  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

// ========================================================================= //

// Auth

export function authRegisterReq(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  return requestHelper(
    'POST',
    '/cryptochat/auth/register',
    { email, password, nameFirst, nameLast }
  );
}

export function authLoginReq(
  email: string,
  password: string
) {
  return requestHelper(
    'POST',
    '/cryptochat/auth/login',
    { email, password }
  );
}

export function authLogoutReq(
  token: string,
  uId: number
) {
  return requestHelper(
    'POST',
    '/cryptochat/auth/logout',
    { uId },
    token
  );
}

export function dmCreateReq(
  token: string,
  uId: number,
  memberId: number
) {
  return requestHelper(
    'POST',
    '/cryptochat/dm/create',
    { uId, memberId },
    token
  );
}

export function messageSendReq(
  token: string,
  uId: number,
  dmId: number,
  messageInfo: EncryptedMessage
) {
  return requestHelper(
    'POST',
    '/cryptochat/message/send',
    { uId, dmId, messageInfo },
    token
  );
}

export function messagesListReq(
  token: string,
  uId: number,
  dmId: number,
  start: number
) {
  return requestHelper(
    'GET',
    '/cryptochat/dm/messages/',
    { uId, dmId, start },
    token
  );
}
