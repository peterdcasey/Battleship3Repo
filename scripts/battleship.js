var myApp = {
    view: {
        displayMessage: function(msg) {
            //alert('display message: ' + msg);
            var messageArea = document.getElementById("messageArea");
            messageArea.innerHTML = msg;
        },
        displayHit: function(location) {
            var cell = document.getElementById(location);
            cell.setAttribute("class", "hit");
        },
        displayMiss: function(location) {
            var cell = document.getElementById(location);
            cell.setAttribute("class", "miss"); 
        }
    },

    /*view.displayMiss("00");
    view.displayHit("34");
    view.displayMiss("55");
    view.displayHit("12");
    view.displayMiss("25");
    view.displayHit("26");

    view.displayMessage("Tap tap, is this thing on?"); */

    model: {
        boardSize: 7,
        numShips: 3,
        shipLength: 3,
        shipsSunk: 0,

        ships: [ 
                { locations: [0, 0, 0], hits: ["", "", ""] },
                { locations: [0, 0, 0], hits: ["", "", ""] },
                { locations: [0, 0, 0], hits: ["", "", ""] }, ],
        
        // original hard-coded values for ship locations
        /*
        ships: [ { locations: ["06", "16", "26"], hits: ["", "", ""] },
                { locations: ["24", "34", "44"], hits: ["", "", ""] },
                { locations: ["10", "11", "12"], hits: ["", "", ""] }, ], */

        fire: function(guess) {
            for (var i = 0; i < this.numShips; i += 1) {
                var ship = this.ships[i];
                var index = ship.locations.indexOf(guess);
                
                if (ship.hits[index]) {
                    this.view.displayMessage("Oops, you already hit that location!");
                    return true;
                } else if (index >= 0) {
                    ship.hits[index] = "hit";
                    this.view.displayHit(guess);
                    this.view.displayMessage("HIT!");

                    if (this.isSunk(ship)) {
                        view.displayMessage("You sank my battleship!");
                        this.shipsSunk++;
                    }
                    return true;
                }
            }
            view.displayMiss(guess);
            view.displayMessage("You missed.");
            return false;
        },

        isSunk: function(ship) {
            for (var i =0; i < this.shipLength; i += 1) {
                if (ship.hits[i] !== "hit") {
                    return false;
                }
            }
            return true;
        },

        generateShipLocations: function() {
            var locations;
            
            for (var i = 0; i < this.numShips; i += 1) {
                do {
                    locations = this.generateShip();
                }
                while (this.collision(locations));

                this.ships[i].locations = locations;
            }
            console.log("Ships array: ");
            console.log(this.ships);
        },
        
        generateShip: function() {
            var direction = Math.floor(Math.random() * 2);
            var row;
            var col;

            if (direction === 1) {
                // Generate a starting location for a horizontal ship
                row = Math.floor(Math.random() * this.boardSize);
                col = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1)));
            }
            else {
                // Generate a starting location for a vertical ship
                row = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1)));
                col = Math.floor(Math.random() * this.boardSize);
            }

            var newShipLocations = [];
            for (var i = 0; i < this.shipLength; i += 1) {
                if (direction === 1) {
                    // add location to array for new horizontal ship
                    newShipLocations.push(row + "" + (col + i));
                }
                else {
                    // add location to array for new vertical ship
                newShipLocations.push((row + i) + "" + col); 
                }
            }
            return newShipLocations;
        },

        collision: function(locations) {
            for (var i = 0; i < this.numShips; i += 1) {
                var ship = this.ships[i];
                for (var j = 0; j < locations.length; j += 1) {
                    if (ship.locations.indexOf(locations[j]) >= 0) {
                        return true;
                    }
                }
            }
            return false;
        }
    },

    /* model.fire("53"); // miss
    model.fire("06"); // hit
    model.fire("16"); // hit
    model.fire("26"); // hit
    model.fire("34"); // hit
    model.fire("24"); // hit
    model.fire("44"); // hit
    model.fire("12"); // hit
    model.fire("11"); // hit
    model.fire("10"); // hit
    model.fire("03"); // miss
    model.fire("62"); // miss */

    controller: {
        guesses: 0,

        processGuess: function(guess) {
            var location = controller.parseGuess(guess);
            if (location) {
                this.guesses += 1;
                var hit = model.fire(location);
                if (hit && model.shipsSunk === model.numShips) {
                    view.displayMessage("You sank all my battleships, in "
                                        + this.guesses + " guesses!");
                }
            }
        },

        handleFireButton: function() {
            var guessInput = document.getElementById("guessInput");
            var guess = guessInput.value;
            controller.processGuess(guess);
            guessInput.value = "";
        },
        
        handleKeyPress: function(e) {
            var fireButton = document.getElementById("fireButton");
            e = e || window.event;
        
            if (e.keyCode === 13) {
                fireButton.click();
                //view.displayMessage("");
                return false;
            }
        },
        
        init: function() {
            var fireButton = document.getElementById("fireButton");
            fireButton.onclick = function() {
                var guessInput = document.getElementById("guessInput");
                var guess = guessInput.value;
                controller.processGuess(guess);
                guessInput.value = "";
            };

            var guessInput = document.getElementById("guessInput");
            guessInput.onkeypress = controller.handleKeyPress;
            guessInput.focus();

            addCellEvents();

            /* ADD onclick event to all the TD tags */
            function addCellEvents() {
                // Get list of all table cells
                var tds = document.getElementById("grid").getElementsByTagName("td");
                // Add onclick event to each cell
                for (let i = 0; i < tds.length; i += 1) {
                    tds[i].onclick = function() {
                        let cellNumber = this.id;  // this --> tds[i]
                        let cellLetter = "ABCDEFG"[cellNumber[0]];
                        let cellLoc = cellLetter + cellNumber[1];
                        guessInput.value = cellLoc;
                        controller.handleFireButton();
                    };
                }
            }

            model.generateShipLocations();
        },

        parseGuess: function(guess) {
            var alphabet = ["A", "B", "C", "D", "E", "F", "G"];

            //alert("guess: [" + guess + '] length: ' + guess.length);

            if (guess === null || guess.length !== 2) {
                view.displayMessage("Oops, please enter a letter and a number on the board.");
            }
            else {
                var firstChar = guess.charAt(0).toUpperCase();
                var row = alphabet.indexOf(firstChar);
                var column = guess.charAt(1);

                if (isNaN(row) || isNaN(column)) {
                    view.displayMessage("Oops, that isn't on the board.");
                }
                else if (row < 0 || row >= model.boardsize || column < 0 || column >= model.boardSize) {
                    view.displayMessage("Oops, that's off the board!");
                }
                else {
                    return row + column;
                }
            }
            return null;
        }
    }


    /* console.log(parseGuess("A0"));
    console.log(parseGuess("B6"));
    console.log(parseGuess("G3"));
    console.log(parseGuess("H0"));
    console.log(parseGuess("A7")); */

    /* controller.processGuess("A0"); // miss
    controller.processGuess("A6"); // hit
    controller.processGuess("B6"); // hit
    controller.processGuess("C6"); // hit
    controller.processGuess("C4"); // hit
    controller.processGuess("D4"); // hit
    controller.processGuess("E4"); // hit
    controller.processGuess("B0"); // hit
    controller.processGuess("B1"); // hit
    controller.processGuess("B2"); // hit */

}; // end of myApp

window.onload = myApp.controller.init;
