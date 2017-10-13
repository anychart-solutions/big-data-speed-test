var rawData;
var perfMeter;
var columnMapping, scrollerMapping;
var streamingTimerId;
var streamingAverage = NaN;

var isFirstInit = true;

var chart;
var dataTable;

var chartConfiguration = 'ohlc-basic';
var initialPointsCount = 50000;
var streamPointsCount = 500;
var streamingInterval = 20;

var index = 0;

var chartType = $('#anystock-speed-test-chartType-select').find('option:selected').attr('data-chart');

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

anychart.onDocumentReady(function () {
    var resultWidth = $('#anystock-speed-test-base-result').width();
    $('#anystock-speed-test-base-chart').css({'right': resultWidth + 50});

    $('.select').selectpicker();

    $('#start-base-chart-stream-btn').click(toggleStreaming);

    // first init
    createChart(initialPointsCount, chartConfiguration, execCreateStock);

    $('.select[data-action-type]').on('change', changeChart);
});

function changeChart() {
    var $optionSelected = $(this).find("option:selected");
    var value = $optionSelected.val();
    var type = $(this).attr('data-action-type');

    if (type == 'configurationType') {
        chartConfiguration = value;
        stopStreaming();
        createChart(initialPointsCount, chartConfiguration, getFunctionForCreateChart(chartType));
    } else if (type == 'initialPointsCount') {
        initialPointsCount = value;
        stopStreaming();
        createChart(initialPointsCount, chartConfiguration, getFunctionForCreateChart(chartType))
    } else if (type == 'streamPointsCount') {
        streamPointsCount = value;
        removeStreamingStat();
        if (isStreaming()) {
            stopStreaming();
            startStreaming();
        }
    } else if (type == 'streamingInterval') {
        streamingInterval = value;
        removeStreamingStat();
        if (isStreaming()) {
            stopStreaming();
            startStreaming();
        }
    }
}

function getFunctionForCreateChart(chartType) {
    switch (chartType) {
        case 'stock-ohlc':
            return execCreateStock;
    }
}

function createChart(pointsCount, chartConfiguration, createChartFunc) {
    if (chart) {
        chart.dispose();
        chart = null;
        index = 0;
        $('#anystock-speed-test-base-chart').empty();
    }

    if (!isFirstInit) {
        showPreloader();
    }

    setTimeout(function () {
        isFirstInit = false;
        createChartFunc(pointsCount, chartConfiguration);
    }, 1);

}

function execCreateStock(pointsCount, chartConfiguration) {
    rawData = generate5MinsOHLCData(new Date(new Date().getUTCFullYear() - 4, 0), pointsCount, 100, 10, 100);

    perfMeter.start('Total');

    perfMeter.start('Creating data storage');
    dataTable = anychart.data.table(0);
    dataTable.addData(rawData.data);
    mainMapping = dataTable.mapAs();
    // first 3 fields for OHLC and Candlestick
    mainMapping.addField('open', 1, 'first');
    mainMapping.addField('high', 2, 'max');
    mainMapping.addField('low', 3, 'min');
    mainMapping.addField('close', 4, 'last');
    // this one for line and spline
    mainMapping.addField('value', 1, 'first');

    columnMapping = dataTable.mapAs();
    columnMapping.addField('value', 5, 'sum');

    scrollerMapping = dataTable.mapAs();
    scrollerMapping.addField('value', 4, 'last');

    perfMeter.end('Creating data storage');

    perfMeter.start('Creating chart instance');
    chart = anychart.stock();
    chart.listen('chartDraw', function () {
        $('#loader-wrapper').remove();
        hidePreloader();
    });
    switch(chartConfiguration) {
        case 'ohlc-basic':
            setBasicChartSettings('ohlc');
            break;
        case 'ohlc-advanced':
            setAdvancedChartSettings('ohlc');
            break;
        case 'candlestick-basic':
            setBasicChartSettings('candlestick');
            break;
        case 'candlestick-advanced':
            setAdvancedChartSettings('candlestick');
            break;
        case 'line-basic':
            setBasicChartSettings('line');
            break;
        case 'spline-basic':
            setBasicChartSettings('spline');
            break;
        default:
            setBasicChartSettings();
    }

    chart.container('anystock-speed-test-base-chart');
    perfMeter.end('Creating chart instance');

    perfMeter.start('Chart rendering');
    chart.draw();
    rawData.data = null;
    perfMeter.end('Chart rendering');

    perfMeter.end('Total');

    var resultContainer = $('#anystock-speed-test-base-result');
    resultContainer.empty();
    resultContainer.append('<h5>Rendering ' + addCommas(pointsCount) + ' Data Points</h5>');
    resultContainer.append(generateHTMLStatRecord('Creating data storage', perfMeter.get('Creating data storage')));
    resultContainer.append(generateHTMLStatRecord('Creating chart instance', perfMeter.get('Creating chart instance')));
    resultContainer.append(generateHTMLStatRecord('Chart rendering', perfMeter.get('Chart rendering')));
    resultContainer.append(generateHTMLStatRecord('Total', perfMeter.get('Total')));
}

