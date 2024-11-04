import { messageSendReq, dmCreateReq, authRegisterReq, authLoginReq } from './testHelper';
import { EncryptedMessage } from '../interfaces';
import { nukeYourself, clear } from '../dataHandler';

afterAll(() => {
  clear();
  nukeYourself();
});

const MESSAGEID = { messageId: expect.any(Number) };

authRegisterReq('h20@gmail.com', '123456', 'John', 'Smith');
const user = authLoginReq('h20@gmail.com', '123456');

authRegisterReq('h51@gmail.com', '123456', 'John', 'Smith');
const user2 = authLoginReq('h51@gmail.com', '123456');

authRegisterReq('h57@gmail.com', '1234567', 'Scot', 'Lang');
const user3 = authLoginReq('h57@gmail.com', '1234567');

const dm = dmCreateReq(user2.token, user2.uId, user.uId);

// This is only dummy message data use for testing puspose only
const messageTestObject: EncryptedMessage = {
  encryptedMessage: 'This is the 1st message of dm',
  iv: 'some iv later',
  authTag: 'some authTag later',
};

describe('/cryptochat/message/send', () => {
  test('Success send a message into dm', () => {
    const data = messageSendReq(user.token, user.uId, dm.dmId, messageTestObject);
    expect(data).toStrictEqual(MESSAGEID);
  });

  test('Invalid token', () => {
    const data = messageSendReq('Invalid Token', user.uId, dm.dmId, messageTestObject);
    expect(data).toStrictEqual(403);
  });

  test('Invalid uId', () => {
    const invalidUId = -1;
    const data = messageSendReq(user.token, invalidUId, dm.dmId, messageTestObject);
    expect(data).toStrictEqual(403);
  });

  test('Invalid dmId', () => {
    const invalidDmId = -1;
    const data = messageSendReq(user.token, user.uId, invalidDmId, messageTestObject);
    expect(data).toStrictEqual(400);
  });

  test('Not a member of Dm', () => {
    const data = messageSendReq(user3.token, user3.uId, dm.dmId, messageTestObject);
    expect(data).toStrictEqual(403);
  });
});
