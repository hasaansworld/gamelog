//+-------------------------------------------------
// delay()
// Permits to wait for a given time in ms
// -----
// Created on Fri Jun 02 2023
// Updated on Sat Nov 04 2023
//+-------------------------------------------------
async function delay(ms, notify = false) {
  // console.log('delay', ms, notify)
  if (notify) console.warn('⏳ Waiting ' + ms + 'ms', notify)

  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms))
}

export default delay
