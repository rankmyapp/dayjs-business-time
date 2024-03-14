import dayjs, { Dayjs } from 'dayjs';
import businessTime from '../src';
import { dd } from '../src/utils';

dayjs.extend(businessTime);

// dayjs.setExceptions({
//   '2024-03-05': [{ start: '08:00:00', end: '12:00:00' }],
//   '2024-03-06': [],
//   '2024-03-07': null,
// });

// dayjs.setExceptions({
//   '2024-04-05': [{ start: '12:00:00', end: '18:00:00' }],
//   '2024-03-06': [{ start: '12:00:00', end: '18:00:00' }],
//   '2024-04-07': [{ start: '12:00:00', end: '18:00:00' }],
// });

dayjs.setBusinessTime({
  // monday : null,
  tuesday: [{ start: '12:00:00', end: '18:00:00' }]
},'add');

console.log(dayjs);


// dd(
//   dayjs.getExceptionByDate('2024-03-05'),
//   dayjs.getExceptionByDate('2024-03-06'),
//   dayjs.getExceptionByDate('2024-03-07'),
//   dayjs.getExceptionByDate('2024-03-08'),
//   '----------------',
//   dayjs('2024-03-05').isExceptions(),
//   dayjs('2024-03-06').isExceptions(),
//   dayjs('2024-03-07').isExceptions(),
//   dayjs('2024-03-08').isExceptions(),
// );
// // dayjs.setHolidays(['2021-01-01', '2021-01-25', '2021-06-03'])

// // dd(dayjs);

// dayjs.setBusinessTime({
//   sunday: null,
//   monday: [{ start: '09:00:00', end: '17:00:00' }],
//   tuesday: [
//     { start: '09:00:00', end: '12:00:00' },
//     { start: '13:00:00', end: '18:00:00' },
//   ],
//   wednesday: [
//     { start: '09:00:00', end: '12:00:00' },
//     { start: '13:00:00', end: '16:00:00' },
//     { start: '13:00:00', end: '17:00:00' },
//   ],
//   thursday: [{ start: '09:00:00', end: '17:00:00' }],
//   friday: [{ start: '09:00:00', end: '17:00:00' }],
//   saturday: null,
// });

// const start: Dayjs = dayjs('2024-03-06 12:00:00');
// const end: Dayjs = start.clone().addBusinessHours(4);
// // const end: Dayjs = start.clone().addBusinessHours(1).addBusinessMinutes(0);
// const oldTemplate: BusinessHoursMap = dayjs.getBusinessTime();
// const newTemplate: BusinessHoursMap = {
//   sunday: null,
//   monday: null,
//   tuesday: null,
//   wednesday: null,
//   thursday: null,
//   friday: null,
//   saturday: null,
// };

// for (const [day, hours] of Object.entries(oldTemplate)) {
//   // dd(day, hours)
//   newTemplate[day] = hours;
// }

// dd(newTemplate)
console.log(
    // start.isBusinessDay()
//   dayjs.getBusinessTime(),
//   start.format('YYYY-MM-DD HH:mm:ss'),
//   end.format('YYYY-MM-DD HH:mm:ss'),
//   end.isBusinessTime(),
//   end.isBusinessDay(),
  //   start.lastBusinessDay().format('YYYY-MM-DD HH:mm:ss'),
  //   start.lastBusinessTime().format('YYYY-MM-DD HH:mm:ss')
  // end.format("YYYY-MM-DD HH:mm:ss"),
  // dayjs.getBusinessTime(),
  // start.format('YYYY-MM-DD HH:mm:ss'),
  // start.format('dddd').toLowerCase(),
  // end.format('YYYY-MM-DD HH:mm:ss'),
  // end.format('dddd').toLowerCase(),
  // dayjs().isBusinessDay(),
  // dayjs().isBusinessTime()
);
