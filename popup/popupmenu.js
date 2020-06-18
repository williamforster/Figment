/* global browser */

/**
 * Listen for clicks on the button, start a background script going in its loop
 */
document.getElementById('button-start').addEventListener('click', (e) => {
  console.log('sending msg')
  browser.runtime.sendMessage({ text: 'start_figment' })
})

/**
 * Open a new tab and search
 */
function performSearch () {
  browser.search.get().then(function (engines) {
    engines.forEach(function (engine) {
      if (engine['isDefault'] === true) {
        console.log('Using default')
        browser.search.search({ query: 'foxes', engine: engine['name'] })
      }
    })
  })
}

function clickLink (link) {
  var cancelled = false

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, true, window,
      0, 0, 0, 0, 0,
      false, false, false, false,
      0, null)
    cancelled = !link.dispatchEvent(event)
  } else if (link.fireEvent) {
    cancelled = !link.fireEvent('onclick')
  }

  if (!cancelled) {
    window.location = link.href
  }
}
