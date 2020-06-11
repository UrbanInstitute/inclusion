// var DATA_URL = "data/data.csv";

var SMALL_MULT_RIGHT_PADDING = 17;
var SMALL_MULT_BOTTOM_PADDING = 22;
var COLORS = ["#0a4c6a","#46abdb","#cfe8f3","#fff2cf","#fccb41","#ca5800"]

var scatterMargin = {"left": 10, "right": 80, "top": 0, "bottom": 50}
var scatterSvg;

Math.log10 = Math.log10 || function(x) {
  return Math.log(x) * Math.LOG10E;
};

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1.
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}



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
function scrollToAnchor(a_href){
	$('html, body').animate({
			scrollTop: $(a_href).offset().top - 140
		});
}
function hideInfoPopup(){
	d3.selectAll(".infoPopup")
		.transition()
		.style("opacity",0)
		.on("end", function(){
			d3.select(this).remove()
		})
}
function getDotRadius(){
	return (widthUnder(768)) ? 4 : 8
}
function getSmallMultSize(){
	return d3.select("#popupContainer").node().getBoundingClientRect().width * 1/getSmallMultRowCount();
}
function widthUnder(w){
	return d3.select("#breakpoint" + w).style("display") == "block"
}

function getSmallMultRowCount(){
	if(widthUnder(500)){
		return 1
	}
	else if(widthUnder(1000)){
		return 2;
	}
	else if(widthUnder(1250)){
		return 3;
	}else{
		return 4;
	}

}

