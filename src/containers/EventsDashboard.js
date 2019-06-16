/* globals location */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  getEventsFilteredByCandidateArray,
  getEventsNearSearchLocation,
} from '../state/events/selectors';
import { startSetEvents } from '../state/events/actions';

import {
  getDistance,
  getLocation,
  getSearchType,
  getDistrict,
  getSelectedState,
} from '../state/selections/selectors';
import * as selectionActions from '../state/selections/actions';

import MapView from '../components/EventMap';

import SearchBar from './SearchBar';
import SideBar from './SideBar';

class EventsDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.renderMap = this.renderMap.bind(this);
    this.state = {
      init: true,
    };
  }

  componentDidMount() {
    const {
      getInitialEvents,
    } = this.props;
    getInitialEvents()
      .then((returned) => {
        if (this.state.personFilter) {
          this.props.setFilters(this.state.personFilter);
          this.setState({ personFilter: null });
        } else {
          this.props.setInitialFilters(returned);
        }
        this.setState({ init: false });
      });
  }

  searchHandler(value) {
    const {
      query,
    } = value;
    const {
      resetSelections,
      resetSearchByZip,
      resetSearchByQueryString,
      searchByZip,
      setUsState,
    } = this.props;

    resetSearchByQueryString();

    if (!query) {
      return resetSelections();
    }
    if (SearchBar.isZipCode(query)) {
      return searchByZip(value);
    }
    if (SearchBar.isState(query)) {
      resetSearchByZip();
      return setUsState(SearchBar.isState(query).USPS);
    }
    return resetSelections();
  }

  renderMap() {
    const {
      distance,
      center,
      setLatLng,
      resetSelections,
      selectedUsState,
      searchType,
      eventsFilteredByCandidate,
      searchByQueryString,
    } = this.props;

    return (<MapView
      items={eventsFilteredByCandidate}
      center={center}
      selectedUsState={selectedUsState}
      type="events"
      resetSelections={resetSelections}
      setLatLng={setLatLng}
      distance={distance}
      searchType={searchType}
      searchByQueryString={searchByQueryString}
    />);
  }

  render() {
    const {
      center,
      eventsNearSearchLocation,
      resetSelections,
    } = this.props;

    if (this.state.init) {
      return null;
    }
    return (
      <div className="events-container main-container">
        <h2 className="dash-title">Event Dashboard</h2>
        <SearchBar mapType="event" />
        <SideBar
          items={eventsNearSearchLocation}
          type="events"
          resetSelections={resetSelections}
          location={center}
        />
        {this.renderMap()}
        <div className="footer" />
      </div>

    );
  }
}

const mapStateToProps = state => ({
  center: getLocation(state),
  distance: getDistance(state),
  district: getDistrict(state),
  eventsFilteredByCandidate: getEventsFilteredByCandidateArray(state),
  eventsNearSearchLocation: getEventsNearSearchLocation(state),
  searchType: getSearchType(state),
  selectedUsState: getSelectedState(state),
});

const mapDispatchToProps = dispatch => ({
  getInitialEvents: () => dispatch(startSetEvents()),
  resetSearchByQueryString: () => dispatch(selectionActions.resetSearchByQueryString()),
  resetSearchByZip: () => dispatch(selectionActions.resetSearchByZip()),
  resetSelections: () => dispatch(selectionActions.resetSelections()),
  resetSelectionsExceptState: () => dispatch(selectionActions.resetSelectionsExceptState()),
  searchByQueryString: val => dispatch(selectionActions.searchByQueryString(val)),
  searchByZip: zipcode => dispatch(selectionActions.getLatLngFromZip(zipcode)),
  setFilters: filters => dispatch(selectionActions.setFilters(filters)),
  setInitialFilters: events => dispatch(selectionActions.setInitialFilters(events)),
  setLatLng: val => dispatch(selectionActions.setLatLng(val)),
  setRefCode: code => dispatch(selectionActions.setRefCode(code)),
  setUsState: usState => dispatch(selectionActions.setUsState(usState)),
});

EventsDashboard.propTypes = {
  center: PropTypes.shape({ LAT: PropTypes.string, LNG: PropTypes.string, ZIP: PropTypes.string }),
  distance: PropTypes.number.isRequired,
  eventsFilteredByCandidate: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  eventsNearSearchLocation: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  getInitialEvents: PropTypes.func.isRequired,
  resetSearchByQueryString: PropTypes.func.isRequired,
  resetSearchByZip: PropTypes.func.isRequired,
  resetSelections: PropTypes.func.isRequired,
  searchByQueryString: PropTypes.func.isRequired,
  searchByZip: PropTypes.func.isRequired,
  searchType: PropTypes.string.isRequired,
  selectedUsState: PropTypes.string,
  setFilters: PropTypes.func.isRequired,
  setInitialFilters: PropTypes.func.isRequired,
  setLatLng: PropTypes.func.isRequired,
  setUsState: PropTypes.func.isRequired,
};

EventsDashboard.defaultProps = {
  center: null,
  selectedUsState: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsDashboard);
