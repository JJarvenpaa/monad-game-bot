# monad-game-bot

Monad Rekrypähkinä 2024 

## Running game

Before starting a game remember to create a .env file with TOKEN='token'

Run node with .env 

```bash
node --env-file-if-exists='.env' game.js
```

## Game explained
Link: https://koodipahkina.monad.fi/app/docs

In this year's Rekrypähkinä, your task is to create a bot to play a card game against our developed opponents. This document provides general guidelines for implementing the bot and the game. You can also familiarize yourself with the game by playing a practice match in the browser (practice game results do not affect the challenge).

Note: The focus is not solely on creating the best-performing bot. You should follow general best practices in software development (e.g., keeping secrets secure, avoiding unnecessary global variables, and handling errors properly).

Card Game Rules

General Information:

    4 players | 44 coins | 33 number cards ranging from 3 to 35

Game Start:

    Each player has 11 coins.

    9 random cards are removed, leaving a deck of 24 cards.

Game Flow:

    During their turn, players have two options:

        Bet and place a coin on a card (if a player has 0 coins, they must take a card). If a player places a coin on a card, the next player decides the fate of the same card.

        Take a card and all the coins on it. If a player takes a card, a new card is drawn from the deck, and the same player continues their turn.

Scoring:

    Cards are plus points; coins are minus points.

    Only the lowest card in any sequence of consecutive numbers counts towards the score.

    The goal is to collect as few points as possible.

Game Strategy

Here are some basic strategy elements (similar examples can be found in the tutorial game):

    Manage coins: Running out of coins can force you to take high cards without much benefit.

    Collect consecutive cards: Sequences help reduce points and collect more coins.

    Observe other players: Your decisions can be influenced by the opponents' situations.

    Maximize coin collection: Betting on a card can add coins, which benefits you when you eventually take the card.

Requirements

To be ready for submission, your bot must meet the following requirements:

    100 games: At least 100 games played.

    Difference < 24: Average difference to opponents' scores is less than 24 points.

Following best practices and clean implementation are more important than the bot's performance. Once the bot meets the requirements, its performance is considered sufficient.
