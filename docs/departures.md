# `departures(station, date = new Date())`

Get departures for one day starting at `date` at a given station. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an array of departure objects.

`station` must a FPTF `station` object or id (use the [`stations`](stations.md) method to get this information).

`date` must be a JS `Date` object. Departures returned will be later than `date` and earlier than `date + 1 day`.

## Example

```js
const krakow = '005100028'

const bilkom = require('bilkom')
bilkom.departures(krakow, new Date())
.then(console.log)
.catch(console.error)
```

## Response

```js
[
    {
        journeyId: "1|182361|0|51|8042018",
        station: "005100028",
        when: "2018-04-08T19:01:00+02:00",
        platform: null,
        line: {
            type: "line",
            id: "31104",
            product: "ICP",
            name: "ICP 31104",
            mode: "train",
            operator: "PKP"
        },
        direction: "Łódź Fabryczna"
    },
    {
        journeyId: "1|184333|0|51|8042018",
        station: "005100028",
        when: "2018-04-08T19:01:00+02:00",
        platform: null,
        line: {
            type: "line",
            id: "33256",
            product: "KML",
            name: "KML 33256",
            mode: "train",
            operator: "PKP"
        },
        direction: "Wieliczka Rynek-Kopalnia"
    }
    // …
]
```
