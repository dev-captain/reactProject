const express = require('express');
const path = require('path');

exports.start = () =>
    new Promise((resolve, reject) => {
        const server = express();
        server.use(
            '/',
            express.static(path.join(__dirname, '../examples/simple/dist'))
        );

        server.on('error', err => {
            if (!server.listening) {