class OutputHelper:
    """Helper class to generate a valid output object"""
    def __init__(self, name):
        """
        :param name: The name of the operator generating the output object

        """
        self.name = name
        self.status = ""
        self.metadata = {}
        self.media = {}
        self.base_s3_key = 'private/media/'

    def return_output_object(self):
        """Method to return the output object that was created

        :return: Dict of the output object
        """
        return {"Name": self.name, "Status": self.status, "MetaData": self.metadata, "Media": self.media}

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

    def add_media_object(self, media_type, s3_bucket, s3_key):
        """ Method to add a media object to the output object

        :param media_type: The type of media
        :param s3_bucket: S3 bucket of the media
        :param s3_key: S3 key of the media
        :return: Nothing
        """

        self.media[media_type] = {"S3Bucket": s3_bucket, "S3Key": s3_key}
