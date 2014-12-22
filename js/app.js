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
 * Creates a moveable object.
 * All moveable objects should implement this class.
 * Parameters:
 *  rowPosition - Row position starting at 0 from top-down.
 *  colPosition - Column position starting at 0 from left-to-right
 *  widthBounds - imaginary rectangle width, used to detect collision
 *  heightBounds - imaginary rectangle height, used to detect collision
 */
var Moveable = function(rowPosition, colPosition, image) {
    this.x = colPosition * Const.grid.WIDTH;
    this.y = (rowPosition * Const.grid.HEIGHT) - 41.5; // subtracting 41.5 to center object on grid

    // The image/sprite will be drawn on screen when render() is called
    this.sprite = image;

    // set default width/height bounds
    // Why not use the grid's default width?
    //  Because the collisions seem to happen too early.
    this.widthBounds = 80;
    this.heightBounds = Const.grid.HEIGHT;
};

// Draws the object on screen
Moveable.prototype.render = function() {

    // Crop the image if it passes right bounds
    if (this.x > 404) {
        var width = 505 - this.x;
        ctx.drawImage(Resources.get(this.sprite), 0,0, width, 171, this.x, this.y, width, 171);
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

// Checks to see if current object collides with given object
Moveable.prototype.intersects = function (obj) {
    // Treat both objects as a rectangle.
    // A collision happens when the two rectangles intersect
    return (this.y < obj.y + obj.heightBounds  &&
            this.y + this.heightBounds > obj.y &&
            this.x < obj.x + obj.widthBounds   &&
            this.x + this.widthBounds > obj.x);
};

// Enemies our player must avoid
var Enemy = function(rowPosition, colPosition, image, speed) {
    Moveable.call(this, rowPosition, colPosition, image);
    this.speed = speed; //  Enemy's speed is multiplied by deltaTime * SPEED_FACTOR

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = image;
};

// Enemy extends Moveable class
Enemy.prototype = Object.create(Moveable.prototype);

// Recover Enemy's constructor
Enemy.prototype.constructor = Enemy;

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.x > Const.grid.WIDTH * 5) {
        this.x = -101;
    } else {
        this.x += dt * Const.SPEED_FACTOR * this.speed;
    }
};

// Player Class
var Player = function(rowPosition, colPosition, image) {
    Moveable.call(this, rowPosition, colPosition, image);

    // startX and startY will be the player's respawn position
    this.startX = this.x;
    this.startY = this.y;

    this.gems = {
        blue: 0,
        orange: 0,
        green: 0
    };
    this.keys = 0;

    this.lives = 5;
};

// Player extends Moveable class
Player.prototype = Object.create(Moveable.prototype);

// Recover Player's constructor
Player.prototype.constructor = Player;

// resets player to starting position
Player.prototype.die = function() {
    this.x = this.startX;
    this.y = this.startY;
    this.lives--;
    if (this.lives < 0) {
        //gameOver();
    }
};

// Checks if player intersects enemy
Player.prototype.update = function() {
    var l = allEnemies.length;
    for(var i = 0; i < l; i++) {
        if (this.intersects(allEnemies[i])) {
            this.die();
        }
    }
    l = allGems.length;
    for(var i = 0; i < l; i++) {
        if (this.intersects(allGems[i]) && allGems[i].isAvailable) {
            switch (allGems[i].color) {
                case 1: this.gems.blue += 1; break;
                case 2: this.gems.orange += 1; break;
                case 3: this.gems.green += 1; break;
            }
            allGems[i].isAvailable = false;
        }
    }
};

// Gets called when player releases a valid key
Player.prototype.handleInput = function(keyCode) {

    switch (keyCode) {
        case 'left':
            if (this.x > 0)
                this.x -= Const.grid.WIDTH;
            break;
        case 'right':
            if (this.x < 404)
                this.x += Const.grid.WIDTH;
            break;
        case 'up':
            if (this.y > 0)
                this.y -= Const.grid.HEIGHT;
            break;
        case 'down':
            if (this.y < ctx.canvas.height - 303)
                this.y += Const.grid.HEIGHT;
            break;
    }

};

var Gem = function(rowPosition, colPosition, image) {
    Moveable.call(this, rowPosition, colPosition, image);
    this.color;
    switch (image) {
        case Const.gems.BLUE: this.color = 1; break;
        case Const.gems.ORANGE: this.color = 2; break;
        case Const.gems.GREEN: this.color = 3; break;
        default:
            this.color = 0;
    }
    this.isAvailable = true;
}

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x + 25, this.y + 70, 50,85);
}

var Selector = function(rowPosition, colPosition) {
    Moveable.call(this, rowPosition, colPosition, Const.misc.SELECTOR);
    console.log(this.x);
    console.log(this.y);
}

Selector.prototype = Object.create(Moveable.prototype);
Selector.constructor = Selector;


// Create player at Row: 5 Col: 2
var player = new Player(5, 2, Const.player.BOY);

// Create Enemies
var allEnemies = [];
var allSelectors = [];
var allGems = [];
//var allOrangeGems = [];
//var allBlueGems = [];
//var allgreenGems = [];

function gameLevel(level) {
    // All game levels
    switch (level) {
        case 1:
            allEnemies = [
                //new Enemy(1, -1, Const.enemy.BUG, 2),
                //new Enemy(2, -3, Const.enemy.BUG, 3),
                //new Enemy(3, -1, Const.enemy.BUG, 1),
                //new Enemy(3, -4, Const.enemy.BUG, 1),
            ];
            allSelectors = [0,1,2,3,4];
            allGems = [
                new Gem(1, 1, Const.gems.BLUE),
                new Gem(2, 2, Const.gems.ORANGE),
                new Gem(3, 3, Const.gems.GREEN),
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
