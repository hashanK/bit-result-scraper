const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cheerio = require('cheerio');
const express = require('express');


var app = express();
const port = process.env.PORT || 3000

const width = 640;
const height = 480;

app.post('/results', express.urlencoded({ extended: false }), function (req, res) {
    //app.get('/results', function (req, res) {


    //* setup headless chrome
    const driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless().windowSize({ width, height })).build();
    const url = 'https://www.bit.lk/index.php/results/';

    var indexNum = req.body.index;
    var password = req.body.password;

    driver.get(url);
    driver.findElement(By.id('no')).sendKeys(indexNum); // 1704559
    driver.findElement(By.id('pw')).sendKeys(password); // 950661330V

    var submitButton = driver.findElement(By.className('btn btn-primary'));

    submitButton.click().then(function () {
        setTimeout(async function () {

            const pagesource = await driver.getPageSource();
            const $ = cheerio.load(pagesource);
            const tableCount = $('.table , .table-bordered').length;
            const tablesJsonArray = [];


            for (let i = 0; i < tableCount; i++) {

                const subjectsObjectArray = [];

                const tableData = $('.table , .table-bordered').eq(i); // HTML table (Academic Year 1/2/3)

                if(tableData != null){
                    
                    const subjectCount = tableData.children('tbody').children('tr').length;

                    for (let j = 0; j < subjectCount; j++) {
    
                        const subjectData = tableData.children('tbody').children('tr').eq(j); // table row (subject)
    
                        if (subjectData != null) {
                            const subjectName = subjectData.children('td').eq(0).text();
                            const year = subjectData.children('td').eq(1).text();
                            const credits = subjectData.children('td').eq(2).text();
                            const sOrder = subjectData.children('td').eq(3).text();
                            const result = subjectData.children('td').eq(4).text();
                            const onlineAssignmentResult = subjectData.children('td').eq(5).text();
    
                            const subjectDataObj = {
                                subject_name: subjectName.trim(),
                                year: year,
                                credits: credits,
                                s_order: sOrder,
                                result: result,
                                online_assignment_result: onlineAssignmentResult.trim(),
                            };
    
                            subjectsObjectArray.push(subjectDataObj);
                        }
    
                    }
                }

                const resultObj = {
                    table: i.toString(),
                    data: subjectsObjectArray
                };

                tablesJsonArray.push(resultObj);

            }

            if (tablesJsonArray.length > 0) {
                const data = {
                    data: tablesJsonArray
                }
                res.json(data);
            }

            //* Quit browser session
            driver.quit();


        }, 3500);


    });


})

// test post request
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.listen(port, () => {
    console.info("Server started listening.");
});







