class DataPlane:
    """Helper Class for interacting with the dataplane"""

    def __init__(self):
        self.dataplane_function_name = os.environ["DataplaneEndpoint"]
        self.lambda_client = boto3.client('lambda')
        self.lambda_invoke_object = {
            # some api uri
            "resource": "",
            # some api uri, not sure why this is needed twice
            "path": "",
            # HTTP Method
            "httpMethod": "",
            # Headers, just here so chalice formatting doesn't fail
            "headers": {
                'Content-Type': 'application/json'
            },
            # Not sure the difference between this header object and the above
            "multiValueHeaders": {},
            # Mock query string params
            "queryStringParameters": {},
            # Not sure the difference here either
            "multiValueQueryStringParameters": {},
            # Not sure what these are
            "pathParameters": {},
            # API Stage variables, again just here for chalice formatting
            "stageVariables": {},
            # request context, we generate most of this now
            "requestContext": {
                'resourcePath': '',
                'requestTime': None,
                'httpMethod': '',
                'requestId': None,
            },
            "body": {},
            "isBase64Encoded": False
        }

    def call_dataplane(self, path, resource, method, body=None, path_params=None, query_params=None):
        encoded_body = json.dumps(body)

        self.lambda_invoke_object["resource"] = resource
        self.lambda_invoke_object["path"] = path
        self.lambda_invoke_object["requestContext"]["resourcePath"] = resource
        self.lambda_invoke_object["httpMethod"] = method
        self.lambda_invoke_object["pathParameters"] = path_params
        self.lambda_invoke_object["body"] = encoded_body
        self.lambda_invoke_object["queryStringParameters"] = query_params
        if query_params is not None:
            self.lambda_invoke_object["multiValueQueryStringParameters"] = {}
            for k, v in query_params.items():
                self.lambda_invoke_object["multiValueQueryStringParameters"][k] = [v]
        else:
            self.lambda_invoke_object["multiValueQueryStringParameters"] = query_params
        self.lambda_invoke_object["requestContext"]["httpMethod"] = method
        self.lambda_invoke_object["requestContext"]["requestId"] = 'lambda_' + str(uuid.uuid4()).split('-')[-1]
        self.lambda_invoke_object["requestContext"]["requestTime"] = time.time()

        request_object = json.dumps(self.lambda_invoke_object)

        invoke_request = self.lambda_client.invoke(
            FunctionName=self.dataplane_function_name,
            InvocationType='RequestResponse',
            LogType='None',
            Payload=bytes(request_object, encoding='utf-8')
        )

        response = invoke_request["Payload"].read().decode('utf-8')

        # TODO: Do we want to do any validation on the status code or let clients parse the response as needed?
        dataplane_response = json.loads(response)
        return json.loads(dataplane_response["body"])

    def create_asset(self, s3bucket, s3key):
        """
        Method to create an asset in the dataplane

        :param s3bucket: S3 Bucket of the asset
        :param s3key: S3 Key of the asset

        :return: Dataplane response
        """
        path = "/create"
        resource = "/create"
        method = "POST"
        body = {"Input": {"S3Bucket": s3bucket, "S3Key": s3key}}
        dataplane_response = self.call_dataplane(path, resource, method, body)
        return dataplane_response

    def store_asset_metadata(self, asset_id, operator_name, workflow_id, results, paginate=False, end=False):
        """
        Method to store asset metadata in the dataplane

        :param operator_name: The name of the operator that created this metadata
        :param results: The metadata itself, or what the result of the operator was
        :param asset_id: The id of the asset
        :param workflow_id: Worfklow ID that generated this metadata

        Pagination params:
        :param paginate: Boolean to tell dataplane that the results will come in as pages
        :param end: Boolean to declare the last page in a set of paginated results

        :return: Dataplane response

        """

        path = "/metadata/{asset_id}".format(asset_id=asset_id)
        resource = "/metadata/{asset_id}"
        path_params = {"asset_id": asset_id}
        method = "POST"
        body = {"OperatorName": operator_name, "Results": results, "WorkflowId": workflow_id}

        query_params = {}

        if paginate or end:
            if paginate is True:
                query_params["paginated"] = "true"
            if end is True:
                query_params["end"] = "true"
        else:
            query_params = None

        dataplane_response = self.call_dataplane(path, resource, method, body, path_params, query_params)
        return dataplane_response

    def retrieve_asset_metadata(self, asset_id, operator_name=None, cursor=None):
        """
        Method to retrieve metadata from the dataplane

        :param asset_id: The id of the asset
        :param operator_name: Optional parameter for filtering response to include only data
        generated by a specific operator
        :param cursor: Optional parameter for retrieving additional pages of asset metadata

        :return: Dataplane response
        """
        if operator_name:
            path = "/metadata/{asset_id}/operator".format(asset_id=asset_id, operator=operator_name)
        else:
            path = "/metadata/{asset_id}".format(asset_id=asset_id)

        resource = "/metadata/{asset_id}"
        path_params = {"asset_id": asset_id}
        method = "GET"

        query_params = {}

        if cursor:
            query_params["cursor"] = cursor
        else:
            query_params = None

        dataplane_response = self.call_dataplane(path, resource, method, None, path_params, query_params)

        return dataplane_response

    def generate_media_storage_path(self, asset_id, workflow_id):
        path = "/mediapath/{asset_id}/{workflow_id}".format(asset_id=asset_id, workflow_id=workflow_id)
        resource = "/mediapath/{asset_id}/{workflow_id}"
        path_params = {"asset_id": asset_id, "workflow_id": workflow_id}
        method = "GET"

        dataplane_response = self.call_dataplane(path, resource, method, None, path_params)

        return dataplane_response
