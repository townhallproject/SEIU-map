import React from 'react';
import PropTypes from 'prop-types';
import geoViewport from '@mapbox/geo-viewport';

import {
  find,
  filter,
  map,
} from 'lodash';
import bboxes from '../data/bboxes';
import Point from '../logics/features';
import states from '../data/states';

import L from '../utils/leaflet-ajax/src';

import MapInset from '../components/MapInset';
import { startSetEvents } from '../state/events/actions';

const maxBounds = [
      [24, -128], // Southwest
      [50, -60.885444], // Northeast
    ];
class MapView extends React.Component {
  constructor(props) {
    super(props);
    this.addPopups = this.addPopups.bind(this);
    this.addClickListener = this.addClickListener.bind(this);
    this.addLayer = this.addLayer.bind(this);
    this.createFeatures = this.createFeatures.bind(this);
    this.updateData = this.updateData.bind(this);
    this.focusMap = this.focusMap.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.toggleFilters = this.toggleFilters.bind(this);
    this.highlightDistrict = this.highlightDistrict.bind(this);
    this.districtSelect = this.districtSelect.bind(this);
    this.removeHighlights = this.removeHighlights.bind(this);
    this.filterForStateInsets = this.filterForStateInsets.bind(this);
    this.insetOnClickEvent = this.insetOnClickEvent.bind(this);
    // this.makeZoomToNationalButton = this.makeZoomToNationalButton.bind(this);
    this.state = {
      alaskaItems: filter(this.props.items, { state: 'AK' }),
      hawaiiItems: filter(this.props.items, { state: 'HI' }),
      inset: !props.selectedUsState,
      popoverColor: 'popover-general-icon',
    };
  }

  componentDidMount() {
    const { items } = this.props;
    const featuresHome = this.createFeatures(items);
    this.initializeMap(featuresHome);
  }

  componentWillReceiveProps(nextProps) {
    const {
      center,
      items,
      distance,
      selectedItem,
      selectedUsState,
      district,
    } = nextProps;
    this.map.metadata = { searchType: nextProps.searchType };

    // Highlight selected item
    if (this.props.selectedItem !== selectedItem) {
      this.map.setFilter('unclustered-point-selected', ['==', 'id', selectedItem ? selectedItem.id : false]);
    }

    if (items.length !== this.props.items.length) {
      this.updateData(items, 'events-points');
      this.filterForStateInsets(items);
    }

    if (selectedUsState) {
      const bbname = selectedUsState.toUpperCase();
      const stateBB = bboxes[bbname];
      return this.focusMap(stateBB);
    }
    if (center.LNG) {
      if (this.state.inset === false) {
        return this.map.fitBounds(this.map.getBounds());
      }
      return this.map.flyTo(
        {
          lat: Number(center.LAT),
          lng: Number(center.LNG),
        },
        9.52 - (distance * (4.7 / 450)),
      );
    }
    console.log('flying to reset')
    return this.map.fitBounds(maxBounds);
  }

  filterForStateInsets(items) {
    const alaskaItems = filter(items, { state: 'AK' });
    const hawaiiItems = filter(items, { state: 'HI' });
    this.setState({
      alaskaItems,
      hawaiiItems,
    });
  }

  insetOnClickEvent(e) {
    this.setState({ inset: false });
    const dataBounds = e.target.parentNode.parentNode.getAttribute('data-bounds').split(',');
    const boundsOne = [Number(dataBounds[0]), Number(dataBounds[1])];
    const boundsTwo = [Number(dataBounds[2]), Number(dataBounds[3])];
    const bounds = boundsOne.concat(boundsTwo);
    this.map.fitBounds(bounds);
  }

  focusMap(bb) {
    if (!bb) {
      return;
    }
    const height = window.innerHeight;
    const width = window.innerWidth;
    const view = geoViewport.viewport(bb, [width / 2, height / 2]);
    if (view.zoom < 2.5) {
      view.zoom = 2.5;
    } else {
      view.zoom -= 0.5;
    }
    this.map.flyTo([view.center[1], view.center[0]], view.zoom);
  }

  updateData(items) {
    const featuresHome = this.createFeatures(items);
    // this.map.fitBounds([[-128.8, 23.6], [-65.4, 50.2]]);
    this.markerLayer.remove();
    this.addLayer(featuresHome);
  }

  createFeatures(items) {
    const featuresHome = {
      features: [],
      type: 'FeatureCollection',
    };
    featuresHome.features = items.reduce((acc, townHall) => {
      const newFeature = new Point(townHall);
      if (townHall.lat) {
        acc.push(newFeature);
      }
      return acc;
    }, []);
    return featuresHome;
  }

