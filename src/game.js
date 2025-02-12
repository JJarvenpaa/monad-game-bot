import sendRequest from './requestService.js';


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

async function startGame() {

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
    

    let currentWinner = getCurrentWinner(gameData.status.players)
    //Previous game was 39
    //Next game is 42
    //We can't track previous game in game order because the gamelisting site has a bug that makes the games show in different order than games played
    //Take a screenshot every time to find out the latest game...
    if(money == 0) {
        console.log('Money 0, have to take card : ' + tableCard + ' of value: ' + cardValue)
        takeCard = true;
        
    } 
    else if(cardsLeft == 24 && cardValue >= 3) {
        takeCard = firstRoundPlay(tableCard, cardValue)

    } else if(cardValue >= 11 && tableCard <= 16) { //give us good money buffer
        console.log('Taking high value card : ' + tableCard + ' of value: ' + cardValue)
        takeCard = true 

    } else if(isSetCard(cardsArray, tableCard) && cardValue >= 1 && tableCard < 30) {
        console.log('Taking a set card : ' + tableCard + ' with value: ' + cardValue)
        takeCard = true

    } /*else if(currentWinner.name != 'JJarvenpaa' && stealSetCard(currentWinner.cards, tableCard) && cardValue >= 1 && money >=8) {
        //TODO: It does happen, but it seems it makes our situation worse
        const randNum = getRandomNum() 
        if(tableCard <= 16 && randNum > 0.4) { //Simulate 60% chance of taking card
            console.log('stealing winners set with 60% chance')
            takeCard = true  
 
        } else if(tableCard <= 25 && randNum > 0.6) { 
            console.log('stealing winners set with 40% chance')
            takeCard = true 
            
        } //Simulate 40% chance of taking card 

    }
    */ 
    //TODO: are we still getting too poor?
    else if(money <= 10 && cardValue >= 3) {
        const randNum = getRandomNum() 
        if(tableCard <= 16 && randNum > 0.3) { //Simulate 70% chance of taking card
            console.log('Taking card : ' + tableCard + ' with randNum > 0.3 : ' + randNum + ' And value of : ' + cardValue)
            takeCard = true  

        } else if(tableCard <= 25 && randNum > 0.5) { 
            console.log('Taking card : ' + tableCard + ' with randNum > 0.5 : ' + randNum + ' And value of : ' + cardValue)
            takeCard = true 
        } //Simulate 50% chance of taking card 
    }

    //Send action request to API
    let requestBody = JSON.stringify({ takeCard: takeCard })
    gameData = await sendRequest('https://koodipahkina.monad.fi/api/game/' + gameId + '/action', requestBody )
    //console.log(gameData.status)

    return gameData
}

const getCurrentWinner = (players) => {
    let pointsMap = getPoints(players)

    //TODO: What to do when many players have lowest points -> Then we can check which of them has most money?
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

const stealSetCard = (winnnerCardsArr, tableCard) => {
    if(isSetCard(winnnerCardsArr, tableCard)) {
         return true 
    } else {
        return false
    }
}

const firstRoundPlay = (tableCard, cardValue) => {
    let takeCard = false

    //For testing only
    //tableCard = 20
    //cardValue = 12
    if(tableCard <= 16 || cardValue >= 11) { 
        console.log('Taking card ' + tableCard + ' in first round with value: ' + cardValue)
        takeCard = true 
    } //Take high value card for good starting economy or a low point first card

    return takeCard
}


const isSetCard = (cardsArray, tableCard) =>  {
    if(cardsArray.length === 0) { return false } 
    //For testing only 
    //cardsArray = [[25], [1, 2], [30]]
    //tableCard = 3
    
    const getSetCard = (cardArr) => {
        if(cardArr.length > 1) { //Already a set, need to check all of them
            for(let i = 0; i < cardArr.length; i++) {
                if(cardArr[i] + 1 == tableCard || cardArr[i] - 1 == tableCard) return true 
            }

        } else if(cardArr[0] + 1 == tableCard || cardArr[0] - 1 == tableCard) { 
            return true 
        } else {
            return false
        }
    }

    if(cardsArray.some(getSetCard)) { 
        return true 

    } else { return false }
}

const getRandomNum = () => {
    return Math.ceil(Math.random() * 100) / 100 //round decimals up
}

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let gameData = await startGame()
console.log('Start game')
const gameId = gameData.gameId

while(gameData.status.finished === false) {
    await sleep(1000)
    gameData = await playTurn(gameData, gameId)
    //console.log(gameData)
}

console.log('Game ended')