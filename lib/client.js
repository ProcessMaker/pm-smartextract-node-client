const axios = require('axios');
const moment = require('moment');
const FormData = require('form-data');
const utils = require('./utils');
const fs = require('fs');
const path = require('path');
// Removed: const qs = require('querystring');

class PMSmartExtract{
/** Client for accessing Sypht REST API 
 *
 * @constructor
 * @param {Object} options
 * @param {String} apiKey
 * @param {String} [options.apiHost="https://ade-api.processmaker.net"] API hostname
 * @param {Object} [options.auth] authentication info
 */
    constructor(options){
        var arr = utils.processAPIKey(options.apiKey);
        this.clientId = arr[0];
        this.clientSecret = arr[1];
        this.apiHost = options.apiHost || 'https://ade-api.processmaker.net';
        this.authEndpoint = options.authEndpoint || 'https://auth.sypht.com/oauth2/token'; // use oauth2 if not declared
        this.auth = {expiresAt: 0};
    }

    async authenticate() {
        try {
            await this.authenticateV2();               
        } catch(error) {
            throw error;
        }
        
    }

    async authenticateV2() {

        try {
            if(!this.auth.access_token || moment().isAfter(this.auth.expiresAt)) {
                let encodedSecret = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
                let body =  {
                    client_id: this.clientId,
                    grant_type: 'client_credentials'
                }

                let {data} = await axios.post(`${this.authEndpoint}`,
                    new URLSearchParams(body).toString()
                , {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${encodedSecret}`
                    }
                });

                this.auth = data;
                this.auth.expiresAt = moment().unix() + this.auth.expires_in - (10 * 60);  // token expires after 24 hours - 10 minutes
            }
        } catch(error) {
            throw error;
        }
    }

    /** upload a file to Sypht for prediction
     * @param {Array} fieldSets list of fieldset 
     * Supported fieldSets : 'sypht.generic', 'sypht.document','sypht.invoice', 'sypht.bill', 'sypht.bank'
     * @param {String} filePath path to the file to upload
     */
    async fileUpload(products, filePath){
        try{
            await this.authenticate();
            var fileName = path.basename(filePath);
            var fileData = fs.createReadStream(filePath)
            var isValid = await utils.validateFileType(filePath);
            if (!isValid) {
                throw new Error('invalid file : ' + fileName);
            }
            let formData = new FormData();
            formData.append('fileToUpload', fileData, {fileName});
            formData.append('products', JSON.stringify(products));

            let {data} = await axios.post(`${this.apiHost}/fileupload`, formData, {
                headers:{
                    'Authorization':`Bearer ${this.auth.access_token}`,
                    'Content-Type': formData.getHeaders()['content-type']
                }
            });
            return data;
        }catch(error){
            throw error;
        }

    }

    /** fetches results of uploaded file 
     * @param {String} fileId id of uploaded file
     * @returns prediction results
     */
    async fetchResults(fileId){
        try{
            await this.authenticate();

            let {data} = await axios.get(`${this.apiHost}/result/final/${fileId}`, {
                headers:{
                    'Authorization':`Bearer ${this.auth.access_token}`
                }
            });
            return data;
        }catch(error){
            throw error;
        }

    }

    /** retrieves an image copy of the uploaded document. 
     * @param {String} fileId id of uploaded file
     * @param {Number} pageNo page number of the uploaded file to retrieve
     * @returns file data
     */
    async fetchImage(fileId, pageNo){
        try{
            await this.authenticate();

            let {data} = await axios.get(`${this.apiHost}/result/image/${fileId}?page=${pageNo}`, {
                responseType: 'arraybuffer',
                headers:{
                    'Authorization':`Bearer ${this.auth.access_token}`
                }
            });
            return data;
        }catch(error){
            throw error;
        }
    }

}

module.exports = new PMSmartExtract({apiKey : process.env.PMSMARTEXTRACT_API_KEY, authEndpoint : process.env.PMSMARTEXTRACT_AUTH_ENDPOINT, apiHost : process.env.SYPHT_API_HOST});
