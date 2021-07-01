# Serverless Microservices Architecture Patterns

-----

## Communication Styles
- Microservices are distributed by nature
- RPC Vs REST
- Synchronous Vs Asychronous
- Blocking and Non-blocking calls
- Dealing with throttling, failure-retries, delays and errors

### 1-to-1 communication microservices patterns
- Sync Request/Response
- Sync Request/Async notification or Async response
- REST or Pub/Sub
![1-1-communication](images/1-1-communication.png)

### Many-to-Many communication microservices patterns
- Pub/Sub
- High scalable pattern
- Services are decoupled
![many-to-many-communication](images/many-to-many-communication.png)

### AWS Lambda Communication patterns
- Data stores sources - Amazon S3 events(async) - Lambda handles retry and sending event to DLQ 
if configured
- Requests to endpoints - API Gateway(sync) - client has to handle retry mechanism
- Changes in repositories and logs - Code commit, CloudWatch
- Event and Message Services - SNS, Cron events
- Streaming event sources - DynamoDB, Kinesis

## Decomposition Patterns
### Decomposition Pattern by Business Capbility
![decompose-pattern-by-business-capability](images/decompose-pattern-by-business-capability.png)
- Benefits:
    - Relatively stable as linked to what business offers
    - Linked to processes and stature
- Drawbacks:
    - Data can span multiple services
    - Might not be optimum communication or shared code
    - Centralized enterprise language model
    - Any change in our service should be propagated to other services.

### Decomposition Pattern by Bounded Context
![decompose-pattern-by-bounded-context](images/decompose-pattern-by-bounded-context.png)
- Benefits:
    - Ubiquitous language
    - Teams own, deploy and maintain services
    - Domain over interface - other services can access the service through this interface
- Drawbacks: 
    - Learning curve
    - Over complex for simple domains
    - Orphaned services

