import { uniqBy } from 'lodash';

const initialState = {
  distance: 50,
  location: {},
  searchType: 'proximity',
  selectedNames: [],
  usState: '',
  zipcode: '',
};

const userSelectionsReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case 'RESET_SELECTIONS':
      return {
        ...state,
        location: initialState.location,
        usState: initialState.filterValue,
      };
    case 'SET_REFCODE':
      return {
        ...state,
        refcode: payload,
      };
    case 'SET_US_STATE':
      return {
        ...state,
        usState: payload,
      };
    case 'SET_DISTANCE':
      return {
        ...state,
        distance: payload,
      };
    case 'SET_LAT_LNG':
      return {
        ...state,
        location: payload,
      };
    case 'RESET_LAT_LNG':
      return {
        ...state,
        location: {},
      };
    case 'SET_NAME_FILTER':
      return {
        ...state,
        selectedNames: payload,
      };
    case 'SET_INITIAL_FILTERS':
      return {
        ...state,
        selectedNames: uniqBy(payload.events, 'displayName')
          .map(item => item.displayName),
      };
    default:
      return state;
  }
};

export default userSelectionsReducer;
