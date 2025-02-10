import sendRequest from './requestService.js';


async function startGame() {
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

    //Game 14 is used on current code
    if(money == 0) {
        takeCard = true;
        
    } else if(gameData.status.cardsLeft == 24 && cardValue >= 3) {
        takeCard = firstRoundPlay(tableCard, cardValue)

    } else if(money >= cardValue && checkSetCard(cardsArray, tableCard)) {
        takeCard = true;

    } else if(money >= cardValue && money <= 7 && cardValue >= 3) {
        //take it to keep money situation good
        //We take too many cards now, I think we need to implement some probability based decision here now
        takeCard = true

    } else {
        takeCard = false
    }

    //TODO: enhance bot logic, it takes way too many cards and is poor all the time

    //Send action request to API
    let requestBody = JSON.stringify({ takeCard: takeCard })
    gameData = await sendRequest('https://koodipahkina.monad.fi/api/game/' + gameId + '/action', requestBody )
    console.log(gameData.status)

    return gameData
}


//if not set card and has money, take card if card is smaller or equal to than half of the highest card (36)
const firstRoundPlay = (tableCard, cardValue) => {
    let takeCard = false

    //For testing only
    //tableCard = 20
    //cardValue = 12
    if(tableCard <= 16 || cardValue >= 11) { takeCard = true }

    return takeCard
}


const checkSetCard = (cardsArray, tableCard) =>  {
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
    } else {
        return false
    }
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
