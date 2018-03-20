const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const getQuestions = require('./questions');
const request = require('./request');
const jq = require('node-jq')
const Store = require('./store');

const rp = require('request-promise-native');

async function resLoop(req, res, meta) {
    while(true) {
        const { next } = await inquirer.prompt([
            {
                name: 'next',
                type: 'list',
                choices: ['body', 'headers', 'new request', 'display current request', 'meta', 'exit'],
                message: 'response:',
                default: 'body',
            }
        ]);
        switch(next) {
            case 'headers':
                await jq.run('.', res.headers, { input: 'json', output: 'pretty' }).then(console.log);
                continue;
                break;
            case 'body':
                await jq.run('.', res.body, { input: 'json', output: 'pretty' }).then(console.log);
                continue;
                break;
            case 'exit':
                console.log('Good Bye!');
                process.exit();
            case 'display current request':
                await jq.run('.', req, { input: 'json', output: 'pretty' }).then(console.log);
                continue;
            case 'meta':
                await jq.run('.', meta, { input: 'json', output: 'pretty' }).then(console.log);
                continue;
            default: 
        }
        break;
    }
}

async function performRequest(requestOptions) {
    return await rp({
        ...requestOptions,
        resolveWithFullResponse :true
    });
}

async function headersLoop() {
    const headers = {};
    while(true) {
        const { header, exit } = await inquirer.prompt([{
            name: 'header',
            type: 'input',
            message: 'header("key:value"):',
            default: ''
        },{
            name: 'exit',
            type: 'confirm',
            message: 'exit headers section',
            default: false
        }]);

        const headerTokens = header.split(':');
        const headerKey = headerTokens[0];
        const headerValue = headerTokens[1];

        headers[headerKey] = headerValue;

        if (exit) {
            break;
        }
    }

    return headers;
}

(async function() {
    const store = new Store();
    
    while(true) {
        const meta = {};
        const { name } = await inquirer.prompt([
            {
                name: 'name',
                type: 'autocomplete',
                message: 'name:',
                source: function(answersSoFar, input) {
                    const match = store.search(input) || [];
                    return Promise.resolve(match.map(m => m._key_));
                },
                suggestOnly: true
            }
        ]);
        const storedRequest = await store.get(name);

        let requestOptions;

        if (!storedRequest) {
            const questions = getQuestions(store);
            const requestOptions = await inquirer.prompt(questions);
            if (requestOptions.setHeaders) {
                const headers = await headersLoop();
                requestOptions.headers = headers;
            }
            delete requestOptions.setHeaders;
            const startedAt = new Date().getTime();
            const res = await performRequest(requestOptions);
            endedAt = new Date().getTime();

            meta.responseTime = endedAt - startedAt;

            await store.save(requestOptions);
            await resLoop(requestOptions, res, meta);
        } else {
            const res = await performRequest(requestOptions);
            await store.save(requestOptions);
            await resLoop(requestOptions, res);
        }
    }
}());