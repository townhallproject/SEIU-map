const initialState = {
  allEvents: [],
};

const eventsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_EVENTS':
      return {
        ...state,
        allEvents: [...state.allEvents, ...action.events],
      };
    default:
      return state;
  }
};

export default eventsReducer;
