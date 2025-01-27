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
    //I'm always the first player
    let player = gameData.status.players[0]
    let money = player.money
    let cardValue = gameData.status.money
    let cardsArray = player.cards

    let takeCard = false

    // function to check if card is a set, take it if money
    if(money >= cardValue && checkSetCard(cardsArray, gameData.status.card)) {
        takeCard = true;
    } 
    
}

const checkSetCard = (cardsArray, nextCard) =>  {
    let takeCard = false
    //check cardsArray and if one of the cards is offset 1 to the current card return true, otherwise false
    //For testing only 
    //cardsArray = [25, 1, 3, 4]
    //nextCard = 2
    
    cardsArray.forEach(card => {
        if(nextCard + 1 == card || nextCard - 1 == card) takeCard = true 
    });

    return takeCard
}

startGame()
