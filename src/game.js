import sendRequestWithRetry from './requestService.js';


/*
For testing random with probability
let take80Counter = 0;
let take50Counter = 0;

for(let i = 0; i < 10000; i++) {
    let randNum = getRandomNum();

    if(randNum > 0.5) { 
        take50Counter++; 
    } 
    
    if(randNum > 0.2) {
        take80Counter++;
    }
}
*/


async function playTurn(gameData, gameId) {
    let takeCard = false;
    let player = gameData.status.players.find(({ name }) => name == 'JJarvenpaa');
    let money = player.money;
    let cardValue = gameData.status.money;
    let cardsArray = player.cards;
    let tableCard = gameData.status.card;
    let cardsLeft = gameData.status.cardsLeft;

    //Simulate probability chances. example: 0.45 = 55%
    const highValueCardProb = 0.45; 
    const lowCardProb = 0.3;
    const highCardProb = 0.45;
    
    //let currentWinner = getCurrentWinner(gameData.status.players);
    
    if(money == 0) {
        console.log(`Money 0, have to take card ${tableCard} of value ${cardValue}`);
        takeCard = true;
        
    } 
    else if(cardsLeft == 24 && cardValue >= 3) {
        takeCard = firstRoundPlay(tableCard, cardValue);

    } else if(cardValue >= 11 && tableCard < 30) {
        //give us good money buffer
        const randNum = getRandomNum(); 
        if(randNum > highValueCardProb) {
            takeCard = true; 
            console.log(`Taking high value card ${tableCard} with random number > ${highValueCardProb} And value of ${cardValue}`);
        }

    } else if(isSetCard(cardsArray, tableCard) && cardValue >= 1 && tableCard < 30) {
        console.log(`Taking a set card ${tableCard} with value: ${cardValue}`);
        takeCard = true;
    } 

    /* 
    Idea was to steal the lower scoring players potential set cards
    Leave it for now, but it makes our situation worse like this. Maybe do something else with regarding the current winner?
    else if(currentWinner.name != 'JJarvenpaa' && stealSetCard(currentWinner.cards, tableCard) && cardValue >= 1 && money >=8) {
        const randNum = getRandomNum(); 
        if(tableCard <= 16 && randNum > 0.4) { //Simulate 60% chance of taking card           
            console.log('stealing winners set with 60% chance');
            takeCard = true;  
 
        } else if(tableCard <= 25 && randNum > 0.6) { 
            console.log('stealing winners set with 40% chance');
            takeCard = true; 
            
        } //Simulate 40% chance of taking card

    }
    */ 
    
    else if(money <= 10 && cardValue >= 3) {
        const randNum = getRandomNum(); 
        if(tableCard <= 16 && randNum > lowCardProb) {
            console.log(`Taking card ${tableCard} with random number > ${lowCardProb} And value of ${cardValue}`);
            takeCard = true;  

        } else if(tableCard < 30 && randNum > highCardProb) { 
            console.log(`Taking card ${tableCard} with random number > ${highCardProb} And value of ${cardValue}`);
            takeCard = true; 
        }
    }

    //Send action request to API
    let requestBody = JSON.stringify({ takeCard: takeCard });
    gameData = await sendRequestWithRetry('https://koodipahkina.monad.fi/api/game/' + gameId + '/action', requestBody);

    return gameData;
}

const getCurrentWinner = (players) => {
    let pointsMap = getPoints(players);

    //TODO: What to do when many players have lowest points -> Then we can check which of them has most money?
    return [...pointsMap.entries()].reduce((minPointsPlayer, currentPlayer) => {
        const [playerObj, points] = currentPlayer;

        if (points < minPointsPlayer[1]) return currentPlayer;
        
        return minPointsPlayer;
    })[0]
}

const getPoints = (players, pointsMap = new Map()) => {
    //Calculate all player points
    for(const p of players) {
        let playerPoints = 0;
        let playerCardsArr = p.cards;

        if(playerCardsArr.length == 0) {
            playerPoints -= p.money;
            pointsMap.set(p, playerPoints);
            continue;
        }

        for(const card of playerCardsArr) {
            playerPoints += card[0];
        }

        playerPoints -= p.money; 
        pointsMap.set(p, playerPoints);
    }

    return pointsMap;
}

const stealSetCard = (winnnerCardsArr, tableCard) => {
    if(isSetCard(winnnerCardsArr, tableCard)) {
         return true; 
    } 
        
    return false;
}

const firstRoundPlay = (tableCard, cardValue) => {
    let takeCard = false;

    //For testing only
    //tableCard = 20;
    //cardValue = 12;

    //Take high value card for good starting economy or a low point first card
    if(tableCard <= 16 || (cardValue >= 11 && tableCard < 30)) { 
        console.log(`Taking card ${tableCard} in first round with value ${cardValue}`);
        takeCard = true; 
    } 

    return takeCard;
}


const isSetCard = (cardsArray, tableCard) =>  {
    if(cardsArray.length === 0) return false; 
    //For testing only 
    //cardsArray = [[25], [1, 2], [30]];
    //tableCard = 3;
    
    const getSetCard = (cardArr) => {
        if(cardArr.length > 1) { //Already a set, need to check all of them
            for(let i = 0; i < cardArr.length; i++) {
                if(cardArr[i] + 1 == tableCard || cardArr[i] - 1 == tableCard) return true; 
            }

        } else if(cardArr[0] + 1 == tableCard || cardArr[0] - 1 == tableCard) { 
            return true; 
        } else {
            return false;
        }
    }

    if(cardsArray.some(getSetCard)) return true; 
    
    return false;
}

const getRandomNum = () => {
    return Math.ceil(Math.random() * 100) / 100; //round decimals up
}

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let playCount = 1;
for(let i = 0; i < playCount; i++) {
    let gameData = await sendRequestWithRetry();
    console.log('Start game number: ' + i);
    console.log('-----------------');
    const gameId = gameData.gameId;

    while(gameData.status.finished === false) {
        await sleep(1000);
        gameData = await playTurn(gameData, gameId);
    }

    console.log('Game number ' + i + ' ended');
    console.log('-----------------');
    await sleep(1000);
}