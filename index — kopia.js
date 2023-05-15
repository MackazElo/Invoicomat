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
    var shop = String(req.body.shop);


    var excel = require('excel4node');
    // Create a new instance of a Workbook class
    var workbook = new excel.Workbook();

    // Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('Sheet 1');
    var worksheet2 = workbook.addWorksheet('Sheet 2');

    // Create a reusable style
    var style = workbook.createStyle({
    numberFormat: '$#,##0.00; ($#,##0.00); -'
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


    workbook.write('Excel.xls')

    // res.send("Shop - " + shop +"<br><a href='./Excel.xls' download>Pobierz</a> ");

 
        const file = `${__dirname}/Excel.xls`;
        res.download(file); // Set disposition and send it.
});

app.listen(5000);

