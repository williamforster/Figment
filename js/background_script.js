/* global browser */

var openTabs = [] // A list of open tabs by id
var dataSuburbs = ["Paddington", 'Ashgrove', 'Bardon', 'Rosalie']
var dataLocalServices = [] // Array of strings of local services a user might web search for

// main loop
function mainLoop() {
  console.log('start main loop')
  // do a new session (forage, reddit, local service/product)
  startLocalQuery()
  // decide how long to wait to start the next one
  // wait
  setTimeout(mainLoop, 100000000)
}

/**
 * Load a selection of query strings from a webserver
 */
function getQueries() {
  xmlhttp=new XMLHttpRequest()
  xmlhttp.open("POST", "http://127.0.0.1:3000", true)
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      dataLocalServices = xmlhttp.responseText.split('\n')
      console.log('split worked: ' + dataLocalServices[0])
    }
  }
  xmlhttp.send("services");
}

async function startLocalQuery() {
  console.log('started local query')
  // decide on a random thing to search for
  var queryString = randomFrom(dataLocalServices)
  if (Math.random() < 0.5) {
    if (Math.random() < 0.5) {
      queryString += ' ' + 'near'
    }
    queryString += ' ' + randomFrom(dataSuburbs)
  }

  // perform search and wait for content script to send links back
  browser.search.get().then((function (engines) {
    var closureQueryString = queryString
    return function (engines) {
      engines.forEach(function (engine) {
        if (engine['isDefault'] === true) {
          searchInNewTab(engine['name'], closureQueryString)
        }
      })
    }
  })())
}

/**
 * Do a web search with an engine. Also adds tab by id to the global 'openTabs'
 * @param {string} engineName The search engine to use
 * @param {string} queryString The search query
 */
function searchInNewTab(engineName, queryString) {
  // open a new tab
  var created = browser.tabs.create({})
  created.then((function () {
    var closureEngineName = engineName
    var closureQueryString = queryString
    return function (newtab) {
      var newTabId = newtab['id']
      openTabs.push(newtab)
      // wait a bit
      var waitTime = defaultRandom(WAIT_TAB_CREATED, MIN_DELAY)
      setTimeout(function () {
        // search in the new tab
        console.log('searching in tab ' + newTabId)
        browser.search.search({
          query: closureQueryString,
          engine: closureEngineName,
          tabId: newTabId
        })
        // allow some time for content script to load and send message
        var waitLoad = defaultRandom(WAIT_PAGE_LOAD, MIN_PAGE_LOAD_DELAY)
        setTimeout(function() {
          console.log('hello tabid: ' + newTabId)
          browser.tabs.sendMessage(newTabId, 
            { text: 'tab_type=local_service', engine: closureEngineName, tabid: newTabId })
        }, waitLoad)
      }, waitTime)
    }
  })())
}

function sendToTab(tabId, message) {
  browser.tabs.sendMessage(tabId, { text: message }
  ).then(function (result) {
    console.log('recvd msg: ' + result['response'])
  })
}

/**
 * Open tab for each url in urls. After finished, start viewing each one at a time.
 * @param {string} url the url to set the new tab to
 * @param {object} loadedMessage the message to send once tab is open at url
 */
function openTabsAtUrl(urls) {
  console.log('opening urls: ' + urls.length)
  if (urls.length === 0) { 
    viewOpenTabs()
    return
  }

  var created = browser.tabs.create({active: false})
  created.then((function () {
    var closureUrls = urls
    return function (newtab) {
      var newTabId = newtab['id']
      openTabs.push(newtab)
      // wait a bit
      var waitTime = defaultRandom(WAIT_TAB_CREATED, MIN_DELAY)
      setTimeout(() => {
        // change to url
        browser.tabs.update(newTabId, {url: closureUrls.shift(), active: false})
        .then((function() {
          openTabsAtUrl(closureUrls)
        })())
      }, waitTime)
    }
  })())
}

async function viewOpenTabs() {
  console.log('Viewing tabs')
}


/**
 * Received message from tab handler
 * @param {obj} message object with a 'text' field
 * @param {tab.tab} sender tab object that sent message
 * @param {func} response a function to call to send a response. takes 1 object param.
 */
function receivedMessage(message, sender, response) {
  if (message['text'] === 'start_figment') {
    mainLoop()
  } else if (message['text'] === 'tab_ready') {
    console.log('Tab ready, id:' + sender.id)
  } else if (message['text'] === 'open_tabs') {
    console.log('Open tabs - ' + message['urls'])
    openTabsAtUrl(message['urls'])
  }
}
browser.runtime.onMessage.addListener(receivedMessage)

getQueries()