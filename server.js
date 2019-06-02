var express = require('express');
var http = require('http');
var app = express();
app.use(express.static("public"));
var server = http.createServer(app);
var request = require('request');
var parser = require('fast-xml-parser');
var port = 8081;

var options = {
    attributeNamePrefix : "",
    // attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : false,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : true,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false,
};


//GET stations
app.get('/stations', function(req,res) {
    request('http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V', (err, result) => {
        let jsonObj = parser.parse(result.body,options);
        res.send(jsonObj);
    });
});

//GET station info
app.get('/station', (req, res) => {
    let stationAbbr = req.query.source;
    request('http://api.bart.gov/api/stn.aspx?cmd=stninfo&orig='+stationAbbr+'&key=MW9S-E7SL-26DU-VV8V', (err, result) => {
        let jsonObj = parser.parse(result.body,options);
        res.send(jsonObj);
    })
});

app.get('/trips', (req,res) => {
    let source = req.query.source;
    let dest = req.query.dest;

    request('http://api.bart.gov/api/sched.aspx?cmd=depart&orig='+source+'&dest='+dest+'&a=4&b=0&key=MW9S-E7SL-26DU-VV8V', (err, result) => {
        let jsonObj = parser.parse(result.body,options);
        res.send(jsonObj);
    });
});

//listen
server.listen(port, function(){
    console.log("API server started on port 8081...");
});