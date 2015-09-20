var ko = require('knockout');
var fs = require('fs');
var hnapi = require('../../services/hnapi');
var sanitizeHtml = require('sanitize-html');


module.exports = function(stateRouter) {
  'use strict';
  stateRouter.addState({
    name: 'app.user-threads',
    route: '/user/threads/:userId([a-z0-9_-]+)',
    data: {
      docTitle: function(stateParams) {
        return stateParams.userId + "'s comments";
      }
    },
    template: {
      template: fs.readFileSync('app/pages/threads/threads.html', 'utf8'),
      viewModel: function() {
        this.subtitle = ko.observable();
        this.items = ko.observableArray();
      }
    },
    resolve: function(data, parameters, cb) {
        hnapi.userComments(parameters.userId)
          .then(function(items) {
            items.forEach(function(item) {
              item.text = sanitizeHtml(item.text, {
                allowedTags: ['p', 'b', 'i', 'strong', 'em', 'a'],
                allowedAttributes: {
                  a: ['href', 'title', 'rel']
                }
              });
            });
            cb(null, {items: items, subtitle: parameters.userId + "'s comments"})
          });
    },
    activate: function(context) {
      var viewModel = context.domApi.viewModel;
      viewModel.subtitle(context.content.subtitle);
      viewModel.items(context.content.items);
      stateRouter.emit('pageTitleChanged', context.content.subtitle);
    }
  });

  stateRouter.addState({
    name: 'app.threads',
    route: '/threads/:threadId([a-z0-9_-]+)',
    template: {
      template: fs.readFileSync('app/pages/threads/threads.html', 'utf8'),
      viewModel: function() {
        this.subtitle = ko.observable();
        this.items = ko.observableArray();
      }
    },
    resolve: function(data, parameters, cb) {
      hnapi._root(parameters.threadId)
        .then(function(story) {
          return hnapi.submissions([parameters.threadId])
            .then(function(comments) {
              var items = comments.filter(function(item) { return !item.deleted && item.text; });

              // Load just some more comments if available
              var kids = comments.reduce(function(previous, item) { return previous.concat(item.kids || []); }, []);
              if (kids.length > 0) {
                return hnapi._details(kids)
                  .then(function(comments) {
                    items.push.apply(items, comments.filter(function(item) { return !item.deleted; }));
                    return items;
                  });
              }
              else {
                return items;
              }
            })
            .then(function(items) {
              cb(null, {items: items, subtitle: story.title});
            })
        })
        .catch(function(error) {
          cb(error);
        })
    },
    activate: function(context) {
      var viewModel = context.domApi.viewModel;
      viewModel.subtitle(context.content.subtitle);
      viewModel.items(context.content.items);
      stateRouter.emit('pageTitleChanged', context.content.subtitle);
      document.title = context.content.subtitle + ' - Hacker News Knockout';
    }
  });
};
