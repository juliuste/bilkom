# `journeys(origin, destination, date = new Date(), opt)`

Get directions for routes from A to B. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an array of `journey`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

`origin` and `destination` must be `station` objects or ids (use the [`stations`](stations.md) method to get this information).

`date` must be a JS `Date` object.

`opt` partially overwrites `defaults`, which looks like this:

```js
const defaults = {
    duration: 3*60*60*1000  // searches for journeys in the next 3 hours starting at 'date' (parameter). Warning: Spawns multiple requests since the API always returns only 2-4 journeys per request, may take a couple of seconds!
    prices: false, // add pricing information to the results. also spawns multiple requests. Warning: currently, the price API is **really slow** and sometimes takes up to 20 seconds to respond. Bear this in mind when enabling this option.
}
```

## Example

```js
const krakow = {
	type: "station",
	id: "005100028",
	name: "Kraków Główny",
	location: {
		type: "location",
		longitude: 19.947423,
		latitude: 50.067192
	}
}

const gdansk = '005100009'

const bilkom = require('bilkom')
bilkom.journeys(krakow, gdansk, new Date(), {
	duration: 6*60*60*1000, // 6 hours
	prices: true // also get pricing information, can take really long!
})
.then(console.log)
.catch(console.error)
```

## Response

```js
[
    {
        type: "journey",
        id: "1-182528-0-51-6042018",
        legs: [
            {
                origin: {
                    type: "station",
                    id: "005100028",
                    name: "Kraków Główny",
                    location: {
                        type: "location",
                        longitude: 19.947423,
                        latitude: 50.067192
                    }
                },
                destination: {
                    type: "station",
                    id: "005100009",
                    name: "Gdańsk Główny",
                    location: {
                        type: "location",
                        longitude: 18.643807,
                        latitude: 54.355523
                    }
                },
                departure: "2018-04-06T21:22:00+02:00",
                arrival: "2018-04-07T07:01:00+02:00",
                departurePlatform: null,
                departureTrack: null,
                arrivalPlatform: null,
                arrivalTrack: null,
                schedule: "1-182528-0-51-6042018",
                journeyRef: "1|182528|0|51|6042018",
                distance: null,
                mode: "train",
                public: true,
                line: {
                    type: "line",
                    id: "38170",
                    product: "TLK",
                    name: "TLK 38170",
                    mode: "train"
                },
                stopovers: [
                    {
                        type: "stopover",
                        passed: true,
                        station: {
                            type: "station",
                            id: "005100028",
                            name: "Kraków Główny",
                            location: {
                                type: "location",
                                longitude: 19.947423,
                                latitude: 50.067192
                            }
                        },
                        arrival: "2018-04-06T21:21:00+02:00",
                        departure: "2018-04-06T21:22:00+02:00",
                        distanceFromLast: null,
                        platform: null,
                        track: null
                    },
                    {
                        type: "stopover",
                        passed: true,
                        station: {
                            type: "station",
                            id: "005100218",
                            name: "Miechów",
                            location: {
                                type: "location",
                                longitude: 20.01113,
                                latitude: 50.354452
                            }
                        },
                        arrival: "2018-04-06T21:53:00+02:00",
                        departure: "2018-04-06T21:54:00+02:00",
                        distanceFromLast: null,
                        platform: null,
                        track: null
                    }
                    // …
                ],
                operator: {
                    type: "operator",
                    id: "PKP",
                    name: "PKP",
                    url: "https://www.bilkom.pl"
                }
            }
        ],
        price: { // will be undefined if no pricing information is available for this journey
            amount: 79,
            currency: "PLN",
            url: "https://beta.bilkom.pl/podroz?poczatkowa=A%3D1%40L%3D005100028%40B%3D1%40&posrednia1=&posrednia2=&docelowa=A%3D1%40L%3D005100009%40B%3D1%40&data=060420181841&przyjazd=false&minChangeTime=&bilkomAvailOnly=on&_csrf="
        }
    }
    // …
]
```
