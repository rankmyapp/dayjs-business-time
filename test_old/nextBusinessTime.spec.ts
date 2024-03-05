import dayjs from 'dayjs';
import businessTime from '../src';

describe('Next Business Time', () => {
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

  it('should get the first business time in a business day', () => {
    const date = dayjs('2021-02-01 08:00:00');
    const expected = dayjs('2021-02-01 09:00:00');

    const nextBusinessTime = date.nextBusinessTime();

    expect(nextBusinessTime).toBeDefined();
    expect(nextBusinessTime).toStrictEqual(expected);
  });

  it('should get the same business time in a business day', () => {
    const date = dayjs('2021-02-01 10:00:00');

    const nextBusinessTime = date.nextBusinessTime();

    expect(nextBusinessTime).toBeDefined();
    expect(nextBusinessTime).toStrictEqual(date);
  });

  it('should get the first business time in a day after a holiday', () => {
    const date = dayjs('2021-01-25 15:00:00');
    const expected = dayjs('2021-01-26 09:00:00');

    const nextBusinessTime = date.nextBusinessTime();

    expect(nextBusinessTime).toBeDefined();
    expect(nextBusinessTime).toStrictEqual(expected);
  });

  it('should get the second business time start in a day with 2 working segments', () => {
    const date = dayjs('2021-02-03 12:30:00');
    const expected = dayjs('2021-02-03 13:00:00');

    const nextBusinessTime = date.nextBusinessTime();

    expect(nextBusinessTime).toBeDefined();
    expect(nextBusinessTime).toStrictEqual(expected);
  });

  it('should get the first business time start in a day after a weekend', () => {
    // january 29th, 2021 is a friday
    const date = dayjs('2021-01-29 19:00:00');

    // february 1st, 2021 is a monday
    const expected = dayjs('2021-02-01 09:00:00');

    const nextBusinessTime = date.nextBusinessTime();

    expect(nextBusinessTime).toBeDefined();
    expect(nextBusinessTime).toStrictEqual(expected);
  });

  it('should get the first business time start in a day after a holiday', () => {
    // june 2nd, 2021 is a wednesday
    //   before corpus christ holiday
    const date = dayjs('2021-06-02 22:00:00');

    // june 4th, 2021 is a friday
    const expected = dayjs('2021-06-04 09:00:00');

    const nextBusinessTime = date.nextBusinessTime();

    expect(nextBusinessTime).toBeDefined();
    expect(nextBusinessTime).toStrictEqual(expected);
  });

  it('should get the first business time start in a day after a long weekend', () => {
    // january 22nd, 2021 is a friday
    //   before São Paulo City anniversary
    const date = dayjs('2021-01-22 20:00:00');

    // january 26th, 2021 is a tuesday
    const expected = dayjs('2021-01-26 09:00:00');

    const nextBusinessTime = date.nextBusinessTime();

    expect(nextBusinessTime).toBeDefined();
    expect(nextBusinessTime).toStrictEqual(expected);
  });
});
