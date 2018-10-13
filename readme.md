# bilkom

JavaScript client and scraper for the [bilkom](https://bilkom.pl) PKP railway API\*. Complies with the [friendly public transport format](https://github.com/public-transport/friendly-public-transport-format). Inofficial, using *bilkom* endpoints. Ask them for permission before using this module in production. *Work in progress.*

\*Some methods query an API, some other methods scrape data from the website.

[![npm version](https://img.shields.io/npm/v/bilkom.svg)](https://www.npmjs.com/package/bilkom)
[![Build Status](https://travis-ci.org/juliuste/bilkom.svg?branch=master)](https://travis-ci.org/juliuste/bilkom)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/bilkom.svg)](https://greenkeeper.io/)
[![dependency status](https://img.shields.io/david/juliuste/bilkom.svg)](https://david-dm.org/juliuste/bilkom)
[![license](https://img.shields.io/github/license/juliuste/bilkom.svg?style=flat)](LICENSE)
[![fptf version](https://fptf.badges.juliustens.eu/badge/juliuste/bilkom)](https://fptf.badges.juliustens.eu/link/juliuste/bilkom)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation

```shell
npm install --save bilkom
```

## Usage

```javascript
const bilkom = require('bilkom')
```

This package contains data in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) and provides the following methods:

- [`stations(opt)`](docs/stations.md) to get a list of operated stations (or search for a specific query), such as `Warszawa Centralna` or `Gdańsk Główny`.  (Only stations in Poland.)
- [`journeys(origin, destination, date, opt)`](docs/journeys.md) to get routes between stations.
- [`departures(station, date)`](docs/departures.md) to get departures at a given station.
- [`journeyLeg(ref, product, lineId)`](docs/journeyLeg.md) to get details for a specific journey leg returned by `journeys` or `departures`.

## Similar Projects

- [pkp-ic](https://github.com/juliuste/pkp-ic/) - Client for the PKP Intercity API (older, doesn't have prices)
- [koleo](https://github.com/juliuste/koleo/) - Client for the Koleo API (inofficial)
- [meinfernbus](https://github.com/juliuste/meinfernbus/) – Client for the Flixbus/Meinfernbus API
- [db-hafas](https://github.com/derhuerst/db-hafas/) - Client for the german railways (DB) API
- [db-prices](https://github.com/juliuste/db-prices/) - Client for the german railways (DB) price API

## Contributing

If you found a bug, want to propose a feature or feel the urge to complain about your life, feel free to visit [the issues page](https://github.com/juliuste/bilkom/issues).
