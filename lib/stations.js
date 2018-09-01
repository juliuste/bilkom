'use strict'

const merge = require('lodash/merge')
const queryStations = require('./query-stations')
const allStations = require('./all-stations')

const defaults = {
    query: null
}

const stations = async (opt) => {
    const options = merge(defaults, opt || {})
    if (options.query) return queryStations(options.query)
    return allStations()
}

module.exports = stations
