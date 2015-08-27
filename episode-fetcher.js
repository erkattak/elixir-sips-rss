'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var URI = require('URIjs');
var rss = require('parserss');
var RSS = Promise.promisify(rss);
var FS = require('fs');
var FP = require('filepath');
var got = require('got');
var elixirsipsURL = new URI('https://elixirsips.dpdcart.com/feed');

var EpisodeFetcher = function() {
  this.elixirsipsURL = elixirsipsURL;
};

EpisodeFetcher.prototype = {
  init: function (opts) {
    var options = _.assign({}, opts);
    this.episodesDirectory = FP.create(options.episodesDirectory).mkdir().path;
    this.maxEpisodes = options.maxEpisodes;
    this.username = options.username;
    this.password = options.password;

    this.elixirsipsURL.username(this.username);
    this.elixirsipsURL.password(this.password);

    return this;
  },

  authenticatedURL: function() {
    return this.elixirsipsURL.toString();
  },

  processFeed: function(feed) {
    var episodesDirectory = this.episodesDirectory;
    var username = this.username;
    var password = this.password;

    console.log('elixir-sips - Found ' + feed.articles.length + ' episodes');

    return Promise.all(_.map(feed.articles, function(episode) {

      var episodeURL = new URI(episode.enclosures[0]['url']);
      episodeURL.username(username);
      episodeURL.password(password);

      var episodeTitle = episode.title;
      var episodeFilename = episodeURL.filename();
      var file = FP.create([episodesDirectory, episodeFilename].join('/'))

      if (file.exists()) {
        return Promise.resolve()
      } else {
        return new Promise(function(resolve, reject) {
          var stream = file.newWriteStream();
          var data = got.stream(episodeURL.toString());
          data.pipe(stream);
          data.on('end', resolve);
          data.on('error', reject);
        })
          .then(function() {
            return new Promise.resolve(episodeFilename);
          })
          .catch(function(err) {
            console.error('elixir-sips - Error fetching/writing episode... removing ' + episodeFilename);
            return file.remove();
          });
      }
    }));
  },

  run: function() {
    console.log('elixir-sips - Fetching RSS feed...');
    RSS(this.authenticatedURL(), this.maxEpisodes)
      .bind(this)
      .then(this.processFeed)
      .then(function(newEpisodes) {
        newEpisodes = _(newEpisodes).compact().map( function(newEpisode) {
          if (newEpisode) console.info('elixir-sips - New episode: ' + newEpisode);
          return newEpisode;
        }).value();
        console.log('elixir-sips - Downloaded ' + newEpisodes.length + ' new episodes');
        console.log('elixir-sips - Complete!');
      })
      .catch(function(err) {
        console.error('elixir-sips - Unknown Error', err);
      });
  }
};

module.exports = new EpisodeFetcher();
