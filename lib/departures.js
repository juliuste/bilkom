'use strict'

const got = require('got')
const isString = require('lodash.isstring')
const isDate = require('lodash.isdate')
const moment = require('moment-timezone')
const parser = require('cheerio')
const parseURL = require('query-string').parseUrl

const toLongID = id => ['A=1@L=', id, '@B=1@'].join('')

const createDeparture = (station) => (r) => {
    const html = parser.load(r)
    const refLink = html('a').first().attr('href')
    const parsedLink = parseURL(refLink)

    const journeyId = parsedLink.query.id

    const timestamp = +html('div.date-time-hidden').text()
    const date = moment.tz(timestamp, 'Europe/Warsaw').format()

    const direction = html('div.direction').text() || null
    const track = html('div.track').text() || null

    const lineProduct = parsedLink.query.tc
    const lineId = parsedLink.query.tn
    const lineName = html('div.number').text() || null

    return ({
        journeyId,
        station,
        when: date,
        platform: track,
        line: {
            type: 'line',
            id: lineId,
            product: lineProduct,
            name: lineName,
            mode: (lineProduct.toLowerCase() === 'bus') ? 'bus' : 'train', // todo
            operator: 'PKP'
        },
        direction
    })
}

const departures = async (station, date = new Date()) => {
    if(isString(station)) station = {id: station, type: 'station'}
    if(!isString(station.id)) throw new Error('invalid or missing station id')
    if(station.type !== 'station') throw new Error('invalid or missing station type')
    station = station.id

    if(!isDate(date)){
        throw new Error('`date` must be a JS Date() object')
    }

    const results = await (got.get('https://beta.bilkom.pl/stacje/tablica', {
        query: {
            stacja: toLongID(station),
            data: moment.tz(date, 'Europe/Warsaw').format('DDMMYYYYHHmm'),
            przyjazd: false,
            _csrf: ''
        },
        rejectUnauthorized: false // sigh…
    }).then(res => res.body))

    const momentDate = moment.tz(date, 'Europe/Warsaw')

    const html = parser.load(results)
    const rows = html('ul#timetable>li.el').toArray()
    return rows.map(createDeparture(station)).filter(dep => {
        const depDate = moment(dep.when)
        return (+depDate < +(moment(momentDate).add(1, 'days')))
    })
}

module.exports = departures
