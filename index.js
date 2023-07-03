const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const excel = require('excel4node');
const bodyParser = require("body-parser")

const { stringify } = require("querystring")
var database = require('./database');
const { contains } = require("jquery");
const { SlowBuffer } = require("buffer");
const { Console } = require("console");
const workbook = require("excel4node/distribution/lib/workbook");

 


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
                var supplier = ""
                input_text.forEach(check_supplier)
                console.log(supplier)
                async function check_supplier(item, index){
                    if(supplier==""){
                        if(item=="Netherlands "){
                            supplier="mobileparts"
                        }
                        if(item=="SparePart.dk"){
                            supplier="sparepart"
                        }

                    }
                }


                await input_text.forEach(newrow)
                // console.log(input_text[135])
                // console.log(String(input_text))
                content.push(subcontent)
                // table +=`</td></tr></table></form>`
                // console.log(table)
                // res.send(table);
                    async function newrow(item, index){
                        if(supplier=="mobileparts"){
                            
                            if(check_word(item, "AP")==true || check_word(item, "iPad")==true || check_word(item, "PAD")==true || check_word(item, "IPAD")==true || check_word(item, "AW")==true){
                                    content.push(subcontent)
                                    // console.log(subcontent)
                                    subcontent = ["", "", "", "", "", "", "", ""]
                                    row_number++
                                    
                                    subcontent[0]=item
                                    
                                    subcontent[1]="sku"
                                    
                                    subcontent[2]="Name"
                                    cell_number=3
                                    // console.log(item)
                                    
                                }
                                
                            else if(check_word(item, " ")==true|| check_word(item, "Order")==true || check_word(item, "Incoterm")==true || check_word(item, "HS Code:")==true || check_word(item, "PM")==true  || check_word(item, "WH")==true ){
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
                        else if(supplier=="sparepart"){
                            i=0;
                            if (cell_number==0){
                                while(item[i]>0){
                                    i++
                                }
                                if(item[i]==" "){
                                    if(item[i+1]=="x"){
                                    var quantity = "" 
                                    for(j=0; j<i;j++){
                                        quantity= quantity+item[j]
                                    }   
                                    var row = ""
                                    row = item.split(" x")
                                        content.push(subcontent)
                                        subcontent = ["", "", "", "", "", "", "", ""]
                                        row_number++
                                        
                                        
                                        
                                        subcontent[1]="sku"
                                        
                                        subcontent[2]="Name"
                                        subcontent[4]=quantity
                                        subcontent[3]=row[1]
                                        cell_number=1
                                    }
                                }
                            }
                            else if(cell_number==1){
                                max = item.length
                                if(item[max-3]=="E"&&item[max-2]=="U"&&item[max-1]=="R"){
                                    euro_row = item.split("EUR")
                                    // console.log(euro_row)
                                    
                                    euro_cell = euro_row[0].split(" ")
                                    console.log(euro_cell)
                                    id_tail = euro_cell[1][0]+euro_cell[1][1]+euro_cell[1][2]+euro_cell[1][3]+euro_cell[1][4]
                                    euro_id = euro_cell[0]+" "+id_tail
                                    price = euro_cell[1].split(id_tail)
                                    subcontent[0]=euro_id
                                    subcontent[5]=price[1]
                                    cell_number=0
                                   
                                }
                                else{
                                    subcontent[3]+=item
                                }
                            }
                            console.log(subcontent)
                        }
                    }                     
                    cell_number == 4
                
              
                   
                    for(i=1; i<=row_number; i++){
                        
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
                            var table = `<form method="post" id="invoice_form" action="/excel" autocomplete="off"><table id="invoice_table">`
                            
                            table +=`<tr><th>SKU/Name</th><th>Supplier Code</th><th>Description</th><th>Quantity</th><th>Price</th></tr>`
                            for(i=1;i<=row_number; i++){
                                if(content[i][1]==content[i][2]){
                                    // console.log("empty")
                                    content[i][1]=""
                                    content[i][2]=""
                                }
                                table +=`<tr><td><div class="autocomplete" ><input  id='${i}_0a' name='r${i}_c0a' type="text"  value='${content[i][1]}' onblur="auto_name('${i}_0')"  placeholder="SKU"></div><br>`       
                                table +=`<div class="autocomplete" ><input  id='${i}_0b' name='r${i}_c0b' type="text"  value='${content[i][2]}'  placeholder="Part Name"></div></td>`
                                table +=`<td><input type='text' name='r${i}_c1' id='r${i}_c1' value='${content[i][0]}' hidden>${content[i][0]}</td>`
                                table +=`<td><input type='text' name='r${i}_c2' id='r${i}_c2' value='${content[i][3]}' hidden>${content[i][3]}</td>`
                                table +=`<td><input type='text' name='r${i}_c3' id='r${i}_c3' value='${content[i][4]}' ></td>`
                                table +=`<td><input type='text' name='r${i}_c4' id='r${i}_c4' value='${content[i][5]}' ></td></tr>`
                                
                            }
                            table += ` <input type="text" id="supplier" name="supplier" placeholder="supplier"hidden>
                            <input type="text" id="invoice_number" name="invoice_number" placeholder="invoice_number"hidden>
                            <input type="text" id="order_number" name="order_number" placeholder="order_number"hidden>
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



app.post("/down", (req, res) => {
    var file =  String(req.body.file_name);
    res.download(`${file}.xls`); // Set disposition and send it.
    
});


app.post("/excel", (req, res) => {
    
       
    

async function mainn(){
    var files = 0
    var html_to_send2 = "<style>body{font-family: arial;}</style><h2>Kliknij przyciski aby pobrać pliki</h2>"
    var last_serial =  String(req.body.last_serial);

            
    var max_rows =  String(req.body.max_rows);
    

    async function meake_new_file(){
        var excel = require('excel4node');
        // Create a new instance of a Workbook class
        var workbook = new excel.Workbook();
        return workbook
    }
    
    async function make_new_worksheet(workbook){
        var style = workbook.createStyle({
            numberFormat: '##0.00;'
            });
        // Add Worksheets to the workbook
        var worksheet = workbook.addWorksheet('service_operation');
        // Create a reusable style
      
        worksheet.cell(1,1).string("Name").style(style);
        worksheet.cell(1,2).string("Quantity").style(style);
        worksheet.cell(1,3).string("Serial numbers").style(style);
        worksheet.cell(1,4).string("Supplier warranty (value)").style(style);
        worksheet.cell(1,5).string("Supplier warranty (period)").style(style);
        worksheet.cell(1,6).string("Purchase price").style(style);
        worksheet.cell(1,7).string("Zero").style(style);
        worksheet.cell(1,8).string("Repair").style(style);
        worksheet.cell(1,9).string("Store").style(style);

        return worksheet
    }
        
   async function save_file(workbook, filename){
        workbook.write(`${filename}.xls`)
        const file = `${__dirname}/${filename}.xls`;
        // console.log(file)
    //    html_to_send2 += `<a href='./${filename}.xls'>${filename}</a><br>` // Set disposition and send it.
       html_to_send2 += `<form method="post" action='./down'>
       <input type='hidden' value='${filename}' name='file_name'>
       <button type="submit">${filename}</button>
    </form>` // Set disposition and send it.
     

   }

    // Set value of cell A1 to 100 as a number type styled with paramaters of style
   

    async function prepare_content(worksheet, workbook, f){
        var style = workbook.createStyle({
            numberFormat: '##0.00;'
            });
        for(i=1; i<max_rows; i++){
        
            var sku = String(eval(`req.body.r${i}_c0a`));
           
            sku = sku.replace(/%20/g, " ");
            sku = sku.replace(/%2F/g, "/");

            var name = String(eval(`req.body.r${i}_c0b`));
            var code = String(eval(`req.body.r${i}_c1`));
            var quantity = String(eval(`req.body.r${i}_c3`));
            var price = String(eval(`req.body.r${i}_c4`));
            // console.log(quantity)
            // console.log(price)
           
            quantity = quantity - (20*f)
            // console.log(last_serial)
            await get_sku(code, sku)
            q=0
           
            while (quantity>20){
                quantity=quantity-20
                q++
            }
            if(files < q){
                files=q
            }
            if(quantity>0){
                if (f>0){
                    quantity = 20
                }
                price = price.replace('€ ', "");
                price = price * 6 ;
                // console.log(last_serial)
                var serials = generate_serial(last_serial, quantity);
                quantity = String(quantity)   
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
    
    }
    f=0; 
    async function repeatable(){
        
    wb = await meake_new_file()
    ws = await make_new_worksheet(wb)
     await prepare_content(ws, wb, f)
     await save_file(wb, `Posting${f}`)
     f++
    //  console.log(files)    
    if(files>=f){
        repeatable()
    }
    else{
        
   
    }
    }
    await repeatable()    
    setTimeout(() => {   send_file(); }, 5000);
    function send_file(){
        res.send(html_to_send2)
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

app.post("/get_sku_list", (req, res)=>{
    
    sku_list = []
    async function start_fetch(){ 
    async function fetch_sku() {
        return new Promise((resolve, reject) => {
            var query = `SELECT SKU FROM sku_list`;
                    database.query(query, function(error, data){
                            data.forEach(next_field)
    
                            async function next_field(item, index){
                                var splited = stringify(item)
                                splited = splited.split("=")
                                // console.log(splited[1])
                                var result = String(splited[1])
                                result = result.replace(/%20/g, " ");
                                result = result.replace(/%2F/g, "/");
                                // console.log(result)
                                // console.log(result)
                                sku_list.push(result)
                       
                            
                            // console.log(result)
                            resolve(result)
                            }   
                        });
            });
        }

    var sku = await fetch_sku()
    res.send(sku_list);

}
start_fetch()

});
app.post("/get_name_list", (req, res)=>{
    
    name_list = []
    async function start_fetch(){ 
    async function fetch_name() {
        return new Promise((resolve, reject) => {
        var query = `SELECT Name FROM sku_list`;
                database.query(query, function(error, data){
                        data.forEach(next_field)

                        async function next_field(item, index){
                            var splited = stringify(item)
                            splited = splited.split("=")
                            // console.log(splited[1])
                            var result = String(splited[1])
                            result = result.replace(/%20/g, " ");
                            result = result.replace(/%2F/g, "/");
                            // console.log(result)
                            // console.log(result)
                            name_list.push(result)
                   
                        
                        // console.log(result)
                        resolve(result)
                        }   
                    });
        });
    }
    var name = await fetch_name()
    res.send(name_list);

}
start_fetch()

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
var port = 5500
app.listen(port);
console.log("Started at port "+port);

