var fs = require('fs');
var ko = require('knockout');


module.exports = function(stateRouter) {
  'use strict';
  stateRouter.addState({
    name: 'app',
    route: '/',
    defaultChild: 'top-stories',
    template: {
      template: fs.readFileSync('app/shell/app.html', 'utf8'),
      viewModel: function() {
        var _this = this;
        this.activePageTitle = ko.observable('');

        _this.navHome = function() {
          stateRouter.go('app');
        };

        stateRouter.on('pageTitleChanged', function(pageTitle) {
          _this.activePageTitle(pageTitle);
        });

        stateRouter.on('stateChangeEnd', function(state, stateParams) {
          var docTitle = '';

          if (state.data) {
            if (typeof state.data.docTitle === 'function') {
              docTitle = state.data.docTitle(stateParams);
            }
            else {
              docTitle = state.data.docTitle;
            }
          }
          if (docTitle) {
            window.document.title = docTitle + ' - Hacker News Knockout';
          }
          else {
            window.document.title = 'Hacker News Knockout';
          }
        });
      }
    },
    resolve: function(data, parameters, cb) {
      cb(null, {});
    }
  });
};

