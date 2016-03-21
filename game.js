window.onload = function(){
	
// TODO


// create a "power bar" to show time left on powerups

// TODO create a tween fade out effect for the power colors


// also: make the platforms change color (cool to warm) based on speed (to increase stress as speed goes up muahaha) (again, tweening fade?)

// make background change as score goes up to feel like you're getting higher (tweening fade?)

// would also be nice to pause the game on losing focus

// also text so we know what the powerups do
	
	// initialize the game with window size, type
	var game = new Phaser.Game(640, 480, Phaser.CANVAS);
	
	// variables
	var ninja; // player
	var ninjaGravity = 1000;
	var ninjaJumpPower = 450;
	var score = 0;
	var scoreText;
	var topScore;
	var placedPlats;
	var platGroup;
	var starsGroup;
	var minPlatGap = 50;
	var maxPlatGap = 170;
	var platHeight = 100;
	var ninjaJumping = false;
	var ninjaFalling;
	var cursors;
	var platSpeed = 0;
	
	var platWidth = 140;
	
	var gameWidth = 640;
	var gameHeight = 480;
	
	var ninjaSize = 30;
	
	var lastScore = 0;
	
	var startSpeed = 60;
	
	var placedStars;
	
	var platsLanded = 0;
	
	var endPower = false;
	
	var powercolors;
	var powerbar;
	
	var bonusGroup;
	
	var clouds;
	var smallclouds;
	var darkSky;
	
	//var ground;
	
	var loadbar;
	

	
	var play = function(game){};
	play.prototype = {
		
		preload:function(){
		// load the ninja and platforms and sky and stars
			game.load.image("ninja", "assets/ninja.png");

			game.load.image("sky", "assets/sky.png");
			
			//game.load.spritesheet("platforms", "assets/allplats.png", 400, 32);
			
			game.load.image("platforms", "assets/platformgreen.png");
			
			game.load.spritesheet("star", "assets/starsheet.png", 24, 22);
			
			game.load.spritesheet("powercolors", "assets/powercolors1.png", gameWidth, gameHeight);
			
			game.load.spritesheet("powerbars", "assets/powerbars.png", 640, 21);
			
			game.load.image("clouds", "assets/clouds3.png");
			
			game.load.spritesheet("smallclouds", "assets/smallclouds329.png", gameWidth, 329);
			
			//game.load.image("ground", "assets/ground.png");
			
			game.load.image("loadbar", "assets/loadbargreen.png");
			
		},
		create:function(){
			
			//game.world.setBounds(0, 0, 1920, 1200);
			
			
			// add background
			game.add.sprite(0,0, "sky");
			clouds = game.add.sprite(0, gameHeight - 329 , "clouds");
			
			smallclouds = game.add.sprite(0, 0, "smallclouds");
			game.physics.arcade.enable(smallclouds);
			smallclouds.body.immovable = true;
			
			//ground = game.add.sprite(0, gameHeight - 80, "ground");
			//game.physics.arcade.enable(ground);
			//ground.body.immovable = true;
			

			
			// by default, ninja isn't jumping or falling
			ninjaJumping = false;
			ninjaFalling = false;
			
			// score starts at 0
			score = 0;
			
			// no plats placed yet
			placedPlats = 0;
			placedStars = 0;
			
			// add plat group
			platGroup = game.add.group();
			starsGroup = game.add.group();
			bonusGroup = game.add.group();
			
			// add powerbar
			
			// powerbar on bottom
			powerbar = game.add.sprite(0, gameHeight - 21, "powerbars");
			
			// powerbar on top
			//powerbar = game.add.sprite(0, 0, "powerbars");
			powerbar.alpha = 1;
			
			powerbar.frame = 0;
			
			
			// add powercolors
			powercolors = game.add.sprite(0,0, "powercolors");
			powercolors.frame = 6;
			
			// if topNinjaRunnerScore doesn't exist in storage (aka is null), set score to 0, else set it to stored value
			topScore = localStorage.getItem("topNinjaRunnerScore") === null? 0 : localStorage.getItem("topNinjaRunnerScore");
			
			// set text placeholder
			scoreText = game.add.text(10,10, "-", {font:"bold 16px Arial"});
			
			// call updateScore, which changes placeholder to show score and top score
			updateScore();
			
			// set background color
			game.stage.backgroundColor = "#87CEEB";
			
			// start game physics
			game.physics.startSystem(Phaser.Physics.ARCADE);
			
			// add ninja from preload
			ninja = game.add.sprite(80, 320, "ninja");
			
			// set last plat to 1
			ninja.lastPlat = 0;
			
			// enable physics on ninja and set gravity
			game.physics.arcade.enable(ninja);
			ninja.body.gravity.y = ninjaGravity;
			
			game.physics.arcade.enable(clouds);
			clouds.body.immovable = true;
			
			// call addplat function to create initial ground
			addPlat("ground");
			
			// set up keyboard controls
			cursors = game.input.keyboard.createCursorKeys();
			

		},
		
		// game loop
		update:function(){
			
			
			// sense collision between ninja and platforms
			game.physics.arcade.collide(ninja, platGroup, checkLanding);
			
			// sense collision between ninja and stars
			game.physics.arcade.collide(ninja, starsGroup, gotStar);
			
			// collide ninja with bonus platforms
			game.physics.arcade.collide(ninja, bonusGroup, checkLanding);
			
			//game.physics.arcade.collide(ninja, ground, checkLanding);
			
			
			if (clouds.body.y > gameHeight)
				clouds.body.velocity.y = 0;
			if (smallclouds.body.y > gameHeight + 5){

					smallclouds.body.velocity.y = 0;
			}
			
			
				
			
			
			
			// if ninja falls past bottom of game, die
			if (ninja.body.y > gameHeight){

				die();
			}
			
			// set up movement
			ninja.body.velocity.x = 0;
			
			if (cursors.left.isDown){
				
				// move left
				ninja.body.velocity.x = -500;

			} 
			else if (cursors.right.isDown){
				
				// move right
				ninja.body.velocity.x = 500;
			}
			

			
			// jump
			if (cursors.up.isDown){
				
				if (ninja.body.touching.down){
					ninjaJumping = true;
					ninja.body.velocity.y = -ninjaJumpPower;
					
				}
				
				cursors.up.enabled = false;
				
			} else {
				ninjaJumping = false;
				cursors.up.enabled = true;

			}
		}
	}
	
	// put game in a state of play (as opposed to loading or something else)
	game.state.add("Play", play);
	game.state.start("Play");
	
	// define updateScore to update score text
	function updateScore(){
		scoreText.text = "Score: " + score + "\nLast Score: " + lastScore + "\nBest: " + topScore;
	}
	
	// define add new platforms function
	function addNewPlats(){
		
		// will represent highest platform thus far (lower y's = higher plats)
		// set initial value to the height of the game
		var minPlatY = gameHeight;
		var lastPlatX = 0;
		
		// for each item already in platgroup, run this function on current value (item) in array
		platGroup.forEach(function(item){
			
			// Math.min returns the smallest number among values
			minPlatY = Math.min(item.y, minPlatY)
			lastPlatX = item.x;

		});
		
		// define whether platform will be to left or right
		var posOrNeg = 1;
		
		// if platform is near right edge of screen
		if (lastPlatX + (platWidth / 2) >= gameWidth){
			posOrNeg = -1;
		}
		// if platform is away from left edge
		else if (lastPlatX - (platWidth / 2) > platWidth){
			
			// randomize left or right
			posOrNeg = Math.random() < 0.5 ? -1 : 1;
		}
		
		// define the random x value to place the next platform
		// should be within a min distance , but also not right above
		var rand = game.rnd.between(1,2);

		var nextPlatX = lastPlatX + platWidth * rand * posOrNeg
		if (nextPlatX > gameWidth - 70){

			nextPlatX = nextPlatX - platWidth * 3;
		} 
		else if (nextPlatX < 0) {


			nextPlatX = nextPlatX + platWidth * 3;
		}
	
		var nextPlatY = minPlatY - platHeight;
		addPlat(nextPlatX, nextPlatY);
	}
	
	function gotStar(n, s){
		
		type = s.type;
		var x = s.body.x;
		var y = s.body.y;
		
		givePower(type, x,  y);
		
		s.destroy();
	}
	
	function addPlat(platX, platY){
		
		// set initial platform 
		if (platX === "ground"){
			
			var plat = new Plat(game, 80, 400);
			game.add.existing(plat);
			plat.anchor.set(0.5, 0);
			platGroup.add(plat);
			
			// generate random height above this platform
			var nextPlatY = 300;
			
			// generate random x value to the right of this platform
			var nextPlatX = 80 + platWidth;
			
			// call itself (recursive)
			addPlat(nextPlatX, nextPlatY)
		}
		// base case: make sure next plat is within twice the size of the gameboard's height (negative, above board)
		else if (platY > -1 * gameHeight){
			
			// increment plats placed thus far
			placedPlats++;
			
			// create new plat sprite
			var plat = new Plat(game, platX, platY);
			
			// add plat to canvas
			game.add.existing(plat);
			
			// anchor
			plat.anchor.set(0.5, 0);
			
			// add to plat group
			platGroup.add(plat);
			
			var nextPlatY = platY - platHeight;
	
			// define whether platform will be to left or right
			var posOrNeg = 1;
			
			// if platform is near right edge of screen
			if (platX + (platWidth / 2) >= gameWidth){
				posOrNeg = -1;
			}
			// if platform is away from left edge
			else if (platX - (platWidth / 2) >= platWidth){
				
				// randomize left or right
				posOrNeg = Math.random() < 0.5 ? -1 : 1;
			}
			
			// define the random x value to place the next platform
			// should be within a min distance , but also not right above
			var nextPlatX = platX + platWidth * game.rnd.between(1,2) * posOrNeg;
			
			if (nextPlatX + 70 > gameWidth){

				nextPlatX = nextPlatX - platWidth * 3;
			} 
			else if (nextPlatX - 70 < 0) {

				nextPlatX = nextPlatX + platWidth * 3;
			}
			
			// randomly decide if adding bonus platform
			// TODO change powerups frequency
			//if (placedPlats % 8 == 0 && score > 0){
			if (placedPlats % 8 === 0 && placedPlats > 7){
				addBonus(platX, platY, nextPlatX, nextPlatY);
				nextPlatY -= 35;
				
			}
			
			
			addPlat(nextPlatX, nextPlatY);
		}
	}
	
	function addBonus(x, y, nextPlatX, nextPlatY){
		
		var newX; 
		
		// two cases: there's a small width between x and nextPlatX, or there's a wide width between them
		
		var diff = nextPlatX - x;
		
		// if positive, next is to RIGHT of x
		//if negative, next is to LEFT of x
		var leftOrRight = 1;
		if (x > (gameWidth / 2)){
			leftOrRight = -1;
		}
		
		// case 1: small width
		//if (Math.abs(diff) < platWidth + 45){
		if (Math.abs(diff) < 280){
			
			//console.log("case 1, diff: " + diff);
			var random = game.rnd.between(155, 175) / 100;
			
			// bonus platform is placed 2 lengths away right or left
			newX = x + platWidth * random * leftOrRight;
			
		}
		// case 2: large width, can place in center
		else {
			
			//console.log("case 2, diff: " + diff);
			
			// distance should 
			var distance = Math.abs(diff) / 2 + 60;
			
			newX = (x + distance) * leftOrRight;
		}
		
		// check off screen
		if (newX + 70 > gameWidth){
			newX = gameWidth - 70;
		} 
		else if (newX - 70 < 0){
			
			//console.log("OLD NEW X: "+newX);
			newX = 70;
		}
		
		var plat = new Plat (game, newX, y);
		//console.log("( "+newX+", "+y+" )");
		placedPlats++;
		game.add.existing(plat);
		plat.anchor.set(0.5, 0);
		bonusGroup.add(plat);
		
		// for testing purposes so I can see it
		//plat.frame = 4;


		newStar(newX, y);		

	} 
	
	function newStar(newX, y){
		
		var star = new Star(game, newX, y - 25);
		game.add.existing(star);
		star.anchor.set(0.5, 0);
		starsGroup.add(star);
		
		// determine color rarity
		var starFrame;
		var s = game.rnd.between(0, 100);
		
		// yellow
		if (s < 35)
			starFrame = 0;
		// green
		else if (s < 65)
			starFrame = 1;
		// red
		else if (s < 75)
			starFrame = 2;
		// purple
		else if (s < 95)
			starFrame = 4;
		// pink
		else 
			starFrame = 5;
		
		star.frame = starFrame;
		star.type = starFrame;

		
		placedStars++;
	}
	
	Star = function(game, x, y){
	
		Phaser.Sprite.call(this, game, x, y, "star");
		game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.immovable = true;
		this.starNumber = placedStars;
		
	}
	
	Star.prototype = Object.create(Phaser.Sprite.prototype);
	Star.prototype.constructor = Star;
	
	Star.prototype.update = function(){
		
		this.body.velocity.y = platSpeed;
		// if ninja is NOT jumping/falling (aka if ninja is touching platforms) stop platforms
		this.body.velocity.y = platSpeed;

		// if the y position of any star is more than a platform's height below the edge of the screen, destroy it
		if (this.y > gameHeight + 70)
			this.destroy();
			
	}
	
	
	
	// make die function
	function die(){
		
	//	console.log("DEATH!");

		// reset top score if necessary
		localStorage.setItem("topNinjaRunnerScore", Math.max(score, topScore));
		
		// reset last score
		lastScore = score;
		platsLanded = 0;
		
		powerbar.frame = 0;
		
		
		// total reset (TODO remove later)
		//localStorage.setItem("topNinjaRunnerScore", 0);
		
		platSpeed = 0;
		ninjaJumpPower = 450;
		ninja.body.gravity.y = ninjaGravity;
		
		// restart game
		game.state.start("Play");
	}
	
	// define check landing function
	function checkLanding(n, p){

		// if the ninja collided with the TOP of the platform
		if (p.y >= n.y + n.height){
			
			// find difference between this platform and last landed on
			var platDiff = p.platNumber - n.lastPlat;
			
			// if there is a difference (aka if the ninja lands on a higher platform)
			if (platDiff > 0){
			
				// increase score and update text
				score += platDiff;
				platsLanded++;
				updateScore();
				
				if (platsLanded === 1){
					platSpeed = startSpeed;
					ninjaJumpPower -= 35; // 415
					
					// make clouds move
					clouds.body.velocity.y = platSpeed / 6;
					smallclouds.body.velocity.y = platSpeed/6;
					//ground.body.velocity.y = platSpeed;
				}
				
				speedUp(p);
				
				// determine color
				// TODO find a mathy way to do this nonsense 
				
				
				// update the ninja's last plat
				n.lastPlat = p.platNumber;
			}
			
			// if ninja hit the top of platform, it's no longer jumping; this should stop platforms
			if (ninjaJumping){
				
				ninjaJumping = false;

			}
			
			if (endPower){
				endPower = false;
			}
			
		}

	}
	
	// define the platform that gets created during addplat function
	Plat = function(game, x, y){
		
		Phaser.Sprite.call(this, game, x, y, "platforms");
		game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.immovable = true;

		// set platform numbre
		this.platNumber = placedPlats;
		
		this.scale.setTo(.35, .5);
	}
	
	Plat.prototype = Object.create(Phaser.Sprite.prototype);
	
	Plat.prototype.constructor = Plat;
	
	// update prototype and, by extension, all platforms
	Plat.prototype.update = function(){
			
		// if ninja is NOT jumping/falling (aka if ninja is touching platforms) stop platforms
		this.body.velocity.y = platSpeed;

	
		
		// if the y position of any platform is more than a platform's height below the edge of the screen, destroy it, then create a platform to replace it
		if (this.y > gameHeight + 10){
			this.destroy();
			addNewPlats();

		}
	}
	
	/*
	*	Star Cheatsheet
	*
	*	5: Pink, 10%,  score + 10
	*	4: Purple, 10%, jet pack
	*	3: Black, 15%, ninja jump
	*	2: Red, 15%, score + 5
	*	1: Green, 25%, slow
	*	0: Yellow, 25%, Score + 2
	*/
	
	function givePower(type, x, y){
		
		// TODO testing: remove
		//type = 1;
		
		// yellow star; score bonus
		if (type === 0){
			
			//console.log("+2")
			score += 2;
			powercolors.frame = 0;
			
			platSpeed -= 20;
			ninjaJumpPower += 20;
			
			/*
			*	Note: tween to(properties, duration, ease, autoStart, delay, repeat, yoyo)
			*	
			*	Properties tells whatever you want it to tween to
			*	eg. width:, x:, etc.
			*
			*	Ease is rate of change
			*/
			
    		game.add.tween(powercolors).to( { alpha: 0 }, 2000, "Linear", true);
			
		
			powerText(x, y, "+2");
			
			// set a timer for reset
			game.time.events.add(Phaser.Timer.SECOND * 2, reset, this);
			
		}
		// green star, slow platforms
		else if (type === 1){

			if (platSpeed < 100){
				platSpeed -= 20;
				ninjaJumpPower += 20;
			}
			else if (platSpeed < 150){
				platSpeed -= 40;
				ninjaJumpPower += 40;
			}
			else {
				platSpeed -= 60;
				ninjaJumpPower += 60;
			}

    		game.add.tween(powercolors).to( { alpha: 0 }, 2000, "Linear", true);			
			powercolors.frame = 1;
			
			powerText(x, y, "Slow");
			
			// set a timer for reset
			game.time.events.add(Phaser.Timer.SECOND * 2, reset, this);
			
		}
		// red star, score bonus
		else if (type === 2){
			//console.log("+5");
			score+= 5;
			
			powercolors.frame = 2;
			
			platSpeed -= 20;
			ninjaJumpPower += 20;			
			
    		game.add.tween(powercolors).to( { alpha: 0 }, 2000, "Linear", true);

			powerText(x, y, "+5");

			// set a timer for reset
			game.time.events.add(Phaser.Timer.SECOND * 2, reset, this);
			
		}
		// black star, ninja jump
		else if (type === 3){
			//console.log("I'm a ninja!");
			
			ninjaJumpPower += 200;
			
			powercolors.frame = 3;
			
    		game.add.tween(powercolors).to( { alpha: 0 }, 2000, "Linear", true);
			
			// set a timer for reset
			game.time.events.add(Phaser.Timer.SECOND * 5, resetJump, this);
			
		}
		// purple star, jet pack
		else if (type === 4){
			
		//	console.log("Jet pack time");
			
			
			// make sure ninja doesn't fly away (set upper boundary)
			ninja.body.gravity.y = -500;
			ninja.body.collideWorldBounds = true;
			ninja.body.checkCollision.down = false;
			
			powercolors.frame = 4;
			powerbar.frame = 1;
			
			game.add.tween(powerbar).to({
				width:0
			}, 5000, "Linear", true);
			
    		game.add.tween(powercolors).to( { alpha: 0 }, 5000, "Linear", true);
			
			powerText(x, y, "Flight");
			
			// set a timer for reset
			game.time.events.add(Phaser.Timer.SECOND * 5, resetGrav, this);

		}
		// pink star, score bonus
		else if (type === 5){
			
			//console.log("+10");
			score += 10;
			
			platSpeed -= 20;
			ninjaJumpPower += 20;			
			
			powercolors.frame = 5;

    		game.add.tween(powercolors).to( { alpha: 0 }, 2000, "Linear", true);
	
			powerText(x, y, "+10");
	
			// set a timer for reset
			game.time.events.add(Phaser.Timer.SECOND * 5, reset, this)
			
		}
		
	}
	
	function reset(){
		
		game.tweens.removeAll();
		
		powercolors.frame = 6;
		
		endPower == true;
		
		powerbar.frame = 0;
		
		powercolors.alpha = 1;
	
	}
	
	
	function resetJump(){
		
		
	
		ninjaJumpPower -= 200;
		
		reset();
		
	}
	
	function resetGrav(){
		
		//console.log("resetGrav");
		
		ninja.body.gravity.y = ninjaGravity;
		
		ninja.body.collideWorldBounds = false;
		ninja.body.checkCollision.down = true;
		
		powerbar.width = gameWidth;
		
		reset();
	}
	
	function powerText(x,y,text){
			
			var text = game.add.text(x, y - 10, text, {fill: "white"});
			game.add.tween(text).to( { alpha: 0 }, 1000, "Linear", true);
			text.setShadow(1, 1, 'rgba(0,0,0,0.5)', 5);
			
			// set a timer for reset
			game.time.events.add(Phaser.Timer.SECOND, function(t){
				
				t.destroy()
				
			}, this, text);			
	}
	
	
	function speedUp(p){
		
		if (platSpeed < 150 && platSpeed > 2 && p.platNumber % 2 === 0){
			
			platSpeed += 15;
			
			ninjaJumpPower -= 15;
			
		}
		else if (platSpeed >= 130 && p.platNumber % 5 === 0) {
			
			platSpeed += 5;
			ninjaJumpPower -= 5;
			
		}
	}
		
}

