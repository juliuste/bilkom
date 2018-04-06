# `stations(query)`

Get all stations matching the given `query`. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve in an array of `station`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

```js
const bilkom = require('bilkom')
bilkom.stations('Krak')
.then(console.log)
.catch(console.error)
```

## Response

```js
[
    { // Meta station for Kraków
        type: "station",
        id: "005196001",
        name: "KRAKÓW-",
        location: {
            type: "location",
            longitude: 19.940546,
            latitude: 50.069934
        }
    },
    {
        type: "station",
        id: "005100028",
        name: "Kraków Główny",
        location: {
            type: "location",
            longitude: 19.947423,
            latitude: 50.067192
        }
    },
    {
        type: "station",
        id: "005100240",
        name: "Kraków Płaszów",
        location: {
            type: "location",
            longitude: 19.974894,
            latitude: 50.035092
        }
    }
    // …
]
```
