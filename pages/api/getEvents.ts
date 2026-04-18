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
  const currentDate = new Date('2025-06-06');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // TODO: Implement correct ISO style
  const nowDate = currentDate.toISOString();
  const tomorrowDate = tomorrow.toISOString();

  const officeRNDService = new OfficeRnDService();
  const events = await officeRNDService.getEventsWithMeetingRoomsAndHostingTeam(
    nowDate,
    tomorrowDate,
  );
  
  const todayEvents = events
    // .filter((event: any) => {
    //   return new Date(event.startDateTime).toISOString() == nowDate;
    // });
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
