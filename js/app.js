
if (!bowser.chrome) {
    // show alert after game loads
    setTimeout(function () {
        alert('Use Chrome browser for best experience. Press OK to continue.')
    }, 0);
}

// Game audio files
var audioDie = new Audio('audio/die.wav');
var audioCollect = new Audio('audio/collect_gem.wav');
var audioGameOver = new Audio('audio/gameover.wav');
var audioClearLevel = new Audio('audio/clear_level.wav');
var audioStar = new Audio('audio/star.wav');
var audioTheme = new Audio('audio/theme.mp3');
audioTheme.loop = true;
audioTheme.play();

// Constant object used for convenience
var Const = {
    player: {
        BOY: 'images/char-boy.png',
        CAT_GIRL: 'images/char-cat-girl.png',
        HORN_GIRL: 'char-horn-girl.png',
        PINK_GIRL: 'images/char-pink-girl.png',
        PRINCESS_GIRL: 'images/char-princess-girl.png'
    },
    enemy: {
        BUG: 'images/enemy-bug.png'
    },
    gems: {
        BLUE: 'images/gem-blue.png',
        GREEN: 'images/gem-green.png',
        ORANGE: 'images/gem-orange.png'
    },
    misc: {
        KEY: 'images/Key.png',
        STAR: 'images/Star.png',
        SELECTOR: 'images/Selector.png',
        HEART: 'images/Heart.png',
        ROCK: 'images/Rock.png'
    },
    grid: {
        WIDTH: 101,
        HEIGHT: 83
    },
    block: {
        GRASS: 'images/grass-block.png',
        STONE: 'images/stone-block.png',
        WATER: 'images/water-block.png'
    },
    canvas: {
        WIDTH: 606,
        HEIGHT: 606
    },
    SPEED_FACTOR: 100
};

/**
 * GameObject class
 * Creates a GameObject on the specified row and column
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @param {string} imagePath Image path
 * @constructor
 */
var GameObject = function(row, col, imagePath) {
    this.x = col * Const.grid.WIDTH;
    this.y = (row * Const.grid.HEIGHT) - 41.5; // subtracting 41.5 to center object on grid

    // set default width/height bounds
    // Why not use the grid or the image's default width?
    // Because the collisions seem to happen too early.
    this.widthBounds = 80;
    this.heightBounds = 83;

    // The image/sprite will be drawn on screen when render() is called
    this.sprite = imagePath;
};
/**
 * StaticGameObject class
 * All objects that are static inherit this class.
 * StaticGameObject are objects that do not move once placed on canvas
 * Examples: Gem, Star, Key
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @param {string} imagePath Image path
 * @constructor
 * @extends {GameObject}
 */
var StaticGameObject = function (row, col, imagePath) {
    // Set the x and y coordinate
    GameObject.call(this, row, col, imagePath);
};

/** Draws the object on canvas */
StaticGameObject.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Item class
 * All items should inherit this class.
 * It provides the item with the ability of being collectable
 * and playing its unique sound by calling playSound()
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @param {string} imagePath Image path
 * @param {boolean} isAvailable Item should be not display on canvas when isAvailable == false (Usually set to false after being collected)
 * @param {number} points number of points the player will get when the item is collected
 * @param {Object} audio
 * @constructor
 * @extends {StaticGameObject}
 */
var Item = function (row, col, imagePath, isAvailable, points, audio) {
    StaticGameObject.call(this, row, col, imagePath);
    this.audio = audio;
    this.isAvailable = isAvailable;
    this.points = points;
};

/** Delagate with StaticGameObject.prototype */
Item.prototype = Object.create(StaticGameObject.prototype);

/** Reclaim Gem constructor */
Item.prototype.constructor = Item;

/** Plays the item's sound  */
Item.prototype.playSound = function () {
    this.audio.currentTime = 0;
    this.audio.play();
};