function getScatterWidth(){
	return d3.select("#graphContainer").node().getBoundingClientRect().width
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

/*
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
*/


d3.csv("data/data.csv", function(error, data){
	data.forEach(function(d){
		d[0] = +d.Long;
		d[1] = +d.Lat;
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
        d.rankeconhealth2016 = +d.rankeconhealth2016;
        d.rankeconinclusionindex2016 = +d.rankeconinclusionindex2016;
        d.rankraceinclusionindex2016 = +d.rankraceinclusionindex2016;
        d.rankoverallinclusionindex2016 = +d.rankoverallinclusionindex2016;
		d.pop1980 = +d.pop1980;
		d.pop1990 = +d.pop1990;
		d.pop2000 = +d.pop2000;
		d.pop2013 = +d.pop2013;
        d.pop2016 = +d.pop2016;
		d.logpop1980 = Math.log10(+d.pop1980);
		d.logpop1990 = Math.log10(+d.pop1990);
		d.logpop2000 = Math.log10(+d.pop2000);
		d.logpop2013 = Math.log10(+d.pop2013);
        d.logpop2016 = Math.log10(+d.pop2016);
		// d.everrecover = (d.everrecover == 1);
		// d.recoverstart = (d.recovperiod != "x") ? +(d.recovperiod.split("-")[0]) : 0;
		// d.recoverend = (d.recovperiod != "x") ? +(d.recovperiod.split("-")[1]) : 0;
		// d.consolidated = +d.consolidated;
		d.pctemploymentchange1980 = +d.pctemploymentchange1980;
		d.MEANpctemploymentchange1980 = +d.MEANpctemploymentchange1980;
		d.pctemploymentchange1990 = +d.pctemploymentchange1990;
		d.MEANpctemploymentchange1990 = +d.MEANpctemploymentchange1990;
		d.pctemploymentchange2000 = +d.pctemploymentchange2000;
		d.MEANpctemploymentchange2000 = +d.MEANpctemploymentchange2000;
		d.pctemploymentchange2013 = +d.pctemploymentchange2013;
		d.MEANpctemploymentchange2013 = +d.MEANpctemploymentchange2013;
        d.pctemploymentchange2016 = +d.pctemploymentchange2016;
        d.MEANpctemploymentchange2016 = +d.MEANpctemploymentchange2016;
		d.unemprate1980 = +d.unemprate1980;
		d.MEANunemprate1980 = +d.MEANunemprate1980;
		d.unemprate1990 = +d.unemprate1990;
		d.MEANunemprate1990 = +d.MEANunemprate1990;
		d.unemprate2000 = +d.unemprate2000;
		d.MEANunemprate2000 = +d.MEANunemprate2000;
		d.unemprate2013 = +d.unemprate2013;
		d.MEANunemprate2013 = +d.MEANunemprate2013;
        d.unemprate2016 = +d.unemprate2016;
        d.MEANunemprate2016 = +d.MEANunemprate2016;
		d.vacancyrate1980 = +d.vacancyrate1980;
		d.MEANvacancyrate1980 = +d.MEANvacancyrate1980;
		d.vacancyrate1990 = +d.vacancyrate1990;
		d.MEANvacancyrate1990 = +d.MEANvacancyrate1990;
		d.vacancyrate2000 = +d.vacancyrate2000;
		d.MEANvacancyrate2000 = +d.MEANvacancyrate2000;
		d.vacancyrate2013 = +d.vacancyrate2013;
		d.MEANvacancyrate2013 = +d.MEANvacancyrate2013;
        d.vacancyrate2016 = +d.vacancyrate2016;
        d.MEANvacancyrate2016 = +d.MEANvacancyrate2016;
		d.medfamincome1980 = +d.medfamincome1980;
		d.MEANmedfamincome1980 = +d.MEANmedfamincome1980;
		d.medfamincome1990 = +d.medfamincome1990;
		d.MEANmedfamincome1990 = +d.MEANmedfamincome1990;
		d.medfamincome2000 = +d.medfamincome2000;
		d.MEANmedfamincome2000 = +d.MEANmedfamincome2000;
		d.medfamincome2013 = +d.medfamincome2013;
		d.MEANmedfamincome2013 = +d.MEANmedfamincome2013;
        d.medfamincome2016 = +d.medfamincome2016;
        d.MEANmedfamincome2016 = +d.MEANmedfamincome2016;
		d.Citypctnonwhite1980 = +d.Citypctnonwhite1980;
		d.MEANCitypctnonwhite1980 = +d.MEANCitypctnonwhite1980;
		d.Citypctnonwhite1990 = +d.Citypctnonwhite1990;
		d.MEANCitypctnonwhite1990 = +d.MEANCitypctnonwhite1990;
		d.Citypctnonwhite2000 = +d.Citypctnonwhite2000;
		d.MEANCitypctnonwhite2000 = +d.MEANCitypctnonwhite2000;
		d.Citypctnonwhite2013 = +d.Citypctnonwhite2013;
		d.MEANCitypctnonwhite2013 = +d.MEANCitypctnonwhite2013;
        d.Citypctnonwhite2016 = +d.Citypctnonwhite2016;
        d.MEANCitypctnonwhite2016 = +d.MEANCitypctnonwhite2016;
		d.RacialSeg1980 = +d.RacialSeg1980;
		d.MEANRacialSeg1980 = +d.MEANRacialSeg1980;
		d.RacialSeg1990 = +d.RacialSeg1990;
		d.MEANRacialSeg1990 = +d.MEANRacialSeg1990;
		d.RacialSeg2000 = +d.RacialSeg2000;
		d.MEANRacialSeg2000 = +d.MEANRacialSeg2000;
		d.RacialSeg2013 = +d.RacialSeg2013;
		d.MEANRacialSeg2013 = +d.MEANRacialSeg2013;
        d.RacialSeg2016 = +d.RacialSeg2016;
        d.MEANRacialSeg2016 = +d.MEANRacialSeg2016;
		d.hogap1980 = +d.hogap1980 * 100;
		d.MEANhogap1980 = +d.MEANhogap1980 * 100;
		d.hogap1990 = +d.hogap1990 * 100;
		d.MEANhogap1990 = +d.MEANhogap1990 * 100;
		d.hogap2000 = +d.hogap2000 * 100;
		d.MEANhogap2000 = +d.MEANhogap2000 * 100;
		d.hogap2013 = +d.hogap2013 * 100;
		d.MEANhogap2013 = +d.MEANhogap2013 * 100;
        d.hogap2016 = +d.hogap2016 * 100;
        d.MEANhogap2016 = +d.MEANhogap2016 * 100;
		d.povgap1980 = +d.povgap1980 * 100;
		d.MEANpovgap1980 = +d.MEANpovgap1980 * 100;
		d.povgap1990 = +d.povgap1990 * 100;
		d.MEANpovgap1990 = +d.MEANpovgap1990 * 100;
		d.povgap2000 = +d.povgap2000 * 100;
		d.MEANpovgap2000 = +d.MEANpovgap2000 * 100;
		d.povgap2013 = +d.povgap2013 * 100;
		d.MEANpovgap2013 = +d.MEANpovgap2013 * 100;
        d.povgap2016 = +d.povgap2016 * 100;
        d.MEANpovgap2016 = +d.MEANpovgap2016 * 100;
		d.racialeducationgap1980 = +d.racialeducationgap1980 * 100;
		d.MEANracialeducationgap1980 = +d.MEANracialeducationgap1980 * 100;
		d.racialeducationgap1990 = +d.racialeducationgap1990 * 100;
		d.MEANracialeducationgap1990 = +d.MEANracialeducationgap1990 * 100;
		d.racialeducationgap2000 = +d.racialeducationgap2000 * 100;
		d.MEANracialeducationgap2000 = +d.MEANracialeducationgap2000 * 100;
		d.racialeducationgap2013 = +d.racialeducationgap2013 * 100;
		d.MEANracialeducationgap2013 = +d.MEANracialeducationgap2013 * 100;
        d.racialeducationgap2016 = +d.racialeducationgap2016 * 100;
        d.MEANracialeducationgap2016 = +d.MEANracialeducationgap2016 * 100;
		d.incseg1980 = +d.incseg1980;
		d.MEANincseg1980 = +d.MEANincseg1980;
		d.incseg1990 = +d.incseg1990;
		d.MEANincseg1990 = +d.MEANincseg1990;
		d.incseg2000 = +d.incseg2000;
		d.MEANincseg2000 = +d.MEANincseg2000;
		d.incseg2013 = +d.incseg2013;
		d.MEANincseg2013 = +d.MEANincseg2013;
        d.incseg2016 = +d.incseg2016;
        d.MEANincseg2016 = +d.MEANincseg2016;
		d.rentburden1980 = +d.rentburden1980;
		d.MEANrentburden1980 = +d.MEANrentburden1980;
		d.rentburden1990 = +d.rentburden1990;
		d.MEANrentburden1990 = +d.MEANrentburden1990;
		d.rentburden2000 = +d.rentburden2000;
		d.MEANrentburden2000 = +d.MEANrentburden2000;
		d.rentburden2013 = +d.rentburden2013;
		d.MEANrentburden2013 = +d.MEANrentburden2013;
        d.rentburden2016 = +d.rentburden2016;
        d.MEANrentburden2016 = +d.MEANrentburden2016;
		d.workingpoor1980 = +d.workingpoor1980;
		d.MEANworkingpoor1980 = +d.MEANworkingpoor1980;
		d.workingpoor1990 = +d.workingpoor1990;
		d.MEANworkingpoor1990 = +d.MEANworkingpoor1990;
		d.workingpoor2000 = +d.workingpoor2000;
		d.MEANworkingpoor2000 = +d.MEANworkingpoor2000;
		d.workingpoor2013 = +d.workingpoor2013;
		d.MEANworkingpoor2013 = +d.MEANworkingpoor2013;
        d.workingpoor2016 = +d.workingpoor2016;
        d.MEANworkingpoor2016 = +d.MEANworkingpoor2016;
		d.pct1619notinschool1980 = +d.pct1619notinschool1980;
		d.MEANpct1619notinschool1980 = +d.MEANpct1619notinschool1980;
		d.pct1619notinschool1990 = +d.pct1619notinschool1990;
		d.MEANpct1619notinschool1990 = +d.MEANpct1619notinschool1990;
		d.pct1619notinschool2000 = +d.pct1619notinschool2000;
		d.MEANpct1619notinschool2000 = +d.MEANpct1619notinschool2000;
		d.pct1619notinschool2013 = +d.pct1619notinschool2013;
		d.MEANpct1619notinschool2013 = +d.MEANpct1619notinschool2013;
        d.pct1619notinschool2016 = +d.pct1619notinschool2016;
        d.MEANpct1619notinschool2016 = +d.MEANpct1619notinschool2016;

	})

	function init(){
		var backText = (widthUnder(768)) ? "Back" : "Back to map"
		d3.select(".questionMenu.map span")
			.text(backText)

		setYear("2016");
		setInclusionType("overall");
		setScaleType("log");
		buildSearchBox(d3.select("#combobox"),"combobox", false, null);
		var parameters = parseQueryString(window.location.search);
		if(parameters.hasOwnProperty("topic")){
			buildHeader(data, false, false)
			d3.select("body").classed("cityPage", false)
			d3.select("body").classed("noPrint", true)
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
			var print = (parameters.hasOwnProperty("print"))
			buildHeader(data, parameters.city, print)
			buildCityPage(parameters.city, print)
		}
		else{
			buildHeader(data, false, false)
			d3.select("body").classed("cityPage", false)
			d3.select(".questionMenu.map").classed("active", true)
			showMap()
		}
	}
	function hideComparisonCity(){
		d3.select("#removeCity")
			.transition()
			.style("opacity",0)
		d3.selectAll(".comparison")
			.transition()
			.style("opacity",0)
			.on("end", function(){
				d3.select(this).remove()
			})
		d3.selectAll(".newCity")
			.transition()
			.style("opacity",0)
		d3.select("#dropdownViewOtherCity").transition().style("opacity",0)
		d3.select("#dropdownViewOtherCity a").attr("href","").style("display","none")
	}
	function buildSearchBox(selectEl, selectID, isCityPage, filterCity){
		var defaultText = (isCityPage) ? "Compare with another city" : "See how your city ranks"
		var sorted = [{"className":"default","text": defaultText}].concat(data.concat().sort(function(a, b){
				var textA = a.className;
				var textB = b.className;
				return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;

			})
		)
		if(isCityPage){
			sorted = sorted.filter(function(o){ return o.className != filterCity})
		}
		selectEl
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
	          })
              .on("click", function() { $(this).val(""); });

	        this._on( this.input, {
	          autocompleteselect: function( event, ui ) {
	            ui.item.option.selected = true;
	            if(ui.item.option.value != "default"){
	            	if(isCityPage){
	            		var datum = data.filter(function(o){ return o.className == ui.item.option.value})[0]
	            		addNotes(d3.select("#consolidatedNoteContainer"), datum)
	            		addCityLine(datum)
	            		d3.select(".topLegend-text.newCity").text(datum.place + ", " + datum.stateabrev)
	            		d3.selectAll(".newCity")
	            			.transition()
	            			.style("opacity",1)
						d3.select("#removeCity")
							.transition()
							.style("opacity",1)

	            		d3.select("#dropdownViewOtherCity").transition().style("opacity",1)
	            		d3.select("#dropdownViewOtherCity a").attr("href","index.html?city=" + ui.item.option.value).style("display","block")
	            	}else{
	            		window.open("index.html?city=" + ui.item.option.value, "_blank")
	            	}

	            }else{
	            	if(ui.item.label == "Compare with another city"){
	            		hideComparisonCity();
	            	}
	            }
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

	    $( "#" +selectID ).combobox();
	    $( "#toggle" ).on( "click", function() {
	      $( "#" + selectID ).toggle();
	    });


  	} );
}
	function buildYearSelector(container, section){
		var width = container.node().getBoundingClientRect().width;
		var height = 70;
		var lineBump = (widthUnder(768)) ? 20 : 110;
        var nudge = 65;

		container
			.style("width", width + "px")
		var svg = container.append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
		svg.append("line")
			.attr("x1", nudge)
			.attr("x2", width * 0.8 + nudge)
			.attr("y1", 40)
			.attr("y2", 40)
			.style("stroke", "#707070")


		var g = svg.selectAll(".yearSelect")
			.data(["1980","1990","2000","2013","2016"])
			.enter()
			.append("g")
			.attr("transform", function(d, i){
				// var nudge = 30;
				return "translate(" + (i*((width*.8)/4) + nudge - 5) + ",0)"
			})
			.attr("class", function(d){
				return (getYear() == d) ? "yearSelect active" : "yearSelect"
			})
			.on("click", function(d){
				// d3.select("g.active circle.outer")
				// 	.transition()
				// 	.attr("r", 10)
				// 	.attr("cx", 10)
				d3.select("g.active circle.inner")
					// .transition()
					.attr("r", 8)
					// .attr("cx", 10)
					.style("fill", "#696969")
				d3.select("g.active .yLabel")
					.style("font-weight", "normal")

				// d3.select(this).select("circle.outer")
				// 	.transition()
				// 	.attr("r", 13)
				// 	.attr("cx", 13)
				d3.select(this).select("circle.inner")
					// .transition()
					.attr("r", 11)
					// .attr("cx", 13)
					.style("fill", "#12719E")
				d3.select(this).select(".yLabel")
					.style("font-weight", "bold")


				setYear(d)
				d3.selectAll(".yearSelect.active").classed("active", false)
				d3.select(this).classed("active", true)
				if(section == "map"){
					updateMap(d, getInclusionType())
				}
				// else if(section == "size"){
				// 	updateSizeQuestion(d, getInclusionType(), getScaleType())
				// }
				// else if(section == "health"){
				// 	updateHealthQuestion(d, getInclusionType())

				// }
			})
			.on("mouseover", function(d){
				d3.select(this).select("circle.inner")
				.transition()
					.style("fill", "#A2D4EC")
				d3.select(this).select(".yLabel")
					.style("font-weight", "bold")
			})
			.on("mouseout", function(d){
				if(d3.select(this).classed("active")){
					d3.select(this).select("circle.inner")
						.transition()
							.style("fill", "#12719E")
					d3.select(this).select(".yLabel")
						.style("font-weight", "bold")
				}else{
					d3.select(this).select("circle.inner")
						.transition()
							.style("fill", "#696969")
					d3.select(this).select(".yLabel")
						.style("font-weight", "normal")
				}



			})

		g.append("text")
			.attr("class", "yLabel")
			.text(function(d){ return d})
			.style("font-weight", function(d){
				return (getYear() == d) ? "bold" : "normal";
			})
			.style("font-size", "20px")
			.style("color", "#707070")
			.attr("y", 20)
			.attr("x", -12.5)

		// g.append("circle")
		// 	.attr("class", "outer")
		// 	.attr("r", function(d){
		// 		return (getYear() == d) ? 13 : 10;
		// 	})
		// 	.attr("cx", function(d){
		// 		return (getYear() == d) ? 13 : 10;
		// 	})
		// 	.attr("cy", 40)
		// 	.style("stroke", "#707070")
		// 	.style("fill", "#ffffff")
		g.append("circle")
			.attr("class", "inner")
			.attr("r", function(d){
				return (getYear() == d) ? 11 : 8;
			})
			.attr("cx", function(d){
				return (getYear() == d) ? 13 : 10;
			})
			.attr("cy", 40)
			.style("stroke", "none")
			.style("fill", function(d){
				return (getYear() == d) ? "#12719E" : "#696969";
				"#ffffff"
			})


			// .text(function(d){ return d})

	}
	function buildInfoPopup(container, changePage){
		var changeClass = (changePage) ? " changePage" : ""
		var infoContainer = container.append("div")
			.attr("class","infoContainer" + changeClass)
		infoContainer.append("span")
			.html("<i class=\"fas fa-info\"></i>")
		infoContainer.on("mouseover", function(){
			if(d3.selectAll(".infoPopup").nodes().length == 0){
				var infoPopup = d3.select(this).append("div")
					.attr("class", "infoPopup")
					.style("width", function(){
						if(widthUnder(1250)){
							return "130px"
						}else{
							return (Math.ceil(d3.select("#popupContainer").node().getBoundingClientRect().width * .2) - 46 - 20) + "px"
						}
					})
				infoPopup.append("div")
					.attr("class","infoPopupTop")
					.text("Scroll down for definitions")
					.on("click", hideInfoPopup)
				infoPopup.append("div")
					.attr("class", "infoPopupLink")
					.html("Take me there <i class=\"fas fa-arrow-down\"></i>")
					.on("click", function(){
						hideInfoPopup();
						scrollToAnchor("#definitions")
					})
			}
		})
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
				// else if(section == "size"){
				// 	updateSizeQuestion(getYear(), d, getScaleType())
				// }
				// else if(section == "health"){
				// 	updateHealthQuestion(getYear(), d)

				// }
			})
		buildInfoPopup(container, false)

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
				if(widthUnder(768)){ return false }
				d3.select(this).transition()
					.style("width","26px")
					.style("height","26px")
    				.style("margin-bottom","-1px")
    				.style("margin-left","-3px")

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
				if(widthUnder(768)){ return false }
				d3.select(this).transition()
					.style("width","20px")
					.style("height","20px")
    				.style("margin-bottom","5px")
    				.style("margin-left","0px")
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

	/*function getScatterScales(width, height, margin, section, year, inclusionType, scaleType){
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
	}*/

	/*function removeScatterTooltip(d){
		d3.selectAll(".dot").classed("hover", false)
	}*/
	/*function showScatterTooltip(d){
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
	}*/
	/*function buildScatterPlot(container, section){
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

		var scatterTopClass = (section == "size") ? "scatterTopNote topSize" : "scatterTopNote"
		container.append("div").attr("class", scatterTopClass).text("Click a dot for more information")

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
			var tickFormat = (scaleType == "log") ? "" : d3.format(".2s")


			var sizeYaxis = scatterSvg.append("g")
				.attr("class", "axis axis--y")
				.attr("transform", "translate(" + (width + 20) + ",0)")
				.call(d3.axisRight(y).ticks(5).tickSize(-width-20).tickFormat(tickFormat));
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
			.attr("r", getDotRadius())
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
					if(widthUnder(768)) return false
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
					if(widthUnder(768)) return false
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
	}*/

	function buildParagraphs(container, key){
		container
			.attr("class", key)
			.selectAll("p")
			.data(allText[key])
			.enter()
			.append("p")
			.html(function(d){ return d})

	}
	function buildHeader(data, city, print){
		var text = "",
			datum = {}
		if(city == false){
			d3.select("#titleContainer #title").html("Measuring Inclusion in America&rsquo;s Cities")
			d3.select("#titleContainer #datePublished").text("Last updated MONTH DAY, 2020")
			text = allText.mainHeader
		}else{
			var baseText = (print) ? allText.printHeader : []
			datum = data.filter(function(o){ return o.className == city })[0]
			d3.select("#titleContainer #title").html(datum.place + ", " + datum.stateabrev)
			d3.select("#titleContainer #datePublished").text("Population in 2016: " + d3.format(",")(datum.pop2016)).style("display","block")
			if(datum.rankoverallinclusionindex2013 == datum.rankoverallinclusionindex2016){
				if(datum.rankeconhealth2013 == datum.rankeconhealth2016){
					text = baseText.concat(allText.cityHeaderNoChange)
				}else{
					text = baseText.concat(allText.cityHeaderNoOverallChange)
				}
			}
			else if(datum.rankeconhealth2013 == datum.rankeconhealth2016){
				text = baseText.concat(allText.cityHeaderNoHealthChange)
			}else{
				text = baseText.concat(allText.cityHeaderBothChange)
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
        // Update: everything that used to be 13 should now be 16, 00 should now be 13
		ps.selectAll(".ch-overallRank13")
			.datum(datum)
			.html(function(d){ return d.rankoverallinclusionindex2016 })
		ps.selectAll(".ch-econRank13")
			.datum(datum)
			.html(function(d){ return d.rankeconinclusionindex2016 })
		ps.selectAll(".ch-racialRank13")
			.datum(datum)
			.html(function(d){ return d.rankraceinclusionindex2016 })
		ps.selectAll(".ch-healthRank13")
			.datum(datum)
			.html(function(d){ return d.rankeconhealth2016 })
		ps.selectAll(".ch-overallRank00")
			.datum(datum)
			.html(function(d){ return d.rankoverallinclusionindex2013 })
		ps.selectAll(".ch-healthRank00")
			.datum(datum)
			.html(function(d){ return d.rankeconhealth2013 })
		ps.selectAll(".ch-healthWord")
			.datum(datum)
			.html(function(d){
				var baseWord = (d.rankeconhealth2016 < d.rankeconhealth2013) ? "increased" : "decreased",
					slightWord = (Math.abs(d.rankeconhealth2016 - d.rankeconhealth2013) <= 2) ? " slightly" : ""
				return baseWord + slightWord;
			})
		ps.selectAll(".ch-overallWord")
			.datum(datum)
			.html(function(d){
				var baseWord = (d.rankoverallinclusionindex2016 < d.rankoverallinclusionindex2013) ? "more" : "less",
					slightWord = (Math.abs(d.rankoverallinclusionindex2016 - d.rankoverallinclusionindex2013) <= 2) ? "slightly " : ""
				return slightWord + baseWord

			})
		ps.selectAll(".ch-overallWord2")
			.datum(datum)
			.html(function(d){ return (d.rankoverallinclusionindex2016 < d.rankoverallinclusionindex2013) ? "rising" : "falling" })
		if(city != false){
			var titleNav = d3.select("#titleContainer").append("div").attr("id","titleNavContainer").attr("class","cityRemove")
			titleNav.append("a")
				.attr("href","index.html?city=" + datum.className + "&print=true")
				.attr("target", "_blank")
				.append("div").html("Print city fact sheet <i class=\"fa fa-print\" aria-hidden=\"true\"></i>")
			titleNav.append("a")
				.attr("id","csvDownload")
				.attr("href","data/measuring-inclusion-data.xlsx")
				.append("div").html("Download all data <img src =\"img/csvIcon.png\">")
				.on("mouseover", function(){
					d3.select(this).html("Download all data <img src =\"img/csvIconHover.png\">")
				})
				.on("mouseout", function(){
					d3.select(this).html("Download all data <img src =\"img/csvIcon.png\">")
				})

			// factsheet.append("i")




		}
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
		// d3.select("#questionTitle").html("")
		d3.select(".questionContainer").attr("class", "map")
		d3.selectAll(".cityRemove").remove()
		d3.selectAll(".cityPage").classed("cityPage",false)
		d3.selectAll(".questionMenu.map").classed("active", true)
		buildHeader(data, false, false)

		updateQueryString("?topic=map")
		var year = getYear();
		var inclusionType = getInclusionType();

		var year = getYear();
		var inclusionType = getInclusionType();
		var varName = getVarName(year, inclusionType);

		var graphContainer = d3.select("#graphContainer")
		graphContainer.attr("class", "mapQuestion")
		var yearContainer = graphContainer.append("div").attr("id", "yearContainer")
        var inclusionContainer = graphContainer.append("div").attr("id", "inclusionContainer")
		var note = graphContainer.append("div").attr("id","noteContainer")
		var plotContainer = graphContainer.append("div").attr("id", "plotContainer")
		var legendContainer = graphContainer.append("div").attr("id", "legendContainer")
		// d3.select("#sidebarContainer").attr("class","map")

		graphContainer.style("height", "auto")

		buildYearSelector(yearContainer, "map")
		buildInclusionTypeSelector(inclusionContainer, "map")
		buildLegend(legendContainer,"map")

		note.text("Click to zoom in")

		var w = d3.select("#plotContainer").node().getBoundingClientRect().width;
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
				.style("opacity",.8)
				.attr("fill", function(d){ return getRankColor(d[varName])});




		})

		var inclusionText = {"econ": " economic inclusion", "race": " racial inclusion", "overall": " overall inclusion"}
		var inclusionSpace = {"econ": 18, "race": -10, "overall": 0}

		d3.select("#legend-title").text(year + inclusionText[inclusionType])
		d3.select("#legendContainer").style("width", (140 + inclusionSpace[inclusionType]) + "px").style("right", (0 - inclusionSpace[inclusionType]) + "px")

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
		d3.select("#legendContainer").style("width", (140 + inclusionSpace[inclusionType]) + "px").style("right", (0 - inclusionSpace[inclusionType]) + "px")
	}

	// function showHealthQuestion(){
	// 	d3.select(".questionContainer").attr("class", "scatter")
	// 	d3.select("#questionTitle").html(d3.select(".questionMenu[data-section=health]").html())
	// 	updateQueryString("?topic=economic-health")
	// 	var year = getYear();
	// 	var inclusionType = getInclusionType();
	// 	var varName = getVarName(year, inclusionType);

	// 	var graphContainer = d3.select("#graphContainer")
	// 	graphContainer.attr("class", "healthQuestion")
	// 	graphContainer.style("height", "auto")

	// 	var yearContainer = graphContainer.append("div").attr("id", "yearContainer")
	// 	var plotContainer = graphContainer.append("div").attr("id", "plotContainer")
	// 	var inclusionContainer = graphContainer.append("div").attr("id", "inclusionContainer")
	// 	var paragraphContainer = d3.select("#sidebarContainer").attr("class","healthQuestion").append("div").attr("id","paragraphContainer")
	// 	var legendContainer = d3.select("#sidebarContainer").attr("class","healthQuestion").append("div").attr("id","legendContainer").attr("class", "scatter")


	// 	buildYearSelector(yearContainer, "health")
	// 	buildInclusionTypeSelector(inclusionContainer, "health")
	// 	buildScatterPlot(plotContainer, "health")
	// 	buildParagraphs(paragraphContainer, "healthQuestion")
	// 	buildLegend(legendContainer,"health")
	// }
	// function updateHealthQuestion(year, inclusionType){
	// 	removeTooltip(true)
	// 	scatterSvg._voronoi = null;

	// 	var scales = getScatterScales(getScatterWidth() - scatterMargin.left - scatterMargin.right, getScatterHeight() - scatterMargin.top - scatterMargin.bottom, scatterMargin, "health", year, inclusionType, "linear")
	// 	var x = scales[0]
	// 	var y = scales[1]

	// 	var xVar = getVarName(year, inclusionType);
	// 	var yVar = "rankeconhealth" + year


	// 	scatterSvg.selectAll(".dot")
	// 		.transition()
	// 		.duration(500)
	// 		.delay(function(d, i){
	// 			return d[xVar]*2
	// 		})
	// 		.attr("cx", function(d){
	// 			return x(d[xVar])
	// 		})
	// 		.attr("cy", function(d){
	// 			return y(d[yVar])
	// 		})


	// 	var xVals = data.map(function(a){ return a[xVar]})
	// 	var yVals = data.map(function(a){ return a[yVar]})
	// 	var leastSquaresCoeff = leastSquares(xVals, yVals);

	// 	var x1 = 1;
	// 	var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
	// 	var x2 = 274;
	// 	var y2 = leastSquaresCoeff[0] * xVals.length + leastSquaresCoeff[1];
	// 	var trendData = [[x1,y1,x2,y2]];

	// 	var fitLine = scatterSvg.selectAll(".fitLine")
	// 		.data(trendData)
	// 		.transition()
	// 		.duration(500 + 274*2)
	// 		.attr("y1", function(d) { return y(d[1]); })
	// 		.attr("y2", function(d) { return y(d[3]); })

	// 	fitLine.node().parentNode.appendChild(fitLine.node())
	// }

	/*function buildScaleTypeToggle(container, scaleType){
		var left;
		if(widthUnder(768)){
			left = (getScaleType() == "linear") ? "63px" : "86px"
		}else{
			left = (getScaleType() == "linear") ? "171px" : "194px"
		}
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
			.style("left", left)
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

	}*/
	// function showSizeQuestion(){
	// 	d3.select(".questionContainer").attr("class", "scatter")
	// 	d3.select("#questionTitle").html(d3.select(".questionMenu[data-section=size]").html())
	// 	updateQueryString("?topic=city-size")
	// 	var scaleType = getScaleType();

	// 	var graphContainer = d3.select("#graphContainer")
	// 	graphContainer.attr("class", "sizeQuestion")
	// 	var yearContainer = graphContainer.append("div").attr("id", "yearContainer")
	// 	var toggleContainer = graphContainer.append("div").attr("id", "toggleContainer")
	// 	var plotContainer = graphContainer.append("div").attr("id", "plotContainer")
	// 	var inclusionContainer = graphContainer.append("div").attr("id", "inclusionContainer")
	// 	var paragraphContainer = d3.select("#sidebarContainer").attr("class","sizeQuestion").append("div").attr("id","paragraphContainer")
	// 	var legendContainer = d3.select("#sidebarContainer").attr("class","sizeQuestion").append("div").attr("id","legendContainer").attr("class", "scatter")
	// 	graphContainer.style("height", "auto")

	// 	buildYearSelector(yearContainer, "size")
	// 	buildInclusionTypeSelector(inclusionContainer, "size")
	// 	buildScatterPlot(plotContainer, "size")
	// 	buildScaleTypeToggle(toggleContainer, scaleType)
	// 	buildParagraphs(paragraphContainer, "sizeQuestion")
	// 	buildLegend(legendContainer, "size")

	// }
	// function updateSizeQuestion(year, inclusionType, scaleType){
	// 	removeTooltip(true)
	// 	if(widthUnder(768)){
	// 		if(scaleType == "linear"){ d3.select("#sliderButton").transition().style("left","63px") }
	// 		else{ d3.select("#sliderButton").transition().style("left","86px") }
	// 	}else{
	// 		if(scaleType == "linear"){ d3.select("#sliderButton").transition().style("left","171px") }
	// 		else{ d3.select("#sliderButton").transition().style("left","194px") }
	// 	}

	// 	scatterSvg._voronoi = null;

	// 	var scales = getScatterScales(getScatterWidth() - scatterMargin.left - scatterMargin.right, getScatterHeight() - scatterMargin.top - scatterMargin.bottom, scatterMargin, "size", year, inclusionType, scaleType)
	// 	var x = scales[0]
	// 	var y = scales[1]
	// 	var xVar = getVarName(year, inclusionType);
	// 	var yVar = "pop" + year


	// 	scatterSvg.selectAll(".dot")
	// 		.transition()
	// 		.duration(500)
	// 		.delay(function(d, i){
	// 			return d[xVar]*2
	// 		})
	// 		.attr("cx", function(d){
	// 			return x(d[xVar])
	// 		})
	// 		.attr("cy", function(d){
	// 			if(scaleType == "log"){
	// 				return y(d["log" + yVar])
	// 			}else{
	// 				return y(d[yVar])
	// 			}
	// 		})
	// 	var tickFormat = (scaleType == "log") ? "" : d3.format(".2s")
	// 	var oldScale = (d3.select(".axis--y .tick text tspan tspan").node() == null) ? "linear" : "log"
	// 	if(scaleType != oldScale){
	// 		d3.select(".axis.axis--y")
	// 			.transition()
	// 			.call(d3.axisRight(y).ticks(5).tickSize(-(+d3.select("#scatterSvg").attr("width")-scatterMargin.left-scatterMargin.right)-40).tickFormat(tickFormat))
	// 			.on("end", function(){
	// 				if(scaleType == "log"){
	// 					d3.selectAll(".axis.axis--y .tick text")
	// 						.text(null)
	// 						.append("tspan")
	// 						.attr("dx", "-.7em")
	// 						.text("10")
	// 						.append("tspan")
	// 						.attr("baseline-shift", "super")
	// 						.attr("font-size", "11px")
	// 						.text(function(d){
	// 							var f = d3.format(".2n")
	// 							return f(d)
	// 						})
	// 				}

	// 			})
	// 	}



	// 	var yVals = exp_regression(data.map(function(a) {return a[yVar.replace("log","")];}))

	// 	var lineData = []
	// 	for(var i = 1; i < yVals.length+1; i++){
	// 		var lineDatum = {"x": i, "y": yVals[i-1]}
	// 		lineData.push(lineDatum)
	// 	}

	// 	var line = d3.line()
	// 		.x(function(d) {return x(d.x);})
	// 		.y(function(d) {
	// 			if(scaleType == "log"){
	// 				return y(Math.log10(d.y));
	// 			}else{
	// 				return y(d.y)
	// 			}
	// 		})

	// 	var fitLine = d3.selectAll(".fitLine")
	// 		.transition()
	// 		.duration(500 + 274*2)
	// 		.attr("d", line(lineData))

	// 	fitLine.node().parentNode.appendChild(fitLine.node())


	// }

	/*function buildChangeDropdown(container, x, y){
		container.append("div")
			.attr("id","smallMenuLabel")
			.text("Compare economic health to")

		var inclusionType = getInclusionType();
		var menu = container.append("select")
		var types = [{"value": "overall", "text": "OVERALL INCLUSION"},{"value": "econ", "text": "ECONOMIC INCLUSION"},{"value": "race", "text": "RACIAL INCLUSION"}]

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

  		buildInfoPopup(container, true)

  		container.style("width", (getSmallMultRowCount() * getSmallMultSize() + (getSmallMultRowCount()-1) * 21)  + "px")
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



	}*/

	// function showChangeQuestion(){
	// 	d3.select("#questionContainer").attr("class", "change")
	// 	d3.select("#popupContainer").attr("class", "change")
	// 	d3.select("#questionTitle").html(d3.select(".questionMenu[data-section=change]").html())
	// 	updateQueryString("?topic=economic-recovery")
	// 	var heightScalar = .9;
	// 	var changeData = data.filter(function(a){ return a.everrecover })
	// 		.sort(function(a, b){ return (a["rankoverallinclusionindex" + a.recoverend] - a["rankoverallinclusionindex" + a.recoverstart]) - (b["rankoverallinclusionindex" + b.recoverend] - b["rankoverallinclusionindex" + b.recoverstart]) })

	// 	var graphContainer = d3.select("#graphContainer")
	// 	graphContainer.attr("class", "changeQuestion")

	// 	var paragraphContainer = d3.select("#sidebarContainer").attr("class","changeQuestion")
	// 	var inclusionType = getInclusionType()
	// 	var marginSmall = {"left": 50, "right": 40, "top": 40, "bottom": 60}
	// 	var w = getSmallMultSize() - marginSmall.left - marginSmall.right;
	// 	var h = getSmallMultSize()*heightScalar - marginSmall.left - marginSmall.right

	// 	var x = d3.scaleLinear().range([marginSmall.left, getSmallMultSize()-marginSmall.right]).domain([1980, 2013])
	// 	var y = d3.scaleLinear().range([getSmallMultSize()*heightScalar - marginSmall.bottom, marginSmall.top]).domain([274,0])

	// 	graphContainer.style("height", ((Math.ceil(changeData.length/getSmallMultRowCount())) * (getSmallMultSize() + SMALL_MULT_BOTTOM_PADDING) )  + "px")

	// 	var chartDiv = graphContainer
	// 		.selectAll(".chartDiv")
	// 		.data(changeData)
	// 		.enter()
	// 		.append("div")
	// 		.attr("class", function(d){ return "chartDiv " + d.className })
	// 		.style("width", getSmallMultSize() + "px")
	// 		.style("height", getSmallMultSize() + "px")
	// 		.style("left", function(d, i){
	// 			return ((i%getSmallMultRowCount()) * (getSmallMultSize() + SMALL_MULT_RIGHT_PADDING)) + "px"
	// 		})
	// 		.style("top", function(d, i){
	// 			return (Math.floor(i/getSmallMultRowCount()) * (getSmallMultSize() + SMALL_MULT_BOTTOM_PADDING)) + "px"
	// 		})

	// 	chartDiv.append("div")
	// 		.attr("class","chartTitle")
	// 		.text(function(d){
	// 			return d.place + ", " + d.stateabrev
	// 		})
	// 		.append("span")
	// 			.html(function(d){
	// 				return "<a href = \"index.html?city=" + d.className + "\" target = \"_blank\"> See city <i class=\"fas fa-arrow-right\"></i></a>"
	// 		})

	// 	chartDiv.append("div")
	// 		.attr("class","chartSubtitle")
	// 		.html(function(d){
	// 			var change = d["rankoverallinclusionindex" + d.recoverend] - d["rankoverallinclusionindex" + d.recoverstart]
	// 			var changeWord = (change < 0) ? "rose" : "fell"

	// 			return "<span class = \"inclSpan\">Overall inclusion</span> " + changeWord + " " + Math.abs(change) + " ranks during the <span class = \"healthSpan\">economic recovery</span> period."
	// 		})
	// 	var svg = chartDiv.append("svg")
	// 		.attr("class","chartSvg")
	// 		.attr("width", getSmallMultSize())
	// 		.attr("height", getSmallMultSize()*heightScalar)

	// 	svg.append("rect")
	// 		.attr("fill","transparent")
	// 		.attr("stroke","none")
	// 		.attr("x",0)
	// 		.attr("y",0)
	// 		.attr("width", getSmallMultSize())
	// 		.attr("height", getSmallMultSize()*heightScalar - 50)
	// 	svg.append("g")
	// 		.attr("class", "axis axis--y")
	// 		.attr("transform", "translate(" + (getSmallMultSize() - 20) + ",0)")
	// 		.call(d3.axisLeft(y).tickValues([1,100,200,274]).tickSize(getSmallMultSize() - 50));
	// 	svg.append("g")
	// 		.attr("class", "axis axis--x")
	// 		.attr("transform", "translate(0," + marginSmall.top + ")")
	// 		.call(d3.axisTop(x).tickValues([1980, 1990, 2000, 2013]).tickFormat(d3.format(".0f")));

	// 	svg.on("mousemove", function(d){
	// 		mousemoveLineChart(d3.select(this), d, x, y, d3.event.offsetX, "rankeconhealth", "rank" + getInclusionType() + "inclusionindex",".0f", true, false)
	// 	})
	// 	.on("mouseout", function(){
	// 		d3.select(this).selectAll(".changeDot")
	// 			.transition()
	// 			.attr("r", 5)
	// 		d3.selectAll(".smallTT").remove()
	// 	})
	// 	addCorrelationRect(svg, x, y, inclusionType, "econHealth");
	// 	addLineSeries(svg, x, y, inclusionType, false, false);
	// 	addLineSeries(svg, x, y, "econHealth", false, false);
	// 	buildParagraphs(paragraphContainer, "changeQuestion");
	// 	var menuContainer = paragraphContainer.append("div").attr("id", "menuContainer")
	// 	buildChangeDropdown(menuContainer, x, y)


	// }
	// function updateChangeQuestion(inclusionType, x, y){
	// 	setInclusionType(inclusionType)

	// 	var sortData = data.filter(function(a){ return a.everrecover })
	// 		.sort(function(a, b){ return (a["rank" + inclusionType + "inclusionindex" + a.recoverend] - a["rank" + inclusionType + "inclusionindex" + a.recoverstart]) - (b["rank" + inclusionType + "inclusionindex" + b.recoverend] - b["rank" + inclusionType + "inclusionindex" + b.recoverstart]) })
	// 		.map(function(a){
	// 			return a.className
	// 		})

	// 	d3.selectAll(".chartSubtitle")
	// 		.text(function(d){
	// 			var change = d["rank" + inclusionType + "inclusionindex" + d.recoverend] - d["rank" + inclusionType + "inclusionindex" + d.recoverstart]
	// 			var changeWord = (change < 0) ? "rose" : "fell"
	// 			var changeTypes = {"overall": "Overall inclusion ", "econ": "Economic inclusion ", "race": "Racial inclusion "}
	// 			return changeTypes[inclusionType] + changeWord + " " + Math.abs(change) + " ranks during the economic recovery period."
	// 		})



	// 	d3.selectAll(".chartDiv")
	// 		.transition()
	// 		.delay(500)
	// 		.duration(1000)
	// 		.style("left", function(d){
	// 			var i = sortData.indexOf(d.className)
	// 			return ((i%getSmallMultRowCount()) * (getSmallMultSize() + SMALL_MULT_RIGHT_PADDING)) + "px"
	// 		})
	// 		.style("top", function(d){
	// 			var i = sortData.indexOf(d.className)
	// 			return (Math.floor(i/getSmallMultRowCount()) * (getSmallMultSize() + SMALL_MULT_BOTTOM_PADDING)) + "px"
	// 		})

	// 	var svg = d3.selectAll(".chartDiv").select("svg.chartSvg")
	// 	updateLineSeries(svg, x, y, inclusionType);
	// 	updateCorrelationRect(svg, x, y, inclusionType, "econHealth");
	// }

	// d3.selectAll(".questionMenu").on("click", function(){
	// 	restoreSidebar();
	// 	var section = d3.select(this).attr("data-section")
	// 	d3.selectAll(".questionMenu").classed("active", false)
	// 	d3.select(this).classed("active", true)

	// 	d3.select("#graphContainer").selectAll("*").remove()
	// 	d3.select("#sidebarContainer").selectAll("*").remove()

	// 	if(section == "map"){ showMap() }
	// 	else if(section == "health"){ showHealthQuestion() }
	// 	else if(section == "size"){ showSizeQuestion() }
	// 	else if(section == "change"){ showChangeQuestion() }
	// })
	// .on("mouseover", function(){
	// 	d3.selectAll(".questionMenu.noMap")
	// 		.style("border-left", "1px solid white")
	// 	if(d3.select(this).classed("noMap")){
	// 		d3.select(this)
	// 			.style("border-left", "1px solid #707070")
	// 	}

	// })
	// .on("mouseout", function(){
	// 	d3.select(".noMap.active")
	// 		.style("border-left", "1px solid #707070")
	// 	if(d3.select(this).classed("noMap")){
	// 		d3.select(this)
	// 			.style("border-left", "1px solid #ffffff")
	// 	}
	// })

	function addNotes(container, datum){
		// container.text(city)
		if(datum.consolidated == 0 || isNaN(datum.consolidated)){
			return false;
		}
		else{
			if(d3.select(".noteText").node() == null){
				container.datum(datum)
				var noteText = container.append("div")
					.attr("class","noteText")
					.html(allText.consolidatedNote)
				noteText.select(".note-cityName")
					.text(datum.place)
				noteText.select(".note-year")
					.text(datum.consolidated)
			}else{
				container.selectAll("div").remove()
				var oldDatum = container.datum()
				var noteText = container.append("div")
					.attr("class","noteText")
					.html(allText.consolidatedNoteTwoCities)
				noteText.select(".note-cityName")
					.text(oldDatum.place + ", " + stateNames[oldDatum.stateabrev] + ",")
				noteText.select(".note-year")
					.text(oldDatum.consolidated)
				noteText.select(".note2-cityName")
					.text(datum.place + ", " + stateNames[datum.stateabrev] + ",")
				noteText.select(".note2-year")
					.text(datum.consolidated)
			}
		}

	}
	function buildCityPage(city, print){
		d3.select("body")
			.classed("cityPage", true)
			.classed("print", print)
			.classed("noPrint", !print)

		var heightScalar = 1.1;
		var datum = data.filter(function(o){ return o.className == city })[0]

		d3.select(".questionContainer").attr("class", "city")
		var graphContainer = d3.select("#graphContainer")
		graphContainer.attr("class", "cityPage")

		var topContainer = graphContainer.append("div").attr("id", "topContainer").attr("class","cityRemove")
		var moreContainer = graphContainer.append("div").attr("id", "moreContainer").attr("class","cityRemove")
		var consolidatedNoteContainer = graphContainer.append("div").attr("id", "consolidatedNoteContainer").attr("class","cityRemove")

		addNotes(consolidatedNoteContainer, datum)

		var backToMap = topContainer.append("div")
			.attr("class","questionMenu map cityPage")
			.attr("data-section","map")
			.on("click", showMap)

		backToMap.append("img")
			.attr("src","img/close-button.png")

		var backText = (widthUnder(768)) ? "Back" : "Back to map"
		backToMap.append("span")
			.text(backText)


		var dropdownContainer = topContainer.append("div")
			.attr("id","dropdownContainer")
		dropdownContainer.append("div")
			.attr("id", "dropdownViewOtherCity")
			.append("a")
			.attr("target","_blank")
			.html("Click to see city profile <i class=\"fas fa-arrow-right\"></i>")
		var selectEl = dropdownContainer.append("select")
			.attr("id", "cityDropdown")
		buildSearchBox(selectEl, "cityDropdown", true, datum.className)
		if(!print){
			topContainer.append("div")
				.attr("id","removeCity")
				.style("color","#9D9D9D")
				.html("Remove city <i class=\"fas fa-ban\"></i>")
				.on("mouseover", function(){
					d3.select(this).style("color","#1696d2")
				})
				.on("mouseout", function(){
					d3.select(this).style("color","#9D9D9D")
				})
				.on("click", hideComparisonCity)


			var topLegend = topContainer.append("div")
				.attr("id","topContainerLegend")
			topLegend.append("div")
				.attr("class","topLegend-text thisCity")
				.text(datum.place + ", " + datum.stateabrev)
			topLegend.append("div")
				.attr("class","topLegend-symbol thisCity")
			topLegend.append("div")
				.attr("class","topLegend-text newCity")
			topLegend.append("div")
				.attr("class","topLegend-symbol newCity")
		}

		var inclusionType = "overall"
		var topSize;
		if(print){
			topSize = 209;
		}else{
			if(widthUnder(900)){
				topSize = 290
			}
			else if(widthUnder(1250)){
				topSize = 320;
			}else{
				topSize = 249
			}
		}
		var marginSmall = {"left": 50, "right": 40, "top": 40, "bottom": 60},
			marginMore = {"left": 50, "right": 70, "top": 40, "bottom": 60},
			moreSize = (print) ? 192 : 278,
			wTop = topSize - marginSmall.left - marginSmall.right,
			hTop = topSize*heightScalar - marginSmall.left - marginSmall.right,
			wMore = moreSize - marginMore.left* - marginMore.right,
			hMore = moreSize*heightScalar - marginMore.left - marginMore.right - 40,
			xTop = d3.scaleLinear().range([marginSmall.left, topSize-marginSmall.right]).domain([1980, 2016]),
			xMore = d3.scaleLinear().range([marginMore.left, moreSize-marginMore.right]).domain([1980, 2016]),
			yTop = d3.scaleLinear().range([topSize*heightScalar - marginSmall.bottom, marginSmall.top]).domain([274,0]);


		var topIndicators = ["overall","econ","race","econHealth"]

		for(var i = 0; i < topIndicators.length; i++){

			var indicator = topIndicators[i]
			var topDiv = topContainer.append("div").attr("class","topDiv").attr("id", "td_" + indicator)
			var titles = {"overall": "Overall inclusion rank", "econ": "Economic inclusion rank", "race": "Racial inclusion rank", "econHealth": "Economic health rank"}

			topDiv.append("div")
				.attr("class", "chartTitle")
				.text(titles[indicator])

			var svg = topDiv.append("svg")
				.datum(datum)
				.attr("data-indicator", indicator)
				.attr("width", topSize)
				.attr("height", topSize*heightScalar- 20)
			var clone = topDiv.append("svg")
				// .datum(datum)
				.attr("class","clone")
				.attr("width", topSize)
				.attr("height", topSize*heightScalar - 20)
			svg.append("rect")
				.attr("fill","transparent")
				.attr("stroke","none")
				.attr("x",0)
				.attr("y",0)
				.attr("width", topSize)
				.attr("height", topSize*heightScalar -50)
			svg.append("g")
				.attr("class", "axis axis--y")
				.attr("transform", "translate(" + (topSize - 20) + ",0)")
				.call(d3.axisLeft(yTop).tickValues([1,100,200,274]).tickSize(topSize - 50));
			svg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + marginSmall.top + ")")
				.call(d3.axisTop(xTop).tickValues([1980, 1990, 2000, 2013, 2016]).tickFormat(function(d) { return (d > 2000) ? "'" + d%2000 : d;}));
            d3.selectAll('.tick')
                .filter(function(d) { return d === 2013; })
                .style("text-anchor", "end");

			svg.on("mousemove", function(d){
				var ind = (d3.select(this).attr("data-indicator") == "econHealth") ? "rankeconhealth" : "rank" + d3.select(this).attr("data-indicator") + "inclusionindex"
				mousemoveLineChart(d3.select(this), d, xTop, yTop, d3.event.offsetX, ind, false,".0f", true, false)
			})
			.on("mouseout", function(){
				d3.select(this).selectAll(".changeDot")
					.transition()
					.attr("r", 5)
				d3.selectAll(".smallTT").remove()
			})
			topDiv.append("div")
				.attr("class", "dataStore")
				.attr("id", "dataStore" + indicator)
				.datum({"svg": clone, "x":xTop,"y":yTop})
			addLineSeries(svg, xTop, yTop, indicator, false, true);
		}

		var moreIndicators = [
					["pctemploymentchange","Employment growth","econHealth", "Percentage change",".0%"],
					["unemprate","Unemployment rate","econHealth", "Percentage",".0%"],
					["vacancyrate","Housing vacancy rate","econHealth", "Percentage",".0%"],
					["medfamincome","Median family income","econHealth","Dollars","$.2s"],
					["Citypctnonwhite","People of color as a share of the population","race","Percentage",".0%"],
					["RacialSeg","Racial segregation","race","Index",".0f"],
					["hogap","Racial homeownership gap","race","Percentage point difference",".0f"],
					["povgap","Racial poverty gap","race","Percentage point difference",".0f"],
					["racialeducationgap","Racial education gap","race","Percentage point difference",".0f"],
					["incseg","Income segregation","econ","Index",".2f"],
					["rentburden","Rent-burdened residents","econ","Percentage",".0%"],
					["workingpoor","Working-poor families","econ","Percentage",".0%"],
					["pct1619notinschool","High school dropout rate","econ","Percentage",".0%"]
			]

		var flipIndicators = ["pctemploymentchange","medfamincome","Citypctnonwhite"]

		var selectedType = (getInclusionType() == "overall") ? "econ" : getInclusionType();
		var navTitles = {"econHealth": "Economic health", "econ": "Economic inclusion", "race": "Racial inclusion"}
		moreContainer.append("div")
			.attr("id","more-head")
			.text("Specific Indicators")
		var nav = moreContainer.append("div")
			.attr("id","more-navContainer")
		var navs = (print) ? ["econ", "race","econHealth"] : ["econ", "race","econHealth"]
		d3.select("#td_" + selectedType)
			.classed("active", true)
		nav.selectAll(".nav")
			.data(navs)
			.enter()
			.append("div")
				.attr("class", function(d){
					var active = (selectedType == d) ? " active" : ""
					return "nav " + d + active
				})
				.text(function(d){ return navTitles[d]})
			.on("click", function(d){
				d3.selectAll(".topDiv").classed("active",false)
				d3.select("#td_" + d).classed("active",true)
				d3.selectAll("#more-navContainer .nav").classed("active", false)
				d3.select(this).classed("active", true)

				d3.selectAll(".moreChartContainer").style("display","none")
				d3.select(".moreChartContainer." + d).style("display","block")
			})

		var moreChartContainer = moreContainer.selectAll(".moreChartContainer")
			.data(navs)
			.enter()
			.append("div")
			.attr("class", function(d){
				return "moreChartContainer " + d
			})
			.style("display", function(d){
				return (d == selectedType) ? "block" : "none"
			})
		if(print){
			// <div class = "page-break"></div>
			moreChartContainer.append("div")
				.attr("class", function(d){
					return (d == "race") ? "page-break" : "hide"
				})
			moreChartContainer.append("div")
				.attr("class", "printContainerHeader")
				.text(function(d){ return navTitles[d] })
		}
		var legend = moreChartContainer.append("div")
				.attr("id","moreLegendContainer")
		legend.append("div")
			.attr("class","moreLegend-text")
			.text("Average across cities")
		legend.append("div")
			.attr("class","moreLegend-symbol all")

		legend.append("div")
			.attr("class","moreLegend-text")
			.text(datum.place + ", " + datum.stateabrev)
		legend.append("div")
			.attr("class","moreLegend-symbol city")

		function getBounds(ind){
			var bounds = [
				datum[ind + "1980"],
				datum[ind + "1990"],
				datum[ind + "2000"],
				datum[ind + "2013"],
                datum[ind + "2016"],
				datum["MEAN" + ind + "1980"],
				datum["MEAN" + ind + "1990"],
				datum["MEAN" + ind + "2000"],
				datum["MEAN" + ind + "2013"],
                datum["MEAN" + ind + "2016"],
			]
			return bounds
		}

		for(var i = 0; i < moreIndicators.length; i++){

			var bounds = getBounds(moreIndicators[i][0])

			var yMore = d3.scaleLinear()
				.range([moreSize*heightScalar - 30 - 40, 20])
				.domain(d3.extent(bounds));
			var moreDiv = d3.select(".moreChartContainer." + moreIndicators[i][2])
				// .selectAll(".moreDiv" + moreIndicators[i][2])
				// .data(moreIndicators)
				// .enter()
				.append("div")
				.attr("class","moreDiv " + moreIndicators[i][2] + " " + moreIndicators[i][0])

			moreDiv.append("div")
				.attr("class", "chartTitle")
				.text(moreIndicators[i][1])
			moreDiv.append("div")
				.attr("class", "chartSubtitle")
				.text(moreIndicators[i][3])

			var moreSvg = moreDiv.append("svg")
				.datum(moreIndicators[i])
				.attr("width", moreSize)
				.attr("height", moreSize*heightScalar - 40)

			moreSvg.append("rect")
				.attr("fill","transparent")
				.attr("stroke","none")
				.attr("x",0)
				.attr("y",0)
				.attr("width", moreSize)
				.attr("height", moreSize*heightScalar - 40)

			var tickFormat;

			moreSvg.append("g")
				.attr("class", "axis axis--y")
				.attr("transform", "translate(" + (moreSize + marginMore.left - 60 - 40) + ",0)")
				.call(d3.axisLeft(yMore)
						.ticks(4)
						.tickSize(moreSize - 50 - 40)
						.tickFormat(d3.format(moreIndicators[i][4]))
					);


  			var defs = moreSvg.append("defs")
  			defs.append("marker")
  				.attr("id", "arrowhead_" + moreIndicators[i][0])
  				.attr("markerWidth",10)
  				.attr("markerHeight",7)
  				.attr("refX",0)
  				.attr("refY",3.5)
  				.attr("orient","auto")
  				.append("polygon")
  					.attr("points","0 0, 10 3.5, 0 7")

  			var arrowText = (moreIndicators[i][2] == "econHealth") ? "More healthy" : "More inclusive";

  			var printScootch = (print) ? 80 : 0;
  			var printScootchY = (print) ? 50 : 0;

			if(flipIndicators.includes(moreIndicators[i][0]) == false){
		        moreSvg.append("text")
			        	.attr("class","moreAxisLabel")
			            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
			            .attr("transform", "translate("+ (255-printScootch) +","+(50 + hMore/2)+")rotate(90)")  // text is drawn off the screen top left, move down and out and rotate
			            .text(arrowText);
			    moreSvg.append("line")
			    	.attr("class", "moreAxisArrow")
			    	.attr("x1", 250 - printScootch)
			    	.attr("x2", 250 - printScootch)
			    	.attr("y1", 80 - printScootchY)
			    	.attr("y2", 170 - printScootchY)
			    	.attr("marker-end","url(#arrowhead_" + moreIndicators[i][0] + ")")

			}else{
		        moreSvg.append("text")
		        	.attr("class","moreAxisLabel")
		            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
		            .attr("transform", "translate("+ (245-printScootch) +","+(50 + hMore/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
		            .text(arrowText);

			    moreSvg.append("line")
			    	.attr("class", "moreAxisArrow")
			    	.attr("x1", 250 - printScootch)
			    	.attr("x2", 250	- printScootch)
			    	.attr("y1", 175 - printScootchY)
			    	.attr("y2", 80 - printScootchY)
			    	.attr("marker-end","url(#arrowhead_" + moreIndicators[i][0] + ")")

			}

			moreSvg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + (hMore + marginMore.top + 50) + ")")
				.call(d3.axisBottom(xMore)
					.tickValues([1980, 1990, 2000, 2013, 2016])
					.tickFormat(function(t){
						var stringTick = String(t)
						if(print || t > 2000){
							return "'" + stringTick[2] + stringTick[3]
						}else{
							return stringTick
						}
					})
				);

            // adjust the alignment of the 2013 tick mark so it doesn't overlap the 2016 label
            d3.selectAll('.tick')
                .filter(function(d) { return d === 2013; })
                .style("text-anchor", "end");

			moreSvg.on("mousemove", function(d){
				var newBounds = getBounds(d[0])

				var newY = d3.scaleLinear()
					.range([moreSize*heightScalar - marginMore.bottom, 20])
					.domain(d3.extent(newBounds));
				mousemoveLineChart(d3.select(this),datum, xMore, newY, d3.event.offsetX, d[0], "MEAN" + d[0], d[4], false, false)
			})
			.on("mouseout", function(){
				d3.selectAll(".smallTT").remove()
			})



			var years = ["1980", "1990", "2000", "2013", "2016"]

			for(var j = 0; j < years.length; j++){
				if(j != (years.length -1)){
					moreSvg.append("line")
						.attr("class", "changeLine " +  "rank"  + " y" + j)
						.attr("x1", xMore(years[j]))
						.attr("x2", xMore(years[j+1]))
						.attr("y1", function(d){
							return yMore(datum[moreIndicators[i][0] + years[j]])
						})
						.attr("y2", function(d){
							return yMore(datum[moreIndicators[i][0] + years[j+1]])
						})
				}

				moreSvg.append("circle")
					.attr("class", "changeDot " +  "rank" + " y" + j)
					.attr("cx", xMore(years[j]))
					.attr("cy", function(d){
						return yMore(datum[moreIndicators[i][0] + years[j]])
					})
					.attr("r", function(){
						return 5
					})

				if(j != (years.length -1)){
					moreSvg.append("line")
						.attr("class", "changeLine " +  "econHealth"  + " y" + j)
						.attr("x1", xMore(years[j]))
						.attr("x2", xMore(years[j+1]))
						.attr("y1", function(d){
							return yMore(datum["MEAN" + moreIndicators[i][0] + years[j]])
						})
						.attr("y2", function(d){
							return yMore(datum["MEAN" + moreIndicators[i][0] + years[j+1]])
						})
				}

				moreSvg.append("circle")
					.attr("class", "changeDot " +  "econHealth" + " y" + j)
					.attr("cx", xMore(years[j]))
					.attr("cy", function(d){
						return yMore(datum["MEAN" + moreIndicators[i][0] + years[j]])
					})
					.attr("r", function(){
						return 5
					})

			}
		}

		if(print){
			window.print()
		}

	}

	init();
	var windowWidth = $(window).width();
	$( window ).resize(function() {
		if ($(window).width() != windowWidth) {
			windowWidth = $(window).width();

	      	// d3.selectAll("#sidebarContainer *").remove()
	      	d3.selectAll("#graphContainer *").remove()
	      	d3.selectAll(".cityRemove").remove()
			init()
		}
	})
})



