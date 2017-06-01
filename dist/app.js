function generate5MinsOHLCData(t,e,a,r,n){function o(t,e){var a=(isNaN(t)?1:t)*r,n=isNaN(e)?-.5:+e;return.01*Math.round(100*(Math.random()*a+a*n))}function i(t){if(!t)return Math.round(1e3*Math.random())+1e3;var e=Math.round(200*Math.random())-400;return Math.abs(t+e)}function s(t){t.setTime(t.getTime()+3e5),t.getUTCHours()>18&&(t.setUTCDate(t.getUTCDate()+1),t.setUTCHours(9)),6==t.getUTCDay()?t.setUTCDate(t.getUTCDate()+2):0==t.getUTCDay()&&t.setUTCDate(t.getUTCDate()+1)}t=t instanceof Date?t:new Date(t);for(var c,l,d,p=new Date(t.getTime()),h=-1,m=[],g=a,u=i(n);++h<e;){var f=o();c=g+f,c<0&&(c=g-f),l=Math.max(g,c)+o(.2,0),d=Math.max(Math.min(g,c)-o(.2,0),0),u=i(u),m.push([p.getTime(),g,l,d,c,u]),g=c+o(1e-4),s(p)}return{data:m,lastValue:g,lastDate:p,lastVolume:u}}function generateSplineData(t,e){function a(t){if(!t)return Math.round(1e3*Math.random())+1e3;var e=Math.round(200*Math.random())-1e3;return Math.abs(t+e)}for(var r=-1,n=[],o=a(e),i=a(e),s=a(e),c=a(e),l=a(e);++r<t;)o=a(o),i=a(i),s=a(s),c=a(c),l=a(l),n.push([r,o,i,s,c]);return{data:n,lastValue1:o,lastValue2:i,lastValue3:s,lastValue4:c}}function changeChart(){var t=$(this).find("option:selected"),e=t.val(),a=$(this).attr("data-action-type");"configurationType"==a?(chartConfiguration=e,stopStreaming(),createChart(initialPointsCount,chartConfiguration,getFunctionForCreateChart(chartType))):"initialPointsCount"==a?(initialPointsCount=e,stopStreaming(),createChart(initialPointsCount,chartConfiguration,getFunctionForCreateChart(chartType))):"streamPointsCount"==a?(streamPointsCount=e,removeStreamingStat(),isStreaming()&&(stopStreaming(),startStreaming())):"streamingInterval"==a&&(streamingInterval=e,removeStreamingStat(),isStreaming()&&(stopStreaming(),startStreaming()))}function getFunctionForCreateChart(t){switch(t){case"stock-ohlc":return execCreateStock}}function createChart(t,e,a){chart&&(chart.dispose(),chart=null,index=0,$("#anystock-speed-test-base-chart").empty()),isFirstInit||showPreloader(),setTimeout(function(){isFirstInit=!1,a(t,e)},1)}function execCreateStock(t,e){rawData=generate5MinsOHLCData(new Date((new Date).getUTCFullYear()-4,0),t,100,10,100),perfMeter.start("Total"),perfMeter.start("Creating data storage"),dataTable=anychart.data.table(0),dataTable.addData(rawData.data),ohlcMapping=dataTable.mapAs(),ohlcMapping.addField("open",1,"first"),ohlcMapping.addField("high",2,"max"),ohlcMapping.addField("low",3,"min"),ohlcMapping.addField("close",4,"last"),columnMapping=dataTable.mapAs(),columnMapping.addField("value",5,"sum"),scrollerMapping=dataTable.mapAs(),scrollerMapping.addField("value",4,"last"),perfMeter.end("Creating data storage"),perfMeter.start("Creating chart instance"),chart=anychart.stock(),chart.listen("chartDraw",function(){$("#loader-wrapper").remove(),hidePreloader()}),"ohlc-basic"==e?setBasicChartSettings():setAdvancedChartSettings(),chart.container("anystock-speed-test-base-chart"),perfMeter.end("Creating chart instance"),perfMeter.start("Chart rendering"),chart.draw(),rawData.data=null,perfMeter.end("Chart rendering"),perfMeter.end("Total");var a=$("#anystock-speed-test-base-result");a.empty(),a.append("<h5>Rendering "+addCommas(t)+" Data Points</h5>"),a.append(generateHTMLStatRecord("Creating data storage",perfMeter.get("Creating data storage"))),a.append(generateHTMLStatRecord("Creating chart instance",perfMeter.get("Creating chart instance"))),a.append(generateHTMLStatRecord("Chart rendering",perfMeter.get("Chart rendering"))),a.append(generateHTMLStatRecord("Total",perfMeter.get("Total")))}function setBasicChartSettings(){var t=chart.plot(0).ohlc(ohlcMapping);t.name("OHLC Series"),t.tooltip().textFormatter(ohlcTextformatter),chart.padding(10,10,10,50),chart.plot(0).yAxis(),chart.plot(0).grid(0).layout("h"),chart.plot(0).minorGrid(0).layout("h"),chart.plot(0).grid(1).layout("v"),chart.plot(0).minorGrid(1).layout("v"),chart.scroller().line(scrollerMapping)}function setAdvancedChartSettings(){var t=chart.plot(0).ohlc(ohlcMapping);t.tooltip().textFormatter(ohlcTextformatter),t.name("OHLC Series");var e=chart.plot(1).column(columnMapping);e.tooltip().textFormatter(volumeTextformatter),e.name("Column"),chart.padding(10,10,10,50),chart.plot(0).yAxis(),chart.plot(1).height("30%"),chart.plot(0).grid(0).layout("h"),chart.plot(0).minorGrid(0).layout("h"),chart.plot(0).grid(1).layout("v"),chart.plot(0).minorGrid(1).layout("v"),chart.plot(1).grid(0).layout("h"),chart.plot(1).minorGrid(0).layout("h"),chart.plot(1).yScale().minimum(0),chart.plot(1).grid(1).layout("v"),chart.plot(1).minorGrid(1).layout("v"),chart.plot(1).yAxis().labels().textFormatter(function(){var t=this.tickValue,e=t<0;return t=Math.abs(t),t/1e15>=1?(t/1e9).toFixed(0)+"Q":t/1e12>=1?(t/1e9).toFixed(0)+"T":t/1e9>=1?(t/1e9).toFixed(0)+"B":t/1e6>=1?(t/1e6).toFixed(0)+"M":t/1e3>=1?(t/1e3).toFixed(0)+"K":e?"-"+t:t}),chart.scroller().line(scrollerMapping)}function isStreaming(){return!isNaN(streamingTimerId)}function toggleStreaming(){isStreaming()?stopStreaming():startStreaming()}function startStreaming(){$("#start-base-chart-stream-btn").html("Stop Data Streaming"),chart.selectRange("max"),streamingTimerId=setInterval(function(){function t(){rawData=generate5MinsOHLCData(rawData.lastDate,streamPointsCount,rawData.lastValue,10,rawData.lastVolume),perfMeter.start(streamPointsCount),dataTable.addData(rawData.data,!0),rawData.data=null,perfMeter.end(streamPointsCount),isNaN(streamingAverage)&&(streamingAverage=perfMeter.get(streamPointsCount));var t=$("#anystock-speed-test-stream-stat").length;if(t)streamingAverage=(streamingAverage+perfMeter.get(streamPointsCount))/2,$("#anystock-speed-test-stream-average .anystock-speed-test-result-row-value").html(Math.round(streamingAverage)+"ms");else{var e=$("#anystock-speed-test-base-result");e.append('<h5 id="anystock-speed-test-stream-stat">Streaming '+addCommas(streamPointsCount)+" Data Points</h5>"),e.append(generateHTMLStatRecord("Streaming interval",streamingInterval,void 0,"anystock-speed-test-stream-interval")),e.append(generateHTMLStatRecord("Average rendering time",Math.round(streamingAverage),void 0,"anystock-speed-test-stream-average"))}}requestAnimationFrame?requestAnimationFrame(t):t()},streamingInterval)}function stopStreaming(){isStreaming()&&(clearInterval(streamingTimerId),streamingTimerId=NaN),streamingAverage=NaN,$("#start-base-chart-stream-btn").html("Start Data Streaming")}function removeStreamingStat(){$("#anystock-speed-test-stream-stat").remove(),$("#anystock-speed-test-stream-interval").remove(),$("#anystock-speed-test-stream-average").remove()}function showPreloader(){$("#anystock-speed-test-base-chart").append('<div id="loader-wrapper-chart" class="anychart-loader"><div class="rotating-cover"><div class="rotating-plane"><div class="chart-row"><span class="chart-col green"></span><span class="chart-col orange"></span><span class="chart-col red"></span></div></div></div></div>')}function hidePreloader(){$("#loader-wrapper-chart").hide()}function ohlcTextformatter(){return"Open: "+parseFloat(this.open).toFixed(2)+"\nHigh: "+parseFloat(this.high).toFixed(2)+"\nLow: "+parseFloat(this.low).toFixed(2)+"\nClose: "+parseFloat(this.close).toFixed(2)}function volumeTextformatter(){return"Volume: "+parseFloat(this.value).toFixed()}function generateHTMLStatRecord(t,e,a,r){return void 0===a&&(a="ms"),r=r?'id="'+r+'" ':"","<div "+r+'class="anystock-speed-test-result-row clearfix"> <span class="anystock-speed-test-result-row-title">'+t+': </span><span class="anystock-speed-test-result-row-value">'+Math.round(e)+a+"</span></div>"}function addCommas(t){t+="",x=t.split("."),x1=x[0],x2=x.length>1?"."+x[1]:"";for(var e=/(\d+)(\d{3})/;e.test(x1);)x1=x1.replace(e,"$1,$2");return x1+x2}!function(){var t=function(){this.started={},this.finished={}};t.prototype.start=function(t){this.started[t]=window.performance?window.performance.now():+new Date},t.prototype.end=function(t){var e=window.performance?window.performance.now():+new Date;this.finished[t]=e-(this.started[t]||e),delete this.started[t]},t.prototype.get=function(t){return this.finished[t]},t.prototype.print=function(t,e){console.group(t||"Performance log");for(var a=1;a<arguments.length;a++){var r=this.get(arguments[a]);r="number"==typeof r?r.toFixed(3):""+r,console.log(arguments[a]+": "+r+"ms")}console.groupEnd(t||"Performance log")},window.basePerfMeter=new t,window.perfMeter=new t}();var rawData,perfMeter,ohlcMapping,columnMapping,scrollerMapping,streamingTimerId,streamingAverage=NaN,isFirstInit=!0,chart,dataTable,chartConfiguration="ohlc-basic",initialPointsCount=5e4,streamPointsCount=100,streamingInterval=60,index=0,chartType=$("#anystock-speed-test-chartType-select").find("option:selected").attr("data-chart"),requestAnimationFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;anychart.onDocumentReady(function(){var t=$("#anystock-speed-test-base-result").width();$("#anystock-speed-test-base-chart").css({right:t+50}),$(".select").selectpicker(),$("#start-base-chart-stream-btn").click(toggleStreaming),createChart(initialPointsCount,chartConfiguration,execCreateStock),$(".select[data-action-type]").on("change",changeChart)});