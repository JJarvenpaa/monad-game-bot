import fetch from 'node-fetch';


export default async function sendRequestWithRetry(url = 'https://koodipahkina.monad.fi/api/game', body = undefined, method = 'POST', retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await sendRequest(url, body, method);
        } catch (err) {
            if (i === retries - 1) {
                console.warn(`Retry request ${i + 1}/${retries} failed`);
                throw err; // Throw error if it's the last retry
            }
        }
    }
}

async function sendRequest(url, body, method) {
    //TODO: how to point process.env to get .env from root
    if(process.env.TOKEN == undefined) throw new Error("No token found, remember to add it to .env file");
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.TOKEN,
            },
            signal: AbortSignal.timeout(10000), 
            body: body,
        });
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
                throw new Error('Fetch aborted by user action or timeout')
            
            case 'TypeError':
                throw new Error('TypeError encountered')
            
            default:
                throw new Error(`Error in fetch request, type: ${err.name}, message: ${err.message}`)
        }
    }
}