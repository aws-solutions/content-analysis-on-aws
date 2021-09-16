# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2021-6-15

- Bug fix: Support filenames with multiple periods
- Bug fix: Support text detection in images
- Bug fix: Upgrade axios package to resolve security deficiency
- Bug fix: Use the Elasticsearch node size specified by the user if it is specified
- Bug fix: Use correct units for video bit rate in Media Summary box
- Bug fix: Use correct units for video bit rate and video frame rate in the GUI.
- Bug fix: Disable the person tracking operator by default since it is not used in the GUI.
- New feature: Add a modal in the GUI to show users how to use the search api via the command line (#37)
- New feature: Replace Amazon Elasticsearch Service with Amazon OpenSearch Service (#28)
- New feature: Decouple MIE from the content analysis code base. This leads to a greatly simplified code base for content analysis, and reduces the burden of upgrading.
- New feature: Add configurations for automated code scanning tools, viperlight and cfn_nag. 
- New feature: Add GitHub action for automated build, deploy, and UI testing.
- New feature: Allow users to control playback speed in the video player.
- New feature: Allow users to enable encryption with custom KMS keys for Amazon Comprehend.
- New feature: Include the cloud formation stack name in the invitation email
- Documentation: Update docs to include info on error handling, XRay tracing, and cost
- Documentation: Explain how to get the URL for the user interface in the README
- Documentation: Explain how to add new user accounts (#36)
- Documentation: Explain how to invoke workflows from the command line in the README.
- Security: Require builders to acknowledge anti-snipping advice before uploading build-from-scratch resources to S3 (#39)
- Security: Disallow non-secure transport on the base web endpoint (#40)
- Security: Add anti-snipping protection to the build script (#20)

## [1.0.2] - 2020-10-15

- New feature: Put the solution ID in the cloud formation template description for better monitoring
- New feature: Allow users to upload mxf video file types.
- Bug fix: Prevent video.js errors by loading the proxy video in the video.js player
- Bug fix: Allow uploaded filenames to contain special characters.
- Bug fix: Use correct units for video bit rate and video frame rate in the GUI.
- Bug fix: Disable the person tracking operator by default since it is not used in the GUI.

## [1.0.1] - 2020-07-27

- Added "states:DescribeStateMachine" IAM policy to the custom resource lambda function that deploys MIE workflows. This fixes a fatal IAM error that breaks the deployment of RekognitionWorkflow and KitchenSinkWorkflow.


## [1.0.0] - 2019-07-27
- Initial release.


