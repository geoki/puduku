let tileSelected = null;
let generation = [];

/*
let rowCategory = ["grass", "fire", "water"];
let colCategory = ["fighting", "flying", "ghost"];
*/

const modal = document.getElementById('inputModal');
const input = document.getElementById('pokemonName');

let rowCategory = [ 
["type", "ice"],
["type", "fire"],
["type", "water"]
]
//only columns can have gen categories
let colCategory = [
["type", "fighting"],
["type", "ghost"],
["type", "rock"]
]

// variable for size of game
let size = 3; 

// +1 for categories
let numRows = size + 1;
let numCols = size + 1;


window.onload = function() {
    setBoard();
}

function setBoard() {
    // sets the board
    for (let r=0; r<numRows; r++) {
        for (let c=0; c<numCols; c++) {
            if (r == 0) {
                let category = document.createElement("div");
                if (c == 0 || !colCategory[c-1]) {
                    category.innerText = "";
                }
                else {
                    category.innerText = colCategory[c-1][1];
                }
                category.classList.add("tile");
                document.getElementById("board").append(category);
            }
            else if (c == 0) {
                let category = document.createElement("div");
                if (!rowCategory[r-1]) {
                    category.innerText = "";
                }
                else {
                    category.innerText = rowCategory[r-1][1];
                }
                category.classList.add("tile");
                document.getElementById("board").append(category);
            }
            else {
                let tile = document.createElement("div");
                tile.id = r.toString() + "-" + c.toString();
                let img = new Image();
                tile.appendChild(img);
    
                tile.id = r.toString() + "-" + c.toString();
    
                tile.addEventListener("click", selectTile);
                tile.classList.add("tile");
                document.getElementById("board").append(tile);
            }
        }
    }
}

function selectTile() {
    if (tileSelected != null) {
        tileSelected.classList.remove("darken");
    }

    tileSelected = this;
    tileSelected.classList.add("darken");
}

async function fetchData() {
    if (!tileSelected) {
        console.log("no tile selected");
        return;
    }

    pokemonName = document.getElementById("pokemonName").value.toLowerCase();
    
    let url = "https://pokeapi.co/api/v2/pokemon/" + pokemonName;

    let res = await fetch(url);
    let pokemon = await res.json();

    checkAnswer(pokemon);
}

function checkAnswer(pokemon) {
    let coords = tileSelected.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if (checkValidRow(pokemon, r) && checkValidCol(pokemon, c)) {
        let pokemonSprite = pokemon.sprites.front_default;
        tileSelected.children[0].src = pokemonSprite;

        // clear selectedTile and text box
        tileSelected.classList.remove("darken");
        tileSelected.classList.add("correct-tile");
        //tileSelected.removeEventlistener("click", selectTile());
        tileSelected = null;
    }
    else {
        console.log("wrong answer");
    }
    
    document.getElementById("pokemonName").value = "";
}

function checkValidCol(pokemon, c) {
    if (colCategory[c-1][0] == "type") {
        return checkType(pokemon, colCategory[c-1][1]);
    }
    else if (colCategory[c-1][0] == "gen") {
        return checkGen(pokemon);
    }
    //return false;
}

function checkValidRow(pokemon, r) {
    if (rowCategory[r-1][0] == "type") {
        return checkType(pokemon, rowCategory[r-1][1]);
    }
}

function checkType(pokemon, type) {
    let result = false;
    for (let i=0; i<pokemon.types.length; i++) {
        if (pokemon.types[i].type.name === type) {
            result = true;
        }
    }
    return result;
}

