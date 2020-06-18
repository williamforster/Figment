// User won't do any typical 'mouse' actions faster than this
const MIN_DELAY = 300
const MIN_PAGE_LOAD_DELAY = 2000
// For waits with a mean of 5 for example, the std deviation is calculated as (5 - MIN_DELAY) / this
// So effectively the minimum delay is *this* many deviations away from the mean
const DEFAULT_NUM_STDDEVS = 4
// On starting a browse session, a new tab opens. Time before searching/navigation
const WAIT_TAB_CREATED = 1200
const WAIT_PAGE_LOAD = 4500
const WAIT_SELECT_LINK = 990

/**
 * Return a random element from a given array
 * @param {array} array 
 */
function randomFrom(array) {
  var index = Math.floor(Math.random() * array.length)
  return array[index]
}

/**
 * Get a random number with a normal distribution
 */
function randomNormal (mean, stddev) {
  return mean + boxMuller() * stddev
}

/**
 * Get a random number with a normal distribution and a std deviation calculated the
 * default way - using DEFAULT_NUM_STDDEVS.
 * stddev = (mean - minDelay) / DEFAULT_NUM_STDDEVS
 */
function defaultRandom (mean, minDelay) {
  var stddev = (mean - minDelay) / DEFAULT_NUM_STDDEVS
  return randomNormal(mean, stddev)
}

/**
 * Get a random number from 0-1 with a normal distribution
 */
function boxMuller () {
  const u1 = Math.random()
  const u2 = Math.random()

  var z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0
}
