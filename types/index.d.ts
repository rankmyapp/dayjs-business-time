import { PluginFunc } from 'dayjs';

declare const plugin: PluginFunc;
export = plugin;

declare module 'dayjs' {
  export function getHolidays(): string[];
  export function getHolidayByDate(date: string): boolean;
  export function setHolidays(holidays: string[], type?: UpdateLocaleType): void;
  export function getBusinessTime(): BusinessHoursMap;
  export function setBusinessTime(businessHours: PartBusinessHoursMap, type: UpdateLocaleType): void;
  export function getExceptions(sort?: boolean): BusinessTimeExceptions;
  export function setExceptions(
    exceptions: BusinessTimeExceptions,
    type? : UpdateLocaleType
  ): void;
  export function getExceptionByDate(date: string): BusinessHours[] | null;

  export type BusinessUnitType =
    | 'minute'
    | 'minutes'
    | 'hour'
    | 'hours'
    | 'day'
    | 'days';

  export type UpdateLocaleType = 'add' | 'replace';

  export interface Dayjs {
    isBusinessDay(): boolean;
    isHoliday(): boolean;
    nextBusinessDay(): Dayjs;
    lastBusinessDay(): Dayjs;
    isBusinessTime(): boolean;
    nextBusinessTime(): Dayjs;
    lastBusinessTime(): Dayjs;
    addBusinessDays(numberOfDays: number): Dayjs;
    subtractBusinessDays(numberOfDays: number): Dayjs;
    addBusinessHours(numberOfHours: number): Dayjs;
    addBusinessMinutes(numberOfMinutes: number): Dayjs;
    addBusinessTime(timeToAdd: number, businessUnit: BusinessUnitType): Dayjs;
    subtractBusinessMinutes(numberOfMinutes: number): Dayjs;
    subtractBusinessHours(numberOfHours: number): Dayjs;
    subtractBusinessTime(
      timeToSubtract: number,
      businessUnit: BusinessUnitType,
    ): Dayjs;
    businessMinutesDiff(comparator: Dayjs): number;
    businessHoursDiff(comparator: Dayjs): number;
    businessDaysDiff(comparator: Dayjs): number;
    businessTimeDiff(comparator: Dayjs, businessUnit: BusinessUnitType): number;
    isExceptions(): boolean;
  }
  export interface BusinessHoursMap {
    monday: BusinessHours[] | null;
    tuesday: BusinessHours[] | null;
    wednesday: BusinessHours[] | null;
    thursday: BusinessHours[] | null;
    friday: BusinessHours[] | null;
    saturday: BusinessHours[] | null;
    sunday: BusinessHours[] | null;
  }

  export interface PartBusinessHoursMap {
    monday?: BusinessHours[] | null;
    tuesday?: BusinessHours[] | null;
    wednesday?: BusinessHours[] | null;
    thursday?: BusinessHours[] | null;
    friday?: BusinessHours[] | null;
    saturday?: BusinessHours[] | null;
    sunday?: BusinessHours[] | null;
  }

  export interface BusinessHours {
    start: string;
    end: string;
  }

  export interface BusinessTimeSegment {
    start: Dayjs;
    end: Dayjs;
  }

  export interface ILocale {
    holidays: string[];
    businessHours: BusinessHoursMap;
    exceptions: any;
  }

  export interface BusinessTimeExceptions {
    [date: string]: BusinessHours[] | null;
  }
}
