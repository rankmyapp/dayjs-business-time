import dayjs from 'dayjs';
import businessTime from '../src';

describe('Business Hours Diff', () => {
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

  it('should get the 2 business hours diff between 2 times', () => {
    const start = dayjs('2021-02-08 09:00:00');
    const end = dayjs('2021-02-08 11:00:00');

    const diff = start.businessHoursDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(2);
  });

  it('should get the 8 business hours diff between 2 times in different days', () => {
    const start = dayjs('2021-02-08 16:45:00');
    const end = dayjs('2021-02-09 16:45:00');

    const diff = start.businessHoursDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(8);
  });

  it('should get the 4.5 business hours diff between 2 times in different segments at same day', () => {
    const start = dayjs('2021-02-10 10:30:00');
    const end = dayjs('2021-02-10 16:00:00');

    const diff = start.businessHoursDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(4.5);
  });

  it('should get the 10 business hours diff between 2 times with a holiday', () => {
    const start = dayjs('2021-06-02 10:00:00');
    const end = dayjs('2021-06-04 12:00:00');

    const diff = start.businessHoursDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(10);
  });

  it('should get the 7.5 business hours diff between 2 times with a weekend', () => {
    const start = dayjs('2021-02-05 15:00:00');
    const end = dayjs('2021-02-08 14:30:00');

    const diff = start.businessHoursDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(7.5);
  });

  it('should get the 5 business hours diff between 2 times with a long weekend', () => {
    const start = dayjs('2021-01-22 14:00:00');
    const end = dayjs('2021-01-26 11:00:00');

    const diff = start.businessHoursDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(5);
  });

  it('should get the 0 business hours diff between 2 times in the same day with timezone', () => {
    const start = dayjs('2021-05-17T17:50:23-03:00');
    const end = dayjs('2021-05-17T20:52:28-03:00');

    const diff = start.businessHoursDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(0);
  });

  it('should get the -3.5 business hours diff between 2 times in the same day with timezone', () => {
    const start = dayjs('2021-05-17T15:30:00-03:00');
    const end = dayjs('2021-05-17T12:00:00-03:00');

    const diff = start.businessHoursDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(-3.5);
  });
});
