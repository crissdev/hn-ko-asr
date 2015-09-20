var ko = require('knockout');


module.exports = function NHItem(params) {
  ko.utils.extend(this, params.data);
  this.itemType = params.itemType;
}
