import UpdateLocale from 'dayjs/plugin/updateLocale';
import LocaleData from 'dayjs/plugin/localeData';
import IsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import dayjs, {
  BusinessHoursMap,
  BusinessTimeSegment,
  BusinessUnitType,
  Dayjs,
  BusinessTimeExceptions,
  BusinessHours,
  UpdateLocaleType,
  PartBusinessHoursMap,
} from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

const { dd } = require('./utils');

// init
dayjs.extend(customParseFormat);

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DEFAULT_WORKING_HOURS = DAYS_OF_WEEK.reduce((acc, day) => {
  if (day === 'saturday' || day === 'sunday') {
    acc[day] = null;
  } else {
    acc[day] = [{ start: '09:00:00', end: '17:00:00' }];
  }
  return acc;
}, {});

enum DaysNames {
  sunday = 0,
  monday = 1,
  tuesday = 2,
  wednesday = 3,
  thursday = 4,
  friday = 5,
  saturday = 6,
}

enum DateFormat {
  date = 'YYYY-MM-DD',
  time = 'HH:mm:ss',
  datetime = 'YYYY-MM-DD HH:mm:ss',
}

const businessTime = (
  option: any,
  DayjsClass: typeof Dayjs,
  dayjsFactory: typeof dayjs,
) => {
  dayjsFactory.extend(LocaleData);
  dayjsFactory.extend(UpdateLocale);
  dayjsFactory.extend(IsSameOrBefore);
  dayjsFactory.extend(IsSameOrAfter);

  setBusinessTime(DEFAULT_WORKING_HOURS);

  function getLocale() {
    return dayjsFactory.Ls[dayjs().locale()];
  }

  function updateLocale(newData: Object) {
    dayjsFactory.updateLocale(dayjs().locale(), { ...newData });
  }

  function getHolidays(): string[] {
    return getLocale().holidays || [];
  }

  function getHolidayByDate(date: string): boolean {
    const holidays = getHolidays();
    return holidays.includes(date);
  }

  function setHolidays(holidays: string[], type: UpdateLocaleType = 'replace') {
    if (type == 'add') {
      const newHolidays = [...getHolidays(), ...holidays]
        .filter(
          (date, index, self) =>
            dayjs(date, DateFormat.date).isValid() &&
            self.indexOf(date) === index,
        )
        .sort();
      updateLocale({ holidays: newHolidays });
    } else if (type == 'replace') {
      const newHolidays = holidays
        .filter((date) => dayjs(date, DateFormat.date).isValid())
        .sort();
      updateLocale({ holidays: newHolidays });
    }
  }

  function getBusinessTime(): BusinessHoursMap {
    return getLocale().businessHours;
  }

  function setBusinessTime(
    businessHours: PartBusinessHoursMap,
    type: UpdateLocaleType = 'replace',
  ) {
    if (type == 'add') {
      const oldBusinessTime: BusinessHoursMap = getBusinessTime();
      const newBusinessTime: BusinessHoursMap = {
        ...oldBusinessTime,
        ...businessHours,
      };
      updateLocale({ businessHours: newBusinessTime });
    } else if (type == 'replace') {
      const newBusinessTime = DAYS_OF_WEEK.reduce((acc, day) => {
        if (businessHours.hasOwnProperty(day)) {
          acc[day] = businessHours[day];
        } else {
          acc[day] = null;
        }
        return acc;
      }, {});
      updateLocale({ businessHours: newBusinessTime });
    }
  }

  /**
   * get all exceptions
   */
  function getExceptions(sort: boolean = false): BusinessTimeExceptions {
    const exceptions = getLocale().exceptions;
    if (sort == true && exceptions && typeof exceptions == 'object') {
      return sortedObj(exceptions) as BusinessTimeExceptions;
    }
    return exceptions;
  }

  /**
   * get exception by date
   * @param date "string YYYY-MM-DD"
   * @returns
   */
  function getExceptionByDate(date: string): BusinessHours[] {
    const exceptions = this.getExceptions();
    return exceptions.hasOwnProperty(date) ? exceptions[date] : null;
  }

  function setExceptions(
    exceptions: BusinessTimeExceptions,
    type: UpdateLocaleType = 'replace',
  ) {
    // jika value date = [] | null, maka date akan ditambahkan ke holiday karena tidak ada jam kerja.
    const {
      holidays,
      filterExceptions,
    }: {
      holidays: string[];
      filterExceptions: BusinessTimeExceptions;
    } = Object.entries(exceptions).reduce(
      (acc, [date, hours]) => {
        // Skip if the date is not valid
        if (!dayjs(date, DateFormat.date).isValid()) {
          return acc;
        }
        
        if (hours === null || hours.length === 0) {
          acc.holidays.push(date);
        } else {
          holidays;
          acc.filterExceptions[date] = hours;
        }
        return acc;
      },
      { filterExceptions: {}, holidays: [] },
    );
    setHolidays(holidays, 'add');

    if (type == 'add') {
      const oldExceptions: BusinessTimeExceptions = getExceptions();
      const newExceptions: BusinessTimeExceptions = {
        ...oldExceptions,
        ...filterExceptions,
      };
      updateLocale({ exceptions: newExceptions });
    } else if (type == 'replace') {
      updateLocale({ exceptions: filterExceptions });
    }
  }

  function isHoliday() {
    const today = this.format('YYYY-MM-DD');
    const holidays = getHolidays();

    return holidays.includes(today);
  }

  function isExceptions(): boolean {
    const today = this.format(DateFormat.date);
    const exceptions = getExceptions();

    return !!(exceptions.hasOwnProperty(today)
      ? exceptions[today] || null
      : null);
  }

  function isBusinessDay() {
    const businessHours = getBusinessTime();
    const dayName = DaysNames[this.day()];
    const isDefaultWorkingDay = !!businessHours[dayName];

    return isDefaultWorkingDay && !this.isHoliday();
  }

  function addOrsubtractBusinessDays(
    date: Dayjs,
    numberOfDays: number,
    action: 'add' | 'subtract' = 'add',
  ) {
    let daysToIterate = numberOfDays;
    let day = date.clone();

    while (daysToIterate) {
      day = day[action](1, 'day');
      if (day.isBusinessDay()) {
        daysToIterate = daysToIterate - 1;
      }
    }

    return day;
  }

  function nextBusinessDay() {
    return addOrsubtractBusinessDays(this, 1);
  }

  function lastBusinessDay() {
    return addOrsubtractBusinessDays(this, 1, 'subtract');
  }

  function addBusinessDays(numberOfDays: number) {
    return addOrsubtractBusinessDays(this, numberOfDays);
  }

  function subtractBusinessDays(numberOfDays: number) {
    return addOrsubtractBusinessDays(this, numberOfDays, 'subtract');
  }

  function timeStringToDayJS(timeString: string, date: Dayjs = dayjs()) {
    const [hours, minutes, seconds] = <number[]>(
      (timeString.split(':') as unknown)
    );
    return date
      .clone()
      .hour(hours)
      .minute(minutes)
      .second(seconds)
      .millisecond(0);
  }

  function getBusinessTimeSegments(day: Dayjs): BusinessTimeSegment[] {
    if (!day.isBusinessDay()) {
      return null;
    }
    let date = day.clone();

    const dayName = DaysNames[date.day()];

    const businessHours = getBusinessTime()[dayName];

    return businessHours.reduce((segments, businessTime, index) => {
      let { start, end } = businessTime;
      start = timeStringToDayJS(start, date);
      end = timeStringToDayJS(end, date);
      segments.push({ start, end });
      return segments;
    }, []);
  }

  function getCurrentBusinessTimeSegment(date) {
    const businessSegments = getBusinessTimeSegments(date);

    if (!businessSegments?.length) {
      return false;
    }

    return businessSegments.find((businessSegment) => {
      const { start, end } = businessSegment;
      return date.isSameOrAfter(start) && date.isSameOrBefore(end);
    });
  }

  function isBusinessTime() {
    return !!getCurrentBusinessTimeSegment(this);
  }

  function nextBusinessTime() {
    if (!this.isBusinessDay()) {
      const nextBusinessDay = this.nextBusinessDay();
      return getBusinessTimeSegments(nextBusinessDay)[0].start;
    }

    const segments = getBusinessTimeSegments(this);

    for (let index = 0; index < segments.length; index++) {
      const { start, end } = segments[index];
      const isLastSegment = index === segments.length - 1;

      if (this.isBefore(start)) {
        return start;
      }

      if (this.isAfter(end)) {
        if (!isLastSegment) {
          continue;
        }

        const nextBusinessDay = this.nextBusinessDay();
        return getBusinessTimeSegments(nextBusinessDay)[0].start;
      }

      return this.clone();
    }
  }

  function lastBusinessTime() {
    if (!this.isBusinessDay()) {
      const lastBusinessDay = this.lastBusinessDay();
      const { end } = getBusinessTimeSegments(lastBusinessDay).pop();
      return end;
    }

    const segments = getBusinessTimeSegments(this).reverse();

    for (let index = 0; index < segments.length; index++) {
      const { start, end } = segments[index];
      const isFirstSegment = index === segments.length - 1;

      if (this.isAfter(end)) {
        return end;
      }

      if (this.isBefore(start)) {
        if (!isFirstSegment) {
          continue;
        }

        const lastBusinessDay = this.lastBusinessDay();
        return getBusinessTimeSegments(lastBusinessDay).pop().end;
      }

      return this.clone();
    }
  }

  function addBusinessMinutes(minutesToAdd: number): Dayjs {
    return addOrSubtractBusinessMinutes(this, minutesToAdd);
  }

  function addBusinessHours(hoursToAdd: number): Dayjs {
    const minutesToAdd = hoursToAdd * 60;
    return this.addBusinessMinutes(minutesToAdd);
  }

  function addBusinessTime(timeToAdd: number, businessUnit: BusinessUnitType) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return this.addBusinessMinutes(timeToAdd);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return this.addBusinessHours(timeToAdd);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return this.addBusinessDays(timeToAdd);
    }

    throw new Error('Invalid Business Time Unit');
  }

  function addOrSubtractBusinessMinutes(
    day: Dayjs,
    numberOfMinutes: number,
    action: 'add' | 'subtract' = 'add',
  ): Dayjs {
    let date =
      action === 'add' ? day.nextBusinessTime() : day.lastBusinessTime();

    while (numberOfMinutes) {
      const segment = getCurrentBusinessTimeSegment(
        date,
      ) as BusinessTimeSegment;

      if (!segment) {
        date =
          action === 'add' ? date.nextBusinessTime() : date.lastBusinessTime();
        continue;
      }

      const { start, end } = segment;

      const compareBaseDate = action === 'add' ? end : date;
      const compareDate = action === 'add' ? date : start;

      let timeToJump = compareBaseDate.diff(compareDate, 'minute');

      if (timeToJump > numberOfMinutes) {
        timeToJump = numberOfMinutes;
      }

      numberOfMinutes -= timeToJump;

      if (!timeToJump && numberOfMinutes) {
        timeToJump = 1;
      }

      date = date[action](timeToJump, 'minute');
    }

    return date;
  }

  function subtractBusinessMinutes(minutesToSubtract: number): Dayjs {
    return addOrSubtractBusinessMinutes(this, minutesToSubtract, 'subtract');
  }

  function subtractBusinessHours(hoursToSubtract: number): Dayjs {
    const minutesToSubtract = hoursToSubtract * 60;
    return this.subtractBusinessMinutes(minutesToSubtract);
  }

  function subtractBusinessTime(
    timeToSubtract: number,
    businessUnit: BusinessUnitType,
  ) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return this.subtractBusinessMinutes(timeToSubtract);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return this.subtractBusinessHours(timeToSubtract);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return this.subtractBusinessDays(timeToSubtract);
    }

    throw new Error('Invalid Business Time Unit');
  }

  function fixDatesToCalculateDiff(base, comparator) {
    let from: Dayjs = base.clone();
    let to: Dayjs = comparator.clone();
    let multiplier = 1;

    if (base.isAfter(comparator)) {
      to = base.clone();
      from = comparator.clone();
      multiplier = -1;
    }

    if (!from.isBusinessTime()) {
      from = from.lastBusinessTime();
    }

    if (!to.isBusinessTime()) {
      to = to.nextBusinessTime();
    }

    return { from, to, multiplier };
  }

  function businessDaysDiff(comparator: Dayjs): number {
    let { from, to, multiplier } = fixDatesToCalculateDiff(this, comparator);
    let diff = 0;

    while (!from.isSame(to, 'day')) {
      diff += 1;
      from = from.addBusinessDays(1);
    }

    return diff ? diff * multiplier : 0;
  }

  function businessMinutesDiff(comparator: Dayjs): number {
    let { from, to, multiplier } = fixDatesToCalculateDiff(this, comparator);
    let diff = 0;

    const isSameDayfromTo = from.isSame(to, 'day');
    if (isSameDayfromTo) {
      const fromSegments = getBusinessTimeSegments(from);
      for (const segment of fromSegments) {
        const { start, end } = segment;

        if (
          to.isSameOrAfter(start) &&
          to.isSameOrBefore(end) &&
          from.isSameOrAfter(start) &&
          from.isSameOrBefore(end)
        ) {
          diff += to.diff(from, 'minutes');
          break;
        } else if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
          diff += to.diff(start, 'minutes');
          break;
        } else if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
          diff += end.diff(from, 'minutes');
        }
      }

      return diff ? diff * multiplier : 0;
    }

    let segments = getBusinessTimeSegments(from);
    for (const segment of segments) {
      const { start, end } = segment;

      if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
        diff += end.diff(from, 'minutes');
      } else if (start.isSameOrAfter(from)) {
        diff += end.diff(start, 'minutes');
      }
    }

    from = from.addBusinessDays(1);
    while (from.isBefore(to, 'day')) {
      segments = getBusinessTimeSegments(from);
      for (const segment of segments) {
        const { start, end } = segment;
        diff += end.diff(start, 'minutes');
      }

      from = from.addBusinessDays(1);
    }

    const toSegments = getBusinessTimeSegments(to);
    for (const segment of toSegments) {
      const { start, end } = segment;
      if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
        diff += to.diff(start, 'minutes');
      } else if (end.isSameOrBefore(to)) {
        diff += end.diff(start, 'minutes');
      }
    }

    return diff ? diff * multiplier : 0;
  }

  function businessHoursDiff(comparator: Dayjs): number {
    const minutesDiff = this.businessMinutesDiff(comparator);
    return minutesDiff / 60;
  }

  function businessTimeDiff(comparator: Dayjs, businessUnit: BusinessUnitType) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return this.businessMinutesDiff(comparator);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return this.businessHoursDiff(comparator);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return this.businessDaysDiff(comparator);
    }

    throw new Error('Invalid Business Time Unit');
  }

  function sortedObj(obj: Object): Object {
    if (Object.keys(obj).length <= 0) return obj;

    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }

  // New functions on dayjs factory
  dayjsFactory.getHolidays = getHolidays;
  dayjsFactory.getHolidayByDate = getHolidayByDate;
  dayjsFactory.setHolidays = setHolidays;
  dayjsFactory.getBusinessTime = getBusinessTime;
  dayjsFactory.setBusinessTime = setBusinessTime;
  dayjsFactory.getExceptions = getExceptions;
  dayjsFactory.setExceptions = setExceptions;
  dayjsFactory.getExceptionByDate = getExceptionByDate;

  // New methods on Dayjs class
  DayjsClass.prototype.isHoliday = isHoliday;
  DayjsClass.prototype.isBusinessDay = isBusinessDay;
  DayjsClass.prototype.nextBusinessDay = nextBusinessDay;
  DayjsClass.prototype.lastBusinessDay = lastBusinessDay;
  DayjsClass.prototype.addBusinessDays = addBusinessDays;
  DayjsClass.prototype.subtractBusinessDays = subtractBusinessDays;
  DayjsClass.prototype.isBusinessTime = isBusinessTime;
  DayjsClass.prototype.nextBusinessTime = nextBusinessTime;
  DayjsClass.prototype.lastBusinessTime = lastBusinessTime;
  DayjsClass.prototype.addBusinessTime = addBusinessTime;
  DayjsClass.prototype.addBusinessHours = addBusinessHours;
  DayjsClass.prototype.addBusinessMinutes = addBusinessMinutes;
  DayjsClass.prototype.subtractBusinessMinutes = subtractBusinessMinutes;
  DayjsClass.prototype.subtractBusinessHours = subtractBusinessHours;
  DayjsClass.prototype.subtractBusinessTime = subtractBusinessTime;
  DayjsClass.prototype.businessMinutesDiff = businessMinutesDiff;
  DayjsClass.prototype.businessHoursDiff = businessHoursDiff;
  DayjsClass.prototype.businessDaysDiff = businessDaysDiff;
  DayjsClass.prototype.businessTimeDiff = businessTimeDiff;
  DayjsClass.prototype.isExceptions = isExceptions;
};

export default businessTime;
exports = module.exports = businessTime;
