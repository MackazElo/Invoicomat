const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const excel = require('excel4node');
const bodyParser = require("body-parser")
 


const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use("/", express.static("public"));
app.use(fileUpload());

app.post("/extract-text", (req, res) => {
    if (!req.files && !req.files.pdfFile) {
        res.status(400);
        res.end();
    }

    pdfParse(req.files.pdfFile).then(result => {
        res.send(result.text);
    });
});

app.post("/excel", (req, res) => {
    
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
        console.log(String(eval(`req.body.r${i}_c1`)));
        var price = String(eval(`req.body.r${i}_c4`));
        var quantity = String(eval(`req.body.r${i}_c5`));
        price = price.replace('€ ', "");
        price = price * 6 ;
        console.log(last_serial)
        var serials = generate_serial(last_serial, quantity);
        console.log(last_serial)

        worksheet.cell(i+1,1).string(String(eval(`req.body.r${i}_c1`))).style(style);
        worksheet.cell(i+1,2).string(quantity).style(style);
        worksheet.cell(i+1,3).string(serials).style(style);
        worksheet.cell(i+1,4).string("").style(style);
        worksheet.cell(i+1,5).string("").style(style);
        worksheet.cell(i+1,6).number(price).style(style);
        worksheet.cell(i+1,7).string("0").style(style);
        worksheet.cell(i+1,8).string("0").style(style);
        worksheet.cell(i+1,9).string("0").style(style);
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

    
});

app.listen(5000);
console.log("Started at port 5000");
