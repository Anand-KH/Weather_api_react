import React, { useEffect, useState } from 'react';
import WeatherCard from './WeatherCard';


function Wheather() {

    const [city, setCity] = useState("Bangalore");
    const [temp, setTemp] = useState({});

    const whetherInfo = async ()=>{
        try{
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.REACT_APP_WEATHER_API}`;

            const res = await fetch(url);
            const data = await res.json();

            const {temp, humidity, pressure} = data.main;
            const {main:weather} = data.weather[0];
            const {name} = data;
            const {country, sunset, sunrise} = data.sys;
            const {speed} = data.wind;

            const weatherinfo={
                temp, humidity, pressure,weather,name,country, sunset,speed,sunrise
            };

            setTemp(weatherinfo);
        }catch(err){console.log(err)};
    };

    useEffect(() => {
        whetherInfo();
    }, []);

    return (
        <>
        <div>
            <div className="container">
                <div className="row search">
                    <div className="col-lg-10 col-md-10 col-sm-12 col-12">
                        <div className="form-group">
                            <input type="seaech" className="form-control" autoFocus value={city} onChange={(e)=>setCity(e.target.value)} placeholder="Search.." />
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-2 col-sm-12 col-12">
                        <button type="button" className="btn btn-primary" onClick={whetherInfo}>Search</button>
                    </div>
                </div>
            </div>
            <WeatherCard tempInfo={temp}/>
        </div>
        </>
    )
}

export default Wheather;
