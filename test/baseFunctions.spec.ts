import * as dayjs from 'dayjs';
import businessTime from '../src';

describe('Base functions', () => {
  const DEFAULT_WORKING_HOURS = {
    sunday: null,
    monday: [{ start: '09:00:00', end: '17:00:00' }],
    tuesday: [{ start: '09:00:00', end: '17:00:00' }],
    wednesday: [{ start: '09:00:00', end: '17:00:00' }],
    thursday: [{ start: '09:00:00', end: '17:00:00' }],
    friday: [{ start: '09:00:00', end: '17:00:00' }],
    saturday: null,
  }

  beforeAll(() => {
    dayjs.extend(businessTime);
  });

  it('should get holidays', () => {
    const holidays = dayjs.getHolidays();

    expect(holidays).toBeDefined();
    expect(holidays).toHaveLength(0);
  });

  it('should set holidays', () => {
    const holidays = [
      '2021-01-01',
      '2021-01-25',
      '2021-06-03',
    ];

    dayjs.setHolidays(holidays);

    const dayjsHolidays = dayjs.getHolidays();

    expect(dayjsHolidays).toBeDefined();
    expect(dayjsHolidays).toStrictEqual(holidays);
  });

  it('should get working hours', () => {
    const businessHours = dayjs.getBusinessTime();

    expect(businessHours).toBeDefined();
    expect(businessHours).toStrictEqual(DEFAULT_WORKING_HOURS);
  });

  it('should set working hours', () => {
    const businessHours = {...DEFAULT_WORKING_HOURS};

    businessHours[6] = businessHours[5];

    dayjs.setBusinessTime(businessHours);

    const dayjsBusinessHours = dayjs.getBusinessTime();

    expect(dayjsBusinessHours).toBeDefined();
    expect(dayjsBusinessHours).toStrictEqual(businessHours);
  });
})