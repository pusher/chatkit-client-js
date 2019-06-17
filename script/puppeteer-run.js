const puppeteer = require("puppeteer")
const script = require("fs").readFileSync(0, "utf-8")

puppeteer.launch().then(browser =>
  browser.newPage().then(page => {
    page.on("console", msg => {
      console[msg.type()](msg.text())
      // This is a horrendous hack. Tests starting with "ok" or "fail" will
      // cause an early exit.
      if (/^# ok/.test(msg.text())) {
        browser.close()
      } else if (/^# fail/.test(msg.text())) {
        browser.close().then(() => process.exit(1))
      }
    })
    page.evaluate(script)
  }),
)
