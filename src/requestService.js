import fetch from 'node-fetch';

export default async function sendRequest(url = 'https://koodipahkina.monad.fi/api/game', body = undefined, method = 'POST') {
    //TODO: how to point process.env to get .env from root
    if(process.env.TOKEN == undefined) throw new Error("No token found, remember to add it to .env file");
    
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.TOKEN,
        },
        body: body,
    });
    //TODO: error handling
    const data = await response.json()

    return data
}