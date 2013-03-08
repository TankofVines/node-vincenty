node-vincenty
=============

Repackaged some vanilla js that calculates metric distance between two latitude and longitude coordinates based on Chris Veness' script here:

http://www.movable-type.co.uk/scripts/latlong-vincenty.html
http://www.movable-type.co.uk/scripts/latlong-vincenty-direct.html

The module exports two functions:
    distVincenty(lat1, long1, lat2, long2, callback) which accepts four parameters representing the latitude and longitude of the input coordinates.
    destVincenty(lat1, lon1, brng, dist) which calculates the destination point given the starting latitude and longitude with a given bearing and distance

Install:

    npm install node-vincenty

Usage:

    var vincenty = require('node-vincenty');

Examples:

    // these are synchronous
    console.log( vincenty.distVincenty(30.5, -100.6, 31.7, -101.8) );
    console.log( vincenty.destVincenty(30.5, -100.6, 175518.816, -40.4035) );

    // these are asynchronous
    vincenty.distVincenty(30.5, -100.6, 31.7, -101.8, function (distance) {
        console.log(distance);
    });

    vincenty.distVincenty(30.5, -100.6, 31.7, -101.8, function (distance, initialBearing, finalBearing) {
        console.log(distance, initialBearing, finalBearing);
    });

    vincenty.destVincenty(30.5, -100.6, 175518.816, -40.4035, function (lat, lon, finalBearing) {
        console.log(lat, lon, finalBearing);
    });

Outputs:

    { distance: '175518.816',
      initialBearing: -40.40353176919702,
      finalBearing: -41.02342255854039 }
    { lat: 30.50034497548687,
      lon: -100.59986425485471,
      finalBearing: -161.1839311037904 }
    175518.816
    175518.816 -40.40353176919702 -41.02342255854039
    30.50034497548687 -100.59986425485471 -161.1839311037904
