<template>
  <div class="page-body">
    <div class="container-xl">
      <div class="row row-cards">
        <div class="col-lg-8 mx-auto mt-4">
          <!-- <pre>
            Token: {{ token }}
            Auth:
            {{ auth }}
          </pre> -->
          <div class="card">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-12">
                  <h3 class="card-title mb-1">Loading your userdata, please wait...</h3>
                  <div class="mt-3">
                    <div class="row g-2 align-items-center">
                      <div class="col">
                        <div class="progress progress-sm">
                          <div
                            class="progress-bar progress-bar-indeterminate"
                            role="progressbar"
                            aria-valuemin="0"
                            aria-valuemax="100"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @file:    \pages\auth.vue
 * @desc:    Receives the token from the backend and stores it
 *           this token identifies the user in the gamelog.rip database
 * -------------------------------------------
 * Created Date: 21st March 2023
 * Modified: Wed Apr 10 2024
 **/

export default {
  name: 'Auth',

  data() {
    return {
      token: '',
      auth: '',

      ui: {
        loading: false,
      },
    }
  },

  computed: {
    ...mapStores(useUserStore),
  },

  methods: {
    async authenticate() {
      this.ui.loading = true
      window.setTimeout(() => {
        this.setUser()
      }, 1000)
    },

    //+-------------------------------------------------
    // setUser()
    // Sets the token and loads the user data
    // -----
    // Created on Fri Dec 29 2023
    //+-------------------------------------------------
    async setUser() {
      try {
        const redirect = null

        // Set the token in the axios header
        this.userStore.setToken(this.token)

        // And load current user
        await this.userStore.getApiData()

        // And update the local ddbb
        await this.userStore.updateAccount()

        this.$router.push(redirect ? redirect : '/welcome')
      } catch (e) {
        // errors.value = e
        console.error(e)
        alert('ERROR STORING THE USER, THIS SHOULD NOT HAPPEN!')
      } finally {
        this.ui.loading = false
      }
    },

    async init() {
      const route = this.$route
      const { token } = route.query

      this.token = token
      this.auth = this.$auth

      if (!token) return
      this.authenticate()
    },
  },

  mounted() {
    this.init()
  },
}
</script>
