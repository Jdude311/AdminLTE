/* global Chart:false */

$(function () {
  'use strict'
  // ref: http://stackoverflow.com/a/1293163/2343
  // This will parse a delimited string into an array of
  // arrays. The default delimiter is the comma, but this
  // can be overriden in the second argument.
  function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
      (
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

      // Get the delimiter that was found.
      var strMatchedDelimiter = arrMatches[ 1 ];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (
        strMatchedDelimiter.length &&
          strMatchedDelimiter !== strDelimiter
      ){

        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push( [] );

      }

      var strMatchedValue;

      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[ 2 ]){

        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        strMatchedValue = arrMatches[ 2 ].replace(
          new RegExp( "\"\"", "g" ),
          "\""
        );

      } else {

        // We found a non-quoted value.
        strMatchedValue = arrMatches[ 3 ];

      }


      // Now that we have our value string, let's add
      // it to the data array.
      arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
  }

  var ticksStyle = {
    fontColor: '#495057',
    fontStyle: 'bold'
  }

  var mode = 'index'
  var intersect = true

  /*
   * Flot Interactive Chart
   * -----------------------
   */
  // We use an inline data source in the example, usually data would
  // be fetched from a server
  var data = []
  var totalPoints = 100

  function getData() {
    var data
    $.ajax({
      async: false,
      url: '/test_sensors.csv',
      type:'GET',
      success:function(result){
        data = result
      }
    })
    var csv = CSVToArray(data, ",")
    csv = csv.map(x => [x[3], x[2]])
    //csv = csv.map(x => [x[1], x[2]]) // old one usign wrong unix timestamps
    return csv.slice(Math.max(csv.length-2880, 0), csv.length)
  }

  var interactive_plot =  $.plot('#realtime-chart', [ getData() ],
    {
      timeline: true,
      grid: {
        borderColor: '#f3f3f3',
        borderWidth: 1,
        tickColor: '#f3f3f3',
	hoverable: false,
	clickable: false,
      },
      series: {
        color: '#3c8dbc',
        lines: {
          lineWidth: 2,
          show: true,
          fill: true,
        },
      },
      yaxis: {
        show: true,
	//zoomRange: [30, 240],
	panRange: false,
	zoomRange: [1,1],
	plotPan: false,
	axisPan: false,
      },
      xaxis: {
        show: true,
        //tickFormatter: x => new Date(x * 1000).toLocaleTimeString(), // for old when bad timestamps in second column
        tickFormatter: x => new Date(x).toLocaleTimeString('en-US', {hourCycle: 'h23'}),
	zoomRange: [3600000, 86400000],
	//panRange: true,
	plotPan: true,
	axisPan: true,
	
      },
      propagateSupportedGesture: true,
      zoom: {
	interactive: true,
	active: true,
	enableTouch: true,
      },
      pan: {
      	interactive: true,
	active: true,
	enableTouch: true,
      },
    }
  )
	$('#realtime-chart').bind('drag', () => console.log("asdf"))
	function showTooltip(x, y, contents, color) {     
		$('<div id="tooltip">' + contents + '</div>').css( {
			position: 'absolute',
			width: '140px',
			display: 'none',
			'font-family': 'sans-serif',
			'font-size': '12px',
			top: y + 5,
			left: $(window).width()-x-140-5 > 0 ? x + 5 : $(window).width()-140-1,
			'border-width': '2px',
			'border-style': 'solid',
			'border-color': color,
			padding: '4px',
			'background-color': "#eee",
			opacity: 0.90
		}).appendTo("body").fadeIn(0);
	}

	function addArrow(dir, right, top, offset) {
		$("<img class='button' src='arrow-" + dir + ".gif' style='z-index: 10; right:" + right + "px;top:" + top + "px'>")
		.appendTo($('#realtime-chart-container'))
		.click((e) => {
			e.preventDefault();
			interactive_plot.pan(offset);
		});
	}
	addArrow("left", 55, 100, {left: -10});
	addArrow("right", 25, 100, {left: 10});

  $('#realtime-chart').bind('plothover', (event, pos, item) => {
	  var previousPoint = null
	  if (item) {
		  if (previousPoint != item.dataIndex) {
			  previousPoint = item.dataIndex
			  $("#tooltip").remove()
			  var x = item.datapoint[0]
			  var y = item.datapoint[1]
			  var label = "Time: " + new Date(x).toLocaleTimeString('en-US',{hourCycle: 'h23'}) + "<br>CO<sub>2</sub>: " + y + " ppm"
			  showTooltip(item.pageX, item.pageY, label, item.series.color)
		  }
	  }
	  else {
		$("#tooltip").remove()
		previousPoint = null
	  }
  })

  var updateInterval = 1000 // Fetch data ever x milliseconds
  var realtime = 'on' // If == to on then fetch data every x seconds. else stop fetching
  function update() {
    interactive_plot.setData([getData()])
    interactive_plot.draw()
    if (realtime === 'on') {
      setTimeout(update, updateInterval)
    }
  }

  // INITIALIZE REALTIME DATA FETCHING
  if (realtime === 'on') {
    update()
  }
  // REALTIME TOGGLE
  $('#realtime.btn').click(function () {
    if ($(this).data('toggle') === 'on') {
      realtime = 'on'
    } else {
      realtime = 'off'
    }
    update()
  })

  var $infectionRiskChart = $('#infection-risk-chart')
  // eslint-disable-next-line no-unused-vars
  var infectionRiskChart = new Chart($infectionRiskChart, {
    type: 'bar',
    data: {
      labels: ['-6w', '-5w', '-4w', '-3w', '-2w', '-1w', 'Current'],
      datasets: [
        {
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          data: [4, 3, 5, 7, 8, 8, 9],
          label: 'Low'
        },
        {
          backgroundColor: '#ffc107',
          borderColor: '#ffc107',
          data: [3, 3, 2, 2, 1, 2, 1],
          label: 'Mid'
        },
        {
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          data: [3, 4, 3, 1, 1, 0, 0],
          label: 'High'
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        mode: mode,
        intersect: intersect
      },
      hover: {
        mode: mode,
        intersect: intersect
      },
      legend: {
        display: true
      },
      scales: {
        yAxes: [{
          // display: false,
          gridLines: {
            display: true,
            lineWidth: '4px',
            color: 'rgba(0, 0, 0, .2)',
            zeroLineColor: 'transparent'
          },
          ticks: $.extend({
            beginAtZero: true,

            // Include a dollar sign in the ticks
            callback: function (value) {
              if (value >= 1000) {
                value /= 1000
                value += 'k'
              }

              return '';// + value
            }
          }, ticksStyle)
        }],
        xAxes: [{
          display: true,
          gridLines: {
            display: false
          },
          ticks: ticksStyle
        }]
      }
    }
  })

  var $peaksChart = $('#peaks-chart')
  // eslint-disable-next-line no-unused-vars
  var peaksChart = new Chart($peaksChart, {
    data: {
      labels: ['-6d', '-5d', '-4d', '-3d', '-2d', '-1d', 'Today'],
      datasets: [{
        type: 'line',
        data: [1023, 1152, 803, 762, 934, 754, 732],
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        pointBorderColor: '#007bff',
        pointBackgroundColor: '#007bff',
        fill: true,
        label: 'Average Maximums'
        // pointHoverBackgroundColor: '#007bff',
        // pointHoverBorderColor    : '#007bff'
      },
      {
        type: 'line',
        data: [1000, 1000, 1000, 1000, 1000, 1000, 1000],
        backgroundColor: '#343a4040',
        borderColor: '#343a4040',
        pointBorderColor: '#343a4040',
        pointBackgroundColor: '#343a4040',
        fill: true,
        pointRadius: false,
        label: 'Max Allowable'
        // pointHoverBackgroundColor: '#007bff',
        // pointHoverBorderColor    : '#007bff'
      },
      {
        type: 'line',
        data: [800, 800, 800, 800, 800, 800, 800],
        backgroundColor: '#28a74580',
        borderColor: '#28a74580',
        pointBorderColor: '#28a74580',
        pointBackgroundColor: '#28a74580',
        fill: true,
        pointRadius: false,
        label: 'Minimum Risk Target'
        // pointHoverBackgroundColor: '#007bff',
        // pointHoverBorderColor    : '#007bff'
      }]
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        mode: mode,
        intersect: intersect
      },
      hover: {
        mode: mode,
        intersect: intersect
      },
      legend: {
        display: true
      },
      scales: {
        yAxes: [{
          // display: false,
          gridLines: {
            display: true,
            lineWidth: '4px',
            color: 'rgba(0, 0, 0, .2)',
            zeroLineColor: 'transparent'
          },
          ticks: $.extend({
            beginAtZero: false,
            suggestedMax: 1000,
          }, ticksStyle)
        }],
        xAxes: [{
          display: true,
          gridLines: {
            display: false
          },
          ticks: ticksStyle
        }]
      }
    }
  })
})

// lgtm [js/unused-local-variable]
