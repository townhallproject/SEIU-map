import moment from 'moment';

import getData from '../../logics/getData';

import { firebaseUrl } from '../constants';

import TownHall from './model';

export const setEvents = events => ({
  events,
  type: 'SET_EVENTS',
});

export const setFeaturesHome = featuresHome => ({
  featuresHome,
  type: 'SET_FEATURES_HOME',
});

export const updateColorMap = colorMap => ({
  colorMap,
  type: 'UPDATE_COLORS',
});


export const startSetEvents = () => (dispatch) => {
  const url = `${firebaseUrl}/townHalls.json`;
  return getData(url).then((result) => {
    const allevents = result.body;
    const events = Object.keys(allevents)
      .map(id => new TownHall(allevents[id]))
      .filter(event => {
        return event.iconFlag === 'campaign' && event.chamber === 'nationwide';
        })
      .sort((a, b) => ((moment(a.starts_at).isSameOrAfter(moment(b.starts_at))) ? 1 : -1));
    return (dispatch(setEvents(events)));
  });
};
