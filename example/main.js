var client = require('../../pm-smartextract-node-client');

async function main () {
    var data = await client.fileUpload(['invoice:2'], '../sample_invoice.pdf');
    data = await client.fetchResults(data['fileId']);
    return JSON.stringify(data, null, 2);
} 

main().then(
    data => console.log(data)
)
.catch(
    e => console.log(e)
);