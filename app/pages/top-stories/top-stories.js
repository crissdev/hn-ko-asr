var ko = require('knockout');
var fs = require('fs');
var hnapi = require('../../services/hnapi');


module.exports = function(stateRouter) {
  stateRouter.addState({
    name: 'app.top-stories',
    route: '',
    template: {
      template: fs.readFileSync('app/pages/top-stories/top-stories.html', 'utf8'),
      viewModel: function() {
        this.busy = ko.observable(true);
        this.items = ko.observableArray();
      }
    },
    resolve: function(data, parameters, cb) {
      hnapi.newest()
        .then(function(items) {
          items.forEach(function(item, index) { item.index = index + 1; });
          cb(null, {stories: items});
        })
        .catch(function(error) {
          cb(error);
        });
    },
    activate: function(context) {
      var viewModel = context.domApi.viewModel;
      viewModel.busy(false);
      viewModel.items(context.content.stories);
      stateRouter.emit('pageTitleChanged', 'top-stories')
    }
  });
};