/**
 * Gem Class
 * Creates a Gem with specified position and color.
 * Colors:
 *   blue = 5 points
 *   green = 10 points
 *   orange = 15 points
 * @param {number} row Row position starting at 0 from top-to-down.
 * @param {number} col Column position starting at 0 from left-to-right.
 * @param {string} color Gem's color, lowercase string value orange, green, or blue.
 *   Gem's color will be set to blue on invalid input.
 * @constructor
 * @extends {Item}
 */
var Gem = function (row, col, color) {

    // Get the specified color and point value, if there's no match set color to blue
    var image;
    var points;
    switch (color) {
        case 'orange':
            points = 15; // the amount of points the player gets when the gem is collected
            this.color = 1; // Gem color value, used to indicate type of gem. Comparing a number is faster than comparing a string.
            image = 'images/gem-orange.png';
            break;
        case 'green':
            points = 10;
            this.color = 2;
            image = 'images/gem-green.png';
            break;
        default:
            points = 5;
            this.color = 3;
            image = 'images/gem-blue.png';
            break;
    }
    // Set x, y coordinates and sprite image and item availability
    Item.call(this, row, col, image, true, points, audioCollect);
};

/** Delagate with Item.prototype */
Gem.prototype = Object.create(Item.prototype);

/** Reclaim Gem constructor */
Gem.prototype.constructor = Gem;

/**
 * Draws the gem on canvas.
 * @override
 */
Gem.prototype.render = function () {
    // Fix offset and resize image, then draw image on canvas
    ctx.drawImage(Resources.get(this.sprite), this.x + 25, this.y + 70, 50, 85);
};

/**
 * Key class
 * Creates a Key on the specified position.
 * Key's isAvailable default value is false.
 * Keys should only become available after player collects all the stars on the current game level.
 * @param {number} row Row position starting at 0 from top-to-down.
 * @param {number} col Column position starting at 0 from left-to-right.
 * @constructor
 * @extends {Item}
 */
var Key = function (row, col) {
    Item.call(this, row, col, 'images/Key.png', false, 25, audioClearLevel);
};

/** Delgate with Item.prototype */
Key.prototype = Object.create(Item.prototype);

/** Reclaim Key constructor */
Key.prototype.constructor = Key;

/**
 * Star class
 * Creates a Star on the specified position.
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @constructor
 * @extends {Item}
 */
var Star = function (row, col) {
    Item.call(this, row, col, 'images/Star.png', true, 25, audioStar);
};

/** Delgate with Item.prototype */
Star.prototype = Object.create(Item.prototype);

/** Reclaim Star constructor */
Star.prototype.constructor = Star;

/**
 * Selector Class
 * Creates a selector on the specified position.
 * Selectors are used as terrain and prevents the player from drowning if standing on water.
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @constructor
 * @extends {StaticGameObject}
 */
var Selector = function (row, col) {
    // Set x, y coordinates and sprite image
    StaticGameObject.call(this, row, col, 'images/Selector.png');
};

/** Delgate with StaticGameObject.prototype */
Selector.prototype = Object.create(StaticGameObject.prototype);

/** Reclaim Select constructor */
Selector.prototype.constructor = Selector;

/**
 * Rock Class
 * Creates a rock on the specified position.
 * Since a player cannot pass through rocks, they are great for creating obstacles.
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @constructor
 * @extends {StaticGameObject}
 */
var Rock = function (row, col) {
    StaticGameObject.call(this, row, col, 'images/Rock.png');
};

/** Delgate with StaticGameObject.prototype */
Rock.prototype = Object.create(StaticGameObject.prototype);

/** Reclaim Rock constructor */
Rock.prototype.constructor = Rock;


/**
 * DynamicGameObject Class
 * All game objects that move after being placed on canvas should inherit this class.
 * Examples: Player, Enemies
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @param {string} imagePath Image path
 * @constructor
 * @extends {GameObject}
 */
var DynamicGameObject = function (row, col, imagePath) {
    GameObject.call(this, row, col, imagePath);
};

