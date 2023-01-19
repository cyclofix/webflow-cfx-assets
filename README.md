** Deployment **
1. Install AWS CLI

3. setup cli credentials
export AWS_ACCESS_KEY_ID=********
export AWS_SECRET_ACCESS_KEY=**********
export AWS_DEFAULT_REGION=eu-west-3

2. Upload main.js to bucket
> aws s3 cp main.js s3://cyclofixcdn.com/webflow/main.js --acl public-read


