/* global Chart:false */

$(function() {
  'use strict'

  async function getData() {
    const final = await fetch("/sensors").then(response => {
      return response.json();
    }).then(data => {
      let labels = [];
      let points = data.map(value => {
        labels.push(new Date(value.time).getTime());
        return {
          x: new Date(value.time).getTime(), y: value.co2
        }
      });
      data = { points: points, labels: labels }
      console.log("From getData(): ", data);
      return data;
    }).catch(() => {
      console.log("Couldn't get data!");
    });
    return final;
  }

  var $salesChart = $('#sales-chart')
  // eslint-disable-next-line no-unused-vars
  var data = {
    labels: [],
    datasets: [
      {
        label: "CO2",
        // backgroundColor: '#007bff',
        // borderColor: '#007bff',
        data: [],
      }
    ]
  };
  var salesChart = new Chart($salesChart, {
    type: 'line',
    data: data,
    options: {
      plugins: {
        title: {
          text: 'Chart.js Time Scale',
          display: true
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            // Luxon format string
            unit: "day",
            tooltipFormat: 'DD T'
          },
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: 'value'
          }
        }
      },
    },
  })

  async function updateChart() {
    data.datasets[0].data = await getData().then((response) => {
      data.datasets[0].data = response.points;
      data.labels = response.labels;
      console.log("From updateChart(): ", data.datasets[0].data, data.datasets[0].labels);
      salesChart.update();
    });
  }
  updateChart();
})

// lgtm [js/unused-local-variable]
