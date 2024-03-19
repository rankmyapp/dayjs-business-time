import dayjs from 'dayjs';
import businessTime from '../src';

describe('Template Business Time', () => {
  beforeAll(() => {
    dayjs.extend(businessTime);
  });

  // dapatkan exception sekarang
  it('Get exceptions', () => {
    const template = dayjs.getExceptions();
    const expected = {};

    expect(template).toBeDefined();
    expect(template).toStrictEqual(expected);
  });

  it('Always closed with exception', () => {
    // set
    dayjs.setBusinessTime({}); // no working hour
    dayjs.setExceptions({
      '2024-03-19' : [{start: "08:00:00", end: "17:00:00"}],
      '2024-03-20' : [{start: "08:00:00", end: "17:00:00"}],
    });

    const template = dayjs('2024-03-19 12:00:00').isBusinessTime(); // true
    // const template = dayjs('2024-03-19 06:00:00').isBusinessTime(); // false
    const expected = true;

    expect(template).toBeDefined();
    expect(template).toEqual(expected);
  });

});
