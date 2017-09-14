<template xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div>
    <div id="dys-actvty-cc" style="width:100%; height:400px;margin-top: 40px;"></div>
  </div>
</template>

<script>
  import moment from 'moment'
  //import { setOrder } from '../../store/actions'
  import { mapActions } from 'vuex'

  // For Highcharts
  //var Highcharts = require('highcharts')

  // For Highstock or HighMaps
  var Highcharts = require('highcharts/highstock')

  // Load module after Highcharts is loaded
  require('highcharts/modules/exporting')(Highcharts)
  //require('highcharts/modules/map')(Highcharts)

  export default {
    name: 'daysActivity',
    props: ['dt', 'sym', 'bucket', 'depth'],
    data () {
      return {
        queryResult: []
      }
    },
    methods: {
      ...mapActions([
        'setOrder'
      ]),
      initChart: function (queryResult) {
        console.log("in DaysActivitiy.initChart")
        // zip vol together with the oil
        var oi1 = queryResult.res.oi1
        var oi2 = queryResult.res.oi2
//        console.log("oi2:" + oi2)
        var volSeriesData = queryResult.res.Vol.map(function (e, i) {
          return {y: e, oi1: oi1[i], oi2: oi2[i]}
        })

        var daysActivityChart = Highcharts.chart('dys-actvty-cc', {
          chart: {
            //alignTicks: false
          },
          scrollbar: {
            enabled: true
          },
          title: {
            text: 'Days Activity'
          },
          xAxis: {
            type: 'datetime',
            labels: {
              formatter: function () {
                return moment.utc(this.value, "~tYYYY-MM-DDTHH:mm:ss").format('HH:mm:ss')
              },
//            format: '{value:%H:%M:%S}',
              rotation: 0,
              align: 'left'
            },
            max: 15,
            categories: queryResult.res.transactTime
          },
          yAxis: [{
            title: {
              text: 'Bid / Ask'
            }
          },
            {
              title: {
                text: 'Volume'
              },
              opposite: true
            }],
          plotOptions: {
            series: {
              cursor: 'pointer',
              point: {
                events: {
                  click: function (evnt) {
                    //console.log('oi1:' + evnt.point.oi1 + ', value:' + evnt.point.y + ',transactTime:' + evnt.point.category)
                    var transactTime = this.getTimeFromDate(evnt.point.category)

                    const order = {
                      oi1: evnt.point.oi1,
                      oi2: evnt.point.oi2,
                      transactTime: transactTime
                    }

                    //this.$store.dispatch('setOrder', order)
                    this.setOrder(order)
                    var ordersWithinBucketQry = `("Item5";"hdb";".ob.getOrdersWithinBucket";("sym";"dt";"i1";"i2";"bucket";"cache");
                                                 ("${this.sym}";"${this.dt}";${evnt.point.oi1};${evnt.point.oi2};"${this.bucket * 60}";"1b");
                                                 ("symbol";"date";"long";"long";"long";"symbol"))`
                    this.$emit('sendQuery', ordersWithinBucketQry)

                    var bookAtStartOfBucketQry = `("Item4a";"hdb";".ob.getBookAtStartOfBucket";("sym";"dt";"bucket";"poi";"transactTime";"depth";"display");
                                                  ("${this.sym}";"${this.dt}";"${this.bucket * 60}";"all";"${transactTime}";"${this.depth}";"topDown");
                                                  ("symbol";"date";"long";"symbol";"time";"long";"symbol"))`
                    this.$emit('sendQuery', bookAtStartOfBucketQry)

                  }.bind(this)
                }
              }
            }
          },
          series: [{
            type: 'column',
            name: 'vol',
            yAxis: 1,
            data: volSeriesData
          },
            {
              type: 'line',
              name: 'bid',
              data: queryResult.res.bid
            },
            {
              type: 'line',
              name: 'ask',
              data: queryResult.res.ask
            }]
        })
      },
      parseDateTime: function (datetime) {
        var res = moment.utc(datetime, "~tYYYY-MM-DDTHH:mm:ss").valueOf()
        console.log(res)
        return res
      },
      getTimeFromDate(date) {
        return moment.utc(date, "~tYYYY-MM-DDTHH:mm:ss").format('HH:mm:ss')
      }
    }
  }

</script>

<style>
  .datepicker-days {
    cursor: pointer
  }
</style>