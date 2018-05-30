# can-zone-jsdom

__can-zone-jsdom__ is a [Zone plugin](https://github.com/canjs/can-zone) that provides a DOM implementation backed by [jsdom](https://github.com/jsdom/jsdom).

[![Build Status](https://travis-ci.org/canjs/can-zone-jsdom.svg?branch=master)](https://travis-ci.org/canjs/can-zone-jsdom)
[![npm version](https://badge.fury.io/js/can-zone-jsdom.svg)](http://badge.fury.io/js/can-zone-jsdom)

## Install

```
npm install can-zone-jsdom --save
```

## Usage

The most common way to use can-zone-jsdom is to provide a HTML page as the entry point. This page will be loaded in a new JSDOM context, and its scripts executed. Below shows using the plugin within an [Express](https://expressjs.com/) app.

```js
const Zone = require('can-zone');
const express = require('express');
const app = express();

const dom = require('can-zone-jsdom');
const requests = require('done-ssr/zones/requests');

app.use(express.static('build', { index: false }));
app.use(express.static('.'));

app.get('*', async (request, response) => {
  var zone = new Zone([
    // Overrides XHR, fetch
    requests(request),

    // Sets up a DOM
    dom(request, {
      root: __dirname + '/../build',
      html: 'index.html'
    })
  ]);

  const { html } = await zone.run();
  response.end(html);
});

app.listen(8080);
```

See [this guide](https://donejs.com/ssr-react.html) for a more full featured example using incremental rendering within a [React app](https://reactjs.org/).

## License

MIT
