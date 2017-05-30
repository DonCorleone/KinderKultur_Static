function initialize() {

  var map1 = new google.maps.Map(document.getElementById("map-canvas-tribschenhorn"), getMapOptionsTribschenhorn());

  var contentString1 = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h4 id="firstHeading" class="firstHeading">Pavillion Tribschenhorn</h4>'+
      '<div id="bodyContent">'+
      '<p>Richard - Wagner - Weg 17<br>6005 Luzern<br>Bus Nr. 6/7/8 Haltestelle Wartegg, dann ca. 5 Min. Fussweg Richtung See</p>'+
      '</div>'+
      '</div>';

  var infowindow1 = new google.maps.InfoWindow({
    content: contentString1 /*,
    maxWidth: 300*/
  });

  var marker1 = new google.maps.Marker({
    position: getStandortTribschenhorn(),
    map: map1,
    title: 'Pavillion Tribschenhorn'
  });
  marker1.addListener('click', function() {
    infowindow1.open(map1, marker1);
  });

  if(document.getElementById('map-canvas-naturmuseum') !== null){
    var map2 = new google.maps.Map(document.getElementById("map-canvas-naturmuseum"), getMapOptionsNaturmuseum());

    var contentString2 = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h4 id="firstHeading" class="firstHeading">Naturmuseum Luzern</h4>'+
        '<div id="bodyContent">'+
        '<p>Kasernenplatz 6<br>6003 Luzern<br>Bus Nr. 2/9/12/18 Haltestelle Kasernenplatz</p>'+
        '</div>'+
        '</div>';

    var infowindow2 = new google.maps.InfoWindow({
      content: contentString2 /*,
      maxWidth: 300*/
    });

    var marker2 = new google.maps.Marker({
      position: getStandortNaturmuseum(),
      map: map2,
      title: 'Naturmuseum Luzern'
    });
    marker2.addListener('click', function() {
      infowindow2.open(map2, marker2);
    });
  }
}

function initialiseModal(){

}

function getStandortNaturmuseum(){
  return  {lat: 47.0516732, lng: 8.3011229};
}

function getMapOptionsNaturmuseum(){
  return {
    center: new google.maps.LatLng(47.0516732,8.3011229),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    scrollwheel: false,
    draggable: true,
    panControl: true,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    overviewMapControl: false,
    rotateControl: false,
  };
}
function getStandortTribschenhorn(){
  return  {lat: 47.0417285, lng: 8.3260751};
}

function getMapOptionsTribschenhorn(){
  return {
    center: new google.maps.LatLng(47.0417285,8.3260751),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    scrollwheel: false,
    draggable: true,
    panControl: true,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    overviewMapControl: false,
    rotateControl: false,
  };
}
function resizeMap() {
   if(typeof map =="undefined") return;
   setTimeout( function(){resizingMap();} , 400);
}

function resizingMap() {
   if(typeof map =="undefined") return;
   var center = map.getCenter();
   google.maps.event.trigger(map, "resize");
   map.setCenter(center);
}
