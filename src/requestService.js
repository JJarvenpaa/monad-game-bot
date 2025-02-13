import fetch from 'node-fetch';

export default async function sendRequest(url = 'https://koodipahkina.monad.fi/api/game', body = undefined, method = 'POST') {
    //TODO: how to point process.env to get .env from root
    if(process.env.TOKEN == undefined) throw new Error("No token found, remember to add it to .env file");
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.TOKEN,
            },
            signal: AbortSignal.timeout(5000), 
            body: body,
        });
        //TODO: error handling
        const data = await response.json()
        if(data.message != undefined) {
            throw new Error('API returned error with message: ' + data.message)
            //Handle API specific errors
            //TODO: handle authorization missing
            //TODO: handle wrong authorization
            //TODO: handle game update without body
            //TODO: handle game update with wrong data
        } 
        if(data.errors != undefined && data.errors.length > 0) {
            let errors = ''
            for(const error in data.errors) {
                errors += error
            }

            throw new Error('API returned errors: ' + errors)
        }

        return data
    
    } catch(err) {
        switch(err.name) {
            case 'TimeoutError':
                throw new Error('Request timeout')

            case 'AbortError':
                throw new Error('Fetch aborted by user action')
            
            case 'TypeError':
                throw new Error('TypeError encountered')
            
            default:
                throw new Error(`type: ${err.name}, message: ${err.message}`)
        }
    }
}