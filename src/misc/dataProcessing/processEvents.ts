import { ProcessedEventBriteData } from "@/src/services/EventBriteService";
import { AppBooking } from "@/src/services/OfficeRnDTypes/Booking";

export function TrimExpiredEvents(events: Array<AppBooking>, dateTimeToCompare: Date) {
    return events.filter((event) => {
        const eventEndTime = new Date(event.endDateTime);
        return eventEndTime > dateTimeToCompare
    })
}

const dateUtils = {
     convertToLocalTime: (dateTimeString: string): Date => {
        const date = new Date(dateTimeString);
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
    }
    ,
    isSameDay: (itemDate: Date, compareDate: Date): boolean => {
        return itemDate.getFullYear === compareDate.getFullYear
        && itemDate.getMonth() === compareDate.getMonth()
        && itemDate.getDate() === compareDate.getDate()
    }
}


interface HasStartDateTime {
    startDateTime: string;
}

export function SeparateStartedAndUpcomingEvents<T extends HasStartDateTime>(events: Array<T>, dateTimeToCompare: Date) {
    let out = {started: Array<T>(), upcoming: Array<T>()};
    const compareTime = dateUtils.convertToLocalTime(dateTimeToCompare.toISOString());


    for(let i=0; i < Object.keys(events).length; i++) {
        const item = events[i];
        const currentLocalTimeStartItem = dateUtils.convertToLocalTime(item.startDateTime);
        if (currentLocalTimeStartItem < dateTimeToCompare) {
            out.started.push(item)
        } else if (dateUtils.isSameDay(currentLocalTimeStartItem, dateTimeToCompare)) {
            out.upcoming.push(item)
        }
    }
    return out
}
