'use strict'

const tapeWithoutPromise = require('tape')
const addPromiseSupport = require('tape-promise').default
const tape = addPromiseSupport(tapeWithoutPromise)
const validate = require('validate-fptf')()
const moment = require('moment-timezone')
const isString = require('lodash/isString')
const isURL = require('is-url-superb')
const bilkom = require('.')

tape('bilkom.stations (all)', async (t) => {
	let results = await bilkom.stations()
	t.ok(Array.isArray(results))
	t.ok(results.length > 1000, 'stations length')

	for (let s of results) {
		validate(s)
		t.ok(s.location.longitude > 10 && s.location.longitude < 25, 'longitude')
		t.ok(s.location.latitude > 40 && s.location.latitude < 60, 'latitude')
	}

	t.end()
})

tape('bilkom.stations (query)', async (t) => {
	let results = await bilkom.stations({query: 'a'})
	t.ok(Array.isArray(results))
	t.ok(results.length === 0, 'stations length')

	results = await bilkom.stations({query: 'Krak'})
	t.ok(Array.isArray(results))
	t.ok(results.length >= 5 && results.length < 100, 'stations length')
	for (let s of results) validate(s)

	const krakowGl = results.find(x => x.name.indexOf('Kraków Gł') >= 0)
	t.ok(krakowGl.location.longitude > 10 && krakowGl.location.longitude < 20, 'krakow longitude')
	t.ok(krakowGl.location.latitude > 45 && krakowGl.location.latitude < 55, 'krakow latitude')

	results = await bilkom.stations({query: 'Gda'})
	t.ok(Array.isArray(results))
	t.ok(results.length >= 5 && results.length < 100, 'stations length')
	for (let s of results) validate(s)

	const gdanskGl = results.find(x => x.name.indexOf('Gdańsk Gł') >= 0)
	t.ok(gdanskGl.location.longitude > 10 && gdanskGl.location.longitude < 20, 'gdansk longitude')
	t.ok(gdanskGl.location.latitude > 45 && gdanskGl.location.latitude < 55, 'gdansk latitude')

	t.end()
})

const szczecin = '005100057'
const przemysl = '005100234'

const gdansk = '005100009'
const gdynia = '005100010'

tape('bilkom.journeys', async (t) => {
	const journeys = await bilkom.journeys(szczecin, przemysl, moment.tz('Europe/Warsaw').add(5, 'days').startOf('day').add(7, 'hours').toDate(), {duration: 12*60*60*1000, prices: true})
	t.ok(journeys.length > 3, 'journeys length')

	for (let j of journeys) {
		validate(j)
		for (let l of j.legs) {
			for (let s of l.stopovers) validate(s)
			validate(l.line)
		}
	}

	t.ok(journeys[0].legs[0].origin.id === szczecin, 'origin id')
	t.ok(journeys[0].legs[journeys[0].legs.length-1].destination.id === przemysl, 'destination id')

	t.ok(journeys[0].legs.every(l => l.operator.id === 'PKP'), 'leg operator')

	t.ok(journeys.some(j => j.price), 'price')
	for (let journey of journeys) {
		if (journey.price) {
			t.ok(journey.price.amount > 0, 'price amount')
			t.ok(journey.price.currency === 'PLN', 'price currency')
			t.ok(isURL(journey.price.url), 'price url')
		}
	}

	t.end()
})

tape('bilkom.departures', async (t) => {
	const momentDate = moment.tz('Europe/Warsaw').add(5, 'days').startOf('day')
	const departures = await bilkom.departures(gdansk, momentDate.toDate())

	t.ok(Array.isArray(departures))
	t.ok(departures.length > 50, 'departures length')

	const day = momentDate.format('DDMMYYYY')
	for (let d of departures) {
		t.ok(d.journeyId && isString(d.journeyId), 'departure journeyId')
		t.ok(d.station && isString(d.station), 'departure station')
		validate(d.line)
		t.ok(d.line.product && isString(d.line.product), 'departure line.product')

		t.ok(d.when && isString(d.when), 'departure when')
		const tDay = moment(d.when).format('DDMMYYYY')
		t.ok(day === tDay)

		t.ok(d.direction && isString(d.direction), 'departure direction')
	}

	t.end()
})

tape('bilkom.journeyLeg', async (t) => {
	const date = moment.tz('Europe/Warsaw').add(5, 'days').startOf('day').toDate()
	const departures = await bilkom.departures(przemysl, date)
	t.ok(Array.isArray(departures), 'precondition')
	t.ok(departures.length >= 5, 'precondition')

	let leg = departures.find(x => x.line.product === 'IC')
	t.ok(leg, 'precondition a')
	t.ok(leg.line, 'precondition a')
	t.ok(leg.line.product, 'precondition a')
	t.ok(leg.line.id, 'precondition a')

	let details = await bilkom.journeyLeg(leg.journeyId, leg.line.product, leg.line.id)
	t.ok(details)
	t.ok(details.journeyId === leg.journeyId)
	t.ok(details.line.type === leg.line.type)
	t.ok(details.line.id === leg.line.id)
	t.ok(details.line.product === leg.line.product)

	for (let stopover of details.stopovers) {
		validate(stopover)
		t.ok(stopover.stop.location)
	}


	leg = departures.find(x => x.line.product === 'D')
	t.ok(leg, 'precondition b')
	t.ok(leg.line, 'precondition b')
	t.ok(leg.line.product, 'precondition b')
	t.ok(leg.line.id, 'precondition b')

	details = await bilkom.journeyLeg(leg.journeyId, leg.line.product, leg.line.id)
	t.ok(details)
	t.ok(details.journeyId === leg.journeyId)
	t.ok(details.line.type === leg.line.type)
	t.ok(details.line.id === leg.line.id)
	t.ok(details.line.product === leg.line.product)

	for (let stopover of details.stopovers) {
		validate(stopover)
	}

	t.end()
})
