const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const excel = require('excel4node');
const bodyParser = require("body-parser")

const { stringify } = require("querystring")
var database = require('./database');

 


const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use("/", express.static("public"));
app.use(fileUpload());

app.post("/extract-text", (req, res) => {
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
                        
                            resolve(sku)
                        })
                    })
        }
        
        function select_sku(val) {
            return new Promise((resolve, reject) => {
                    var splited = stringify(val[0])
                    splited = splited.split("=")
                    console.log("SKU found")
                  
                    resolve(splited[1])
                        })
        }
    try {
        var data = await fetch_sku(supplier);
        if(data==""&&sku!=""){
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
    async function pdf_main(){
    if (!req.files && !req.files.pdfFile) {
        res.status(400);
        res.end();
    }
    var pdf_as_text = await pdfParse(req.files.pdfFile)
    var formated_result = ""

    
          
                var input_text = pdf_as_text.text
                 input_text = input_text.split(/\r?\n/);
                 console.log(input_text)
                // document.getElementById("shop_input").value = result[8]
                // Find a <table> element with id="myTable":
                // var table = document.getElementById("invoice_table");

                // Create an empty <tr> element and add it to the 1st position of the table:
               
                current_row = ""
                current_cell = ""
                row_number = 0
                cell_number = 0
                // document.getElementById("supplier").value = result[17]
                // document.getElementById("invoice_number").value = result[32]
                // order_number = result[55].split(" ")
                // document.getElementById("order_number").value = order_number[1]
                var table = `<form method="post" action="/excel" ><table id="invoice_table"><tr hidden>`
                await input_text.forEach(newrow)
                table +=`</td></tr></table></form>`
                console.log(table)
                res.send(table);

                    function newrow(item, index){
                        
                      if(check_word(item, "AP")==true || check_word(item, "iPad")==true || check_word(item, "PM")==true ){
                            table += `</tr><tr>`  
                            row_number++
                            cell_number = 0
                            table += `<td>` 
                            cell_number++
                            var corretct_sku = get_sku(item, "")
                            
                            table += `<div class="autocomplete" ><input  id='${row_number}_${cell_number}' name='r${row_number}_c${cell_number}a' type="text" value='${corretct_sku}' placeholder="SKU" onclick="autocomplete(document.getElementById('${row_number}_${cell_number}'), sku_code);"></div><br>`;       
                            table += `<div class="autocomplete" ><input  id='${row_number}_${cell_number}b' name='r${row_number}_c${cell_number}' type="text" placeholder="Part Name" onclick="autocomplete(document.getElementById('${row_number}_${cell_number}b'), part_name);"></div>`;       
                       
                            // autocomplete(document.getElementById(`${row_number}_${cell_number}`), sku_code);
                            // autocomplete(document.getElementById(`${row_number}_${cell_number}b`), part_name);
                            table += `</td><td>` 
                            cell_number++
                            table+= `<input type='text' name='r${row_number}_c${cell_number}' value='${item}' hidden>${item}`;
                            table += `</td><td>` 
                            cell_number++   
                        }
                        
                        else if(check_word(item, " ")==true|| check_word(item, "Order")==true || check_word(item, "Incoterm")==true || check_word(item, "HS Code:")==true){
                          //NIE WYPISUJ
                        }
                        else if (check_word(item, "€")==true || item>0 && cell_number>3 && row_number!=0) {
                            table += `</td><td>` 
                            cell_number++
                            table += `<input type='text' name='r${row_number}_c${cell_number}' value='${item}' hidden>${item}`;
                        }
                        else if (row_number!=0){
                            table += `<input type='text' name='r${row_number}_c${cell_number}' value='${item}' hidden>${item}`;
                        }
                        
                        // alert(i)
                        // alert(row.innerHTML)
                      
                    
                // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
               
               

                // Add some text to the new cells:
               
                    }
             
            }
            function check_word (input, goal){
                var corect = 0
                var input_word= ""
                if (input.length<goal.length){
                    return false
                }
                else{
                    for(i=0; i<goal.length; i++){
                        input_word+=input.charAt(i)
                    }
                }
                
                if(input_word==goal){
                        return true
                    }
                    else{
                        return false
                    }
            
            }
            
        

      
    
    
    pdf_main()
});

