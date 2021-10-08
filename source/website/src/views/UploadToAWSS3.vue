<template>
  <div>
    <Header :is-upload-active="true" />
    <br>
    <b-container>
      <b-alert
        :show="dismissCountDown"
        dismissible
        variant="danger"
        @dismissed="dismissCountDown=0"
        @dismiss-count-down="countDownChanged"
      >
        {{ uploadErrorMessage }}
      </b-alert>
      <b-alert
        :show="showInvalidFile"
        variant="danger"
      >
        {{ invalidFileMessages[invalidFileMessages.length-1] }}
      </b-alert>
      <h1>Upload Content</h1>
      <p>{{ description }}</p>
      <vue-dropzone
        id="dropzone"
        ref="myVueDropzone"
        :awss3="awss3"
        :options="dropzoneOptions"
        @vdropzone-s3-upload-error="s3UploadError"
        @vdropzone-file-added="fileAdded"
        @vdropzone-removed-file="fileRemoved"
        @vdropzone-success="runWorkflow"
        @vdropzone-sending="upload_in_progress=true"
        @vdropzone-queue-complete="upload_in_progress=false"
      />
      <br>
      <b-button v-b-toggle.collapse-2 class="m-1">
        Configure Workflow
      </b-button>
      <b-button v-if="validForm && upload_in_progress===false" variant="primary" @click="uploadFiles">
        Upload and Run Workflow
      </b-button>
      <b-button v-else disabled variant="primary" @click="uploadFiles">
        Upload and Run Workflow
      </b-button>
      <br>
      <!-- TODO: add a drop-down option in this modal to choose update workflow, then update workflowConfigWithInput to include the appropriate workflow config -->
      <b-button
        :pressed="false"
        size="sm"
        variant="link"
        class="text-decoration-none"
        @click="showExecuteApi = true"
      >
        Show API request to run workflow
      </b-button>
      <b-modal
        v-model="showExecuteApi"
        scrollable
        title="REST API"
        ok-only
      >
        <label>Workflow Type:</label>
        <b-form-group>
          <b-form-radio-group
              id="curlable-workflows"
              v-model="curlWorkflow"
              name="curlable-workflows"
          >
          <b-form-radio  value="Video">Video</b-form-radio>
          <b-form-radio  value="Image">Image</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <label>Request URL:</label>
        <pre v-highlightjs><code class="bash">POST {{ WORKFLOW_API_ENDPOINT }}workflow/execution</code></pre>
        <label>Request data:</label>
        <pre v-highlightjs="JSON.stringify(workflowConfigWithInput)"><code class="json"></code></pre>
        <label>Sample command:</label>
        <p>Be sure to replace "{{ sample_file }}" with the S3 key of an actual file.</p>
        <pre v-highlightjs="curlWorkflowExecution"><code class="bash"></code></pre>
      </b-modal>
      <br>
      <span v-if="upload_in_progress" class="text-secondary">Upload in progress</span>
      <b-container v-if="upload_in_progress">
        <b-spinner label="upload_in_progress" />
      </b-container>
      <br>
      <b-collapse id="collapse-2">
        <b-container class="text-left">
          <b-card-group deck>
            <b-card header="Vision Operators">
              <b-form-group>
                <b-form-checkbox-group
                  id="checkbox-group-1"
                  v-model="enabledOperators"
                  :options="videoOperators"
                  name="flavour-1"
                ></b-form-checkbox-group>
                <label>Thumbnail position: </label>
                <b-form-input v-model="thumbnail_position" type="range" min="1" max="20" step="1"></b-form-input> {{ thumbnail_position }} sec
                <b-form-input v-if="enabledOperators.includes('genericDataLookup')" id="generic_data_filename" v-model="genericDataFilename" placeholder="Enter S3 key for data file" ></b-form-input>
                <b-button
                  v-if="enabledOperators.includes('genericDataLookup')"
                  :pressed="false"
                  size="sm"
                  variant="link"
                  class="text-decoration-none"
                  @click="showGenericOperatorHelp = true"
                >
                  How do I use generic data?
                </b-button>
                <b-modal
                  v-model="showGenericOperatorHelp"
                  scrollable
                  title="Using generic metadata"
                  ok-only
                >
                  This option allows you to use a precomputed JSON dataset as metadata for a video. The file must be located in <code>s3://{{ DATAPLANE_BUCKET }}/</code>. Specify the S3 key for your JSON file in the workflow configuration form.
                  <br><br>
                  You may upload json files alongside media files on this page. In that case, enter <code>public/upload/[filename.json]</code> as the S3 key for the data file.
                  <br><br>
                  The <code>generic_data_lookup.py</code> operator loads the specified JSON data into the asset metadata table in DynamoDB. It requires that the JSON data be a dict, not a list. Don't forget to extend the OpenSearch (aka Elasticsearch) consumer (source/consumer/lambda_handler.py) if you want the generic data to be indexed so it can be searchable and rendered in this front-end application.
                </b-modal>

                <b-form-input v-if="enabledOperators.includes('faceSearch')" id="face_collection_id" v-model="faceCollectionId" placeholder="Enter face collection id"></b-form-input>
              </b-form-group>
              <div v-if="videoFormError" style="color:red">
                {{ videoFormError }}
              </div>
            </b-card>
            <b-card header="Audio Operators">
              <b-form-group>
                <b-form-checkbox-group
                  id="checkbox-group-2"
                  v-model="enabledOperators"
                  :options="audioOperators"
                  name="flavour-2"
                ></b-form-checkbox-group>
                <div v-if="enabledOperators.includes('Transcribe')">
                  <label>Source Language</label>
                  <b-form-select v-model="transcribeLanguage" :options="transcribeLanguages"></b-form-select>
                </div>
              </b-form-group>
              <div v-if="audioFormError" style="color:red">
                {{ audioFormError }}
              </div>
            </b-card>
            <b-card header="Text Operators">
              <b-form-group>
                <b-form-checkbox-group
                  id="checkbox-group-3"
                  v-model="enabledOperators"
                  :options="textOperators"
                  name="flavour-3"
                ></b-form-checkbox-group>
                <div v-if="enabledOperators.includes('Translate')">
                  <label>Translation Source Language</label>
                  <b-form-select v-model="transcribeLanguage" :options="transcribeLanguages"></b-form-select>
                  <label>Translation Target Language</label>
                  <b-form-select v-model="targetLanguageCode" :options="translateLanguages"></b-form-select>
                </div>
                <b-form-checkbox
                  v-if="enabledOperators.includes('ComprehendEntities') || enabledOperators.includes('ComprehendKeyPhrases')"
                  v-model="ComprehendEncryption"
                >
                  Encrypt Comprehend job
                </b-form-checkbox>
                <b-form-input
                  v-if="ComprehendEncryption && (enabledOperators.includes('ComprehendEntities') || enabledOperators.includes('ComprehendKeyPhrases'))"
                  v-model="kmsKeyId"
                  placeholder="Enter KMS key ID"
                ></b-form-input>
              </b-form-group>
              <div v-if="textFormError" style="color:red">
                {{ textFormError }}
              </div>
            </b-card>
          </b-card-group>
          <div align="right">
            <button type="button" class="btn btn-link" @click="selectAll">
              Select All
            </button>
            <button type="button" class="btn btn-link" @click="clearAll">
              Clear All
            </button>
          </div>
        </b-container>
      </b-collapse>
    </b-container>
    <b-container v-if="executed_assets.length > 0">
      <label>
        Execution History
      </label>
      <b-table
        :fields="fields"
        bordered
        hover
        small
        responsive
        show-empty
        fixed
        :items="executed_assets"
      >
        <template #cell(workflow_status)="data">
          <a v-if="data.item.workflow_status !== 'Queued'" href="" @click.stop.prevent="openWindow(data.item.state_machine_console_link)">{{ data.item.workflow_status }}</a>
          <div v-if="data.item.workflow_status === 'Queued'">
            {{ data.item.workflow_status }}
          </div>
        </template>
      </b-table>
      <b-button size="sm" @click="clearHistory">
        Clear History
      </b-button>
      <br>
      <b-button
        :pressed="false"
        size="sm"
        variant="link"
        class="text-decoration-none"
        @click="showWorkflowStatusApi = true"
      >
        Show API request to get execution history
      </b-button>
      <b-modal
        v-model="showWorkflowStatusApi"
        title="REST API"
        ok-only
      >
        <label>Request URL:</label>
        <pre v-highlightjs><code class="bash">GET {{ WORKFLOW_API_ENDPOINT }}workflow/execution/asset/{asset_id}</code></pre>
        <label>Sample command:</label>
        <p>Be sure to replace <b>{asset_id}</b> with a valid asset ID.</p>
        <pre v-highlightjs="curlExecutionHistory"><code class="bash"></code></pre>
      </b-modal>
    </b-container>
  </div>
