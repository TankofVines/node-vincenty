node-vincenty
=============

Repacked some vanilla js that calculates metric distance between two latitude and longitude coordinates based on Chris Vereen's script here:

http://www.movable-type.co.uk/scripts/latlong-vincenty.html

The module exports one function distVincenty(lat1, long1, lat2, long2) which accepts four parameters representing the latitude and longitude of the input coordinates.

Install:

npm install node-vincenty

Example:

var vincenty = require('vincenty');

var distance = vincenty.distVincenty(30.5, -100.6, 31.7, -101.8);
console.log(distance);

$ 175518.816
