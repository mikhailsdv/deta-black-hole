const path = require('path')
require("dotenv").config({path: path.resolve(__dirname, "../.env"), override: false})

module.exports = process.env