/** Draws the object on canvas */
DynamicGameObject.prototype.render = function () {

    // If object isn't near the right side boundaries draw the entire image
    if (this.x < 404) {

        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

    } else {
        // Crop the image if it passes right bounds
        var width = 505 - this.x;
        if (width > 0) { // checking width > 0 prevents firefox from crashing the game
            ctx.drawImage(Resources.get(this.sprite), 0, 0, width, 171, this.x, this.y, width, 171);
        }
    }
};

/**
 * Checks if this object collides with the given object
 * @param {GameObject} obj given object
 * @returns {boolean} returns true if object collides with given object
 */
DynamicGameObject.prototype.intersects = function (obj) {
    // Treat both objects as rectangles.
    // A collision happens when the two rectangles intersect
    return (this.y < obj.y + obj.heightBounds &&
    this.y + this.heightBounds > obj.y &&
    this.x < obj.x + obj.widthBounds &&
    this.x + this.widthBounds > obj.x);
};

/**
 * Enemy class
 * Create an enemy
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @param {string} imagePath Image path
 * @param {number} speed how fast the enemy should move. Formula used: currentX + (deltaTime * speed * 100)
 * @constructor
 * @extends {DynamicGameObject}
 */
var Enemy = function (row, col, imagePath, speed) {
    DynamicGameObject.call(this, row, col, imagePath);
    this.speed = speed * 100;
};

/** Delgate with DynamicGameObject.prototype */
Enemy.prototype = Object.create(DynamicGameObject.prototype);

/** Reclaim Enemy constructor */
Enemy.prototype.constructor = Enemy;

/** Updates the enemy's position. */
Enemy.prototype.update = function (dt) {

    // if the enemy reached the right boundaries, reset its position
    if (this.x > 505) {
        this.x = -101;
    } else {
        this.x += dt * this.speed;
    }
};

/**
 * Creates an Enemy Bug
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @param {number} speed how fast the enemy should move. Formula used: currentX + (deltaTime * speed * 100)
 * @constructor
 * @extends {Enemy}
 */
var Bug = function (row, col, speed) {
    Enemy.call(this, row, col, 'images/enemy-bug.png', speed);
};

/** Delgate with Bug.prototype */
Bug.prototype = Object.create(Enemy.prototype);

/** Reclaim Bug constructor */
Bug.prototype.constructor = Bug;

/**
 * Player class
 * Creates a player
 * @param {number} row Row position starting at 0 from top-to-down
 * @param {number} col Column position starting at 0 from left-to-right
 * @param {string} imagePath Image path
 * @constructor
 * @extends {DynamicGameObject}
 */
var Player = function (row, col, imagePath) {
    DynamicGameObject.call(this, row, col, imagePath);

    // startX and startY will be the player's respawn position
    this.startX = this.x;
    this.startY = this.y;

    // Resets all player stats
    this.reset();
};

/** Delgate with DynamicGameObject.prototype */
Player.prototype = Object.create(DynamicGameObject.prototype);

/** Reclaim Player constructor */
Player.prototype.constructor = Player;

Player.prototype.reset = function() {

    // Player's points, displayed during play
    this.points = 0;

    // Player's life, decreased when player intersects and enemy or drowns on water terrain
    this.lives = 5;
    // Total number of keys collected
    this.keyItems = 0;
    // Total number of stars collected
    this.stars = 0;
    // Total number of gems collected (by color)
    this.gems = {
        blue: 0,
        orange: 0,
        green: 0
    };

    // Number of stars needed to reveal the item Key for the current level
    // This number is calculated when the level is being created in the function startGame()
    this.starCount = 0;
    this.currentLevel = 1; // start game at level 1

    // resets players position
    this.x = this.startX;
    this.y = this.startY;
};
/**
 * Subtracts life by 1 and resets player starting position. If user ran out of lives, resets back to level 1.
 */
Player.prototype.die = function () {


    // resets players position
    this.x = this.startX;
    this.y = this.startY;

    // Subtract life by 1
    this.lives--;

    // play the appropriate sound
    if (this.lives <= 0) {
        // Gameover sound
        audioGameOver.currentTime = 0;
        audioGameOver.play();
    } else {
        // Died sound
        audioDie.currentTime = 0;
        audioDie.play();
    }

};

