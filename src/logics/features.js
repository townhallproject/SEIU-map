class Point {
  constructor(townHall) {
    this.type = 'Feature';
    this.geometry = {
      coordinates: [Number(townHall.lng), Number(townHall.lat)],
      type: 'Point',
    };
    this.properties = {
      address: townHall.address,
      addressLink: `https://www.google.com/maps?q=${escape(townHall.address)}`,
      date: townHall.date || null,
      displayName: townHall.displayName,
      district: townHall.district,
      icon: townHall.iconFlag,
      id: townHall.id || null,
      state: townHall.state || null,
      time: townHall.time || null,
      title: townHall.eventName,
      url: townHall.url || null,
      venue: townHall.Location || '',
    };
  }
}

export default Point;
