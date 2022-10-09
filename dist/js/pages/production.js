
/* global Chart:false */

$(async function() {
  'use strict'

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
  var data; //= [{ x: 0, y: 0 }, { x: 1, y: 1 }];

  async function getData() {
    //const final = await fetch("/sensors?n=100&min_time=${new Date().getTime()-18000000}&max_time=${new Date().getTime()}").then(response => {
    const final = await fetch("/sensors?n=100").then(response => {
      return response.json();
    }).then(data => {
      let points = data.map(value => {
        return [
          value.time, value.co2
        ]
      });
      //console.log("From getData(): ", points);
      return points;
    }).catch(() => {
      console.log("Couldn't get data!");
    });
    return final;
  }

  var data = await getData();

  var interactive_plot = $.plot('#realtime-chart', [
    {
      data: data,
    }
  ],
    {
      grid: {
        borderColor: '#f3f3f3',
        borderWidth: 1,
        tickColor: '#f3f3f3'
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
        min: 300,
        max: 2000,
      },
      xaxis: {
        show: true,
        mode: "time",
        timeBase: "milliseconds",
        timezone: "browser",
        timeformat: "%b %d, %H:%M",
        //min: data[0][0],
        //max: data[data.length - 1][0]// - 1800000, // 1800000 is half hour
      }
    }
  )
  console.log(interactive_plot.getOptions());
  console.log(data);

  var updateInterval = 500 //Fetch data ever x milliseconds
  var realtime = 'on' //If == to on then fetch data every x seconds. else stop fetching
  async function update() {
    data = await getData();

    interactive_plot.setData([data]);
    interactive_plot.setupGrid();

    // Since the axes don't change, we don't need to call plot.setupGrid()
    interactive_plot.draw()
    if (realtime === 'on') {
      setTimeout(update, updateInterval)
    }
  }
  update();
})

// lgtm [js/unused-local-variable]
