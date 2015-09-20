var ko = require('knockout');
var fs = require('fs');
var hnapi = require('../../services/hnapi');
var sanitizeHtml = require('sanitize-html');


module.exports = function(stateRouter) {
  'use strict';
  stateRouter.addState({
    name: 'app.user',
    route: '/user/:userId([a-z0-9_-]+)',
    data: {
      docTitle: function(stateParams) {
        return 'Profile: ' + stateParams.userId;
      }
    },
    template: {
      template: fs.readFileSync('app/pages/user/user.html', 'utf8'),
      viewModel: function() {
        this.userId = ko.observable();
        this.created = ko.observable();
        this.karma = ko.observable();
        this.about = ko.observable();

        this.init = function(data) {
          this.userId(data.id);
          this.created(data.created);
          this.karma(data.karma);
          this.about(sanitizeHtml(data.about, {
            allowedTags: ['p', 'b', 'i', 'strong', 'em', 'a'],
            allowedAttributes: {
              a: ['href', 'title', 'rel']
            }
          }));
        }
      }
    },
    resolve: function(data, parameters, cb) {
      hnapi.userInfo(parameters.userId)
        .then(function(data) {
          cb(null, data);
        })
        .catch(function(error) {
          cb(error);
        });
    },
    activate: function(context) {
      var viewModel = context.domApi.viewModel;
      viewModel.init(context.content);
      stateRouter.emit('pageTitleChanged', context.content.id + "'s profile")
    }
  })
};
