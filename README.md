# AWS Serverless

-----

## Traditional Server in Datacenter Vs EC2 Vs Serverless

| Traditional Server      | EC2 | Serverless     |
| :---        |    :---   |          :--- |
| We own Datacenter      | We don't own Datacenter       | We don't own Datacenter   |
| We spend money for buying servers   | We just launch EC2 instances of fixed processing capacity and memory        | We utilize serverless services      |
| Scaling needs special tools   | If EC2  reached capacity, add another EC2 via ASG but with fixed predetermined capacity        | Autoscales automatically.       |
| We pay for the cost of running the datacenter. Electricity, AC, etc  | N/A        | N/A   |
| We buy enough servers upfront to accommodate huge traffic   | Sometimes traffic might be less than EC2 capacity. But still need to pay full price for EC2       | Pay for number of executions rather than idle resources   |
| Lot of money waste   | Better than Traditional Datacenter but still under utilized and paid   | Best cost optimized solution     |


## Define Serverless
- No servers to provision or manage
- Automatically scales with usage
- Never pay for idle resources. Pay for what we use
- Availability and Fault-tolerance built-in
- No AMI maintenance 

## AWS Lambda
- Lets to run code without provisioning or managing servers
- Can run code for any type of application
- Lambda takes care of HA, Scaling
- Pay only for the compute time
- Select memory from 128MB to 10GB
- CPU and Network allocated proportionally
- Max 15 mins runtime
- Can be invoked synchronously(API Gateway) and asynchronously(SQS,SNS,S3)
- Inherent integration with other services
- Cost:
  - Non expiring free tier
  - Every month we get 1M invocations and 400,000 GBs of compute
  - Charged in 1ms increments

#### Create and configure Lambda from console
- Goto Lambda services from console
- Minimum details required to create Lambda function:
  - Function Name
  - Select Runtime
  - Permissions (Lambda will create an execution role with permission to upload logs to 
  CloudWatch Logs. we can modify the permissions later if we need).
      We need to configure enough permissions for the Function to communicate with other AWS 
      services. 
    - Create a new role with basic Lambda permissions (default selected)
    - Use an existing role
    - Create a new role from AWS policy templates

#### Lambda Functions console
- Code Tab
    - Write code, Deploy, Test
- Test Tab
    - Pass sample event and test
    - Create test events
    - Test the function with test events. Lambda provides many test event templates already for 
        AWS services.
- Monitor Tab
    - Metrics, Logs and Traces can be viewed.
- Configuration Tab
    - Basic Settings
        - Memory
        - Timeout
        - Runtime
        - Change execution role  
    - Triggers 
        - Invokes the function when the configured event happens
        - List all the triggers configured for a Lambda function 
        - 1 or more triggers can be configured for a function
        - Each trigger source(S3,DynamoDB, SQS, SNS, etc) has different events and configurations
        - Triggers can be enabled/disabled/deleted
        - Lambda will add necessary permissions on the trigger source so that the source can 
        invoke the function from this trigger. 
    - Permissions
        - Execution role
            - To view the resources and actions that the function has permission to access.
            - Example - CloudWatch permissions are created by default when we create a function.
        - Resource-based policy
            - A resource-based policy lets you grant permissions to other AWS accounts or services
              on a per-resource basis.
            - Example - Permission for API Gateway to invoke the function is added automatically 
              when we add the function as Integration Type in API Gateway configuration.  
    - Destinations
    - Environment Variables
    - Tags
    - VPC
    - Monitoring and operations tool - By default, Logs and Metrics enabled. By default, 
    Tracing 
        is disabled. Observability tools can be added as extensions.
    - Concurrency
        - By default, "Unreserved account concurrency" is 1000 and its used for a function.
        - Provisioned concurrency configurations - To enable your function to scale without fluctuations in latency, use provisioned 
          concurrency. Provisioned concurrency runs continually and has separate pricing for concurrency and execution duration.
    - Asynchronous invocation
        - Maximum age of unprocessed event to stay in queue.(default:6h)
        - Retry attempts(default:2)
        - DLQ 
    - Code Signing
        - Use code signing to restrict the deployment of unvalidated code.
    - Database proxies
    - File Systems
    - State Machines
- Alias Tab
- Versions Tab

- Create Version
    - 
- Create Alias
    - An alias is a pointer to one or two versions. 
    - You can shift traffic between two versions, based on weights (%) that you assign.
    - NOTE: $LATEST is not supported for an alias pointing to more than 1 version
    - The API Gateway can refer ``lambdaFunctionName:lambdaAlias`` or  
    ``lambdaFunctionName:${stageVariables.lambdaAlias}`` to send traffic to specific alias 
    which in turn send traffic configured versions.

### IAM
- Policy 
    - A Policy is an json object that when associated with an identity or resource, it defines 
their permissions.
    - The json object contains "Effect", "Action", "Resource"
    - The policy can be attached to users, groups or roles
