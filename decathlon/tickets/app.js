// Initialise Apps framework client. See also:
// https://developer.zendesk.com/apps/docs/developer-guide/getting_started
const client = ZAFClient.init()

// Vuetify settings
const vuetify = new Vuetify({
  icons: {
    iconfont: 'fa'
  },
  theme: {
    themes: {
      light: {
        primary: '#000000'
      }
    }
  }
})

// Initialise Vue instance
const vm = new Vue({
  el: '#app',
  vuetify: vuetify,

  /////////////////////////////////////////////////////////////////////////////
  // Data
  /////////////////////////////////////////////////////////////////////////////

  data: {
    // Tickets endpoint
    ticketsEndpoint: 'https://tbugkc3k10.execute-api.eu-west-1.amazonaws.com/decathlon',

    // Available ticket statuses
    status: {
      new: {
        name: 'New',
        color: '#FEAF57',
        text: '#703815'
      },
      open: {
        name: 'Open',
        color: '#E34F32',
        text: '#FFFFFF'
      },
      hold: {
        name: 'On Hold',
        color: '#3A444C',
        text: '#FFFFFF'
      },
      pending: {
        name: 'Pending',
        color: '#3E97ED',
        text: '#FFFFFF'
      },
      solved: {
        name: 'Solved',
        color: '#3A444C',
        text: '#FFFFFF'
      },
      closed: {
        name: 'Closed',
        color: '#D8DCDE',
        text: '#49545C'
      }
    },

    // User tickets
    tickets: [],

    // Requester email
    requester: null,

    // App loader
    loading: false
  },

  /////////////////////////////////////////////////////////////////////////////
  // Methods
  /////////////////////////////////////////////////////////////////////////////

  methods: {
    // Load app initial data
    loadInitialData: async function () {
      try {
        this.loading = true

        const urlParams = new URLSearchParams(window.location.search)
        this.requester = urlParams.get('requester')

        const ticketsData = await fetch(`${this.ticketsEndpoint}/tickets?requester=${this.requester}`)
        this.tickets = await ticketsData.json()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  },

  /////////////////////////////////////////////////////////////////////////////
  // Created
  /////////////////////////////////////////////////////////////////////////////

  created: function () {
    // Load initial app data
    this.loadInitialData()
  }
})

///////////////////////////////////////////////////////////////////////////////
// General Functions
///////////////////////////////////////////////////////////////////////////////

// Return date as a string
function dateToString(date) {
  return (strDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }))
}
