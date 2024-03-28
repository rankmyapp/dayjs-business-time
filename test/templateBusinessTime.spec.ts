import dayjs from 'dayjs';
import businessTime from '../src';

describe('Template Business Time', () => {
  beforeAll(() => {
    dayjs.extend(businessTime);
  });

  // dapatkan working hours sekarang
  it('Get template businessTime', () => {
    const template = dayjs.getBusinessTime();
    const expected = {
      monday: [{ start: '09:00:00', end: '17:00:00' }],
      tuesday: [{ start: '09:00:00', end: '17:00:00' }],
      wednesday: [{ start: '09:00:00', end: '17:00:00' }],
      thursday: [{ start: '09:00:00', end: '17:00:00' }],
      friday: [{ start: '09:00:00', end: '17:00:00' }],
      saturday: null,
      sunday: null,
    };
    expect(template).toBeDefined();
    expect(template).toStrictEqual(expected);
  });

  // set working hour ke tidak ada jam kerja
  it('Always closed.', () => {
    // set
    dayjs.setBusinessTime({}); // no working hour

    const template = dayjs.getBusinessTime();
    const expected = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    };
    expect(template).toBeDefined();
    expect(template).toStrictEqual(expected);
  });

  // set working hour ke jam kerja 24/7
  it('Always open.', () => {
    //  set
    dayjs.setBusinessTime({
      monday: [
        { start: '09:00:00', end: '17:00:00' },
        { start: '00:00:00', end: '09:00:00' },
        { start: '16:00:00', end: '24:00:00' },
      ],
      tuesday: [
        { start: '00:00:00', end: '12:00:00' },
        { start: '12:00:00', end: '24:00:00' },
      ],
      wednesday: [
        { start: '00:00:00', end: '12:00:00' },
        { start: '12:00:00', end: '24:00:00' },
      ],
      thursday: [
        { start: '00:00:00', end: '12:00:00' },
        { start: '12:00:00', end: '24:00:00' },
      ],
      friday: [
        { start: '00:00:00', end: '12:00:00' },
        { start: '12:00:00', end: '24:00:00' },
      ],
      saturday: [
        { start: '00:00:00', end: '18:00:00' },
        { start: '16:00:00', end: '24:00:00' },
      ],
      sunday: [
        { start: '00:00:00', end: '18:00:00' },
        { start: '16:00:00', end: '24:00:00' },
      ],
    });

    const template = dayjs.getBusinessTime();
    const expected = {
      monday: [{ start: '00:00:00', end: '24:00:00' }],
      tuesday: [{ start: '00:00:00', end: '24:00:00' }],
      wednesday: [{ start: '00:00:00', end: '24:00:00' }],
      thursday: [{ start: '00:00:00', end: '24:00:00' }],
      friday: [{ start: '00:00:00', end: '24:00:00' }],
      saturday: [{ start: '00:00:00', end: '24:00:00' }],
      sunday: [{ start: '00:00:00', end: '24:00:00' }],
    };
    expect(template).toBeDefined();
    expect(template).toStrictEqual(expected);
  });

  it('Weekday only (00:00-24:00)', () => {
    //  set
    dayjs.setBusinessTime({ 
      saturday: [{ start: '00:00:00', end: '24:00:00' }],
      sunday: [{ start: '00:00:00', end: '24:00:00' }],
    }, 'replace');

    const template = dayjs.getBusinessTime();
    const expected = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: [{ start: '00:00:00', end: '24:00:00' }],
      sunday: [{ start: '00:00:00', end: '24:00:00' }],
    };
    expect(template).toBeDefined();
    expect(template).toStrictEqual(expected);
  });
});
