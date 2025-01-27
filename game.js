import fetch from 'node-fetch';

async function createGameSession()  {
    //TODO: make a specific error
    if(process.env.TOKEN == undefined) throw new Error("No token found, remember to add it to .env file");
    
    try {
    const response = await fetch('https://koodipahkina.monad.fi/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.TOKEN,
        },
        signal: AbortSignal.timeout(5000),
    });
    
    const data = await response.json()

    return data

    } catch(err) {
        if (err.name === "TimeoutError") {
            console.error("Timeout: It took more than 5 seconds to get the result!");
        }

        else if (err.name === "AbortError") {
            console.error(
              "Fetch aborted by user action (browser stop button, closing tab, etc.",
            )
        }

        else if (err.name === "TypeError") {
            console.error("AbortSignal.timeout() method is not supported");

        } else {
            // A network error, or some other problem.
            console.error(`Error: type: ${err.name}, message: ${err.message}`);
        }
    }

    
}

async function startGame() {
    let gameData = await createGameSession()

    if(gameData == undefined) return 

    console.log(gameData.gameId)
    console.log(gameData.status)

}

startGame()
