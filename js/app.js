/**
 * Creates a moveable object.
 * All moveable objects should implement this class.
 * Parameters:
 *  rowPosition - Row position starting at 0 from top-down.
 *  colPosition - Column position starting at 0 from left-to-right
 *  widthBounds - imaginary rectangle width, used to detect collision
 *  heightBounds - imaginary rectangle height, used to detect collision
 */
var Moveable = function(rowPosition, colPosition, widthBounds, heightBounds) {
    this.x = colPosition * 101;
    this.y = rowPosition * 83 - 41.5;

    // set default width/height bounds if not specified
    // Why not use the images default width and height?
    //  Because the collisions seem to happen to early.
    this.widthBounds = widthBounds || 80;
    this.heightBounds = heightBounds || 83;
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
var Enemy = function(rowPosition, colPosition, speed) {
    Moveable.call(this, rowPosition, colPosition);
    this.speed = speed; //  Enemy's speed is multiplied by deltaTime * 100

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Enemy extends Moveable class
Enemy.prototype = Object.create(Moveable.prototype);
// Recover lost constructor
Enemy.prototype.constructor = Enemy;

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.x > ctx.canvas.width) {
        this.x = 0;
    } else {
        this.x += dt * 100 * this.speed;
    }
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(rowPosition, colPosition) {
    Moveable.call(this, rowPosition, colPosition);

    // startX and startY will be the player's respawn position
    this.startX = this.x;
    this.startY = this.y;
    this.sprite = 'images/char-boy.png';
};

// Player extends Moveable class
Player.prototype = Object.create(Moveable.prototype);
// Recover lost constructor
Player.prototype.constructor = Player;

// Kills player IN REAL LIFE! lolol jk jk
// resets player to starting position
Player.prototype.die = function() {
    this.x = this.startX;
    this.y = this.startY;
}

// Checks if player intersects enemy
Player.prototype.update = function() {
    var l = allEnemies.length;
    for(var i = 0; i < l; i++) {
        if (this.intersects(allEnemies[i])) {
            this.die();
        }
    }
};

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Gets called when player releases a valid key
Player.prototype.handleInput = function(keyCode) {

    switch (keyCode) {
        case 'left':
            if (this.x > 0)
                this.x -= 101;
            break;
        case 'right':
            if (this.x < ctx.canvas.width - 101)
                this.x += 101;
            break;
        case 'up':
            if (this.y > 83)
                this.y -= 83;
            break;
        case 'down':
            if (this.y < ctx.canvas.height - 303)
                this.y += 83;
            break;
    }

};

// Create player at Row: 5 Col: 2
var player = new Player(5, 2);

// Create Enemies
var allEnemies = [
    new Enemy(1, 0, 2),
    new Enemy(2, 0, 2),
    new Enemy(3, 0, 2)
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
