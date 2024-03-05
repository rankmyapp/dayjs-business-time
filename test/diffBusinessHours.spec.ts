import dayjs from 'dayjs';
import businessTime from '../src';

describe('Add Business Minutes', () => {
  beforeAll(() => {
    // dayjs.extend(businessTime);

    // const holidays = ['2021-01-01', '2021-01-25', '2021-06-03'];

    // dayjs.setHolidays(holidays);

    // Setting wednesday working hours for 2 segments
    //   with 3 and 5 hours respectively
    // console.log(dayjs.getBusinessTime());
    // console.log('-----');
    // const businessHours = dayjs.getBusinessTime();
    // businessHours.wednesday = [
    //   { start: '09:00:00', end: '12:00:00' },
    //   { start: '13:00:00', end: '18:00:00' },
    // ];
    // console.log(dayjs.getBusinessTime());
    dayjs.extend(businessTime);
    businessTime.
  });

  it('should add 15 business minutes on a date', () => {
    dayjs.extend(businessTime);

    const date = dayjs('2021-02-08 09:00:00');
    const expected = dayjs('2021-02-08 09:15:00');

    const newDate = date.addBusinessMinutes(15);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

 
});
