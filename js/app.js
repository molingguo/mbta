var lineRouteQuery = {
	"Red Line" : "route=931_&route=933_",
	"Orange Line" : "route=903_&route=913_",
	"Blue Line" : "route=946_&route=948_",
	"Green Line-B": "route=810_&route=813_&route=823_",
	"Green Line-C": "route=830_&route=831_",
	"Green Line-D": "route=840_&route=842_&route=851_&route=852_",
	"Green Line-E": "route=880_&route=882_"
};

var routeInfo = [
{
	name: "Red Line",
	id: [931, 933]
}, 
{
	name: "Orange Line",
	id: [903, 913]
}, 
{
	name: "Blue Line",
	id: [946, 948]
},
{
	name: "Green Line-B",
	id: [810, 813, 823]
},
{
	name: "Green Line-C",
	id: [830, 831]
},
{
	name: "Green Line-D",
	id: [840, 842, 851, 852]
},
{
	name: "Green Line-E",
	id: [880, 882]
}
]

(function() {

	var app = angular.module('timeForT', ['angular-loading-bar', 'ui.bootstrap']);

	//TODO: change all tft to $scope
	app.controller('tftController', ['$http', '$scope', function($http, $scope) {
		var tft = this;
		tft.timeByStop = [];
		tft.stopOrange = [];
		tft.stopRed = [];
		tft.stopRedS1 = [];
		tft.stopRedS2 = [];
		tft.stopBlue = [];
		tft.stopCurrent = [];
		tft.stop = "";
		tft.stopID = "";
		tft.lineCurrent ="";
		tft.directions = [];
		tft.currentTime = "";
		tft.errorInfo="";
		tft.directionListClass = "";
		tft.stopGroupClass = "";
		tft.alertInformation = [];
		tft.alert="";

		// Get all ORANGE stops and set the matching array for it.
		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=g9LOuk3V8UO_3zNKijvPmw&route=903_&format=json').success(function(data) {
			var stops = data.direction[0].stop;

			for (i = 0; i < stops.length; i++) {
				var singleStop = {}
				singleStop.stop_id = stops[i].parent_station;
				singleStop.stop_name = stops[i].parent_station_name;
				tft.stopOrange.push(singleStop);
			}
		});

		// Get all RED stops and set the matching array for it.
		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=g9LOuk3V8UO_3zNKijvPmw&route=931_&format=json').success(function(data) {
			var stops = data.direction[0].stop;
			for (i = 0; i < 13; i++) {
				var singleStop = {}
				singleStop.stop_id = stops[i].parent_station;
				singleStop.stop_name = stops[i].parent_station_name;
				tft.stopRed.push(singleStop);
			}
		});

		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=g9LOuk3V8UO_3zNKijvPmw&route=931_&format=json').success(function(data) {
			var stops = data.direction[0].stop;
			for (i = 13; i < stops.length; i++) {
				var singleStop = {}
				singleStop.stop_id = stops[i].parent_station;
				singleStop.stop_name = stops[i].parent_station_name;
				tft.stopRedS1.push(singleStop);
			}
		});

		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=g9LOuk3V8UO_3zNKijvPmw&route=933_&format=json').success(function(data) {
			var stops = data.direction[0].stop;
			for (i = 13; i < stops.length; i++) {
				var singleStop = {}
				singleStop.stop_id = stops[i].parent_station;
				singleStop.stop_name = stops[i].parent_station_name;
				tft.stopRedS2.push(singleStop);
			}
		});

		// Get all BLUE stops and set the matching array for it.
		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=g9LOuk3V8UO_3zNKijvPmw&route=946_&format=json').success(function(data) {
			var stops = data.direction[0].stop;
			for (i = 0; i < stops.length; i++) {
				var singleStop = {}
				singleStop.stop_id = stops[i].parent_station;
				singleStop.stop_name = stops[i].parent_station_name;
				tft.stopBlue.push(singleStop);
			}
		});

		/**
		 *  Line Button Click Functionality
		 */
		tft.setLine = function(activeLine) {
			tft.errorInfo = "";
			tft.stopGroupClass = "";
			switch(activeLine) {
				case 1:
					tft.stopCurrent = tft.stopOrange;
					tft.lineCurrent = "Orange Line";
					tft.stopGroupClass = "stopGroupOrange";
					break;
				case 2:
					tft.stopCurrent = tft.stopRed.concat(tft.stopRedS1).concat(tft.stopRedS2);
					tft.lineCurrent = "Red Line";
					tft.stopGroupClass = "stopGroupRed";
					break;
				case 3:
					tft.stopCurrent = tft.stopBlue;
					tft.lineCurrent = "Blue Line";
					tft.stopGroupClass = "stopGroupBlue";
					break;
				default:
					tft.stopCurrent = [];
			}
		}

		//filter lines by current active line button
		tft.filterLine = function(routes) {
			var result = [];

			result = routes.filter(function(obj) {
				return obj.route_name == tft.lineCurrent;
			});
			return result;
		}

		//Convert seconds to minutes and seconds
		//TODO : add Approaching and Arriving
		tft.convertTime = function(time) {
			var minutes = Math.floor(time/60);
			var seconds = time - minutes * 60;
			var seconds2 = ("0" + seconds).slice(-2);
			if (minutes == 0) {
				if (seconds < 10) {
					return seconds + "s";
				} else {
					return seconds2 + "s";
				}
			} else {
				return minutes + "m " + seconds2 + "s";
			}
		}

		//add color class for stopName
		tft.addStopColor = function() {
			var stopClass = "";
			tft.directionListClass = "";
			switch(tft.lineCurrent) {
				case "Orange Line":
					stopClass="stopOrange";
					tft.directionListClass = "directionListOrange";
					break;
				case "Red Line":
					stopClass="stopRed";
					tft.directionListClass = "directionListRed";
					break;
				case "Blue Line":
					stopClass="stopBlue";
					tft.directionListClass = "directionListBlue";
					break;
				default:
					stopClass="";
			}
			$(".stopName").removeClass('stopOrange stopRed stopBlue');
			$(".stopName").addClass(stopClass);
			$(".stopBlock .time").addClass("currentTime");

		}

		//reset state
		tft.reset = function() {
			tft.timeByStop = [];
			tft.stop = "";
			tft.directions = [];
			tft.currentTime = "";
			tft.directionListClass = "";
			tft.stopGroupClass = "";
			tft.alertInformation = [];
			tft.alert="";
			$(".stopName").removeClass('stopOrange stopRed stopBlue');
			$(".stopBlock .time").removeClass("currentTime");
		}

		tft.getStopID = function(stopname) {
			var result = tft.stopCurrent.filter(function(obj) {
				return obj.stop_name == stopname;
			});
			tft.stopID = result[0].stop_id;
			return tft.stopID;
		}

		//Get Prediction Time, preprocess all data to match expected format
		tft.getTimeByStop = function(stopid) {
			tft.errorInfo = "";
			$http.get('http://realtime.mbta.com/developer/api/v2/predictionsbystop?api_key=g9LOuk3V8UO_3zNKijvPmw&stop=' + stopid + '&format=json').success(function(data) {
				tft.timeByStop = tft.filterLine(data.mode[0].route);
				console.log(data);
				//console.log(data.mode[0].route);
				tft.stop = data.stop_name;
				if (tft.timeByStop.length == 0) {
					tft.errorInfo = "Sorry, currently we can't get any info from MBTA. Please try again later.";
				} else {
					tft.directions = [{}, {}];
					tft.directions[0].trips = [];
					tft.directions[0].direction = tft.timeByStop[0].direction[0].direction_name;
					if (tft.timeByStop[0].direction.length > 1) {
						tft.directions[1].trips = [];
						tft.directions[1].direction = tft.timeByStop[0].direction[1].direction_name;
					}

					//For Red Line, conbine two routes
					if (tft.timeByStop.length > 1) {
						for (i = 0; i < tft.timeByStop.length; i++) {
							if (tft.directions[1].direction == "") {
								tft.directions[1].direction = tft.timeByStop[1].direction[1].direction_name;
							}

							var tripS = tft.timeByStop[i].direction[0].trip;
							tft.directions[0].trips = tft.directions[0].trips.concat(tripS);
							if (tft.timeByStop[i].direction.length > 1) {
								var tripN = tft.timeByStop[i].direction[1].trip;
								tft.directions[1].trips = tft.directions[1].trips.concat(tripN);
							}
						}
						
					} 
					//for other lines
					else {
						tft.directions[0].trips = tft.timeByStop[0].direction[0].trip;
						if (tft.timeByStop[0].direction.length > 1) {
							tft.directions[1].trips = tft.timeByStop[0].direction[1].trip;
						}
					}

					//sort by pre_away time
					tft.directions[0].trips.sort(function(a, b) {
						return a.pre_away - b.pre_away;
					});
					tft.directions[1].trips.sort(function(a, b) {
						return a.pre_away - b.pre_away;
					});
			
					tft.currentTime = Date.now();
					tft.addStopColor();
				}

				
			}).error(function() {
				tft.reset();
				tft.errorInfo = "Sorry, currently we can't get info from MBTA. Please try again later."
			});

			$http.get('http://realtime.mbta.com/developer/api/v2/alertsbyroute?api_key=g9LOuk3V8UO_3zNKijvPmw&route=931_&'+lineRouteQuery[tft.lineCurrent]+'&include_access_alerts=true&include_service_alerts=true&format=json').success(function(data) {
				tft.alertInformation = data;
				console.log(tft.alertInformation);
				
				if (tft.alertInformation.alerts.length == 0) {
					tft.alert = "";
				}
				else {
					tft.alert="<ul style='text-align:left; padding-left: 15px; padding-top: 5px'>";
					for (i = 0; i < tft.alertInformation.alerts.length; i++) {
						//console.log(tft.alertInformation.alerts[i].header_text);
						var single = "<li>" + tft.alertInformation.alerts[i].header_text + "</li>";
						//console.log(single);
						tft.alert = tft.alert.concat(single);
					}
					tft.alert = tft.alert.concat("</ul>");
				}
				//console.log(tft.alert);
			});
		}

		
		
	}]);
})();