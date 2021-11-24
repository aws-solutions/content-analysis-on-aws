<template>
  <div>
    <div v-if="noTranscript === true">
      No transcript found for this asset
    </div>
    <div v-if="isBusy">
      <b-spinner
        variant="secondary"
        label="Loading..."
      />
      <p class="text-muted">
        (Loading...)
      </p>
    </div>
    <div v-else>
      {{ transcript }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Transcript",
  data() {
    return {
      transcript: "",
      isBusy: false,
      operator: "transcript",
      noTranscript: false
    }
  },
  deactivated: function () {
    this.transcript = ""
    console.log('deactivated component:', this.operator)
  },
  activated: function () {
    console.log('activated component:', this.operator);
    this.fetchAssetData();
  },
  beforeDestroy: function () {
      this.transcript = ''
  },
  methods: {
    async fetchAssetData () {
      let query = 'AssetId:'+this.$route.params.asset_id+ ' _index:mievideotranscript';
      let apiName = 'contentAnalysisElasticsearch';
      let path = '/_search';
      let apiParams = {
        headers: {'Content-Type': 'application/json'},
        queryStringParameters: {'q': query, 'default_operator': 'AND', 'size': 10000}
      };
      let response = await this.$Amplify.API.get(apiName, path, apiParams);
      if (!response) {
        this.showElasticSearchAlert = true
      }
      else {
        let result = await response;
        let data = result.hits.hits;
        if (data.length === 0) {
          this.noTranscript = true
        }
        else {
          for (let i = 0, len = data.length; i < len; i++) {
            if ('transcript' in data[i]._source) {
              this.transcript = this.transcript.concat(data[i]._source.transcript + " ")
              this.noTranscript = false;
            }
          }
        }
        this.isBusy = false
      }
    }
  }
}
</script>
