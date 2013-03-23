/**
 * 指定したscreenNameの最近20件のつぶやきを取得する
 */
function getTweets(screenName, callback) {
  $.getJSON('https://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + screenName + '&callback=?', function (json) {
    callback(json.reverse());
  });
}

/**
 * 指定したscreenNameのフォロワーネットワーク取得する
 */
function getNetwork(screenName, callback) {
  var nodes = {}, links = [];

  $.getJSON('https://api.twitter.com/1/users/show.json?screen_name=' + screenName + '&callback=?').then(function (json) {

    nodes[json.screen_name] = json
    return getFollowers(screenName);

  }).then(function (screenName, json) {

    var deferredObjects = [];

    for (var i = 0; i < json.slice(0, 4).length; i++) {
      var node = json[i];
      nodes[node.screen_name] = node;
      links.push({source: nodes[screenName], target: node});

      if (!node.protected) {
        deferredObjects.push(getFollowers(node.screen_name));
      }
    }

    return $.when.apply(null, deferredObjects);

  }).done(function () {

    for (var i = 0; i < arguments.length; i++) {
      for (var j = 0; j < arguments[i][1].slice(0, 4).length; j++) {
        var node = arguments[i][1][j];
        nodes[node.screen_name] = nodes[node.screen_name] || node;
        links.push({source: nodes[arguments[i][0]], target: nodes[node.screen_name]})
      }
    }

    callback($.map(nodes, function(v, k) {return v;}), links);

  })
}

/**
 * 指定したscreenNameのフォロワー情報を取得する（deferred）
 */
function getFollowers(screenName) {
    var d = new $.Deferred;
    $.getJSON('https://api.twitter.com/1/statuses/followers.json?screen_name=' + screenName + '&callback=?', function(json) {
      d.resolve(screenName, json);
    });
    return d.promise();
}
