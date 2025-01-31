import sendRequest from './requestService.js';

async function startGame() {

    let gameData = await sendRequest()

    return gameData
}

async function playTurn(gameData, gameId) {
    
    console.log(gameData.status)
    let takeCard = false
    let player = gameData.status.players.find(({ name }) => name === 'JJarvenpaa')
    let money = player.money
    let cardValue = gameData.status.money
    let cardsArray = player.cards
    let nextCard = gameData.status.card


    //TODO: idea to keep money situation good: if cardValue >= 12, take it. It's a good amount of money
    // This way we can remove moneyBuffer, because I think that makes us go 0 money
    if(money == 0) {
        takeCard = true;
        
    } else if(gameData.status.cardsLeft == 24 && cardValue >= 3) {
        takeCard = firstRoundPlay(nextCard)

    } else if(money >= cardValue && checkSetCard(cardsArray, nextCard)) {
        takeCard = true;

    } else if(money >= cardValue && money <= 7 && cardValue >= 3) {
        //take it to keep money situation good
        takeCard = true

    } else {
        takeCard = false
    }

    //TODO: enhance bot logic, it takes way too many cards and is poor all the time

    let requestBody = JSON.stringify({ takeCard: takeCard })

    //Send action request to API
    gameData = await sendRequest('https://koodipahkina.monad.fi/api/game/' + gameId + '/action', requestBody )
    console.log(gameData.status)

    return gameData
}

//if not set card and has money, take card if card is smaller or equal to than half of the highest card (36)
const firstRoundPlay = (nextCard) => {

    let takeCard = false

    if(nextCard <= 16) { takeCard = true }

    return takeCard
}

//check cardsArray and if one of the cards is offset 1 to the current card return true, otherwise false
const checkSetCard = (cardsArray, nextCard) =>  {
    let takeCard = false

    if(cardsArray.length === 0) { return takeCard } 
    //For testing only 
    //cardsArray = [25, 1, 3, 4]
    //nextCard = 2
    
    cardsArray.forEach(currentCard => {
        if(currentCard + 1 == nextCard || currentCard - 1 == nextCard) takeCard = true 
    });

    return takeCard
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
