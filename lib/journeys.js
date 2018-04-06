'use strict'

const got = require('got')
const isString = require('lodash.isstring')
const isObject = require('lodash.isobject')
const isDate = require('lodash.isdate')
const unionBy = require('lodash.unionby')
const merge = require('lodash.merge')
const moment = require('moment-timezone')
const decodeHTML = require('he').decode
const parser = require('cheerio')
const slug = require('slugg')
const whilst = require('p-whilst')
const addPrices = require('./prices')

const toLongID = id => ['A=1@L=', id, '@B=1@'].join('')

const defaults = {
    duration: 3 * 60 * 60 * 1000,
    prices: false,
    via: null
    // todo: bike
}

const createStation = (s) => {
    const station = {
        // todo: s.type
        type: 'station',
        id: s.extId.length === 7 ? '00'+s.extId : ''+s.extId,
        name: s.name
    }
    if (s.geoPoint && s.geoPoint.lon && s.geoPoint.lat) station.location = {
        type: 'location',
        longitude: s.geoPoint.lon,
        latitude: s.geoPoint.lat
    }
    return station
}

const createStopover = s => ({
    type: 'stopover',
    passed: true,
    station: createStation(s),
    arrival: s.arrivalDate ? moment.tz(s.arrivalDate, 'Europe/Warsaw').format() : null,
    departure: s.departureDate ? moment.tz(s.departureDate, 'Europe/Warsaw').format() : null,
    distanceFromLast: s.distance,
    platform: s.platform,
    track: s.track
})

const getMode = routeType => {
    if (routeType.toLowerCase() === 'train') return 'train'
    if (routeType.toLowerCase() === 'bus') return 'bus'
    throw new Error(`unknown mode "${routeType}", please report this issue.`)
}

const createLeg = l => ({
    origin: createStation(l.stops[0]),
    destination: createStation(l.stops[l.stops.length - 1]),
    departure: moment.tz(l.startDate, 'Europe/Warsaw').format(),
    arrival: moment.tz(l.stopDate, 'Europe/Warsaw').format(),
    departurePlatform: l.stops[0].platform,
    departureTrack: l.stops[0].track,
    arrivalPlatform: l.stops[l.stops.length - 1].platform,
    arrivalTrack: l.stops[l.stops.length - 1].track,
    schedule: slug(l.id),
    journeyRef: l.id,
    distance: l.distance,
    mode: getMode(l.routeType),
    public: true,
    line: {
        type: 'line',
        id: l.meansOfTransport.name || l.num,
        product: l.meansOfTransport.id,
        name: [l.meansOfTransport.id, l.meansOfTransport.name || l.num].join(' ')
        // todo: l.meansOfTransport.detailedName
    },
    stopovers: l.stops.map(createStopover),
    operator: {
        type: 'operator',
        id: 'PKP',
        name: 'PKP',
        url: 'https://www.bilkom.pl'
    }
    // todo: polylineGeometry, additionalOptions, steps
})

const createJourney = j => ({
    type: 'journey',
    id: j.map(l => l.id).map(i => slug(i)).join('-'), // todo: replace slug when validate-fptf is fixed
    legs: j.map(createLeg)
})

const journey = async (origin, destination, date, options) => {
    date = moment.tz(date, 'Europe/Warsaw')

    // todo: result with less html content (probably with headers)
    const results = await (got.get('https://beta.bilkom.pl/podroz', {
        query: {
            // carrierKey: null,
            poczatkowa: toLongID(origin),
            posrednia1: options.via ? toLongID(options.via) : '',
            posrednia2: '',
            docelowa: toLongID(destination),
            data: date.format('DDMMYYYYHHmm'),
            przyjazd: false,
            minChangeTime: '',
            bilkomAvailOnly: 'on',
            _csrf: ''
        },
        rejectUnauthorized: false // sigh…
    }).then(res => ({html: res.body, url: 'https://beta.bilkom.pl'+res.req.path})))

    const document = parser.load(results.html)
    const list = document('input.jsonPath')
        .toArray()
        .map(r => parser(r).attr('value'))
        .map(decodeHTML)
        .map(JSON.parse)
        .map(createJourney)

    return [list, results.url]
}

const compareByDeparture = (a, b) => {
    a = +new Date(a.legs[0].departure)
    b = +new Date(b.legs[0].departure)
    return a - b
}

const journeys = async (origin, destination, date = new Date(), opt) => {
	const options = merge(defaults, opt || {})

    if(isString(origin)) origin = {id: origin, type: 'station'}
    if(!isString(origin.id)) throw new Error('invalid or missing origin id')
    if(origin.type !== 'station') throw new Error('invalid or missing origin type')
    origin = origin.id

    if(isString(destination)) destination = {id: destination, type: 'station'}
    if(!isString(destination.id)) throw new Error('invalid or missing destination id')
    if(destination.type !== 'station') throw new Error('invalid or missing destination type')
    destination = destination.id

    if(!isDate(date)){
        throw new Error('`date` must be a JS Date() object')
    }

    if(options.via){
        if(isString(options.via)) options.via = {id: options.via, type: 'station'}
        if(!isString(options.via.id)) throw new Error('invalid or missing options.via id')
        if(options.via.type !== 'station') throw new Error('invalid or missing options.via type')
        options.via = options.via.id
    }

    if(!Number.isInteger(options.duration) || options.duration < 0 || options.duration === Infinity) throw new Error('`opt.duration` must be a finite integer >= 0')

    const end = +date + options.duration

    let currentStart = +date
    let allJourneys = []
    const pricedJourneys = []

    const condition = () => currentStart < end
    return whilst(condition, () =>
        journey(origin, destination, currentStart, options)
        .then(([journeys, url]) => {
            if (journeys.find(j => +new Date(j.legs[0].departure) > end)) currentStart = end
            journeys = journeys.filter(j =>
                +new Date(j.legs[0].departure) < end
            &&	+new Date(j.legs[0].departure) > currentStart
            )
            if (journeys.length === 0) {
                currentStart += 60 * 60 * 1000 // try later
            } else {
                allJourneys = allJourneys.concat(journeys).sort(compareByDeparture)
                if (options.prices) pricedJourneys.push(addPrices(journeys, url))
                else pricedJourneys.push(Promise.resolve(journeys))
                const latestJourney = allJourneys[allJourneys.length - 1]
                const latestDeparture = +new Date(latestJourney.legs[0].departure)
                currentStart = latestDeparture + 60 * 1000
            }
        })
    )
    .then(() => Promise.all(pricedJourneys))
    .then(pricedJourneys => unionBy(...pricedJourneys, 'id'))
}

module.exports = journeys
