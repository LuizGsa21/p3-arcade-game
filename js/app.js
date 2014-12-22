// Constant object used for convenience
var Const = {
    player: {
        BOY : 'images/char-boy.png',
        CAT_GIRL : 'images/char-cat-girl.png',
        HORN_GIRL : 'char-horn-girl.png',
        PINK_GIRL : 'images/char-pink-girl.png',
        PRINCESS_GIRL : 'images/char-princess-girl.png'
    },
    enemy : {
        BUG : 'images/enemy-bug.png'
    },
    gems : {
        BLUE : 'images/gem-blue.png',
        GREEN : 'images/gem-green.png',
        ORANGE : 'images/gem-orange.png'
    },
    misc : {
        KEY: 'images/Key.png',
        STAR: 'images/Star.png',
        SELECTOR: 'images/Selector.png',
        HEART: 'images/Heart.png'
    },
    grid : {
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
var Static = function(row, col, image) {
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
Static.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// --------- END of Static class

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
var Gem = function(row,col, color, dX, dY, height, width) {

    // Should be set to false when player collects this gem
    this.isAvailable = true;
    // Custom gem settings, use default if not specified
    this.height = height || 85;
    this.width = width || 50;
    this.dX = dX || 25;
    this.dY = dY || 70;

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
    // Set x, y coordinates and sprite image
    Static.call(this, row, col, image);
};

// Draws the object on screen
Gem.prototype.render = function() {
    // resize image and fix offset, then draw image on canvas
    ctx.drawImage(Resources.get(this.sprite), this.x + this.dX, this.y + this.dY, this.width,this.height);
};
// --------- END of Gem class

// Key class
var Key = function(row,col) {
    Static.call(this, row, col, 'images/Key.png');
    this.isAvailable = true;
    this.points = 25;
};

Key.prototype = Object.create(Static.prototype);
Key.prototype.constructor = Key;


// Selector Class
var Selector = function(rowPosition, colPosition) {
    // Set x, y coordinates and sprite image
    Static.call(this, rowPosition, colPosition, 'images/Selector.png');
    // Should be set to false when player collects this gem
    this.isAvailable = true;
};

Selector.prototype = Object.create(Static.prototype);
Selector.constructor = Selector;


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
}

// Draws the object on screen
Dynamic.prototype.render = function() {
    if (this.x < 404) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    } else {
        // Crop the image if it passes right bounds
        var width = 505 - this.x;
        ctx.drawImage(Resources.get(this.sprite), 0,0, width, 171, this.x, this.y, width, 171);
    }
};

// Checks to see if current object collides with given object
Dynamic.prototype.intersects = function (obj) {
    // Treat both objects as rectangles.
    // A collision happens when the two rectangles intersect
    return (this.y < obj.y + obj.heightBounds  &&
    this.y + this.heightBounds > obj.y &&
    this.x < obj.x + obj.widthBounds   &&
    this.x + this.widthBounds > obj.x);
};
// --------- END of Dynamic class

// Enemies our player must avoid
var Enemy = function(row, col, image, speed) {
    Dynamic.call(this, row, col, image);
    this.speed = speed * 100;
};

Enemy.prototype = Object.create(Dynamic.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.x > 505) {
        this.x = -101;
    } else {
        this.x += dt * this.speed;
    }
};

// Player Class
var Player = function(row, col, image) {
    Dynamic.call(this, row, col, image);

    // startX and startY will be the player's respawn position
    this.startX = this.x;
    this.startY = this.y;

    this.lives = 5;
    this.keys = 0;
    this.stars = 0;
    this.gems = {
        blue: 0,
        orange: 0,
        green: 0
    };
};

// Player extends Moveable class
Player.prototype = Object.create(Dynamic.prototype);
Player.prototype.constructor = Player;

// Subtracts life - 1 and resets player to starting position
Player.prototype.die = function() {
    this.x = this.startX;
    this.y = this.startY;
    this.lives--;
    if (this.lives <= 0) {
        //gameOver();
    }
};

// Checks if player intersects a game object
Player.prototype.update = function() {

    // Kill player if toon intersects with an enemy
    var l = allEnemies.length;
    for(var i = 0; i < l; i++) {
        if (this.intersects(allEnemies[i])) {
            this.die();
        }
    }
    // Collect gem
    l = allGems.length;
    for(var i = 0; i < l; i++) {
        if (this.intersects(allGems[i]) && allGems[i].isAvailable) {
            switch (allGems[i].color) {
                case 1: this.gems.blue++; break;
                case 2: this.gems.orange++; break;
                case 3: this.gems.green++; break;
            }
            // make gem unavailable when collected
            allGems[i].isAvailable = false;
        }
    }
    // If player is on top of canvas, check if he is standing a selector
    // Kill player if he is standing on water terrain
    if (this.y < 0) {
        l = allSelectors.length;
        // Assume he is standing on a dead zone
        var isOnSelector = false;
        // check all selectors
        for(var i = 0; i < l; i++) {
            if (this.intersects(allSelectors[i])) {
                isOnSelector = true; // player is in safe zone
                if (allSelectors[i].isAvailable) {
                    this.lives++;
                    allSelectors[i].isAvailable = false;
                }
            }
        }
        // Kill player if not on safe zone
        if (!isOnSelector) {
            this.die();
        }
    }
};

// Gets called when player releases a valid key
Player.prototype.handleInput = function(keyCode) {

    switch (keyCode) {
        case 'left':
            if (this.x > 0)
                this.x -= 101;
            break;
        case 'right':
            if (this.x < 404)
                this.x += 101;
            break;
        case 'up':
            if (this.y > 0)
                this.y -= 83;
            break;
        case 'down':
            if (this.y < 332)
                this.y += Const.grid.HEIGHT;
            break;
    }

};

// Create player at Row: 5 Col: 2
var player = new Player(5, 2, Const.player.BOY);

// Create Enemies
var allEnemies = [];
var allSelectors = [];
var allGems = [];

function gameLevel(level) {
    // All game levels
    switch (level) {
        case 1:
            allEnemies = [
                new Enemy(1, -1, Const.enemy.BUG, 2),
                new Enemy(2, -3, Const.enemy.BUG, 3),
                new Enemy(3, -1, Const.enemy.BUG, 1),
                new Enemy(3, -4, Const.enemy.BUG, 1),
            ];
            allSelectors = [0,1,2,3,4];
            allGems = [
                new Gem(1, 1, 'blue'),
                new Gem(2, 2, 'orange'),
                new Gem(3, 3, 'green')
            ];
            allSelectors = [
                new Selector(0, 0),
                new Selector(0, 2),
                new Selector(0, 4)
            ];
    }
}
gameLevel(1);


// This listens for key releases and sends the keys to
// Player.handleInput() method.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if (allowedKeys[e.keyCode] !== undefined)
        player.handleInput(allowedKeys[e.keyCode]);
});
