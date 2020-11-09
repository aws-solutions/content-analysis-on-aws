class MediaInsightsOperationHelper:
    """Helper class to work with input and output passed between MIE operators in a workflow."""
    def __init__(self, event):
        """
        :param event: The event passed in to the operator

        """
        print("Operation Helper init event = {}".format(event))
        self.name = event["Name"]
        self.asset_id = event["AssetId"]
        self.workflow_execution_id = event["WorkflowExecutionId"]
        self.input = event["Input"]
        self.configuration = event["Configuration"]
        self.status = event["Status"]
        if "MetaData" in event:
            self.metadata = event["MetaData"]
        else:
            self.metadata = {}
        if "Media" in event:
            self.media = event["Media"]
        else:
            self.media = {}
        self.base_s3_key = 'private/media/'

    def workflow_info(self):
        return {"AssetId": self.asset_id, "WorkflowExecutionId": self.workflow_execution_id}

    def return_output_object(self):
        """Method to return the output object that was created

        :return: Dict of the output object
        """
        return {"Name": self.name, "AssetId": self.asset_id, "WorkflowExecutionId": self.workflow_execution_id,  "Input": self.input, "Configuration": self.configuration, "Status": self.status, "MetaData": self.metadata, "Media": self.media}

    def update_workflow_status(self, status):
        """ Method to update the status of the output object
        :param status: A valid status
        :return: Nothing
        """
        self.status = status

    def add_workflow_metadata(self, **kwargs):
        """ Method to update the metadata key of the output object

        :param kwargs: Any key value pair you want added to the metadata of the output object
        :return: Nothing
        """
        for key, value in kwargs.items():
            # TODO: Add validation here to check if item exists
            self.metadata.update({key: value})

    def add_workflow_metadata_json(self, json_metadata):
        """ Method to update the metadata key of the output object

        :param json_metadata: json dictionary of key-value pairs to add to workflow metadata
        :return: Nothing
        """
        for key, value in json_metadata.items():
            # TODO: Add validation here to check if item exists
            print(key)
            print(value)
            self.metadata.update({key: value})

    def add_media_object(self, media_type, s3_bucket, s3_key):
        """ Method to add a media object to the output object

        :param media_type: The type of media
        :param s3_bucket: S3 bucket of the media
        :param s3_key: S3 key of the media
        :return: Nothing
        """

        self.media[media_type] = {"S3Bucket": s3_bucket, "S3Key": s3_key}
