var StateRouter = require('abstract-state-router');
var makeRenderer = require('knockout-state-renderer');
var domready = require('domready');
var fs = require('fs');
var moment = require('moment');
var _ = require('underscore.string');
var stateRouter = StateRouter(makeRenderer(), 'body');

// Register custom KO functionality
var ko = require('knockout');
require('./eww/knockout-punches');
require('./eww/knockout-switch-case');
ko.punches.enableAll();

// Custom KO filters
ko.filters.plural   = function(count) { return ko.unwrap(count) > 1 ? 's' : ''; };
ko.filters.itemLink = function(itemId) { return '#/threads/' + encodeURIComponent(ko.unwrap(itemId)); };
ko.filters.userLink = function(userId) { return '#/user/' + encodeURIComponent(ko.unwrap(userId)); };
ko.filters.threadsLink = function(userId) { return '#/user/threads/' + encodeURIComponent(ko.unwrap(userId)); };
ko.filters.submissionsLink = function(userId) { return '#/submitted/' + encodeURIComponent(ko.unwrap(userId)); };
ko.filters.timeAgo = function(unixTimestamp) { return moment.unix(ko.unwrap(unixTimestamp)).fromNow(); };
ko.filters.padLeft = function(value, count, ch) { return _.pad(ko.unwrap(value), ko.unwrap(count), (ko.unwrap(ch) === undefined ? ' ' : ko.unwrap(ch)), 'left'); };


// Register custom KO components
ko.components.register('cko-hn-item', {
  viewModel: require('./components/hn-item/index'),
  template: fs.readFileSync('app/components/hn-item/index.html', 'utf8')
});


require('./shell/app')(stateRouter);
require('./pages/top-stories/top-stories')(stateRouter);
require('./pages/user/user')(stateRouter);
require('./pages/submissions/submissions')(stateRouter);
require('./pages/threads/threads')(stateRouter);


domready(function() {
  stateRouter.evaluateCurrentRoute('app');
});
