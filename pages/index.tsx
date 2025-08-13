import Event from '@/src/components/event';
import { sortEventsByProximityToNow } from '@/src/helpers/sortEventsByProximityToNow';
import { sortBookingByTimeAsc } from '@/src/helpers/sortEventsByStartTimeAsc';
import { AppBooking } from '@/src/services/OfficeRnDTypes/Booking';
import React, { PropsWithChildren, useState, useEffect, useRef } from 'react';
const TIME_TO_REFRESH = 3000; // 3 seconds refresh
const TIME_TO_GET_REQUEST = 240000; // 4 minutes refershing token

export default function Home() {
  const [currentTime, setRealTime] = useState(new Date());
  useEffect(() => {
    const timeIntervalId = setInterval(function () {
      setRealTime(new Date());
    }, TIME_TO_REFRESH);
    return () => {
      clearInterval(timeIntervalId);
    };
  }, []);

  const [eventData, setEventData] = useState({
    started: Array<AppBooking>(),
    upcoming: Array<AppBooking>(),
  });
  const currentTimeEvent = new Date();
  // Only fetching events during 5 - 22

  const controlledFetchedEvents = function () {
    if (currentTimeEvent.getHours() > 22 || currentTimeEvent.getHours() < 5) {
      return null;
    }
    fetch('/api/getEvents')
      .then((res) => {
        if (!res.ok) throw new Error('Error Status: ' + res.status);
        else return res.json();
      })
      .then((apiEventData) => {
        if (apiEventData.length == 0) {
          return;
        }
        setEventData(apiEventData);
      })
      .catch((e) => {
        console.error('Error fetching events');
        console.error(e);
        return;
      });
  };

  useEffect(() => {
    controlledFetchedEvents(); // First time to fire off instantly
    const intervalId = setInterval(() => {
      controlledFetchedEvents();
    }, TIME_TO_GET_REQUEST);
    return () => clearInterval(intervalId);
  }, []);

  if (!eventData) {
    // If encounter event data problems --> stop rendering
    return null;
  }

  const eventsHappeningNow = sortEventsByProximityToNow(eventData.started);
  const eventsComingSoon = sortBookingByTimeAsc(eventData.upcoming);

  return (
    <div className='event_page'>
      <div className='child_section left_section no-scrollbar'>
        <Section title='Happening right now'>
          <div className='event_section__list'>
            {eventsHappeningNow.map((event, index) => {
              // TODO: check if isOverflow is correct
              if (eventsHappeningNow.length - 1 === index) {
                return <Event event={event} key={event._id} />;
              }
              if (eventsComingSoon.length === 0) {
                if (index === 0) {
                  return <Event event={event} key={event._id} />;
                }
              }
              else {
                return <Event event={event} key={event._id} />;
              }
            })}
          </div>
        </Section>
        <Section title='Later today'>
          <div className='event_section__list'>
            {eventsComingSoon.map((event, index) => {
              // TODO: check if isOverflow is correct
              if (eventsHappeningNow.length === 0) {
                if (eventsHappeningNow.length - 1 === index) {
                  return <Event event={event} key={event._id} />;
                }
              }
              if (index === 0) {
                return <Event event={event} key={event._id} />;
              }
              else {
                return <Event event={event} key={event._id} />;
              }
            })}
          </div>
        </Section>
      </div>
      <div className='child_section right_section'>
        <div className='display-time'>
          <span id='timeValue'>
            {Intl.DateTimeFormat('en-US', {
              minute: 'numeric',
              hour: 'numeric',
            }).format(currentTime)}
          </span>
          <span>
            {Intl.DateTimeFormat('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(currentTime)}
          </span>
        </div>
        <img className='logo' src='theDockLogoSquareColors.png' />
      </div>
    </div>
  );
}

const Section = (props: PropsWithChildren<{ title: string; }>) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const scrollHeight = list.scrollHeight;
    const clientHeight = list.clientHeight;

    // Auto scroll every 5 seconds
    const scrollInterval = setInterval(() => {
      if (scrollPosition >= scrollHeight - clientHeight) {
        // Reset to top when reached bottom
        setScrollPosition(0);
        list.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        // Scroll down by 100px
        const newPosition = scrollPosition + 100;
        setScrollPosition(newPosition);
        list.scrollTo({
          top: newPosition,
          behavior: 'smooth'
        });
      }
    }, 5000);

    return () => clearInterval(scrollInterval);
  }, [scrollPosition]);

  return (
    <section className='event_section'>
      <SectionTitle>{props.title}</SectionTitle>
      <div className='event_section__list' ref={listRef}>
        {props.children}
      </div>
    </section>
  );
};

const SectionTitle = ({ children }: PropsWithChildren<{}>) => {
  return <div className='event_section__title'>{children}</div>;
};