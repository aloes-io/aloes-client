/* Copyright 2019 Edouard Maleix, read LICENSE */

/* eslint-disable no-console */
const express = require('express');
const localtunnel = require('localtunnel');
const dotenv = require('dotenv');
const path = require('path');
const webRoot = path.join(__dirname, 'dist');
const app = express();

const server = {};
let tunnel;

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

server.stop = () => {
  //  app.set('url', app.get('originUrl'));
  return tunnel.close();
};

server.init = conf => {
  try {
    app.get('/', (req, res) => {
      res.sendFile(path.join(webRoot, 'index.html'));
    });

    app.use('/', express.static(webRoot));

    app.listen(conf.PORT);

    console.log('Server', 'http:listening', conf.PORT);

    if (conf.TUNNEL_URL) {
      const options = { host: conf.TUNNEL_URL, subdomain: `${conf.NODE_NAME}-${conf.NODE_ENV}` };
      if (tunnel && tunnel.url) {
        return tunnel;
        //  app.tunnel.close();
      }

      // localtunnel(conf.port, options, (err, res) => {
      //   if (err) throw err;
      //   app.tunnel = res;
      //   logger.publish(2, 'tunnel', 'open', app.tunnel);
      //   app.set('url', app.tunnel.url);
      //   return tunnel;
      // });

      localtunnel(conf.PORT, options, (err, res) => {
        if (err) throw err;
        tunnel = res;
        console.log('server', 'tunnel:open', res.url);
        // if (res.url) {
        //   if (res.url.search(options.subdomain) === -1) {
        //     //  console.log('tunnel', 'wrong url', res.url);
        //     return tunnel.close();
        //   }
        // }
        return tunnel;
      });

      // localtunnel events
      //  app.tunnel.on('error', async err => {
      //  console.log('nodered', 'tunnel:err', err);
      ///  return app.tunnel.close();
      //  });

      tunnel.on('close', () => {
        console.log('server', 'tunnel:close', app.tunnel.url);
        // setTimeout restart tunnel
      });
    }
  } catch (error) {
    console.log('server', 'init:err', error);
  }
};

server.init(result.parsed);

module.exports = server;
