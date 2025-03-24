import { AppBooking } from "../services/OfficeRnDTypes/Booking";

export const sortBookingByTimeAsc = (bookings: AppBooking[]): AppBooking[] => {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(a.startDateTime).getTime();
    const dateB = new Date(b.startDateTime).getTime();
    return dateB - dateA;
  });
};