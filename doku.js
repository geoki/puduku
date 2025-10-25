// global variables
let tileSelected = null;
let generation = [];

/*
let rowCategory = ["grass", "fire", "water"];
let colCategory = ["fighting", "flying", "ghost"];
*/

let rowCategory = [ 
["type", "grass"],
["type", "fire"],
["type", "water"],
["type", "steel"],
["type", "fairy"],
["type", "fighting"]
]

let colCategory = [
["type", "monotype"],
["type", "ghost"],
["type", "rock"],
["type", "ice"],
["type", "psychic"],
["type", "electric"],
]

// variable for size of game
let size = 6; 

// +1 for categories
let numRows = size + 1;
let numCols = size + 1;

let score = 0;
let tries = 0;
let goal = size * size;

window.onload = function() {
    modal = document.getElementById("inputModal");
    input = document.getElementById("pokemonName");
    suggestions = document.getElementById("suggestions");
    overlay = document.getElementById("overlay");

    loadPokemonList();
    setBoard();
}

function setBoard() {
    // sets the board
    for (let r=0; r<numRows; r++) {
        for (let c=0; c<numCols; c++) {
            if (r == 0) { // category tiles for rows
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
            else if (c == 0) { // category tiles for columns
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
            else { // for game tiles
                let tile = document.createElement("div");
                tile.id = r.toString() + "-" + c.toString();
                let img = new Image();
                tile.appendChild(img);
                tile.classList.add("tile");
                
                // opens modal on click
                tile.addEventListener("click", () => openModal(tile));

                document.getElementById("board").append(tile);
            }
        }
    }
    // autocomplete/suggestion functionality
    input.addEventListener("input", () => {
        const query = input.value.toLowerCase();
        suggestions.innerHTML = "";

        if (query.length < 2) {
            suggestions.style.display = "none";
            return;
        }
        
        const matches = allPokemon.filter(name => name.startsWith(query)).slice(0, 10);
        if (matches.length === 0) {
            suggestions.style.display = "none";
            return;
        }

        matches.forEach(name => {
            const li = document.createElement("li");
            li.textContent = name;
            li.addEventListener("click", () => {
                input.value = name;
                suggestions.style.display = "none";
            });
            suggestions.appendChild(li);
        });
        suggestions.style.display = "block";
    })

};

function openModal(tile) {
    if (tile.classList.contains("correct-tile")) {
        return;
    }

    if (tileSelected && tileSelected !== tile) {
        tileSelected.classList.remove("darken");
    }

    tileSelected = tile;
    tileSelected.classList.add("darken");

    getCategories();

    modal.style.display = "flex";
    overlay.style.display = "block";
    input.value = "";  
    input.focus(); 
}

function closeModal() {
    if (tileSelected) {
        tileSelected.classList.remove("darken");
    }

    modal.style.display = "none";
    overlay.style.display = "none";
    tileSelected = null;
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

        modal.style.display = "none";
        tileSelected = null;
        score += 1;
        console.log("correct answer! score: " + score);

        closeModal();
    }
    else {
        modal.style.display = "none";
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
    if (type === "monotype" && pokemon.types.length === 1) {
        return true;
    }
    for (let i=0; i<pokemon.types.length; i++) {
        if (pokemon.types[i].type.name === type) {
            result = true;
        }
    }
    return result;
}

async function loadPokemonList() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1500");
    const data = await response.json();
    allPokemon = data.results
    .map(p => p.name)
    .filter(name =>
        !name.includes("-totem") &&
        !name.includes("-starter") && 
        !name.includes("-original") &&
        !name.includes("-partner") &&
        !name.includes("-cosplay") &&
        !name.includes("-cap") &&
        !name.includes("-meteor")
    )
    //.map(name => name.replace(/-/g," "));
}

function getCategories() {
    let categoriesDiv = document.getElementById("categoriesLabel");
    let coords = tileSelected.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    categoriesDiv.innerText = rowCategory[r-1][1] + " | " + colCategory[c-1][1];
}

window.addEventListener("click", (e) => {
    if (e.target === overlay || e.target === modal) {
        closeModal();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
    }
    else if (e.key === "Enter" && modal.style.display === "flex") {
        fetchData();
    }
});