/**
 * Updates player gameplay stats.
 * Invokes player.die() if player is intersecting an enemy or standing dead zone.
 * Invokes player.handleItem() if player is intersecting an item
 */
Player.prototype.update = function () {

    // Kill player if toon intersects with an enemy
    var l = allEnemies.length;
    var i;

    for (i = 0; i < l; i++) {
        if (this.intersects(allEnemies[i])) {
            this.die();
            return;
        }
    }

    // Collect intersected items
    l = allItems.length;
    for (i = 0; i < l; i++) {
        if (this.intersects(allItems[i]) && allItems[i].isAvailable) {
            this.handleItem(allItems[i]);
        }
    }
    // If player is on row 0, check if he is standing on a dead zone (Example: water terrain)
    if (this.y < 0) {
        l = allSelectors.length;
        // Assume he is standing on a dead zone
        var isOnSelector = false;
        // check all selectors
        for (i = 0; i < l; i++) {
            if (this.intersects(allSelectors[i])) {
                isOnSelector = true; // player is in safe zone
            }
        }
        // Kill player if not on safe zone
        if (!isOnSelector) {
            this.die();
        }
    }
};

/**  recevies an item and updates player stats accordingly */

/**
 * Plays the item's sounds and updates player stats with the given item
 * @param {Item} item item to collect
 */
Player.prototype.handleItem = function (item) {

    // Generic items
    item.playSound();
    this.points += item.points;
    item.isAvailable = false; // once collected make item unavailable

    // Game items have different characteristics
    // So Figure out the type of item then execute the appropriate actions

    if (item instanceof Gem) {

        // Update player stat by gem color
        switch (item.color) {
            case 1:
                this.gems.orange++;
                break;
            case 2:
                this.gems.green++;
                break;
            case 3:
                this.gems.blue++;
                break;
            default:
                console.log('This gem doesn\'t exist'); // this should never be reached.
        }

    } else if (item instanceof Star) {

        this.lives++; // User gains a life
        this.stars++; // update total stars collected
        // If item is a star check if user collected all stars in current level
        // If  this.starts == this.starCount then its time to reveal the Key to advance to the next level
        if (this.stars == this.starCount) {
            // Find the key on allItems and make it visiable on map
            for (var i = 0; i < allItems.length; i++) {
                if (allItems[i] instanceof Key) {
                    allItems[i].isAvailable = true;
                    break; // there should only be one key per level
                }
            }
        }

    } else if (item instanceof Key) { // If user collected a key, advance to next level!
        this.keyItems++;
        this.currentLevel++; // next level!
        startGame(this); // create the level
    }

};

/**
 * Gets called when player releases a valid key
 * Moves player
 * @param {string} direction direction to move player
 */
Player.prototype.handleInput = function (direction) {

    // Only move if player does pass the grid boundaries and is obstacle free (Rocks will prevent player from moving)
    switch (direction) {
        case 'left':
            if (this.x > 0 && this.isObstacleFree(-101, 0))
                this.x -= 101;
            break;
        case 'right':
            if (this.x < 404 && this.isObstacleFree(101, 0))
                this.x += 101;
            break;
        case 'up':
            if (this.y > 0 && this.isObstacleFree(0, -83))
                this.y -= 83;
            break;
        case 'down':
            if (this.y < 332 && this.isObstacleFree(0, 83))
                this.y += 83;
            break;
    }

};

/**
 * Returns true if no obstacle was found
 * @param dx delta x from the players current x position
 * @param dy delta y from the players current y position
 * @returns {boolean} true if no obstacles were found
 */
Player.prototype.isObstacleFree = function (dx, dy) {

    for (var i = 0; i < allObstacles.length; i++) {
        if (this.y + dy < allObstacles[i].y + allObstacles[i].heightBounds &&
            this.y + dy + this.heightBounds > allObstacles[i].y &&
            this.x + dx < allObstacles[i].x + allObstacles[i].widthBounds &&
            this.x + dx + this.widthBounds > allObstacles[i].x) {
            return false;
        }
    }
    return true;
};

