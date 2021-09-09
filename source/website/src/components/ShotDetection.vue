<template>
  <div>
    <div
      v-if="isBusy"
      class="wrapper"
    >
      <Loading />
    </div>
    <div
      v-else
      class="wrapper"
    >
      <b-table
        id="shotTable"
        responsive
        fixed
        :items="elasticsearch_data"
        :per-page="perPage"
        :current-page="currentPage"
        :fields="fields"
        :sort-by="sortBy"
      >
        <template #cell(Index)="data">
          <b-button variant="link" @click="setPlayerTime(data.item.EndTimestamp, data.item.StartTimestamp)">
            {{ data.item.Index }}
          </b-button>
        </template>
      </b-table>
      <b-pagination
        v-model="currentPage"
        align="center"
        :per-page="perPage"
        :total-rows="rows"
        aria-controls="shotTable"
      ></b-pagination>
      <b-button
        type="button"
        @click="saveFile()"
      >
        Download Data
      </b-button>
      <br>
      <b-button
          :pressed="false"
          size="sm"
          variant="link"
          class="text-decoration-none"
          @click="showElasticsearchApiRequest = true"
      >
        Show API request to get these results
      </b-button>
      <b-modal
          v-model="showElasticsearchApiRequest"
          scrollable
          title="SEARCH API"
          ok-only
      >
        <label>Request URL:</label>
        <pre v-highlightjs><code class="bash">GET {{ ELASTICSEARCH_ENDPOINT }}workflow/execution</code></pre>
        <label>Search query:</label>
        <pre v-highlightjs="JSON.stringify(searchQuery)"><code class="json"></code></pre>
        <label>Sample command:</label>
        <pre v-highlightjs="curlCommand"><code class="bash"></code></pre>
      </b-modal>
    </div>
  </div>
</template>

<script>
  import Loading from '@/components/Loading.vue'
  import { mapState } from 'vuex'
  export default {
    name: "ShotDetection",
    components: {
      Loading
    },
    props: {
      mediaType: {
        type: String,
        default: ""
      },
    },
    data() {
      return {
        curlCommand: '',
        searchQuery: '',
        showElasticsearchApiRequest: false,
        sortBy: 'Index',
        currentPage: 1,
        perPage: 10,
        endTimestamp: null,
        fields: [
          {
            'Index': {
              label: 'Shot Number',
              sortable: true
            }
          },
          {
            'StartTimecodeSMPTE': {
              label: 'Start',
              sortable: false
            }
          },
          {
            'EndTimecodeSMPTE': {
              label: 'End',
              sortable: false
              }
          },
          {
            'DurationSMPTE': {
              label: 'Duration',
              sortable: true
              }
          },
          { key: 'Confidence', sortable: true }
      ],
        elasticsearch_data: [],
        isBusy: false,
        operator: 'shot_detection',
      }
    },
    computed: {
      ...mapState(['player']),
      ...mapState(['current_time']),
      rows() {
        return this.elasticsearch_data.length
      },
    },
    watch: {
      current_time(time) {
        if (this.endTimestamp != null) {
          if (time == this.endTimestamp || time > this.endTimestamp) {
            this.player.pause();
            this.endTimestamp = null
          }
        }
      }
    },
    deactivated: function () {
      console.log('deactivated component:', this.operator);
    },
    activated: function () {
      console.log('activated component:', this.operator)
      this.fetchAssetData();
    },
    mounted: function() {
      this.getCurlCommand();
    },
    beforeDestroy: function () {
      this.elasticsearch_data = [];
    },
    methods: {
      setPlayerTime(endMillisenconds, startMilliseconds) {
        this.endTimestamp = endMillisenconds / 1000
        let seconds = startMilliseconds / 1000
        this.player.currentTime(seconds)
        this.player.play();
      },
      getCurlCommand() {
        this.searchQuery = 'AssetId:'+this.$route.params.asset_id+' Operator:'+this.operator;
        // get curl command to search elasticsearch
        this.curlCommand = 'awscurl -X GET --profile default --service es --region ' + this.AWS_REGION + ' \'' + this.ELASTICSEARCH_ENDPOINT + '/_search?q=' + encodeURIComponent(this.searchQuery) + '\''
      },
      saveFile() {
        const elasticsearch_data = JSON.stringify(this.elasticsearch_data);
        const blob = new Blob([elasticsearch_data], {type: 'text/plain'});
        const e = document.createEvent('MouseEvents'),
          a = document.createElement('a');
        a.download = "data.json";
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
      },
      async fetchAssetData () {
          let query = 'AssetId:'+this.$route.params.asset_id+' Operator:'+this.operator;
          let apiName = 'contentAnalysisElasticsearch';
          let path = '/_search';
          let apiParams = {
            headers: {'Content-Type': 'application/json'},
            queryStringParameters: {'q': this.searchQuery, 'default_operator': 'AND', 'size': 10000}
          };
          let response = await this.$Amplify.API.get(apiName, path, apiParams);
          console.log(response)
          if (!response) {
            this.showElasticSearchAlert = true
          }
          else {
            let es_data = [];
            let result = await response;
            let data = result.hits.hits;
            if (data.length === 0 && this.Confidence > 55) {
                this.lowerConfidence = true;
                this.lowerConfidenceMessage = 'Try lowering confidence threshold'
            }
            else {
              this.lowerConfidence = false;
              for (let i = 0, len = data.length; i < len; i++) {
                es_data.push(data[i]._source)
              }
            }
            this.elasticsearch_data = JSON.parse(JSON.stringify(es_data));
            this.isBusy = false
        }
      }
    }
  }
</script>
