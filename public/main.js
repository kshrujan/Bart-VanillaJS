var startStation = $("#startStation");
var endStation = $("#endStation");
var sideBar = $("#sidebarId");
var submit = $("#formSubmit");
var tableDiv = $("#tableDiv");
var table = $("#scheduleTable tbody");
var timeRemaining = $("#time");
var timeRemainingDiv = $("#timeBeforeNextTrain");
var welcomeBanner = $("#welcomeBanner");

//global vars
var firstAvailableTrain = "";
var departureStationData = {};
var arrivalStationData = {};

//window based functions
window.onload = event => {
    if(localStorage.getItem("visit")) {
        let visits = parseInt(localStorage.getItem("visit"));
        visits+=1;
        localStorage.setItem("visit", visits);
    } else {
        localStorage.setItem("visit", 0);
    }

    //set the banner
    if(parseInt(localStorage.getItem("visit"), 10) > 0) {
        welcomeBanner.html("Welcome Back! Visits: " + localStorage.getItem("visit"));
    } else {
        welcomeBanner.html("Welcome!");
    }
    //get the list of stations
    $.get("/stations", function(data) {
        let stationData = data["root"]["stations"]["station"];
        $.each(stationData, (index) => {
            startStation.append($("<option></option>").attr("value",stationData[index]["abbr"]).text(stationData[index]["name"]));
            endStation.append($("<option></option>").attr("value",stationData[index]["abbr"]).text(stationData[index]["name"]));
        });
    });

};

setInterval(() =>{
    if(startStation.val() !== "Select" && endStation.val() !== "Select") {
        setSchedule();
    }
}, 30000);

var trainTimer = (seconds) => setInterval(function() {
    if(timeRemaining !== "") {
        seconds--;
        if(seconds < 0) {
            clearInterval(trainTimer);
        } else {
            timeRemaining.text(seconds);
        }
    }
}, 1000);

// //add on change listener
endStation.on('change', (event) => {
    let value = event.target.value;

    $.get("/station?source="+value, (data) => {
        //set departureStationData
        arrivalStationData["lat"] = data["root"]["stations"]["station"]["gtfs_latitude"];
        arrivalStationData["long"] = data["root"]["stations"]["station"]["gtfs_longitude"];
    });
});


function setDirectionsInMap() {
    //create start and end LatLng
    let start = new google.maps.LatLng(departureStationData["lat"], departureStationData["long"]);
    let end = new google.maps.LatLng(arrivalStationData["lat"], arrivalStationData["long"]);

    var request = {
        origin: start,
        destination: end,
        travelMode: 'TRANSIT',
        transitOptions: {
            modes:['TRAIN']
        }
    }

    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
          directionsDisplay.setDirections(result);
        }
    });
}
//add on change listener
startStation.on('change', (event) => {
    // define value
    let value = event.target.value;

    //define map
    let stationInfoMap = {
        "name": "Name",
        "gtfs_latitude": "Latitude",
        "gtfs_longitude": "Longitude",
        "address": "Address",
        "city": "City",
        "county" :"County",
        "state": "State",
        "zipcode": "Zip Code",
        "intro": "Intro"
    }

    if(value !== "Select") {
        let htmlString = "<h2>Departure Station Info: </h2>";
        //make a call to the API to get station details
        $.get("/station?source="+value, (data) => {
            // //set departureStationData
            departureStationData["lat"] = data["root"]["stations"]["station"]["gtfs_latitude"];
            departureStationData["long"] = data["root"]["stations"]["station"]["gtfs_longitude"];

            let stationData = data["root"]["stations"]["station"];
            //loop through the stationInfoMap
            for(let key in stationInfoMap) {
                let finalString = "<div><b>"

                //append field name
                finalString = finalString.concat(stationInfoMap[key] + ": </b><span>");

                //get current val
                let val = "";
                if(key === "intro") {
                    val = stationData[key]["__cdata"];
                } else {
                    val = stationData[key];
                }

                finalString += val + "</span></div>";
                htmlString+=finalString;
            }

            //set the innerHTML
            sideBar.html(htmlString);
        })
    } else {
        //set the innerHTML
        sideBar.html("");
    }
});

//add event listener to the submit button
submit.on('click', () => {
    setSchedule();
});

setSchedule = () => {
    //get the departure and arrival station
    let departureStation = startStation.val();
    let arrivalStation = endStation.val();

    //make the call to get the valid schedule
    let rows = "";
    table.html('<tr><th>Departure Time</th><th>Fare</th><th>Time of Arrival</th></tr>');
    $.get('/trips?source='+departureStation+'&dest='+arrivalStation, (data) => {
        let scheduleData = data["root"]["schedule"]["request"]["trip"];
        $.each(scheduleData, (index)=> {
            let row = "";
            if(index === 0) {
                row = "<tr class='row first'>";
            } else {
                row = "<tr class='row'>";
            }
        
            //set departure time
            row+="<td>"+scheduleData[index]["origTimeMin"]+"</td>";

            //set fare
            row+="<td>$"+scheduleData[index]["fares"]["fare"]["amount"]+"</td>";

            //set arrival time
            if(index === 0) {
                //set the fistArrivalTime
                firstAvailableTrain = scheduleData[index]["origTimeMin"];
            }
            row+="<td>"+scheduleData[index]["destTimeMin"]+"</td>";

            //close row
            row+="</tr>";
            rows+=row;
        });

        //set the inner div html
        timeRemainingDiv.show();
        tableDiv.show();
        setDepartureTrainTimeInSeconds();
        startTimer();
        table.append(rows);
        setDirectionsInMap();
    })
}

setDepartureTrainTimeInSeconds = () => {
    //now
    let date = new Date();
    let now = date.getHours() + ":" + date.getMinutes();
    let splitNow = now.split(":");
    if(parseInt(splitNow[0], 10) > 12) {
        splitNow[0] = (parseInt(splitNow[0], 10) - 12).toString();
    }
    now = splitNow.join(':');
    
    //seconds diff
    let nowSeconds = convertTimeToSeconds(now);
    let firstAvailableTrainSeconds = convertTimeToSeconds(firstAvailableTrain);
    let diff = firstAvailableTrainSeconds - nowSeconds;

    timeRemaining.text(diff);
}

startTimer = () => {
    let seconds = parseInt(timeRemaining.text(), 10);
    trainTimer(seconds);
}

convertTimeToSeconds = (timeString) => {
    if(timeString.includes("AM") || timeString.includes("PM")) {
        timeString = timeString.replace("AM", "");
        timeString = timeString.replace("PM", "");
    }
    //split timeString
    let split = timeString.split(":");

    //calculate in seconds
    let seconds = split[0] * 60 * 60 + split[1] * 60;
    return seconds;
}