</template>

<script>
import vueDropzone from '@/components/vue-dropzone.vue';
import Header from '@/components/Header.vue'
import { mapState } from 'vuex'

export default {
  components: {
    vueDropzone,
    Header
  },
  data() {
    return {
      restApi2: '',
      curlWorkflow: 'Video',
      curlWorkflowTypes: ["Image", "Video"],
      showWorkflowStatusApi: false,
      showExecuteApi: false,
      showGenericOperatorHelp: false,
      requestURL: "",
      requestBody: "",
      requestType: "",
      fields: [
        {
          'asset_id': {
            label: "Asset Id",
            sortable: false
          }
        },
        {
          'file_name': {
            label: "File Name",
            sortable: false
          }
        },
        { 'workflow_status': {
            label: 'Workflow Status',
            sortable: false
          }
        }
      ],
      thumbnail_position: 10,
      invalid_file_types: 0,
      upload_in_progress: false,
      enabledOperators: [
        "labelDetection",
        "celebrityRecognition",
        "textDetection",
        "contentModeration",
        "faceDetection",
        "thumbnail",
        "TranscribeVideo",
        "Translate",
        "ComprehendKeyPhrases",
        "ComprehendEntities",
        "shotDetection",
        "technicalCueDetection"
      ],
      videoOperators: [
        { text: "Object Detection", value: "labelDetection" },
        { text: "Technical Cue Detection", value: "technicalCueDetection" },
        { text: "Shot Detection", value: "shotDetection" },
        { text: "Celebrity Recognition", value: "celebrityRecognition" },
        { text: "Content Moderation", value: "contentModeration" },
        { text: "Face Detection", value: "faceDetection" },
        { text: "Word Detection", value: "textDetection" },
        { text: "Face Search", value: "faceSearch" },
        { html: "Generic Data Lookup", value: "genericDataLookup" },
      ],
      audioOperators: [{ text: "Transcribe", value: "TranscribeVideo" }],
      textOperators: [
        { text: "Comprehend Key Phrases", value: "ComprehendKeyPhrases" },
        { text: "Comprehend Entities", value: "ComprehendEntities" },
        { text: "Translate", value: "Translate" }
      ],
      faceCollectionId: "",
      genericDataFilename: "",
      ComprehendEncryption: false,
      kmsKeyId: "",
      transcribeLanguage: "en-US",
      transcribeLanguages: [
        {text: 'Arabic, Gulf', value: 'ar-AE'},
        {text: 'Arabic, Modern Standard', value: 'ar-SA'},
        {text: 'Chinese Mandarin', value: 'zh-CN'},
        {text: 'Dutch', value: 'nl-NL'},
        {text: 'English, Australian', value: 'en-AU'},
        {text: 'English, British', value: 'en-GB'},
        {text: 'English, Indian-accented', value: 'en-IN'},
        {text: 'English, Irish', value: 'en-IE'},
        {text: 'English, Scottish', value: 'en-AB'},
        {text: 'English, US', value: 'en-US'},
        {text: 'English, Welsh', value: 'en-WL'},
        // Disabled until 'fa' supported by AWS Translate
        // {text: 'Farsi', value: 'fa-IR'},
        {text: 'French', value: 'fr-FR'},
        {text: 'French, Canadian', value: 'fr-CA'},
        {text: 'German', value: 'de-DE'},
        {text: 'German, Swiss', value: 'de-CH'},
        {text: 'Hebrew', value: 'he-IL'},
        {text: 'Hindi', value: 'hi-IN'},
        {text: 'Indonesian', value: 'id-ID'},
        {text: 'Italian', value: 'it-IT'},
        {text: 'Japanese', value: 'ja-JP'},
        {text: 'Korean', value: 'ko-KR'},
        {text: 'Malay', value: 'ms-MY'},
        {text: 'Portuguese', value: 'pt-PT'},
        {text: 'Portuguese, Brazilian', value: 'pt-BR'},
        {text: 'Russian', value: 'ru-RU'},
        {text: 'Spanish', value: 'es-ES'},
        {text: 'Spanish, US', value: 'es-US'},
        {text: 'Tamil', value: 'ta-IN'},
        // Disabled until 'te' supported by AWS Translate
        // {text: 'Telugu', value: 'te-IN'},
        {text: 'Turkish', value: 'tr-TR'},
      ],
      translateLanguages: [
        {text: 'Afrikaans', value: 'af'},
        {text: 'Albanian', value: 'sq'},
        {text: 'Amharic', value: 'am'},
        {text: 'Arabic', value: 'ar'},
        {text: 'Azerbaijani', value: 'az'},
        {text: 'Bengali', value: 'bn'},
        {text: 'Bosnian', value: 'bs'},
        {text: 'Bulgarian', value: 'bg'},
        {text: 'Chinese (Simplified)', value: 'zh'},
        // AWS Translate does not support translating from zh to zh-TW
        // {text: 'Chinese (Traditional)', value: 'zh-TW'},
        {text: 'Croatian', value: 'hr'},
        {text: 'Czech', value: 'cs'},
        {text: 'Danish', value: 'da'},
        {text: 'Dari', value: 'fa-AF'},
        {text: 'Dutch', value: 'nl'},
        {text: 'English', value: 'en'},
        {text: 'Estonian', value: 'et'},
        {text: 'Finnish', value: 'fi'},
        {text: 'French', value: 'fr'},
        {text: 'French (Canadian)', value: 'fr-CA'},
        {text: 'Georgian', value: 'ka'},
        {text: 'German', value: 'de'},
        {text: 'Greek', value: 'el'},
        {text: 'Hausa', value: 'ha'},
        {text: 'Hebrew', value: 'he'},
        {text: 'Hindi', value: 'hi'},
        {text: 'Hungarian', value: 'hu'},
        {text: 'Indonesian', value: 'id'},
        {text: 'Italian', value: 'it'},
        {text: 'Japanese', value: 'ja'},
        {text: 'Korean', value: 'ko'},
        {text: 'Latvian', value: 'lv'},
        {text: 'Malay', value: 'ms'},
        {text: 'Norwegian', value: 'no'},
        {text: 'Persian', value: 'fa'},
        {text: 'Pashto', value: 'ps'},
        {text: 'Polish', value: 'pl'},
        {text: 'Portuguese', value: 'pt'},
        {text: 'Romanian', value: 'ro'},
        {text: 'Russian', value: 'ru'},
        {text: 'Serbian', value: 'sr'},
        {text: 'Slovak', value: 'sk'},
        {text: 'Slovenian', value: 'sl'},
        {text: 'Somali', value: 'so'},
        {text: 'Spanish', value: 'es'},
        {text: 'Swahili', value: 'sw'},
        {text: 'Swedish', value: 'sv'},
        {text: 'Tagalog', value: 'tl'},
        {text: 'Tamil', value: 'ta'},
        {text: 'Thai', value: 'th'},
        {text: 'Turkish', value: 'tr'},
        {text: 'Ukrainian', value: 'uk'},
        {text: 'Urdu', value: 'ur'},
        {text: 'Vietnamese', value: 'vi'},
      ],
      sourceLanguageCode: "en",
      targetLanguageCode: "es",
      uploadErrorMessage: "",
      invalidFileMessage: "",
      invalidFileMessages: [],
      showInvalidFile: false,
      dismissSecs: 8,
      dismissCountDown: 0,
      executed_assets: [],
      workflow_status_polling: null,
      workflow_config: {},
      description: "Click start to begin. Media analysis status will be shown after upload completes.",
      s3_destination: 's3://' + this.DATAPLANE_BUCKET,
      dropzoneOptions: {
        url: 'https://' + this.DATAPLANE_BUCKET + '.s3.amazonaws.com',
        thumbnailWidth: 200,
        addRemoveLinks: true,
        autoProcessQueue: false,
        // disable network timeouts (important for large uploads)
        timeout: 0,
        // limit max upload file size (in MB)
        maxFilesize: 5000,
      },
      awss3: {
        signingURL: '',
        headers: {},
        params: {}
      }
    }
  },
  computed: {
    ...mapState(['execution_history']),
    textFormError() {
      return "";
    },
    audioFormError() {
      // Validate transcribe is enabled if any text operator is enabled
      if (
          !this.enabledOperators.includes("TranscribeVideo") &&
          (this.enabledOperators.includes("Translate") ||
              this.enabledOperators.includes("ComprehendEntities") ||
              this.enabledOperators.includes("ComprehendKeyPhrases"))
      ) {
        return "Transcribe must be enabled if any text operator is enabled.";
      }
      return "";
    },
    videoFormError() {
      // Validate face collection ID if face search is enabled
      if (this.enabledOperators.includes("faceSearch")) {
        // Validate that the collection ID is defined
        if (this.faceCollectionId === "") {
          return "Face collection name is required.";
        }
        // Validate that the collection ID matches required regex
        else if (new RegExp("[^a-zA-Z0-9_.\\-]").test(this.faceCollectionId)) {
          return "Face collection name must match pattern [a-zA-Z0-9_.\\\\-]+";
        }
        // Validate that the collection ID is not too long
        else if (this.faceCollectionId.length > 255) {
          return "Face collection name must have fewer than 255 characters.";
        }
      }
      if (this.enabledOperators.includes("genericDataLookup")) {
        // Validate that the collection ID is defined
        if (this.genericDataFilename === "") {
          return "Generic data filename is required.";
        }
        // Validate that the collection ID matches required regex
        else if (!new RegExp("^.+\\.json$").test(this.genericDataFilename)) {
          return "Generic data filename must have .json extension.";
        }
        // Validate that the data filename is not too long
        else if (this.genericDataFilename.length > 255) {
          return "Generic data filename must have fewer than 255 characters.";
        }
      }
      return "";
    },
    validForm() {
      let validStatus = true;
      if (
          this.invalid_file_types ||
          this.textFormError ||
          this.audioFormError ||
          this.videoFormError
      )
        validStatus = false;
      return validStatus;
    },
    imageWorkflowConfig() {
      // Define the image workflow based on user specified options for workflow configuration.
      const ValidationStage = {
        MediainfoImage: {
          Enabled: true
        }
      }
      const RekognitionStage = {
        faceSearchImage: {
          Enabled: this.enabledOperators.includes("faceSearch"),
          CollectionId:
              this.faceCollectionId === ""
                  ? "undefined"
                  : this.faceCollectionId
        },
        labelDetectionImage: {
          Enabled: this.enabledOperators.includes("labelDetection")
        },
        textDetectionImage: {
          Enabled: this.enabledOperators.includes("textDetection")
        },
        celebrityRecognitionImage: {
          Enabled: this.enabledOperators.includes(
              "celebrityRecognition"
          )
        },
        contentModerationImage: {
          Enabled: this.enabledOperators.includes("contentModeration")
        },
        faceDetectionImage: {
          Enabled: this.enabledOperators.includes("faceDetection")
        }
      }
      const workflow_config = {
        Name: "CasImageWorkflow",
      }
      workflow_config["Configuration"] = {}
      workflow_config["Configuration"]["ValidationStage"] = ValidationStage
      workflow_config["Configuration"]["RekognitionStage"] = RekognitionStage
      return workflow_config
    },
    videoWorkflowConfig() {
      // Define the video workflow based on user specified options for workflow configuration.
      const defaultPrelimVideoStage = {
        Thumbnail: {
          ThumbnailPosition: this.thumbnail_position.toString(),
          Enabled: true
        },
        Mediainfo: {
          Enabled: true
        }
      }
      const defaultVideoStage = {
        faceDetection: {
          Enabled: this.enabledOperators.includes("faceDetection")
        },
        technicalCueDetection: {
          Enabled: this.enabledOperators.includes("technicalCueDetection")
        },
        shotDetection: {
          Enabled: this.enabledOperators.includes("shotDetection")
        },
        celebrityRecognition: {
          Enabled: this.enabledOperators.includes("celebrityRecognition")
        },
        labelDetection: {
          Enabled: this.enabledOperators.includes("labelDetection")
        },
        contentModeration: {
          Enabled: this.enabledOperators.includes("contentModeration")
        },
        faceSearch: {
          Enabled: this.enabledOperators.includes("faceSearch"),
          CollectionId:
              this.faceCollectionId === ""
                  ? "undefined"
                  : this.faceCollectionId
        },
        textDetection: {
          Enabled: this.enabledOperators.includes("textDetection")
        },
        GenericDataLookup: {
          Enabled: this.enabledOperators.includes("genericDataLookup"),
          Bucket: this.DATAPLANE_BUCKET,
          Key:
              this.genericDataFilename === ""
                  ? "undefined"
                  : this.genericDataFilename
        }
      }
      const defaultAudioStage = {
        TranscribeVideo: {
          Enabled: this.enabledOperators.includes("TranscribeVideo"),
          TranscribeLanguage: this.transcribeLanguage
        }
      }
      const defaultTextStage = {
        Translate: {
          Enabled: this.enabledOperators.includes("Translate"),
          SourceLanguageCode: this.transcribeLanguage.split("-")[0],
          TargetLanguageCode: this.targetLanguageCode
        },
        ComprehendEntities: {
          Enabled: this.enabledOperators.includes("ComprehendEntities")
        },
        ComprehendKeyPhrases: {
          Enabled: this.enabledOperators.includes("ComprehendKeyPhrases")
        }
      }
      if (this.ComprehendEncryption === true && this.kmsKeyId.length > 0) {
        defaultTextStage["ComprehendEntities"]["KmsKeyId"] = this.kmsKeyId
        defaultTextStage["ComprehendKeyPhrases"]["KmsKeyId"] = this.kmsKeyId
      }
      const defaultTextSynthesisStage = {
        // Polly is available in the MIECompleteWorkflow but not used in the front-end, so we've disabled it here.
        Polly: {
          Enabled: false
        }
      }
      const workflow_config = {
        Name: "CasVideoWorkflow",
      }
      workflow_config["Configuration"] = {}
      workflow_config["Configuration"]["defaultPrelimVideoStage"] = defaultPrelimVideoStage
      workflow_config["Configuration"]["defaultVideoStage"] = defaultVideoStage
      workflow_config["Configuration"]["defaultAudioStage"] = defaultAudioStage
      workflow_config["Configuration"]["defaultTextStage"] = defaultTextStage
      workflow_config["Configuration"]["defaultTextSynthesisStage"] = defaultTextSynthesisStage
      return workflow_config
    },
    curlWorkflowExecution() {
      // get curl command to request workflow execution
      return 'awsscurl -X POST --region '+ this.AWS_REGION +' -H "Content-Type: application/json" --data \''+JSON.stringify(this.workflowConfigWithInput)+'\' '+this.WORKFLOW_API_ENDPOINT+'workflow/execution'
    },
    sample_file() {
      if (this.curlWorkflow === "Video") {
        return "SAMPLE_VIDEO.MP4"
      }
      else if (this.curlWorkflow === "Image") {
        return "SAMPLE_IMAGE.PNG"
      }
    },
    curlExecutionHistory() {
      // get curl command to request execution history
      return 'awscurl -X GET --region '+ this.AWS_REGION +' -H "Content-Type: application/json" '+this.WORKFLOW_API_ENDPOINT+'workflow/execution/asset/{asset_id}'
    },
    workflowConfigWithInput() {
      // This function is just used to pretty print the rest api
      // for workflow execution in a popup modal
      let data = {}
      if (this.curlWorkflow === "Video") {
        data = JSON.parse(JSON.stringify(this.videoWorkflowConfig));
        data["Name"] = "CasVideoWorkflow"
      }
      else if (this.curlWorkflow === "Image") {
        data = JSON.parse(JSON.stringify(this.imageWorkflowConfig));
        data["Name"] = "CasImageWorkflow"
      }
      data["Input"] = {
        "Media": {
          "Video": {
            "S3Bucket": this.DATAPLANE_BUCKET,
            "S3Key": this.sample_file
          }
        }
      }
      return data
    }
  },
  created: function() {
    if (this.$route.query.asset) {
      this.hasAssetParam = true;
      this.assetIdParam = this.$route.query.asset;
    }
  },
  mounted: function() {
    this.executed_assets = this.execution_history;
    this.pollWorkflowStatus();
  },
  beforeDestroy () {
    clearInterval(this.workflow_status_polling)
  },
  methods: {
    selectAll: function() {
      this.enabledOperators = [
        "labelDetection",
        "textDetection",
        "celebrityRecognition",
        "contentModeration",
        "faceDetection",
        "thumbnail",
        "TranscribeVideo",
        "Translate",
        "ComprehendKeyPhrases",
        "ComprehendEntities",
        "technicalCueDetection",
        "shotDetection"
      ];
      console.log(this.enabledOperators)
    },
    clearAll: function() {
      this.enabledOperators = [];
    },
    openWindow: function(url) {
      window.open(url, "noopener,noreferer");
    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    s3UploadError(error) {
      console.log(error);
      // display alert
      this.uploadErrorMessage = error;
      this.dismissCountDown = this.dismissSecs;
    },
    fileAdded: function( file )
    {
      let errorMessage = '';
      if (!(file.type).match(/image\/.+|video\/.+|application\/mxf|application\/json/g)) {
        if (file.type === "")
          errorMessage = "Unsupported file type: unknown";
        else
          errorMessage = "Unsupported file type: " + file.type;
        this.invalidFileMessages.push(errorMessage);
        this.showInvalidFile = true
      }
    },
    fileRemoved: function( file )
    {
      let errorMessage = '';
      if (!(file.type).match(/image\/.+|video\/.+|application\/mxf|application\/json/g)) {
        if (file.type === "")
          errorMessage = "Unsupported file type: unknown";
        else
          errorMessage = "Unsupported file type: " + file.type;
      }
      this.invalidFileMessages = this.invalidFileMessages.filter(function(value){ return value != errorMessage})
      if (this.invalidFileMessages.length === 0 ) this.showInvalidFile = false;
    },
    runWorkflow: async function(file) {
      const vm = this;
      let media_type = null;
      let s3Key = null;
      if ("s3_key" in file) {
        media_type = file.type;
        s3Key = file.s3_key; // add in public since amplify prepends that to all keys
      } else {
        media_type = this.$route.query.mediaType;
        s3Key = this.$route.query.s3key.split("/").pop();
      }
      if (this.hasAssetParam) {
        if (media_type === "video") {
          this.workflow_config = vm.videoWorkflowConfig;
          this.workflow_config["Input"] = { AssetId: this.assetIdParam, Media: { Video: {} } };
        } else if (media_type === "image") {
          this.workflow_config = vm.imageWorkflowConfig;
          this.workflow_config["Input"] = { AssetId: this.assetIdParam, Media: { Image: {} } };
        } else {
          vm.s3UploadError(
              "Unsupported media type, " + this.$route.query.mediaType + "."
          );
        }
      } else {
        if (media_type.match(/image/g)) {
          this.workflow_config = vm.imageWorkflowConfig;
          this.workflow_config["Input"] = {
            Media: {
              Image: {
                S3Bucket: this.DATAPLANE_BUCKET,
                S3Key: s3Key
              }
            }
          }
        } else if (
            media_type.match(/video/g) || media_type === "application/mxf"
        ) {
          this.workflow_config = vm.videoWorkflowConfig;
          this.workflow_config["Input"] = {
            Media: {
              Video: {
                S3Bucket: this.DATAPLANE_BUCKET,
                S3Key: s3Key
              }
            }
          };
        } else if (media_type === "application/json") {
          // JSON files may be uploaded for the genericDataLookup operator, but
          // we won't run a workflow for json file types.
          //console.log("Data file has been uploaded to s3://" + location.s3ObjectLocation.fields.key);
          return;
        } else {
          vm.s3UploadError("Unsupported media type: " + media_type + ".");
        }
      }
      console.log("workflow execution configuration:")
      console.log(JSON.stringify(this.workflow_config))
      let apiName = 'mieWorkflowApi'
      let path = 'workflow/execution'
      let requestOpts = {
        headers: {
          'Content-Type': 'application/json'
        },
        response: true,
        body: this.workflow_config,
        queryStringParameters: {} // optional
      };
      try {
        let response = await this.$Amplify.API.post(apiName, path, requestOpts);
        let asset_id = response.data.AssetId;
        let wf_id = response.data.Id;
        let executed_asset = {
          asset_id: asset_id,
          file_name: s3Key.replace('public/upload/', ''),
          workflow_status: "",
          state_machine_console_link: "",
          wf_id: wf_id
        };
        vm.executed_assets.push(executed_asset);
        vm.getWorkflowStatus(wf_id);
        this.hasAssetParam = false;
        this.assetIdParam = "";
      } catch (error) {
        console.log(
            "ERROR: Failed to start workflow. Check Workflow API logs."
        );
        console.log(error)
      }
    },
    async getWorkflowStatus(wf_id) {
      const vm = this;
      let apiName = 'mieWorkflowApi'
      let path =  "workflow/execution/" + wf_id
      let requestOpts = {
        headers: {},
        response: true,
        queryStringParameters: {} // optional
      };
      try {
        let response = await this.$Amplify.API.get(apiName, path, requestOpts);
        for (let i = 0; i < vm.executed_assets.length; i++) {
          if (vm.executed_assets[i].wf_id === wf_id) {
            vm.executed_assets[i].workflow_status = response.data.Status;
            vm.executed_assets[i].state_machine_console_link =
                "https://" + this.AWS_REGION + ".console.aws.amazon.com/states/home?region=" + this.AWS_REGION + "#/executions/details/" + response.data.StateMachineExecutionArn;
            break;
          }
        }
        this.$store.commit("updateExecutedAssets", vm.executed_assets);
      } catch (error) {
        console.log("ERROR: Failed to get workflow status");
        console.log(error)
      }
    },
    pollWorkflowStatus() {
      // Poll frequency in milliseconds
      const poll_frequency = 5000;
      this.workflow_status_polling = setInterval(() => {
        this.executed_assets.forEach(item => {
          if (
              item.workflow_status === "" ||
              item.workflow_status === "Started" ||
              item.workflow_status === "Queued"
          ) {
            this.getWorkflowStatus(item.wf_id);
          }
        });
      }, poll_frequency);
    },
    uploadFiles() {
      console.log("Uploading to s3://" + this.DATAPLANE_BUCKET,);
      this.$refs.myVueDropzone.processQueue();
    },
    clearHistory() {
      this.executed_assets = [];
      this.$store.commit('updateExecutedAssets', this.executed_assets);

    }
  }
}
</script>
<style>
input[type=text] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
}

label {
  font-weight: bold;
}

.note {
  color: red;
  font-family: "Courier New"
}
</style>
