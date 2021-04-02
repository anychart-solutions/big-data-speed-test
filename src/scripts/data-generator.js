function generate5MinsOHLCData(
  startDate,
  rowsCount,
  openValue,
  spread,
  opt_startVolume
) {
  function rand(opt_spreadMult, opt_spreadAdd) {
    var spreadMult = (isNaN(opt_spreadMult) ? 1 : opt_spreadMult) * spread;
    var spreadAdd = isNaN(opt_spreadAdd) ? -0.5 : +opt_spreadAdd;
    return (
      Math.round((Math.random() * spreadMult + spreadMult * spreadAdd) * 100) *
      0.01
    );
  }

  function randVolume(opt_prev) {
    if (!opt_prev) return Math.round(Math.random() * 1e3) + 1e3;
    var diff = Math.round(Math.random() * 2e2) - 4e2;
    return Math.abs(opt_prev + diff);
  }

  function nextDate(date) {
    date.setTime(date.getTime() + 1000 * 60 * 5);
    if (date.getUTCHours() > 18) {
      date.setUTCDate(date.getUTCDate() + 1);
      date.setUTCHours(9);
    }
    if (date.getUTCDay() == 6) {
      date.setUTCDate(date.getUTCDate() + 2);
    } else if (date.getUTCDay() == 0) {
      date.setUTCDate(date.getUTCDate() + 1);
    }
  }

  startDate = startDate instanceof Date ? startDate : new Date(startDate);
  var current = new Date(startDate.getTime());
  var index = -1;

  var data = [];
  var open = openValue,
    close,
    high,
    low;
  var volume = randVolume(opt_startVolume);
  while (++index < rowsCount) {
    var diff = rand();
    close = open + diff;
    if (close < 0) close = open - diff;
    high = Math.max(open, close) + rand(0.2, 0);
    low = Math.max(Math.min(open, close) - rand(0.2, 0), 0);
    volume = randVolume(volume);
    data.push([current.getTime(), open, high, low, close, volume]);
    open = close + rand(0.0001);
    nextDate(current);
  }
  return {
    data: data,
    lastValue: open,
    lastDate: current,
    lastVolume: volume,
  };
}

module.exports = { generate5MinsOHLCData };