  addPopups(layer) {
    const { map } = this;
    const {
      type,
      refcode,
    } = this.props;

    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [layer] });
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

      if (features.length) {
        const feature = features[0];
        const { properties } = feature;
        const linkMapping = {
          events: `<a target="_blank" href=${properties.rsvpHref}${refcode}>rsvp</a>`,
          groups: '',
        };
        this.setState({ popoverColor: `popover-${feature.properties.icon}` });

        return popup.setLngLat(feature.geometry.coordinates)
          .setHTML(`
            <h4>${feature.properties.title}</h4>
            <div>${feature.properties.startsAt}</div>
            ${linkMapping[type]}
            `)
          .addTo(map);
      }
      return undefined;
    });
  }

  districtSelect(feature) {
    if (feature.state) {
      this.highlightDistrict(feature.geoID);
    } else {
      const visibility = this.map.getLayoutProperty('selected-fill', 'visibility');
      if (visibility === 'visible') {
        this.map.setLayoutProperty('selected-fill', 'visibility', 'none');
        this.map.setLayoutProperty('selected-border', 'visibility', 'none');
      }
    }
  }

  toggleFilters(layer, filterSettings) {
    this.map.setFilter(layer, filterSettings);
    this.map.setLayoutProperty(layer, 'visibility', 'visible');
  }

  // Handles the highlight for districts when clicked on.
  highlightDistrict(geoid) {
    let filterSettings;
    // Filter for which district has been selected.
    if (typeof geoid === 'object') {
      filterSettings = ['any'];

      geoid.forEach((i) => {
        filterSettings.push(['==', 'GEOID', i]);
      });
    } else {
      filterSettings = ['all', ['==', 'GEOID', geoid]];
    }
    // Set that layer filter to the selected
    this.toggleFilters('selected-fill', filterSettings);
    this.toggleFilters('selected-border', filterSettings);
  }

  addClickListener() {
    const {
      type,
      setLatLng,
    } = this.props;
    const { map } = this;

    map.on('click', (e) => {
      const { searchType } = this.map.metadata;
      if (searchType === 'proximity') {
        // handle proximity
        const points = map.queryRenderedFeatures(e.point, { layers: [`${type}-points`] });
        // selected a marker
        let formatLatLng;
        if (points.length > 0) {
          const point = points[0];
          formatLatLng = {
            LAT: point.geometry.coordinates[1].toString(),
            LNG: point.geometry.coordinates[0].toString(),
          };
        } else {
          formatLatLng = {
            LAT: e.lngLat.lat.toString(),
            LNG: e.lngLat.lng.toString(),
          };
        }
        setLatLng(formatLatLng);
      } else if (searchType === 'district') {
        const features = map.queryRenderedFeatures(
          e.point,
          {
            layers: ['district_interactive'],
          },
        );
        const feature = {};

        if (features.length > 0) {
          feature.state = features[0].properties.ABR;
          feature.district = features[0].properties.GEOID.substring(2, 4);
          feature.geoID = features[0].properties.GEOID;

        }
      }
    });
  }

  addLayer(featuresHome) {
    const myIcon = L.icon({
      iconUrl: './assets/campaign.svg',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [-3, -76],
    });
    // Set map controls
    function showTooltip({ properties }) {
      const eventInfo = properties;
      return `<div class="text-info map-popup">
                <h4 class="mapbox-popup-title">
                  </span>${eventInfo.displayName}</h4>
                ${eventInfo.venue ? `<p>${eventInfo.venue}</p>` : ''}
                <span>
                  ${eventInfo.repeatingEvent ? `on ${eventInfo.repeatingEvent}` : `${eventInfo.time ? `on ${eventInfo.date} at ${eventInfo.time}` : ''}`}
                </span><br>
                  ${eventInfo.addressLink ?
    `<span><a href="${eventInfo.addressLink}" target="_blank">${eventInfo.address}</a></span>` :
    `${eventInfo.address ?
      `<span>${eventInfo.address}</span>` : ''
    }`}
                </div>`;
    }
    this.markerLayer = L.geoJSON(featuresHome, {
      pointToLayer(geoJsonPoint, latlng) {
        return L.marker(latlng, {
          icon: myIcon,
        }).bindTooltip(showTooltip(geoJsonPoint)).openTooltip();
      },
      style(feature) {
        return {
          color: '#f7ed54',
        };
      },
    });
    this.markerLayer.addTo(this.map);
  }

  removeHighlights() {
    this.map.setLayoutProperty('selected-fill', 'visibility', 'none');
    this.map.setLayoutProperty('selected-border', 'visibility', 'none');
  }

  handleReset() {
    const {
      selectedUsState,
      resetSelections,
    } = this.props;
    this.removeHighlights();
    resetSelections();
    if (!selectedUsState) {
      this.setState({ inset: true });
    }
  }

  // Creates the button in our zoom controls to go to the national view
  // makeZoomToNationalButton() {
  //   const {
  //     selectedUsState,
  //   } = this.props;
  //   document.querySelector('.mapboxgl-ctrl-compass').remove();
  //   if (document.querySelector('.mapboxgl-ctrl-usa')) {
  //     document.querySelector('.mapboxgl-ctrl-usa').remove();
  //   }
  //   const usaButton = document.createElement('button');
  //   usaButton.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-usa';
  //   if (selectedUsState) {
  //     usaButton.innerHTML = `<span>${selectedUsState}</span>`;
  //   } else {
  //     usaButton.innerHTML = '<span class="usa-icon"></span>';
  //   }
  //   usaButton.addEventListener('click', this.handleReset);
  //   document.querySelector('.mapboxgl-ctrl-group').appendChild(usaButton);
  // }

  initializeMap(featuresHome) {
    const { items } = this.props;
    function calculateZoom() {
      const sw = screen.width;
      return sw >= 1700 ? 4.0 :
        sw >= 1600 ? 3.11 :
          3.11;
    }

    function setStyle(state) {
      return {
        color: '#6e6e6e',
        fillColor: '#f6f4f4',
        fillOpacity: 1,
        opacity: 0.2,
        weight: 1,
      };
    }
    const continentalView = function (w, h) {
      // if (stateCoords) {
      //   return geoViewport.viewport(stateCoords, [w, h]);
      // } else {
      return geoViewport.viewport([-128.8, 23.6, -65.4, 50.2], [w, h]);
      // }
    };

    function setStateStyle(state) {
      return {
        color: state.properties.events ? '#fff' : '#fff',
        fillColor: state.properties.events ? '#6e00ff' : '#f6f4f4',
        fillOpacity: 1,
        opacity: 1,
        weight: state.properties.events ? 2 : 0.5,
      };
    }


    const continental = continentalView(window.innerWidth / 2, window.innerHeight / 2);
    this.map = L.map('map', {
      center: [36.900000000000006, -97.10000000000001],
      // attributionControl: false,
      // zoomControl: false,
      zoom: 4,
    });


    function addEventToState(statesGeoJson) {
      statesGeoJson.features.forEach((state) => {
        state.properties.events = find(items, item => item.state === state.properties.ABR);
      });

      return statesGeoJson;
    }


    // this.makeZoomToNationalButton();
    // this.map.dragging.disable();
    // this.map.touchZoom.disable();
    // this.map.doubleClickZoom.disable();
    // this.map.scrollWheelZoom.disable();

    const districtLayer = new L.GeoJSON.AJAX('../data/districts.geojson', {
      // middleware: addMoCsToDistrict,
      style(state) {
        return setStyle(state);
      },
    });

    const stateLayer = new L.GeoJSON.AJAX('../data/states.geojson', {
      middleware: addEventToState,
      style(state) {
        return setStateStyle(state);
      },
    });
    // districtLayer.addTo(this.map);
    stateLayer.addTo(this.map);

    this.addLayer(featuresHome);
  }

  render() {
    const {
      center,
      district,
      type,
      resetSelections,
      refcode,
      setLatLng,
      distance,
      searchType,
      searchByQueryString,
      selectedUsState,
    } = this.props;

    return (
      <React.Fragment>
        <div id="map" className={this.state.popoverColor}>
          <div className="map-overlay" id="legend">
            {/* <MapInset
              items={this.state.alaskaItems}
              selectedUsState={selectedUsState}
              center={center}
              stateName="AK"
              district={district}
              type={type}
              resetSelections={resetSelections}
              refcode={refcode}
              setLatLng={setLatLng}
              distance={distance}
              searchType={searchType}
              searchByQueryString={searchByQueryString}
              mapId="map-overlay-alaska"
              bounds={[[-170.15625, 51.72702815704774], [-127.61718749999999, 71.85622888185527]]}
            />
            <MapInset
              items={this.state.hawaiiItems}
              selectedUsState={selectedUsState}
              stateName="HI"
              center={center}
              district={district}
              type={type}
              resetSelections={resetSelections}
              refcode={refcode}
              setLatLng={setLatLng}
              distance={distance}
              searchType={searchType}
              searchByQueryString={searchByQueryString}
              mapId="map-overlay-hawaii"
              bounds={[
                [-161.03759765625, 18.542116654448996],
                [-154.22607421875, 22.573438264572406]]}
            /> */}
          </div>
        </div>

      </React.Fragment>
    );
  }
}

MapView.propTypes = {
  center: PropTypes.shape({ LAT: PropTypes.string, LNG: PropTypes.string, ZIP: PropTypes.string }),
  distance: PropTypes.number,
  district: PropTypes.number,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  refcode: PropTypes.string,
  resetSelections: PropTypes.func.isRequired,
  searchByQueryString: PropTypes.func.isRequired,
  searchType: PropTypes.string,
  selectedItem: PropTypes.shape({}),
  selectedUsState: PropTypes.string,
  setLatLng: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

MapView.defaultProps = {
  center: {},
  distance: 50,
  district: NaN,
  refcode: '',
  searchType: 'proximity',
  selectedItem: null,
  selectedUsState: null,
};

export default MapView;
