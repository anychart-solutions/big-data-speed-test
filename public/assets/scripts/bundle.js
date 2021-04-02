/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/data-Generator.js":
/*!***************************************!*\
  !*** ./src/scripts/data-Generator.js ***!
  \***************************************/
/***/ ((module) => {

eval("function generate5MinsOHLCData(startDate, rowsCount, openValue, spread, opt_startVolume) {\n  function rand(opt_spreadMult, opt_spreadAdd) {\n    var spreadMult = (isNaN(opt_spreadMult) ? 1 : opt_spreadMult) * spread;\n    var spreadAdd = isNaN(opt_spreadAdd) ? -0.5 : +opt_spreadAdd;\n    return Math.round((Math.random() * spreadMult + spreadMult * spreadAdd) * 100) * 0.01;\n  }\n\n  function randVolume(opt_prev) {\n    if (!opt_prev) return Math.round(Math.random() * 1e3) + 1e3;\n    var diff = Math.round(Math.random() * 2e2) - 4e2;\n    return Math.abs(opt_prev + diff);\n  }\n\n  function nextDate(date) {\n    date.setTime(date.getTime() + 1000 * 60 * 5);\n\n    if (date.getUTCHours() > 18) {\n      date.setUTCDate(date.getUTCDate() + 1);\n      date.setUTCHours(9);\n    }\n\n    if (date.getUTCDay() == 6) {\n      date.setUTCDate(date.getUTCDate() + 2);\n    } else if (date.getUTCDay() == 0) {\n      date.setUTCDate(date.getUTCDate() + 1);\n    }\n  }\n\n  startDate = startDate instanceof Date ? startDate : new Date(startDate);\n  var current = new Date(startDate.getTime());\n  var index = -1;\n  var data = [];\n  var open = openValue,\n      close,\n      high,\n      low;\n  var volume = randVolume(opt_startVolume);\n\n  while (++index < rowsCount) {\n    var diff = rand();\n    close = open + diff;\n    if (close < 0) close = open - diff;\n    high = Math.max(open, close) + rand(0.2, 0);\n    low = Math.max(Math.min(open, close) - rand(0.2, 0), 0);\n    volume = randVolume(volume);\n    data.push([current.getTime(), open, high, low, close, volume]);\n    open = close + rand(0.0001);\n    nextDate(current);\n  }\n\n  return {\n    data: data,\n    lastValue: open,\n    lastDate: current,\n    lastVolume: volume\n  };\n}\n\nmodule.exports = {\n  generate5MinsOHLCData\n};\n\n//# sourceURL=webpack://vanilla-website/./src/scripts/data-Generator.js?");

/***/ }),