- User
    - An IAM user can represent a person or application that interact with AWS.
    - access key ID and secret access key
    -  username and password
- Roles 
    - Policies can't attached to any AWS services directly
    - Policies are associated with service role and which inturn is associated to AWS service.
    - When we login as admin IAM user who has all the permissions, can't the services access 
    everything? Nope, we need to configure each service with a role to run with. This separation 
    of permissions between user roles and service roles is necessary to reduce blast radius.

### API Gateway
- API - Application Programming Interface is a set of clearly defined methods of communication 
between various components.
- Functions of API Gateway:
  - Lets us to create, configure and host a API.
  - Authentication and Authorization of API.
  - Tracing, Caching and Throttling of API requests.
  - Staged deployments, Canray release
  - and much more
  
![Api Gateway flow](images/apigateway-lambda.png)
  
#### API Gateway Console
- APIs
    - Create API
        - Create New API, Clone from Existing API, Import from Swagger, Example API
        - API name, Description, Endpoint Type(Regional by default)
            - API:
                - Resources
                    - Could be different projects/business areas  
                    - Create Method, Create Resource, Enable CORS, Deploy API, Import API, Delete API
                    - Multiple resources can be created under a single API 
                    - Create Resource - Create a RESTFul resource
                    - Create Method - Provides HTTP method. The Integration type available are 
                    Lambda function(default), HTTP, Mock, AWS Service, VPC Link. Authorization 
                    and API key can be configured.
                    - Deploy API - Deploys the API to a stage. We need to create or select exiting
                     stage. The resource that is not deployed can't be accessed from browser. But
                      It can be tested from API Gateway console itself.
                - Stages
                    - The stage created using "Deploy API" is shown here.
                    - Invoke URL is available for each stage. But it requires "Authentication 
                    Token".
                    - Invoke URL is available for each Method under each Resource in each stage. 
                      This is url can be accessed from browser.
                    - API cache can be enabled/disabled
                    - Logs/Tracing
                    - Stage Variables
                    - Method level throttling  can be enabled/disabled, throttling value can be 
                    modified.
                    - Canary
                        - A Canary is used to test new API deployments and/or changes to stage variables. A Canary can receive a percentage of requests going to your stage. In addition, API deployments will be made to the Canary first before being able to be promoted to the entire stage.
                        - Canary Stage Request Distribution, Cache, Canary Stage Variables can configured.
                        - After testing, "Promote Canary" to the stage.
                    - Deployment History
                    - SDK Generation
                    - Export
                    - Client Certificate - Certificate that API Gateway will use to call the 
                    integration endpoints in this stage
                - Authorizers
                - Gateway Responses
                - Models
                - Resource Policy
      
- Usage Plans
    - A Usage plan provides selected API clients with access to one or more deployed APIs. You 
    can use usage plan to configure throttling and quota limits, which are enforced on individual
     client API keys.
- API Keys
- Custom Domain Names
- Client Certificates
- VPC Links
- Settings 

#### API Gateway Components
![apigateway-components](images/apigateway-components.png)
- The default error response from apigateway->lambda exposes the lambda function name to outside 
world.
- API Developer - Your AWS account that owns the API Gateway deployment.
- App Developer - An app creator who may or may not have an AWS account and interacts with the 
API that you, the API developer, have deployed. App developers are your customers and he is 
identified by an API Key.
- Method Request
    - Gets unique ARN 
    - Query params, HTTP request headers, Request Body(Content-Type) expected in request can be 
    configured
    - Request validators for Headers, Query params, body can be configured.
    - API key required - true/false. By default its false
    - Authorization. so per method authorization is possible to implement. 
- Integration Request
    - Select the Integration type.
    - The Integration endpoint can be from same AWS account or from other account as well.
        - Same AWS Account - Refer the destination just by name. example - lambda function name.
        - Cross AWS Account - Refer the destination using the ARN. example - lambda function arn
            - We need to add appropriate function policy on the function in another account. We 
            can do it through aws-cli. The command is generated by console.
    - Lambda as Integration:
        - In order to implement traffic splitting using lambda alias and version, we need refer 
          the function as ``lambdaFunctionName:${stageVariables.lambdaAlias}``
        - For this, we need set appropriate function policy on the function. We can do it through
          aws-cli. The command is generated by console and we need to update the appropriate alias.
        - Deploy the API again.
        - Set the stage variable ``lambdaAlias``.
        - Launch the URL and the traffic will be routed to 2 different versions of a function. 
        
    - URL path parameters, URL query parameters, URL Headers from request can be mapped to 
    Integration request. 
    - Using Mapping Templates(velocity template) grab query params from URL and pass it
    in "event" object.
    - {"country":"${method.request.querystring.nameOfCountry}"}, here "nameOfCountry" is the query param and 
    "country" is populated in "event" object.
    - {"country":"${method.request.path.myparam1}"}, where myparam1 is path parameter.
    - {"country":"${method.request.header.myparam2}"}, where myparam2 is header parameter.
    