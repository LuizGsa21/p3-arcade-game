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
    gem : {
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
        WIDTH: 505,
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
var Moveable = function(rowPosition, colPosition, image, widthBounds, heightBounds) {
    this.x = colPosition * Const.grid.WIDTH;
    this.y = (rowPosition * Const.grid.HEIGHT) - 41.5; // subtracting 41.5 to center object on grid

    // The image/sprite will be drawn on screen when render() is called
    this.sprite = image;

    // set default width/height bounds if not specified
    // Why not use the grid's default width?
    //  Because the collisions seem to happen too early.
    this.widthBounds = widthBounds || 80;
    this.heightBounds = heightBounds || Const.grid.HEIGHT;
};

// Draws the object on screen
Moveable.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Checks to see if current object collides with given object
Moveable.prototype.intersects = function (obj) {
    // Treat both objects as a rectangle.
    // A collision happens when the two rectangles intersect
    return (this.y < obj.y + obj.heightBounds  &&
            this.y + this.heightBounds > obj.y &&
            this.x < obj.x + obj.widthBounds   &&
            this.x + this.widthBounds > obj.x);
}

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
    if (this.x > ctx.canvas.width) {
        this.x = 0;
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
};

// Gets called when player releases a valid key
Player.prototype.handleInput = function(keyCode) {

    switch (keyCode) {
        case 'left':
            if (this.x > 0)
                this.x -= Const.grid.WIDTH;
            break;
        case 'right':
            if (this.x < ctx.canvas.width - Const.grid.WIDTH)
                this.x += Const.grid.WIDTH;
            break;
        case 'up':
            if (this.y > Const.grid.HEIGHT)
                this.y -= Const.grid.HEIGHT;
            break;
        case 'down':
            if (this.y < ctx.canvas.height - 303)
                this.y += Const.grid.HEIGHT;
            break;
    }

};

// Create player at Row: 5 Col: 2
var player = new Player(5, 2, Const.player.BOY);

// Create Enemies
var allEnemies = [
    new Enemy(1, 0, Const.enemy.BUG, 2),
    new Enemy(2, 0, Const.enemy.BUG, 2),
    new Enemy(3, 0, Const.enemy.BUG, 2)
];


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
