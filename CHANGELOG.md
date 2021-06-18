# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2021-6-15

- Bug fix: Support filenames with multiple periods
- Bug fix: Support text detection in images
- Bug fix: Upgrade axios package to resolve security deficiency
- Bug fix: Use the Elasticsearch node size specified by the user if it is specified
- Bug fix: Use correct units for video bit rate in Media Summary box
- Bug fix: Use correct units for video bit rate and video frame rate in the GUI.
- Bug fix: Disable the person tracking operator by default since it is not used in the GUI.
- New feature: Decouple MIE from the content analysis code base. This leads to a greatly simplified code base for content analysis, and reduces the burden of upgrading.
- New feature: Add configurations for automated code scanning tools, viperlight and cfn_nag. 
- New feature: Add GitHub action for automated build, deploy, and UI testing.
- New feature: Allow users to control playback speed in the video player.
- New feature: Allow users to enable encryption with custom KMS keys for Amazon Comprehend.
- New feature: Include the cloud formation stack name in the invitation email
- Documentation: Update docs to include info on error handling, XRay tracing, and cost
- Documentation: Explain how to get the URL for the user interface in the README
- Documentation: Explain how to invoke workflows from the command line in the README.

### Added
- ./.viperlightignore
- ./buildspec.yml
- ./deployment/aws-content-analysis-video-workflow.yaml
- ./deployment/aws-content-analysis-use-existing-mie-stack.yaml
- ./deployment/aws-content-analysis.yaml
- ./deployment/aws-content-analysis-image-workflow.yaml
- ./deployment/aws-content-analysis-auth.yaml
- ./deployment/aws-content-analysis-web.yaml
- ./deployment/aws-content-analysis-elasticsearch.yaml
- ./github/workflows/pr-workflow.yml
- ./source/website/test/Dockerfile
- ./source/website/test/screenshot14_configure_workflow_form_clear_all.png
- ./source/website/test/README.md
- ./source/website/test/screenshot13_configure_workflow_form_default.png
- ./source/website/test/screenshot15_configure_workflow_form_select_all.png
- ./source/website/test/app.js
- ./source/website/public/index.html
- ./source/website/public/img
- ./source/website/public/img/icons
- ./source/website/public/img/icons/favicon-16x16.png
- ./source/website/public/runtimeConfig.json
- ./source/website/public/manifest.json
- ./source/website/public/robots.txt
- ./source/website/babel.config.js
- ./source/website/package-lock.json
- ./source/website/package.json
- ./source/website/vue.config.js
- ./source/website/src/App.vue
- ./source/website/src/main.js
- ./source/website/src/components
- ./source/website/src/components/TechnicalCues.vue
- ./source/website/src/components/Celebrities.vue
- ./source/website/src/components/Translation.vue
- ./source/website/src/components/Transcript.vue
- ./source/website/src/components/LabelObjects.vue
- ./source/website/src/components/ShotDetection.vue
- ./source/website/src/components/FaceDetection.vue
- ./source/website/src/components/ComprehendEntities.vue
- ./source/website/src/components/ComponentLoadingError.vue
- ./source/website/src/components/ContentModeration.vue
- ./source/website/src/components/ImageFeature.vue
- ./source/website/src/components/Header.vue
- ./source/website/src/components/VideoPlayer.vue
- ./source/website/src/components/Loading.vue
- ./source/website/src/components/TextDetection.vue
- ./source/website/src/components/MediaSummaryBox.vue
- ./source/website/src/components/vue-dropzone.vue
- ./source/website/src/components/LineChart.vue
- ./source/website/src/components/VideoThumbnail.vue
- ./source/website/src/components/ComprehendKeyPhrases.vue
- ./source/website/src/router.js
- ./source/website/src/static
- ./source/website/src/static/favicon.ico
- ./source/website/src/registerServiceWorker.js
- ./source/website/src/views
- ./source/website/src/views/UploadToAWSS3.vue
- ./source/website/src/views/Login.vue
- ./source/website/src/views/Analysis.vue
- ./source/website/src/views/Collection.vue
- ./source/website/src/services
- ./source/website/src/services/urlsigner.js
- ./source/website/src/store
- ./source/website/src/store/mutations.js
- ./source/website/src/store/actions.js
- ./source/website/src/store/index.js
- ./source/website/src/store/state.js
- ./source/consumer/requirements.txt
- ./source/consumer/lambda_handler.py
- ./source/consumer/package
- ./source/helper/website_helper.py
- ./source/helper/webapp-manifest.json

### Changed
- ./CHANGELOG.md
- ./README.md
- ./deployment/build-s3.dist.sh
- ./deployment/build-open-source.sh

### Removed
- ./aws-content-analysis/
- ./aws-content-analysis.zip
- ./deployment/media-insights-dataplane-streaming-stack.yaml
- ./deployment/media-insights-webapp.yaml
- ./deployment/media-insights-elasticsearch.yaml
- ./deployment/string.yaml
- ./deployment/MieCompleteWorkflow.yaml
- ./deployment/rekognition.yaml
- ./source/workflowapi/
- ./source/anonymous-data-logger/
- ./source/operators/
- ./source/lambda_layer_factory/
- ./source/website/package-lock.json
- ./source/webapp/

## [1.0.2] - 2020-10-15

New feature: Put the solution ID in the cloud formation template description for better monitoring
New feature: Allow users to upload mxf video file types.
Bug fix: Prevent video.js errors by loading the proxy video in the video.js player
Bug fix: Allow uploaded filenames to contain special characters.
Bug fix: Use correct units for video bit rate and video frame rate in the GUI.
Bug fix: Disable the person tracking operator by default since it is not used in the GUI.

### Added
- Nothing

### Changed
- deployment/aws-content-analysis.yaml
- source/operators/rekognition/start_celebrity_recognition.py
- source/operators/rekognition/start_content_moderation.py
- source/operators/rekognition/start_face_detection.py
- source/operators/rekognition/start_face_search.py
- source/operators/rekognition/start_label_detection.py
- source/operators/rekognition/start_person_tracking.py
- source/operators/transcribe/start_transcribe.py
- source/webapp/src/components/MediaSummaryBox.vue
- source/webapp/src/views/Analysis.vue
- source/webapp/src/views/UploadToAWSS3.vue
- source/workflowapi/app.py

### Removed
- Nothing. 

## [1.0.1] - 2020-07-27
### Added
- Nothing

### Changed
- Added "states:DescribeStateMachine" IAM policy to the custom resource lambda function that deploys MIE workflows. This fixes a fatal IAM error that breaks the deployment of RekognitionWorkflow and KitchenSinkWorkflow.

### Removed
- Nothing. 

## [1.0.0] - 2019-07-27
- Initial release.

### Added
- Everything.

### Changed
- Nothing. This is the first release.

### Removed
- Nothing. This is the first release.

