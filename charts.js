$(function(){
	"use strict";
	//set up margins for SVG; These are chosen arbitrarily 
	var margin = {top: 20, right: 50, bottom: 30, left: 20};
	var width = 960 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;

	//Sets up an ordinal scale that will be used on the X axis date labels    
	var xScale = d3.scale.ordinal()
	    .rangeRoundBands([0, width]);

	//Sets up a linear Y scale
	var yScale = d3.scale.linear()
	    .rangeRound([height, 0]);

	//defines a set of 10 colors
	var color = d3.scale.category10();

	//sets up the x axis; orients the scale at the bottom
	var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom")

	//Sets up a vertical right axis on the right hand side
	var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("right");

	//Selects an HTML section element and appends the SVG element
	var svg = d3.select("#chartSection").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
  	.append("g") //appends a group element to the SVG element
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //moves the SVG element
	
    d3.csv("stuffedAnimals.csv",type,function(data){ //Loading the CSV file asynchronously
		console.log("data: ", data);
		//Used d3.keys to return an Array of keys from the parsed CSV, then filtered that Array to only include the Month headers
		var headers = d3.keys(data[0]).filter(function(key) { return key !== "Stuff Animal"; })
		console.log("d3 keys: ", d3.keys(data[0]).filter(function(key) { return key !== "Stuff Animal"; }));
		var animalValues = data.map(function(data2){
			console.log("data in animalValues: ", data2)
			return data2["Stuff Animal"]})
		console.log("animalValues: ", animalValues);
		var formattedData =	animalValues.map(function(header, headerIndex){ //Called map function on headers Array; will return a new Array
			console.log("headerIndex: ", headerIndex);
			// data.forEach(function(data){
			console.log("data[0]: ", data[0])
			$.each(data[0],function(key,value){
				console.log("key: ", key);
				console.log("value: ", value);
			})
			for(var prop in data[0]){
				// console.log("data from forEach: ", data);
				console.log("prop: ", prop);
				return[
					{x: header, y: data[headers[0]], month:headers[0]},
					{x: header, y: data[headers[1]], month:headers[1]}
				]
			}
			// return data.map(function(eachMonthData, index){ //Called map function on original parsed CSV data; will return a new array
			// 	console.log("eachMonthData: ", eachMonthData);
			// 	// console.log("index: ", index);
			// 	console.log("headers: ", headers)
			// 	console.log("header: ", header);
			// 	// console.log("y value: ", eachMonthData[headers[index]]);

			// 	return {x: header, y: eachMonthData[headers[headerIndex]], month:headers[index]} //returns a new object at each iteration; sets x value to be the Stuff animal name and the y value to be the number sold for a given month using the value from the header Array as a lookup	
			// })
		});
		console.log("formattedData: ", formattedData);
		//Uses the d3.layout.stack() convenience method to calculate the stack data
		var stack = d3.layout.stack()
		var formattedLayers = stack(formattedData);
		console.log("formattedLayers: ", formattedLayers);

		//Defines the domain of the xScale, will be the names of the Stuffed Animals
		// xScale.domain(formattedLayers[0].map(function(d) {
		// 	console.log("d in x domain: ", d); 
		// 	return d.x; }));
		xScale.domain(headers.map(function(header){
			console.log("header in forEach: ", header);
			return header;
		})
		)
		// console.log("xScale domain: ", xScale.domain());
		// console.log("xScale range: ", xScale.range());
		//defines the domain of the yScale;
		// console.log("formattedLayers.length: ", formattedLayers.length);
		// console.log("d3.max parameter: ", d3.max(formattedLayers[formattedLayers.length - 1]));
		// console.log("d3.max test: ", d3.max(formattedLayers[formattedLayers.length - 1], function(d) { return d.y0 + d.y; }) ); 
		//d3.max Returns the maximum value in the given array using natural order
		//We use formattedLayers.length - 1 to look at the last element of the formattedLayers Array
		//The accessor function then acts similar to Array.map in that returns a new Array with the results of calling a provided function on every element in this array
		//.nice() Extends the domain so that it starts and ends on nice round values 
	  	yScale.domain([0, d3.max(formattedLayers[formattedLayers.length - 1], function(d) {
	  		// console.log("d in yScale domain: ", d.y);
	  		// console.log("d in yScale domain type: ", typeof d.y);
	  		return d.y0 +  d.y; })]).nice();
	  	console.log("yScale domain: ", yScale.domain());
	  	//Binds the data (data join) and appends a group element to the yet to be created bars
	  	var layer = svg.selectAll(".layer")
	  	      .data(formattedLayers)
	  	    .enter().append("g")
	  	      .attr("class", "layer")
	  	      .style("fill", function(d, i) {
	  	      // console.log("d in fill function: ", d)
	  	      // console.log("color(i): ", color(d.x)); 
	  	      return color(i); }); //fills with color according to d3.scale.category10()

	  	//Appends the scaled rectangles      
      	layer.selectAll("rect")
      	      .data(function(d) {
      	      	// console.log("data d: ", d); 
      	      	return d; })
      	    .enter().append("rect")
      	      .attr("x", function(d,i) { 
      	      	// console.log("d in x attr: ", d)
      	      	return xScale(d.month); })
      	      .attr("y", function(d) { return yScale(d.y + d.y0); })
      	      .attr("height", function(d) { return yScale(d.y0) - yScale(d.y + d.y0); })
      	      .attr("width", xScale.rangeBand() - 1);

      	//appends the xAxis
      	svg.append("g")
      	      .attr("class", "axis axis--x")
      	      .attr("transform", "translate(0," + height + ")")
      	      .call(xAxis);

      	  svg.append("g")
      	      .attr("class", "axis axis--y")
      	      .attr("transform", "translate(" + width + ",0)")
      	      .call(yAxis);
	});
	//Accessor function that converts the amount sold that was parsed from the CSV from a String to a Number
	function type(d) {
		var filteredKeys = d3.keys(d).filter(function(key) { return key !== "Stuff Animal";  });
		filteredKeys.forEach(function(month){
			d[month] = +d[month];
		});
		return d;
	}
	
});


//jQuery.get(fun)