const PORT = process.env.PORT || 3000;
var express = require("express");
const fs = require("fs");
var app = express();
const path = require("path");
var axios = require("axios");
var http = require("http");
const { json } = require("express/lib/response");

// Luetaan staattisia tiedostoja public direktorista
app.use(express.static("./public"));

// otetaan EJS käyttöön
app.set("view engine", "ejs");

// Tällä pakotetaan sivupohja tuottamaan sisennettyä, kaunista HTML:ää.
// Tuotantokäytössä asetus voi olla false jolloin sivujen koko pienenee hieman
app.locals.pretty = true;

app.get("/", function(req, res) {
  res.render("pages/index");
})

//////////////////////////////////////

app.get("/lampotilat", function (req, res) {
  // Luodaan AJAX-kysely ja lähetetään pyyntö
  var data = [];
  const promise = axios
    .get("https://iot.fvh.fi/opendata/uiras/uiras2_v1.json")
  // Käsitellään vastaus kun se saapuu
    .then((response) => {
      const tilastot = response.data;

      var sensorienNumerot = Object.keys(tilastot.sensors);
      
      for (var i = 0; i < sensorienNumerot.length; i++) {
        var newItem = {
          paikka: tilastot.sensors[sensorienNumerot[i]].meta.name,
          vedenlampotila: tilastot.sensors[sensorienNumerot[i]].data[tilastot.sensors[sensorienNumerot[i]].data.length-1].temp_water,
          ilmanlampotila: tilastot.sensors[sensorienNumerot[i]].data[tilastot.sensors[sensorienNumerot[i]].data.length-1].temp_air,
          aika: tilastot.sensors[sensorienNumerot[i]].data[tilastot.sensors[sensorienNumerot[i]].data.length-1].time
        };
        data.push(newItem);
      }   
    
      res.render("pages/lampotilat", { json: data });
      
    });
});

///// NOT FOUND SIVU
app.get("*", function (req, res) {
  res.status(404).send("Cannot find the requested page");
});

app.listen(PORT);
