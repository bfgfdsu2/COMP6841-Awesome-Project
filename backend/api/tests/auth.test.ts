import { authRegisterReq, authLoginReq, authLogoutReq } from './testHelper';
import { clear, nukeYourself } from '../dataHandler';

const REGISTERED_USER = { uId: expect.any(Number) };
const LOGGED_IN_USER = { token: expect.any(String), uId: expect.any(Number) };

afterAll(() => {
  clear();
  nukeYourself();
});

describe('/cryptochat/auth/register test cases:', () => {
  describe('Success', () => {
    test('Success Register', () => {
      const data = authRegisterReq('j@gmail.com', '123456', 'John', 'Smith');
      expect(data).toStrictEqual(REGISTERED_USER);
    });
  });

  describe('Error', () => {
    test('Invalid email', () => {
      expect(authRegisterReq('hgmail.com', '123456', 'John', 'Smith')).toEqual(400);
    });

    test('Email is already used', () => {
      expect(authRegisterReq('j@gmail.com', '123456', 'John', 'Smith')).toEqual(400);
    });

    test('Invalid password', () => {
      expect(
        authRegisterReq('j2@gmail.com', '12345', 'John', 'Smith')
      ).toStrictEqual(400);
    });

    test('Invalid name length', () => {
      expect(authRegisterReq('j2@gmail.com', '123456', '', 'Smith')).toStrictEqual(400);
    });
  });
});

describe('/cryptochat/auth/login test cases:', () => {
  describe('Success', () => {
    test('Success Login', () => {
      const data = authLoginReq('j@gmail.com', '123456');
      expect(data).toStrictEqual(LOGGED_IN_USER);
    });
  });

  describe('Error', () => {
    test('Invalid email', () => {
      expect(authLoginReq('hgmail.com', '123456')).toStrictEqual(400);
    });

    test('Unregisterd email', () => {
      expect(authLoginReq('h2@gmail.com', '123456')).toStrictEqual(400);
    });

    test('Invalid password', () => {
      expect(authLoginReq('j@gmail.com', '1234567')).toStrictEqual(400);
    });
  });
});

describe('/cryptochat/auth/logout test cases:', () => {
  authRegisterReq('h3@gmail.com', '123456', 'John3', 'Smith');
  const user = authLoginReq('h3@gmail.com', '123456');

  describe('Error', () => {
    test('Invalid token + Correct id', () => {
      expect(authLogoutReq('-234234', user.uId)).toStrictEqual(403);
    });

    test('Valid token + Incorrect id', () => {
      const invalidId = -1;
      expect(authLogoutReq(user.token, invalidId)).toStrictEqual(403);
    });
  });

  describe('Success', () => {
    test('Success Logout', () => {
      const data = authLogoutReq(user.token, user.uId);
      expect(data).toStrictEqual({});
    });

    test('Logout 1 more time', () => {
      const data = authLogoutReq(user.token, user.uId);
      // clear();
      expect(data).toStrictEqual(403);
    });
  });
});
