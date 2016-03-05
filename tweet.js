var _ = require("underscore");

function Tweet(data) {
  this.data = data;

  this.schemas = ["http://", "https://"];
  this.patterns = _.map(this.schemas, function(schema) {
    return new RegExp(schema.replace("//", "\\\\/\\\\"), 'g')
  });
}

Tweet.prototype.getLinks = function() {
  var self = this;
  var links = _.map(self.data.entities.media, function(el) {
    return el.media_url_https;
  });

  var profileImageUrl = this.data.user.profile_image_url_https;
  links.push(profileImageUrl);
  return links;
}
Tweet.prototype.getRetweetedStatus = function() {
  return this.data.retweeted_status;
}

Tweet.prototype.getAllLinks = function() {
  var links = this.getLinks();
  var retweetedStatus = this.getRetweetedStatus();
  if(retweetedStatus !== undefined) {
    var parser = new Tweet(retweetedStatus);
    links = links.concat(parser.getLinks());
  }
  links = _.uniq(links);
  return links;
}

Tweet.prototype.sanitizeUrl = function(link) {
  var retval = link;
  _.each(this.schemas, function(schema) {
    retval = retval.replace(schema, "/cache/");
  });
  _.each(this.patterns, function(re) {
    retval = retval.replace(re, "\\/cache\\");
  });

  return retval;
}

exports.Tweet = Tweet;
