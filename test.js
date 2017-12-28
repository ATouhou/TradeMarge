var sqlite3 = require('sqlite3').verbose();  
var db = new sqlite3.Database('database');  
var dateFormat = require('dateformat');

db.serialize(function() {  
  // db.run("CREATE TABLE exchanges (id INT, name TEXT, symbol TEXT, price FLOAT, date DATETIME)");  
  // db.run("CREATE TABLE symbols (id INT, name TEXT, exchange TEXT, price FLOAT)");  
  // db.run("CREATE TABLE marges (id INT, symbol TEXT, exchange1 TEXT, exchange2 TEXT, price1 FLOAT, price2 FLOAT)");  
  
  var stmt = db.prepare("INSERT INTO exchanges VALUES (?,?,?,?,?)");  
  for (var i = 0; i < 10; i++) {  
      var date = new Date();  
      var date = dateFormat(date, "isoDateTime");
      // var date = d.toLocaleTimeString();  
      stmt.run(i, 'Kraken', 'BTC/EUR', '1002.4', date);  
  }  

  stmt.finalize();  
  
  db.each("SELECT id, name, symbol, price, date FROM exchanges", function(err, row) {  
      console.log(row.id, row.name, row.symbol, row.price, row.date);  
  });  

});  
  
db.close();  