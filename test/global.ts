import dayjs, { BusinessHoursMap, BusinessTimeExceptions, PartBusinessHoursMap } from "dayjs";
import businessTime from "../src/";
import dd from "@edaijs/dumpndie";

dayjs.extend(businessTime);

const time: PartBusinessHoursMap = {
    sunday: [{start: '08:00:00', end:'25:00:00'}, {start: '06:00:00', end:'22:00:00'}]
}

const exc : BusinessTimeExceptions = {
    '2024-01-01' : [{start: '07:00:00', end:'06:00:00'}, {start: '08:00:00', end:'28:00:00'}],
    '2024-01-02' : [{start: '08:00:00', end:'25:00:00'}, {start: '06:00:00', end:'22:00:00'}],
    '2024-01-03' : [{start: '13:00:00', end:'25:00:00'}, {start: '06:00:00', end:'07:00:00'}],
    '2024-01-05' : null,
    '2024-01-04' : [],
    '2024-01-08' : [{start: '28:00:00', end:'25:00:00'}, {start: '26:00:00', end:'31:00:00'}],
};
dayjs.setExceptions(exc)
dd(
    // dayjs.getCurrentTemplate(),
    // dayjs.setBusinessTime(time),
    dayjs.getCurrentTemplate()
);


