<template xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div v-show="showBucketTable">
    <table id="order-within-bucket-tbl" class="display" width="100%">
      <thead>
      <tr>
        <th>Transact Time</th>
        <th>Order ID</th>
        <th>Sym</th>
        <th>Status</th>
        <th>Side</th>
        <th>Qty</th>
        <th>Price</th>
        <th>oi1</th>
        <th>Prev Qty</th>
        <th>Prev Price</th>
        <th>Filled Qty</th>
        <th>Pos Idx</th>
      </tr>
      </thead>
    </table>
  </div>
</template>

<script>
  import moment from 'moment'
  import { mapGetters } from 'vuex'

  var dt = require('datatables.net')
  /*require('css!datatables.net-dt/css/jquery.dataTables.css')(window, $)*/

  require('datatables.net-keytable')
  require('datatables.net-buttons')
  require('datatables.net-select')
  require('font-awesome/css/font-awesome.css')

  var orderWithinBucketTbl
  var playTimer

  export default {
    name: 'ordersWithinBucket',
    props: ['dt', 'sym', 'bucket', 'depth'],
    data () {
      return {
        showBucketTable: false,
        selectedId: -1,
        playForwardDirection: true
      }
    },
    mounted: function () {
      console.log("orders within bucket mounted called")
      orderWithinBucketTbl = $('#order-within-bucket-tbl').DataTable({
//        "paging": false,
//        //"scrollY": 300,
//        "ordering": false,
//        "info": false,
//        "searching": false,
//        "lengthChange": false,
        "keys": true,
        "select": true,
        dom: 'lBtp',
        buttons: [
          {
            text: 'back',
            className: 'play-back-btn',
            action: function ( e, dt, node, config ) {
              this.playback()
            }.bind(this)
          },
          {
            text: 'pause',
            className: 'pause-back-btn',
            action: function ( e, dt, node, config ) {
              this.pause()
            }.bind(this)
          },
          {
            text: 'play',
            className: 'play-btn',
            action: function ( e, dt, node, config ) {
              this.play()
            }.bind(this)
          },
          {
            text: 'pause',
            className: 'pause-btn',
            action: function (e, dt, node, config) {
              this.pause()
            }.bind(this)
          }
        ]
      })

      orderWithinBucketTbl
        .on( 'key-focus', function ( e, datatable, cell, originalEvent ) {
//          console.log(`row selected, e:${JSON.stringify(e)} originalEvent: ${JSON.stringify(originalEvent)}`)
          if (originalEvent !== null) this.pause() // if key focus is from a key event and not from auto play
          //datatable.$('tr.selected').removeClass('selected')
          var row = datatable.row( cell.index().row )
          //var rowData = row.data()
          //console.log('Cell in '+rowData[0]+' focused')
          //console.log($(row))
          this.onRowClick(row)
        }.bind(this))
//        .on( 'key-blur', function ( e, datatable, cell ) {
//          console.log('no cell selected')
//        } )

      //$('#order-within-bucket-tbl tbody').on( 'click', 'tr',  this.onRowClick )
    },
    computed: mapGetters({
      order: 'order'
    }),
    methods: {
      init: function (queryResult) {
        console.log("in OrdersWithinBucket.init")
        this.showBucketTable = true
        //console.log(JSON.stringify(this.data))

        orderWithinBucketTbl.clear()
        for (var i in queryResult.res.orderID) {
          var rowNode = orderWithinBucketTbl.row.add([
            moment.utc(queryResult.res.transactTime[i], "~tYYYY-MM-DDTHH:mm:ss").format('HH:mm:ss'),
            queryResult.res.orderID[i],
            queryResult.res.sym[i],
            queryResult.res.status[i],
            queryResult.res.side[i],
            queryResult.res.qty[i],
            queryResult.res.price[i],
            queryResult.res.oi1[i],
            queryResult.res.prevQty[i],
            queryResult.res.prevPrice[i],
            queryResult.res.filledQty[i],
            queryResult.res.posIndex[i]
          ]).draw(false).node()

          $(rowNode).attr('data-id', queryResult.res.posIndex[i])

        }
        orderWithinBucketTbl.columns.adjust()
      },
      onRowClick: function (row) {
        orderWithinBucketTbl.rows('.selected').deselect()
        $(row.node()).addClass('selected')
        console.log(`row index:${row.index()} page:${orderWithinBucketTbl.page()}`)
        this.selectedId = row.index()
        this.sendBookAfterOrderQry($(row.node()))
      },
//      onRowClick: function (evnt) {
        //var row = $(evnt.target).parent()
//        console.log('row clicked')
//        console.log(evnt.target)

//        if ( row.hasClass('selected') ) {
//          row.removeClass('selected');
//        } else {
//          orderWithinBucketTbl.$('tr.selected').removeClass('selected');
//          row.addClass('selected');
//        }
        //this.sendBookAfterOrderQry(row)
//      },
      sendBookAfterOrderQry: function(row) {
        //var order = this.$store.getters.order
        console.log(`Order:${JSON.stringify(this.order)}`)

        var posIdx = row.data("id")

        console.log(`posIdx:${posIdx}`)
        var bookAfterOrderQry = `("Item4b";"hdb";".ob.getBookAfterOrder";("sym";"dt";"bucket";"transactTime";"i1";"i2";"posIndex";"depth";"display");
                                 ("${this.sym}";"${this.dt}";"${this.bucket * 60}";"${this.order.transactTime}";"${this.order.oi1}";"${this.order.oi2}";"${posIdx}";"${this.depth}";"topDown");
                                 ("symbol";"date";"long";"time";"long";"long";"long";"long";"symbol"))`
        this.$emit('sendQuery', bookAfterOrderQry)
      },
      reset: function() {
        this.showBucketTable = false
      },
      play: function() {
        console.log('playing')
        this.pause()
        var el = $('.play-btn')
        console.log('el:' + el.attr('class'))
        el.css({ 'display': "none" })
        $('.pause-btn').css({ 'display': "inline-block" })

        this.playForwardDirection = true
        if (this.selectedId+1 === orderWithinBucketTbl.data().length) {
          this.selectedId = -1
        }

        this.selectNextRow()
        playTimer = setInterval(this.selectNextRow, 1000)
      },
      pause: function() {
        console.log('pausing')
        $('.play-btn').css({ 'display': "inline-block" })
        $('.pause-btn').css({ 'display': "none" })

        $('.play-back-btn').css({ 'display': "inline-block" })
        $('.pause-back-btn').css({ 'display': "none" })

        if (playTimer !== null) {
          clearInterval(playTimer)
        }
      },
      playback: function() {
        console.log('playing back')
        this.pause()
        var el = $('.play-back-btn')
//        console.log('el:' + el.attr('class'))
        el.css({ 'display': "none" })
        $('.pause-back-btn').css({ 'display': "inline-block" })
        this.playForwardDirection = false
//        if (this.selectedId+1 === orderWithinBucketTbl.data().length) {
//          this.selectedId = -1
//        }

        this.selectNextRow()
        playTimer = setInterval(this.selectNextRow, 1000)
      },
      selectNextRow: function() {
        console.log(`selectedid:${this.selectedId} data count:${orderWithinBucketTbl.data().count()} length: ${orderWithinBucketTbl.data().length}`)

        if ((this.playForwardDirection && this.selectedId+1 === orderWithinBucketTbl.data().length) ||
          (!this.playForwardDirection && this.selectedId-1 === -1)) {
          this.pause()
        } else if (this.playForwardDirection) {
          this.selectedId++
        } else {
          this.selectedId--
        }
        var row = orderWithinBucketTbl.row(this.selectedId)
        console.log(`IDX:${row.index()}`)
        orderWithinBucketTbl.cell( row.index(), 0 ).focus()
        console.log(`IDX:${row.index()}`)

    //          let currentPage = orderWithinBucketTbl.page() + 1
    //          let pageLength = orderWithinBucketTbl.page.info().length
    //          console.log(`row index:${row.index()} page check: ${currentPage*pageLength}`)
    //          if (row.index() >= currentPage*pageLength) {
    //            console.log('in page switch')
    //            orderWithinBucketTbl.page('next').draw('page')
    //          }
    //
    //          this.onRowClick(row)
      }
    }
  }

</script>

<style>
  #order-within-bucket-tbl {
    cursor: pointer;
  }

  table.dataTable td.focus {
    outline: none;
  }

  div.dt-buttons {
    float: right;
  }

  a.dt-button {
    /*width: 100px;*/
  }

  a.dt-button.play-btn:after {
    margin-left:5px;
    display: inline-block;
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    content: "\f04b";
  }

  a.dt-button.play-back-btn:after {
    margin-left:5px;
    display: inline-block;
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    content: "\f04a";
  }

  a.dt-button.pause-btn, a.dt-button.pause-back-btn {
    display: none;
  }

  a.dt-button.pause-btn:after, a.dt-button.pause-back-btn:after {
    margin-left:5px;
    display: inline-block;
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    content: "\f04c";
  }

</style>