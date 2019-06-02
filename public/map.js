function initMap() {};

$(() => {
    initMap = function() {
        window.directionsService = new google.maps.DirectionsService();
        window.directionsDisplay = new google.maps.DirectionsRenderer();
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 37.773972, lng: -122.431297},
            zoom: 10
        });
        directionsDisplay.setMap(map);
    }
});
// $(document).ready(function() {
//     function initMap() {
//         window.directionsService = new google.maps.DirectionsService();
//         window.directionsDisplay = new google.maps.DirectionsRenderer();
//         var map = new google.maps.Map(document.getElementById('map'), {
//             center: {lat: 37.773972, lng: -122.431297},
//             zoom: 10
//         });
//         directionsDisplay.setMap(map);
//     }
//     initMap();
// });