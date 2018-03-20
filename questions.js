const validator = require('validator');

const methods = ['get', 'post', 'put', 'patch', 'delete']

const getQuestions = store => {
    return [
        {
            name: 'method',
            type: 'list',
            choices: ['get', 'post', 'put', 'patch', 'delete'],
            message: 'method:',
            default: 'get',
            validate(value = '') {
              return !validator.isEmpty(value) || 'Please enter a valid method';
            }
        },
        {
            name: 'url',
            type: 'input',
            message: 'url:',
            default: 'http://www.google.com',
            validate(value = '') {
                return !validator.isEmpty(value) || 'Please enter a valid url';
            }
        },
        {
            name: 'setHeaders',
            type: 'confirm',
            message: 'set headers:',
            default: false
        }
    ];
} 

module.exports = getQuestions;