import * as dayjs from 'dayjs';
import businessTime from '../src';

describe('Next Business Day', () => {
  beforeAll(() => {
    dayjs.extend(businessTime);

    const holidays = [
      '2021-01-01',
      '2021-01-25',
      '2021-06-03',
    ];

    dayjs.setHolidays(holidays);
  });


  it('should get the next business day from a date', () => {
    const date = dayjs('2021-02-07');
    const expected = dayjs('2021-02-08');

    const nextBusinessDay = date.nextBusinessDay();

    expect(nextBusinessDay).toBeDefined();
    expect(nextBusinessDay).toStrictEqual(expected);
  });

  it('should get the next business day from a day before a weekend', () => {
    // february 19th, 2021 is a friday
    const date = dayjs('2021-02-19');

    // february 22th, 2021 is a monday
    const expected = dayjs('2021-02-22');

    const nextBusinessDay = date.nextBusinessDay();

    expect(nextBusinessDay).toBeDefined();
    expect(nextBusinessDay).toStrictEqual(expected);
  });

  it('should get the next business day from a day before a holiday', () => {
    // june 2nd, 2021 is a wednesday 
    //   before corpus christ holiday
    const date = dayjs('2021-06-02');

    // june 4th, 2021 is a friday
    const expected = dayjs('2021-06-04');

    const nextBusinessDay = date.nextBusinessDay();

    expect(nextBusinessDay).toBeDefined();
    expect(nextBusinessDay).toStrictEqual(expected);
  });

  it('should get the next business day from a day before a long weekend', () => {
    // january 22nd, 2021 is a friday
    //   before São Paulo City anniversary
    const date = dayjs('2021-01-22');

    // january 26th, 2021 is a tuesday
    const expected = dayjs('2021-01-26');

    const nextBusinessDay = date.nextBusinessDay();

    expect(nextBusinessDay).toBeDefined();
    expect(nextBusinessDay).toStrictEqual(expected);
  });
})