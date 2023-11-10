/**
 * @project: backlog.rip
 * @file:    \modules\importers\steam-public.js
 * @desc:    Utility helper to make requests to and return a list of games
 * -------------------------------------------
 * Created Date: 27th November 2022
 * Last Modified: Mon Mar 13 2023
 **/

let $log = null
let $axios = null
let $account = null

export default {
  manifest: {
    version: '0.1',
    store: 'Steam',
    name: 'Steam public profiles',
    author: 'Gaspar S.',

    description:
      'A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.',
    icon: 'https://steamstore-a.akamaihd.net/public/images/v6/logo.png',

    // steps: [
    //   {
    //     name: 'Get your public profile',
    //     description: '--',
    //   },
    //   {
    //     name: 'Load your library',
    //     description: '--',
    //   },
    //   {
    //     name: 'Import your games',
    //     description: '--',
    //   },
    // ],

    does: ['Your Steam library'],
    doesnot: [],

    requeriments: [
      {
        name: 'User has a public profile',
        description: 'Check if the user has a public profile',
      },
    ],
  },

  //+-------------------------------------------------
  // connect()
  // Registers the importer script with the vue instance
  // This allows the script to access the vue methods
  // Methods available are setStep, log, onError...
  // -----
  // Created on Tue Nov 29 2022
  //+-------------------------------------------------
  connect(account, axios, log) {
    $log = log
    $axios = axios
    $account = account

    $axios.defaults.headers.common['Authorization'] = 'Bearer ' + account.bearer

    $log('🆗 Connection established')

    return true
  },

  //+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Methods
  //+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  //+-------------------------------------------------
  // getUserdata()
  // Calls backend to retrieve user profile data
  // -----
  // Created on Thu Dec 08 2022
  // Updated on Mon Mar 13 2023
  //+-------------------------------------------------
  async getUserdata() {
    let jxr = await $axios.get(
      'https://api.backlog.rip/fetch/steam/userdata?steamid=' + $account.steam
    )

    if (jxr.data.status == 'success') {
      return jxr.data?.fetch?.data || {}
    }
  },

  async getGames() {
    let jxr = await $axios.get(
      'https://api.backlog.rip/fetch/steam/games?steamid=' + $account.steam
    )

    if (jxr.data.status == 'success') {
      // xDDDD
      return jxr.data?.fetch?.data?.games || {}
    }
  },

  getWishlist() {
    return 333
  },
}
