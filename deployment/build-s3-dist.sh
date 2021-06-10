#!/bin/bash
###############################################################################
# Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
#
# PURPOSE:
#   Build cloud formation templates for the AWS Content Analysis solution
#
# USAGE:
#  ./build-s3-dist.sh [-h] [-v] --template-bucket {TEMPLATE_BUCKET} --code-bucket {CODE_BUCKET} --version {VERSION} --region {REGION} --profile {PROFILE}
#    TEMPLATE_BUCKET should be the name for the S3 bucket location where MIE
#      cloud formation templates should be saved.
#    CODE_BUCKET should be the name for the S3 bucket location where cloud
#      formation templates should find Lambda source code packages.
#    VERSION can be anything but should be in a format like v1.0.0 just to be consistent
#      with the official solution release labels.
#    REGION needs to be in a format like us-east-1
#    PROFILE is optional. It's the profile that you have setup in ~/.aws/config
#      that you want to use for AWS CLI commands.
#
#    The following options are available:
#
#     -h | --help       Print usage
#     -v | --verbose    Print script debug info
#
###############################################################################

trap cleanup_and_die SIGINT SIGTERM ERR

usage() {
  msg "$msg"
  cat <<EOF
Usage: $(basename "${BASH_SOURCE[0]}") [-h] [-v] [--profile PROFILE] --template-bucket TEMPLATE_BUCKET --code-bucket CODE_BUCKET --version VERSION --region REGION

Available options:

-h, --help        Print this help and exit (optional)
-v, --verbose     Print script debug info (optional)
--template-bucket S3 bucket to put cloud formation templates
--code-bucket     S3 bucket to put Lambda code packages
--version         Arbitrary string indicating build version
--region          AWS Region, formatted like us-west-2
--profile         AWS profile for CLI commands (optional)
EOF
  exit 1
}

cleanup_and_die() {
  trap - SIGINT SIGTERM ERR
  echo "Trapped signal."
  cleanup
  die 1
}

cleanup() {
  # Deactivate and remove the temporary python virtualenv used to run this script
  if [[ "$VIRTUAL_ENV" != "" ]];
  then
    deactivate
    #rm -rf "$VENV"
    echo "------------------------------------------------------------------------------"
    echo "Cleaning up complete"
    echo "------------------------------------------------------------------------------"
  fi
}

msg() {
  echo >&2 -e "${1-}"
}

die() {
  local msg=$1
  local code=${2-1} # default exit status 1
  msg "$msg"
  exit "$code"
}

parse_params() {
  # default values of variables set from params
  flag=0
  param=''

  while :; do
    case "${1-}" in
    -h | --help) usage ;;
    -v | --verbose) set -x ;;
    --template-bucket)
      global_bucket="${2}"
      shift
      ;;
    --code-bucket)
      regional_bucket="${2}"
      shift
      ;;
    --version)
      version="${2}"
      shift
      ;;
    --region)
      region="${2}"
      shift
      ;;
    --profile)
      profile="${2}"
      shift
      ;;
    -?*) die "Unknown option: $1" ;;
    *) break ;;
    esac
    shift
  done

  args=("$@")

  # check required params and arguments
  [[ -z "${global_bucket}" ]] && usage "Missing required parameter: template-bucket"
  [[ -z "${regional_bucket}" ]] && usage "Missing required parameter: code-bucket"
  [[ -z "${version}" ]] && usage "Missing required parameter: version"
  [[ -z "${region}" ]] && usage "Missing required parameter: region"

  return 0
}

parse_params "$@"
msg "Build parameters:"
msg "- Template bucket: ${global_bucket}"
msg "- Code bucket: ${regional_bucket}-${region}"
msg "- Version: ${version}"
msg "- Region: ${region}"
msg "- Profile: ${profile}"

echo ""
sleep 3
s3domain="s3.$region.amazonaws.com"

# Check if region is supported:
if [ "$region" != "us-east-1" ] &&
   [ "$region" != "us-east-2" ] &&
   [ "$region" != "us-west-1" ] &&
   [ "$region" != "us-west-2" ] &&
   [ "$region" != "eu-west-1" ] &&
   [ "$region" != "eu-west-2" ] &&
   [ "$region" != "eu-central-1" ] &&
   [ "$region" != "ap-south-1" ] &&
   [ "$region" != "ap-northeast-1" ] &&
   [ "$region" != "ap-southeast-1" ] &&
   [ "$region" != "ap-southeast-2" ] &&
   [ "$region" != "ap-northeast-1" ] &&
   [ "$region" != "ap-northeast-2" ]; then
   echo "ERROR. Rekognition operatorions are not supported in region $region"
   exit 1
fi

# Make sure aws cli is installed
if [[ ! -x "$(command -v aws)" ]]; then
echo "ERROR: This script requires the AWS CLI to be installed. Please install it then run again."
exit 1
fi

