(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller( UserService, SensorService) {
        var vm      = this;
        vm.user     = null;
        vm.sensor   = null;
        vm.json     = null;
        
        initController();

        function initController() {
           
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            
                //generate graph admin
                if(vm.user.role === 'admin'){
                    
                    SensorService.getAllSensor().then(function (sensorJson) {
                        UserService.GetAllUser().then(function (userJson) {
                            
                            var sensorSet 		= sensorJson;
                            var userSet         = userJson;
                            
                            var totalWaterConsumed  = 0;
                              
                            var dateFormat 		= d3.time.format("%Y-%m-%d %H:%M:%S");
                            sensorSet.forEach(function(d) {
                                d.starttime     = dateFormat.parse(d.starttime);
                                d.endtime       = dateFormat.parse(d.endtime);
                                d.sensorvalue   = parseInt(d.sensorvalue);
                                d.sid           = parseInt(d.sid);
                                totalWaterConsumed = totalWaterConsumed + d.sensorvalue;
                              

                            });

                            //Create a Crossfilter instance
                            var ndxsensor       = crossfilter(sensorSet);
                            var ndxuser         = crossfilter(userSet);
                            
                            
                             //Define Dimensions
                            var starttime           = ndxsensor.dimension(function(d) { return d.starttime; });
                            var endtime             = ndxsensor.dimension(function(d) { return d.endtime; });
                            var sensorvalue         = ndxsensor.dimension(function(d) { return d.sensorvalue; });
                            var sid                 = ndxsensor.dimension(function(d) { return d.sid; });
                            var sensoruid           = ndxsensor.dimension(function(d) { return d.uid; });
                            
                            var useruid             = ndxuser.dimension(function(d) { return d.uid; });
                            var firstname           = ndxuser.dimension(function(d) { return d.firstname; });
                            var lastname            = ndxuser.dimension(function(d) { return d.lastname; });
                            var phonenumber         = ndxuser.dimension(function(d) { return d.phonenumber; });
                            var email               = ndxuser.dimension(function(d) { return d.email; });
                            var flatnumber          = ndxuser.dimension(function(d) { return d.flatnumber; });
                            var societyname         = ndxuser.dimension(function(d) { return d.societyname; });
                            var regionname          = ndxuser.dimension(function(d) { return d.regionname; });

                            //Calculate metrics
                            var projectsByStartTime     = starttime.group(); 
                            var projectsByEndTime       = endtime.group(); 
                            var projectsBySensorValue   = sensorvalue.group();
                            var projectsBySensorId      = sid.group();
                            var projectsBySensorUserId  = sensoruid.group();
                            
                            var projectsByUserUserId    = useruid.group();
                            var projectsByFirstName     = firstname.group(); 
                            var projectsByLastName      = lastname.group(); 
                            var projectsByPhoneNumber   = phonenumber.group();
                            var projectsByEmail         = email.group();
                            var projectsByFlatNumber    = flatnumber.group();
                            var projectsByRegionName    = regionname.group();
                            var projectsBySocietyName   = societyname.group();
                           
                            var allUser = ndxuser.groupAll();
                            var allSensor = ndxsensor.groupAll();
                            
                           //Calculate Groups
                            
                            var sensorvalueDate     = starttime.group().reduceSum(function(d) {
                                return d.sensorvalue;
                            });

                            var dateSensorValue     = sensorvalue.group().reduceSum(function(d) {
                                return d.starttime;
                            });

                            var regionSensorValue   = regionname.group().reduceSum(function(d) {
                                return d.sensorvalue;
                            });

                            var societySensorValue  = societyname.group().reduceSum(function(d) {
                                return d.sensorvalue;
                            });

                            var userSensorValue     = sensorvalue.group().reduceSum(function(d) {
                                return d.useruid;
                            });

                            //Define threshold values for data
                            var minDate                         = starttime.bottom(1)[0].starttime;
                            var maxDate                         = starttime.top(1)[0].starttime;
                            var minSensorValue                  = sensorvalue.bottom(1)[0].sensorvalue;
                            var maxSensorValue                  = sensorvalue.top(1)[0].sensorvalue;
                      
                             //Charts
                            var regionpiechart                  = dc.pieChart("#regional-piechart-admin");
                            var societypiechart                 = dc.pieChart("#society-piechart-admin");
                            var userpiechart                    = dc.pieChart("#user-piechart-admin");
                            var regionrowchart                  = dc.rowChart("#region-chart-admin");
                            var societyrowchart                 = dc.rowChart("#society-chart-admin");
                            var userrowchart                    = dc.rowChart("#user-chart-admin");
                            var dateLineChart                   = dc.lineChart("#starttime-linechart-admin");
                            var sensorvalueBarChart             = dc.barChart("#sensorvalue-barchart-admin");
                            var starttimeBarChart               = dc.barChart("#starttime-barchart-admin");
                    
                            regionpiechart
                                .height(250)
                                //.width(350)
                                .radius(120)
                                .innerRadius(80)
                                .transitionDuration(1000)
                                .dimension(regionname)
                                .group(projectsByRegionName)
                                .minAngleForLabel(.3)
                                .title(function(d){return d.value;});

                            societypiechart
                                .height(250)
                                //.width(350)
                                .radius(120)
                                .innerRadius(30)
                                .transitionDuration(1000)
                                .dimension(societyname)
                                .group(projectsBySocietyName)
                                .minAngleForLabel(.3)
                                .title(function(d){return d.value;});

                            userpiechart
                                .height(250)
                                //.width(350)
                                .radius(120)
                                .innerRadius(8)
                                .transitionDuration(1000)
                                .dimension(useruid)
                                .group(projectsByUserUserId)
                                .minAngleForLabel(.3)
                                .title(function(d){return d.value;});
                            
                            regionrowchart
                                //.width(300)
                                .height(220)
                                .dimension(regionname)
                                .group(projectsByRegionName)
                                .elasticX(true)
                                .xAxis();
                            
                            societyrowchart
                                //.width(300)
                                .height(1000)
                                .dimension(societyname)
                                .group(projectsBySocietyName)
                                .elasticX(true)
                                .xAxis();
                            
                            userrowchart
                                //.width(300)
                                .height(1000)
                                .dimension(useruid)
                                .group(projectsByUserUserId)
                                .elasticX(true)
                                .xAxis();                            
                            
                            dateLineChart
                                .width(1200)
                                .height(200)
                                .margins({top: 10, right: 10, bottom: 20, left: 40})
                                .dimension(starttime)
                                .group(sensorvalueDate)
                                .renderArea(true)
                                .transitionDuration(1000)
                                .elasticY(true)
                                .renderHorizontalGridLines(true)
                                .renderVerticalGridLines(true)
                                .x(d3.time.scale().domain([minDate, maxDate]))
                                .xAxisLabel("Year")
                                .yAxis();

                             sensorvalueBarChart
                                .width(850)
                                .height(200)
                                .margins({top: 10, right: 10, bottom: 20, left: 40})
                                .dimension(sensorvalue)
                                .group(projectsBySensorValue)
                                .transitionDuration(500)
                                .centerBar(true)    
                                .gap(2)
                                .x(d3.scale.linear().domain([minSensorValue, maxSensorValue]))
                                .elasticY(true)
                                .renderHorizontalGridLines(true)
                                .renderVerticalGridLines(true)
                                .xAxis().tickFormat();  

                            starttimeBarChart
                                .width(1200)
                                .height(200)
                                .margins({top: 10, right: 10, bottom: 20, left: 40})
                                .dimension(starttime)
                                .group(sensorvalueDate)
                                .transitionDuration(1000)
                                .centerBar(true)    
                                .gap(-2)
                                .x(d3.time.scale().domain([minDate, maxDate]))
                                .elasticY(true)
                                .renderHorizontalGridLines(true)
                                .renderVerticalGridLines(true)
                                .xAxis().tickFormat();  
                            
                         dc.renderAll();   
                        });
                    }); 


                    }

                if(vm.user.role === 'customer'){
                    
                   SensorService.getCurrentSensor().then(function (sensorJson) {
                   
                    var copy    = JSON.parse(JSON.stringify(sensorJson))
                    vm.sensor   = copy;
                    vm.json     = sensorJson;                    
                       
                    var dataSet 		= vm.json;
                    var dateFormat 		= d3.time.format("%Y-%m-%d %H:%M:%S");
                    dataSet.forEach(function(d) {
                        d.starttime     = dateFormat.parse(d.starttime);
                        d.endtime       = dateFormat.parse(d.endtime);
                        d.sensorvalue   = parseInt(d.sensorvalue);
                        d.sid           = parseInt(d.sid); 
                    });

                    //Create a Crossfilter instance
                    var ndx = crossfilter(dataSet);

                    //Define Dimensions
                    var starttime          = ndx.dimension(function(d) { return d.starttime; });
                    var endtime            = ndx.dimension(function(d) { return d.endtime; });
                    var sensorvalue        = ndx.dimension(function(d) { return d.sensorvalue; });
                    var sid                = ndx.dimension(function(d) { return d.sid; });
                    var uid                = ndx.dimension(function(d) { return d.uid; });

                    //Calculate metrics
                    var projectsByStartTime     = starttime.group(); 
                    var projectsByEndTime       = endtime.group(); 
                    var projectsBySensorValue   = sensorvalue.group();
                    var projectsBySensorId      = sid.group();
                    var projectsByUserId        = uid.group();

                    var all = ndx.groupAll();

                    //Calculate Groups

                    var sensorvalueDate  = starttime.group().reduceSum(function(d) {
                        return d.sensorvalue;
                    });

                    var dateSensorValue = sensorvalue.group().reduceSum(function(d) {
                        return d.starttime;
                    });

                   
                    //Define threshold values for data
                    var minDate                         = starttime.bottom(1)[0].starttime;
                    var maxDate                         = starttime.top(1)[0].starttime;
                    var minSensorValue                  = sensorvalue.bottom(1)[0].sensorvalue;
                    var maxSensorValue                  = sensorvalue.top(1)[0].sensorvalue;

                   //Charts
                    var dateLineChart               = dc.lineChart("#starttime-linechart");
                    var sensorvalueBarChart         = dc.barChart("#sensorvalue-barchart");
                    var sidPieChart                 = dc.pieChart("#sid-piechart");
                    var starttimeBarChart           = dc.barChart("#starttime-barchart");

                    dateLineChart
                        .width(1200)
                        .height(200)
                        .margins({top: 10, right: 10, bottom: 20, left: 40})
                        .dimension(starttime)
                        .group(sensorvalueDate)
                        .renderArea(true)
                        .transitionDuration(1000)
                        .elasticY(true)
                        .renderHorizontalGridLines(true)
                        .renderVerticalGridLines(true)
                        .x(d3.time.scale().domain([minDate, maxDate]))
                        .xAxisLabel("Year")
                        .yAxis();


                     sensorvalueBarChart
                        .width(850)
                        .height(200)
                        .margins({top: 10, right: 10, bottom: 20, left: 40})
                        .dimension(sensorvalue)
                        .group(projectsBySensorValue)
                        .transitionDuration(500)
                        .centerBar(true)    
                        .gap(2)
                        .x(d3.scale.linear().domain([minSensorValue, maxSensorValue]))
                        .elasticY(true)
                        .renderHorizontalGridLines(true)
                        .renderVerticalGridLines(true)
                        .xAxis().tickFormat();  

                    sidPieChart
                        .height(250)
                        //.width(350)
                        .radius(120)
                        .innerRadius(80)
                        .transitionDuration(1000)
                        .dimension(sid)
                        .group(projectsBySensorId)
                        .minAngleForLabel(.3)
                        .title(function(d){return d.value;});

                    starttimeBarChart
                        .width(1200)
                        .height(200)
                        .margins({top: 10, right: 10, bottom: 20, left: 40})
                        .dimension(starttime)
                        .group(sensorvalueDate)
                        .transitionDuration(1000)
                        .centerBar(true)    
                        .gap(-2)
                        .x(d3.time.scale().domain([minDate, maxDate]))
                        .elasticY(true)
                        .renderHorizontalGridLines(true)
                        .renderVerticalGridLines(true)
                        .xAxis().tickFormat();  
                                             
                    dc.renderAll();
                    });    
                }
            });  
        }
    }
})();