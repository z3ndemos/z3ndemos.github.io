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

    // Hidden tickets based on status
    hiddenTickets: ['solved', 'closed'],

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

    // New comment
    newComment: null,

    // User tickets
    tickets: [],

    // Requester email
    requester: null,

    // Pagination
    currentPage: 1,
    pageSize: 15,

    // App loader
    loading: {
      tickets: false,
      comments: null,
      newComment: false
    },

    // Latest comments dialog
    showingLatestComments: false,
    selectedTicket: null,
    latestComments: [],
    ticketUsers: []
  },

  /////////////////////////////////////////////////////////////////////////////
  // Computed
  /////////////////////////////////////////////////////////////////////////////

  computed: {
    // Return all the tickets available for the current page
    currentPageTickets: function () {
      const tickets = this.tickets
      const currentPage = this.currentPage
      const pageSize = this.pageSize

      return tickets.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    },

    // Return the number of pages available
    totalPages: function () {
      return Math.ceil(this.tickets.length / this.pageSize)
    },

    // Pages that need to be visible in the dynamic pagination
    // Output: array with valid pages
    //  (will not return first and last page if they are not between the range)
    validPages: function () {
      const maxPages = 10
      const adjacents = Math.floor(maxPages / 2) * 2 + 1
      const firstPage =
        Math.max(0, Math.min(this.totalPages - adjacents, this.currentPage - Math.ceil(adjacents / 2))) + 1
      const lastPage = firstPage + (maxPages - 1) < this.totalPages ? firstPage + (maxPages - 1) : this.totalPages

      return Array(lastPage + 1 - firstPage)
        .fill()
        .map((v, i) => i + firstPage)
    }
  },

  /////////////////////////////////////////////////////////////////////////////
  // Methods
  /////////////////////////////////////////////////////////////////////////////

  methods: {
    // Ticket status
    ticketStatus: function (status) {
      if (this.status[status]) {
        return this.status[status]
      }

      return {
        name: status[0].toUpperCase() + status.substr(1).toLowerCase(),
        color: '#0277BD',
        text: '#FFFFFF'
      }
    },

    // Get tickets
    getTickets: async function () {
      try {
        const ticketsData = await fetch(`${this.ticketsEndpoint}/tickets?requester=${this.requester}`)
        const tickets = (await ticketsData.json())?.tickets

        this.tickets = Array.isArray(tickets)
          ? tickets.filter((obj) => !this.hiddenTickets.includes(obj.status)).sort((a, b) => b.id - a.id)
          : []
      } catch (err) {
        console.error(err)
      }
    },

    // Show comments
    showComments: async function (ticketId, params) {
      const loading = params?.loading

      if (!this.loading.comments) {
        try {
          this.$set(this.loading, 'comments', loading ? ticketId : null)

          const apiData = await (
            await fetch(`${this.ticketsEndpoint}/comments?requester=${this.requester}&ticket=${ticketId}`)
          ).json()

          const comments = apiData.comments.filter((obj) => obj.public).sort((a, b) => b.id - a.id)
          const users = apiData.users

          this.$set(this, 'selectedTicket', ticketId)
          this.$set(this, 'latestComments', comments)
          this.$set(this, 'ticketUsers', users)
        } catch (err) {
          console.error(err)
        } finally {
          this.$set(this.loading, 'comments', null)
          this.$set(this, 'showingLatestComments', true)
        }
      }
    },

    // Create comment
    createComment: async function () {
      try {
        this.$set(this.loading, 'newComment', true)

        await fetch(`${this.ticketsEndpoint}/comments?requester=${this.requester}&ticket=${this.selectedTicket}`, {
          method: 'POST',
          body: JSON.stringify({
            body: this.newComment
          })
        })

        await this.showComments(this.selectedTicket)

        this.$set(this, 'newComment', null)
      } catch (err) {
        console.error(err)
      } finally {
        this.$set(this.loading, 'newComment', false)
      }
    },

    // Navigate to another page
    changePage: function (page) {
      this.currentPage = page

      // Scroll to top
      this.$nextTick(() => {
        this.$vuetify.goTo(0)
      })
    },

    // Load app initial data
    loadInitialData: async function () {
      try {
        this.$set(this.loading, 'tickets', true)

        const urlParams = new URLSearchParams(window.location.search)
        this.requester = urlParams.get('requester')

        await this.getTickets()
      } catch (err) {
        console.error(err)
      } finally {
        this.$set(this.loading, 'tickets', false)
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
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
}
