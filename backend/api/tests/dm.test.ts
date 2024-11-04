import { clear, nukeYourself } from '../dataHandler';
import { EncryptedMessage } from '../interfaces';

import {
  authLoginReq, authRegisterReq,
  authLogoutReq, dmCreateReq,
  messageSendReq, messagesListReq,
} from './testHelper';

afterAll(() => {
  clear();
  nukeYourself();
});

const DM = { dmId: expect.any(Number) };

describe('/cryptochat/dm/create', () => {
  // Create sudo data
  authRegisterReq('h39@gmail.com', '123456', 'John', 'Smith');
  const user = authLoginReq('h39@gmail.com', '123456');

  authRegisterReq('h40@gmail.com', '123456', 'bJohn', 'Smith');
  const user2 = authLoginReq('h40@gmail.com', '123456');

  authRegisterReq('h41@gmail.com', '123456', 'cJohn', 'Smith');
  const user3 = authLoginReq('h41@gmail.com', '123456');

  authRegisterReq('h42@gmail.com', '123456', 'dJohn', 'Smith');
  const user4 = authLoginReq('h42@gmail.com', '123456');

  authRegisterReq('h43@gmail.com', '123456', 'eJohn', 'Smith');
  const user5 = authLoginReq('h45@gmail.com', '123456');
  authLogoutReq(user3.token, user3.uId);

  describe('Error cases', () => {
    test('Invalid token', () => {
      const res = dmCreateReq('invalid token', user.uId, user5.uId);
      expect(res).toStrictEqual(403);
    });

    test('Invalid creator id', () => {
      const res = dmCreateReq(user.token, -1, user5.uId);
      expect(res).toStrictEqual(403);
    });

    test('Invalid meberId', () => {
      const invalidUIds = -500;
      const res = dmCreateReq(user.token, user.uId, invalidUIds);
      expect(res).toStrictEqual(400);
    });

    test('Dm creator creat a dm with himself/herself', () => {
      const res = dmCreateReq(user.token, user.uId, user.uId);
      expect(res).toStrictEqual(400);
    });
  });

  describe('Success cases', () => {
    test('Valid case', () => {
      const res = dmCreateReq(user.token, user.uId, user2.uId);
      expect(res).toStrictEqual(DM);
    });

    test('Multiple dm creations', () => {
      let res = dmCreateReq(user.token, user.uId, user3.uId);
      expect(res).toStrictEqual(DM);
      res = dmCreateReq(user.token, user.uId, user4.uId);
      expect(res).toStrictEqual(DM);
    });

    test('Create a dm again with a person already have a dm with', () => {
      const res = dmCreateReq(user.token, user.uId, user2.uId);
      expect(res).toStrictEqual(DM);
    });
  });
});

describe('cryptochat/dm/messages/', () => {
  authRegisterReq('h46@gmail.com', '123456', 'John', 'Smith');
  const user = authLoginReq('h46@gmail.com', '123456');

  authRegisterReq('h47@gmail.com', '123456', 'bJohn', 'Smith');
  const user2 = authLoginReq('h47@gmail.com', '123456');

  const dm = dmCreateReq(user.token, user.uId, user2.uId);
  const start = 0;

  // This is only dummy message data use for testing puspose only
  const messageTestObject: EncryptedMessage = {
    encryptedMessage: 'This is the 1st message of dm',
    iv: 'some iv later',
    authTag: 'some authTag later',
  };

  test('Invalid token', () => {
    expect(messagesListReq('Invalid Token', user.uId, dm.dmId, start)).toStrictEqual(403);
  });

  test('Invalid uId', () => {
    const invalidUId = -1;
    expect(messagesListReq(user.token, invalidUId, dm.dmId, start)).toStrictEqual(403);
  });

  test('Invalid dmId', () => {
    const invalidDmId = -999;
    const result = messagesListReq(user.token, user.uId, invalidDmId, start);
    expect(result).toStrictEqual(400);
  });

  test('start index is greater than the total number of messages in the dm', () => {
    messageSendReq(user.token, user.uId, dm.dmId, messageTestObject);

    messageTestObject.encryptedMessage = 'test message2';
    messageSendReq(user.token, user.uId, dm.dmId, messageTestObject);

    const res = messagesListReq(user.token, user.uId, dm.dmId, 5);
    expect(res).toEqual(400);
  });

  test('start index < 0', () => {
    const invalidStart = -1;

    const res = messagesListReq(user.token, user.uId, dm.dmId, invalidStart);
    expect(res).toEqual(400);
  });

  // test('Success return and nonMember return', () => {
  //   authRegisterReq(
  //     'nonmember_email@gmail.com',
  //     'password1231',
  //     'Jack',
  //     'Davis'
  //   );

  //   const nonMember = authLoginReq('nonmember_email@gmail.com', 'password1231');
  //   let x = 0;
  //   while (x < 52) {
  //     messageTestObject.encryptedMessage = 'test message' + x;
  //     messageSendReq(user.token, user.uId, dm.dmId, messageTestObject);
  //     ++x;
  //   }

  //   const res = messagesListReq(nonMember.token, nonMember.uId, dm.dmId, start);
  //   const valid10startMessages = messagesListReq(user.token, user.uId, dm.dmId, start);
  //   const next10Message = messagesListReq(user.token, user.uId, dm.dmId, start + 10);
  //   const last2Message = messagesListReq(user.token, user.uId, dm.dmId, start + 50);

  //   expect(res).toEqual(403);
  //   expect(valid10startMessages.messageEncryptedData).toHaveLength(10);
  //   expect(next10Message.messageEncryptedData).toHaveLength(10);
  //   expect(last2Message.end).toStrictEqual(-1);
  // });
});
