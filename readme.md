# bilkom

JavaScript client for the [bilkom](https://bilkom.pl) PKP railway API\*. Complies with the [friendly public transport format](https://github.com/public-transport/friendly-public-transport-format). Inofficial, using *bilkom* endpoints. Ask them for permission before using this module in production. *Work in progress.*

\*It's somewhere in between a scraper and an API client (scrapes JSON data).

[![npm version](https://img.shields.io/npm/v/bilkom.svg)](https://www.npmjs.com/package/bilkom)
[![Build Status](https://travis-ci.org/juliuste/bilkom.svg?branch=master)](https://travis-ci.org/juliuste/bilkom)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/bilkom.svg)](https://greenkeeper.io/)
[![dependency status](https://img.shields.io/david/juliuste/bilkom.svg)](https://david-dm.org/juliuste/bilkom)
[![license](https://img.shields.io/github/license/juliuste/bilkom.svg?style=flat)](LICENSE)
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

- [`stations(query)`](docs/stations.md) to search for stations such as `Warszawa Centralna` or `Gdańsk Glowny`.
- [`journeys(origin, destination, date, opt)`](docs/journeys.md) to get routes between stations.

## Similar Projects

- [pkp-ic](https://github.com/juliuste/pkp-ic/) - Client for the PKP Intercity API (older, doesn't have prices)
- [koleo](https://github.com/juliuste/koleo/) - Client for the Koleo API (inofficial)
- [meinfernbus](https://github.com/juliuste/meinfernbus/) – Client for the Flixbus/Meinfernbus API
- [db-hafas](https://github.com/derhuerst/db-hafas/) - Client for the german railways (DB) API
- [db-prices](https://github.com/juliuste/db-prices/) - Client for the german railways (DB) price API

## Contributing

If you found a bug, want to propose a feature or feel the urge to complain about your life, feel free to visit [the issues page](https://github.com/juliuste/bilkom/issues).
