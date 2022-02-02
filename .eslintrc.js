module.exports = {
    "extends": "airbnb-base",

    "env": {
        "node": true,
        "jest": true,
    },
    rules: {
        'max-len': ["error", { "code": 150 }],
        'linebreak-style': ["error", "unix"]
    }
};
