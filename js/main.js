var DATA_URL = "data/data.csv";
var DOT_RADIUS = 8;
var scatterMargin = {"left": 40, "right": 0, "top": 0, "bottom": 10}
var scatterSvg;

function getScatterWidth(){
	return 500;
}
function getScatterHeight(){
	return 500;
}
function setYear(year){
	d3.select("#yearDatum").datum(year)
}
function getYear(){
	return d3.select("#yearDatum").datum();
}
function setInclusionType(inclusionType){
	d3.select("#inclusionTypeDatum").datum(inclusionType)
}
function getInclusionType(){
	return d3.select("#inclusionTypeDatum").datum()
}
function setScaleType(scaleType){
	d3.select("#scaleTypeDatum").datum(scaleType)
}
function getScaleType(){
	return d3.select("#scaleTypeDatum").datum()
}

function getVarName(year, inclusionType){
	if(inclusionType == "econHealth"){
		return "rankeconhealth" + year
	}else{
		return "rank" + inclusionType + "inclusionindex" + year
	}
}
function getRankColor(rank){
	var color = d3.scaleThreshold()
    	.domain([0,45.666,45.666*2,45.666*3,45.666*4,45.666*5,274])
    	.range(["#fff","#A2D4EC","#73BFE2","#46ABDB","#1696D2","#12719E","#0A4C6A"]);
    return color(rank)
}

//exponential regression from https://stackoverflow.com/questions/13590922/how-can-i-use-d3-js-to-create-a-trend-exponential-regression-line
function square(x){return Math.pow(x,2);};

function array_sum(arr){
  var total = 0;
  arr.forEach(function(d){total+=d;});
  return total;
}

function exp_regression(Y){
  var n = Y.length;
  var X = d3.range(1,n+1);

  var sum_x = array_sum(X);
  var sum_y = array_sum(Y);
  var y_mean = array_sum(Y) / n;
  var log_y = Y.map(function(d){return Math.log(d)});
  var x_squared = X.map(function(d){return square(d)});
  var sum_x_squared = array_sum(x_squared);
  var sum_log_y = array_sum(log_y);
  var x_log_y = X.map(function(d,i){return d*log_y[i]});
  var sum_x_log_y = array_sum(x_log_y);

  a = (sum_log_y*sum_x_squared - sum_x*sum_x_log_y) /
      (n * sum_x_squared - square(sum_x));

  b = (n * sum_x_log_y - sum_x*sum_log_y) /
      (n * sum_x_squared - square(sum_x));

  var y_fit = [];
  X.forEach(function(x){
    y_fit.push(Math.exp(a)*Math.exp(b*x));
  });

  return y_fit;
}

// linear regression from from http://bl.ocks.org/benvandyke/8459843
function leastSquares(xSeries, ySeries) {
	var reduceSumFunc = function(prev, cur) { return prev + cur; };
	
	var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
	var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

	var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
		.reduce(reduceSumFunc);
	
	var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
		.reduce(reduceSumFunc);
		
	var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
		.reduce(reduceSumFunc);
		
	var slope = ssXY / ssXX;
	var intercept = yBar - (xBar * slope);
	var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
	
	return [slope, intercept, rSquare];
}





