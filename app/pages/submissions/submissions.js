var ko = require('knockout');
var fs = require('fs');
var hnapi = require('../../services/hnapi');


module.exports = function(stateRouter) {
  'use strict';
  stateRouter.addState({
    name: 'app.submissions',
    route: '/submitted/:userId([a-z0-9_-]+)',
    template: {
      template: fs.readFileSync('app/pages/submissions/submissions.html', 'utf8'),
      viewModel: function() {
        this.userId = ko.observable();
        this.items = ko.observableArray();
      }
    },
    resolve: function(data, parameters, cb) {
      hnapi.userStories(parameters.userId)
        .then(function(items) {
          items.forEach(function(item, index) { item.index = index + 1; });
          cb(null, { userId: parameters.userId, items: items });
        })
        .catch(function(error) {
          cb(error);
        })
    },
    activate: function(context) {
      var viewModel = context.domApi.viewModel;
      viewModel.userId(context.content.userId);
      viewModel.items(context.content.items);
      stateRouter.emit('pageTitleChanged', context.content.userId + "'s submissions")
    }
  });
};
