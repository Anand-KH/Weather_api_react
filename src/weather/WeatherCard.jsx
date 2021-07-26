import React, { useEffect, useState } from 'react';
import { WiSunset, WiHail, WiHumidity, WiCloudyWindy, WiCloudy, WiFog, WiDaySunny } from 'react-icons/wi';

function WeatherCard({tempInfo}) {

    const [weatherState, setWeatherState] = useState('');

    const {
        temp, humidity, pressure,weather,name,country, sunset,speed, sunrise
    } = tempInfo;

    // converting to time
    const sec = sunset;
    let date = new Date(sec * 1000);
    let time = `${date.getHours()}:${date.getMinutes()}`;
    
    const srise = sunrise;
    let sdtae = new Date(srise * 1000);
    let sunrisetime = `${sdtae.getHours()}:${date.getMinutes()}`

    useEffect(() => {
        if(weather){
            switch (weather) {
                case "Clouds": 
                    setWeatherState("wi-day-cloudy");
                break;

                case "Haze": 
                    setWeatherState("wi-fog");
                break;

                case "Rain": 
                    setWeatherState("wi-day-rain");
                break;


                case "Clouds": 
                    setWeatherState("wi-day-sunny");
                break;

                case "Mist": 
                    setWeatherState("wi-dust");
                break;
            
                default:
                    setWeatherState("wi-day-sunny");
                break;
            }
        }
    }, [weather]);

    return (
        <>
        <div className="container">
            <div className="card">
                <div className="card-header text-center"><i className={`wi ${weatherState}`}></i> {weather}</div>
                <div className="card-body">
                    <div className="row bg-color">
                        <div className="col-lg-3 col-md-2 col-sm-12 col-12">
                            <h5>{temp}&deg;</h5>
                        </div>
                        <div className="col-lg-5 col-md-6 col-sm-12 col-12">
                            <h5>{name}, {country}</h5>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12 col-12">
                            <p>{new Date().toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="ggr">
                        <div className="text-center">
                            <WiSunset size={30} color="orange" />
                            <p>{time} <br/>Sunset</p>
                        </div>
                        <div className="text-center">
                            <WiSunset size={30} color="orange" />
                            <p>{sunrisetime} <br/>Sunset</p>
                        </div>
                        <div className="text-center">
                            <WiHumidity size={30} color="pink" />
                            <p>{humidity} <br/>Humidity</p>
                        </div>
                        <div className="text-center">
                            <WiHail size={30} color="blue" />
                            <p>{pressure}<br/>Pressure</p>
                        </div>
                        <div className="text-center">
                            <WiCloudyWindy size={30} color="grey" />
                            <p>{speed}<br/>Speed</p>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
        </>
    )
}

export default WeatherCard;
