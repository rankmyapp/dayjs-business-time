import UpdateLocale from 'dayjs/plugin/updateLocale';
import LocaleData from 'dayjs/plugin/localeData';
import IsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import dayjs, { BusinessHoursMap, BusinessTimeSegment, BusinessUnitType, Dayjs, BusinessTimeExceptions, BusinessHours, UpdateLocaleType, PartBusinessHoursMap, TemplateBusinessTime } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dd from '@edaijs/dumpndie';

dayjs.extend(customParseFormat);

const DEFAULT_DAY_LIMIT = 365;

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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

const businessTime = (option: any, DayjsClass: typeof Dayjs, dayjsFactory: typeof dayjs) => {
  dayjsFactory.extend(LocaleData);
  dayjsFactory.extend(UpdateLocale);
  dayjsFactory.extend(IsSameOrBefore);
  dayjsFactory.extend(IsSameOrAfter);

  // private prop
  let _dayLimit_ = false;

  setBusinessTime(DEFAULT_WORKING_HOURS);
  setDayLimit(DEFAULT_DAY_LIMIT);
  setExceptions({});
  setHolidays([]);

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
      const newHolidays = [...getHolidays(), ...holidays].filter((date, index, self) => dayjs(date, DateFormat.date).isValid() && self.indexOf(date) === index).sort();
      updateLocale({ holidays: newHolidays });
    } else if (type == 'replace') {
      const newHolidays = holidays.filter((date) => dayjs(date, DateFormat.date).isValid()).sort();
      updateLocale({ holidays: newHolidays });
    }
  }

  function getBusinessTime(): BusinessHoursMap {
    return getLocale().businessHours;
  }

  function setBusinessTime(businessHours: PartBusinessHoursMap, type: UpdateLocaleType = 'replace') {
    if (type == 'add') {
      const oldBusinessTime: BusinessHoursMap = getBusinessTime();
      const newBusinessTime: BusinessHoursMap = {
        ...oldBusinessTime,
        ...businessHours,
      };

      // filter jam, jika overlap maka gabungkan, jika start lebih besar dari end maka hapus jam kerja tsb
      const newBusinessTimeFiltered: BusinessHoursMap = {} as BusinessHoursMap;
      for (const day in newBusinessTime) {
        const value = newBusinessTime[day];
        const hours = value ? mergeOverlappingIntervals(value) : null;
        newBusinessTimeFiltered[day] = hours && hours.length > 0 ? hours : null;
      }

      updateLocale({ businessHours: newBusinessTimeFiltered });
    } else if (type == 'replace') {
      const newBusinessTime = DAYS_OF_WEEK.reduce((acc, day) => {
        if (businessHours.hasOwnProperty(day)) {
          const hours = businessHours[day] ? mergeOverlappingIntervals(businessHours[day]) : null;
          acc[day] = hours && hours.length > 0 ? hours : null;
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
    const exceptions = getExceptions();
    return exceptions && exceptions.hasOwnProperty(date) ? exceptions[date] : null;
  }

  function setExceptions(exceptions: BusinessTimeExceptions, type: UpdateLocaleType = 'replace') {
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

        const validHours = hours ? mergeOverlappingIntervals(hours) : null;

        if (validHours === null || validHours.length === 0) {
          acc.holidays.push(date);
        } else {
          acc.filterExceptions[date] = validHours;
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

  function getCurrentTemplate(): TemplateBusinessTime {
    return {
      businessTimes: getBusinessTime(),
      holidays: getHolidays(),
      exceptions: getExceptions(),
    } as TemplateBusinessTime;
  }

  function isHoliday() {
    const today = this.format('YYYY-MM-DD');
    const holidays = getHolidays();

    return holidays.includes(today);
  }

  function isExceptions(date?: string): boolean {
    const today = date ? date : this.format(DateFormat.date);
    const exceptions = getExceptions();

    return !!(exceptions && exceptions.hasOwnProperty(today) ? exceptions[today] || null : null);
  }

  function isBusinessDay() {
    const businessHours = getBusinessTime();
    const dayName = DaysNames[this.day()];
    const isDefaultWorkingDay = !!businessHours[dayName];

    return (isDefaultWorkingDay || this.isExceptions()) && !this.isHoliday();
  }

  function addOrsubtractBusinessDays(date: Dayjs, numberOfDays: number, action: 'add' | 'subtract' = 'add') {
    let daysToIterate = numberOfDays;
    let day = date.clone();

    let dayLimit = getDayLimit() ?? DEFAULT_DAY_LIMIT;
    let dayCount = 0;

    if (checkNoWorkDays(getBusinessTime())) {
      const exceptions = getExceptions();
      if (exceptions && Object.values(exceptions).flat().length > 0) {
        const { min, max } = getMinMaxDates(exceptions);
        const diff = dayjs(max).diff(min, 'days');
        dayLimit = Math.max(dayLimit, diff);
      }
    }

    while (daysToIterate) {
      day = day[action](1, 'day');
      if (day.isBusinessDay()) {
        daysToIterate = daysToIterate - 1;
      }

      if (dayCount > dayLimit) {
        // jika set limit, maka return day berdasarkan action
        if (_dayLimit_) {
          _dayLimit_ = false;
          const _day_ = day[action](dayCount, 'days').startOf('day');
          setExceptions(
            {
              [_day_.format(DateFormat.date)]: [{ start: '12:00:00', end: '12:00:00' }],
            },
            'add',
          );
          return _day_;
        }

        throw new Error(`No opening hours found in the ${action == 'add' ? 'next' : 'past'} ${dayLimit} days. Use setDayLimit() to increase day limit`);
      }
      dayCount++;
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
    const [hours, minutes, seconds] = <number[]>(timeString.split(':') as unknown);
    return date.clone().hour(hours).minute(minutes).second(seconds).millisecond(0);
  }

  function getBusinessTimeSegments(day: Dayjs): BusinessTimeSegment[] {
    if (!day.isBusinessDay()) {
      return null;
    }
    let date = day.clone();

    const dayName = DaysNames[date.day()];
    const _date = date.format(DateFormat.date);
    const businessHours = isExceptions(_date) ? getExceptionByDate(_date) : getBusinessTime()[dayName];

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

  function addBusinessSeconds(secondsToAdd: number): Dayjs {
    return addOrSubtractBusinessSeconds(this, secondsToAdd);
  }

  function addBusinessMinutes(minutesToAdd: number): Dayjs {
    return addOrSubtractBusinessMinutes(this, minutesToAdd);
  }

  function addBusinessHours(hoursToAdd: number): Dayjs {
    const minutesToAdd = hoursToAdd * 60;
    return this.addBusinessMinutes(minutesToAdd);
  }

  function addBusinessTime(timeToAdd: number, businessUnit: BusinessUnitType) {
    if (businessUnit.match(/^(second)+s?$/)) {
      return this.addBusinessSeconds(timeToAdd);
    }

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

  function addOrSubtractBusinessMinutes(day: Dayjs, numberOfMinutes: number, action: 'add' | 'subtract' = 'add'): Dayjs {
    let date = action === 'add' ? day.nextBusinessTime() : day.lastBusinessTime();

    while (numberOfMinutes) {
      const segment = getCurrentBusinessTimeSegment(date) as BusinessTimeSegment;

      if (!segment) {
        date = action === 'add' ? date.nextBusinessTime() : date.lastBusinessTime();
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

  function addOrSubtractBusinessSeconds(day: Dayjs, numberOfSeconds: number, action: 'add' | 'subtract' = 'add'): Dayjs {
    let date = action === 'add' ? day.nextBusinessTime() : day.lastBusinessTime();
    while (numberOfSeconds) {
      const segment = getCurrentBusinessTimeSegment(date) as BusinessTimeSegment;

      if (!segment) {
        date = action === 'add' ? date.nextBusinessTime() : date.lastBusinessTime();
        continue;
      }

      const { start, end } = segment;

      const compareBaseDate = action === 'add' ? end : date;
      const compareDate = action === 'add' ? date : start;

      let timeToJump = compareBaseDate.diff(compareDate, 'second');

      if (timeToJump > numberOfSeconds) {
        timeToJump = numberOfSeconds;
      }

      numberOfSeconds -= timeToJump;

      if (!timeToJump && numberOfSeconds) {
        timeToJump = 1;
      }

      date = date[action](timeToJump, 'second');
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

  function subtractBusinessTime(timeToSubtract: number, businessUnit: BusinessUnitType) {
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
    _dayLimit_ = true;
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

        if (to.isSameOrAfter(start) && to.isSameOrBefore(end) && from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
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

  function businessSecondsDiff(comparator: Dayjs): number {
    let { from, to, multiplier } = fixDatesToCalculateDiff(this, comparator);
    let diff = 0;

    const isSameDayfromTo = from.isSame(to, 'day');
    if (isSameDayfromTo) {
      const fromSegments = getBusinessTimeSegments(from);
      for (const segment of fromSegments) {
        const { start, end } = segment;

        if (to.isSameOrAfter(start) && to.isSameOrBefore(end) && from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
          diff += to.diff(from, 'seconds');
          break;
        } else if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
          diff += to.diff(start, 'seconds');
          break;
        } else if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
          diff += end.diff(from, 'seconds');
        }
      }

      return diff ? diff * multiplier : 0;
    }

    let segments = getBusinessTimeSegments(from);
    for (const segment of segments) {
      const { start, end } = segment;

      if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
        diff += end.diff(from, 'seconds');
      } else if (start.isSameOrAfter(from)) {
        diff += end.diff(start, 'seconds');
      }
    }

    from = from.addBusinessDays(1);
    while (from.isBefore(to, 'day')) {
      segments = getBusinessTimeSegments(from);
      for (const segment of segments) {
        const { start, end } = segment;
        diff += end.diff(start, 'seconds');
      }

      from = from.addBusinessDays(1);
    }

    const toSegments = getBusinessTimeSegments(to);
    for (const segment of toSegments) {
      const { start, end } = segment;
      if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
        diff += to.diff(start, 'seconds');
      } else if (end.isSameOrBefore(to)) {
        diff += end.diff(start, 'seconds');
      }
    }

    return diff ? diff * multiplier : 0;
  }

  function businessHoursDiff(comparator: Dayjs): number {
    const minutesDiff = this.businessMinutesDiff(comparator);
    return minutesDiff / 60;
  }

  function businessTimeDiff(comparator: Dayjs, businessUnit: BusinessUnitType) {
    if (businessUnit.match(/^(second)+s?$/)) {
      return this.businessSecondsDiff(comparator);
    }

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

  function mergeOverlappingIntervals(array: BusinessHours[]): BusinessHours[] {
    // Sort the array by the start time
    const sortedArray = array.sort((a, b) => (convertTimeToDatetime(a.start).isAfter(convertTimeToDatetime(b.start)) ? 1 : -1));

    // Initialize the result array
    const result = [];

    for (let i = 0; i < sortedArray.length; i++) {
      const currentInterval = sortedArray[i];
      const start = convertTimeToDatetime(currentInterval.start);
      const end = convertTimeToDatetime(currentInterval.end);
      const endOfDay = convertTimeToDatetime("24:00:00");

      // If the start time is greater than the end time, skip this interval
      if (start.isAfter(end, 'second')) {
        continue;
      }

      // If the start time is greater than eq the end of day, skip this interval
      if(start.isSameOrAfter(endOfDay, 'second')){
        continue;
      }

      // custom start
      // if end >= endofday, set end to 24:00:00
      currentInterval.start = start.format(DateFormat.time);
      if(end.isSameOrAfter(endOfDay, 'second')){
        currentInterval.end = "24:00:00";
      }else{
        currentInterval.end = end.format(DateFormat.time);
      }

      const lastInterval = result[result.length - 1];
      let lastEnd = null;
      if(lastInterval && lastInterval?.end){
        lastEnd = convertTimeToDatetime(lastInterval.end)
      }

      if (result.length === 0 || (lastEnd && start.isAfter(lastEnd, 'second'))) {
        // If the current interval does not overlap, add it to the result array
        result.push(currentInterval);
      } else if (lastEnd && end.isAfter(lastEnd, 'second')) {
        // If the current interval overlaps with the last interval, merge them
        lastInterval.end = currentInterval.end;
      }
    }
    
    return result as BusinessHours[];
  }

  function convertTimeToDatetime(time: string) {
    let now = dayjs();
    let dateTime = now.format('YYYY-MM-DD') + 'T' + time;
    let date = dayjs(dateTime);
    return date;
  }

  function setDayLimit(day: number) {
    updateLocale({ dayLimit: day });
  }

  function getDayLimit() {
    return getLocale().dayLimit;
  }

  function checkNoWorkDays(workDays: BusinessHoursMap): boolean {
    for (const day in workDays) {
      if (workDays[day] !== null) {
        return false;
      }
    }
    return true;
  }

  function getMinMaxDates(obj: BusinessTimeExceptions): { min: string; max: string } {
    const dates = Object.keys(obj);
    const minDate = new Date(Math.min(...dates.map((date) => new Date(date).getTime())));
    const maxDate = new Date(Math.max(...dates.map((date) => new Date(date).getTime())));

    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0],
    };
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
  dayjsFactory.setDayLimit = setDayLimit;
  dayjsFactory.getDayLimit = getDayLimit;
  dayjsFactory.getCurrentTemplate = getCurrentTemplate;

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
  DayjsClass.prototype.addBusinessSeconds = addBusinessSeconds;
  DayjsClass.prototype.subtractBusinessMinutes = subtractBusinessMinutes;
  DayjsClass.prototype.subtractBusinessHours = subtractBusinessHours;
  DayjsClass.prototype.subtractBusinessTime = subtractBusinessTime;
  DayjsClass.prototype.businessMinutesDiff = businessMinutesDiff;
  DayjsClass.prototype.businessSecondsDiff = businessSecondsDiff;
  DayjsClass.prototype.businessHoursDiff = businessHoursDiff;
  DayjsClass.prototype.businessDaysDiff = businessDaysDiff;
  DayjsClass.prototype.businessTimeDiff = businessTimeDiff;
  DayjsClass.prototype.isExceptions = isExceptions;
};

export default businessTime;
exports = module.exports = businessTime;
