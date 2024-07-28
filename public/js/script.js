const socket = io();

let lat
let lng

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};



if (navigator.geolocation) {
  navigator.geolocation.watchPosition(successCallback, errorCallback, options);
}

function successCallback(position) {
    lat=position.coords.latitude
    lng=position.coords.longitude
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    socket.emit("send-location",{latitude,longitude});
}

function errorCallback(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      fetch("https://ipapi.co/json/")
        .then((response) => response.json())
        .then((data) => {
          console.log(
            `Fallback location: ${data.city}, ${data.region}, ${data.country}`
          );
        })
        .catch((fallbackError) => {
          console.error("Fallback geolocation error:", fallbackError);
        });
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:"Open Street map"
    
}).addTo(map)


const marker={}

socket.on('recieve-location',(data)=>{
    const {id,latitude,longitude}=data;
    console.log(latitude,longitude);
    map.setView([latitude,longitude])
    if(marker[id]){
        L.Routing.control({
            waypoints: [
                L.latLng(lat,lng),
                L.latLng(latitude,longitude)
            ],
            routeWhileDragging: true
        })
    }else{
        // marker[id].setLatLng([latitude,longitude]);
        marker[id]=L.Routing.control({
            waypoints: [
                L.latLng(lat,lng),
                L.latLng(latitude,longitude)
            ],
            routeWhileDragging: true
        }).addTo(map);
    }
    
    
})

socket.on("user-disconnect",(id)=>{
    if(marker[id]){
        map.removeLayer(marker[id]);
        delete marker[id];
    }
})
