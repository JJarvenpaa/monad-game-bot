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
    let player = gameData.status.players.find(({ name }) => name == 'JJarvenpaa')
    let money = player.money
    let cardValue = gameData.status.money
    let cardsArray = player.cards
    let tableCard = gameData.status.card
    let cardsLeft = gameData.status.cardsLeft
    let currentWinner = ''

    if(cardsLeft < 24) {
        currentWinner = getCurrentWinner(gameData.status.players)
    } 
    //Previous game was 25
    //Next game is 29
    //We can't track previous game in game order because the gamelisting site has a bug that makes the games show in different order than games played
    //Take a screenshot every time to find out the latest game...
    if(money == 0) {
        takeCard = true;
        
    } else if(cardsLeft == 24 && cardValue >= 3) {
        takeCard = firstRoundPlay(tableCard, cardValue)

    } else if(isSetCard(cardsArray, tableCard)) {
        takeCard = true;

    } else if(currentWinner.name != 'JJarvenpaa' && stealSetCard(currentWinner, tableCard)) {
        takeCard = true

    } else if(money <= 8 && cardValue >= 3) {
        const randNum = Math.ceil(Math.random() * 100) / 100 //round decimals up
        if(tableCard <= 16 && randNum > 0.2) { //Simulate 80% chance of taking card
           takeCard = true  

        } else if(tableCard <= 25 && randNum > 0.4) { takeCard = true } //Simulate 60% chance of taking card 
    }

    //Send action request to API
    let requestBody = JSON.stringify({ takeCard: takeCard })
    gameData = await sendRequest('https://koodipahkina.monad.fi/api/game/' + gameId + '/action', requestBody )
    console.log(gameData.status)

    return gameData
}

const getCurrentWinner = (players) => {
    let pointsMap = getPoints(players)
    console.log(pointsMap)

    //TODO: What to do when many players have lowest points?
    return [...pointsMap.entries()].reduce((minPointsPlayer, currentPlayer) => {
        const [playerObj, points] = currentPlayer;

        if (points < minPointsPlayer[1]) {
            return currentPlayer;
        } else {
            return minPointsPlayer;
        }
    })[0]
}

const getPoints = (players, pointsMap = new Map()) => {
    //Calculate all player points
    for(const p of players) {
        let playerPoints = 0
        let playerCardsArr = p.cards

        if(playerCardsArr.length == 0) {
            playerPoints -= p.money
            pointsMap.set(p, playerPoints)
            continue
        }

        for(const card of playerCardsArr) {
            playerPoints += card[0]
        }

        playerPoints -= p.money 
        pointsMap.set(p, playerPoints)
    }

    return pointsMap
}

const stealSetCard = (currentWinner, tableCard) => {
    let steal = false
    //if(isSetCard(currentWinner))

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

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let gameData = await startGame()
const gameId = gameData.gameId

while(gameData.status.finished === false) {
    await sleep(1000)
    gameData = await playTurn(gameData, gameId)
    console.log(gameData)
}
