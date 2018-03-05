var DATA_URL = "data/data.csv";
var DOT_RADIUS = 8;
var scatterMargin = {"left": 20, "right": 20, "top": 20, "bottom": 20}

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
		}
		var yMin;
		if(section == "size"){
			if(scaleType == "linear"){
				yMin = d3.min(data, function(d){ return d["pop" + "1980"]})
			}else{
				yMin = d3.min(data, function(d){ return d["logpop" + "1980"] })
			}

		}

		var x = d3.scaleLinear().range([margin.left, width]).domain([1, 274])
		var y = d3.scaleLinear().range([height, margin.bottom]).domain([yMin,yMax])
		return [x,y]
	}

	function removeScatterTooltip(d){
		d3.selectAll(".dot").classed("hover", false)
	}
	function showScatterTooltip(d){
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
		var width = 500 - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;
		var scales = getScatterScales(width, height, margin, section, getYear(), getInclusionType(), getScaleType())
		var x = scales[0]
		var y = scales[1]

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

		var svg = container.append("svg")
			.attr("id", "scatterSvg")
			.attr("width",width + margin.left + margin.right)
			.attr("height",height + margin.left + margin.right)
			.append("g")

		svg.selectAll(".dot")
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
			svg._tooltipped = svg._voronoi = null;
			svg
				.on('mousemove', function() {
					var scales = getScatterScales(width, height, margin, section, getYear(), getInclusionType(), getScaleType())
					var x = scales[0]
					var y = scales[1]

					var xVar = getVarName(getYear(), getInclusionType());
					var yVar = (section == "size") ? "pop" + getYear() : "rankeconhealth" + getYear()
					if(getScaleType() == "log") yVar = "log" + yVar



					if (!svg._voronoi) {
						console.log("activate")
						svg._voronoi = d3.voronoi()
						.x(function(d) { return x(d[xVar]); })
						.y(function(d) { return y(d[yVar]); })
						(data);
					}
					var p = d3.mouse(this), site;
					site = svg._voronoi.find(p[0], p[1], maxDistanceFromPoint);
					if (site !== svg._tooltipped) {
						if (svg._tooltipped) removeScatterTooltip(svg._tooltipped.data)
						if (site) showScatterTooltip(site.data);
						svg._tooltipped = site;
					}
				})
				// .on("mouseout", function(){
				// 	removeDotTooltip();
				// })

		    var path = svg.append("path")
		    	.attr("class", "fitLine")
				.attr("d", line(lineData))



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

		var container = "foo"

		hideAll();
		buildYearSelector(container, "map");
		buildInclusionTypeSelector(container, "map")

		//draw map
		var mapData = data.filter()

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
		var paragraphContainer = d3.select("body")

		buildYearSelector(yearContainer, "health")
		buildInclusionTypeSelector(inclusionContainer, "health")
		buildScatterPlot(plotContainer, "health")
		buildParagraphs(paragraphContainer, "healthQuestion")
	}
	function updateHealthQuestion(year, inclusionType){

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
		var paragraphContainer = graphContainer.append("div").attr("id", "paragraphContainer")

		buildYearSelector(yearContainer, "size")
		buildInclusionTypeSelector(inclusionContainer, "size")
		buildScatterPlot(plotContainer, "size")
		buildScaleTypeToggle(toggleContainer, scaleType)
		buildParagraphs(paragraphContainer, "sizeQuestion")

	}
	function updateSizeQuestion(year, inclusionType, scaleType){
		var svg = d3.select("#scatterSvg")
		// svg._voronoi = null;

		var scales = getScatterScales(+d3.select("#scatterSvg").attr("width") - scatterMargin.left - scatterMargin.right, +d3.select("#scatterSvg").attr("height") - scatterMargin.top - scatterMargin.bottom, scatterMargin, "size", year, inclusionType, scaleType)
		var x = scales[0]
		var y = scales[1]
		var xVar = getVarName(year, inclusionType);
		var yVar = "pop" + year


		svg.selectAll(".dot")
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
		if(section == "map"){ showMap() }
		else if(section == "health"){ showHealthQuestion() }
		else if(section == "size"){ showSizeQuestion() }
	})

	init();

})