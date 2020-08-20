const electron = require('electron')
const { app, BrowserWindow, protocol, net } = electron;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const express = require('express');
const bodyParser = require('body-parser');
const ghostCursor = require("ghost-cursor");
var page, captchaWindow;

//main web page
const mainpage = 'https://footlocker.com';
//different pages to switch up info
const page_list = ['https://www.footlocker.com/product/model/starter-sweatshirt-womens/318828.html','https://www.footlocker.com/product/model/starter-sweatshirt-womens/318828.html','https://www.footlocker.com/product/model/nike-satin-hook-t-shirt-mens/323947.html','https://www.footlocker.com/product/model/reebok-vector-crew-mens/318979.html','https://www.footlocker.com/product/model/converse-all-star-ox-boys-grade-school/191450.htm','https://www.footlocker.com/product/model/converse-all-star-ox-womens/149982.html','https://www.footlocker.com/product/model/nike-air-force-1-low-boys-grade-school/100214.html','https://www.footlocker.com/product/nike-air-fear-of-god-moc-mens/M8086200.html', 'https://footlocker.com', 'https://www.footlocker.com/product/nike-lebron-17-low-mens/D5007101.html'];
//search queries to type in search box for ftl
const string_list = ['fear of god', 'air max', 'air force 1', 'sweater', 'vans', 'jordan 1', 'jordan 3', 'jordan 4', 'jordan 11'];

puppeteer.launch({ headless: true, args: ['--window-size=1366,768'] }).then(async browser => {
  page = await browser.newPage();
  page.setViewport({width: 1366, height:728})
  await page.goto(mainpage);
  await page.evaluate(()=>{
    window.innerHeight = 657;
    window.innerWidth = 1366;
  });
  const cursor = ghostCursor.createCursor(page)
  setInterval(async function(){
    try{
        try{await cursor.move('main[id=main]')}catch(e){};
        if(Math.random()>.9){
                await page.evaluate(()=>{ $x('//*[@id="app"]/div/header/nav[2]/div[3]/button[1]/span')[0].click()});
                await page.type('#input_search_query', string_list[parseInt(Math.random()*9)], {delay: 0});
                await page.evaluate(()=>{$x('//*[@id="HeaderSearch"]/div[3]/button')[0].click()});
                await new Promise(r => setTimeout(r, 1500));
        }
        if(Math.random() > 0.85){
            await cursor.click();
        }
    }catch(e){};
    }, 500)
})

async function sensor(abckcookie){
    const cookie = {
          name: '_abck',
          value: abckcookie,
          domain: '.footlocker.com',
          url: 'https://www.footlocker.com/',
          path: '/',
          httpOnly: false,
          secure: true
        }
    await page.setCookie(cookie);
    try{
        var sensor_val = await page.evaluate(() => {
            bmak.cma(MouseEvent, 1);
            bmak.cdma(DeviceMotionEvent);
            bmak.bpd();
            return bmak.sensor_data;
        }, link)
    }catch(e){
        await page.goto('https://footlocker.com');
        var sensor_val = await page.evaluate(() => {
        bmak.cma(MouseEvent, 1);
        bmak.cdma(DeviceMotionEvent);
        bmak.bpd();
        return bmak.sensor_data;
    })
    };

    return sensor_val
}

function initBankServer() {
	bankExpressApp = express();

	let port = '7000';
	let address = '127.0.0.1';

	console.log('Bank server listening on port: ' + port);
	bankExpressApp.set('port', port);
	bankExpressApp.set('address', address);
	bankExpressApp.use(bodyParser.json());
	bankExpressApp.use(bodyParser.urlencoded({ extended: true }));

	bankExpressApp.get('/sensor', async function(req, res) {
	    console.log('recieved');
	    var forminf = req.query;
	    var return_data = await sensor(forminf.abck);
        res.send(return_data);
        res.end();
    });

    bankExpressApp.get('/alternatepage', async function(req, res){
       var new_link = page_list[parseInt(Math.random()*11)];
       while (typeof(new_link) === "undefined"){
           new_link = page_list[parseInt(Math.random()*11)];
       }
       console.log(new_link);
       await page.goto(new_link);
       res.send('reloaded');
       res.end();
    });

	bankServer = bankExpressApp.listen(bankExpressApp.get('port'), bankExpressApp.get('address'));
	}

initBankServer();