const cypress = require('cypress');
const server = require('./server');

return server.start().then(listeningServer => {
    // kick off a cypress run
    return cypress
        .run({
            browser: process.env.BROWSER || 'chrome',
            config: {
                baseUrl: 'http://localhost:8080',
                video: false,
            },
        })
        .then(results => {
            }
        })
        .catch(() => {
            process.exit(1);
        });
});
