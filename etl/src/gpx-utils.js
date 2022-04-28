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

exports.distanceBetweenPoints = distanceBetweenPoints

exports.getTime = (tracks) => {
  return tracks
    .flatMap (segments => {
      return segments.flatMap (segment => {
        if(segment.size > 1) {
          return segment
            .pop()
            .zip(segment.shift())
            .map((p) => {
              return (Date.parse(p[1].time) - Date.parse(p[0].time))
            })
        } else {
          return List.of(0)
        }
      })
    })
    .reduce((total, value) => total + value)
}

exports.getPointCount = (tracks) => {
  return tracks
    .flatMap (segments => {
      return segments.map (segment => {
          return segment.size
        }
      )
    })
    .reduce((total, value) => total + value)
}

exports.getDistance = (tracks) => {
  const points = tracks
    .flatMap (segments => {
      return segments.flatMap (segment => {
        return segment.map ( point =>{
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
  const points = tracks
    .flatMap (segments => {
      return segments.flatMap (segment => {
        return segment.map ( point =>{
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
  
  return Math.round(uphill)
}