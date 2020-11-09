# AWS Content Analysis Solution

This repository includes the source code for the AWS Content Analysis solution. This solution combines Amazon Rekognition, Amazon Transcribe, Amazon Translate, and Amazon Comprehend to offer an integrated suite of capabilities for cataloging and analyzing videos. This solution was built using the [Media Insights Engine](https://github.com/awslabs/aws-media-insights-engine).

The documentation for this solution can be found in the following locations:

* Landing page: https://aws.amazon.com/solutions/implementations/aws-content-analysis/
* PDF: https://s3.amazonaws.com/solutions-reference/aws-content-analysis/latest/aws-content-analysis.pdf
* HTML guide: https://docs.aws.amazon.com/solutions/latest/aws-content-analysis/
 
# Screenshots
 
Video collection view:

![](doc/images/collection_view.png)

Video search result:

![](doc/images/celebrity_search.png)

Video analysis view:

![](doc/images/celebrity_view.png)

# Deployment

The solution is deployed using a CloudFormation template. For details on deploying this solution please see [the solution home page](https://docs.aws.amazon.com/solutions/latest/aws-content-analysis/).

# Source code

**source/anonymous-data-logger/**:
Contains a lambda function for reporting anonymous solution usage data.

**source/consumers.elastic/**:
Contains the stream consumer for loading data into Elasticsearch

**source/dataplaneapi/**:
Contains the REST API for data persistence

**source/dataplanestream/**:
Contains the stream producer for sending data to Elasticsearch

**source/lambda_layer_factory/**:
Contains a python packages which are used by several Lambda functions

**source/lib/**:
Contains library functions which are used for controlling workflow execution

**source/operators/**:
Contains the Lambda functions which are used for analyzing videos.

**source/webapp/**:
Contains the webapp.

**source/workflow/**:
Contains Lambda functions that are part of AWS Step Functions used for orchestrating 
workflows.

**source/workflowapi/**:
Contains the REST API for executing workflows 

**deployment/**:
Contains build scripts for compiling deployment packages and generating Cloudformation 
templates

# Creating a custom build
Use the following procedure to make changes to the AWS Content Analysis solution:

### 1. Install Prerequisties:
Your build environment must have the following software installed:
* [AWS Command Line Interface](https://aws.amazon.com/cli/)
* npm (version 6 or above)
* python (version 3.7 or above)
* pip (version 19 or above)

### 2. Download or clone this repo

```
git clone https://github.com/awslabs/aws-content-analysis.git
cd aws-content-analysis/deployment
```

### 3. Change the source code

Update the source code to achieve whatever customizations you're trying to make.

### 4. Create Amazon S3 Buckets

You need 2 buckets to build and deploy this solution. One bucket holds CloudFormation template files and the other bucket holds code packages for AWS Lambda. The bucket for code packages needs to be in the same region where you intend to deploy this solution. For example, here's how you would make the buckets for the us-west-2 region:

```
REGION="us-west-2"
UNIQUE_STRING=$RANDOM
TEMPLATE_BUCKET="templates-$UNIQUE_STRING"
CODE_BUCKET="code-$UNIQUE_STRING"
aws s3 mb s3://$TEMPLATE_BUCKET
aws s3 mb s3://$CODE_BUCKET-$REGION --region $REGION
```

### 5. Run the build script

Run the build script, as shown below. Do not append `-$REGION` to the end of `$CODE_BUCKET`. 

`./build-s3-dist.sh $TEMPLATE_BUCKET $CODE_BUCKET v1.0.0 $REGION`

### 6. Copy templates and code packages to S3

The build script saves templates to `./global-s3-assets/` and code packages to `./regional-s3-assets`. Copy them to S3 like this:
```
aws s3 sync global-s3-assets s3://$TEMPLATE_BUCKET/aws-content-analysis/v1.0.0/
aws s3 sync regional-s3-assets s3://$CODE_BUCKET-$REGION/aws-content-analysis/v1.0.0/
```

### 7. Deploy the stack

Define the email address with which to receive credentials for accessing the web application then deploy the stack, like this:

```
EMAIL="myname@example.com"
STACK_NAME="content-analysis"
aws cloudformation create-stack --stack-name $STACK_NAME --template-url https://"$TEMPLATE_BUCKET".s3.amazonaws.com/aws-content-analysis/v1.0.0/aws-content-analysis.template --region "$REGION" --parameters ParameterKey=DeployDemoSite,ParameterValue=true ParameterKey=AdminEmail,ParameterValue="$EMAIL" --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
```

### 8. Clean up

To remove the AWS resources created above, run the following commands: 

```
aws s3 rb s3://$TEMPLATE_BUCKET --force
aws s3 rb s3://$CODE_BUCKET-$REGION --force
aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION
```
