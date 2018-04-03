function addLineSeries(svg, x, y, indicator, animate, isCityTop){
	var colorClass, newIndicator;
	if(indicator == "econHealth"){
		colorClass = (isCityTop) ? "rank" : "econHealth"
		newIndicator = "rankeconhealth"
	}else{
		colorClass = "rank"
		newIndicator = "rank" + indicator + "inclusionindex"
	}
	var years = ["1980", "1990", "2000", "2013"]
	for(var i = 0; i < years.length; i++){
		if(i != (years.length -1)){
			svg.append("line")
				.attr("class", "changeLine " +  colorClass  + " y" + i)
				.attr("x1", x(years[i]))
				.attr("x2", x(years[i+1]))
				.attr("y1", function(d){
					return y(d[newIndicator + years[i]])
				})
				.attr("y2", function(d){
					return y(d[newIndicator + years[i+1]])
				})
		}

		svg.append("circle")
			.attr("class", "changeDot " +  colorClass + " y" + i)
			.attr("cx", x(years[i]))
			.attr("cy", function(d){
				return y(d[newIndicator + years[i]])
			})
			.attr("r", function(){
				return 5
			})

	}

}
function updateLineSeries(svg, x, y, indicator){
	var colorClass, newIndicator;
	if(indicator == "econHealth"){
		colorClass = "econHealth"
		newIndicator = "rankeconhealth"
	}else{
		colorClass = "rank"
		newIndicator = "rank" + indicator + "inclusionindex"
	}
	var years = ["1980", "1990", "2000", "2013"]
	for(var i = 0; i < years.length; i++){
		if(i != (years.length -1)){
			svg.selectAll(".changeLine." + colorClass + ".y" + i)
				.transition()
				.attr("y1", function(d){
					return y(d[newIndicator + years[i]])
				})
				.attr("y2", function(d){
					return y(d[newIndicator + years[i+1]])
				})
		}

		svg.selectAll(".changeDot." +  colorClass + ".y" + i)
			.transition()
			.attr("cy", function(d){
				return y(d[newIndicator + years[i]])
			})
	}


}
function addCorrelationRect(svg, x, y, indicator1, indicator2){
	svg.append("rect")
		.attr("class", "corellationRect")
		.attr("x", function(d){ return x(d.recoverstart)})
		.attr("y", y(0))
		.attr("height", y(274)-y(0))
		.attr("width", function(d){ return x(d.recoverend) - x(d.recoverstart)})
		.style("fill", function(d){
			var dir1, dir2, new1, new2, yr1, yr2;
			yr1 = d.recoverstart;
			yr2 = d.recoverend;
			if(indicator1 == "econHealth"){
				new1 = "rankeconhealth"
			}else{
				new1 = "rank" + indicator1 + "inclusionindex"
			}
			if(indicator2 == "econHealth"){
				new2 = "rankeconhealth"
			}else{
				new2 = "rank" + indicator1 + "inclusionindex"
			}

			dir1 = (d[new1 + yr1] > d[new1 + yr2]) ? "down" : "up"
			dir2 = (d[new2 + yr1] > d[new2 + yr2]) ? "down" : "up"
			return (dir1 == dir2) ? "#E4F3E2" : "#FFCCCC"
		})

}
function updateCorrelationRect(svg, x, y, indicator1, indicator2){
	svg.select(".corellationRect")
		.transition()
		.style("fill", function(d){
			var dir1, dir2, new1, new2, yr1, yr2;
			yr1 = d.recoverstart;
			yr2 = d.recoverend;
			if(indicator1 == "econHealth"){
				new1 = "rankeconhealth"
			}else{
				new1 = "rank" + indicator1 + "inclusionindex"
			}
			if(indicator2 == "econHealth"){
				new2 = "rankeconhealth"
			}else{
				new2 = "rank" + indicator1 + "inclusionindex"
			}

			dir1 = (d[new1 + yr1] > d[new1 + yr2]) ? "down" : "up"
			dir2 = (d[new2 + yr1] > d[new2 + yr2]) ? "down" : "up"
			return (dir1 == dir2) ? "#E4F3E2" : "#FFCCCC"
		})
}
function mousemoveLineChart(svg, d, x, y, mouseX, indicator1, indicator2){
	d3.selectAll(".smallTT").remove()
	var yrs = [1980, 1990, 2000, 2013]
	var diffs = yrs.map(function(a){ return Math.abs(a- x.invert(mouseX))})
	var year = yrs[diffs.indexOf(d3.min(diffs))]

	var ind = yrs.indexOf(year)
	svg.selectAll(".changeDot")
		.transition()
		.attr("r", function(){
			return (svg.classed("y" + ind)) ? 8 : 5;
		})

	var top, bottom;
	if(indicator2){
		var i1 = d[indicator1 + year]
		var i2 = d[indicator2 + year]
		if(i1 <= i2){
			top = i1
			bottom = i2
		}else{
			top = i2
			bottom = i1
		}
	}else{
		top = d[indicator1 + year]
	}
	var tt1 = svg.append("g")
		.attr("class","smallTT")
		.attr("transform", function(){
			return "translate(" + (x(year) - 10) + "," + (y(top) - 10) + ")"
		})
	tt1.append("rect")
		.style("fill","rgba(255,255,255,.7)")
		.attr("x",-4)
		.attr("y",-13)
		.attr("height",16)
		.attr("width", 30)

	tt1.append("text").text(d3.format(".0f")(top))

	if(indicator2){
		var tt2 = svg.append("g")
			.attr("class","smallTT")
			.attr("transform", function(){
				return "translate(" + (x(year) - 10) + "," + (y(bottom) + 20) + ")"
			})
		tt2.append("rect")
			.style("fill","rgba(255,255,255,.7)")
			.attr("x",-4)
			.attr("y",-13)
			.attr("height",16)
			.attr("width", 30)

		tt2.append("text").text(d3.format(".0f")(bottom))
	}
}