const { List } = require('immutable');

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

function distance(lat1, lon1, lat2, lon2) {
    var R = 6378137; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}

function distanceBetweenPoints(latlng1, latlng2) {
  // const line = new ol.geom.LineString([
  //   [latlng1.lng, latlng1.lat],[latlng2.lng, latlng2.lat]
  // ]);
 return distance(latlng1.lat, latlng1.lng, latlng2.lat, latlng2.lng); 
}

exports.getTime = (tracks) => {
  return List(tracks)
    .flatMap (track => {
      return List(track.segments).flatMap (segment => {
        const s = List(segment)
        if(s.size > 1) {
          return s
            .pop()
            .zip(s.shift())
            .map((p) => {
              return (Date.parse(p[1].time) - Date.parse(p[0].time))
            })
        } else {
          return List.of(0)
        }
      })
    })
    .reduce((total, value) => total + value)

//    time = 
//    time = Math.round(Math.round(time / 1000 / 60) / 60) + ":" + (Math.round(time / 1000 / 60) % 60)
}

exports.getDistance = (tracks) => {
  const points = List(tracks)
    .flatMap (track => {
      return List(track.segments).flatMap (segment => {
        return List(segment).map ( point =>{
          return {
            lng: point.lon,
            lat: point.lat,
          }
        })
      })
    })

  let distance = 0
  let i
  for(i = 0; i < points.size - 1; i++) {
    distance = distance + distanceBetweenPoints(points.get(i), points.get(i + 1))
   // time = time + Math.abs(points.get(i+1).tm - points.get(i).tm)
  }

  //distance = Math.round(distance / 100) / 10
  return distance
}

exports.getUphill = (tracks) => {
  const points = List(tracks)
    .flatMap (track => {
      return List(track.segments).flatMap (segment => {
        return List(segment).map ( point =>{
          return point.elevation
        })
      })
    })
    .filter (el => el > 0)

  let uphill = 0
  let i
  let j = 0
  for(i = 0; i < points.size - 1; i++) {
    if (Math.abs(points.get(i + 1) - points.get(j)) > 20) {
      if (points.get(i + 1) > points.get(j))
        uphill = uphill + (points.get(i + 1) - points.get(i))
      j = i
    }

  }
  
  uphill = Math.round(uphill * 100) / 100
  return uphill
}