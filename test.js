'use strict'

const tape = require('tape')
const validate = require('validate-fptf')
const moment = require('moment-timezone')
const isURL = require('is-url-superb')
const bilkom = require('./index')

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

// const gdansk = '005100009'
// const gdynia = '005100010'

tape('bilkom.journeys', async (t) => {
	const journeys = await bilkom.journeys(szczecin, przemysl, moment.tz('Europe/Warsaw').add(5, 'days').startOf('day').add(7, 'hours').toDate(), {duration: 12*60*60*1000, prices: true})
		t.ok(journeys.length > 3, 'journeys length')

		for (let j of journeys) {
			validate(j)
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
