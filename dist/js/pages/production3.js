/* global Chart:false */

$(function () {
  'use strict'

  var ticksStyle = {
    fontColor: '#495057',
    fontStyle: 'bold'
  }

  var mode = 'index'
  var intersect = true

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
