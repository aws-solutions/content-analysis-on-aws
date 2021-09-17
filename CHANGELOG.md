# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [2.0.0] - 2021-08-31

This release contains the code published for v2.0.0 of the [AWS Content Analysis solution](https://aws.amazon.com/solutions/implementations/aws-content-analysis/). The most notable change in this release is the decoupling of the Media Insights Engine (MIE)  from the code base for Content Analysis. This change decreased technical debt and improved code maintainability.

The comprehensive list of changes in this release are summarized below:

UI/UX:
- New feature: Allow users to control playback speed in the video player.
- New feature: Include the cloud formation stack name in the invitation email
- New feature: Add a modal in the GUI to show users how to use the search api via the command line (#37)
- Bug fix: Support filenames with multiple periods
- Bug fix: Support text detection in images
- Bug fix: Use correct units for video bit rate in Media Summary box
- Bug fix: Use correct units for video bit rate and video frame rate in the GUI.
- Bug fix: Disable the person tracking operator by default since it is not used in the GUI.

Security:
- New feature: Add configurations for automated code scanning tools, viperlight and cfn_nag.
- New feature: Allow users to enable encryption with custom KMS keys for Amazon Comprehend.
- New feature: Add anti-snipping protection to the build script (#20)
- New feature: Require builders to acknowledge S3 best-practices before uploading code and templates to S3 (#39)
- New feature: Disallow non-secure transport on the base web endpoint (#40)

Back-end:
- New feature: Decouple MIE from the content analysis code base. This leads to a greatly simplified code base for content analysis, and reduces the burden of upgrading.
- New feature: Replace Amazon Elasticsearch Service with Amazon OpenSearch Service (#28)
- New feature: Increment backend implementation to MIE v3.0.2
- Bug fix: Fix Elasticsearch incompatibility error (#31)
- Bug fix: Upgrade axios package to resolve security deficiency
- Bug fix: Use the Elasticsearch node size specified by the user if it is specified

Devops:
- New feature: Add GitHub action for automated build, deploy, and UI testing.

Documentation:
- New feature: Update docs to include info on error handling, XRay tracing, and cost
- New feature: Explain how to get the URL for the user interface in the README
- New feature: Explain how to add new user accounts (#36)
- New feature: Explain how to invoke workflows from the command line in the README.


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


