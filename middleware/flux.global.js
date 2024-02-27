/**
 * @file:    \middleware\auth.global.js
 * @desc:    ...
 * -------------------------------------------
 * Created Date: 17th March 2023
 * Modified: Thu Mar 23 2023
 **/

// import { useState, useRuntimeConfig, useCookie } from '#app'

export default defineNuxtRouteMiddleware(async (to, from) => {
  return
  const nuxtApp = useNuxtApp()
  const userStore = useUserStore()
  const dataStore = useDataStore()
  const gameStore = useGameStore()
  const stateStore = useStateStore()
  const repositoryStore = useRepositoryStore()

  //+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Authenticate the user
  // Tries to determinate if the user has an account
  // either locally or online
  //+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  if (!nuxtApp.$db.isOpen() || !nuxtApp.$db.isReady) {
    console.warn('db is closed or not ready', nuxtApp.$db)
    return
  } else {
    console.warn('db is open', nuxtApp.$db)
    return
  }

  let current = false
  if (userStore?.isChecked === false) {
    await userStore.authenticate()
  }

  //+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Preload
  //+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  else {
    // move to a plugin to run once
    dataStore.init()
    stateStore.init()
    gameStore.init()
    repositoryStore.init()
  }

  return

  // Allow navigation when going to guest routes
  const guest = ['/login', '/register']
  if (guest.includes(to.path)) return

  // If still not logged in, redirect to login
  if (userStore?.isLogged === false) {
    let params = ''

    userStore.redirectTo = from.path
    if (current.status == 401) params = '?expired=1'

    return navigateTo('/login' + params)
  }

  console.warn('global middleware', to, from)

  // if (to.params.id === '1') {
  //   // return abortNavigation()
  // }
  // // return navigateTo('/')
  // console.warn(auth?.value)
})
