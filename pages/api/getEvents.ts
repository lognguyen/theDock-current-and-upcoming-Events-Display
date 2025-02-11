// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  SeparateStartedAndUpcomingEvents,
  TrimExpiredEvents,
} from '../../src/misc/dataProcessing/processEvents';
import { OfficeRnDService } from '../../src/services/OfficeRnDService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const currentDate = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // TODO: Implement correct ISO style
  const nowDate = currentDate.toLocaleDateString("fr-CA");
  const tomorrowDate = tomorrow.toLocaleDateString("fr-CA");
  const formattedNowDate = nowDate + "T" + ("0" + currentDate.getHours()).slice(-2) + ":" + currentDate.getMinutes() + ":00.000Z"; // no need for seconds precision
  const formattedTomorrowDate = tomorrowDate + "T" +  ("0" + tomorrow.getHours()).slice(-2) + ":" + tomorrow.getMinutes() + ":00.000Z"; // no need for seconds precision
  const officeRNDService = new OfficeRnDService();
  const events = await officeRNDService.getEventsWithMeetingRoomsAndHostingTeam(
    formattedNowDate,
    formattedTomorrowDate,
  );

  const todayEvents = events
    .filter((event: any) => {
      return new Date(event.startDateTime).toLocaleDateString("fr-CA") == nowDate;
    });
  const todayEventsSorted = todayEvents.sort(function (a, b) {
    return (
      new Date(a.startDateTime).getTime() - new Date(b.endDateTime).getTime()
    );
  });
  const eventsToShow = SeparateStartedAndUpcomingEvents(
    TrimExpiredEvents(todayEventsSorted, new Date()),
    new Date(),
  );
  res.status(200).json(eventsToShow);
}
