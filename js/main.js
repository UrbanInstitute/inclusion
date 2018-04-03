var DATA_URL = "data/data.csv";
var DOT_RADIUS = 8;
var SMALL_MULT_SIZE = 220;
var SMALL_MULT_ROW_COUNT = 3;
var SMALL_MULT_RIGHT_PADDING = 17;
var SMALL_MULT_BOTTOM_PADDING = 22;
var COLORS = ["#0a4c6a","#46abdb","#cfe8f3","#fff2cf","#fccb41","#ca5800"]

var scatterMargin = {"left": 10, "right": 80, "top": 0, "bottom": 50}
var scatterSvg;


function parseQueryString(query) {
        var obj = {},
            qPos = query.indexOf("?"),
	    tokens = query.substr(qPos + 1).split('&'),
	    i = tokens.length - 1;
	if (qPos !== -1 || query.indexOf("=") !== -1) {
		for (; i >= 0; i--) {
			var s = tokens[i].split('=');
			obj[unescape(s[0])] = s.hasOwnProperty(1) ? unescape(s[1]) : null;
		};
	}
	return obj;
}
function updateQueryString(queryString){
	if (history.pushState) {
    	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
    	window.history.pushState({path:newurl},'',newurl);
	}

}

function getScatterWidth(){
	return 600;
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
    	.range(["#fff"].concat(COLORS));
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
	d[0] = +d.lon;
	d[1] = +d.lat;
	d.className = d.place.toLowerCase().replace(/[^\w\s]+/g, "").replace(/\s/g,"_") + "_" + d.stateabrev;
	d.place = d.place;
	d.stateabrev = d.stateabrev;
	d.rankeconhealth1980 = +d.rankeconhealth1980;
	d.rankeconinclusionindex1980 = +d.rankeconinclusionindex1980;
	d.rankraceinclusionindex1980 = +d.rankraceinclusionindex1980;
	d.rankoverallinclusionindex1980 = +d.rankoverallinclusionindex1980;
	d.rankeconhealth1990 = +d.rankeconhealth1990;
	d.rankeconinclusionindex1990 = +d.rankeconinclusionindex1990;
	d.rankraceinclusionindex1990 = +d.rankraceinclusionindex1990;
	d.rankoverallinclusionindex1990 = +d.rankoverallinclusionindex1990;
	d.rankeconhealth2000 = +d.rankeconhealth2000;
	d.rankeconinclusionindex2000 = +d.rankeconinclusionindex2000;
	d.rankraceinclusionindex2000 = +d.rankraceinclusionindex2000;
	d.rankoverallinclusionindex2000 = +d.rankoverallinclusionindex2000;
	d.rankeconhealth2013 = +d.rankeconhealth2013;
	d.rankeconinclusionindex2013 = +d.rankeconinclusionindex2013;
	d.rankraceinclusionindex2013 = +d.rankraceinclusionindex2013;
	d.rankoverallinclusionindex2013 = +d.rankoverallinclusionindex2013;
	d.pop1980 = +d.pop1980;
	d.pop1990 = +d.pop1990;
	d.pop2000 = +d.pop2000;
	d.pop2013 = +d.pop2013;
	d.logpop1980 =  Math.log10(+d.pop1980);
	d.logpop1990 = Math.log10(+d.pop1990);
	d.logpop2000 = Math.log10(+d.pop2000);
	d.logpop2013 = Math.log10(+d.pop2013);
	d.everrecover = (d.everrecover == 1);
	d.recoverstart = (d.recovperiod != "x") ? +(d.recovperiod.split("-")[0]) : 0;
	d.recoverend = (d.recovperiod != "x") ? +(d.recovperiod.split("-")[1]) : 0;
	return d
}, function(data){
	function init(){

		setYear("2013");
		setInclusionType("overall");
		setScaleType("log");
		buildSearchBox();
		var parameters = parseQueryString(window.location.search);
		if(parameters.hasOwnProperty("topic")){
			buildHeader(data, false)
			d3.select("body").classed("cityPage", false)
			if(parameters.topic == "economic-health"){
				d3.select(".questionMenu.health").classed("active", true)
				showHealthQuestion()
			}
			else if(parameters.topic == "city-size"){
				d3.select(".questionMenu.size").classed("active", true)
				showSizeQuestion()
			}
			else if(parameters.topic == "economic-recovery"){
				d3.select(".questionMenu.change").classed("active", true)
				showChangeQuestion()
			}
			else{
				d3.select(".questionMenu.map").classed("active", true)
				showMap()
			}
		}
		else if(parameters.hasOwnProperty("city")){
			buildHeader(data, parameters.city)
			buildCityPage(parameters.city)
		}
		else{
			buildHeader(data, false)
			d3.select("body").classed("cityPage", false)
			d3.select(".questionMenu.map").classed("active", true)
			showMap()
		}
	}
	function hideAll(){

	}
	function buildSearchBox(){
	var sorted = [{"className":"default","text": "See how your city ranks"}].concat(data.concat().sort(function(a, b){
			var textA = a.className;
			var textB = b.className;
			return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;

		})
	)
	d3.select("#combobox")
		.selectAll("option")
		.data(sorted)
		.enter()
		.append("option")
		.attr("value", function(d){ return d.className})
		.html(function(d){
			return (d.className == "default") ? d.text : d.place + ", " + d.stateabrev
		})


  $( function() {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";
 
        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            classes: {
              "ui-tooltip": "ui-state-highlight"
            }
          });
 
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
          },
 
          autocompletechange: "_removeIfInvalid"
        });
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
 
        $( "<a>" )
          .attr( "tabIndex", -1 )
          .attr( "title", "Click to see all cities" )
          .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .on( "mousedown", function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .on( "click", function() {
            input.trigger( "focus" );
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },
 
      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },
 
      _removeIfInvalid: function( event, ui ) {
 
        // Selected an item, nothing to do
        if ( ui.item ) {
          return;
        }
 
        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            return false;
          }
        });
 
        // Found a match, nothing to do
        if ( valid ) {
          return;
        }
 
        // Remove invalid value
        this.input
          .val( "" )
          .attr( "title", value + " didn't match any item" )
          .tooltip( "open" );
        this.element.val( "" );
        this._delay(function() {
          this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 );
        this.input.autocomplete( "instance" ).term = "";
      },
 
      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });
 
    $( "#combobox" ).combobox();
    $( "#toggle" ).on( "click", function() {
      $( "#combobox" ).toggle();
    });


  } );
}
	function buildYearSelector(container, section){
		var width = 390;
		var height = 70;

		container
			.style("width", width + "px")
		var svg = container.append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
		svg.append("line")
			.attr("x1", 40)
			.attr("x2", width - 40)
			.attr("y1", 40)
			.attr("y2", 40)
			.style("stroke", "#707070")


		var g = svg.selectAll(".yearSelect")
			.data(["1980","1990","2000","2013"])
			.enter()
			.append("g")
			.attr("transform", function(d, i){
				var nudge = 30;
				return "translate(" + (i*((width*.8)/3) + nudge) + ",0)"
			})
			.attr("class", function(d){
				return (getYear() == d) ? "yearSelect active" : "yearSelect"
			})
			.on("click", function(d){
				d3.select("g.active circle.outer")
					.transition()
					.attr("r", 9)
					.attr("cx", 9)
				d3.select("g.active circle.inner")
					.transition()
					.attr("r", 7)
					.attr("cx", 9)
					.style("fill", "#696969")
				d3.select("g.active .yLabel")
					.style("font-weight", "normal")

				d3.select(this).select("circle.outer")
					.transition()
					.attr("r", 12)
					.attr("cx", 12)
				d3.select(this).select("circle.inner")
					.transition()
					.attr("r", 10)
					.attr("cx", 12)
					.style("fill", "#12719E")
				d3.select(this).select(".yLabel")
					.style("font-weight", "bold")


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

		g.append("text")
			.attr("class", "yLabel")
			.text(function(d){ return d})
			.style("font-weight", function(d){
				return (getYear() == d) ? "bold" : "normal";
			})
			.style("font-size", "16px")
			.style("color", "##707070")
			.attr("y", 20)
			.attr("x", -9.5)

		g.append("circle")
			.attr("class", "outer")
			.attr("r", function(d){
				return (getYear() == d) ? 12 : 9;
			})
			.attr("cx", function(d){
				return (getYear() == d) ? 12 : 9;
			})
			.attr("cy", 40)
			.style("stroke", "#707070")
			.style("fill", "#ffffff")
		g.append("circle")
			.attr("class", "inner")
			.attr("r", function(d){
				return (getYear() == d) ? 10 : 7;
			})
			.attr("cx", function(d){
				return (getYear() == d) ? 12 : 9;
			})
			.attr("cy", 40)
			.style("stroke", "none")
			.style("fill", function(d){
				return (getYear() == d) ? "#12719E" : "#696969";
				"#ffffff"
			})


			// .text(function(d){ return d})

	}
	function buildInclusionTypeSelector(container, section){
		var buttonLabels = {"overall": "Overall inclusion rank", "econ": "Economic inclusion rank", "race": "Racial inclusion rank"}
		container.
			selectAll(".inclusionSelect")
			.data(["overall","econ","race"])
			.enter()
			.append("div")
			.attr("class", function(d){
				return (getInclusionType() == d) ? "inclusionSelect active" : "inclusionSelect"
			})
			.text(function(d){ return buttonLabels[d] })
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
	function buildLegend(container, section){
		container.append("div")
			.attr("id","legend-title")
			.text("2013 overall inclusion")
		var dotContainer = container.append("div")
			.attr("id","legend-dots")
		dotContainer.selectAll(".legendDot")
			.data(COLORS)
			.enter()
			.append("div")
			.attr("class","legendDot")
			.style("background", function(d){ return d})
			.on("mouseover", function(d,i){
				var r;
				if(section == "map"){
					var r = (d3.select(".states.active").node() == null) ? 8 : 4;
				}else{
					r = 12;
				}
				var dots = d3.selectAll(".dot.r" + i)
				dots.transition()
					.attr("r",r)
				dots.each(function(){
					this.parentNode.appendChild(this)
				})
			})
			.on("mouseout", function(d,i){
				var r;
				if(section == "map"){
					r = (d3.select(".states.active").node() == null) ? 4 : 2;
				}else{
					r = 8;
				}
				var dots = d3.selectAll(".dot.r" + i)
				dots.transition()
					.attr("r",r)
			})

		container.append("div")
			.attr("id","legend-more")
			.text("More inclusive")
		container.append("div")
			.attr("id","legend-less")
			.text("Less inclusive")
	}

	function removeTooltip(fade){
		if(fade){
			d3.selectAll("#tt-container")
				.transition()
				.style("opacity",0)
				.on("end", function(){
					d3.select(this).remove()
				})
		}else{
			d3.selectAll("#tt-container").remove()
		}
	}
	function showTooltip(svg, x, y, datum, section){
		removeTooltip(false);
		x = x - svg.node().getBoundingClientRect().left
		y = y - svg.node().getBoundingClientRect().top
		var ttw = 240,
		 	tth = (section == "map") ? 120 : 150,
			w = getScatterWidth(),
			h = (section == "map") ? w*.618 : w,
			transX,
			transY;

		var left, up;
		if(x + ttw + 15 > w){
			left = true;
		}else{
			left = false;
		}

		if(y + tth + 15 > h){
			up = true
		}else{
			up = false
		}


		if(section == "map"){
			transX = (left) ? (x - ttw ) : x + 10,
			transY = (up) ? y - tth  : y + 10
		}else{
			transX = (left) ? (x - ttw - 2) : x + 20,
			transY = (up) ? y - tth + 18  : y + 28			
		}


		var tt = d3.select(svg.node().parentNode).append("div")
			.datum(datum)
			.attr("id", "tt-container")
			.classed("left", left)
			.classed("right", !left)
			.classed("up", up)
			.classed("down", !up)
			.style("left", transX + "px")
			.style("top", transY + "px")
			.style("width", (ttw-24)+"px")
			.style("height", (tth-24)+"px")


		tt.append("div")
			.attr("id","tt-title")
			.html(function(d){
				return d.place + ", " + d.stateabrev + "<i class=\"fa fa-times\" aria-hidden=\"true\"></i>"
			})
			.on("click", function(){
				if(d3.event.layerX >= ttw -40){
					d3.select("#tt-container").remove()
				}
			})
		d3.select("#tt-title svg")
			.on("click", function(){ console.log("ASDF")})
		if(section == "size"){
			tt.append("div")
				.attr("class","tt-text")
				.text(function(d){
					var year = getYear();
					return "Population: " + d3.format(",")(d["pop" + year]) + " in " + year
				})

		}
		tt.append("div")
			.attr("class","tt-text")
			.text(function(d){
				var inclusionType = getInclusionType()
				var year = getYear()
				var varName = getVarName(year, inclusionType)
				var fullTypes = {"overall": "overall inclusion", "econ": "economic inclusion", "race": "racial inclusion"}

				return "Rank: " + d[varName] + " of 274 cities on " + fullTypes[inclusionType] + " in " + year
			})

		tt.append("div")
			.attr("id", "tt-click")
			.html(function(d){
				return "<a href = \"index.html?city=" + d.className + "\" target = \"_blank\"> Click to see city profile<i class=\"fas fa-arrow-right\"></i></a>"

			})

		// 	// .attr("transform", "translate(" + transX + "," + transY + ")")
		// tt.append("rect")
		// 	.attr("width", ttw)
		// 	.attr("height", tth)
		// 	.style("fill","#EEEEEE")

		// tt.append("text")
		// 	.attr("id","tt-title")
		// 	.attr("x", 10)
		// 	.attr("y", 25)


// 



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
			yMax = 0;
		}
		var yMin;
		if(section == "size"){
			if(scaleType == "linear"){
				yMin = d3.min(data, function(d){ return d["pop" + "1980"]})
			}else{
				yMin = d3.min(data, function(d){ return d["logpop" + "1980"] })
			}

		}else{
			yMin = 274;
		}

		var x = d3.scaleLinear().range([margin.left, width]).domain([ 274, 0])
		var y = d3.scaleLinear().range([height, margin.bottom]).domain([yMin,yMax])
		return [x,y]
	}

	function removeScatterTooltip(d){
		d3.selectAll(".dot").classed("hover", false)
	}
	function showScatterTooltip(d){
		d3.selectAll(".dot:not(." + d.className + ")")
			.classed("hover", false)
			.transition()
			.attr("r",8)
		var dot = d3.select(".dot." + d.className)
			.classed("hover", true)
			.transition()
			.attr("r",12)
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
		scatterSvg.append("rect")
			.attr("width",width + margin.left + margin.right)
			.attr("height",height + margin.left + margin.right)
			.style("fill","transparent")

		if(section == "size"){
			scatterSvg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + (height) + ")")
				.call(d3.axisBottom(x).tickValues([1,50,100,150,200,274]).tickSize(-height+margin.bottom));
		}else{
			scatterSvg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + (40) + ")")
				.call(d3.axisTop(x).tickValues([1,50,100,150,200,274]).tickSize(-height+margin.bottom - 24));		
		}

		container.style("position","relative")

		if(section == "size"){
			container.append("div")
				.attr("class", "axisLabel rotate size")
				.attr("id", "ml_y_1")
				.text("Larger")
			container.append("div")
				.attr("class", "axisLabel rotate size")
				.attr("id", "ml_y_2")
				.text("Smaller")
			container.append("div")
				.attr("class", "axisLabel size")
				.attr("id", "ml_x_1")
				.text("Less inclusive")
			container.append("div")
				.attr("class", "axisLabel size")
				.attr("id", "ml_x_2")
				.text("More inclusive")

		}else{
			container.append("div")
				.attr("class", "axisLabel rotate econHealth")
				.attr("id", "ml_y_1")
				.text("More healthy")
			container.append("div")
				.attr("class", "axisLabel rotate econHealth")
				.attr("id", "ml_y_2")
				.text("Less healhty")
			container.append("div")
				.attr("class", "axisLabel econHealth")
				.attr("id", "ml_x_1")
				.text("Less inclusive")
			container.append("div")
				.attr("class", "axisLabel econHealth")
				.attr("id", "ml_x_2")
				.text("More inclusive")
		}
		if(section == "size"){
			scatterSvg.append("g")
				.attr("class", "axis axis--y")
				.attr("transform", "translate(" + (width + 20) + ",0)")
				.call(d3.axisRight(y).ticks(5).tickSize(-width-20));			
		}else{
			scatterSvg.append("g")
				.attr("class", "axis axis--y")
				.attr("transform", "translate(" + (width + 10) + ",0)")
				.call(d3.axisRight(y).tickValues([1,50,100,150,200,274]).tickSize(-width-20));	
		}



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
				var rank = COLORS.reverse().indexOf(getRankColor(d.rankoverallinclusionindex2013))
				return "dot " + d.className + " r" + rank;
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
				return getRankColor(d["rankoverallinclusionindex2013"])
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
				.on("click", function(){
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
					// window.open("index.html?city=" + site.data.className, "_blank")
						showTooltip(
							d3.select("#plotContainer svg"),
							d3.select(".dot." + site.data.className).node().getBoundingClientRect().left,
							d3.select(".dot." + site.data.className).node().getBoundingClientRect().top,
							site.data,
							section)

				})

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
			.attr("class", key)
			.selectAll("p")
			.data(allText[key])
			.enter()
			.append("p")
			.html(function(d){ return d})
			
	}
	function buildHeader(data, city){
		var text = "",
			datum = {}
		if(city == false){
			d3.select("#titleContainer #title").text("Inclusion and Economic Health in US Cities")
			d3.select("#titleContainer #subtitle").text("").style("display","none")
			text = allText.mainHeader
		}else{
			datum = data.filter(function(o){ return o.className == city })[0]
			d3.select("#titleContainer #title").text(datum.place + ", " + datum.stateabrev)
			d3.select("#titleContainer #subtitle").text("2013 Population " + d3.format(",")(datum.pop2013)).style("display","block")
			if(datum.rankoverallinclusionindex2000 == datum.rankoverallinclusionindex2013){
				text = allText.cityHeaderNoOverallChange
			}
			else if(datum.rankeconhealth2000 == datum.rankeconhealth2013){
				text = allText.cityHeaderNoHealthChange
			}else{
				text = allText.cityHeaderBothChange
			}
		}

		var ps = d3.select("#titleContainer")
			.selectAll("p")
			.data(text)
			.enter()
			.append("p")
			.attr("class", "introText")
			.html(function(d){ return d })

		ps.selectAll(".ch-cityName")
			.datum(datum)
			.html(function(d){ return d.place })
		ps.selectAll(".ch-overallRank13")
			.datum(datum)
			.html(function(d){ return d.rankoverallinclusionindex2013 })
		ps.selectAll(".ch-econRank13")
			.datum(datum)
			.html(function(d){ return d.rankeconinclusionindex2013 })
		ps.selectAll(".ch-racialRank13")
			.datum(datum)
			.html(function(d){ return d.rankraceinclusionindex2013 })
		ps.selectAll(".ch-healthRank13")
			.datum(datum)
			.html(function(d){ return d.rankeconhealth2013 })
		ps.selectAll(".ch-overallRank00")
			.datum(datum)
			.html(function(d){ return d.rankoverallinclusionindex2000 })
		ps.selectAll(".ch-healthRank00")
			.datum(datum)
			.html(function(d){ return d.rankeconhealth2000 })
		ps.selectAll(".ch-healthWord")
			.datum(datum)
			.html(function(d){ return (d.rankeconhealth2013 > d.rankeconhealth2000) ? "increased" : "decreased" })
		ps.selectAll(".ch-overallWord")
			.datum(datum)
			.html(function(d){ return (d.rankoverallinclusionindex2013 > d.rankoverallinclusionindex2000) ? "more" : "less" })
		ps.selectAll(".ch-overallWord2")
			.datum(datum)
			.html(function(d){ return (d.rankoverallinclusionindex2013 > d.rankoverallinclusionindex2000) ? "jumping" : "falling" })
	}

	function mapdeHover(d){
		d3.selectAll(".dot")
			.classed("hover", false)
			.transition()
			.attr("r",2)
	}
	function mapHover(d){
		d3.selectAll(".dot").classed("hover", false)
		var dot = d3.select(".dot." + d.className)
			.classed("hover", true)
			.transition()
			.attr("r",5)
		dot.node().parentNode.appendChild(dot.node())
	}

	function showMap(){
		d3.select("#questionTitle").html("")
		
		updateQueryString("?topic=map")
		var year = getYear();
		var inclusionType = getInclusionType();

		var year = getYear();
		var inclusionType = getInclusionType();
		var varName = getVarName(year, inclusionType);

		var graphContainer = d3.select("#graphContainer")
		graphContainer.attr("class", "mapQuestion")
		var yearContainer = graphContainer.append("div").attr("id", "yearContainer")
		var note = graphContainer.append("div").attr("id","noteContainer")
		var plotContainer = graphContainer.append("div").attr("id", "plotContainer")
		var legendContainer = graphContainer.append("div").attr("id", "legendContainer")
		var inclusionContainer = graphContainer.append("div").attr("id", "inclusionContainer")
		d3.select("#sidebarContainer").attr("class","map")

		graphContainer.style("height", "auto")

		buildYearSelector(yearContainer, "map")
		buildInclusionTypeSelector(inclusionContainer, "map")
		buildLegend(legendContainer,"map")

		note.text("Click to zoom in")

		var w = getScatterWidth();
		var h = w*.618;

		var projection = d3.geoAlbersUsa()
			.scale(w*1.31)
			.translate([w/2, h/2]);

		var path = d3.geoPath()
			.projection(projection);

		var voronoi = d3.voronoi()
			.extent([[-1, -1], [w + 1, h + 1]]);

		var svg = plotContainer
			.append("svg")
			.style("width", w + "px")
			.style("height", h + "px")
			.append("g");

		var mapData = data.filter(function(d){
			return (projection([d[0], d[1] ]) != null)
		})

		var startx, starty;
		function dragStart(){
			removeTooltip(true);
			d3.selectAll(".cell-path").classed("grab", false)
			d3.selectAll(".cell-path").classed("grabbing", true)
			var currentTrans =  d3.select("#plotContainer svg .states").attr("transform")
			var offsetX, offsetY;
			if(currentTrans != null && currentTrans != ""){
				currentTrans = currentTrans.replace("translate(","").replace(")","").split(",")
				offsetX = +currentTrans[0]
				offsetY = +currentTrans[1]
			}else{
				offsetX = 0
				offsetY = 0
			}
	
			startx = +d3.event.x - offsetX
			starty = +d3.event.y - offsetY

		}
		function dragEnd(){
			d3.selectAll(".cell-path").classed("grab", true)
			d3.selectAll(".cell-path").classed("grabbing", false)
			startx = null
			starty = null
		}
		function dragged() {
		  var dx = (d3.event.x - startx),
		  dy = (d3.event.y - starty)
		  d3.selectAll("#plotContainer svg .states").attr("transform", "translate(" + dx + "," + dy + ")");
		  d3.selectAll("#plotContainer svg circle").attr("transform", "translate(" + dx + "," + dy + ")");
		  d3.selectAll("#plotContainer svg .cell").attr("transform", "translate(" + dx + "," + dy + ")");
		}
		function nozoom() {
		  d3.event.preventDefault();
		}

		var drag = d3.drag()
		    .on("start", dragStart)
		    .on("drag", dragged)
		    .on("end", dragEnd);	

		var active = d3.select(null);

		d3.json("data/map.json", function(error, us) {
			var zoomOut = plotContainer.append("div")
				.attr("id","zoomOut")
				.text("Zoom out")
				.on("click", reset)

			svg
				.on("touchstart", nozoom)
    			.on("touchmove", nozoom)
				.selectAll(".states")
					.data(topojson.object(us, us.objects.states).geometries)
					.enter()
					.append("path")
					.attr("class", "states")
					.attr("d", path)
					.on("mouseover", function(d){
						d3.select(this).classed("hover", true)
					})
					.on("mouseout", function(d){
						d3.select(this).classed("hover", false)	
					})
				    .on("click", function(d){
				    	clicked(this, d)
				    })

			function clicked(obj, d) {
				zoomOut.transition().style("opacity",1)
				active.classed("active", false);
				active = d3.select(obj).classed("active", true);

				d3.select("#noteContainer").text("Click a dot for more information")

				var bounds = path.bounds(d),
				dx = bounds[1][0] - bounds[0][0],
				dy = bounds[1][1] - bounds[0][1],
				x = (bounds[0][0] + bounds[1][0]) / 2,
				y = (bounds[0][1] + bounds[1][1]) / 2,
				scale = .9 / Math.max(dx / w, dy / h),
				translate = [w / 2 - scale * x, h / 2 - scale * y];

				svg.transition()
				.duration(750)
				.style("stroke-width", 1.5 / scale + "px")
				.attr("transform", "translate(" + translate + ")scale(" + scale + ")");

				d3.selectAll(".dot")
					.transition()
					.duration(750)
					.attr("r",2)

				var cell = svg.selectAll(".cell")
					.data(mapData)
					.enter().append("g")
					.attr("class", "cell")
					.on("mouseover", function(d){
						d3.selectAll(".cell-path").classed("grab", true)
						d3.selectAll(".cell-path").classed("grabbing", false)
						mapHover(d)
					})
					.on("click", function(d){
						var coords = (projection([d[0], d[1] ]) == null) ? [0,0] : projection([d[0], d[1] ])
						showTooltip(
							d3.select("#plotContainer svg"),
							d3.select(".dot." + d.className).node().getBoundingClientRect().left,
							d3.select(".dot." + d.className).node().getBoundingClientRect().top,
							d,
							"map")
						// window.open("index.html?city=" + d.className,'_blank');

					})


					.on("mouseout", function(d){
						mapdeHover()
					})
					.style("pointer-events", function(){ return (active == null) ? "none" : "all"})
					.call(drag);


				cell.append("g")
					.append("path")
					.data(voronoi.polygons(mapData.map(projection)))
					.attr("class", "cell-path")
					.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });	
			}

			function reset() {
				removeTooltip(true);
				mapdeHover(null);

				d3.select("#noteContainer").text("Click to zoom in")

				zoomOut.transition().style("opacity",0)
				d3.selectAll(".cell").remove()
				active.classed("active", false);
				active = d3.select(null);

				svg.transition()
				.duration(750)
				.style("stroke-width", "1.5px")
				.attr("transform", "");

				d3.selectAll("#plotContainer svg .states").attr("transform", "");
				d3.selectAll("#plotContainer svg circle").attr("transform", "");
				d3.selectAll("#plotContainer svg .cell").attr("transform", "");

				d3.selectAll(".dot")
					.transition()
					.duration(750)
					.attr("r",4)
			}


			var dots = svg.append("g")
			dots.selectAll(".dot")
				.data(mapData)
				.enter()
				.append("circle")
				.attr("class", function(d){
					var rank = COLORS.reverse().indexOf(getRankColor(d[varName]))
					return "dot " + d.className + " r" + rank;
				})
				.attr("cx", function(d){
					var coords = (projection([d[0], d[1] ]) == null) ? [0,0] : projection([d[0], d[1] ])
					return coords[0]
				})
				.attr("cy", function(d){
					var coords = (projection([d[0], d[1] ]) == null) ? [0,0] : projection([d[0], d[1] ])
					return coords[1]
				})
				.attr("r",function(d){
					return 4
				})
				.style("opacity",.75)
				.attr("fill", function(d){ return getRankColor(d[varName])});




		})

		var inclusionText = {"econ": " economic inclusion", "race": " racial inclusion", "overall": " overall inclusion"}
		var inclusionSpace = {"econ": 18, "race": -10, "overall": 0}

		d3.select("#legend-title").text(year + inclusionText[inclusionType])
		d3.select("#legendContainer").style("width", (140 + inclusionSpace[inclusionType]) + "px").style("right", (-150 - inclusionSpace[inclusionType]) + "px")

	}
	function updateMap(year, inclusionType){
		removeTooltip(true);
		var varName = getVarName(year, inclusionType);
		var inclusionText = {"econ": " economic inclusion", "race": " racial inclusion", "overall": " overall inclusion"}
		var inclusionSpace = {"econ": 18, "race": -10, "overall": 0}
		d3.selectAll(".dot")
			.attr("class", function(d){
				var rank = COLORS.reverse().indexOf(getRankColor(d[varName]))
				return "dot " + d.className + " r" + rank;
			})
			.transition()
			.duration(600)
			.attr("fill", function(d){
				return getRankColor(d[getVarName(year, inclusionType)])
			})
		d3.select("#legend-title").text(year + inclusionText[inclusionType])
		d3.select("#legendContainer").style("width", (140 + inclusionSpace[inclusionType]) + "px").style("right", (-150 - inclusionSpace[inclusionType]) + "px")
	}

	function showHealthQuestion(){
		d3.select("#questionTitle").html(d3.select(".questionMenu[data-section=health]").html())
		updateQueryString("?topic=economic-health")
		var year = getYear();
		var inclusionType = getInclusionType();
		var varName = getVarName(year, inclusionType);

		var graphContainer = d3.select("#graphContainer")
		graphContainer.attr("class", "healthQuestion")
		graphContainer.style("height", "auto")

		var yearContainer = graphContainer.append("div").attr("id", "yearContainer")
		var plotContainer = graphContainer.append("div").attr("id", "plotContainer")
		var inclusionContainer = graphContainer.append("div").attr("id", "inclusionContainer")
		var paragraphContainer = d3.select("#sidebarContainer").attr("class","healthQuestion").append("div").attr("id","paragraphContainer")
		var legendContainer = d3.select("#sidebarContainer").attr("class","healthQuestion").append("div").attr("id","legendContainer").attr("class", "scatter")


		buildYearSelector(yearContainer, "health")
		buildInclusionTypeSelector(inclusionContainer, "health")
		buildScatterPlot(plotContainer, "health")
		buildParagraphs(paragraphContainer, "healthQuestion")
		buildLegend(legendContainer,"health")
	}
	function updateHealthQuestion(year, inclusionType){
		removeTooltip(true)
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

		fitLine.node().parentNode.appendChild(fitLine.node())
	}

	function buildScaleTypeToggle(container, scaleType){
		container.append("div")
			.attr("id","scaleLabel")
			.text("Y-axis scale: ")
		container
			.append("div")
			.attr("class", function(){
				return (getScaleType() == "linear") ? "linear scaleSelect active" : "linear scaleSelect"
			})
			.text("Linear")
			.on("click", function(d){
				setScaleType("linear")
				d3.selectAll(".scaleSelect.active").classed("active", false)
				d3.select(this).classed("active", true)
				updateSizeQuestion(getYear(), getInclusionType(), "linear")
			})
		function slide(){
			if(d3.select(".scaleSelect.log").classed("active")){
				setScaleType("linear")
				d3.selectAll(".scaleSelect.active").classed("active", false)
				d3.select(".scaleSelect.linear").classed("active", true)
				updateSizeQuestion(getYear(), getInclusionType(), "linear")
			}else{
				setScaleType("log")
				d3.selectAll(".scaleSelect.active").classed("active", false)
				d3.select(".scaleSelect.log").classed("active", true)
				updateSizeQuestion(getYear(), getInclusionType(), "log")
			}
		}
		container.append("div")
			.attr("id", "sliderContainer")
			.on("click", slide)
		container.append("div")
			.attr("id", "sliderButton")
			.on("click", slide)
		container
			.append("div")
			.attr("class", function(){
				return (getScaleType() == "log") ? "log scaleSelect active" : "log scaleSelect"
			})
			.text("Logarithmic")
			.on("click", function(d){
				setScaleType("log")
				d3.selectAll(".scaleSelect.active").classed("active", false)
				d3.select(this).classed("active", true)
				updateSizeQuestion(getYear(), getInclusionType(), "log")
			})

	}
	function showSizeQuestion(){
		d3.select("#questionTitle").html(d3.select(".questionMenu[data-section=size]").html())
		updateQueryString("?topic=city-size")
		var scaleType = getScaleType();

		var graphContainer = d3.select("#graphContainer")
		graphContainer.attr("class", "sizeQuestion")
		var yearContainer = graphContainer.append("div").attr("id", "yearContainer")
		var toggleContainer = graphContainer.append("div").attr("id", "toggleContainer")
		var plotContainer = graphContainer.append("div").attr("id", "plotContainer")
		var inclusionContainer = graphContainer.append("div").attr("id", "inclusionContainer")
		var paragraphContainer = d3.select("#sidebarContainer").attr("class","sizeQuestion").append("div").attr("id","paragraphContainer")
		var legendContainer = d3.select("#sidebarContainer").attr("class","sizeQuestion").append("div").attr("id","legendContainer").attr("class", "scatter")
		graphContainer.style("height", "auto")

		buildYearSelector(yearContainer, "size")
		buildInclusionTypeSelector(inclusionContainer, "size")
		buildScatterPlot(plotContainer, "size")
		buildScaleTypeToggle(toggleContainer, scaleType)
		buildParagraphs(paragraphContainer, "sizeQuestion")
		buildLegend(legendContainer, "size")

	}
	function updateSizeQuestion(year, inclusionType, scaleType){
		removeTooltip(true)
		if(scaleType == "linear"){ d3.select("#sliderButton").transition().style("left","171px") }
		else{ d3.select("#sliderButton").transition().style("left","194px") }

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
				.call(d3.axisRight(y).ticks(5).tickSize(-(+d3.select("#scatterSvg").attr("width")-scatterMargin.left-scatterMargin.right)-40).tickFormat(tickFormat))
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

	function buildChangeDropdown(container, x, y){
		container.append("div")
			.attr("id","smallMenuLabel")
			.text("Compare economic health to:")

		var inclusionType = getInclusionType();
		var menu = container.append("select")
		var types = [{"value": "overall", "text": "OVERALL INCLUSION"},{"value": "race", "text": "RACIAL INCLUSION"},{"value": "econ", "text": "ECONOMIC INCLUSION"}]

		menu.selectAll("option")
			.data(types)
			.enter()
			.append("option")
			.attr("value", function(d){ return d.value })
			.attr("selected", function(d){ return (d.value == inclusionType) ? "selected" : null })
			.text(function(d){ return d.text })

		$( $(menu.node()) ).selectmenu({
			change: function(event, menuData){
				var val = menuData.item.value;
				updateChangeQuestion(val, x, y)
			}

  		});

  		container.style("width", (SMALL_MULT_ROW_COUNT * 220 + (SMALL_MULT_ROW_COUNT-1) * 21)  + "px")
  		var legend = container.append("div")
  			.attr("id","smallLegend")
  		var legendLeft = legend.append("div")
  			.attr("class","smallLegendContainer left")
  		var legendRight = legend.append("div")
  			.attr("class","smallLegendContainer right")

  		legendLeft.append("div")
  			.attr("class","smallLegendLabel")
  			.text("Inclusion rank")
  			.append("span")
  				.attr("class","legendSymbol series inclusion")
  		
  		legendLeft.append("div")
  			.attr("class","smallLegendLabel")
  			.text("Economic health rank")
  			.append("span")
  				.attr("class","legendSymbol series health")

  		legendRight.append("div")
  			.attr("class","smallLegendLabel")
  			.text("Inclusion rose during recovery")
  			.append("span")
  				.attr("class","legendSymbol recovery rose")

  		legendRight.append("div")
  			.attr("class","smallLegendLabel")
  			.text("Inclusion fell during recovery")
  			.append("span")
  				.attr("class","legendSymbol recovery fell")



	}

	function showChangeQuestion(){
		d3.select("#questionTitle").html(d3.select(".questionMenu[data-section=change]").html())
		updateQueryString("?topic=economic-recovery")
		var heightScalar = .9;
		var changeData = data.filter(function(a){ return a.everrecover })
			.sort(function(a, b){ return (a["rankoverallinclusionindex" + a.recoverend] - a["rankoverallinclusionindex" + a.recoverstart]) - (b["rankoverallinclusionindex" + b.recoverend] - b["rankoverallinclusionindex" + b.recoverstart]) })

		var graphContainer = d3.select("#graphContainer")
		graphContainer.attr("class", "changeQuestion")

		var paragraphContainer = d3.select("#sidebarContainer").attr("class","changeQuestion")
		var inclusionType = getInclusionType()
		var marginSmall = {"left": 50, "right": 40, "top": 40, "bottom": 60}
		var w = SMALL_MULT_SIZE - marginSmall.left - marginSmall.right;
		var h = SMALL_MULT_SIZE*heightScalar - marginSmall.left - marginSmall.right

		var x = d3.scaleLinear().range([marginSmall.left, SMALL_MULT_SIZE-marginSmall.right]).domain([1980, 2013])
		var y = d3.scaleLinear().range([SMALL_MULT_SIZE*heightScalar - marginSmall.bottom, marginSmall.top]).domain([274,0])

		graphContainer.style("height", ((Math.ceil(changeData.length/SMALL_MULT_ROW_COUNT)) * (SMALL_MULT_SIZE + SMALL_MULT_BOTTOM_PADDING) )  + "px")

		var chartDiv = graphContainer
			.selectAll(".chartDiv")
			.data(changeData)
			.enter()
			.append("div")
			.attr("class", function(d){ return "chartDiv " + d.className })
			.style("width", SMALL_MULT_SIZE + "px")
			.style("height", SMALL_MULT_SIZE + "px")
			.style("left", function(d, i){
				return ((i%SMALL_MULT_ROW_COUNT) * (SMALL_MULT_SIZE + SMALL_MULT_RIGHT_PADDING)) + "px"
			})
			.style("top", function(d, i){
				return (Math.floor(i/SMALL_MULT_ROW_COUNT) * (SMALL_MULT_SIZE + SMALL_MULT_BOTTOM_PADDING)) + "px"
			})

		chartDiv.append("div")
			.attr("class","chartTitle")
			.text(function(d){
				return d.place + ", " + d.stateabrev
			})
			.append("span")
				.html(function(d){
					return "<a href = \"index.html?city=" + d.className + "\" target = \"_blank\"> See city <i class=\"fas fa-arrow-right\"></i></a>"
			})

		chartDiv.append("div")
			.attr("class","chartSubtitle")
			.html(function(d){
				var change = d["rankoverallinclusionindex" + d.recoverend] - d["rankoverallinclusionindex" + d.recoverstart]
				var changeWord = (change < 0) ? "rose" : "fell"

				return "<span class = \"inclSpan\">Overall inclusion</span> " + changeWord + " " + Math.abs(change) + " ranks during the <span class = \"healthSpan\">economic recovery</span> period."	
			})
		var svg = chartDiv.append("svg")
			.attr("width", SMALL_MULT_SIZE)
			.attr("height", SMALL_MULT_SIZE*heightScalar)
		svg.append("rect")
			.attr("fill","#fff")
			.attr("stroke","none")
			.attr("x",0)
			.attr("y",0)
			.attr("width", SMALL_MULT_SIZE)
			.attr("height", SMALL_MULT_SIZE*heightScalar - 50)
		svg.append("g")
			.attr("class", "axis axis--y")
			.attr("transform", "translate(" + (SMALL_MULT_SIZE - 20) + ",0)")
			.call(d3.axisLeft(y).tickValues([0,100,200,274]).tickSize(SMALL_MULT_SIZE - 50));
		svg.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + marginSmall.top + ")")
			.call(d3.axisTop(x).tickValues([1980, 1990, 2000, 2013]).tickFormat(d3.format(".0f")));
	
		svg.on("mousemove", function(d){
			d3.selectAll(".smallTT").remove()
			var yrs = [1980, 1990, 2000, 2013]
			var diffs = yrs.map(function(a){ return Math.abs(a- x.invert(d3.event.offsetX))})
			var year = yrs[diffs.indexOf(d3.min(diffs))]
			var inclusionType = getInclusionType()

			var ind = yrs.indexOf(year)
			d3.select(this).selectAll(".changeDot")
				.transition()
				.attr("r", function(){
					return (d3.select(this).classed("y" + ind)) ? 8 : 5;
				})

			var health = d["rankeconhealth" + year]
			var incl = d["rank" + inclusionType + "inclusionindex" + year]
			var top, bottom;
			if(health <= incl){
				top = health
				bottom = incl
			}else{
				top = incl
				bottom = health
			}
			var tt1 = d3.select(this).append("g")
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

			var tt2 = d3.select(this).append("g")
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
			
		})
		.on("mouseout", function(){
			d3.select(this).selectAll(".changeDot")
				.transition()
				.attr("r", 5)
			d3.selectAll(".smallTT").remove()
		})
		addCorrelationRect(svg, x, y, inclusionType, "econHealth");
		addLineSeries(svg, x, y, inclusionType, false);
		addLineSeries(svg, x, y, "econHealth", false);
		buildParagraphs(paragraphContainer, "changeQuestion");
		var menuContainer = paragraphContainer.append("div").attr("id", "menuContainer")
		buildChangeDropdown(menuContainer, x, y)


	}
	function updateChangeQuestion(inclusionType, x, y){
		setInclusionType(inclusionType)

		var sortData = data.filter(function(a){ return a.everrecover })
			.sort(function(a, b){ return (a["rank" + inclusionType + "inclusionindex" + a.recoverend] - a["rank" + inclusionType + "inclusionindex" + a.recoverstart]) - (b["rank" + inclusionType + "inclusionindex" + b.recoverend] - b["rank" + inclusionType + "inclusionindex" + b.recoverstart]) })
			.map(function(a){
				return a.className
			})

		d3.selectAll(".chartSubtitle")
			.text(function(d){
				var change = d["rank" + inclusionType + "inclusionindex" + d.recoverend] - d["rank" + inclusionType + "inclusionindex" + d.recoverstart]
				var changeWord = (change < 0) ? "rose" : "fell"
				var changeTypes = {"overall": "Overall inclusion ", "econ": "Economic inclusion ", "race": "Racial inclusion "}
				return changeTypes[inclusionType] + changeWord + " " + Math.abs(change) + " ranks during the economic recovery period."	
			})



		d3.selectAll(".chartDiv")
			.transition()
			.delay(500)
			.duration(1000)
			.style("left", function(d){
				var i = sortData.indexOf(d.className)
				return ((i%SMALL_MULT_ROW_COUNT) * (SMALL_MULT_SIZE + SMALL_MULT_RIGHT_PADDING)) + "px"
			})
			.style("top", function(d){
				var i = sortData.indexOf(d.className)
				return (Math.floor(i/SMALL_MULT_ROW_COUNT) * (SMALL_MULT_SIZE + SMALL_MULT_BOTTOM_PADDING)) + "px"
			})

		var svg = d3.selectAll(".chartDiv").select("svg")
		updateLineSeries(svg, x, y, inclusionType);
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
		else if(section == "change"){ showChangeQuestion() }


	})

	function buildCityPage(city){
		d3.select("body").classed("cityPage", true)
	}

	init();

})

