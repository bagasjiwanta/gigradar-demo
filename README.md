# GigRadar Support Engineer Technical Test

## Commands

### Ingest

Run automatic ingest of `n` samples for every `s` seconds up to `m` maximum

```js
npm run ingest -- --limit n --seconds s --max m
```

```js
npm run ingest -- --limit 10 --seconds 10 --max 50
```

### Analyze

Run analysis on `n` samples. Note that `n` must be quite high (>50) otherwise the feature vector will have columns > rows and we cannot do SVD here (coefficients could be NaN)

```js
npm run analyze -- --max n
```

```js
npm run analyze -- --max 50
```

An insight of the first 50 records has been saved to insights.json

### Ingest Analyze

**The ingest-analyze method has not been tested yet due to time constraint**

```js
npm run ingest-analyze -- --limit 60 --seconds 10 --max 240
```