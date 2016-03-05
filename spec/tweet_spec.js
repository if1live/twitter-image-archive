var Tweet = require('../tweet').Tweet;

describe("Tweet", function() {
  describe("getAllLinks", function() {
    describe("simple text", function() {
      it("profile image", function() {
        var tweet = new Tweet(require("./testdata_simple_text.json"));
        var expected = [
          "https://pbs.twimg.com/profile_images/671688812007809024/4vIrI5gJ_normal.png"
        ];
        expect(tweet.getAllLinks()).toEqual(expected);
      });
    });

    describe("media retweet", function() {
      it("media + orig user + me", function() {
        var tweet = new Tweet(require("./testdata_media_retweet.json"));
        var expected = [
          "https://pbs.twimg.com/media/CcYQxY1UMAA1SZj.jpg",
          "https://pbs.twimg.com/media/CcYQyWkVAAA1EWK.jpg",
          "https://pbs.twimg.com/profile_images/671688812007809024/4vIrI5gJ_normal.png",
          "https://pbs.twimg.com/profile_images/1682141341/____logo_normal.jpg"
        ]
        var actual = tweet.getAllLinks();
        expect(actual).toEqual(expected);
      });
    });
  });

  describe("sanitizeUrl", function() {
    it("with back-slash", function() {
      var tweet = new Tweet();
      var input = String.raw`http:\/\/pbs.twimg.com\/media\/CcYQxY1UMAA1SZj.jpg`;
      var expected = String.raw`\/cache\/pbs.twimg.com\/media\/CcYQxY1UMAA1SZj.jpg`;
      expect(tweet.sanitizeUrl(input)).toEqual(expected);
    });

    it("without back-slash", function() {
      var tweet = new Tweet();
      var input = "http://pbs.twimg.com/media/CcYQxY1UMAA1SZj.jpg";
      var expected = "/cache/pbs.twimg.com/media/CcYQxY1UMAA1SZj.jpg";
      expect(tweet.sanitizeUrl(input)).toEqual(expected);
    });
  });
});
