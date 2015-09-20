var Firebase = require('firebase');
var endpoint = 'https://hacker-news.firebaseio.com/v0/';
var connection = new Firebase(endpoint);
var Promise = require('native-promise-only/npo');


module.exports.newest = newest;
module.exports.userInfo = userInfo;
module.exports.userSubmissions = userSubmissions;
module.exports.userStories = userStories;
module.exports.userComments = userComments;
module.exports.submissions = submissions;
module.exports._root = _root;
module.exports._details = _details;


function newest() {
  return new Promise(function(resolve) {
    connection.child('topstories').limitToFirst(20).once('value', function(items) {
      _details(items.val()).then(resolve);
    });
  });
}

function userInfo(userId) {
  return new Promise(function(resolve) {
    connection.child('user/' + userId).once('value', function(value) { resolve(value.val()); });
  });
}

function userSubmissions(userId) {
  return new Promise(function(resolve) {
    connection.child('user/' + userId + '/submitted').limitToFirst(20)
      .once('value', function(value) {
        submissions(value.val())
          .then(function(items) { return items.filter(function(item) { return !item.deleted; }); })
          .then(function(items) { return items.splice(0, 20); })
          .then(resolve);
      });
  });
}

function userStories(userId) {
  return userSubmissions(userId)
    .then(function(items) { return items.filter(function(item) { return item.type === 'story'; }); });
}

function userComments(userId) {
  return userSubmissions(userId)
    .then(function(items) { return items.filter(function(item) { return item.type === 'comment'; }); })
    .then(function(items) {
      return new Promise(function(resolve) {
        var promises = items.map(function(item) {
          return _root(item.parent).then(function(story) {
            item.storyTitle = story.title;
            item.storyId = story.id;
            return item;
          })
        });
        return Promise.all(promises).then(resolve);
      });
    });
}

function submissions(items) {
  return _details(items)
}

function _root(itemId) {
  return _details([itemId]).then(function(details) {
    if (details[0].parent) {
      return _root(details[0].parent);
    }
    return details[0];
  });
}

function _details(items) {
  return new Promise(function(resolve) {
    var promises = items.map(function(itemId) {
      return new Promise(function(resolveItem) {
        connection.child('item/' + itemId).once('value', function(value) {
          resolveItem(value.val());
        });
      });
    });
    Promise.all(promises).then(resolve);
  });
}
