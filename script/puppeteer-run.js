const puppeteer = require("puppeteer")
const script = require("fs").readFileSync(0, "utf-8")

puppeteer.launch().then(browser =>
  browser.newPage().then(page => {
    page.on("console", async msg => {
      const argsWithRichErrors = await Promise.all(
        msg
          .args()
          .map(arg =>
            arg
              .executionContext()
              .evaluate(arg => (arg instanceof Error ? arg.message : arg), arg),
          ),
      )
      console.log(...argsWithRichErrors)

      // This is a horrendous hack. Tests starting with "ok" or "fail" will
      // cause an early exit.
      if (/^# ok/.test(msg.text())) {
        browser.close()
      } else if (/^# fail/.test(msg.text())) {
        browser.close().then(() => process.exit(1))
      }
    })

    page.on("pageerror", err => console.error("pageerror:", err))
    page.on("error", err => console.error("error:", err))

    page.evaluate(script)
  }),
)
