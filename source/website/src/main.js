import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs'
import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'dropzone/dist/min/dropzone.min.css'
import "highlight.js/styles/github.css"

import App from './App.vue'
import store from './store'
import router from './router.js'
import Amplify, * as AmplifyModules from "aws-amplify";
import { AmplifyPlugin } from "aws-amplify-vue";

const getRuntimeConfig = async () => {
  const runtimeConfig = await fetch('/runtimeConfig.json');
  return await runtimeConfig.json()
};

getRuntimeConfig().then(function(json) {
  const awsconfig = {
    Auth: {
      region: json.AWS_REGION,
      userPoolId: json.USER_POOL_ID,
      userPoolWebClientId: json.USER_POOL_CLIENT_ID,
      identityPoolId: json.IDENTITY_POOL_ID
    },
    Storage: {
      AWSS3: {
        bucket: json.DATAPLANE_BUCKET,
        region: json.AWS_REGION
      }
    },
    API: {
      endpoints: [
        {
          name: "contentAnalysisElasticsearch",
          endpoint: json.ELASTICSEARCH_ENDPOINT,
          service: "es",
          region: json.AWS_REGION
        },
        {
          name: "mieWorkflowApi",
          endpoint: json.WORKFLOW_API_ENDPOINT,
          service: "execute-api",
          region: json.AWS_REGION
        },
        {
          name: "mieDataplaneApi",
          endpoint: json.DATAPLANE_API_ENDPOINT,
          service: "execute-api",
          region: json.AWS_REGION
        }
      ]
    }
  };
  console.log("Runtime config: " + JSON.stringify(json));
  Amplify.configure(awsconfig);
  Vue.config.productionTip = false;
  Vue.mixin({
    data() {
      return {
        // Distribute runtime configs into every Vue component
        ELASTICSEARCH_ENDPOINT: json.ELASTICSEARCH_ENDPOINT,
        DATAPLANE_API_ENDPOINT: json.DATAPLANE_API_ENDPOINT,
        DATAPLANE_BUCKET: json.DATAPLANE_BUCKET,
        WORKFLOW_API_ENDPOINT: json.WORKFLOW_API_ENDPOINT,
        AWS_REGION: json.AWS_REGION
      }
    },
  });

  Vue.use(AmplifyPlugin, AmplifyModules);
  Vue.use(BootstrapVue);
  Vue.use(VueHighlightJS)

  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')
});
