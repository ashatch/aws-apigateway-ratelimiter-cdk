# aws-apigateway-ratelimiter-cdk

* Example CDK orchestration of a rate limiter in AWS API Gateway
* Has two tiers of usage plan

## HOWTO

```
# install
npm i

# show the cloudformation
npm run synth -- -c targetHttpService=https://www.example.com

# deploy
npm run deploy -- -c targetHttpService=https://www.example.com
```
