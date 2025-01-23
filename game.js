import fetch from 'node-fetch';


//TODO: 1. Create game with POST request
//      2. Use a secret file with authentication code 
var gameData = null
var token = null

async function createGameSession()  {

    const response = await fetch('https://koodipahkina.monad.fi/api/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    });
    //TODO: error handling
    const data = await response.json()

    return data
}

async function startGame() {
    gameData = await createGameSession()

}

startGame()
