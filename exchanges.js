"use strict";

const log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , ccxt      = require ('ccxt')
    , sqlite3 = require('sqlite3').verbose()
    , dateFormat = require('dateformat')


const exchanges = [
    'bitfinex',
    'bittrex',
    'poloniex',
    'binance',
    // 'bitstamp',
    // 'gemini',
    // 'bit-x',
    // 'itbit',
    'kraken',
]
const symbols = [
    // Pair BTC
    'BTC/EUR',
    'BTC/USD',
    'BTC/USDT',
    // Pair ETH
    'ETH/EUR',
    'ETH/USD',
    'ETH/USDT',
    'ETH/BTC',
    // Pair LTC
    'LTC/EUR',
    'LTC/USD',
    'LTC/USDT',
    'LTC/BTC',
    // Pair Ripple
    'XPR/EUR',
    'XPR/USD',
    'XPR/USDT',
    'XPR/BTC',
    // Pair XMR
    'XMR/EUR',
    'XMR/USD',
    'XMR/USDT',
    'XMR/BTC',
]
var db = new sqlite3.Database('database');  

let database_config = function () {

    db.serialize(function() {  
      db.run("CREATE TABLE IF NOT EXISTS exchanges (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, name TEXT, symbol TEXT, price FLOAT)");
      db.run("CREATE TABLE IF NOT EXISTS symbols (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, name TEXT, exchange TEXT, price FLOAT, type BOOLEAN)");
      db.run("CREATE TABLE IF NOT EXISTS marges (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, symbol TEXT, exchange1 TEXT, exchange2 TEXT, price1 FLOAT, price2 FLOAT, marge FLOAT)");
    }); 
}
let printTickers = async () => {
 
    const tickers = {}
    await Promise.all (exchanges.map (exchangeId =>
        new Promise (async (resolve, reject) => {
            const exchange = new ccxt[exchangeId] ({ enableRateLimit: true })
            // load all markets from the exchange
            let markets = await exchange.loadMarkets ()

            const tickers = await exchange.fetchTickers ()

            db.run(`DELETE FROM exchanges WHERE name=?`, exchangeId, function(err) {
              if (err) {
                return console.error(err.message);
              }
            });

            log ('--------------------------------------------------------')    
            log(exchangeId.blue)
            log ('--------------------------------------------------------')
            for (var symbolId = symbols.length - 1; symbolId >= 0; symbolId--) {
                if (tickers[symbols[symbolId]]) {
                    
                    log(symbols[symbolId].yellow, tickers[symbols[symbolId]]['last'])

                    db.serialize(function() {
                      let insert = db.prepare("INSERT INTO exchanges(date,name,symbol,price) VALUES(?,?,?,?)");  
                          let d = new Date();  
                          let date = dateFormat(d, "isoDateTime");
                          // var date = d.toLocaleTimeString();  
                          insert.run(date, exchangeId, symbols[symbolId], tickers[symbols[symbolId]]['last']);  
                      insert.finalize(); 
                      db.each("SELECT  id, date, name, symbol, price FROM exchanges WHERE name=(?) AND symbol=(?)",[exchangeId, symbols[symbolId]], function(err, row) {      
                          console.log(row.id, row.date, row.name, row.symbol, row.price);    
                      });
                    });

                }
            }
        })
    ))
}

(async function main () { 

    await database_config()
    await printTickers ()

    db.close(); 
    process.exit ()

}) ()

 