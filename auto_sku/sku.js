const express = require("express");

var database = require('./database');

const bodyParser = require("body-parser");
const { stringify } = require("querystring");

const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use("/", express.static("public"));


app.post("/check", (req, res) => {
    var supplier =  String(req.body.supplier);
    var sku = String(req.body.sku);
    function auto_sku(supplier, sku){
        var found_sku = new Promise((resolve, reject)=>{
            var query = `SELECT sku FROM mobileparts WHERE supplier_code = "${supplier}"`;
            database.query(query, function(error, data){
                    resolve(data)
                });
            });
         found_sku.then((val)=>{
            if(val==""){
                var query = `INSERT INTO mobileparts (id, supplier_code, sku) VALUES ("", "${supplier}", "${sku}")`;
                database.query(query, function(error, data){
                    console.log("SKU DB updated")
                    console.log(sku)
                    return(sku)
                });
            } 
            else{
                var splited = stringify(val[0])
                splited = splited.split("=")
                console.log("SKU found")
                console.log(splited[1])
                return(splited[1])
                
            }
        })
    }
   console.log("a"+auto_sku(supplier, sku))
});

app.listen(5500);
console.log("Started at port 5500");
