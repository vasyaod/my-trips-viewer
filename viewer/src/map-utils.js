drawTrackData(map) {
  if (!map.loaded())
    return

  const coordinates = this.props.points.map(p => {
    return [p.lng, p.lat]
  }).toArray()

  const data = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        'geometry': {
          'type': 'LineString',
          'coordinates': coordinates
        }
      }
    ]
  }
  
  const polylineId = "polyLine"
  const polylineColor1 = "#3379c3"
  const polylineColor2 = "#00b3fd"

  if (map.getSource(polylineId) == null){
    map.addSource(polylineId, {
      type: 'geojson',
      data: data
    });
  }

  if (map.getLayer(polylineId) == null){
    map.addLayer({
      "id": polylineId + "-2",
      "type": "line",
      "source": polylineId,
      "layout": {
        "line-cap": "round"
      },
      "paint": {
        "line-color": polylineColor1,
        "line-opacity": 0.8,
        "line-width": 7
        }
    });

    map.addLayer({
      "id": polylineId,
      "type": "line",
      "source": polylineId,
      "layout": {
        "line-cap": "round"
      },
      "paint": {
        "line-color": polylineColor2,
        "line-opacity": 0.9,
        "line-width": 5
        }
    });
  }

  map.getSource(polylineId).setData(data)

  var bounds = coordinates.reduce(function(bounds, p) {
    return bounds.extend(p);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
     
  map.fitBounds(bounds, {
    padding: 30,
    linear: true
  })
}

drawObjects() {

//    if (!this.map.loaded())
    //return

  const map = this.map

  if (this.markers) {
    this.markers.forEach(marker => marker.remove())
  }

  // add markers to map
  this.markers = this.props.objects.map( (obj, index) => {
    // create a DOM element for the marker
    var el = document.createElement('div');
    el.className = 'marker play2 button';
    el.style.backgroundImage =`url(images/${obj.img}/circle-thumb-32.png)`;
    el.style.width = '32px';
    el.style.height = '32px';

    el.addEventListener('click', () => {
      this.setState({obj: obj, objIndex: index})
    });

    // add marker to map
    return (new mapboxgl.Marker(el)
      .setLngLat([obj.lng, obj.lat])
      .addTo(map))
  });
}