/***/ "./src/scripts/main.js":
/*!*****************************!*\
  !*** ./src/scripts/main.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const {\n  PerfMeter\n} = __webpack_require__(/*! ./perfomance */ \"./src/scripts/perfomance.js\");\n\nconst {\n  generate5MinsOHLCData\n} = __webpack_require__(/*! ./data-Generator */ \"./src/scripts/data-Generator.js\");\n\nvar rawData;\nvar perfMeter = new PerfMeter();\nvar columnMapping, scrollerMapping;\nvar streamingTimerId;\nvar streamingAverage = NaN;\nvar isFirstInit = true;\nvar chart;\nvar dataTable;\nvar chartConfiguration = 'ohlc-basic';\nvar initialPointsCount = 50000;\nvar streamPointsCount = 500;\nvar streamingInterval = 20;\nvar index = 0;\nvar chartType = $('#anystock-speed-test-chartType-select').find('option:selected').attr('data-chart');\nvar requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;\nanychart.onDocumentReady(function () {\n  var resultWidth = $('#anystock-speed-test-base-result').width();\n  $('#anystock-speed-test-base-chart').css({\n    right: resultWidth + 50\n  });\n  $('.select').selectpicker();\n  $('#start-base-chart-stream-btn').click(toggleStreaming); // first init\n\n  createChart(initialPointsCount, chartConfiguration, execCreateStock);\n  $('.select[data-action-type]').on('change', changeChart);\n});\n\nfunction changeChart() {\n  var $optionSelected = $(this).find('option:selected');\n  var value = $optionSelected.val();\n  var type = $(this).attr('data-action-type');\n\n  if (type == 'configurationType') {\n    chartConfiguration = value;\n    stopStreaming();\n    createChart(initialPointsCount, chartConfiguration, getFunctionForCreateChart(chartType));\n  } else if (type == 'initialPointsCount') {\n    initialPointsCount = value;\n    stopStreaming();\n    createChart(initialPointsCount, chartConfiguration, getFunctionForCreateChart(chartType));\n  } else if (type == 'streamPointsCount') {\n    streamPointsCount = value;\n    removeStreamingStat();\n\n    if (isStreaming()) {\n      stopStreaming();\n      startStreaming();\n    }\n  } else if (type == 'streamingInterval') {\n    streamingInterval = value;\n    removeStreamingStat();\n\n    if (isStreaming()) {\n      stopStreaming();\n      startStreaming();\n    }\n  }\n}\n\nfunction getFunctionForCreateChart(chartType) {\n  switch (chartType) {\n    case 'stock-ohlc':\n      return execCreateStock;\n  }\n}\n\nfunction createChart(pointsCount, chartConfiguration, createChartFunc) {\n  if (chart) {\n    chart.dispose();\n    chart = null;\n    index = 0;\n    $('#anystock-speed-test-base-chart').empty();\n  }\n\n  if (!isFirstInit) {\n    showPreloader();\n  }\n\n  setTimeout(function () {\n    isFirstInit = false;\n    createChartFunc(pointsCount, chartConfiguration);\n  }, 1);\n}\n\nfunction execCreateStock(pointsCount, chartConfiguration) {\n  rawData = generate5MinsOHLCData(new Date(new Date().getUTCFullYear() - 4, 0), pointsCount, 100, 10, 100);\n  perfMeter.start('Total');\n  perfMeter.start('Creating data storage');\n  dataTable = anychart.data.table(0);\n  dataTable.addData(rawData.data);\n  mainMapping = dataTable.mapAs(); // first 3 fields for OHLC and Candlestick\n\n  mainMapping.addField('open', 1, 'first');\n  mainMapping.addField('high', 2, 'max');\n  mainMapping.addField('low', 3, 'min');\n  mainMapping.addField('close', 4, 'last'); // this one for line and spline\n\n  mainMapping.addField('value', 1, 'first');\n  columnMapping = dataTable.mapAs();\n  columnMapping.addField('value', 5, 'sum');\n  scrollerMapping = dataTable.mapAs();\n  scrollerMapping.addField('value', 4, 'last');\n  perfMeter.end('Creating data storage');\n  perfMeter.start('Creating chart instance');\n  chart = anychart.stock();\n  chart.listen('chartDraw', function () {\n    $('#loader-wrapper').remove();\n    hidePreloader();\n  });\n\n  switch (chartConfiguration) {\n    case 'ohlc-basic':\n      setBasicChartSettings('ohlc');\n      break;\n\n    case 'ohlc-advanced':\n      setAdvancedChartSettings('ohlc');\n      break;\n\n    case 'candlestick-basic':\n      setBasicChartSettings('candlestick');\n      break;\n\n    case 'candlestick-advanced':\n      setAdvancedChartSettings('candlestick');\n      break;\n\n    case 'line-basic':\n      setBasicChartSettings('line');\n      break;\n\n    case 'spline-basic':\n      setBasicChartSettings('spline');\n      break;\n\n    default:\n      setBasicChartSettings();\n  }\n\n  chart.container('anystock-speed-test-base-chart');\n  perfMeter.end('Creating chart instance');\n  perfMeter.start('Chart rendering');\n  chart.draw();\n  rawData.data = null;\n  perfMeter.end('Chart rendering');\n  perfMeter.end('Total');\n  var resultContainer = $('#anystock-speed-test-base-result');\n  resultContainer.empty();\n  resultContainer.append('<h5>Rendering ' + addCommas(pointsCount) + ' Data Points</h5>');\n  resultContainer.append(generateHTMLStatRecord('Creating data storage', perfMeter.get('Creating data storage')));\n  resultContainer.append(generateHTMLStatRecord('Creating chart instance', perfMeter.get('Creating chart instance')));\n  resultContainer.append(generateHTMLStatRecord('Chart rendering', perfMeter.get('Chart rendering')));\n  resultContainer.append(generateHTMLStatRecord('Total', perfMeter.get('Total')));\n}\n\nfunction setBasicChartSettings(type) {\n  chart.plot(0).defaultSeriesType(type);\n  chart.plot(0).addSeries(mainMapping);\n  chart.plot(0).getSeries(0).name('Main Series');\n  chart.padding(10, 10, 10, 65);\n  chart.scroller().line(scrollerMapping);\n}\n\nfunction setAdvancedChartSettings(type) {\n  chart.plot(0).defaultSeriesType(type);\n  var mainSeries = chart.plot(0).addSeries(mainMapping);\n  mainSeries[0].name('Main Series');\n  var columnSeies = chart.plot(1).column(columnMapping);\n  columnSeies.name('Column');\n  chart.padding(10, 10, 10, 50);\n  chart.plot(1).height('30%');\n  chart.plot(1).yAxis().labels().format(function () {\n    var val = this['tickValue'];\n    var neg = val < 0;\n    val = Math.abs(val);\n\n    if (val / 1e15 >= 1) {\n      return (val / 1e9).toFixed(0) + 'Q';\n    } else if (val / 1e12 >= 1) {\n      return (val / 1e9).toFixed(0) + 'T';\n    } else if (val / 1e9 >= 1) {\n      return (val / 1e9).toFixed(0) + 'B';\n    } else if (val / 1e6 >= 1) {\n      return (val / 1e6).toFixed(0) + 'M';\n    } else if (val / 1e3 >= 1) {\n      return (val / 1e3).toFixed(0) + 'K';\n    }\n\n    return neg ? '-' + val : val;\n  });\n  chart.scroller().line(scrollerMapping);\n}\n\nfunction isStreaming() {\n  return !isNaN(streamingTimerId);\n}\n\nfunction toggleStreaming() {\n  if (!isStreaming()) {\n    startStreaming();\n  } else {\n    stopStreaming();\n  }\n}\n\nfunction startStreaming() {\n  $('#start-base-chart-stream-btn').html('Stop Data Streaming');\n  streamingTimerId = setInterval(function () {\n    if (requestAnimationFrame) {\n      requestAnimationFrame(streamData);\n    } else {\n      streamData();\n    }\n\n    function streamData() {\n      rawData = generate5MinsOHLCData(rawData.lastDate, streamPointsCount, rawData.lastValue, 10, rawData.lastVolume);\n      perfMeter.start(streamPointsCount);\n      dataTable.addData(rawData.data, true);\n      rawData.data = null;\n      perfMeter.end(streamPointsCount);\n      if (isNaN(streamingAverage)) streamingAverage = perfMeter.get(streamPointsCount);\n      var streamingStat = $('#anystock-speed-test-stream-stat').length;\n\n      if (!streamingStat) {\n        var resultContainer = $('#anystock-speed-test-base-result');\n        resultContainer.append('<h5 id=\"anystock-speed-test-stream-stat\">Streaming ' + addCommas(streamPointsCount) + ' Data Points</h5>');\n        resultContainer.append(generateHTMLStatRecord('Streaming interval', streamingInterval, undefined, 'anystock-speed-test-stream-interval'));\n        resultContainer.append(generateHTMLStatRecord('Average rendering time', Math.round(streamingAverage), undefined, 'anystock-speed-test-stream-average'));\n      } else {\n        streamingAverage = (streamingAverage + perfMeter.get(streamPointsCount)) / 2;\n        $('#anystock-speed-test-stream-average .anystock-speed-test-result-row-value').html(Math.round(streamingAverage) + 'ms');\n      }\n    }\n  }, streamingInterval);\n}\n\nfunction stopStreaming() {\n  if (isStreaming()) {\n    clearInterval(streamingTimerId);\n    streamingTimerId = NaN;\n  }\n\n  streamingAverage = NaN;\n  $('#start-base-chart-stream-btn').html('Start Data Streaming');\n}\n\nfunction removeStreamingStat() {\n  $('#anystock-speed-test-stream-stat').remove();\n  $('#anystock-speed-test-stream-interval').remove();\n  $('#anystock-speed-test-stream-average').remove();\n}\n\nfunction showPreloader() {\n  $('#anystock-speed-test-base-chart').append('<div id=\"loader-wrapper-chart\" class=\"anychart-loader\"><div class=\"rotating-cover\"><div class=\"rotating-plane\"><div class=\"chart-row\"><span class=\"chart-col green\"></span><span class=\"chart-col orange\"></span><span class=\"chart-col red\"></span></div></div></div></div>');\n}\n\nfunction hidePreloader() {\n  $('#loader-wrapper-chart').hide();\n}\n\nfunction generateHTMLStatRecord(title, value, postfix, opt_id) {\n  if (postfix === undefined) postfix = 'ms';\n  opt_id = opt_id ? 'id=\"' + opt_id + '\" ' : '';\n  return '<div ' + opt_id + 'class=\"anystock-speed-test-result-row clearfix\"> ' + '<span class=\"anystock-speed-test-result-row-title\">' + title + ': </span>' + '<span class=\"anystock-speed-test-result-row-value\">' + Math.round(value) + postfix + '</span>' + '</div>';\n}\n\nfunction addCommas(nStr) {\n  nStr += '';\n  x = nStr.split('.');\n  x1 = x[0];\n  x2 = x.length > 1 ? '.' + x[1] : '';\n  var rgx = /(\\d+)(\\d{3})/;\n\n  while (rgx.test(x1)) {\n    x1 = x1.replace(rgx, '$1' + ',' + '$2');\n  }\n\n  return x1 + x2;\n}\n\n//# sourceURL=webpack://vanilla-website/./src/scripts/main.js?");

