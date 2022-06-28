/* global browser, $ */

var myId = null

$(document).ready(function () {
  browser.runtime.sendMessage({ text: 'tab_ready' })
    .then(function (response) {
      console.log('recvd response from bg')
    })
})

/**
 * Received message from tab handler
 * @param {obj} message object with a 'text' field
 * @param {tab.tab} sender the bg script
 * @param {func} response a function to call to send a response. takes 1 object param.
 */
function receivedMessage(message) {
  console.log("tab recvd message. " + message['text'])
  switch (message['text']) {
    case 'tab_type=local_service':
      myId = message['tabid']
      openSearchLinks(message['engine'])
      break
    case 'tab_type=query_result':
      myId = message['tabid']
      console.log('recvd message I am a query result, id:' + message['tabid'])
  }
}
browser.runtime.onMessage.addListener(receivedMessage)

/**
 * Open a selection of the searched links in new tabs. At least one,
 * prefer links at the top.
 * @param {string} engine the search engine used in lower case
 */
function openSearchLinks(engine) {
  console.log('Opening links on engine ' + engine)
  var links
  switch (engine.toLowerCase()) {
    case "bing":
      links = $('h2 a')
      break
    case "google":
      links = $('div.g a')
      break
    default:
      links = []
  }
  
  var numLinks = links.length
  if (numLinks == 0) {
    console.error("figment: No links to open on search page.")
    return
  }
  var indicesToOpen = getResultsToOpen(numLinks)
  var urlsToOpen = []
  links.each(function(index) {
    if (indicesToOpen.includes(index)) {
      var url = $(this).attr('href')
      urlsToOpen.push(url)
    }
  })
  browser.runtime.sendMessage({text: 'open_tabs', urls: urlsToOpen})
}

/**
 * Return an array of integers representing the indices of search results to
 * open. Will always contain at least one index.
 * @param {int} numLinks the total number of search results on the page
 */
function getResultsToOpen(numLinks) {
  var ret = []
  for (var i = 0; i < numLinks; i++) {
    if (shouldOpenSearchResult(i, numLinks)) {ret.push(i)}
  }
  if (ret.length === 0) {ret.push(0)}
  return ret
}

/**
 * Decide whether to open a search result on a page (eg google search results)
 * @param {int} distToTop Index of the link where 0 is the first search result
 * @param {int} totalLinks Total links on the page
 * @return {boolean} whether to open the query result
 */
function shouldOpenSearchResult(distToTop, totalLinks) {
  var probability = 0.7 * Math.exp(((-totalLinks / 2) * distToTop)/ totalLinks)
  return Math.random() < probability
}
