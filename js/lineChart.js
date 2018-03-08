function addLineSeries(svg, x, y, indicator, animate){
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
			svg.append("line")
				.attr("class", "changeLine " +  colorClass)
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
			.attr("class", "changeDot " +  colorClass)
			.attr("cx", x(years[i]))
			.attr("cy", function(d){
				return y(d[newIndicator + years[i]])
			})
			.attr("r", 5)

	}

}
function updateLineSeries(svg, x, y, selector, indicator){

}
function addCorrelationRect(svg, x, y, indicator1, indicator2){
	svg.append("rect")
		.attr("class", "corellationRect")
		.attr("x", function(d){ return x(d.recoverstart)})
		.attr("y", y(290))
		.attr("height", y(0))
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
	
}