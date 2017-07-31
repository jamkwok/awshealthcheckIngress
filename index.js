const AWS = require('aws-sdk');
const request_promise = require('request-promise');
// Create EC2 service object
const ec2 = new AWS.EC2({region: 'ap-southeast-2'});

request_promise('https://ip-ranges.amazonaws.com/ip-ranges.json')
.then((data) => {
  const json = JSON.parse(data);
  console.log(json);
  const IPv4Ranges = json.prefixes.filter((ipv4) => {
    return ipv4.ip_prefix;
  }).filter((ipv4) => {
    return ipv4.service === 'ROUTE53' || ipv4.service === 'ROUTE53_HEALTHCHECKS';
  }).map((IP) => {
   return {"CidrIp":IP.ip_prefix}
  });
  console.log(IPv4Ranges);
  /////////////////

  var paramsIngress = {
    GroupId: 'sg-1e110379',
    IpPermissions:[
       { IpProtocol: "tcp",
         FromPort: 443,
         ToPort: 443,
         IpRanges: IPv4Ranges
       }
    ]
  };
  ec2.authorizeSecurityGroupIngress(paramsIngress, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Ingress Successfully Set", data);
    }
  });

  /////////////////
})
.catch((err) => {
    console.log(err);
    // Crawling failed...
});
