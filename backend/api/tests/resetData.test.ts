import { clear, nukeYourself } from '../dataHandler';

afterAll(() => {
  clear();
  nukeYourself();
});

test('test using for reset data to its original state', () => {
  expect(1 + 1).toStrictEqual(2);
});