d3.csv(DATA_URL,function(d) {
	return {
		className: d.place.toLowerCase().replace(/[^\w\s]+/g, "").replace(/\s/g,"_") + "_" + d.stateabrev,
		place: d.place,
		stateabrev: d.stateabrev,
		rankeconhealth1980: +d.rankeconhealth1980,
		rankeconinclusionindex1980: +d.rankeconinclusionindex1980,
		rankraceinclusionindex1980: +d.rankraceinclusionindex1980,
		rankoverallinclusionindex1980: +d.rankoverallinclusionindex1980,
		rankeconhealth1990: +d.rankeconhealth1990,
		rankeconinclusionindex1990: +d.rankeconinclusionindex1990,
		rankraceinclusionindex1990: +d.rankraceinclusionindex1990,
		rankoverallinclusionindex1990: +d.rankoverallinclusionindex1990,
		rankeconhealth2000: +d.rankeconhealth2000,
		rankeconinclusionindex2000: +d.rankeconinclusionindex2000,
		rankraceinclusionindex2000: +d.rankraceinclusionindex2000,
		rankoverallinclusionindex2000: +d.rankoverallinclusionindex2000,
		rankeconhealth2013: +d.rankeconhealth2013,
		rankeconinclusionindex2013: +d.rankeconinclusionindex2013,
		rankraceinclusionindex2013: +d.rankraceinclusionindex2013,
		rankoverallinclusionindex2013: +d.rankoverallinclusionindex2013,
		pop1980: +d.pop1980,
		pop1990: +d.pop1990,
		pop2000: +d.pop2000,
		pop2013: +d.pop2013,
		logpop1980: Math.log10(+d.pop1980),
		logpop1990: Math.log10(+d.pop1990),
		logpop2000: Math.log10(+d.pop2000),
		logpop2013: Math.log10(+d.pop2013)
	};
}, function(data){
	function init(){
		setYear("2013");
		setInclusionType("overall");
		setScaleType("log");
		// showMap();
		showSizeQuestion();
	}
	function hideAll(){

	}
	function buildYearSelector(container, section){
		//click handler
		container.
			selectAll(".yearSelect")
			.data(["1980","1990","2000","2013"])
			.enter()
			.append("div")
			.attr("class", function(d){
				return (getYear() == d) ? "yearSelect active" : "yearSelect"
			})
			.text(function(d){ return d})
			.on("click", function(d){
				setYear(d)
				d3.selectAll(".yearSelect.active").classed("active", false)
				d3.select(this).classed("active", true)
				if(section == "map"){
					updateMap(d, getInclusionType())
				}
				else if(section == "size"){
					updateSizeQuestion(d, getInclusionType(), getScaleType())
				}
				else if(section == "health"){
					updateHealthQuestion(d, getInclusionType())

				}
			})

	}
	function buildInclusionTypeSelector(container, section){
		//click handler
		// var d = "foo"
		container.
			selectAll(".inclusionSelect")
			.data(["overall","econ","race"])
			.enter()
			.append("div")
			.attr("class", function(d){
				return (getInclusionType() == d) ? "inclusionSelect active" : "inclusionSelect"
			})
			.text(function(d){ return d})
			.on("click", function(d){
				setInclusionType(d)
				d3.selectAll(".inclusionSelect.active").classed("active", false)
				d3.select(this).classed("active", true)
				if(section == "map"){
					updateMap(getYear(), d)
				}
				else if(section == "size"){
					updateSizeQuestion(getYear(), d, getScaleType())
				}
				else if(section == "health"){
					updateHealthQuestion(getYear(), d)

				}
			})

		// if(section == "map"){
		// 	updateMap(getYear(),d) 
		// }
		// else if(section == "size"){
		// 	updateSizeQuestion(getYear(), d, getScaleType())
		// }
		// else if(section == "health"){
		// 	updateHealthQuestion(getYear(), d)

		// }
	}


	function getScatterScales(width, height, margin, section, year, inclusionType, scaleType){
		// var year = getYear();
		// var inclusionType = getInclusionType();
		// var scaleType = getScaleType();

		var yMax;
		if(section == "size"){
			if(scaleType == "linear"){
				yMax = d3.max(data, function(d){ return d["pop" + "2013"]})
			}else{
				yMax = d3.max(data, function(d){ return d["logpop" + "2013"] })
			}
		}else{
			yMax = 274;
		}
		var yMin;
		if(section == "size"){
			if(scaleType == "linear"){
				yMin = d3.min(data, function(d){ return d["pop" + "1980"]})
			}else{
				yMin = d3.min(data, function(d){ return d["logpop" + "1980"] })
			}

		}else{
			yMin = 0;
		}

		var x = d3.scaleLinear().range([margin.left, width]).domain([1, 274])
		var y = d3.scaleLinear().range([height, margin.bottom]).domain([yMin,yMax])
		return [x,y]
	}

	function removeScatterTooltip(d){
		d3.selectAll(".dot").classed("hover", false)
	}
	function showScatterTooltip(d){
		// console.log(d)
		d3.selectAll(".dot").classed("hover", false)
		var dot = d3.select(".dot." + d.className).classed("hover", true)
		dot.node().parentNode.appendChild(dot.node())
		var fitLine = d3.select(".fitLine")
		fitLine.node().parentNode.appendChild(fitLine.node())


	}
	function buildScatterPlot(container, section){
		var year = getYear();
		var inclusionType = getInclusionType();
		var xVar = getVarName(year, inclusionType);
		var yVar = (section == "size") ? "pop" + year : "rankeconhealth" + year
		var scaleType = (section == "size") ? getScaleType() : false;
		var margin = scatterMargin
		var width = getScatterWidth() - margin.left - margin.right;
		var height = getScatterHeight() - margin.top - margin.bottom;
		var scales = getScatterScales(width, height, margin, section, getYear(), getInclusionType(), getScaleType())
		var x = scales[0]
		var y = scales[1]

		if(section == "size"){
			var yVals = exp_regression(data.map(function(a) {return a[yVar.replace("log","")];}))

			var lineData = []
			for(var i = 1; i < yVals.length+1; i++){
				var lineDatum = {"x": i, "y": yVals[i-1]}
				lineData.push(lineDatum)
			}

			var line = d3.line()
				.x(function(d) {return x(d.x);})
				.y(function(d) {
					if(scaleType == "log"){
						return y(Math.log10(d.y));
					}else{
						return y(d.y)
					}
				})
		}else{
			var xVals = data.map(function(a){ return a[xVar]})
			var yVals = data.map(function(a){ return a[yVar]})
			var leastSquaresCoeff = leastSquares(xVals, yVals);
			
			var x1 = 1;
			var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
			var x2 = 274;
			var y2 = leastSquaresCoeff[0] * xVals.length + leastSquaresCoeff[1];
			var trendData = [[x1,y1,x2,y2]];
		}

		scatterSvg = container.append("svg")
			.attr("id", "scatterSvg")
			.attr("width",width + margin.left + margin.right)
			.attr("height",height + margin.left + margin.right)
			.append("g")

		scatterSvg.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + (height) + ")")
			.call(d3.axisBottom(x).ticks(5).tickSize(-height+margin.bottom));

		scatterSvg.append("g")
			.attr("class", "axis axis--y")
			.attr("transform", "translate(" +margin.left + ",0)")
			.call(d3.axisLeft(y).ticks(5).tickSize(-width+margin.left));

		if(scaleType == "log" && section == "size"){
			d3.selectAll(".axis.axis--y .tick text")
				.text(null)
				.append("tspan")
				.attr("dx", "-.7em")
				.text("10")
				.append("tspan")
				.attr("baseline-shift", "super")
				.attr("font-size", "11px")
				.text(function(d){
					var f = d3.format(".2n")
					return f(d)
				})	
		}

		scatterSvg.selectAll(".dot")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", function(d){
				return "dot " + d.className;
			})
			.attr("r", DOT_RADIUS)
			.attr("cx", function(d){
				return x(d[xVar])
			})
			.attr("cy", function(d){
				if(scaleType == "log"){
					return y(d["log" + yVar])
				}else{
					return y(d[yVar])
				}
			})
			.attr("fill", function(d){
				return getRankColor(d[xVar])
			})
			.style("opacity", .8)

			var maxDistanceFromPoint = 100;
			scatterSvg._tooltipped = scatterSvg._voronoi = null;
			scatterSvg
				.on('mousemove', function() {
					var scales = getScatterScales(width, height, margin, section, getYear(), getInclusionType(), getScaleType())
					var x = scales[0]
					var y = scales[1]

					var xVar = getVarName(getYear(), getInclusionType());
					var yVar = (section == "size") ? "pop" + getYear() : "rankeconhealth" + getYear()
					if(getScaleType() == "log" && section == "size") yVar = "log" + yVar

					if (!scatterSvg._voronoi) {
						scatterSvg._voronoi = d3.voronoi()
						.x(function(d) { return x(d[xVar]); })
						.y(function(d) { return y(d[yVar]); })
						(data);
					}
					var p = d3.mouse(this), site;
					site = scatterSvg._voronoi.find(p[0], p[1], maxDistanceFromPoint);
					if (site !== scatterSvg._tooltipped) {
						if (scatterSvg._tooltipped) removeScatterTooltip(scatterSvg._tooltipped.data)
						if (site) showScatterTooltip(site.data);
						scatterSvg._tooltipped = site;
					}
				})
				// .on("mouseout", function(){
				// 	removeDotTooltip();
				// })

			if(section == "size"){
			    scatterSvg.append("path")
			    	.attr("class", "fitLine")
					.attr("d", line(lineData))
			}else{
				scatterSvg.selectAll(".fitLine")
					.data(trendData)
					.enter()
					.append("line")
					.attr("class", "fitLine")
					.attr("x1", function(d) { return x(d[0]); })
					.attr("y1", function(d) { return y(d[1]); })
					.attr("x2", function(d) { return x(d[2]); })
					.attr("y2", function(d) { return y(d[3]); })

			}





	}

	function buildParagraphs(container, key){
		container
			.selectAll("p")
			.data(allText[key])
			.enter()
			.append("p")
			.html(function(d){ return d})
			
	}

	function showMap(){
		var year = getYear();
		var inclusionType = getInclusionType();

		// var container = "foo"

		// hideAll();
		// buildYearSelector(container, "map");
		// buildInclusionTypeSelector(container, "map")

		// //draw map
		// var mapData = data.filter()

	}
	function updateMap(year, inclusionType){

	}

	function showHealthQuestion(){
		var year = getYear();
		var inclusionType = getInclusionType();
		var varName = getVarName(year, inclusionType);

		var graphContainer = d3.select("#graphContainer")
		var yearContainer = graphContainer.append("div").attr("id", "yearContainer")
		var plotContainer = graphContainer.append("div").attr("id", "plotContainer")
		var inclusionContainer = graphContainer.append("div").attr("id", "inclusionContainer")
		var paragraphContainer = d3.select("#sidebarContainer")


		buildYearSelector(yearContainer, "health")
		buildInclusionTypeSelector(inclusionContainer, "health")
		buildScatterPlot(plotContainer, "health")
		buildParagraphs(paragraphContainer, "healthQuestion")
	}
	function updateHealthQuestion(year, inclusionType){
		scatterSvg._voronoi = null;

		var scales = getScatterScales(getScatterWidth() - scatterMargin.left - scatterMargin.right, getScatterHeight() - scatterMargin.top - scatterMargin.bottom, scatterMargin, "health", year, inclusionType, "linear")
		var x = scales[0]
		var y = scales[1]

		var xVar = getVarName(year, inclusionType);
		var yVar = "rankeconhealth" + year


		scatterSvg.selectAll(".dot")
			.transition()
			.duration(500)
			.delay(function(d, i){
				return d[xVar]*2
			})
			.attr("cx", function(d){
				return x(d[xVar])
			})
			.attr("cy", function(d){
				return y(d[yVar])
			})


		var xVals = data.map(function(a){ return a[xVar]})
		var yVals = data.map(function(a){ return a[yVar]})
		var leastSquaresCoeff = leastSquares(xVals, yVals);
		
		var x1 = 1;
		var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
		var x2 = 274;
		var y2 = leastSquaresCoeff[0] * xVals.length + leastSquaresCoeff[1];
		var trendData = [[x1,y1,x2,y2]];

		var fitLine = scatterSvg.selectAll(".fitLine")
			.data(trendData)
			.transition()
			.duration(500 + 274*2)
			.attr("y1", function(d) { return y(d[1]); })
			.attr("y2", function(d) { return y(d[3]); })

		// var yVals = exp_regression(data.map(function(a) {return a[yVar.replace("log","")];}))

		// var lineData = []
		// for(var i = 1; i < yVals.length+1; i++){
		// 	var lineDatum = {"x": i, "y": yVals[i-1]}
		// 	lineData.push(lineDatum)
		// }

		// var line = d3.line()
		// 	.x(function(d) {return x(d.x);})
		// 	.y(function(d) {
		// 		if(scaleType == "log"){
		// 			return y(Math.log10(d.y));
		// 		}else{
		// 			return y(d.y)
		// 		}
		// 	})

		// var fitLine = d3.selectAll(".fitLine")
		// 	.transition()
		// 	.duration(500 + 274*2)
		// 	.attr("d", line(lineData))

		fitLine.node().parentNode.appendChild(fitLine.node())
	}

	function buildScaleTypeToggle(container, scaleType){
		container.
			selectAll(".scaleSelect")
			.data(["linear","log"])
			.enter()
			.append("div")
			.attr("class", function(d){
				return (getScaleType() == d) ? "scaleSelect active" : "scaleSelect"
			})
			.text(function(d){ return d})
			.on("click", function(d){
				setScaleType(d)
				d3.selectAll(".scaleSelect.active").classed("active", false)
				d3.select(this).classed("active", true)
				updateSizeQuestion(getYear(), getInclusionType(), d)
			})
	}
	function showSizeQuestion(){
		var scaleType = getScaleType();

		var graphContainer = d3.select("#graphContainer")
		var yearContainer = graphContainer.append("div").attr("id", "yearContainer")
		var toggleContainer = graphContainer.append("div").attr("id", "toggleContainer")
		var plotContainer = graphContainer.append("div").attr("id", "plotContainer")
		var inclusionContainer = graphContainer.append("div").attr("id", "inclusionContainer")
		var paragraphContainer = d3.select("#sidebarContainer")

		buildYearSelector(yearContainer, "size")
		buildInclusionTypeSelector(inclusionContainer, "size")
		buildScatterPlot(plotContainer, "size")
		buildScaleTypeToggle(toggleContainer, scaleType)
		buildParagraphs(paragraphContainer, "sizeQuestion")

	}
	function updateSizeQuestion(year, inclusionType, scaleType){
		// var svg = d3.select("#scatterSvg")
		scatterSvg._voronoi = null;

		var scales = getScatterScales(getScatterWidth() - scatterMargin.left - scatterMargin.right, getScatterHeight() - scatterMargin.top - scatterMargin.bottom, scatterMargin, "size", year, inclusionType, scaleType)
		var x = scales[0]
		var y = scales[1]
		var xVar = getVarName(year, inclusionType);
		var yVar = "pop" + year


		scatterSvg.selectAll(".dot")
			.transition()
			.duration(500)
			.delay(function(d, i){
				return d[xVar]*2
			})
			.attr("cx", function(d){
				return x(d[xVar])
			})
			.attr("cy", function(d){
				if(scaleType == "log"){
					return y(d["log" + yVar])
				}else{
					return y(d[yVar])
				}
			})
		var tickFormat = (scaleType == "log") ? "" : d3.format(".2s")
		var oldScale = (d3.select(".axis--y .tick text tspan tspan").node() == null) ? "linear" : "log"
		if(scaleType != oldScale){
			d3.select(".axis.axis--y")
				.transition()
				.call(d3.axisLeft(y).ticks(5).tickSize(-(+d3.select("#scatterSvg").attr("width")-scatterMargin.left-scatterMargin.right-scatterMargin.left)).tickFormat(tickFormat))
				.on("end", function(){
					if(scaleType == "log"){
						d3.selectAll(".axis.axis--y .tick text")
							.text(null)
							.append("tspan")
							.attr("dx", "-.7em")
							.text("10")
							.append("tspan")
							.attr("baseline-shift", "super")
							.attr("font-size", "11px")
							.text(function(d){
								var f = d3.format(".2n")
								return f(d)
							})	
					}
				
				})
		}



		var yVals = exp_regression(data.map(function(a) {return a[yVar.replace("log","")];}))

		var lineData = []
		for(var i = 1; i < yVals.length+1; i++){
			var lineDatum = {"x": i, "y": yVals[i-1]}
			lineData.push(lineDatum)
		}

		var line = d3.line()
			.x(function(d) {return x(d.x);})
			.y(function(d) {
				if(scaleType == "log"){
					return y(Math.log10(d.y));
				}else{
					return y(d.y)
				}
			})

		var fitLine = d3.selectAll(".fitLine")
			.transition()
			.duration(500 + 274*2)
			.attr("d", line(lineData))

		fitLine.node().parentNode.appendChild(fitLine.node())


	}

	function buildChangeDropdown(x, y){
		//change handler
		updateChangeQuestion(inclusionType, x, y)
	}

	function showChangeQuestion(){
		var changeData = data.filter()
		var chartContainer = d3.select("body")
		var paragraphContainer = d3.select("body")
		var inclusionType = getInclusionType()

		var x;
		var y;

		buildChangeDropdown(x, y)

		var chartDiv = chartContainer
			.selectAll(".chartDiv")
			.data(changeData)
			.enter()
			.append("div")

		var svg = chartDiv.append("svg");
		addCorrelationRect(svg, x, y, inclusionType, "econHealth");
		addLineSeries(svg, x, y, inclusionType, false);
		addLineSeries(svg, x, y, "econHealth", false);
		buildParagraphs(paragraphContainer, "changeQuestion");
	}
	function updateChangeQuestion(inclusionType, x, y){
		var svg = d3.selectAll(".chartDiv").select("svg")
		updateLineSeries(svg, x, y, ".inclusionLine", inclusionType);
		updateCorrelationRect(svg, x, y, inclusionType, "econHealth");
	}

	d3.selectAll(".questionMenu").on("click", function(){
		var section = d3.select(this).attr("data-section")
		d3.selectAll(".questionMenu").classed("active", false)
		d3.select(this).classed("active", true)

		d3.select("#graphContainer").selectAll("*").remove()
		d3.select("#sidebarContainer").selectAll("*").remove()

		if(section == "map"){ showMap() }
		else if(section == "health"){ showHealthQuestion() }
		else if(section == "size"){ showSizeQuestion() }
	})

	init();

})