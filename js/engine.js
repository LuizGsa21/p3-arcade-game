/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = Const.canvas.WIDTH;
    canvas.height = Const.canvas.HEIGHT;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        if (player.currentLevel > 4) {
            alert('Congratulation! You won!! Your journey ends here...');
            player.reset();
            playerStatPoints = 0;
            startGame(player);
        } else if (player.lives <= 0) {
            alert('You died! The game has restarted to level 1.');
            player.reset();
            playerStatPoints = 0;
            startGame(player);
        }
        updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {

        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                Const.block.WATER,   // Top row is water
                Const.block.STONE,   // Row 1 of 3 of stone
                Const.block.STONE,   // Row 2 of 3 of stone
                Const.block.STONE,   // Row 3 of 3 of stone
                Const.block.GRASS,   // Row 1 of 2 of grass
                Const.block.GRASS    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        // Clears entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * Const.grid.WIDTH, row * Const.grid.HEIGHT);

            }
        }

        for (var i = 0; i < allSelectors.length; i++) {
            allSelectors[i].render();
        }

        renderObstacles();

        renderItems();

        renderEntities();

        // Draws player stats
        playerStats();
    }

    /**
     * Draws all the custom obstacles (Example: Rocks)
     */
    function renderObstacles() {
        for (var i = 0; i < allObstacles.length; i++) {
            allObstacles[i].render();
        }
    }

    /**
     * Draws all available items
     */
    function renderItems() {
        for (var i = 0; i < allItems.length; i++) {
            if (allItems[i].isAvailable) {
                allItems[i].render();
            }
        }
    }

    /**
     * Draws the player stats on canvas
     */
    function playerStats() {

        var i;
        /**
         * Draws the player's health (hearts on the top left)
         */
        for (i = 0; i < player.lives; i++) {
            ctx.drawImage(Resources.get(Const.misc.HEART), 30 * i, 0, 30,50);
        }

        // By incrementing playerStatPoints on every tick
        // the player gets to visually see his/her points increase
        if (player.points > playerStatPoints) {
            playerStatPoints++;
        }

        ctx.fillText('Points: ' + playerStatPoints, 515, 115);

        // Draw the reset of the items along with their current collect count
        ctx.drawImage(Resources.get(Const.misc.STAR), 512, 110, 40, 68); // Star
        ctx.fillText('x' + player.stars, 546, 165);

        ctx.drawImage(Resources.get(Const.misc.KEY), 512, 150, 40, 68); // Key
        ctx.fillText('x' + player.keyItems, 546, 205);


        // blue orange and gree gems
        for (i = 0; i < gems.length; i++) {
            ctx.drawImage(Resources.get(gems[i]), 516, 200 + (i * 40), 30, 51);
            ctx.fillText('x' + player.gems[playerGems[i]], 546, 240 + (i * 40));
        }

    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        Const.block.STONE,
        Const.block.WATER,
        Const.block.GRASS,
        Const.enemy.BUG,
        Const.player.BOY,
        Const.misc.HEART,
        Const.gems.BLUE,
        Const.gems.GREEN,
        Const.gems.ORANGE,
        Const.misc.KEY,
        Const.misc.SELECTOR,
        Const.misc.STAR,
        Const.misc.ROCK
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    // Default font used
    ctx.font = '12pt Calibri';

    var gems = [
        Const.gems.BLUE,
        Const.gems.ORANGE,
        Const.gems.GREEN
    ];

    var playerStatPoints = 0; // Used for creating a visual effect when increasing the player's points

    var playerGems = Object.keys(player.gems);

})(this);
