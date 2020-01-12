var TelldusAPI = require("./node_modules/telldus-live/telldus-live.js");
const NodeHelper = require("node_helper");
var _  = require('underscore');

module.exports = NodeHelper.create({
    // Subclass start method.
    start: function () {
        this.config = {};
        this.fetcherRunning = false;
        var status = [];
        var cloud = '';
        var allDev = [];
    },

    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        if (notification === "CONFIG") {
            console.log("Telldus config received!");
            this.config = payload;

            if (!this.fetcherRunning) {
                console.log("Telldus sent fetch");
                this.fetchStatus();
            }

            if (this.status) {
                console.log("Sent socker notification");
                this.sendSocketNotification('STATUS', this.status);
            }
        }
    },

    /**
     * fetchStatus
     *
     */
    fetchStatus: function () {
        var self = this;
        this.fetcherRunning = true;

        cloud = TelldusAPI.TelldusAPI({publicKey: this.config.publicKey, privateKey: this.config.privateKey});
        cloud.login(this.config.token, this.config.tokenSecret, function (err, user) {
            if (!!err) {
                return console.log('login error: ' + err.message);
            }

            // Get list of all devices. Use async call to avoid blocking
            var devicesPromise = new Promise(function (resolve) {
                cloud.getDevices(function (err, devices) {
                    if (!!err) {
                        return console.log('getDevices: ' + err.message);
                    }

                    var allDevices = [];

                    for (var i = 0; i < devices.length; i++) {
                        allDevices.push({id: devices[i].id, name: devices[i].name, status: devices[i].status});
                    }
                    
                    resolve(allDevices);
                });
            });

            // Get all sensors
            var sensorsPromise = new Promise(function(resolve) {
                if (self.config.sensors != null) {
                    var includeIgnored = self.config.sensors.includeIgnored != null ? self.config.sensors.includeIgnored : 0;
                    var showAllSensors = self.config.sensors.showAll != null ? self.config.sensors.showAll : 1;
                    
                    cloud.getSensors({includeIgnored: includeIgnored, includeValues: 1, includeScale: 1, includeUnit: 1}, function(err, sensors) {
                        if (!!err){
                            return console.log('getSensors: ' + err.message);
                        }

                        var allSensors = [];

                        _.each(sensors, function (sensor) {
                            var sensorToShow = false;
                            
                            // Get selected sensors (sensorsToShow set in config)
                            if (self.config.sensors.sensorsToShow != null) {
                                var selectedDataToShow = [];
                                
                                sensorToShow = _.any(self.config.sensors.sensorsToShow, function(sensorToShowConfig) {
                                    if (sensor.name != null && sensorToShowConfig.name.toLowerCase() == sensor.name.toLowerCase()) {
                                        
                                        // Get selected sensor data
                                        _.each(sensor.data, function(sensorData) {
                                            if (_.contains(sensorToShowConfig.data, sensorData.name)) {
                                                selectedDataToShow.push(sensorData);
                                            }
                                        });
                                        
                                        // Replace data array
                                        sensor.data = selectedDataToShow;
										sensor.title = sensorToShowConfig.title;
										sensor.sort = sensorToShowConfig.sort;
                                        
                                        // Mark sensor as selected
                                        return true;
                                    }
                                });
                            }
                            
                            if (sensor.data.length == 0) {
                                console.log("Telldus, no sensor data for \"" + sensor.name + "\"");
                            }
                                                        
                            // Add sensor to list
                            if (showAllSensors || sensorToShow) {
                                allSensors.push({id: sensor.id, name: sensor.name, data: sensor.data, title: sensor.title, sort: sensor.sort});
                            }
                        });
                        
                        if (allSensors.length == 0) {
                            console.log("Telldus, could not get any sensors. Is the config correct?");
                        }
                        
                        resolve(allSensors);
                    });
                } else {
                    // Skip sensors
                    resolve(null);
                }
            });

            // Reset timer for next fetch
            Promise.all([devicesPromise, sensorsPromise]).then(function(values) {
                self.sendSocketNotification('STATUS', values);

                setTimeout(function () {
                    self.fetchStatus();
                }, self.config.updateInterval);
            });
        }).on('error', function (err) {
            console.log('background error: ' + err.message);
        });


    }
});
