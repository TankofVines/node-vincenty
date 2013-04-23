/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vincenty Direct Solution of Geodesics on the Ellipsoid (c) Chris Veness 2005-2012              */
/*                                                                                                */
/* from: Vincenty direct formula - T Vincenty, "Direct and Inverse Solutions of Geodesics on the  */
/*       Ellipsoid with application of nested equations", Survey Review, vol XXII no 176, 1975    */
/*       http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf                                             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

function toRad(Value) {
  /** Converts numeric degrees to radians */
  return Value * Math.PI / 180;
}

function toDeg(Value) {
  /** Converts radians to numeric degrees */
  return Value * 180 / Math.PI;
}

function distVincenty(lat1, lon1, lat2, lon2, callback) {
  var a = 6378137,
  	b = 6356752.314245,
  	f = 1 / 298.257223563;  // WGS-84 ellipsoid params

  var L = toRad(( lon2 - lon1 ));
  var U1 = Math.atan(( 1 - f ) * Math.tan( toRad(lat1) ));
  var U2 = Math.atan(( 1 - f ) * Math.tan( toRad(lat2) ));
  var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

  var lambda = L, lambdaP, iterLimit = 100;
  do {
    var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
    var sinSigma = Math.sqrt((cosU2*sinLambda) * (cosU2*sinLambda) +
      (cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda));
    if (sinSigma==0) {
      var result = { distance: 0, initialBearing: 0, finalBearing: 0 };
      if (callback !== undefined && callback instanceof Function) {
        if (callback.length === 3) {
          callback(result.distance, result.initialBearing, result.finalBearing);
        }
        else {
          callback(result.distance);
        }
      }
      return result;
    };  // co-incident points
    var cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda;
    var sigma = Math.atan2(sinSigma, cosSigma);
    var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
    var cosSqAlpha = 1 - sinAlpha*sinAlpha;
    var cos2SigmaM = cosSigma - 2*sinU1*sinU2/cosSqAlpha;
    if (isNaN(cos2SigmaM)) cos2SigmaM = 0;  // equatorial line: cosSqAlpha=0 (§6)
    var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
    lambdaP = lambda;
    lambda = L + (1-C) * f * sinAlpha *
      (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
  } while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0);

  if (iterLimit==0) return NaN  // formula failed to converge

  var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
  var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
  var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
  var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
    B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
  var s = b*A*(sigma-deltaSigma);

  s = Number(s.toFixed(3)); // round to 1mm precision

  // note: to return initial/final bearings in addition to distance, use something like:
  var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
  var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);
  var result = { distance: s, initialBearing: toDeg(fwdAz), finalBearing: toDeg(revAz) };

  if (callback !== undefined && callback instanceof Function) {
    if (callback.length === 3) {
      callback(result.distance, result.initialBearing, result.finalBearing);
    }
    else {
      callback(result.distance);
    }
  }

  return result;
}


/**
 * Calculates destination point given start point lat/long, bearing & distance,
 * using Vincenty inverse formula for ellipsoids
 *
 * @param   {Number} lat1, lon1: first point in decimal degrees
 * @param   {Number} brng: initial bearing in decimal degrees
 * @param   {Number} dist: distance along bearing in metres
 * @returns (LatLon} destination point
 */
function destVincenty(lat1, lon1, brng, dist, callback) {
  var a = 6378137, b = 6356752.3142,  f = 1/298.257223563;  // WGS-84 ellipsiod
  var s = dist;
  var alpha1 = toRad(brng);
  var sinAlpha1 = Math.sin(alpha1);
  var cosAlpha1 = Math.cos(alpha1);

  var tanU1 = (1-f) * Math.tan(toRad(lat1));
  var cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1*cosU1;
  var sigma1 = Math.atan2(tanU1, cosAlpha1);
  var sinAlpha = cosU1 * sinAlpha1;
  var cosSqAlpha = 1 - sinAlpha*sinAlpha;
  var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
  var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
  var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

  var sigma = s / (b*A), sigmaP = 2*Math.PI;
  while (Math.abs(sigma-sigmaP) > 1e-12) {
    var cos2SigmaM = Math.cos(2*sigma1 + sigma);
    var sinSigma = Math.sin(sigma);
    var cosSigma = Math.cos(sigma);
    var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
      B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
    sigmaP = sigma;
    sigma = s / (b*A) + deltaSigma;
  }

  var tmp = sinU1*sinSigma - cosU1*cosSigma*cosAlpha1;
  var lat2 = Math.atan2(sinU1*cosSigma + cosU1*sinSigma*cosAlpha1,
      (1-f)*Math.sqrt(sinAlpha*sinAlpha + tmp*tmp));
  var lambda = Math.atan2(sinSigma*sinAlpha1, cosU1*cosSigma - sinU1*sinSigma*cosAlpha1);
  var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
  var L = lambda - (1-C) * f * sinAlpha *
      (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
  var lon2 = (toRad(lon1)+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

  var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing, if required

  var result = { lat: toDeg(lat2), lon: toDeg(lon2), finalBearing: toDeg(revAz) };

  if (callback !== undefined && callback instanceof Function) {
    if (callback.length === 3) {
      callback(result.lat, result.lon, result.finalBearing);
    }
    else {
      callback(result);
    }
  }

  return result;
}

exports.distVincenty = distVincenty;
exports.destVincenty = destVincenty;
