import { App, Construct, Stack, StackProps, Duration } from "@aws-cdk/core";
import { RestApi, HttpIntegration, AuthorizationType, RequestAuthorizer, IdentitySource, ApiKeySourceType, Period } from "@aws-cdk/aws-apigateway";
import { Function, Runtime, Code } from "@aws-cdk/aws-lambda";

interface RateLimitingProxyParams extends StackProps {
  targetHttpService: string
}

class RateLimitingProxy extends Stack {
  public constructor(scope: Construct, id: string, params: RateLimitingProxyParams) {
    super(scope, id, params);

    const authFn = new Function(this, 'authorizerLambda', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromAsset("dist/authorizer")
    });

    const auth = new RequestAuthorizer(this, 'rate-limit-authorizer', {
      handler: authFn,
      identitySources: [IdentitySource.header('X-Src-Host')],
      resultsCacheTtl: Duration.hours(1) // 1 hour is the maximum
    });

    const api = new RestApi(this, 'rate-limiting-proxy', {
      apiKeySourceType: ApiKeySourceType.AUTHORIZER
    });

    const planTier1 = api.addUsagePlan('proxy-tier-1', {
      name: 'proxy-tier-1',
      throttle: {
        rateLimit: 1,
        burstLimit: 1
      },
      quota: {
        limit: 1000,
        period: Period.DAY
      }
    });

    planTier1.addApiStage({
      stage:api.deploymentStage
    });

    const planTier2 = api.addUsagePlan('proxy-tier-2', {
      name: 'proxy-tier-2',
      throttle: {
        rateLimit: 2,
        burstLimit: 2
      },
      quota: {
        limit: 2000,
        period: Period.DAY
      }
    });

    planTier2.addApiStage({
      stage:api.deploymentStage
    });

    api.root.addProxy({
      defaultMethodOptions: {
        requestParameters: {"method.request.path.proxy": true},
        authorizer: auth,
        authorizationType: AuthorizationType.CUSTOM,
        apiKeyRequired: true
      },
      defaultIntegration: new HttpIntegration(params.targetHttpService, {
          httpMethod: 'ANY',
          options: {
            requestParameters: {'integration.request.path.proxy': 'method.request.path.proxy'}
          }
        })
    });

  }
}

const app = new App();
new RateLimitingProxy(app, 'api-gateway-limiter-stack', {
  targetHttpService: app.node.tryGetContext('targetHttpService')
});
