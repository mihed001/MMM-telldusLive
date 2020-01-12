
# MMM-telldusLive
Magic Mirror Module that displays the device status from your Telldus Live account
For now, only the status of on or off i displayed. 

Before Starting
---------------
You will need a Telldus Live account and OAuth tokens:

- To get a Telldus Live account, go to [login.telldus.com](https://login.telldus.com)

- Once you have a Telldus Live account, go to [api.telldus.com](http://api.telldus.com/keys/index) and _Generate a private token for my user only_.


## Installation

In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/kimlood/MMM-telldusLive.git
````

Navigate into to the folder and execute npm to install the node dependencies. 
````
npm install
````


Configure the module in your `config/config.js` file.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
		   {
			module: 'MMM-telldusLive',
			header: 'My Home',
			position: 'top_right', 
			config: {
				publicKey: '<public_key>', 
				privateKey: '<private_key>', 
				token: '<token>', 
				tokenSecret: '<token_secret>',
				devices: {
					includeIgnored: <bool>,
					showAll: <bool>,
					devicesToShow: <object>
				} 
				sensors: {
					includeIgnored: <bool>,
					showAll: <bool>,
					oneRow: <bool>,
					showDataFullNames: <bool>,
					hideDataNames: <bool>,
					hideDataIcons: <bool>,
					sensorsToShow: <object>
				} 
			}
]
````
### Sensors
Show sensors on the MagicMirror.

#### Description
Sensors = The actual unit (Outdoor, Living room...)  
Title = If you want to replace the sensor name with a different name/title
Data = Data on the unit (temperature, wind speed...)
Sort = Sort order

#### Configuration options
Option | Description
------------ | -------------
includeIgnored|Show ignored sensors  **Default:** `0`
showAll|Show all sensors and data  **Default:** `1`
oneRow|Show all data behind the sensor name, on one row. **Default:** `0`
showDataFullNames|Show full names of data, otherwise short words.  Works only if `hideDataNames = 0`. **Default:** `0`
hideDataNames|`hideDataNames = 0` will display the data names ("Temperature: 21°C").  `hideDataNames = 1` will only display data values.  **Default:** `0`
hideDataIcons|Hide icons infront of data values. **Default:** `0`
sensorsToShow|Select which sensors and data are displayed. Works only if `showAll = 0`. **Default:** `null`

#### Syntax  
````
sensorsToShow: [
	{name: "Outdoor", title: "Utomhus", data: ["wdir", "temp"], sort 1}, 
	{name: "Living room", title: "Vardagsrum", data: ["temp"], sort: 2}
]
````

#### Sensor data explanation
dewp = Dew point (sv. Daggpunkt)  
wdir = Wind direction (sv. Vindrikning)  
temp = Temperature (sv. Temperatur)  
barpress = Atmospheric pressure (sv. Lufttryck)  
humidity = Humidity (sv. Luftfuktighet)  
wavg = Wind speed, avarage (sv. Vindhastighet medel)  
wgust = Wind speed, gust (sv. Byvind)
watt = Energy consumption (sv. kWh)

To remove sensors from the MagicMirror, simply remove the sensors-section in the config.

## Dependencies
- [telldus-live](https://github.com/TheThingSystem/node-telldus-live) (installed via `npm install`)
