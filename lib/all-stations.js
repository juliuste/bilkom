'use strict'

const got = require('got')
const parser = require('cheerio')
const parseJSONP = require('parse-jsonp')

const toLongID = i => {
	if (i.length === 7) return '00' + i
	return i
}

const createStation = (s) => {
	const station = {
		type: 'station',
		id: toLongID(s.extId + ''),
		name: s.name
	}
	if (s.geoPoint && s.geoPoint.lon && s.geoPoint.lat) {
		station.location = {
			type: 'location',
			longitude: s.geoPoint.lon,
			latitude: s.geoPoint.lat
		}
	}
	return station
}

const stations = async () => {
	const results = await (got.get('https://beta.bilkom.pl/stacje/mapa', {
		rejectUnauthorized: false // sigh…
	}).then(res => res.body))

	// careful. this is reeeeeaaaaally bad

	const html = parser.load(results)
	const jsonp = html('script').filter((i, el) => !parser(el).attr('src')).map((i, el) => parser(el).html()).toArray().find(x => x.indexOf('var stations' >= 0))
	const [jsonpFiltered] = jsonp.match(/\n(\s*)var(.*?)\n/g)
	const stations = parseJSONP('resolve', [jsonpFiltered, ' resolve(stations)'].join(''))
	return stations.map(createStation)
}

module.exports = stations
