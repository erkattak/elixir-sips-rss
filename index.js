#!/usr/bin/env node

var username = process.env.USERNAME;
var password = process.env.PASSWORD;
var maxEpisodes = parseInt(process.env.MAX_EPISODES, 10) || 10;
var episodesDirectory = process.env.EPISODES_DIRECTORY || './episodes';
var EpisodeFetcher = require('./episode-fetcher');

if (username && password) {
  EpisodeFetcher.init({
    username: username,
    password: password,
    maxEpisodes: maxEpisodes,
    episodesDirectory: episodesDirectory
  });
  EpisodeFetcher.run();
} else {
  console.error('elixir-sips - username/password undefined');
}
