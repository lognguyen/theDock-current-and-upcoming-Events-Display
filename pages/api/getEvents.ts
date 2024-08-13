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
  const date = new Date();
  if (date.getHours() > 22 || date.getHours() < 5) {
    // Prevent fetching data
    res.status(200).json([]);
  }

  const nowDate = date.toLocaleDateString();
  const tomorrowDate = date.toLocaleDateString();
  const officeRNDService = new OfficeRnDService();
  const events = await officeRNDService.getEventsWithMeetingRoomsAndHostingTeam(
    nowDate,
    tomorrowDate,
  );
  if (events.length == 0) {
    res.status(200).json([]);
  }

  const todayEvents = events
  .filter((event: any) => {
    return new Date(event.startDateTime).toLocaleDateString() == nowDate;
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
