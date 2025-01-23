import fetch from 'node-fetch';

async function createGameSession()  {
    //TODO: make a specific error
    if(process.env.TOKEN == undefined) throw new Error("No token found, remember to add it to .env file");
    
    const response = await fetch('https://koodipahkina.monad.fi/api/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.TOKEN,
        },
    });
    //TODO: error handling
    const data = await response.json()

    return data
}

async function startGame() {
    let gameData = await createGameSession()
    console.log(gameData.gameId)
    console.log(gameData.status)

}

startGame()
