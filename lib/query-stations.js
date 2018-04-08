'use strict'

const got = require('got')
const isString = require('lodash.isstring')

const createStation = (s) => {
    const station = {
        type: 'station',
        id: s.extId+'',
        name: s.name
    }
    if(s.geoPoint && s.geoPoint.lon && s.geoPoint.lat) station.location = {
        type: 'location',
        longitude: s.geoPoint.lon,
        latitude: s.geoPoint.lat
    }
    return station
}

const stations = async (query) => {
    if(!isString(query) || query.length < 1) throw new Error('`query` must be a non-empty string')
    const results = await (got.get('https://beta.bilkom.pl/stacje/szukaj', {
        query: {q: query},
        rejectUnauthorized: false, // sigh…
        json: true
    }).then(res => res.body))

    return results.map(createStation)
}

module.exports = stations
