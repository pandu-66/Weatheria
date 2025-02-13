const express = require("express");
const path = require("path");
const axios = require("axios");
const { json } = require("stream/consumers");
require("dotenv").config();
const app = express();
const port = 3000;

//API Details
const apiKey = process.env.API_KEY;
const units = ["metric", "fahrenheit"];

//ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//public
app.use(express.static(path.join(__dirname, "public")));


app.get('/home.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'public', 'home.js'));
  });

//parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.get("/", async(req,res)=>{
    try{
        let initData = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=Vadodara&appid=${apiKey}&units=metric`);
        let forecastData = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=22.29941&lon=73.20812&appid=${apiKey}&units=metric`);
        res.render("home.ejs",{city: "Vadodara,India", object: initData.data, forecast: forecastData.data.list});
    }catch(err){
        res.render("error.ejs");
    }

});

app.get("/search", async (req, res)=>{
    const {city} = req.query;

    try{
        let a = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city.split(",")[0]}`);
        const coordinates = [a.data.results[0].latitude, a.data.results[0].longitude];
        let weatherData = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${apiKey}&units=metric`);
        let forecastData = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${apiKey}&units=metric`);
        
        res.render("home.ejs",{city, object: weatherData.data, forecast: forecastData.data.list});
    }catch(err){
        res.render("error.ejs");
    }
    
});

app.get("/history", async (req, res)=>{
    res.render("history.ejs");
});

//Start Server
app.listen(port, ()=>{
    console.log("Server Running at http://localhost:3000/");
});

