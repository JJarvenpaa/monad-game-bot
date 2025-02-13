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
            //signal: AbortSignal.timeout(5000), 
            //TODO: timeout 5s is too low
            body: body,
        });
        //TODO: error handling
        const data = await response.json()
        //Handle API specific errors
        if(data.message) {
            let error = data.message
            if(data.summary) error = data.summary

            throw new Error('API returned error with message: ' + error)
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
                throw new Error(`Error in fetch request, type: ${err.name}, message: ${err.message}`)
        }
    }
}