"use strict";

const log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , sqlite3 = require('sqlite3').verbose()
    , dateFormat = require('dateformat')
    , math = require('mathjs')

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

let saveData = function (db, symbol, exchange1, exchange2, price1, price2, marge) {
        db.run(`DELETE FROM marges WHERE symbol= (?)`, [symbol], function(err) {
          if (err) {
            return console.error(err.message);
          }
        });
      let insert = db.prepare("INSERT INTO marges(date, symbol, exchange1, exchange2, price1 , price2, marge) VALUES(?,?,?,?,?,?,?)");  
          let d = new Date();  
          let date = dateFormat(d, "isoDateTime");
          // var date = d.toLocaleTimeString();  
          insert.run(date, symbol, exchange1, exchange2, price1, price2, marge);  
      insert.finalize(); 
}

let getData = async () => {

    let db = new sqlite3.Database('./database');
    
    let sql = `SELECT price, type, name, exchange
               FROM symbols
               WHERE name  = (?) ORDER BY name`;
    for (var symbolId = symbols.length - 1; symbolId >= 0; symbolId--) {                 
        let symbol = symbols[symbolId]
        let priceH = 0
        let priceL = 0
      
      db.all(sql, [symbol], (err, rows) => {
        if (err) {
          return console.error(err.message);
        }

        log ('--------------------------------------------------------')    
        log(symbol, '|')
        log ('---------')    
        for (var i = rows.length - 1; i >= 0; i--) {
          if (rows[i]) {
            if (rows[i].type == 1) {
              var priceH = rows[i].price
              var exchange1 = rows[i].exchange
              log('High: '.green, priceH, )
            }
            if (rows[i].type == 0) {
              var priceL = rows[i].price
              var exchange2 = rows[i].exchange
              log('Low: '.red, priceL)
            }
          }
        }
        var marge = math.eval((priceH-priceL) / priceL)
        log('Marge |')
        log ('------')  
        log(marge, '%')
        if (exchange1 && priceH) {
          if (exchange2 && priceL) {
            saveData(db, symbol, exchange1, exchange2, priceH, priceL, marge)
          }
        }
      });
    }
}

(async function main () { 


    await getData ()
    db.close(); 
    process.exit ()

}) ()

 