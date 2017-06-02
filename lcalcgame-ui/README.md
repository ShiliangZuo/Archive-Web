# lcalcgame
A prototype of a game to teach programming

## Instructions
To play, download the .zip and spin up a local server with:

> bash server.sh

on port 8000. (http://localhost:8000/)

### Data logger
To log data for players, spin up the local logging server with:

> bash datalogger.sh

and use the GET param player=<index> when visiting the game URL. For instance,

> http://localhost:8000/?player=7

logs data only for player 7. This is useful since data can be logged across sessions (visits to the game),
in case the game breaks or Chrome crashes.

### Requirements
This game has been tested on a Mac in Google Chrome.
