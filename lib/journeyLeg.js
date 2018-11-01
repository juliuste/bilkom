'use strict'

const got = require('got')
const isString = require('lodash/isString')
const moment = require('moment-timezone')
const parser = require('cheerio')
const stations = require('./stations')

const toLongID = i => {
	if (i.length === 7) return '00' + i
	return i
}

const oldAutocomplete = async (query) => {
	const results = await (got.get('http://rozklad-pkp.pl/station/search', {
		json: true,
		query: {
			term: query,
			short: 0
		}
	}).then(res => res.body))

	return results.map(x => ({
		type: 'station',
		id: toLongID(x.value),
		name: x.name
	}))
}

const stationsDict = {}

const getStation = async (name) => {
	if (stationsDict[name]) return stationsDict[name]
	const [s] = await stations({ query: name })
	if (s && s.name === name) {
		stationsDict[name] = s
		return s
	}

	const [o] = await oldAutocomplete(name)
	if (o.name === name) {
		stationsDict[name] = o
		return o
	} else throw new Error('unknown station ' + name)
}

const getTimestamp = (d) => {
	const html = parser.load(d)
	return +(html('div.date-time-hidden').text()) || null
}

const toDate = (t) => {
	if (!t) return null
	return moment.tz(t, 'Europe/Warsaw').format()
}

const createStopover = async (s) => {
	const html = parser.load(s)

	const _station = html('div.direction>h3').text()
	const station = await getStation(_station)

	const dates = html('div.connection-info>div.date-time').toArray()
	if (dates.length !== 2) throw new Error('invalid stopover')

	const [arrival, departure] = dates.map(getTimestamp)
	if (!arrival && !departure) throw new Error('invalid stopover')

	return ({
		type: 'stopover',
		stop: station,
		arrival: toDate(arrival),
		departure: toDate(departure)
	})
}

const journeyLeg = async (ref, product, lineId) => {
	if (!ref || !isString(ref)) throw new Error('invalid or missing ref')
	if (!product || !isString(product)) throw new Error('invalid or missing product')
	if (!lineId || !isString(lineId)) throw new Error('invalid or missing lineId')

	const results = await (got.get('https://beta.bilkom.pl/podroz/szczegoly', {
		query: {
			id: ref,
			tc: product,
			tn: lineId
		},
		rejectUnauthorized: false // sigh…
	}).then(res => res.body))

	const html = parser.load(results)
	const rows = html('ul#triptdetailstable>li>div.trip').toArray()
	const stopovers = await Promise.all(rows.map(createStopover))

	return ({
		journeyId: ref,
		line: {
			type: 'line',
			id: lineId,
			name: [product, lineId].join(' '),
			product
		},
		stopovers
	})
}

module.exports = journeyLeg
