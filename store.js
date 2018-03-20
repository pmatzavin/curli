const TrieSearch = require('trie-search');

module.exports = class Store{
    constructor() {
        this.stash = {}
        this.trieSearch = new TrieSearch();
    }

    async save(req) {
        this.stash[req.name] = req;
        delete this.trieSearch;
        this.trieSearch = new TrieSearch();
        this.trieSearch.addFromObject(this.stash);
    }

    async get(name) {
        this.stash[name];
    }

    search(pattern = '') {
        return pattern ? this.trieSearch.get(pattern) : '';
    }
};