/**
 * Before calling this method create global scope
 * arrays called allEnemies, allItems, allSelectors, allObstacles
 *
 * @param {Player} player player to start the game with
 */
function startGame(player) {

    // All game levels
    switch (player.currentLevel) {
        case 1:
            // create map for level 1
            allEnemies = [
                new Bug(1, -1, 2),
                new Bug(2, -3, 2),
                new Bug(3, -1, 1)
            ];
            allItems = [
                new Gem(1, 0, 'blue'),
                new Gem(2, 2, 'green'),
                new Gem(1, 4, 'blue'),
                new Star(0, 2),
                new Key(5, 0)
            ];
            allSelectors = [new Selector(0, 2)];
            allObstacles = [new Rock(4, 2)];
            break;
        case 2:
            // create map for level 2
            allEnemies = [
                new Bug(1, -1, 1),
                new Bug(1, -3, 1),
                new Bug(3, -1, 1),
                new Bug(3, -3, 1)
            ];
            allItems = [
                new Gem(1, 0, 'green'),
                new Gem(2, 2, 'orange'),
                new Gem(1, 4, 'green'),
                new Gem(3, 0, 'blue'),
                new Gem(3, 4, 'blue'),
                new Star(0, 1),
                new Star(0, 3),
                new Key(5, 4)
            ];
            allSelectors = [
                new Selector(0, 1),
                new Selector(0, 3)
            ];
            allObstacles = [
                new Rock(2, 0),
                new Rock(2, 1),
                new Rock(2, 3),
                new Rock(2, 4)
            ];
            break;
        case 3:
            // create map for level 3
            allEnemies = [
                new Bug(1, -1, 2),
                new Bug(2, -3, 3),
                new Bug(3, -1, 1),
                new Bug(3, -3, 1)
            ];
            allItems = [
                new Gem(1, 0, 'green'),
                new Gem(1, 4, 'green'),
                new Gem(3, 0, 'green'),
                new Gem(3, 4, 'green'),
                new Star(0, 0),
                new Star(0, 2),
                new Star(0, 4),
                new Star(2, 2),
                new Key(5, 0)
            ];
            allSelectors = [
                new Selector(0, 0),
                new Selector(0, 2),
                new Selector(0, 4)
            ];
            allObstacles = [
                new Rock(4,0),
                new Rock(4,4),
                new Rock(2,1),
                new Rock(2,3)
            ];
            break;
        case 4:
            // create map for level 4
            allEnemies = [
                new Bug(1, -4, 2),
                new Bug(2, -3, 2),
                new Bug(3, -2, 2),
            ];
            allItems = [
                new Gem(1, 0, 'green'),
                new Gem(1, 4, 'green'),
                new Gem(3, 0, 'green'),
                new Gem(3, 4, 'green'),
                new Star(2, 2),
                new Key(4, 2)
            ];
            allSelectors = [
                new Selector(2, 2)
            ];
            allObstacles = [
                new Rock(3,1),
                new Rock(3,2),
                new Rock(3,3),
                new Rock(4,3),
                new Rock(4,1),
                new Rock(2,1),
                new Rock(2,3)
            ];
            break;
        default:
            // game won
            alert('Congralations!');
    }

    // Get the number of stars on current game level
    var starCount = 0;
    for (var i = 0; i < allItems.length; i++) {
        if (allItems[i] instanceof Star) {
            starCount++;
        }
    }

    // Update the number of stars required to reveal the next key
    player.starCount += starCount;

}

// Create player at Row: 5 Col: 2
var player = new Player(5, 2, Const.player.BOY);

// Creating the global arrays required to start the game
var allEnemies = [];
var allItems = [];
var allSelectors = [];
var allObstacles = [];

// Start the game
startGame(player);

// This listens for key releases and sends the keys to
// Player.handleInput() method.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if (allowedKeys[e.keyCode] !== undefined)
        player.handleInput(allowedKeys[e.keyCode]);
});
