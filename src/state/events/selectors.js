import { filter, includes, uniqBy } from 'lodash';
import { createSelector } from 'reselect';
import { computeDistanceBetween, LatLng } from 'spherical-geometry-js';

import {
  getDistance,
  getLocation,
  getSelectedNames,
  getSelectedState,
} from '../selections/selectors';

export const getEvents = state => state.events.allEvents;
export const getCurrentCandidateNames = createSelector([getEvents], events => uniqBy(events, 'displayName').map(item => item.displayName));

export const getEventsFilteredByCandidateArray = createSelector(
  [getEvents, getSelectedNames],
  (allEvents, namesToInclude) => {
    return filter(allEvents, o => includes(namesToInclude, o.displayName));
  },
);

const getEventsInState = createSelector(
  [getEventsFilteredByCandidateArray, getSelectedState],
  (filteredEvents, usState) => {
    if (!usState) {
      return filteredEvents;
    }
    return filteredEvents.filter(currrentEvent => currrentEvent.state === usState);
  },
);

export const getEventsNearSearchLocation = createSelector(
  [
    getEventsInState,
    getDistance,
    getLocation,
  ],
  (
    eventsToShow,
    maxDistance,
    location,
  ) => {
    if (!location.LAT) {
      return eventsToShow;
    }
    const lookup = new LatLng(Number(location.LAT), Number(location.LNG));
    const maxMeters = maxDistance * 1609.34; // Convert miles to meters before filtering
    return eventsToShow.filter((currentEvent) => {
      if (!currentEvent.lat) {
        return false;
      }
      const curDistance = computeDistanceBetween(
        lookup,
        new LatLng(Number(currentEvent.lat), Number(currentEvent.lng)),
      );
      return curDistance < maxMeters;
    }).sort((a, b) => {
      const aDistance = computeDistanceBetween(
        lookup,
        new LatLng(Number(a.lat), Number(a.lng)),
      );
      const bDistance = computeDistanceBetween(
        lookup,
        new LatLng(Number(b.lat), Number(b.lng)),
      );
      return aDistance - bDistance;
    });
  },
);

