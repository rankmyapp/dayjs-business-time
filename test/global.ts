import dayjs, { BusinessHoursMap, BusinessTimeExceptions, PartBusinessHoursMap } from 'dayjs';
import businessTime from '../src/';
import { dd } from 'dumpndie-nodejs';

dayjs.extend(businessTime);

// const time: PartBusinessHoursMap = {
//     sunday: [{start: '25:00:00', end:'28:00:00'}, {start: '20:00:00', end:'24:00:00'}],
//     monday : [{start: '22:00:00', end:'25:30:00'}],
// }

// const exc : BusinessTimeExceptions = {
//     '2024-01-01' : [{start: '07:00:00', end:'06:00:00'}, {start: '08:00:00', end:'28:00:00'}],
//     '2024-01-02' : [{start: '08:00:00', end:'25:00:00'}, {start: '06:00:00', end:'22:00:00'}],
//     '2024-01-03' : [{start: '13:00:00', end:'25:00:00'}, {start: '06:00:00', end:'07:00:00'}],
//     '2024-01-05' : null,
//     '2024-01-04' : [],
//     '2024-01-08' : [{start: '28:00:00', end:'25:00:00'}, {start: '26:00:00', end:'31:00:00'}],
// };
// dayjs.setExceptions(exc)
// dayjs.setBusinessTime(time);

// Create your holidays array as string array
// const holidays: string[] = ['2024-01-01', '2024-01-25', '2024-01-03'];

// // Add holidays to dayjs
// dayjs.setHolidays(holidays);

// set always close
dayjs.setBusinessTime({});

// set exceptions
const exceptions : BusinessTimeExceptions = {
    '2024-01-01' : [{start: "08:00:00", end:"12:00:00"}],
    '2024-02-01' : [{start: "08:00:00", end:"12:00:00"}],
    '2024-03-01' : [{start: "08:00:00", end:"12:00:00"}],
};
dayjs.setExceptions(exceptions);

// diff
console.log("diff in business time : ", dayjs("2024-01-01 10:00:00").businessHoursDiff(dayjs("2024-01-31 12:00:00"))); // out : 2 hours

// add
console.log("add business time : ", dayjs("2024-01-01 10:00:00").addBusinessHours(5).format("YYYY-MM-DD HH:mm:ss")); // out : 2024-02-01 11:00:00

// sub
console.log("sub business time : ", dayjs("2024-01-20 10:00:00").subtractBusinessHours(3).format("YYYY-MM-DD HH:mm:ss")); // out : 2024-01-01 09:00:00


dd(
    dayjs.getCurrentTemplate()
    // dayjs.getHolidays(),
    // dayjs.getHolidayByDate('2024-01-25')
    // dayjs.getExceptions(),
    // dayjs.getExceptionByDate('2024-01-03'),
    // dayjs.getExceptionByDate('2024-01-30'),
    // dayjs.getHolidays(),
    // dayjs("2024-01-03").isExceptions(),
    // dayjs("2024-01-04").isExceptions(),
    // dayjs("2024-01-05").isExceptions(),

//   dayjs.getBusinessTime(),
//   dayjs.getCurrentTemplate(),
  // dayjs.getCurrentTemplate(),
  // dayjs.setBusinessTime(time),
  // dayjs.getCurrentTemplate()
);
