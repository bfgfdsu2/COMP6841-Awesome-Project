import { LiveUser } from '../interfaces';

function isLiveUser(obj: any): obj is LiveUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.uId === 'number' &&
    typeof obj.email === 'string' &&
    typeof obj.password === 'string' &&
    (typeof obj.token === 'string' || obj.token === null) &&
    (typeof obj.publicKey === 'string' || obj.publicKey === null)
  );
}

export { isLiveUser };
