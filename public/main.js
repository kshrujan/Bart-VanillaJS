var startStation = $("#startStation");
var endStation = $("#endStation");
var sideBar = $("#sidebarId");
var submit = $("#formSubmit");

window.onload = event => {
    //get the list of stations
    $.get("http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V&json=y", function(data) {
        let stationData = data["root"]["stations"]["station"];
        $.each(stationData, (index) => {
            startStation.append($("<option></option>").attr("value",stationData[index]["abbr"]).text(stationData[index]["name"]));

            endStation.append($("<option></option>").attr("value",stationData[index]["abbr"]).text(stationData[index]["name"]));
        });
    })
};


//add on change listener
$("#startStation").on('change', (event) => {
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
        $.get("http://api.bart.gov/api/stn.aspx?cmd=stninfo&orig="+value+"&key=MW9S-E7SL-26DU-VV8V&json=y", (data) => {
            let stationData = data["root"]["stations"]["station"];
            //loop through the stationInfoMap
            for(let key in stationInfoMap) {
                let finalString = "<div><b>"

                //append field name
                finalString = finalString.concat(stationInfoMap[key] + ": </b><span>");

                //get current val
                let val = "";
                if(key === "intro") {
                    val = stationData[key]["#cdata-section"];
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
    //get the departure and arrival station
    let departureStation = startStation.val();
    let arrivalStation = endStation.val();

    //make the call to get the valid schedule
    $.get('http://api.bart.gov/api/sched.aspx?cmd=depart&orig='+departureStation+'&dest='+arrivalStation+'&key=MW9S-E7SL-26DU-VV8V&json=y', (data) => {
        console.log(data);
        let scheduleData = data["root"]["schedule"]["request"]["trip"];
        $.each(scheduleData, (index)=> {
            console.log(scheduleData[index]);
        });
    })
});