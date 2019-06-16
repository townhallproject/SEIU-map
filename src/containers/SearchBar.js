import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { find } from 'lodash';
import states from '../data/states';
import * as selectionActions from '../state/selections/actions';

import {
  getDistance,
  getLocation,
  getSearchType,
  getSelectedNames,
} from '../state/selections/selectors';
import { getCurrentCandidateNames } from '../state/events/selectors';

import SearchInput from '../components/SearchInput';
import DistanceFilter from '../components/DistanceSlider';
import CandidateNameFilters from '../components/CandidateNameFilters';
/* eslint-disable */
require('style-loader!css-loader!antd/es/radio/style/index.css');
/* eslint-enable */

class SearchBar extends React.Component {
  static isZipCode(query) {
    const zipcodeRegEx = /^(\d{5}-\d{4}|\d{5}|\d{9})$|^([a-zA-Z]\d[a-zA-Z] \d[a-zA-Z]\d)$/g;
    return query.match(zipcodeRegEx);
  }

  static isState(query) {
    return find(states, state =>
      state.USPS.toLowerCase().trim() === query.toLowerCase().trim()
    || state.Name.toLowerCase().trim() === query.toLowerCase().trim());
  }

  constructor(props) {
    super(props);
    this.state = {
    };
    this.onTextChange = this.onTextChange.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.distanceHandler = this.distanceHandler.bind(this);
    this.renderFilterBar = this.renderFilterBar.bind(this);
  }

  onTextChange(e) {
    this.props.setTextFilter(e.target.value);
  }

  searchHandler(value) {
    const { query } = value;
    const {
      resetSelections,
      resetSearchByZip,
      resetSearchByQueryString,
      searchType,
      searchByZip,
      setUsState,
    } = this.props;

    resetSearchByQueryString();

    if (!query) {
      return resetSelections();
    }
    if (searchType === 'proximity') {
      if (SearchBar.isZipCode(query)) {
        return searchByZip(value);
      }
      if (SearchBar.isState(query)) {
        resetSearchByZip();
        return setUsState(SearchBar.isState(query).USPS);
      }
    }
    return resetSelections();
  }

  distanceHandler(value) {
    const { setDistance } = this.props;
    return setDistance(value);
  }

  renderFilterBar() {
    const {
      onFilterChanged,
      selectedNames,
      mapType,
      names,
    } = this.props;
    if (mapType === 'group') {
      return null;
    }
    return (
      <div className="input-group-filters">
        <CandidateNameFilters
          names={names}
          onFilterChanged={onFilterChanged}
          selectedNames={selectedNames}
        />
      </div>
    );
  }

  render() {
    const {
      distance,
      mapType,
      searchType,
    } = this.props;
    return (
      <div className="search-bar">
        <SearchInput
          mapType={mapType}
          submitHandler={this.searchHandler}
          searchType={searchType}
        />
        {/* <DistanceFilter
          changeHandler={this.distanceHandler}
          distance={distance}
          hidden={searchType === 'district'}
        /> */}
        {this.renderFilterBar()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  distance: getDistance(state),
  location: getLocation(state),
  names: getCurrentCandidateNames(state),
  searchType: getSearchType(state),
  selectedNames: getSelectedNames(state),
  userSelections: state.selections,
});

const mapDispatchToProps = dispatch => ({
  changeSearchType: searchType => dispatch(selectionActions.changeSearchType(searchType)),
  clearUsState: () => dispatch(selectionActions.clearUsState()),
  onFilterChanged: filters => dispatch(selectionActions.setNameFilter(filters)),
  resetSearchByQueryString: () => dispatch(selectionActions.resetSearchByQueryString()),
  resetSearchByZip: () => dispatch(selectionActions.resetSearchByZip()),
  resetSelections: () => dispatch(selectionActions.resetSelections()),
  searchByQueryString: val => dispatch(selectionActions.searchByQueryString(val)),
  searchByZip: zipcode => dispatch(selectionActions.getLatLngFromZip(zipcode)),
  setDistance: distance => dispatch(selectionActions.setDistance(distance)),
  setTextFilter: text => dispatch(selectionActions.setTextFilter(text)),
  setUsState: usState => dispatch(selectionActions.setUsState(usState)),
});

SearchBar.propTypes = {
  distance: PropTypes.number.isRequired,
  mapType: PropTypes.string.isRequired,
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  resetSearchByQueryString: PropTypes.func.isRequired,
  resetSearchByZip: PropTypes.func.isRequired,
  resetSelections: PropTypes.func.isRequired,
  searchByZip: PropTypes.func.isRequired,
  searchType: PropTypes.string,
  selectedNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  setDistance: PropTypes.func.isRequired,
  setTextFilter: PropTypes.func.isRequired,
  setUsState: PropTypes.func.isRequired,
};

SearchBar.defaultProps = {
  searchType: 'proximity',
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
