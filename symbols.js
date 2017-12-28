"use strict";

const log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , sqlite3 = require('sqlite3').verbose()
    , dateFormat = require('dateformat')

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
let saveData = function (db, exchange, symbol, price, type) {
        db.run(`DELETE FROM symbols WHERE name= (?) AND type = (?)`, [symbol,type], function(err) {
          if (err) {
            return console.error(err.message);
          }
        });
      let insert = db.prepare("INSERT INTO symbols(date,exchange,name,price,type) VALUES(?,?,?,?,?)");  
          let d = new Date();  
          let date = dateFormat(d, "isoDateTime");
          // var date = d.toLocaleTimeString();  
          insert.run(date, exchange, symbol, price, type);  
      insert.finalize(); 
}
let getData = async () => {

    var db = new sqlite3.Database('database'); 
    db.serialize(function() {
        for (var symbolId = symbols.length - 1; symbolId >= 0; symbolId--) {  
            // symbols[symbolId]
            db.get("SELECT id, date, name, symbol, price FROM exchanges WHERE symbol= (?) ORDER BY price DESC ",[symbols[symbolId]],function(err,rowH){    
                  if (err) {
                    return console.error(err.message);
                  } 
              if (rowH) {
                log('High Price : '.green, rowH.name.blue, rowH.symbol, rowH.price)  
                saveData(db, rowH.name, rowH.symbol, rowH.price, true)
              }
            });
            db.get("SELECT id, date, name, symbol, price FROM exchanges WHERE symbol= (?) ORDER BY price ASC ",[symbols[symbolId]],function(err,rowL){    
                  if (err) {
                    return console.error(err.message);
                  }
              if (rowL) {
                log('Low Price : '.red, rowL.name.blue, rowL.symbol, rowL.price)
                saveData(db, rowL.name, rowL.symbol, rowL.price, false)
                log ('--------------------------------------------------------') 
              } 
            });
        }
    });
}

(async function main () { 


    await getData ()

    db.close(); 
    process.exit ()

}) ()

 