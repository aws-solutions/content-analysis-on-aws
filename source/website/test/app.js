const puppeteer = require('puppeteer');
const { promisify } = require('util')

let url = process.env.WEBAPP_URL;
let temp_password = process.env.TEMP_PASSWORD;
let invitation_email_recipient = process.env.INVITATION_EMAIL_RECIPIENT;

(async () => {
    console.log("Loading " + url)
    // Chromium doesn't support video playback, so use Chrome instead
    // uncomment this when testing on a laptop:
    // const browser = await  puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true})
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: ['--no-sandbox']
    })
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 926});
    await page.goto(url, {waitUntil: 'networkidle0'});
    // Type in the username
    await page.type('input', invitation_email_recipient)
    // Type in the password
    await page.type('#app > div > div > div > div.Section__sectionBody___3DCrX > div:nth-child(2) > input', temp_password)

    console.log("Page title: " + await page.title())
    console.log("Authenticating")
    // click Login button
    await Promise.all([
        page.click("button"),
        page.waitForTimeout(2000)
    ]);

    // Are we on the password reset page?
    passwordHeaderSelector = "#app > div > div > div > div.Section__sectionHeader___13iO4"
    try {
        if (await page.$(passwordHeaderSelector) !== null) {
            console.log("found password reset form")
            // enter new password
            await page.type('#app > div > div > div > div.Section__sectionBody___3DCrX > div > input', temp_password)
            console.log("submitting new password")
            // click Submit button
            await Promise.all([
                page.click("button"),
                page.waitForTimeout(2000)
            ]);
        } else {
            console.log('Temporary password has already been reset.')
        }
    } catch (e) {
        console.log('Temporary password has already been reset.')
    }

    await page.waitForTimeout(5000)


    // Validate that the catalog table is not empty
    tableEmptyMessageSelector = "tbody > tr > td > div > div"
    try {
        if (await page.$(tableEmptyMessageSelector) !== null) {
            const text = await page.$eval(tableEmptyMessageSelector, el => el.textContent);
            if (text === 'There are no records to show') {
                throw new Error("There are no records to show.")
            }
        }
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // Validate that the workflow status for the first asset in the
    // table says, "Complete"
    console.log("Validating that the first asset's workflow is Complete")
    const assetWorkflowStatusSelector = "td.tableWordWrap:nth-child(3) > a:nth-child(1)"
    try {
        await page.waitForSelector(assetWorkflowStatusSelector, {polling: 1000, timeout: 10000})
    } catch (e) {
        console.log('Missing expected asset workflow status.\n' + e)
    }
    try {
        const text = await page.$eval(assetWorkflowStatusSelector, el => el.textContent);
        if (text !== 'Complete') {
            console.log("Asset workflow status: " + text)
            throw new Error("Asset workflow status is not Complete")
        }
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE OBJECTS TAB
    console.log("Loading objects tab")
    try {
        await page.click('tbody > tr:nth-child(1) > td:nth-child(6) > a');
        // validate that the video loads
        let video_selector = '#videoPlayer > div.vjs-control-bar > div.vjs-remaining-time.vjs-time-control.vjs-control > span.vjs-remaining-time-display'
        await page.waitForSelector(video_selector, {polling: 1000, timeout: 5000})
        // Validate that rounded buttons are present
        let rounded_buttons_xpath = '//div/div[2]/div/div[1]/div[2]/div/div/div[2]/div/button'
        if (await page.waitForXPath(rounded_buttons_xpath) === null) {
            throw new Error("Missing results")
        }
        // Validate the number of rounded buttons matches the results summary statement
        let rounded_button_count = await page.$x(rounded_buttons_xpath);
        results_summary_selector = '#app > div > div.container-fluid > div > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(3) > div > p:nth-child(1)'
        let results_summary = await page.$eval(results_summary_selector, el => el.innerText);
        let validated = (results_summary.match(/\d+/g)[1] == rounded_button_count.length)
        console.log("Results summary: " + results_summary)
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE CELEBRITY TAB
    let tab_selector='#__BVID__28___BV_tab_button__'
    console.log("Loading celebrity tab")
    try {
        await page.click(tab_selector);
        // Validate that rounded buttons are present
        rounded_buttons_xpath = '//div/div[2]/div/div[1]/div[2]/div/div/div[2]/div/button'
        if (await page.waitForXPath(rounded_buttons_xpath) === null) {
            throw new Error("Missing results")
        }
        // Validate the number of rounded buttons matches the results summary statement
        rounded_button_count = await page.$x(rounded_buttons_xpath);
        results_summary_selector = '#app > div > div.container-fluid > div > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(3) > div > p:nth-child(2)'
        results_summary = await page.$eval(results_summary_selector, el => el.innerText);
        let validated = (results_summary.match(/\d+/g)[1] == rounded_button_count.length)
        console.log("Results summary: " + results_summary)
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE FACES TAB
    tab_selector='#__BVID__32___BV_tab_button__'
    console.log("Loading faces tab")
    try {
        await page.click(tab_selector);
        // Validate that rounded buttons are present
        rounded_buttons_xpath = '//div/div[2]/div/div[1]/div[2]/div/div/div[2]/div/button'
        if (await page.waitForXPath(rounded_buttons_xpath) === null) {
            throw new Error("Missing results")
        }
        // Validate the number of rounded buttons matches the results summary statement
        rounded_button_count = await page.$x(rounded_buttons_xpath);
        results_summary_selector = '#app > div > div.container-fluid > div > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(3) > div > p:nth-child(2)'
        results_summary = await page.$eval(results_summary_selector, el => el.innerText);
        let validated = (results_summary.match(/\d+/g)[1] == rounded_button_count.length)
        console.log("Results summary: " + results_summary)
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE WORDS TAB
    tab_selector='#__BVID__34___BV_tab_button__'
    console.log("Loading words tab")
    try {
        await page.click(tab_selector);
        // Validate that rounded buttons are present
        rounded_buttons_xpath = '//div/div[2]/div/div[1]/div[2]/div/div/div[2]/div/button'
        if (await page.waitForXPath(rounded_buttons_xpath) === null) {
            throw new Error("Missing results")
        }
        // Validate the number of rounded buttons matches the results summary statement
        rounded_button_count = await page.$x(rounded_buttons_xpath);
        results_summary_selector = '#app > div > div.container-fluid > div > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(3) > div > p:nth-child(1)'
        results_summary = await page.$eval(results_summary_selector, el => el.innerText);
        let validated = (results_summary.match(/\d+/g)[1] == rounded_button_count.length)
        console.log("Results summary: " + results_summary)
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE CUES TAB
    console.log("Loading cues tab")
    tab_selector='#__BVID__36___BV_tab_button__'
    try {
        await page.click(tab_selector);
        // Validate that the data table has more than one row
        data_table_xpath = '/html/body/div/div/div[2]/div/div[1]/div[2]/div/div/div/table/tbody/tr'
        if (await page.waitForXPath(data_table_xpath) === null) {
            throw new Error("Missing results")
        }
        data_table = await page.$x(data_table_xpath);
        let validated = (data_table.length > 0)
        console.log("Data table length: " + data_table.length)
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE SHOTS TAB
    console.log("Loading shots tab")
    tab_selector='#__BVID__38___BV_tab_button__'
    try {
        await page.click(tab_selector);
        // Validate that the data table has more than one row
        data_table_xpath = '/html/body/div/div/div[2]/div/div[1]/div[2]/div/div/div/table/tbody/tr'
        if (await page.waitForXPath(data_table_xpath) === null) {
            throw new Error("Missing results")
        }
        data_table = await page.$x(data_table_xpath);
        let validated = (data_table.length > 0)
        console.log("Data table length: " + data_table.length)
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE TRANSCRIPT TAB
    console.log("Loading transcript tab")
    tab_selector='#__BVID__40___BV_tab_button__'
    try {
        await page.click(tab_selector);
        await page.waitForTimeout(2000)
        let selector = '#app > div > div.container-fluid > div > div:nth-child(1) > div:nth-child(2) > div > div'
        await page.waitForSelector(selector)
        let text_value = await page.$eval(selector, el => el.textContent)
        num_words = text_value.split( " ").length
        let validated = ( num_words > 10)
        console.log("Results summary: (" + num_words + " words)")
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE TRANSLATION TAB
    console.log("Loading translation tab")
    tab_selector='#__BVID__45___BV_tab_button__'
    try {
        await page.click(tab_selector);
        await page.waitForTimeout(2000)
        let selector = '#app > div > div.container-fluid > div > div:nth-child(1) > div:nth-child(2) > div > div'
        await page.waitForSelector(selector)
        let text_value = await page.$eval(selector, el => el.textContent)
        num_words = text_value.split( " ").length
        let validated = ( num_words > 10)
        console.log("Results summary: (" + num_words + " words)")
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE KEY PHRASES TAB
    console.log("Loading key phrases tab")
    tab_selector='#__BVID__47___BV_tab_button__'
    try {
        await page.click(tab_selector);
        // Validate that the data table has more than one row
        data_table_xpath = '/html/body/div/div/div[2]/div/div[1]/div[2]/div/div[2]/div/table/tbody/tr'
        if (await page.waitForXPath(data_table_xpath) === null) {
            throw new Error("Missing results")
        }
        data_table = await page.$x(data_table_xpath);
        let validated = (data_table.length > 0)
        console.log("Results summary: (" + data_table.length + " table records)")
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    // VALIDATE ENTITIES TAB
    console.log("Loading entities tab")
    tab_selector='#__BVID__49___BV_tab_button__'
    try {
        await page.click(tab_selector);
        // Validate that the data table has more than one row
        data_table_xpath = '/html/body/div/div/div[2]/div/div[1]/div[2]/div/div[2]/div/table/tbody/tr'
        if (await page.waitForXPath(data_table_xpath) === null) {
            throw new Error("Missing results")
        }
        data_table = await page.$x(data_table_xpath);
        let validated = (data_table.length > 0)
        console.log("Results summary: (" + data_table.length + " table records)")
        if (!validated) throw new Error("Missing results")
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }

    await browser.close();
    console.log("Done")
})();

