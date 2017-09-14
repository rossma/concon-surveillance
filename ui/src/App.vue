  <template>
  <div id="app">
    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">Project name</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <li><router-link to="/home">Home</router-link></li>
            <li><router-link to="/days">Days</router-link></li>
          </ul>
        </div>
      </div>
    </nav>
    <div v-if="showAlert" class="alert alert-success alert-dismissable">
      <a href="#" class="close" data-dismiss="alert" aria-label="close" v-on:click="toggleAlert">&times;</a>
      <strong>Output</strong> {{ alertMsg }}
    </div>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        showAlert: false,
        alertMsg: ''
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  .router-link-active {
    /* use this class to find active router link */
  }

  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
