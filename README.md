elixir-sips-rss
===============

A toy project to download the latest episode(s) of Elixir Sips.

A bit of irony that this project is built with Node.


# Run it

The script requires that the following environment variables are set:

- `USERNAME` - The feed is behind basic auth.
- `PASSWORD` - The feed is behind basic auth.
- `MAX_EPISODES` - I've had bad results with > `15`. Default is `10`.
- `EPISODES_DIRECTORY` - Download 'em wherever you want. Default is the project's './episodes'.

Minimally, you would run `USERNAME=you@email.com PASSWORD=yourpass npm start`
