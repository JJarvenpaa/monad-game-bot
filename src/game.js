import sendRequest from './requestService.js';


async function startGame() {
    /*
    For testing random with probability
    let take80Counter = 0
    let take50Counter = 0

    for(let i = 0; i < 10000; i++) {
        let test = Math.random() * 100
        let randNum = Math.ceil(test) / 100

        if(randNum > 0.5) { 
            take50Counter++ 
        } 
        
        if(randNum > 0.2) {
            take80Counter++
        }
    }
    */

    let gameData = await sendRequest()

    return gameData
}


async function playTurn(gameData, gameId) {
    let takeCard = false
    let player = gameData.status.players.find(({ name }) => name === 'JJarvenpaa')
    let money = player.money
    let cardValue = gameData.status.money
    let cardsArray = player.cards
    let tableCard = gameData.status.card

    //Previous game was 20
    //Game 28 is used on current code
    //We can't track it in game order because the gamelisting site has a bug that makes the games show in different order than games played
    //Take a screenshot every time to find out the latest game...
    if(money == 0) {
        takeCard = true;
        
    } else if(gameData.status.cardsLeft == 24 && cardValue >= 3) {
        takeCard = firstRoundPlay(tableCard, cardValue)

    } else if(isSetCard(cardsArray, tableCard)) {
        takeCard = true;

    } else if(money <= 8 && cardValue >= 3) {
        const randNum = Math.ceil(Math.random() * 100) / 100 //round decimals up
        if(tableCard <= 16 && randNum > 0.2) { //Simulate 80% chance of taking card
           takeCard = true  

        } else if(tableCard <= 25 && randNum > 0.4) { takeCard = true } //Simulate 60% chance of taking card 
    }

    //TODO: enhance bot logic, it takes way too many cards and is poor all the time

    //Send action request to API
    let requestBody = JSON.stringify({ takeCard: takeCard })
    gameData = await sendRequest('https://koodipahkina.monad.fi/api/game/' + gameId + '/action', requestBody )
    console.log(gameData.status)

    return gameData
}


const firstRoundPlay = (tableCard, cardValue) => {
    let takeCard = false

    //For testing only
    //tableCard = 20
    //cardValue = 12
    if(tableCard <= 16 || cardValue >= 11) { takeCard = true } //Take high value card for good starting economy or a low point first card

    return takeCard
}


const isSetCard = (cardsArray, tableCard) =>  {
    if(cardsArray.length === 0) { return false } 
    //For testing only 
    //cardsArray = [25, 1, 3, 4]
    //tableCard = 2
    
    const setCard = (card) => {
        let isSetCard = false
        if(card[0] + 1 == tableCard || card[0] - 1 == tableCard) { isSetCard = true }

        return isSetCard 
    }

    if(cardsArray.some(setCard)) { 
        return true 

    } else { return false }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let gameData = await startGame()
const gameId = gameData.gameId

while(gameData.status.finished === false) {
    await sleep(1000)
    gameData = await playTurn(gameData, gameId)
    console.log(gameData)
}
