import dayjs from "dayjs";
import businessTime from "../src/";

dayjs.extend(businessTime);

console.log(dayjs.getCurrentTemplate());


