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
					console.log(d)
					return y(d[newIndicator + years[i]])
				})
				.attr("y2", function(d){
					console.log(d)
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

}
function updateCorrelationRect(svg, x, y, indicator1, indicator2){
	
}