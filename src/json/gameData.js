module.exports = {
    memory: {
        MaxPoints: { 2: 2, 3: 4, 4: 8, 5: 12 },
    },
    ladder: {
        SpecialMovesBoard: {  // if a player lands on a "snake" or on a "ladder"
            5: {position: 32, type: "ladder"},  //ladder
            36: {position: 25, type: "snake"}, //snake
            40: {position: 19, type: "snake"}, //snake
            59: {position: 99, type: "ladder"}, //ladder
            78: {position: 55, type: "snake"}, //snake
            91: {position: 54, type: "snake"}, //snake
            75: {position: 97, type: "ladder"}, //ladder
        },
        playerImages: [ // images of all players
            "https://imgur.com/v6NV9Xt.png", //blue (1)
            "https://imgur.com/XwUHv1t.png", //red (2)
            "https://imgur.com/S2qBPvr.png", //green (3)
            "https://imgur.com/DUASf6X.png", //yellow (4)
        ],
        positions: { // If the player hasn't diced yet, default position
            0: {x: 725, y: 484},
            1: {x: 830, y: 484},
            2: {x: 725, y: 589},
            3: {x: 830, y: 589},
        },
        PlayerOffSets: {  // if multiple players are on 1 spot, they are placed next to each other
            0: {x: 0, y: 0},
            1: {x: 26, y: 0},
            2: {x: 0, y: 26},
            3: {x: 26, y: 26},
        },
        boardSize: 686, // The size of the BOARD of the LADDER (not the image),
        defaultplayersize: 86, // The size of the
        playersize: 40,
    }
}