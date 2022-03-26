mapboxgl.accessToken = mapToken;
const dndmap = new mapboxgl.Map({
  container: 'dndmap',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-84.5125, 39.2015],
  zoom: 9,
});

const marker = new mapboxgl.Marker()
  .setLngLat([-84.511027, 39.100662])
  .setPopup(
    new mapboxgl.Popup().setHTML(
      '<h3>Mercantile Library</h3><p><a href="https://desolate-atoll-68731.herokuapp.com/people/5fb5549cce40b100177a1df3">Jessica Duncan</a></p><p><a href="https://desolate-atoll-68731.herokuapp.com/people/5fb5552cce40b100177a1df6">Reginald Osiris</a></p><p><a href="https://desolate-atoll-68731.herokuapp.com/people/5fb554fcce40b100177a1df5">Jane Branigan</a></p><p><a href="https://desolate-atoll-68731.herokuapp.com/people/5fb55556ce40b100177a1df7">Parking Lot Victim</a></p>'
    )
  )
  .addTo(dndmap);

var nav = new mapboxgl.NavigationControl();
dndmap.addControl(nav, 'top-right');

console.log(marker.getPopup()); // return the popup instance

dndmap.on('load', function () {
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  dndmap.addSource('dndpeople', {
    type: 'geojson',
    // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
    data: dndpeople,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  dndmap.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'dndpeople',
    filter: ['has', 'point_count'],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      'circle-color': [
        'step',
        ['get', 'point_count'],
        'yellow',
        7,
        'orange',
        20,
        'red',
      ],
      'circle-radius': ['step', ['get', 'point_count'], 15, 7, 20, 20, 30],
    },
  });

  dndmap.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'dndpeople',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
  });

  dndmap.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'dndpeople',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': 11,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  });

  // inspect a cluster on click
  map.on('click', 'clusters', function (e) {
    var features = dndmap.queryRenderedFeatures(e.point, {
      layers: ['clusters'],
    });
    var clusterId = features[0].properties.cluster_id;
    dndmap
      .getSource('people')
      .getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) return;

        dndmap.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  dndmap.on('click', 'unclustered-point', function (e) {
    const { popUpMarkup } = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    // var mag = e.features[0].properties.mag;
    // var tsunami;

    // if (e.features[0].properties.tsunami === 1) {
    //   tsunami = 'yes';
    // } else {
    //   tsunami = 'no';
    // }

    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popUpMarkup)
      .addTo(dndmap);
  });

  dndmap.on('mouseenter', 'clusters', function () {
    dndmap.getCanvas().style.cursor = 'pointer';
  });
  dndmap.on('mouseleave', 'clusters', function () {
    dndmap.getCanvas().style.cursor = '';
  });
});
