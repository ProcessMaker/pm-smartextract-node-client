# ProcessMaker SmartExtract Nodejs Client
This repository is a Nodejs client library for the ProcessMaker SmartExtract API.

This project is a fork of sypht-node-client by Sypht Pty Ltd (Apache 2.0 license).
Modified and maintained by ProcessMaker as a replacement for the discontinued Sypht service.

## About ProcessMaker SmartExtract
ProcessMaker SmartExtract is an API that extracts structured data from documents (PDFs, image, etc.)

## Installation

```Bash
npm install pm-smartextract-node-client
```


## Usage
Populate system environment variable with your API client_id and client_secret credentials:

```Bash
PMSMARTEXTRACT_API_KEY="$client_id:$client_secret"
PMSMARTEXTRACT_AUTH_ENDPOINT="https://auth0.ade.processmaker.net/oauth2/token"
```

then invoke the client with a file of your choice:
```javascript
var client = require('pm-smartextract-node-client');

async function main () {
    var data = await client.fileUpload(['sypht.invoice'], './sample_invoice.pdf');
    data = await client.fetchResults(data['fileId']);
    console.log(JSON.stringify(data, null, 2));
} 

```

## License
The software in this repository is available as open source under the terms of the Apache License.

## Code of Conduct
Everyone interacting in the project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the code of conduct.
