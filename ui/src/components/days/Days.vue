<template xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div>
    <div class="form-inline">
      <div class="form-group">
        <label for="datepicker-grp">Date:</label>
        <div id="datepicker-grp" class="input-group date" data-date-format="yyyy.mm.dd">
          <input id="datepicker-in" size="16" type="text" v-model="date" class="form-control">
          <div class="input-group-addon">
            <span class="glyphicon glyphicon-th"></span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="sym-in">Sym:</label>
        <select id="sym-in" class="form-control" v-model="sym">
          <option value="EURUSD">EURUSD</option>
          <option value="GBPUSD">GBPUSD</option>
          <option value="AUDCAD">AUDCAD</option>
        </select>
      </div>
      <div class="form-group">
        <label for="bucket-in">Bucket:</label>
        <select id="bucket-in" class="form-control" v-model="bucket">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
          <option value="40">40</option>
          <option value="50">50</option>
          <option value="60">60</option>
        </select>
      </div>
      <div class="form-group">
        <label for="depth-in">Depth:</label>
        <select id="depth-in" class="form-control" v-model="depth">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="25">25</option>
          <option value="30">30</option>
          <option value="50">50</option>
        </select>
      </div>
      <button id="send-btn" v-on:click="getDaysActivity" class="btn btn-secondary">Send</button>
    </div>
    <days-activity ref="daysActivity" v-on:sendQuery="sendQuery" :dt="date" :sym="sym" :bucket="bucket"
                   :depth="depth"></days-activity>
    <book ref="book" v-on:sendQuery="sendQuery"></book>
    <orders-within-bucket ref="ordersWithinBucket" v-on:sendQuery="sendQuery"
                          :dt="date" :sym="sym" :bucket="bucket" :depth="depth"></orders-within-bucket>
  </div>
</template>

<script>
  import DaysActivity from './DaysActivity.vue'
  import Book from './Book.vue'
  import OrdersWithinBucket from './OrdersWithinBucket.vue'

  //require('bootstrap')
  require('bootstrap-datepicker')

  var ws

  export default {
    name: 'days',
    components: {
      'daysActivity': DaysActivity,
      'book': Book,
      'ordersWithinBucket': OrdersWithinBucket
    },
    destroyed:function() {
      if (ws != null) {
        ws.close()
      }
    },
    data () {
      return {
        alertMsg: '',
        showAlert: false,
        date: '2016.04.05',
        sym: 'EURUSD',
        bucket: '5',
        depth: '10'
      }
    },
    mounted: function () {
      console.log("mounted called:" + $('.datepicker').length)

      // initialise datepicker
      $('#datepicker-grp').datepicker({
        autoclose: true
      }).on(
        "changeDate", () => {
          this.date = $('#datepicker-in').val()
        }
      )
      this.getDaysActivity()
    },
    methods: {
      connect: function () {
        this.alertMsg = "connecting..."
        this.showAlert = true

        if ("WebSocket" in window) {
          ws = new WebSocket("ws://localhost:18080")

          /* this onopen never gets called */
          ws.onopen = function () {
            //this.alertMsg="connected"
          }

          ws.onclose = function (e) {
            this.alertMsg = "disconnected"
          }

          ws.onmessage = function (e) {
            console.log("received message from server")
            //this.output = e.data
            var json = JSON.parse(e.data)
            console.log(JSON.stringify(json))
            if (json.clientqid === "Item2") {
              this.$refs.daysActivity.initChart(json)
            } else if (json.clientqid === "Item4a") {
              this.$refs.book.init(json)
            } else if (json.clientqid === "Item4b") {
              this.$refs.book.init(json)
            } else if (json.clientqid === "Item5") {
              this.$refs.ordersWithinBucket.init(json)
            }
          }.bind(this) // bind this makes the data variables accessible inside callback
          ws.onerror = function (e) {
            console.log(e.data)
          }
        } else {
          alert("WebSockets not supported on your browser.")
        }
      },
      waitForSocketConnection: function (socket, callback) {
        setTimeout(function () {
          if (socket.readyState === 1) {
            if (callback != null) {
              callback()
            }
            return
          } else {
            this.waitForSocketConnection(socket, callback)
          }
        }.bind(this), 5) // wait 5 milisecond for the connection...
      },
      sendQuery: function (qry) {
        console.log("in sendQuery")

        var qryPrefix = '`clientqid`kdbserver`kdbfunction`argumentKeys`arguments`argumentTypes!'

        if (ws == null || ws.readyState === ws.CLOSED) {
          console.log('ws not initialised, connecting...')
          this.connect()
        }


        // Wait until socket is connected before sending message
        this.waitForSocketConnection(ws, function () {
          var cmd = qryPrefix + qry
          console.log("command:" + cmd)
          ws.send(cmd)
        })
      },
      getDaysActivity: function () {
        this.$refs.ordersWithinBucket.reset()
        this.$refs.book.reset()

        var qry = `("Item2";"hdb";".ob.getDaysActivity";("sym";"dt";"bucket";"poi");
                  ("${this.sym}";"${this.date}";"${this.bucket * 60}";"all");("symbol";"date";"long";"symbol"))`
        this.sendQuery(qry)
      }
    }
  }
</script>