# Get reference for all important folders
build_dir="$PWD"
consumer_dir="$build_dir/../source/consumer"
helper_dir="$build_dir/../source/helper"
website_dir="$build_dir/../source/website/"
global_dist_dir="$build_dir/global-s3-assets"
regional_dist_dir="$build_dir/regional-s3-assets"

# Create and activate a temporary Python environment for this script.
echo "------------------------------------------------------------------------------"
echo "Creating a temporary Python virtualenv for this script"
echo "------------------------------------------------------------------------------"
python -c "import os; print (os.getenv('VIRTUAL_ENV'))" | grep -q None
if [ $? -ne 0 ]; then
    echo "ERROR: Do not run this script inside Virtualenv. Type \`deactivate\` and run again.";
    exit 1;
fi
command -v python3
if [ $? -ne 0 ]; then
    echo "ERROR: install Python3 before running this script"
    exit 1
fi
VENV=$(mktemp -d)
python3 -m venv "$VENV"
source "$VENV"/bin/activate

echo "------------------------------------------------------------------------------"
echo "Create distribution directory"
echo "------------------------------------------------------------------------------"

# Setting up directories
echo "rm -rf $global_dist_dir"
rm -rf "$global_dist_dir"
echo "mkdir -p $global_dist_dir"
mkdir -p "$global_dist_dir"
echo "rm -rf $regional_dist_dir"
rm -rf "$regional_dist_dir"
echo "mkdir -p $regional_dist_dir"
mkdir -p "$regional_dist_dir"
echo "mkdir -p $regional_dist_dir/website/"
mkdir -p "$regional_dist_dir"/website/

echo "------------------------------------------------------------------------------"
echo "CloudFormation Templates"
echo "------------------------------------------------------------------------------"
echo ""
echo "Preparing template files:"
cp "$build_dir/aws-content-analysis.yaml" "$global_dist_dir/aws-content-analysis.template"
cp "$build_dir/aws-content-analysis-elasticsearch.yaml" "$global_dist_dir/aws-content-analysis-elasticsearch.template"
cp "$build_dir/aws-content-analysis-auth.yaml" "$global_dist_dir/aws-content-analysis-auth.template"
cp "$build_dir/aws-content-analysis-web.yaml" "$global_dist_dir/aws-content-analysis-web.template"
cp "$build_dir/aws-content-analysis-video-workflow.yaml" "$global_dist_dir/aws-content-analysis-video-workflow.template"
cp "$build_dir/aws-content-analysis-image-workflow.yaml" "$global_dist_dir/aws-content-analysis-image-workflow.template"
cp "$build_dir/aws-content-analysis-image-workflow.yaml" "$global_dist_dir/aws-content-analysis-image-workflow.template"
cp "$build_dir/aws-content-analysis-use-existing-mie-stack.yaml" "$global_dist_dir/aws-content-analysis-use-existing-mie-stack.template"
find "$global_dist_dir"
echo "Updating template source bucket in template files with '$global_bucket'"
echo "Updating code source bucket in template files with '$regional_bucket'"
echo "Updating solution version in template files with '$version'"
new_global_bucket="s/%%GLOBAL_BUCKET_NAME%%/$global_bucket/g"
new_regional_bucket="s/%%REGIONAL_BUCKET_NAME%%/$regional_bucket/g"
new_version="s/%%VERSION%%/$version/g"
# Update templates in place. Copy originals to [filename].orig
sed -i.orig -e "$new_global_bucket" "$global_dist_dir/aws-content-analysis-use-existing-mie-stack.template"
sed -i.orig -e "$new_regional_bucket" "$global_dist_dir/aws-content-analysis-use-existing-mie-stack.template"
sed -i.orig -e "$new_version" "$global_dist_dir/aws-content-analysis-use-existing-mie-stack.template"
sed -i.orig -e "$new_global_bucket" "$global_dist_dir/aws-content-analysis.template"
sed -i.orig -e "$new_regional_bucket" "$global_dist_dir/aws-content-analysis.template"
sed -i.orig -e "$new_version" "$global_dist_dir/aws-content-analysis.template"
sed -i.orig -e "$new_global_bucket" "$global_dist_dir/aws-content-analysis-elasticsearch.template"
sed -i.orig -e "$new_regional_bucket" "$global_dist_dir/aws-content-analysis-elasticsearch.template"
sed -i.orig -e "$new_version" "$global_dist_dir/aws-content-analysis-elasticsearch.template"
sed -i.orig -e "$new_global_bucket" "$global_dist_dir/aws-content-analysis-auth.template"
sed -i.orig -e "$new_regional_bucket" "$global_dist_dir/aws-content-analysis-auth.template"
sed -i.orig -e "$new_version" "$global_dist_dir/aws-content-analysis-auth.template"
sed -i.orig -e "$new_global_bucket" "$global_dist_dir/aws-content-analysis-web.template"
sed -i.orig -e "$new_regional_bucket" "$global_dist_dir/aws-content-analysis-web.template"
sed -i.orig -e "$new_version" "$global_dist_dir/aws-content-analysis-web.template"

