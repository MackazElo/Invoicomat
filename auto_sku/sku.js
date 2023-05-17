const express = require("express");

var database = require('./database');

const bodyParser = require("body-parser");
const { stringify } = require("querystring");
const { AuthSwitchRequestPacket } = require("mysql/lib/protocol/packets");

const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use("/", express.static("public"));


app.post("/check", (req, res) => {
    var supplier =  String(req.body.supplier);
    var sku = String(req.body.sku);

    async function auto_sku(supplier, sku){
        var query = `SELECT sku FROM mobileparts WHERE supplier_code = "${supplier}"`;
        var b = "b"
        var a = await database.query(query, function(error, data){
            b = data
        });
        return b

    });
    }
        
            var query = `SELECT sku FROM mobileparts WHERE supplier_code = "${supplier}"`;
            database.query(query, function(error, data){
                    resolve(data)
                });
            });

        
    
    async function sku_log(){
        let response = await auto_sku(supplier, sku)
         console.log("R "+response)
    }
    sku_log()
    console.log("after")
});

app.listen(5500);
console.log("Started at port 5500");