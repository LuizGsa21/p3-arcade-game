var audioDie = new Audio('audio/die.wav');
var audioCollect = new Audio('audio/collect_gem.wav');
var audioGameOver = new Audio('audio/gameover.wav');
var audioClearLevel = new Audio('audio/clear_level.wav');
var audioStar = new Audio('audio/star.wav');
var audioTheme = new Audio('audio/theme.mp3');

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
 * Static Class
 * All objects that are static implement this class.
 * Static objects are objects that do not move once placed on canvas
 * Examples: Gems, Stars, Keys, Selectors
 * Parameters:
 *  row - Row position starting at 0 from top-down.
 *  col - Column position starting at 0 from left-to-right
 *  image - The objects image
 */
var Static = function (row, col, image) {
    this.x = col * Const.grid.WIDTH;
    this.y = (row * Const.grid.HEIGHT) - 41.5; // subtracting 41.5 to center object on grid

    // The image/sprite will be drawn on screen when render() is called
    this.sprite = image;

    // set default width/height bounds
    // Why not use the grid or the image's default width?
    //  Because the collisions seem to happen too early.
    this.widthBounds = 80;
    this.heightBounds = 83;
};

// Draws the object on screen
Static.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// --------- END of Static class

var Item = function (row, col, image, isAvailable, audio) {
    Static.call(this, row, col, image);
    // Should be set to false when player collects this item
    // With the exception of keys (keys should only be available after all stars are collected)
    this.audio = audio;
    this.isAvailable = isAvailable;
};

Item.prototype = Object.create(Static.prototype);
Item.prototype.constructor = Item;

Item.prototype.playSound = function () {
    this.audio.currentTime = 0;
    this.audio.play();
};

/**
 * Gem Class
 * @param row
 * @param col
 * @param color
 * @param dX
 * @param dY
 * @param height
 * @param width
 * @constructor
 */
var Gem = function (row, col, color) {

    // Should be set to false when player collects this gem
    this.isAvailable = true;

    // Get image path
    // If color is not valid, set gem color to blue
    var image;
    switch (color) {
        case 'orange':
            this.points = 15;
            this.color = 1;
            image = 'images/gem-orange.png';
            break;
        case 'green':
            this.points = 10;
            this.color = 2;
            image = 'images/gem-green.png';
            break;
        default:
            this.points = 5;
            this.color = 3;
            image = 'images/gem-blue.png';
            break;
    }
    // Set x, y coordinates and sprite image and item availability
    Item.call(this, row, col, image, true, audioCollect);
};

Gem.prototype = Object.create(Item.prototype);
Gem.prototype.constructor = Gem;

// Draws the object on screen
Gem.prototype.render = function () {
    // resize image and fix offset, then draw image on canvas
    ctx.drawImage(Resources.get(this.sprite), this.x + 25, this.y + 70, 50, 85);
};
// --------- END of Gem class

// Key class
var Key = function (row, col) {
    Item.call(this, row, col, 'images/Key.png', false, audioClearLevel);
    this.points = 25;
};

Key.prototype = Object.create(Item.prototype);
Key.prototype.constructor = Key;

var Star = function (row, col) {
    Item.call(this, row, col, 'images/Star.png', true, audioStar);
    this.life = 1;
    this.points = 25;
};

Star.prototype = Object.create(Item.prototype);
Star.prototype.constructor = Star;

// Selector Class
var Selector = function (row, col) {
    // Set x, y coordinates and sprite image
    Static.call(this, row, col, 'images/Selector.png');
};

Selector.prototype = Object.create(Static.prototype);
Selector.constructor = Selector;

var Rock = function (row, col) {
    Static.call(this, row, col, 'images/Rock.png');
};

Rock.prototype = Object.create(Static.prototype);
Rock.constructor = Rock;


/**
 * Dynamic Class
 * All objects that are dynamic implement this class.
 * Dynamic objects are objects that move per frame on canvas
 * Examples: Player, Enemies
 * Parameters:
 *  row - Row position starting at 0 from top-down.
 *  col - Column position starting at 0 from left-to-right
 *  image - The objects image
 */
var Dynamic = function (row, col, image) {
    Static.call(this, row, col, image);
};

// Draws the object on screen
Dynamic.prototype.render = function () {
    if (this.x < 404) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    } else {
        // Crop the image if it passes right bounds
        var width = 505 - this.x;
        if (width > 0) { // this check prevents firefox from crashing the game
            ctx.drawImage(Resources.get(this.sprite), 0, 0, width, 171, this.x, this.y, width, 171);
        }
    }
};

// Checks to see if current object collides with given object
Dynamic.prototype.intersects = function (obj) {
    // Treat both objects as rectangles.
    // A collision happens when the two rectangles intersect
    return (this.y < obj.y + obj.heightBounds &&
    this.y + this.heightBounds > obj.y &&
    this.x < obj.x + obj.widthBounds &&
    this.x + this.widthBounds > obj.x);
};
// --------- END of Dynamic class

// Enemies our player must avoid
var Enemy = function (row, col, image, speed) {
    Dynamic.call(this, row, col, image);
    this.speed = speed * 100;
};

Enemy.prototype = Object.create(Dynamic.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    if (this.x > 505) {
        this.x = -101;
    } else {
        this.x += dt * this.speed;
    }
};