function setBasicChartSettings(type) {
    chart.plot(0).defaultSeriesType(type);
    chart.plot(0).addSeries(mainMapping);
    chart.plot(0).getSeries(0).name('Main Series');
    chart.padding(10, 10, 10, 65);
    chart.scroller().line(scrollerMapping);
}

function setAdvancedChartSettings(type) {
    chart.plot(0).defaultSeriesType(type);
    var mainSeries = chart.plot(0).addSeries(mainMapping);
    mainSeries[0].name('Main Series');

    var columnSeies = chart.plot(1).column(columnMapping);
    columnSeies.name('Column');

    chart.padding(10, 10, 10, 50);
    chart.plot(1).height('30%');

    chart.plot(1).yAxis().labels().format(function () {
        var val = this['tickValue'];
        var neg = val < 0;
        val = Math.abs(val);
        if (val / 1e15 >= 1) {
            return (val / 1e9).toFixed(0) + 'Q';
        } else if (val / 1e12 >= 1) {
            return (val / 1e9).toFixed(0) + 'T';
        } else if (val / 1e9 >= 1) {
            return (val / 1e9).toFixed(0) + 'B';
        } else if (val / 1e6 >= 1) {
            return (val / 1e6).toFixed(0) + 'M';
        } else if (val / 1e3 >= 1) {
            return (val / 1e3).toFixed(0) + 'K';
        }
        return neg ? '-' + val : val;
    });


    chart.scroller().line(scrollerMapping);
}

function isStreaming() {
    return !isNaN(streamingTimerId);
}

function toggleStreaming() {
    if (!isStreaming()) {
        startStreaming();
    } else {
        stopStreaming();
    }
}

function startStreaming() {
    $('#start-base-chart-stream-btn').html('Stop Data Streaming');

    streamingTimerId = setInterval(function () {

        if (requestAnimationFrame) {
            requestAnimationFrame(streamData);
        } else {
            streamData();
        }

        function streamData() {
            rawData = generate5MinsOHLCData(rawData.lastDate, streamPointsCount, rawData.lastValue, 10, rawData.lastVolume);

            perfMeter.start(streamPointsCount);
            dataTable.addData(rawData.data, true);
            rawData.data = null;
            perfMeter.end(streamPointsCount);

            if (isNaN(streamingAverage)) streamingAverage = perfMeter.get(streamPointsCount);

            var streamingStat = $('#anystock-speed-test-stream-stat').length;
            if (!streamingStat) {
                var resultContainer = $('#anystock-speed-test-base-result');
                resultContainer.append('<h5 id="anystock-speed-test-stream-stat">Streaming ' + addCommas(streamPointsCount) + ' Data Points</h5>');
                resultContainer.append(generateHTMLStatRecord('Streaming interval', streamingInterval, undefined, 'anystock-speed-test-stream-interval'));
                resultContainer.append(generateHTMLStatRecord('Average rendering time', Math.round(streamingAverage), undefined, 'anystock-speed-test-stream-average'));
            } else {
                streamingAverage = (streamingAverage + perfMeter.get(streamPointsCount)) / 2;
                $('#anystock-speed-test-stream-average .anystock-speed-test-result-row-value').html(Math.round(streamingAverage) + 'ms');
            }
        }

    }, streamingInterval);
}

function stopStreaming() {
    if (isStreaming()) {
        clearInterval(streamingTimerId);
        streamingTimerId = NaN;
    }
    streamingAverage = NaN;
    $('#start-base-chart-stream-btn').html('Start Data Streaming');
}

function removeStreamingStat() {
    $('#anystock-speed-test-stream-stat').remove();
    $('#anystock-speed-test-stream-interval').remove();
    $('#anystock-speed-test-stream-average').remove();
}

function showPreloader() {
    $('#anystock-speed-test-base-chart').append('<div id="loader-wrapper-chart" class="anychart-loader"><div class="rotating-cover"><div class="rotating-plane"><div class="chart-row"><span class="chart-col green"></span><span class="chart-col orange"></span><span class="chart-col red"></span></div></div></div></div>');
}

function hidePreloader() {
    $('#loader-wrapper-chart').hide();
}

function generateHTMLStatRecord(title, value, postfix, opt_id) {
    if (postfix === undefined) postfix = 'ms';
    opt_id = opt_id ? 'id="' + opt_id + '" ' : '';
    return '<div ' + opt_id + 'class="anystock-speed-test-result-row clearfix"> ' +
        '<span class="anystock-speed-test-result-row-title">' + title + ': </span>' +
        '<span class="anystock-speed-test-result-row-value">' + Math.round(value) + postfix + '</span>' +
        '</div>';
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
