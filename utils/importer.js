/*
 * @file:    \utils\importer.js
 * @desc:    ...
 * -------------------------------------------
 * Created Date: 22nd January 2024
 * Modified: Tue May 07 2024
 */

import axios from 'axios'
import steam from '~/modules/importers/steam'

let $nuxt = null
let $data = null
let $game = null
let $axios = null
let $journal = null

// Valid available and enabled sources
let sources = ['steam']

export default {
  //+-------------------------------------------------
  // detect()
  // - Detects platform and check if is valid
  // - Detect if the user is logged in
  // - Detects that the requested library module is present
  // +- available, and has the required methods
  // -----
  // Created on Mon Jan 22 2024
  //+-------------------------------------------------
  detect(x = {}) {
    log('💠 Importer(2): detect')
    if (!$nuxt) $nuxt = useNuxtApp()
    if (!$data) $data = useDataStore()
    if (!$game) $game = useGameStore()

    x.log(`💠🎨 source ID: ${x.source}`)
    let account = {}

    try {
      // Detect: Check if the source is valid
      //+---------------------------------------
      x.log('Detect 2.1: valid source')
      if (!sources.includes(x.source)) {
        x.log(`💠 Source ${x.source} not supported`)
        return false
      }

      // Detect: The platform module is available
      //+---------------------------------------
      x.log('Detect 2.2: valid module')
      if (steam == undefined) {
        x.log('💠 The Steam library module is not available', 'error')
        return false
      }

      // Detect: If the module is complete
      // And has all required methods to run
      //+---------------------------------------
      x.log('Detect 2.3: The module is complete')
      if (
        steam.update === undefined ||
        steam.getGames === undefined ||
        steam.hasUpdates === undefined ||
        steam.getUserdata === undefined
      ) {
        x.log('The module module complete, some methods are not present', 'error')
        return false
      }

      // Detect: Detect if the user is logged in
      //+---------------------------------------
      x.log('Detect 2.4: valid user')
      if (
        $nuxt.$auth.bearer &&
        $nuxt.$auth.user[x.source] &&
        $nuxt.$auth.user[x.source + '_data']
      ) {
        account = {
          ...$nuxt.$auth.user,
          bearer: $nuxt.$auth.bearer,
          provider: $nuxt.$auth.user.steam_data,
        }
      } else {
        account = { error: 'account:login' }

        x.log(
          'User needs to login with provider - code: [account:login]',
          'error',
          'account:login'
        )
      }

      x.log('✅ Detected')
    } catch (e) {
      console.error('💠🔴 detect() found an error', e)
      return false
    }

    return {
      module: steam,
      account: account,
    }
  },

  //+-------------------------------------------------
  // connect()
  // - creates a new axios instance
  // - connects to the module giving data
  // -----
  // Created on Mon Jan 22 2024
  // Updated on Tue Mar 26 2024
  //+-------------------------------------------------
  connect(x = {}) {
    log('💠 Importer(3): connect')

    try {
      // Connect: Create a new axios instance
      //+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      x.log('Connect 3.1: Create a new axios instance')
      $axios = axios.create({
        timeout: 60000,
      })

      // Connect: Give methods and data to the module
      //+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      x.log('Connect 3.2: Connect with the module')
      x.module.connect(x.account, $axios, x.log)

      x.log('✅ Connected and ready to start')
    } catch (e) {
      console.error(e)
      return false
    }

    return true
  },

  //+-------------------------------------------------
  // scan()
  // Calls the module methods to retrieve user data
  // -----
  // Created on Tue Jan 23 2024
  // Updated on Tue Apr 16 2024 - Added error handling
  //+-------------------------------------------------
  async scan(x = {}) {
    x.log('💠 Importer(4): Starting data scan...')

    let data = {
      user: {},
      games: [],
      library: [],

      // TODO: things that will be imported
      // states: [],
      // collections: [],
      // data.backlog will be defined as well from steam.onScan
      steambacklog: {}, // quick dirty hack
    }

    try {
      x.log('Check 4.1: Get local library')
      data.library = await $nuxt.$db.games.where('steam_id').above(0).toArray()
      x.log(`🆗 Library loaded`)

      x.log('Check 4.2: Get userdata')
      data.user = await steam.getUserdata()
      x.log(`🆗 Account userdata loaded`)

      x.log('Check 4.3: Get library')
      data.games = await steam.getGames()
      x.log(`🆗 Games loaded`)

      if (steam.onScan !== undefined) {
        x.log('Check 4.4: onScan hook')
        data.steambacklog = await steam.onScan(data, x)
        x.log(`🆗 onScan hook executed`)
      }

      // this.data.wishlist = await steam.getWishlist()
      // x.log(`🎁 Wishlist received`)
    } catch (e) {
      x.log('Error getting user data', 'error', e)
      console.error('💠🔴 scan() found an error', e)
      return false
    }

    x.log('Check 4.5: scan post validation')
    if (data.games.length === 0) {
      x.code = 'library:empty'
      x.status = 'error'
      return false
    }

    return data
  },

  //+-------------------------------------------------
  // prepare()
  // - appsToImport,
  // - appsToUpdate
  // -----
  // Created on Tue Jan 23 2024
  //+-------------------------------------------------
  async prepare(x = {}) {
    x.log('💠 Importer(5): Preparing data ...')

    let apps = {
      libIDs: [],
      toReview: [],
      toImport: [],
      toUpdate: [],
    }

    x.log('Check 5.1: Preparing Array of library IDs')
    apps.libIDs = x.data.library.reduce((acc, el) => {
      acc[el.steam_id] = el
      return acc
    }, {})

    //+-------------------------------------------------
    // Categorize apps within the the library
    // And create groups: review and update
    // ---
    // Review apps are apps that are not in the library
    // Update apps are apps that are in the library and need updating
    //+-------------------------------------------------
    x.data.games.forEach((app) => {
      if (app.appid in apps.libIDs) {
        let add = false
        const lib = apps.libIDs[app.appid]

        app.toUpdate = {
          uuid: lib.uuid,
        }

        // // Update: is.owned
        // //+---------------------------------------
        // if (!lib.is?.owned) {
        //   add = true
        //   app.toUpdate.owned = true
        // }

        // Update: playtime
        //+---------------------------------------
        let newPlaytime = steam.hasUpdates('playtime', lib, app)
        if (newPlaytime !== false) {
          add = true
          app.toUpdate.playtime = newPlaytime
        }

        // Update: last_played
        //+---------------------------------------
        let lastPlayed = steam.hasUpdates('last_played', lib, app)
        if (lastPlayed !== false) {
          add = true
          app.toUpdate.last_played = lastPlayed
        }

        if (add) apps.toUpdate.push(app)
      } else {
        app.will_import = true
        app.will_ignore = false

        apps.toReview.push(app)
      }
    })

    x.log('Check 5.2: Preparing an Array ready to import')
    apps.toImport = apps.toReview.map((item) => {
      return {
        data: item,
        ['steam' + '_id']: item.appid,
      }
    })

    return apps
  },

  //+-------------------------------------------------
  // store()
  //
  // -----
  // Created on Wed Jan 24 2024
  //+-------------------------------------------------
  async store(x = {}) {
    x.log('💠 Importer(6): Storing data ...')
    if (!$data) $data = useDataStore()

    let uuids = []
    const items = []

    x.log('Check 6.1: Processing the array of new apps')
    x.apps.toImport.forEach((item) => {
      let app = $game.create(item)
      app = steam.update(app, item.data)

      items.push(app)
      uuids.push(app.uuid)
    })

    x.log('Check 6.2: Processing the array of updated apps')
    console.warn('Apps to update', x.apps)
    console.warn(uuids, items)

    x.apps.toUpdate.forEach((el) => {
      let $db = $data.get(el.toUpdate.uuid)
      let app = steam.update($db, { ...el })

      items.push(app)
      uuids.push(app.uuid)
    })

    x.log('Check 6.2: Storing apps')
    $data.process(items, 'import')

    x.log('✅ Data stored')
    x.log('Updating missing data')
    await $data.updateMissing()

    return {
      uuids: uuids,
    }
  },

  //+-------------------------------------------------
  // wrap()
  //
  // -----
  // Created on Wed Jan 24 2024
  //+-------------------------------------------------
  wrap(x = {}) {
    x.log('💠 Importer(7): Wrapping up ...')
    if (!$nuxt) $nuxt = useNuxtApp()
    if (!$data) $data = useDataStore()
    if (!$journal) $journal = useJournalStore()

    x.log('7.1: Writing journal')
    let keys = x.apps.stored || []
    $journal.add({
      event: 'added',
      data: {
        store: x.source,
        games: keys,
      },
    })

    x.log('7.2: Updating user data')
    $nuxt.$auth.local.steam_updated_at = dates.now()
    $nuxt.$auth.updateAccount('steam_updated_at')
  },
}
