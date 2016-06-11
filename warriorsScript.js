$(function(){
	'use strict';
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
	 * Defines an ordinal scale of 20 colors pre-defined by D3
	 */
	var color = d3.scale.category20();

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
	d3.csv("teams_GSW_2016_totals.csv", function(data) { //Loading the CSV file asynchronously
		var players = data.filter(function(key){
			if(key.Player != "Team Totals"){
				return key.Player	
			}
			
		});
		var traditionalStats = d3.keys(data[0]).filter(function(key){
			if(key == "PTS" || key == "TRB" || key == "AST" || key == "BLK" || key == "STL"){
				return key
			}
		});
		var formattedData = players.map(function(eachPlayer){
			return traditionalStats.map(function(stat){
				return {x: stat, y: Number(eachPlayer[stat]), player: eachPlayer["Player"]}
			})

		})

		var stack = d3.layout.stack()
        var formattedLayers = stack(formattedData);

        /**
         * Sets the xScale's domain to be the list of stats
         */
        xScale.domain(traditionalStats);

        /**
         * Gets the last item in the Array of Arrays 
         * The last items of the outer array using an index lookup 
         * and the last item of the inner array using d3.max
         * Returns the y value added to all of the accumalated y values
         * Basically finds the upper bound of the given dataset
         */
        yScale.domain([0, d3.max(formattedLayers[formattedLayers.length - 1], function(d) {
            return d.y0 + d.y;
        })]).nice();

        //Binds the data (data join) and appends a group element to the yet to be created bars
        var layer = svg.selectAll(".layer")
            .data(formattedLayers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d, i) {
                return color(i);
            }); //fills with color according to d3.scale.category20()

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
		            .text(d.player)

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

});