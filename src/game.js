import sendRequest from './requestService.js';


async function startGame() {
    let gameData = await sendRequest()

    return gameData
}


async function playTurn(gameData, gameId) {
    //console.log(gameData.status)
    let takeCard = false
    let player = gameData.status.players.find(({ name }) => name === 'JJarvenpaa')
    let money = player.money
    let cardValue = gameData.status.money
    let cardsArray = player.cards
    let nextCard = gameData.status.card


    //Game 8 is used on code without current changes
    //Game 10 is used on current code
    if(money == 0) {
        takeCard = true;
        
    } else if(gameData.status.cardsLeft == 24 && cardValue >= 3) {
        takeCard = firstRoundPlay(nextCard, cardValue)

    } else if(money >= cardValue && checkSetCard(cardsArray, nextCard)) {
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
const firstRoundPlay = (nextCard, cardValue) => {
    let takeCard = false

    //For testing only
    //nextCard = 20
    //cardValue = 12
    if(nextCard <= 16 || cardValue >= 11) { takeCard = true }

    return takeCard
}


const checkSetCard = (cardsArray, nextCard) =>  {
    if(cardsArray.length === 0) { return false } 
    //For testing only 
    //cardsArray = [25, 1, 3, 4]
    //nextCard = 24
    
    //check cardsArray and if one of the cards is offset 1 to the current card return true, otherwise false
    const setCard = (card) => card + 1 == nextCard || card - 1 == nextCard

    if(cardsArray.some(setCard)) return true
   
    return false
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
