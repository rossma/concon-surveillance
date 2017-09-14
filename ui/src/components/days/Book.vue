<template xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div>
    <div class="panel">
      <div class="row">
        <div class="col-lg-6" v-show="showBookBucketTable === true">
          <table id="book-start-bucket-tbl" class="display" width="100%">
            <thead>
            <tr>
              <th>Bid Qty</th>
              <th>Bid</th>
              <th>Ask</th>
              <th>Ask Qty</th>
            </tr>
            </thead>
          </table>
        </div>
        <div class="col-lg-6">
          <div id="book-cc" class="book-cc"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  var Highcharts = require('highcharts/highstock')
  require('highcharts/modules/exporting')(Highcharts)

  var bucketTbl

  export default {
    name: 'book',
    data () {
      return {
        showBookBucketTable: false
      }
    },
    mounted: function() {
      bucketTbl = $('#book-start-bucket-tbl').DataTable({
        paging: false,
        ordering: false,
        info: false,
        searching: false,
//          "lengthChange": false,
//        "scrollY": 400,
        "scrollX": true,
        scrollY: '40vh',
        scrollCollapse: true,
//        responsive: true,
//        bAutoWidth: true

      })
    },
    methods: {
      init: function (queryResult) {
        console.log("in Book.init")
        this.showBookBucketTable = true

        // initialise the table
        this.initTableData(queryResult)

        // initialise the chart
        this.initChart(queryResult)

      },
      initTableData: function (queryResult) {
        bucketTbl.clear();
        for(var i in queryResult.res.ask) {
          bucketTbl.row.add([
            queryResult.res.bid[i],
            queryResult.res.bidQty[i],
            queryResult.res.ask[i],
            queryResult.res.askQty[i]
            ]).draw(false)
        }

        setTimeout( function(){
          bucketTbl.columns.adjust().draw()
         // bucketTbl.draw()
        }, 10 )

      },
      initChart: function (queryResult) {
        $(".book-cc").show()

        // zip ask and askQty values together
        var askQty = queryResult.res.askQty
        var askSeries = queryResult.res.ask.map(function (e, i) {
          return [e, askQty[i]]
        })

        // zip bid and bidQty values together
        var bidQty = queryResult.res.bidQty
        var bidSeries = queryResult.res.bid.map(function (e, i) {
          return [e, bidQty[i]]
        }).reverse()

        console.log("askSeries:" + askSeries)
        console.log("bidSeries:" + bidSeries)

        var bookChart = Highcharts.chart('book-cc', {
          chart: {
            //alignTicks: false
          },
          scrollbar: {
            enabled: true
          },
          title: {
            text: 'Book'
          },
          xAxis: {},
          yAxis: {
            title: {
              text: 'Bid / Ask Qty'
            }
          },
          plotOptions: {
            column: {
              stacking: 'normal'
            }
          },
          series: [{
            type: 'column',
            name: 'askQty',
            animation: false,
            data: askSeries
          },
            {
              type: 'column',
              name: 'bidQty',
              animation: false,
              data: bidSeries
            }]
        })
      },
      reset: function() {
        this.showBookBucketTable = false
        $(".book-cc").hide()
      }
    }
  }
</script>

<style>
  .book-cc {
    width: 100%;
    height: 400px;
  }
</style>