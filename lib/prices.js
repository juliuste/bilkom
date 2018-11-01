'use strict'

const clone = require('lodash/clone')
const moment = require('moment-timezone')
const got = require('got')

const toShortID = id => (id.length === 9 && id.substr(0, 2) === '00') ? id.substr(2) : id

const transformLeg = l => ({
	departureStationCode: { hafasId: toShortID(l.origin.id) },
	arrivalStationCode: { hafasId: toShortID(l.destination.id) },
	carrier: { shortName: l.line.product },
	trainNumber: l.line.id,
	departureDate: moment.tz(l.departure, 'Europe/Warsaw').format('DD-MM-YYYY HH:mm z'),
	stationIds: l.stopovers.map(s => s.stop.id)
})

const transformJourney = j => ({
	id: null,
	offeredTrains: j.legs.map(transformLeg)
})

const addPrices = async (js, url) => {
	const journeys = clone(js)
	const results = await (got.post('https://beta.bilkom.pl/podroz/ceny', {
		json: true,
		body: { journeyPrices: journeys.map(transformJourney) },
		retries: 3,
		rejectUnauthorized: false // sigh…
	}).then(res => res.body))

	for (let i = 0; i < journeys.length; i++) {
		const price = results.journeyPrices[i].totalPrice
		if (Number.isInteger(price) && price > 0) {
			journeys[i].price = {
				amount: price / 100,
				currency: 'PLN',
				url
			}
		}
	}

	return journeys
}

module.exports = addPrices
