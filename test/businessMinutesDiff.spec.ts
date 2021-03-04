import * as dayjs from 'dayjs';
import businessTime from '../src';

describe('Business Minutes Diff', () => {
  beforeAll(() => {
    dayjs.extend(businessTime);

    const holidays = [
      '2021-01-01',
      '2021-01-25',
      '2021-06-03',
    ];

    dayjs.setHolidays(holidays);

    // Setting wednesday working hours for 2 segments
    //   with 3 and 5 hours respectively
    const businessHours = dayjs.getBusinessTime();
    businessHours.wednesday = [{ start: '09:00:00', end: '12:00:00' }, { start: '13:00:00', end: '18:00:00' }];
  });


  it('should get the 30 business minutes diff between 2 times', () => {
    const start = dayjs('2021-02-08 09:00:00');
    const end = dayjs('2021-02-08 09:30:00');

    const diff = start.businessMinutesDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(30);
  });


  it('should get the 90 business minutes diff between 2 times in different days', () => {
    const start = dayjs('2021-02-08 16:45:00');
    const end = dayjs('2021-02-09 10:15:00');

    const diff = start.businessMinutesDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(90);
  });

  it('should get the 65 business minutes diff between 2 times in different segments at same day', () => {
    const start = dayjs('2021-02-10 11:30:00');
    const end = dayjs('2021-02-10 13:35:00');

    const diff = start.businessMinutesDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(65);
  });

  it('should get the 120 business minutes diff between 2 times with a holiday', () => {
    const start = dayjs('2021-06-02 17:00:00');
    const end = dayjs('2021-06-04 10:00:00');

    const diff = start.businessMinutesDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(120);
  });

  it('should get the 150 business minutes diff between 2 times with a weekend', () => {
    const start = dayjs('2021-02-05 16:30:00');
    const end = dayjs('2021-02-08 11:00:00');

    const diff = start.businessMinutesDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(150);
  });

  it('should get the 300 business minutes diff between 2 times with a long weekend', () => {
    const start = dayjs('2021-01-22 14:00:00');
    const end = dayjs('2021-01-26 11:00:00');

    const diff = start.businessMinutesDiff(end);

    expect(diff).toBeDefined();
    expect(diff).toBe(300);
  });
})