/***/ }),

/***/ "./src/scripts/perfomance.js":
/*!***********************************!*\
  !*** ./src/scripts/perfomance.js ***!
  \***********************************/
/***/ ((module) => {

eval("var PerfMeter = function () {\n  this.started = {};\n  this.finished = {};\n};\n\nPerfMeter.prototype.start = function (label) {\n  this.started[label] = window.performance ? window.performance.now() : +new Date();\n};\n\nPerfMeter.prototype.end = function (label) {\n  var now = window.performance ? window.performance.now() : +new Date();\n  this.finished[label] = now - (this.started[label] || now);\n  delete this.started[label];\n};\n\nPerfMeter.prototype.get = function (label) {\n  return this.finished[label];\n};\n\nPerfMeter.prototype.print = function (groupName, var_args) {\n  console.group(groupName || 'Performance log');\n\n  for (var i = 1; i < arguments.length; i++) {\n    var val = this.get(arguments[i]);\n    if (typeof val == 'number') val = val.toFixed(3);else val = '' + val;\n    console.log(arguments[i] + ': ' + val + 'ms');\n  }\n\n  console.groupEnd(groupName || 'Performance log');\n};\n\nmodule.exports = {\n  PerfMeter\n};\n\n//# sourceURL=webpack://vanilla-website/./src/scripts/perfomance.js?");

/***/ }),

/***/ "./src/styles/main.scss":
/*!******************************!*\
  !*** ./src/styles/main.scss ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://vanilla-website/./src/styles/main.scss?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	__webpack_require__("./src/scripts/main.js");
/******/ 	var __webpack_exports__ = __webpack_require__("./src/styles/main.scss");
/******/ 	
/******/ })()
;