# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.5] - 2021-6-15

Bug fix: Support filenames with multiple periods
Bug fix: Support text detection in images
Bug fix: Upgrade axios package to resolve security deficiency
Bug fix: Use the Elasticsearch node size specified by the user if it is specified
New feature: Decouple MIE from the content analysis code base. This leads to a greatly simplified code base for content analysis, and reduces the burden of upgrading.
Update docs to include info on error handling, XRay tracing, and cost
New feature: Allow users to users to control playback speed in the video player.
New feature: Allow users to enable encryption with custom KMS keys for Amazon Comprehend.
New feature: Include the cloud formation stack name in the invitation email
Bug fix: Use correct units for video bit rate in Media Summary box
Documentation: Explain how to get the URL for the user interface in the README
Documentation: Explain how to invoke workflows from the command line in the README.
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

