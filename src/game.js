import sendRequest from './requestService.js';

async function startGame() {

    let gameData = await sendRequest()

    return gameData
}

async function playRound(gameData, gameId) {
    
    console.log(gameData.status)
    let player = gameData.status.players.find(({ name }) => name === 'JJarvenpaa')
    let money = player.money
    let cardValue = gameData.status.money
    let cardsArray = player.cards
    let nextCard = gameData.status.card
    let takeCard = false

    if(money == 0) {
        takeCard = true;
        
    } else if(money >= cardValue && checkSetCard(cardsArray, nextCard)) {
        takeCard = true;

    } else if(money >= cardValue && nextCard <= 16) {
        //if not set card and has money, take card if card is smaller or equal to than half of the highest card
        takeCard = true
        
    } else if(money >= cardValue && money < 8 && cardValue > 4) {
        //if money is < 8 and cardValue is > 4, take it to keep money situation good
        takeCard = true

    } else {
        takeCard = false
    }

    let requestBody = JSON.stringify({ takeCard: takeCard })

    //Send action request to API

    gameData = await sendRequest('https://koodipahkina.monad.fi/api/game/' + gameId + '/action', requestBody )
    console.log(gameData.status)

    return gameData
}

//check cardsArray and if one of the cards is offset 1 to the current card return true, otherwise false
const checkSetCard = (cardsArray, nextCard) =>  {
    let takeCard = false

    if(cardsArray.length === 0) { return takeCard } 
    //For testing only 
    //cardsArray = [25, 1, 3, 4]
    //nextCard = 2
    
    cardsArray.forEach(card => {
        if(nextCard + 1 == card || nextCard - 1 == card) takeCard = true 
    });

    return takeCard
}

let gameData = await startGame()
const gameId = gameData.gameId

while(gameData.status.finished === false) {

    gameData = await playRound(gameData, gameId)
    console.log(gameData)
}