echo "------------------------------------------------------------------------------"
echo "Elasticsearch consumer Function"
echo "------------------------------------------------------------------------------"

echo "Building Elasticsearch Consumer function"
cd "$consumer_dir" || exit 1

[ -e dist ] && rm -r dist
mkdir -p dist
[ -e package ] && rm -r package
mkdir -p package
echo "preparing packages from requirements.txt"
# Package dependencies listed in requirements.txt
pushd package || exit 1
# Handle distutils install errors with setup.cfg
touch ./setup.cfg
echo "[install]" > ./setup.cfg
echo "prefix= " >> ./setup.cfg
if ! [ -x "$(command -v pip3)" ]; then
  echo "pip3 not installed. This script requires pip3. Exiting."
  exit 1
else
    pip3 install --quiet -r ../requirements.txt --target .
fi
zip -q -r9 ../dist/esconsumer.zip .
popd || exit 1

zip -q -g dist/esconsumer.zip ./*.py
cp "./dist/esconsumer.zip" "$regional_dist_dir/esconsumer.zip"

echo "------------------------------------------------------------------------------"
echo "Build vue website"
echo "------------------------------------------------------------------------------"

echo "Building Vue.js website"
cd "$website_dir/" || exit 1
echo "Installing node dependencies"
npm install
echo "Compiling the vue app"
npm run build
echo "Finished building website"
cp -r ./dist/* "$regional_dist_dir"/website/
rm -rf ./dist

echo "------------------------------------------------------------------------------"
echo "Generate webapp manifest file"
echo "------------------------------------------------------------------------------"
# This manifest file contains a list of all the webapp files. It is necessary in
# order to use the least privileges for deploying the webapp.
#
# Details: The website_helper.py Lambda function needs this list in order to copy
# files from $regional_dist_dir/website to the ContentAnalysisWebsiteBucket (see aws-content-analysis-web.yaml).  Since the manifest file is computed during build
# time, the website_helper.py Lambda can use that to figure out what files to copy
# instead of doing a list bucket operation, which would require ListBucket permission.
# Furthermore, the S3 bucket used to host AWS solutions (s3://solutions-reference)
# disallows ListBucket access, so the only way to copy files from
# s3://solutions-reference/aws-content-analysis/latest/website to
# ContentAnalysisWebsiteBucket is to use said manifest file.
#
cd $regional_dist_dir"/website/" || exit 1
manifest=(`find . -type f | sed 's|^./||'`)
manifest_json=$(IFS=,;printf "%s" "${manifest[*]}")
echo "[\"$manifest_json\"]" | sed 's/,/","/g' > $helper_dir/webapp-manifest.json
cat $helper_dir/webapp-manifest.json

echo "------------------------------------------------------------------------------"
echo "Build website helper function"
echo "------------------------------------------------------------------------------"

echo "Building website helper function"
cd "$helper_dir" || exit 1
[ -e dist ] && rm -r dist
mkdir -p dist
zip -q -g ./dist/websitehelper.zip ./website_helper.py webapp-manifest.json
cp "./dist/websitehelper.zip" "$regional_dist_dir/websitehelper.zip"

# Skip copy dist to S3 if building for solution builder because
# that pipeline takes care of copying the dist in another script.
if [ "$global_bucket" != "solutions-reference" ] && [ "$global_bucket" != "solutions-test-reference" ]; then

  echo "------------------------------------------------------------------------------"
  echo "Copy dist to S3"
  echo "------------------------------------------------------------------------------"

  cd "$build_dir"/ || exit 1
  echo "Copying the prepared distribution to:"
  echo "s3://$global_bucket/aws-content-analysis/$version/"
  echo "s3://${regional_bucket}-${region}/aws-content-analysis/$version/"

  set -x
  aws s3 sync $global_dist_dir s3://$global_bucket/aws-content-analysis/$version/ $(if [ ! -z $profile ]; then echo "--profile $profile"; fi)
  aws s3 sync $regional_dist_dir s3://${regional_bucket}-${region}/aws-content-analysis/$version/ $(if [ ! -z $profile ]; then echo "--profile $profile"; fi)
  set +x

  echo "------------------------------------------------------------------------------"
  echo "S3 packaging complete"
  echo "------------------------------------------------------------------------------"

  echo ""
  echo "Template to deploy:"
  echo ""
  echo "With existing MIE deployment:"
  echo "TEMPLATE='"https://"$global_bucket"."$s3domain"/aws-content-analysis/"$version"/aws-content-analysis-use-existing-mie-stack.template"'"
  echo "Without existing MIE deployment:"
  echo "TEMPLATE='"https://"$global_bucket"."$s3domain"/aws-content-analysis/"$version"/aws-content-analysis.template"'"
fi

cleanup
echo "Done"
exit 0
