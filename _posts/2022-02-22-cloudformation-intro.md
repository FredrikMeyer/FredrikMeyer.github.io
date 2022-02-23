---
layout: post
title: Introduction to AWS CloudFormation
date: 2022-02-22 20:14 +0100
---

In the old days, well before my time as a programmer, you had servers, which maybe had a Java server running, connecting to a Oracle SQL database, managed by some other team.

The infrastructure itself was "simple" (a bunch of servers, a firewall and a database). Then came Kubernetes and cloud providers with managed services, making the number of components larger. To be able to manage the infrastructure in a reprocible way, one would want to keep infrastructure configuration in source control.

Infrastructure as Code is a way of defining infrastructure with code (obviously). This has the advantage that the infrastructure and its configuration can be put in version control, and often also in a CI pipeline. This in turn ensures that whatever is on the Git `main` branch represents the true state of things.

In this post I will explain [AWS' CloudFormation](https://aws.amazon.com/cloudformation/).

The most popular Infrastructure as Code tool is probably [Terraform](https://www.terraform.io/), which looks like below:

```terraform
resource "aws_s3_bucket" "b" {
  bucket = "my-tf-test-bucket"

  Tags = {
    Name        = "My bucket"
    Environment = "Dev"
  }
}
```

This code defines a S3 bucket with an ID `b` and a bucket name `my-tf-test-bucket`. The language of Terraform is the HashiCorp Configuration Language (HCL).

In the AWS world, the two most popular infrastructure as code tools are Terraform and CloudFormation. CloudFormation is natively supported within AWS, and is written in YAML (for good and for worse...).

This is how CloudFormation looks:

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: CloudFormation template for a S3 bucket 
    
Resources:
  MyS3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: i-named-this-bucket
```

_Resources_ are roughly speaking things you can create in AWS: this includes things like Lambda Functions, S3 bucket, IAM roles/permissions so on. They can be referenced by other resources, in order to create a _resource graph_ (this resource refers to that resource, and so on). A single such YAML file defines a _stack_, which is a collection of resources in the same "namespace".

To make things clearer, let us go through a simple example.

Let us first create a bucket using the above snippet. Save it in a file called `my_template.yaml`. Then run the following command with the AWS CLI:

```bash
aws cloudformation deploy \
  --template-file my_template.yaml \
  --stack-name my-stack
```

You will see something like this:
```
Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - my-stack
```

If this completes successfully, it will create a S3 bucket with the name `i-named-this-bucket`.

Let us add a Lambda Function, by adding this to the YAML file:
```yaml
  MyLambda:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: "my-function"
      Handler: index.handler
      Code:
        ZipFile: |
          exports.handler = function(event, context) {
            console.log("I'm a lambda!")
          };
      Runtime: nodejs14.x
      Role: !GetAtt LambdaExecutionRole.Arn

  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Principal:
            Service:
            - lambda.amazonaws.com
          Action:
          - sts:AssumeRole
      Path: "/"
      Policies:
      - PolicyName: root
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
          - Effect: Allow
            Action:
            - logs:*
            Resource: arn:aws:logs:*:*:*
```

Phew! That was a mouthful. The first block defines a Lambda function with the name `my-function`, which only logs the sentence "I'm a lambda!". The next field, `Role`, just defines what the Lambda function is allowed to do. This one is only allowed to log to CloudWatch.

Let's do something slightly more complex. Let the Lambda function be able to list all objects in the bucket. Change the Lambda code to the following:
```js
var AWS = require("aws-sdk");
var s3 = new AWS.S3();
exports.handler = function(event, context) {
    s3.listObjects(
        { Bucket: process.env.S3_BUCKET},
        function (err, data) {
            if (err) throw err;
                console.log(data)
        })
};
```

And add the following policy in the IAM Role:
```yaml
      - PolicyName: list-s3
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - s3:List*
              Resource: !GetAtt MyS3Bucket.Arn
```

Now the lambda will be allowed to list objects in the S3 bucket. For the full template, see [this gist](https://gist.github.com/FredrikMeyer/840d7972b9d197519fa1b2a151ec0a4b).

To deploy this, run the same command as above, and wait for it to finish. To test the Lambda function, go to the Lambda console, and choose "Test". If the function doesn't crash, you will see a green box with its output.

These steps should give the reader an idea of what CloudFormation is and how it works. [The documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html) is very good and has a lot of examples, so I recommend always starting there when wondering about all the possible properties.

As you can see, CloudFormation has a tendency to become quite complex. To keep things under control, a good first step is to use something like [`cfn-lint`](https://github.com/aws-cloudformation/cfn-lint), which can validate your CloudFormation and warn you about problems before you deploy. 

A good next step would be to instead use something like [AWS CDK](https://aws.amazon.com/cdk/) (Cloud Development Kit). This is a framework which takes your favorite programming language and compiles it to CloudFormation. If you're going to write a lot of infrastructure as code in AWS, CDK is definitely the way to go. (but that will be another blog post)

(to clean up, the easiest is to go to the AWS Console, then CloudFormation, then "Delete Stack". Note that some resources are just "orphaned", not deleted. This includes DynamodDB tables and S3 buckets, which must be manually deleted after.)