app.post("/excel", (req, res) => {
    async function mainn(){

        
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
                            
                                resolve(sku)
                            })
                        })
            }
            
            function select_sku(val) {
                return new Promise((resolve, reject) => {
                        var splited = stringify(val[0])
                        splited = splited.split("=")
                        console.log("SKU found")
                      
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
        var last_serial =  String(req.body.last_serial);

    var max_rows = String(req.body.max_rows);

    var excel = require('excel4node');
    // Create a new instance of a Workbook class
    var workbook = new excel.Workbook();

    // Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('service_operation');

    // Create a reusable style
    var style = workbook.createStyle({
    numberFormat: '##0.00;'
    });

    // Set value of cell A1 to 100 as a number type styled with paramaters of style
    worksheet.cell(1,1).string("Name").style(style);
    worksheet.cell(1,2).string("Quantity").style(style);
    worksheet.cell(1,3).string("Serial numbers").style(style);
    worksheet.cell(1,4).string("Supplier warranty (value)").style(style);
    worksheet.cell(1,5).string("Supplier warranty (period)").style(style);
    worksheet.cell(1,6).string("Purchase price").style(style);
    worksheet.cell(1,7).string("Zero").style(style);
    worksheet.cell(1,8).string("Repair").style(style);
    worksheet.cell(1,9).string("Store").style(style);

    

     for(i=1; i<=max_rows; i++){
        var name = String(eval(`req.body.r${i}_c1`));
        var sku = String(eval(`req.body.r${i}_c1a`));
        var supplier = String(eval(`req.body.r${i}_c2`));
        var price = String(eval(`req.body.r${i}_c4`));
        var quantity = String(eval(`req.body.r${i}_c5`));
        price = price.replace('€ ', "");
        price = price * 6 ;
        console.log(last_serial)
        var serials = generate_serial(last_serial, quantity);
        console.log(last_serial)

        var corretct_sku = await (get_sku(supplier, sku))

        worksheet.cell(i+1,1).string(name).style(style);
        worksheet.cell(i+1,2).string(quantity).style(style);
        worksheet.cell(i+1,3).string(serials).style(style);
        worksheet.cell(i+1,4).string("").style(style);
        worksheet.cell(i+1,5).string("").style(style);
        worksheet.cell(i+1,6).number(price).style(style);
        worksheet.cell(i+1,7).string("0").style(style);
        worksheet.cell(i+1,8).string("0").style(style);
        worksheet.cell(i+1,9).string("0").style(style);
        worksheet.cell(i+1,10).string(corretct_sku).style(style);
    }

    
    workbook.write('Excel2.xls')
   setTimeout(() => {  make_file(); }, 5000);
    function make_file(){
    const file = `${__dirname}/Excel2.xls`;
    console.log(file)
    res.download(file); // Set disposition and send it.
    }

    
    function generate_serial(first_serial, amount){
        function next_serial(prevoius_serial){
            current_serial = parseInt(prevoius_serial)
            current_serial++
            formated_serial=current_serial.toString()
            while(formated_serial.length<8){
                formated_serial="0"+formated_serial
            }
            return formated_serial
        }
        
        let formated_serial = first_serial
        // First serial number in result is same as input first_serial (it has to be free)
        let serial_result = `${formated_serial}`
        for(j=1; j<amount; j++){   
            serial_result+=`, ${next_serial(formated_serial)}`
        }
        // next free serial number for further call of this fuction  
        last_serial = next_serial(formated_serial)
        return serial_result

    }
    }
    mainn()
});

app.listen(5000);
console.log("Started at port 5000");