// function restoreSidebar(){
// 	d3.select("#questionContainer")
// 		.style("position","relative")
// 		.style("top","0px")
// 	d3.select("#popupContainer")
// 		.style("margin-left","0px")
// }

$(window).scroll(function(e){
	hideInfoPopup()
	var el = d3.select('#menuContainer');
	var elSide = d3.select(".questionMenu.map")
	if(el.node() == null){
		// restoreSidebar();
	}else{
		//sticky legend and dropdown
		var isPositionFixed = (el.style('position') == 'fixed');
		var bottom = el.node().getBoundingClientRect().bottom
		var topCharts = d3.select("#graphContainer").node().getBoundingClientRect().top
		if (bottom < 162 && d3.select("#searchContainer").node().getBoundingClientRect().top > 156 && !isPositionFixed){
			// var sideLeft = ($("#sidebarContainer")[0].getBoundingClientRect().left + 18) + "px"
			$('#menuContainer').css({'position': 'fixed', 'top': '108px', 'border-bottom': '6px solid #F5F5F5', "left": "0px"});
			// d3.select("#sidebarContainer").style("padding-bottom", "46px")
		}
		else if((bottom <= topCharts || d3.select("#searchContainer").node().getBoundingClientRect().top <= 156) && isPositionFixed){
			$('#menuContainer').css({'position': 'relative', 'top': '0px', 'border-bottom': '6px solid #ffffff', "left": "0px"});
			// d3.select("#sidebarContainer").style("padding-bottom", "0px")
		}


		if(!widthUnder(768) && navigator.userAgent.toLowerCase().indexOf('firefox') == -1){
			var sideTop = elSide.node().getBoundingClientRect().top
			var isSideFixed = (d3.select("#questionContainer").style("position") == "fixed")
			if(
				sideTop < 142
				&&
				!isSideFixed
				&& d3.select("#searchContainer").node().getBoundingClientRect().top >= 556
			){
				d3.select("#questionContainer")
					.style("position","fixed")
					.style("top","230px")
				d3.select("#popupContainer")
					.style("margin-left","171px")
			}
			else if (
				sideTop >= 142
				|| (isSideFixed && d3.select("#titleContainer").node().getBoundingClientRect().bottom > 24)
				|| (isSideFixed && d3.select("#searchContainer").node().getBoundingClientRect().top < 556)
				){
				// restoreSidebar();
			}
		}

	}


})