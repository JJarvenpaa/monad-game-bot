import fetch from 'node-fetch';

async function getGame() {
    const response = await fetch('https://koodipahkina.monad.fi/api');
    const data = await response.json();
    console.log(data);
}

getGame()
