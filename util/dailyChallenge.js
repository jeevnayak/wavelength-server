module.exports.getCurrentDateStr = function() {
  var currentDate = new Date();
  return currentDate.getFullYear() + pad(currentDate.getMonth() + 1) +
    pad(currentDate.getDate());
}

module.exports.getWordsForDate = function(date) {
  if (date in wordsByDate) {
    return wordsByDate[date];
  } else {
    return ["MISSING", "DATE"];
  }
}

var pad = function(n) {
  return n < 10 ? "0" + n : n;
}

var wordsByDate = {
  "20170302": ["FIRST", "SECOND"],
};
