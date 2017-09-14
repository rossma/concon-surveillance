<template xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div>
      <div class="row">
        <!--div class="col-md-1">
          <button id="connect-btn" v-on:click="connect" class="btn btn-secondary">Connect</button>
        </div>
        <div class="col-md-1">
          <button id="disconnect-btn" v-on:click="disconnect" class="btn btn-secondary">Disconnect</button>
        </div-->
        <div class="col-lg-6 pull-right">
          <div class="input-group">
            <input id="query-txt" type="text" placeholder="--query" v-model="query" class="form-control" ></input>
            <span class="input-group-btn">
              <button id="send-btn" v-on:click="send" class="btn btn-secondary">Send</button>
            </span>
          </div>
        </div>
      </div>

      <!--textarea id="output-txt" type="text" placeholder="--output" v-model="output" disabled rows=25 cols=150></textarea> <br /-->
      <div class="help-block"></div>
      <div>
        <div>
          {{ $data.json  }}
        </div>
        <table class="table table-condensed">
          <thead>
          <tr>
            <th>horCount</th>
            <th>start</th>
            <th>end</th>
            <th>orderCount</th>
            <th>severity</th>
            <th>sym</th>
            <th>time</th>
            <th>triggerTime</th>
            <th>user</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="value in queryResult">
            <td>{{ value.horCount }}</td>
            <td>{{  parseDateTime(value.start) }}</td>
            <td>{{ parseDateTime(value.end) }}</td>
            <td>{{ value.orderCount }}</td>
            <td>{{ value.severity.toFixed(2) }}</td>
            <td>{{ value.sym }}</td>
            <td>{{ parseDateTime(value.time) }}</td>
            <td>{{ parseDateTime(value.triggerTime) }}</td>
            <td>{{ value.user }}</td>
          </tr>
          </tbody>
        </table>
      </div>
  </div>
</template>

<script>
  //import { alert } from 'vue-strap'
  import moment from 'moment'

  var ws;

  export default {
    name: 'app',
    components: {
      //alert
    },
    data () {
      return {
        query: '`clientqid`kdbserver`kdbfunction`arguments`argumentTypes`argumentKeys!("webFunction";"hdb";".surv.highOrderRate";("cliff";" ";"2016.04.05";"1b");("symbol";"symbol";"date";"boolean");("user";"alertInstance";"dt";"cache"))',
        conn: '',
        queryResult: [],
        json: [],
        showAlert: false,
        alertMsg: ''
      }
    },
    mounted: function () {
      console.log("mounted called...");
    },
    methods: {
      connect: function () {
        this.alertMsg="connecting...";
        this.showAlert = true;

        if ("WebSocket" in window) {
          ws = new WebSocket("ws://localhost:18080");

          /* this onopen never gets called */
          ws.onopen=function () {
            //this.alertMsg="connected";
          };

          ws.onclose=function(e){
            this.alertMsg = "disconnected";
          };

          ws.onmessage=function(e) {
            this.output=e.data;
            var json = JSON.parse(e.data);
            this.json = json;
            console.log(json);
            //console.log(JSON.parse(json.res));
            //console.log("res:" + json.res[0].start);
            //this.queryResult = json.res;
            //this.queryResult = JSON.parse(e.data);
            //console.log("sss" + this.queryResult);
          }.bind(this); // bind this makes the data variables accessible inside callback

          ws.onerror=function(e){console.log(e.data);};
        } else {
          alert("WebSockets not supported on your browser.");
        }
      },
      send: function () {
        if (ws == null) {
          this.connect();
        }

        // Wait until socket is connected before sending message
        this.waitForSocketConnection(ws, function() {
          ws.send(this.query);
          this.alertMsg="query sent";
        }.bind(this));
      },
      waitForSocketConnection: function (socket, callback) {
        setTimeout( function () {
          if (socket.readyState === 1) {
            if(callback != null){
              callback();
            }
            return;
          } else {
            this.waitForSocketConnection(socket, callback);
          }
        }.bind(this), 5); // wait 5 milisecond for the connection...
      },
      filterSyms: function () {
        console.log("In filterSyms, args:" + JSON.stringify(data))
      },
      getSyms: function (data) {
        console.log("In getSyms, args:" + JSON.stringify(data))
      },
      getQuotes: function (data) {
        console.log("In getQuotes, args:" + JSON.stringify(data))
      },
      getTrades: function (data) {
        console.log("In getTrades, args:" + JSON.stringify(data))
      },
      disconnect: function () {
        this.alertMsg="disconnecting...";
        ws.close();
        this.alertMsg="disconnected";
      },
      toggleAlert: function () {
        this.showAlert = !this.showAlert;
      },
      parseDateTime: function (datetime) {
        return  moment(datetime, "YYYY-MM-DD\DHH:mm:ss.sssssssss").format("YYYY-MM-DD HH:mm:ss");
      }

    }

  }
</script>

<style>
</style>
