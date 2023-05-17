const express = require("express");

var database = require('./database');

const bodyParser = require("body-parser");
const { stringify } = require("querystring");

const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use("/", express.static("public"));



async function get_sku(supplier, sku) {
    function fetch_sku(supplier) {
        return new Promise((resolve, reject) => {
          var query = `SELECT sku FROM mobileparts WHERE supplier_code = "${supplier}"`;
                  database.query(query, function(error, data){
                          resolve(data)
                      });
        });
      }
      function update_sku(data) {
          return new Promise((resolve, reject) => {
              var query = `INSERT INTO mobileparts (id, supplier_code, sku) VALUES ("", "${supplier}", "${sku}")`;
                      database.query(query, function(error, data){
                          console.log("SKU DB updated")
                          console.log(sku)
                          resolve(sku)
                      })
                  })
      }
      
      function select_sku(val) {
          return new Promise((resolve, reject) => {
                  var splited = stringify(val[0])
                  splited = splited.split("=")
                  console.log("SKU found")
                  console.log(splited[1])
                  resolve(splited[1])
                      })
      }
  try {
    var data = await fetch_sku(supplier);
    if(data==""){
        data = await update_sku(supplier, sku); 
    }
    else{
        data = await select_sku(data); 
    }
    return(data)
  } catch (error) {
    console.error('Error:', error);
  }
}

async function mainn(){
var supplier = "AP110001B2L"
var sku = "a"
var b = await get_sku(supplier, sku)
console.log("a "+b);
}
mainn()