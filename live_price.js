"use strict";

const asTable   = require ('as-table')
    , log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , ccxt      = require ('ccxt')

const exchanges = [
    'bitfinex',
    'bittrex',
    'poloniex',
    'binance',
    'bitstamp',
    'gemini',
    'bit-x',
    // 'itbit',
    'kraken'
]
const symbols = [
    // Pair BTC
    'BTC/EUR',
    'BTC/USD',
    // Pair ETH
    'ETH/EUR',
    'ETH/USD',
    'ETH/BTC',
    // Pair LTC
    'LTC/EUR',
    'LTC/USD',
    'LTC/BTC',
    // Pair Ripple
    'XPR/EUR',
    'XPR/USD',
    'XPR/BTC',
]
let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'exchange'.green)
    printSupportedExchanges ()
}

let printTickers = async (id) => {

    // check if the exchange is supported by ccxt
    let exchangeFound = ccxt.exchanges.indexOf (id) > -1
    if (exchangeFound) {

        log ('Instantiating', id.green, 'exchange')

        while (true) {
            for (var exchangeId = exchanges.length - 1; exchangeId >= 0; exchangeId--) {
                // instantiate the exchange by id
                let exchange = new ccxt[exchanges[exchangeId]] ({ enableRateLimit: true })


                // load all markets from the exchange
                let markets = await exchange.loadMarkets ()

                const tickers = await exchange.fetchTickers ()
                
                // log(tickers)
                log ('--------------------------------------------------------')
                // log (exchange.id.green, exchange.iso8601 (exchange.milliseconds ()))
                // log ('Fetched', Object.values (tickers).length.toString ().green, 'tickers:')
                // log (asTable.configure ({ delimiter: ' | '.dim, right: true }) (
                //     ccxt.sortBy (Object.values (tickers), 'quoteVolume', true)
                //                        .slice (0,20)
                //                        .map (ticker => ({
                //                             symbol: ticker['symbol'],
                //                             price: ticker['last'].toFixed (8),
                //                             datetime: ticker['datetime'],
                //                        }))
                //     ))
                for (var symbolId = symbols.length - 1; symbolId >= 0; symbolId--) {
                    if (tickers[symbols[symbolId]]) {
                        log(symbols[symbolId], tickers[symbols[symbolId]]['last'])
                    }
                }
            }
        }

    } else {

        log ('Exchange ' + id.red + ' not found')
        printSupportedExchanges ()
    }
}

(async function main () {

    if (process.argv.length > 2) {

        const id = process.argv[2]
        await printTickers (id)

    } else {

        printUsage ()
    }

    process.exit ()

}) ()