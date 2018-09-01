# `journeyLeg(ref, product, lineId)`

Get details for a specific journey leg returned by `journeys` or `departures`. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with a journeyLeg object.

- `ref` must be a `journeyId` (use the `journeys` or `departures` methods to find this).
- `product` must be the `line.product` of the same journey.
- `lineId` must be the `line.id` of the same journey.

## Example

```js
const bilkom = require('bilkom')

const przemysl = '005100234'

// query departures for przemysl
bilkom.departures(przemysl).then(console.log)

// example result: {journeyId: '1|180746|0|51|2062018', line: {id: '35', product: 'D'}, …}

bilkom.journeyLeg('1|180746|0|51|2062018', 'D', '35')
.then(console.log)
.catch(console.error)
```

## Response

```js
{
    journeyId: "1|180746|0|51|2062018",
    line: {
        type: "line",
        id: "35",
        name: "D 35",
        product: "D"
    },
    stopovers: [
        {
            type: "stopover",
            stop: {
                type: "station",
                id: "005100234",
                name: "Przemyśl Główny",
                location: {
                    type: "location",
                    longitude: 22.776364,
                    latitude: 49.783664
                }
            },
            arrival: null,
            departure: "2018-06-02T18:09:00+02:00"
        },
        {
            type: "stopover",
            stop: {
                type: "station",
                id: "002200025",
                name: "Lviv"
            },
            arrival: "2018-06-02T21:50:00+02:00",
            departure: "2018-06-02T23:28:00+02:00"
        },
        {
            type: "stopover",
            stop: {
                type: "station",
                id: "002200215",
                name: "Krasne(UA)"
            },
            arrival: "2018-06-03T00:08:00+02:00",
            departure: "2018-06-03T00:10:00+02:00"
        }
        // …
    ]
}
```
