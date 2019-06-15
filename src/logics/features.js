import moment from 'moment';

class Point {
  constructor(townHall) {
    this.type = 'Feature';
    this.geometry = {
      coordinates: [Number(townHall.lng), Number(townHall.lat)],
      type: 'Point',
    };
    this.properties = {
      address: townHall.address,
      district: townHall.district,
      icon: townHall.iconFlag,
      id: townHall.id || null,
      startsAt: townHall.starts_at ? moment(townHall.starts_at).format('MMMM Do YYYY, h:mm a') : '',
      state: townHall.state || null,
      title: townHall.eventName,
      url: townHall.url || null,
      venue: townHall.Location || '',
    };
  }
}

export default Point;
