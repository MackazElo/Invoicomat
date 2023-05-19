const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const excel = require('excel4node');
const bodyParser = require("body-parser")

const { stringify } = require("querystring")
var database = require('./database');
const { contains } = require("jquery");
const { SlowBuffer } = require("buffer");

 


const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use("/", express.static("public"));
app.use(fileUpload());

app.post("/extract-text", (req, res) => {
   
    async function get_name(sku) {
        sku = String(sku)
        sku = sku.replace(/%2F/g, "/");
        function fetch_name(sku) {
            return new Promise((resolve, reject) => {
            var query = `SELECT Name FROM sku_list WHERE SKU = "${sku}"`;
                    database.query(query, function(error, data){
                            var splited = stringify(data[0])
                            splited = splited.split("=")
                            // console.log(splited[1])
                            var result = String(splited[1])
                            result = result.replace(/%20/g, " ");
                            result = result.replace(/%2F/g, "/");
                            
                            // console.log(result)
                            resolve(splited[1])
                            
                        });
            });
        }
    try {
        var data = await fetch_name(sku);
       
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
                //  console.log(input_text)
                // document.getElementById("shop_input").value = result[8]
                // Find a <table> element with id="myTable":
                // var table = document.getElementById("invoice_table");

                // Create an empty <tr> element and add it to the 1st position of the table:
               
                current_row = ""
                current_cell = ""
                row_number = 0
                cell_number = 0
                prevoius_cell = 0
                // document.getElementById("supplier").value = result[17]
                // document.getElementById("invoice_number").value = result[32]
                // order_number = result[55].split(" ")
                // document.getElementById("order_number").value = order_number[1]
                let content = []
                let subcontent = []
                // var table = `<form method="post" action="/excel" ><table id="invoice_table"><tr hidden>`
                await input_text.forEach(newrow)
                content.push(subcontent)
                // table +=`</td></tr></table></form>`
                // console.log(table)
                // res.send(table);
                    async function newrow(item, index){
                        
                      if(check_word(item, "AP")==true || check_word(item, "iPad")==true || check_word(item, "PM")==true ){
                            content.push(subcontent)
                            subcontent = ["", "", "", "", "", "", "", ""]
                            row_number++
                            
                            subcontent[0]=item
                            
                            subcontent[1]="sku"
                            
                            subcontent[2]="Name"
                            cell_number=3

                            
                        }
                        
                        else if(check_word(item, " ")==true|| check_word(item, "Order")==true || check_word(item, "Incoterm")==true || check_word(item, "HS Code:")==true){
                          //NIE WYPISUJ
                        }
                        else if (check_word(item, "€")==true && cell_number<5) {
                            cell_number++
                            subcontent[5]=item
                        }
                        else if (item>0 && cell_number==4) {
                            cell_number++
                            subcontent[4]=item
                        }
                        else if (cell_number == 3){
                            subcontent[3]+=item
                        }
                        else{
                            // console.log(item)
                                cell_number++  
                        }
                        }                                   
                cell_number == 4
                
              
                   
                    for(i=1; i<row_number; i++){
                        
                        corretct_sku= await get_sku(content[i][0], "")
                        correct_name = await get_name(corretct_sku)
                        
                        correct_name = String(correct_name)
                        correct_name = correct_name.replace(/%20/g, " ");
                        correct_name = correct_name.replace(/%2F/g, "/");
                        
                        corretct_sku = String(corretct_sku)
                        corretct_sku = corretct_sku.replace(/%20/g, " ");
                        corretct_sku = corretct_sku.replace(/%2F/g, "/");


                        content[i][1] = corretct_sku
                        content[i][2] = correct_name
                        
                    }
                    // console.log(content)
                    async function create_table(){
                            var table = `<form method="post" id="invoice_form" action="/excel" ><table id="invoice_table">`
                            
                            table +=`<tr><th>SKU/Name</th><th>Supplier Code</th><th>Description</th><th>Price</th><th>Quantity</th></tr>`
                            for(i=1;i<row_number; i++){
                                if(content[i][1]==content[i][2]){
                                    // console.log("empty")
                                    content[i][1]=""
                                    content[i][2]=""
                                }
                                table +=`<tr><td><div class="autocomplete" ><input  id='${i}_0' name='r${i}_c0a' type="text"  value='${content[i][1]}'  placeholder="SKU"></div><br>`       
                                table +=`<div class="autocomplete" ><input  id='${i}_0b' name='r${i}_c0b' type="text"  value='${content[i][2]}'  placeholder="Part Name"></div></td>`
                                table +=`<td><input type='text' name='r${i}_c1' value='${content[i][0]}' hidden>${content[i][0]}</td>`
                                table +=`<td><input type='text' name='r${i}_c2' value='${content[i][3]}' hidden>${content[i][3]}</td>`
                                table +=`<td><input type='text' name='r${i}_c3' value='${content[i][4]}' hidden>${content[i][5]}</td>`
                                table +=`<td><input type='text' name='r${i}_c4' value='${content[i][5]}' hidden>${content[i][4]}</td></tr>`
                                
                            }
                            table += ` <input type="text" id="supplier" name="supplier" placeholder="supplier">
                            <input type="text" id="invoice_number" name="invoice_number" placeholder="invoice_number">
                            <input type="text" id="order_number" name="order_number" placeholder="order_number">
                            <input type="text" name="last_serial" placeholder="last_serial">
                            <input type='number' name='max_rows' id='max_rows' hidden>
                                <input type="submit" id="submit_form" hidden>
                                </table></form>`
                            // console.log(table)
                            // console.log(stringify(table))
                            return table
                           
                    }
                    var html_to_send = await create_table()
                    // console.log(html_to_send)
                    res.send(html_to_send);
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

        
        
    var last_serial =  String(req.body.last_serial);

            
    var max_rows =  String(req.body.max_rows);

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

    async function prepare_content(){
        for(i=1; i<max_rows; i++){
        
            var sku = String(eval(`req.body.r${i}_c0a`));
            var name = String(eval(`req.body.r${i}_c0b`));
            var code = String(eval(`req.body.r${i}_c1`));
            var quantity = String(eval(`req.body.r${i}_c3`));
            var price = String(eval(`req.body.r${i}_c4`));
            console.log(quantity)
            console.log(price)
            price = price.replace('€ ', "");
            price = price * 6 ;
            // console.log(last_serial)
            var serials = generate_serial(last_serial, quantity);
            // console.log(last_serial)
            await get_sku(code, sku)
    
            worksheet.cell(i+1,1).string(name).style(style);
            worksheet.cell(i+1,2).string(quantity).style(style);
            worksheet.cell(i+1,3).string(serials).style(style);
            worksheet.cell(i+1,4).string("").style(style);
            worksheet.cell(i+1,5).string("").style(style);
            worksheet.cell(i+1,6).number(price).style(style);
            worksheet.cell(i+1,7).string("0").style(style);
            worksheet.cell(i+1,8).string("0").style(style);
            worksheet.cell(i+1,9).string("0").style(style);
            worksheet.cell(i+1,9).string("0").style(style);
        }
    
    }

     await prepare_content()
    workbook.write('Excel2.xls')
   setTimeout(() => {  make_file(); }, 5000);
    function make_file(){
    const file = `${__dirname}/Excel2.xls`;
    // console.log(file)
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
                        // console.log("SKU DB updated")
                    
                        resolve(sku)
                    })
                })
    }
    
    function select_sku(val) {
        return new Promise((resolve, reject) => {
                var splited = stringify(val[0])
                splited = splited.split("=")
                // console.log("SKU found")
              
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
app.listen(5000);
console.log("Started at port 5000");

