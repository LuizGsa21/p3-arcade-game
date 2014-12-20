/**
 * This class sets the object's starting position and movement speed.
 * All moveable objects should .call() this class.
 * Parameters:
 *  rowPosition - Row position starting at 0 from top-down.
 *  colPosition - Column position starting at 0 from left-to-right
 *  speed - Object's speed, which is multiplied by delta time * 100
 */
var Moveable = function(rowPosition, colPosition, speed) {
    this.x = 0 + (colPosition * 101);
    this.y = (rowPosition * 83) - 41.5;
    this.speed = speed;
};
// Enemies our player must avoid
var Enemy = function(rowPosition, colPosition, speed) {
    Moveable.call(this, rowPosition, colPosition, speed);
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

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
var Player = function(rowPosition, colPosition, speed) {
    Moveable.call(this, rowPosition, colPosition, speed);

    this.sprite = 'images/char-boy.png';
};

// Update the player's position
// Parameter: dt, a time delta between ticks
Player.prototype.update = function(dt) {

};

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Called when player presses an arrow key
Player.prototype.handleInput = function(keyCode) {

};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player(5, 2, 1);
var allEnemies = [
    new Enemy(1, 0, 1),
    new Enemy(2, 0, 1),
    new Enemy(3, 0, 1)
];


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
