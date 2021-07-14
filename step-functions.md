# Step Functions

-----
- It is a Orchestration Service that allows you to model workflows as state machine
- Manages the state of the workflow, keeps track of the execution, scalable and resilient 
platform.
- Design state machine using JSON. Refer the spec [states-language](https://states-language.net/)
- Multiple executions of same state machine can be executed concurrently
- Start state machine:
    - ````javascript 1.8
        StepFunctions.startExecution(req).promise()
      ````  
      
    - API Gateway
    - CloudWatch Events
    
- The states in the state machine can invoke Lambda function
- Step Functions can record upto 25K events in Execution Event History per execution

### Terminology
- Every time the execution moves on from one state to another, it's called a **state transition**
- Step Functions charges based on number of state transitions  across all your state machines, including retries.
- 4,000 free state transitions per month and does not automatically expire at the end of your 12 month AWS Free Tier term, and is available to both existing and new AWS customers indefinitely.
- $0.025 per 1,000 state transitions. $25 for 1M state transitions. $0.000025 PER STATE TRANSITION 
THEREAFTER
- State Machine Definition is the workflow created using JSON spec
- State Machine status:
    - Running
    - Succeeded
    - Failed
    - Timeout
    - Aborted
    
- Each state machine has an unique ARN and IAM role which is needed to interact with Lambda and 
other AWS services
- Each execution has an unique ARN, start time, end time, input and output, status
- Each state in the execution has a status:
    - Success
    - Failed
    - Cancelled
    - In Progress
- Each state displays input, output, exception if any
- Each state can have Retry, Catch, Timeout configured in the workflow
- CloudWatch has metrics for Step Functions based on status

### When to use Step Functions?
- Pros
    - Visual workflow
    - Error handling
    - Audit
- Cons
    - Cost - $25 for 1M state transitions
- Scenarios
    - Business critical workflows - stuffs that make money. Eg: Payment, subscription - More 
    robust error handling worth the premium
    - Complex workflows - Many states, branches, etc - visual workflow is a powerful design(for 
    product) and diagnostic tool(for customer support)
    - Long running workflows - runs >15 mins - AWS discourages recursive Lambda functions. Step 
    Functions gives you explicit branching checks, and can timeout at workflow level
    - Workflows within a bounded context of a single microservice are often orchestrated using a 
    series of Lambda functions with Kinesis or SNS or SQS messages in between. Its good practice 
    to use events to interact with different microservices together not within the same service. 
    Because the workflow itself doesn't exist as a standalone concept anyway, but merely exists 
    as the sum of a bunch of loosely connected functions with event sources. This makes the 
    workflow to reason about and debug. we can't implement workflow level timeout as well. If you
     have such a system now, it should be moved to Step Functions
     
### 7 Types of States
#### Task
- Performs a task
-   ````json
        "TaskState":{
          "Type":"Task",
          "Resource":"ARN",
          "Next":"AnotherTask",
          "TimeoutSeconds":"300",
          "ResultPath":"$.n"
        }
    ```` 
- ARN can be of Lambda, Activity, AWS Batch, ECS Task, DynamoDB, SNS, SQS, AWS Glue, SageMaker
- ``TimeoutSeconds`` - default is 60s. State machine doesn't know about the timeout of Lambda 
function. If TimeoutSeconds < Lambda function timeout, then this task will be timed out after 
TimeoutSeconds. so its good to set TimeoutSeconds = function's timeout
- If ``ResultPath`` is not specified, then the output from the state would bind to the $ symbol 
and override the current execution state. If we don't want this behaviour, you can bind the 
result to a path on the execution state, like, $.n

#### Pass
- Passes Input to Output without doing any work. It can modify the execution state.
-   ````json
        "PassState":{
          "Type":"Pass",
          "Result":{
            "value" : 42
          },
          "ResultPath":"$.storeResult",
          "Next":"AnotherTask"
        }
    ```` 
- ``Result`` - we can specify output for the pass state and we can say where to store the results
 in execution state using the ``ResultPath`` attribute. If the Pass state as empty Input, then 
 the output will look like 
    ````json
      {
        "storeResult": {
          "value" : 42
        }
      }
    ````
    
#### Wait
- Wait before transitioning to next state
- Set the static value

-   ````json
        "waitStateUsingSeconds":{
          "Type":"Wait",
          "Seconds":10,
          "Next":"AnotherTask"
        }
    ````
-   ````json
        "waitStateUsingTimeStamp":{
          "Type":"Wait",
          "TimeStamp":"2021-07-14T01:59:00Z",
          "Next":"AnotherTask"
        }
    ````
- To dynamically set the value
-   ````json
        "waitStateUsingSeconds":{
          "Type":"Wait",
          "SecondsPath":"$.waitTime",
          "Next":"AnotherTask"
        }
    ````
-   ````json
        "waitStateUsingTimeStamp":{
          "Type":"Wait",
          "TimeStampPath":"$.waitUntil",
          "Next":"AnotherTask"
        }
    ````
    
#### Choice
- Adds branching logic to the state machine

-   ````json
        "choiceState": {
          "Type": "Choice",
          "Choices": [
            {
              "Variable": "$.name",
              "StringEquals": "Neo",
              "Next": "BlueTask"
            },
            {
              "Variable": "$.name",
              "StringEquals": "Alpha",
              "Next": "GreenTask"
            }
          ],
          "Default": "RedTask"
        }
    ````
- Using And

-   ````json
        "choiceState": {
          "Type": "Choice",
          "Choices": [
            {
              "And": [
                {
                  "Variable": "$.name",
                  "StringEquals": "Neo"
                },
                {
                  "Variable": "$.isRescued",
                  "BooleanEquals": true
                }
              ],
              "Next": "BlueTask"
            }
          ],
          "Default": "RedTask"
        }
    ````

#### Parallel
- Performs tasks in Parallel
- The state will complete when all of the branches have finished or one of them have failed
- If any of the branches ends in a failure, then the whole Parallel state would end in Failed state

-   ````json
    "parallelState": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "Add",
          "States": {
            "Add": {
              "Type": "Task",
              "Resource": "ARN",
              "End": "true"
            }
          }
        }
      ],
      "Next": "RedTask"
    }
    ````
    
