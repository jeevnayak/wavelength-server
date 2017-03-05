module.exports.getCurrentDateStr = () => {
  var currentDate = new Date();
  return currentDate.getFullYear() + pad(currentDate.getMonth() + 1) +
    pad(currentDate.getDate());
};

module.exports.getWordsForDate = (date) => {
  if (date in wordsByDate) {
    return wordsByDate[date];
  } else {
    return ["MISSING", "DATE"];
  }
};

var pad = (n) => n < 10 ? "0" + n : n;

var wordsByDate = {
  "20170302": ["FIRST", "SECOND"],
};