var Bug = function (row, col, speed) {
    Enemy.call(this, row, col, 'images/enemy-bug.png', speed);
};

Bug.prototype = Object.create(Enemy.prototype);
Bug.prototype.constructor = Bug;

// Player Class
var Player = function (row, col, image) {
    Dynamic.call(this, row, col, image);

    // startX and startY will be the player's respawn position
    this.startX = this.x;
    this.startY = this.y;

    this.points = 0;

    this.lives = 5;
    this.keyItems = 0;
    this.stars = 0;
    this.gems = {
        blue: 0,
        orange: 0,
        green: 0
    };

    this.starCount = 0;
    this.currentLevel = 1; // start from level 1
};

Player.prototype = Object.create(Dynamic.prototype);
Player.prototype.constructor = Player;

// Subtracts life by 1 and resets player to starting position
Player.prototype.die = function () {

    if (--this.lives <= 0) {
        audioGameOver.currentTime = 0;
        audioGameOver.play();
        //gameOver();
    } else {
        audioDie.currentTime = 0;
        audioDie.play();
    }
    this.x = this.startX;
    this.y = this.startY;
};

// Checks if player intersects a game object
Player.prototype.update = function () {

    // Kill player if toon intersects with an enemy
    var l = allEnemies.length;
    for (var i = 0; i < l; i++) {
        if (this.intersects(allEnemies[i])) {
            this.die();
        }
    }

    // Collect intersected items
    l = allItems.length;
    for (var i = 0; i < l; i++) {
        if (this.intersects(allItems[i]) && allItems[i].isAvailable) {
            this.handleItem(allItems[i]);
        }
    }
    // If player is on top of canvas, check if he is standing a selector
    // Kill player if he is standing on water terrain
    if (this.y < 0) {
        l = allSelectors.length;
        // Assume he is standing on a dead zone
        var isOnSelector = false;
        // check all selectors
        for (var i = 0; i < l; i++) {
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

// This method recevies an item and updates player stats accordingly
Player.prototype.handleItem = function (item) {

    item.playSound();

    // Check what type of item and update player stats
    if (item instanceof Gem) {

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
                console.log('This gem doesn\'t exist');
        }

    } else if (item instanceof Star) {

        this.lives++; // User gains a lfie
        // If item is a star check if user collected all stars in current level
        if (++this.stars == this.starCount) {
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
        //this.stars = 0; // reset player's starCount
        gameLevel(++this.currentLevel); // next level!

    }
    this.points += item.points;
    // once collected make item unavailable
    item.isAvailable = false;

};

// Gets called when player releases a valid key
Player.prototype.handleInput = function (keyCode) {

    switch (keyCode) {
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

function gameLevel(level) {

    // All game levels
    switch (level) {
        case 1:
            allEnemies = [
                new Bug(1, -1, 2), new Bug(2, -3, 2),
                new Bug(3, -1, 1),
            ];
            allItems = [
                new Gem(1, 0, 'blue'), new Gem(2, 2, 'green'),
                new Gem(1, 4, 'blue'), new Star(0, 2),
                new Key(5, 0)
            ];
            allSelectors = [
                new Selector(0, 2),
            ];
            allObstacles = [
                new Rock(4, 2)
            ];
            break;
        case 2:
            allEnemies = [
                new Bug(1, -1, 1), new Bug(1, -3, 1),
                new Bug(3, -1, 1), new Bug(3, -3, 1),
            ];
            allItems = [
                new Gem(1, 0, 'green'), new Gem(2, 2, 'orange'),
                new Gem(1, 4, 'green'), new Gem(3, 0, 'blue'),
                new Gem(3, 4, 'blue'), new Star(0, 1),
                new Star(0, 3), new Key(5, 0)
            ];
            allSelectors = [
                new Selector(0, 1), new Selector(0, 3)
            ];
            allObstacles = [
                new Rock(2, 0), new Rock(2, 1),
                new Rock(2, 3), new Rock(2, 4)
            ]
            break;
        case 3:
            allEnemies = [
                new Bug(1, -1, 2), new Bug(2, -3, 3),
                new Bug(3, -1, 1), new Bug(3, -3, 1),
            ];
            allItems = [
                new Gem(1, 0, 'orange'), new Gem(2, 0, 'orange'),
                new Gem(2, 4, 'orange'), new Gem(1, 4, 'orange'),
                new Gem(3, 0, 'orange'), new Gem(3, 4, 'orange'),
                new Star(0, 0), new Star(0, 2), new Star(0, 4),
                new Star(2, 2), new Key(5, 0)
            ];
            allSelectors = [
                new Selector(0, 0),
                new Selector(0, 2),
                new Selector(0, 4)
            ];
            allObstacles = [];
            break;
        default:
        //wonGame();
    }

    // Get the number of stars on current game level
    var starCount = 0;
    for (var i = 0; i < allItems.length; i++) {
        if (allItems[i] instanceof Star) {
            starCount++;
        }
    }

    // Number of stars required to reveal key
    player.starCount += starCount;

}

// Create player at Row: 5 Col: 2
var player = new Player(5, 2, Const.player.BOY);

// Create Enemies
var allEnemies = [];
var allItems = [];
var allSelectors = [];
var allObstacles = [];

audioTheme.loop = true;
audioTheme.play();
gameLevel(1);

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
