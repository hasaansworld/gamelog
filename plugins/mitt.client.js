/*
 * @file:    \plugins\mitt.js
 * @desc:    ...
 * -------------------------------------------
 * Created Date: 13th March 2023
 * Modified: Sat May 04 2024
 */

//+-------------------------------------------------
// Codex: List of events
// ⚡ search:palette
//
// ⚡ game:modal
// ⚡ game:manager
//
// ⚡ state:change
//
// ⚡ confirm:show
//
// ⚡ app.render
//
// ⚡ data:ready
// ⚡ data:updated
//
//+-------------------------------------------------

import mitt from 'mitt'

export default defineNuxtPlugin(() => {
  const emitter = mitt()
  window.$mitt = emitter

  emitter.on('*', (e, payload) => {
    log('🔔 ' + e, payload)
    // console.info(emitter.all)
  })

  return {
    provide: {
      mitt: emitter,
    },
  }
})