#### Succeed
- Terminates the State Machine execution successfully
- Task, Pass, Wait and Parallel - let us terminate the execution when they are complete but not 
the Choice state, in which case we might need to have a state that represents a successful 
termination for the execution. This is the purpose of Succeed State
- ````json
    "succeedState": {
      "Type": "Succeed"
      }
  ````
#### Fail
- Terminates the State Machine execution and mark it as failure
- We must specify an attribute ``Error`` and ``Cause``
- Fail States are terminal state, so we can't specify additional state transition with ```Next```
- ````json
    "failedState": {
      "Type": "Fail",
      "Error": "InvalidInput",
      "Cause": "Supplied Input is Invalid"
    }
  ````
### Managing Execution State
- The input to the state machine execution is bound to execution state $
- When the Lambda function is invoked, we get the current execution state $ as input in the 
function.
- The returned value from the function is updated to the execution state if ``ResultPath`` id 
defined in the state

-   ````json
        "TaskState":{
          "Type":"Task",
          "Resource":"ARN",              
          "InputPath":"$.n"
          "End": true
        }
    ```` 

- By default, the state gets the current execution state as its input. But we can be more 
selective by using ``InputPath``. Here $.n selects only the attribute n from the current 
execution state 

### Error Handling
- Retry failed states
- Catch any failures that could not be fixed by Retry or wasn't in the scope of Retry, then take 
to different path
- Retry and Catch are only allowed on **Task and Parallel States**
- Both Retry and Catch can be configured against specific error types and there many predefined 
errors
- Predefined error codes
    - States.ALL - matches any error
    - States.Timeout
    - States.TaskFailed
    - States.Permissions
    - States.ALL
- States may report errors with other names, which must not begin with the prefix ``States``

- ````json
   "TaskState": {
     "Type": "Task",
     "Resource": "ARN",
     "Next": "AnotherTask",
     "TimeoutSeconds": "300",
     "ResultPath": "$.n",
     "Retry": [
       {
         "ErrorEquals": [
           "ErrorA",
           "ErrorB"
         ],
         "IntervalSeconds": 1,
         "BackoffRate": 2.0,
         "MaxAttempts": 2
       },
       {
         "ErrorEquals": [
           "ErrorC"
         ],
         "IntervalSeconds": 5,
         
       }
     ],
     "Catch": [
       {
         "ErrorEquals": [
           "States.ALL"
         ],
         "Next": "GoToFailHandlerTask"
       }
     ]
   }
  ````
- MaxAttempts - default is 3. If set 0, it will never retry
- Each ``Retrier`` in ``Retry`` keeps track of its own retry count

### Service Limits
- Steps Functions has below Hard Limits
    - Max open executions - 1M 
    - Max execution time - 1 year
    - Max execution history size - 25K events
    - Max execution idle time - 1 year
    - Max execution history retention time - 90 days
    - Max task execution time - 1 year
    - Max time step function keeps the task in Queue - 1 year
    - Max activity pollers per ARN - 1000 pollers
    - Max input or result data size for a task, state, or execution - 32KB
    
- Steps Functions has below Soft Limits
    - API limits on Step Function APIs. we can't make too many API requests in short time.
    
- If execution needs to be passed >32KB, then store the data in S3, DynamoDB,etc and pass the key
 to the state machine. The Lambda can fetch using the key 

    
    

 
