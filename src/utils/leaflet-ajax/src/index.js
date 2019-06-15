import * as L from 'leaflet';

const ajax = require('./ajax');

L.GeoJSON.AJAX = L.GeoJSON.extend({
  defaultAJAXparams: {
    dataType: 'json',
    callbackParam: 'callback',
    local: false,
    middleware(f) {
      return f;
    },
  },
  initialize(url, options) {
    this.urls = [];
    if (url) {
      if (typeof url === 'string') {
        this.urls.push(url);
      } else if (typeof url.pop === 'function') {
        this.urls = this.urls.concat(url);
      } else {
        options = url;
        url = undefined;
      }
    }
    let ajaxParams = L.Util.extend({}, this.defaultAJAXparams);

    for (let i in options) {
      if (this.defaultAJAXparams.hasOwnProperty(i)) {
        ajaxParams[i] = options[i];
      }
    }
    this.ajaxParams = ajaxParams;
    this._layers = {};
    L.Util.setOptions(this, options);
    this.on('data:loaded', function () {
      if (this.filter) {
        this.refilter(this.filter);
      }
    }, this);
    let self = this;
    if (this.urls.length > 0) {
      new Promise(((resolve) => {
        resolve();
      })).then(() => {
        self.addUrl();
      });
    }
  },
  clearLayers() {
    this.urls = [];
    L.GeoJSON.prototype.clearLayers.call(this);
    return this;
  },
  addUrl(url) {
    let self = this;
    if (url) {
      if (typeof url === 'string') {
        self.urls.push(url);
      } else if (typeof url.pop === 'function') {
        self.urls = self.urls.concat(url);
      }
    }
    let loading = self.urls.length;
    let done = 0;
    self.fire('data:loading');
    self.urls.forEach((url) => {
      if (self.ajaxParams.dataType.toLowerCase() === 'json') {
        ajax(url, self.ajaxParams).then(function (d) {
          var data = self.ajaxParams.middleware(d);
          self.addData(data);
          self.fire('data:progress', data);
        }, function (err) {
          self.fire('data:progress', {
            error: err
          });
        });
      } else if (self.ajaxParams.dataType.toLowerCase() === 'jsonp') {
        L.Util.jsonp(url, self.ajaxParams).then(function (d) {
          var data = self.ajaxParams.middleware(d);
          self.addData(data);
          self.fire('data:progress', data);
        }, function (err) {
          self.fire('data:progress', {
            error: err
          });
        });
      }
    });
    self.on('data:progress', () => {
      if (++done === loading) {
        self.fire('data:loaded');
      }
    });
  },
  refresh(url) {
    url = url || this.urls;
    this.clearLayers();
    this.addUrl(url);
  },
  refilter(func) {
    if (typeof func !== 'function') {
      this.filter = false;
      this.eachLayer((a) => {
        a.setStyle({
          stroke: true,
          clickable: true
        });
      });
    } else {
      this.filter = func;
      this.eachLayer((a) => {
        if (func(a.feature)) {
          a.setStyle({
            stroke: true,
            clickable: true
          });
        } else {
          a.setStyle({
            stroke: false,
            clickable: false
          });
        }
      });
    }
  },
});
L.Util.Promise = Promise;
L.Util.ajax = ajax;
L.Util.jsonp = require('./jsonp');

L.geoJson.ajax = function (geojson, options) {
  return new L.GeoJSON.AJAX(geojson, options);
};

export default L;
