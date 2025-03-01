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
  // const currentDate = new Date('2025-02-11');
  // const tomorrow = new Date('2025-02-11');
  tomorrow.setDate(tomorrow.getDate() + 1);

  // TODO: Implement correct ISO style
  const nowDate = currentDate.toLocaleDateString("fr-CA");
  const tomorrowDate = tomorrow.toLocaleDateString("fr-CA");

  const officeRNDService = new OfficeRnDService();
  const events = await officeRNDService.getEventsWithMeetingRoomsAndHostingTeam(
    nowDate,
    tomorrowDate,
  );
  // console.log(events)

  const todayEvents = events
    .filter((event: any) => {
      // console.log(event.host + ":"+ new Date(event.startDateTime).toLocaleDateString("fr-CA"))
      // console.log(nowDate)
      return new Date(event.startDateTime).toLocaleDateString("fr-CA") == nowDate;
    });
  const todayEventsSorted = todayEvents.sort(function (a, b) {
    return (
      (new Date(a.startDateTime).getTime() - new Date(b.endDateTime).getTime()) / 1000
    );
  });
  const eventsToShow = SeparateStartedAndUpcomingEvents(
    TrimExpiredEvents(todayEventsSorted, new Date()),
    new Date(),
  );
  res.status(200).json(eventsToShow);
}
