<template>
  <div>
    <Header />
    <b-container fluid>
      <b-alert
        v-model="showElasticSearchAlert"
        variant="danger"
        dismissible
      >
        Elasticsearch server denied access. Please check its access policy.
      </b-alert>
      <b-row class="dataColumns">
        <b-col>
          <div>
            <b-row align-h="center">
              <b-tabs
                content-class="mt-3"
                fill
              >
                <b-tab
                  title="ML Vision"
                  active
                  @click="currentView = 'LabelObjects'; mlTabs = 0"
                >
                  <b-container fluid>
                    <b-row>
                      <div>
                        <b-tabs
                          v-model="mlTabs"
                          content-class="mt-3"
                          fill
                        >
                          <b-tab
                            title="Objects"
                            @click="currentView = 'LabelObjects'"
                          />
                          <b-tab
                            title="Celebrities"
                            @click="currentView = 'Celebrities'"
                          />
                          <b-tab
                            title="Moderation"
                            @click="currentView = 'ContentModeration'"
                          />
                          <b-tab
                            title="Faces"
                            @click="currentView = 'FaceDetection'"
                          />
                          <b-tab
                            title="Words"
                            @click="currentView = 'TextDetection'"
                          />
                          <b-tab
                            v-if="mediaType !== 'image'"
                            title="Cues"
                            @click="currentView = 'TechnicalCues'"
                          />
                          <b-tab
                            v-if="mediaType !== 'image'"
                            title="Shots"
                            @click="currentView = 'ShotDetection'"
                          />
                        </b-tabs>
                      </div>
                    </b-row>
                  </b-container>
                </b-tab>
                <b-tab
                  v-if="mediaType !== 'image'"
                  title="Speech Recognition"
                  @click="currentView = 'Transcript'; speechTabs = 0"
                >
                  <b-tabs
                    v-model="speechTabs"
                    content-class="mt-3"
                    fill
                  >
                    <b-tab
                      title="Transcript"
                      @click="currentView = 'Transcript'"
                    />
                    <b-tab
                      title="Translation"
                      @click="currentView = 'Translation'"
                    />
                    <b-tab
                      title="KeyPhrases"
                      @click="currentView = 'KeyPhrases'"
                    />
                    <b-tab
                      title="Entities"
                      @click="currentView = 'Entities'"
                    />
                  </b-tabs>
                </b-tab>
              </b-tabs>
            </b-row>
          </div>
          <div>
            <keep-alive>
              <component :is="currentView" :mediaType="mediaType">
                <!-- inactive components will be cached! -->
              </component>
            </keep-alive>
          </div>
        </b-col>
        <b-col>
          <div v-if="mediaType === 'image'">
            <!-- TODO: rename videoOptions since its not always a video -->
            <div v-if="videoOptions.sources[0].src === ''">
              <Loading />
            </div>
            <div v-else>
              <ImageFeature :options="videoOptions" />
            </div>
          </div>
          <div v-else>
            <div v-if="videoOptions.sources[0].src === ''">
              <Loading />
            </div>
            <div v-else>
              <VideoPlayer :options="videoOptions" />
              <div v-if="currentView === 'ShotDetection'">
                <br>
              </div>
              <div v-else-if="currentView === 'TechnicalCues'">
                <br>
              </div>
              <div v-else>
                <LineChart />
              </div>
            </div>
          </div>
          <div>
            <b-row class="mediaSummary">
              <MediaSummaryBox
                :s3Uri="s3_uri"
                :filename="filename"
                :videoUrl="videoOptions.sources[0].src"
                :mediaType="mediaType"
              />
            </b-row>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import Header from '@/components/Header.vue'
  import VideoPlayer from '@/components/VideoPlayer.vue'
  import ImageFeature from '@/components/ImageFeature.vue'
  import Loading from '@/components/Loading.vue'
  import ComponentLoadingError from '@/components/ComponentLoadingError.vue'
  import MediaSummaryBox from '@/components/MediaSummaryBox.vue'
  import LineChart from '@/components/LineChart.vue'
  import { mapState } from 'vuex'

  export default {
    name: 'Home',
    components: {
      Header,
      ComponentLoadingError,
      MediaSummaryBox,
      Loading,
      VideoPlayer,
      ImageFeature,
      LineChart,
      LabelObjects: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/LabelObjects.vue'));
        }, 1000);
        }),
        loading: Loading
      }),

      Celebrities: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/Celebrities.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      TextDetection: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/TextDetection.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      TechnicalCues: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/TechnicalCues.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      ShotDetection: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/ShotDetection.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      ContentModeration: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/ContentModeration.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      Transcript: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/Transcript.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      Translation: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/Translation.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      FaceDetection: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/FaceDetection.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      Entities: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/ComprehendEntities.vue'));
        }, 1000);
        }),
        loading: Loading,
      }),
      KeyPhrases: () => ({
        component: new Promise(function(resolve) {
          setTimeout(function() {
            resolve(import('@/components/ComprehendKeyPhrases.vue'));
        }, 1000);
        }),
        loading: Loading,
        error: ComponentLoadingError
      })
    },
    data: function () {
      return {
        s3_uri: '',
        filename: '',
        currentView: 'LabelObjects',
        showElasticSearchAlert: false,
        mlTabs: 0,
        speechTabs: 0,
        videoLoaded: false,
        supportedImageFormats: ["jpg", "jpeg", "tif", "tiff", "png", "gif"],
        mediaType: "",
        videoOptions: {
          preload: 'auto',
          loop: true,
          controls: true,
          sources: [
            {
              src: "",
              type: "video/mp4"
            }
          ]
        }
      }
    },
    computed: {
      ...mapState(['Confidence'])
    },
    created() {
          this.getAssetMetadata();
      },
    methods: {
      async getAssetMetadata () {
        let asset_id = this.$route.params.asset_id;
        let apiName = 'mieDataplaneApi';
        let path = 'metadata/' + asset_id;
        let requestOpts = {
          response: true,
        };
        try {
          let response = await this.$Amplify.API.get(apiName, path, requestOpts);
          this.s3_uri = 's3://'+response.data.results.S3Bucket+'/'+response.data.results.S3Key;
          let filename = this.s3_uri.split("/").pop();
          let fileType = filename.split('.').slice(-1)[0]
          if (this.supportedImageFormats.includes(fileType.toLowerCase()) ) {
            this.mediaType = "image"
          } else {
            this.mediaType = "video"
          }
          this.filename = filename;
          this.getVideoUrl()
        } catch (error) {
          alert(error)
          console.log(error)
        }
        this.updateAssetId();
      },
      async getVideoUrl() {
        // This function gets the video URL then initializes the video player
        const bucket = this.s3_uri.split("/")[2];
        // TODO: Get the path to the proxy mp4 from the mediaconvert operator - clarifying this comment, this should just be a from the dataplane results of the mediaconvert operator
        // Our mediaconvert operator sets proxy encode filename to [key]_proxy.mp4
        let key="";
        if (this.mediaType === "image") {
          key = this.s3_uri.split(this.s3_uri.split("/")[2] + '/')[1];
        }
        if (this.mediaType === "video") {
          const dataplane_bucket = this.s3_uri.split("/")[2]
          const input_media_key = this.s3_uri.split(dataplane_bucket)[1]
          const input_media_key_delimited = input_media_key.split("/")
          const media_filename = input_media_key_delimited[input_media_key_delimited.length - 1]
          const proxy_encode_filename = (media_filename.split(".").slice(0,-1).join('.') + "_proxy.mp4").replace("/", "");

          const proxy_encode_key = 'private/assets/' + this.$route.params.asset_id + '/' + proxy_encode_filename
          key = proxy_encode_key
        }
        // The proxy file must always be taken by the data plane bucket, even if an external bucket is defined
        const data = { "S3Bucket": this.DATAPLANE_BUCKET, "S3Key": key };

        // get presigned URL to video file in S3
        let apiName = 'mieDataplaneApi'
        let path = 'download'
        let requestOpts = {
          headers: {
          },
          body: data,
          response: true,
          queryStringParameters: {}, // optional,
          responseType: 'text'
        };
        try {
          let response = await this.$Amplify.API.post(apiName, path, requestOpts);
          this.videoOptions.sources[0].src = response.data
          this.videoLoaded = true
        } catch (error) {
          alert(error)
        }
      },
    updateAssetId () {
      this.$store.commit('updateAssetId', this.$route.params.asset_id);
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .mediaSummary {
    text-align: left;
  }

  @media screen and (max-width: 800px) {
  .dataColumns {
    flex-direction: column-reverse;
  }
}

</style>
