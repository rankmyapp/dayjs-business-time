import dayjs from 'dayjs';
import businessTime from '../src';

describe('Last Business Time', () => {
  beforeAll(() => {
    dayjs.extend(businessTime);

    const holidays = ['2021-01-01', '2021-01-25', '2021-06-03'];

    dayjs.setHolidays(holidays);

    // Setting wednesday working hours for 2 segments
    //   with 3 and 5 hours respectively
    const businessHours = dayjs.getBusinessTime();
    businessHours.wednesday = [
      { start: '09:00:00', end: '12:00:00' },
      { start: '13:00:00', end: '18:00:00' },
    ];
  });

  it('should get the last business time in a business day', () => {
    const date = dayjs('2021-02-01 23:00:00');
    const expected = dayjs('2021-02-01 17:00:00');

    const lastBusinessTime = date.lastBusinessTime();

    expect(lastBusinessTime).toBeDefined();
    expect(lastBusinessTime).toStrictEqual(expected);
  });

  it('should get the same business time in a business day', () => {
    const date = dayjs('2021-02-01 15:00:00');

    const lastBusinessTime = date.lastBusinessTime();

    expect(lastBusinessTime).toBeDefined();
    expect(lastBusinessTime).toStrictEqual(date);
  });

  it('should get the last business time in a day before a holiday', () => {
    const date = dayjs('2021-06-03 15:00:00');
    const expected = dayjs('2021-06-02 18:00:00');

    const lastBusinessTime = date.lastBusinessTime();

    expect(lastBusinessTime).toBeDefined();
    expect(lastBusinessTime).toStrictEqual(expected);
  });

  it('should get the second business time end in a day with 2 working segments', () => {
    const date = dayjs('2021-02-03 19:00:00');
    const expected = dayjs('2021-02-03 18:00:00');

    const lastBusinessTime = date.lastBusinessTime();

    expect(lastBusinessTime).toBeDefined();
    expect(lastBusinessTime).toStrictEqual(expected);
  });

  it('should get the last business time in a day before a weekend', () => {
    // february 1st, 2021 is a monday
    const date = dayjs('2021-02-01 08:00:00');

    // january 29th, 2021 is a friday
    const expected = dayjs('2021-01-29 17:00:00');

    const lastBusinessTime = date.lastBusinessTime();

    expect(lastBusinessTime).toBeDefined();
    expect(lastBusinessTime).toStrictEqual(expected);
  });

  it('should get the last business time in a day before a long weekend', () => {
    // january 26th, 2021 is a tuesday
    //   after São Paulo City anniversary
    const date = dayjs('2021-01-26 08:00:00');

    // january 22nd, 2021 is a friday
    const expected = dayjs('2021-01-22 17:00:00');

    const lastBusinessTime = date.lastBusinessTime();

    expect(lastBusinessTime).toBeDefined();
    expect(lastBusinessTime).toStrictEqual(expected);
  });
});
