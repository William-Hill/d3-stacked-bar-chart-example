$(function() {
    "use strict";

    /**
     * set up margins for SVG; These are chosen arbitrarily 
     */
    var margin = { top: 20, right: 50, bottom: 30, left: 20 };
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    /**
     * Sets up an ordinal scale that will be used on the X axis date labels    
     */
    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width]);

    /**
     * Sets up a linear Y scale
     */
    var yScale = d3.scale.linear()
        .rangeRound([height, 0]);

    /**
     * Defines an ordinal scale to map Stuffed Animal names to colors
     */
    var color = d3.scale.ordinal()
        .domain(["Teddy Bear", "Dog", "Horse", "Cat"])
        .range(["blue", "red", "green", "purple"])

    /**
     * sets up the x axis; orients the scale at the bottom
     */
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")

    /**
     * Sets up a vertical right axis on the right hand side
     */
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("right");

    /**
     * Selects an HTML section element and appends the SVG element
     */
    var svg = d3.select("#chartSection").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g") //appends a group element to the SVG element
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //moves the SVG element

    /**
     * Makes an asynchronous call to the csv file; formats the returned data
     * into an Array of Arrays
     */
    d3.csv("stuffedAnimals2.csv", type, function(data) { //Loading the CSV file asynchronously
        // console.log("pretty data: ", JSON.stringify(data, null, '\t'));
        //Used d3.keys to return an Array of keys from the parsed CSV, then filtered that Array to only include the Month headers
        var stuffedAnimals = d3.keys(data[0]).filter(function(key) {
            return key !== "Month"; });
        var months = data.map(function(data){
            return data["Month"]
        });


        var formattedData = stuffedAnimals.map(function(header, headerIndex) { //Called map function on headers Array; will return a new Array
            return data.map(function(eachMonthData, index){ //Called map function on original parsed CSV data; will return a new array
            	return {x: eachMonthData["Month"], y: eachMonthData[header], animal:header} //returns a new object at each iteration; sets x value to be the Stuff animal name and the y value to be the number sold for a given month using the value from the header Array as a lookup	
            })
        });
        // console.log("formattedData: ", JSON.stringify(formattedData, null, '\t'));

        //Uses the d3.layout.stack() convenience method to calculate the stack data
        var stack = d3.layout.stack()
        var formattedLayers = stack(formattedData);

        //Defines the domain of the xScale, will be the names of the Stuffed Animals
        xScale.domain(months.map(function(header) {
            return header;
        }))

        /*defines the domain of the yScale;
        d3.max Returns the maximum value in the given array using natural order
        We use formattedLayers.length - 1 to look at the last element of the formattedLayers Array
        The accessor function then acts similar to Array.map in that returns a new Array with the results of calling a provided function on every element in this array
        .nice() Extends the domain so that it starts and ends on nice round values*/
        yScale.domain([0, d3.max(formattedLayers[formattedLayers.length - 1], function(d) {
            return d.y0 + d.y;
        })]).nice();

        //Binds the data (data join) and appends a group element to the yet to be created bars
        var layer = svg.selectAll(".layer")
            .data(formattedLayers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d, i) {
                return color(d[i].animal);
            }); //fills with color according to d3.scale.category10()

        //Appends the scaled rectangles      
        layer.selectAll("rect")
            .data(function(d) {
                return d;
            })
            .enter().append("rect")
            .attr("x", function(d, i) {
                return xScale(d.x);
            })
            .attr("y", function(d) {
                return yScale(d.y + d.y0); })
            .attr("height", function(d) {
                return yScale(d.y0) - yScale(d.y + d.y0); })
            .attr("width", xScale.rangeBand() - 1)
            .on("mouseover", function(d){
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.rangeBand() / 2;
                var yPosition = parseFloat(d3.select(this).attr("y")) + 14;
                
                //Update the tooltip position and value
                d3.select("#tooltip")
                  .style("left", xPosition + "px")
                  .style("top", yPosition + "px")
                  .select("#value")
                    .text(d.y);

                d3.select("#title")
                    .text(d.animal)

                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function() {
                //Hide the tooltip
                d3.select("#tooltip").classed("hidden", true);
            });

        //appends the xAxis
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        //appends the yAxis
        svg.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(" + width + ",0)")
            .call(yAxis);
    });
    //Accessor function that converts the amount sold that was parsed from the CSV from a String to a Number
    function type(d) {
        var filteredKeys = d3.keys(d).filter(function(key) {
            return key !== "Month"; });
        filteredKeys.forEach(function(month) {
            d[month] = +d[month];
        });
        return d;
    }

});


