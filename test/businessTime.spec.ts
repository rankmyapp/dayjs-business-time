import dayjs from 'dayjs';
import businessTime from '../src';

describe('Business Time', () => {
  beforeAll(() => {
    dayjs.extend(businessTime);

    const holidays = ['2021-01-01', '2021-01-25', '2021-06-03'];

    dayjs.setHolidays(holidays);
  });

  it('should successfully check business time in a business day', () => {
    const date = dayjs('2021-02-11 10:00:00');

    const isBusinessTime = date.isBusinessTime();

    expect(isBusinessTime).toBeDefined();
    expect(isBusinessTime).toBe(true);
  });

  it('should successfully check non business time is a business day', () => {
    const date = dayjs('2021-02-11 05:00:00');

    const isBusinessTime = date.isBusinessTime();

    expect(isBusinessTime).toBeDefined();
    expect(isBusinessTime).toBe(false);
  });

  it('should successfully check business time is a non business day', () => {
    const date = dayjs('2021-01-25 10:00:00');

    const isBusinessTime = date.isBusinessTime();

    expect(isBusinessTime).toBeDefined();
    expect(isBusinessTime).toBe(false);
  });
});