$(window).scroll(function(e){
	var el = d3.select('#menuContainer');
	var elSide = d3.select(".questionMenu.map")
	if(el.node() == null){
		return false
	}else{
		//sticky legend and dropdown
		var isPositionFixed = (el.style('position') == 'fixed');
		var bottom = el.node().getBoundingClientRect().bottom
		var topCharts = d3.select("#graphContainer").node().getBoundingClientRect().top
		if (bottom < 152 && d3.select("#searchContainer").node().getBoundingClientRect().top > 156 && !isPositionFixed){ 
			var sideLeft = ($("#sidebarContainer")[0].getBoundingClientRect().left + 18) + "px"
			$('#menuContainer').css({'position': 'fixed', 'top': '98px', 'border-bottom': '6px solid #F5F5F5', "left": sideLeft}); 
			d3.select("#sidebarContainer").style("padding-bottom", "46px")
		}
		else if((bottom <= topCharts || d3.select("#searchContainer").node().getBoundingClientRect().top <= 156) && isPositionFixed)
		{
			$('#menuContainer').css({'position': 'static', 'top': '0px', 'border-bottom': '6px solid #ffffff', "left": "0px"}); 
			d3.select("#sidebarContainer").style("padding-bottom", "0px")
		}

		//sticky sidebar menu
		// var 
	}


})	