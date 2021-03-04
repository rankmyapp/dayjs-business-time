import * as dayjs from 'dayjs';
import businessTime from '../src';

describe('Last Business Day', () => {
  beforeAll(() => {
    dayjs.extend(businessTime);

    const holidays = [
      '2021-01-01',
      '2021-01-25',
      '2021-06-03',
    ];

    dayjs.setHolidays(holidays);
  });


  it('should get the last business day from a date', () => {
    const date = dayjs('2021-02-09');
    const expected = dayjs('2021-02-08');

    const lastBusinessDay = date.lastBusinessDay();

    expect(lastBusinessDay).toBeDefined();
    expect(lastBusinessDay).toStrictEqual(expected);
  });

  it('should get the last business day from a day afer a weekend', () => {
    // february 22th, 2021 is a monday
    const date = dayjs('2021-02-22');

    // february 19th, 2021 is a friday
    const expected = dayjs('2021-02-19');

    const lastBusinessDay = date.lastBusinessDay();

    expect(lastBusinessDay).toBeDefined();
    expect(lastBusinessDay).toStrictEqual(expected);
  });

  it('should get the last business day from a day after a holiday', () => {
    // june 4th, 2021 is a friday
    //   after corpus christ holiday
    const date = dayjs('2021-06-04');

    // june 2nd, 2021 is a wednesday 
    const expected = dayjs('2021-06-02');

    const lastBusinessDay = date.lastBusinessDay();

    expect(lastBusinessDay).toBeDefined();
    expect(lastBusinessDay).toStrictEqual(expected);
  });

  it('should get the last business day from a day after a long weekend', () => {
    // january 26th, 2021 is a tuesday
    //   after São Paulo City anniversary
    const date = dayjs('2021-01-26');

    // january 22nd, 2021 is a friday
    const expected = dayjs('2021-01-22');

    const lastBusinessDay = date.lastBusinessDay();

    expect(lastBusinessDay).toBeDefined();
    expect(lastBusinessDay).toStrictEqual(expected);
  });
})