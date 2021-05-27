class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // Tilemap file is actually 576 x ~4000 some in size. The latter is so we can scroll/warp between levels.
        this.load.image('tiles', './assets/tilemaps/tiles/FinalTiles_-_Atlas.png');
        this.load.atlas('player', './assets/sprites/AnimationSprites.png', './assets/sprites/walkSprite.json');
        this.load.tilemapTiledJSON('map', './assets/tilemaps/data/finalTilemap.json');
        this.load.audio('background', './assets/music/background.wav');
    }

    create() {
        this.a = 'testingVariable';
        // Produce static map elements
        // Note: tileSize at 32. Variable allows up/down-scaling.
        const map = this.add.tilemap('map');
        const tileset = map.addTilesetImage('FinalTiles_-_Atlas', 'tiles');
        const tilelayer = map.createLayer('Tiles', tileset, 0, 0);
        const debrisLayer = map.createLayer('Debris', tileset, 0, 0);
        const wallLayer = map.createLayer('Walls', tileset, 0, 0);
        const objs = map.createLayer('Objs', tileset, 0, 0);
        
        this.map = map;
        this.wallLayer = wallLayer;

        this.p1Spawn = map.findObject('Objs', obj => obj.name === 'p1Spawn');
        this.p1Exit = map.findObject('Objs', obj => obj.name === 'p1Exit');
        this.r1Spawn = map.findObject('Objs', obj => obj.name === 'r1Spawn');
        this.r1Exit = map.findObject('Objs', obj => obj.name === 'r1Exit');
        this.r2Spawn = map.findObject('Objs', obj => obj.name === 'r2Spawn');
        this.r2Exit = map.findObject('Objs', obj => obj.name === 'r2Exit');
        this.r3Spawn = map.findObject('Objs', obj => obj.name === 'r3Spawn');
        this.r3Exit = map.findObject('Objs', obj => obj.name === 'r3Exit');
        this.r4Spawn = map.findObject('Objs', obj => obj.name === 'r4Spawn');
        this.r4Exit = map.findObject('Objs', obj => obj.name === 'r4Exit');
        this.r5Spawn = map.findObject('Objs', obj => obj.name === 'r5Spawn');
        this.r5Exit = map.findObject('Objs', obj => obj.name === 'r5Exit');
        this.p2Spawn = map.findObject('Objs', obj => obj.name === 'p2Spawn');
        this.p2Exit = map.findObject('Objs', obj => obj.name === 'p2Exit');

        this.spawns = [this.p1Spawn, this.r1Spawn, this.r2Spawn, this.r3Spawn, this.r4Spawn, this.r5Spawn, this.p2Spawn];
        this.exits = [this.p1Exit, this.r1Exit, this.r2Exit, this.r3Exit, this.r4Exit, this.r5Exit];
        this.roomNumber = 0;

        this.deathEnabled = false;

        this.time.delayedCall(200, () => this.deathEnabled = true);
        // findObject is drunk :(
        // console.log(this.p1Spawn);
        // console.log(this.p1Spawn.x);
        // console.log(this.p1Spawn.y);
       
        // Produce key meanings
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keySHIFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        
        // Set world and camera bounds.
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // NOTE : MOVE CAMERA TO 
        // We'll probably determine how the player is Out Of Bounds another way. Since it causes death.
        // this.phsyics.world.bounds.setTo(0, 0, map.widthInPixels, map.heightInPixels);

        // Add music
        this.music = this.sound.add('background');
        this.music.setLoop(true);
        this.music.play();

        // Add in the player - NOTE : hardcoded items copied and pasted from js file because findObject ate too many crayons today and keeps saying p1Spawn is undef
        this.player = new Player(this, 288, 2912, 'player').setOrigin(0);
        this.player.setSize(30,30);
        // this.player = new Player(this, this.p1Spawn.x, this.p1Spawn.y, 'player').setOrigin(0);

        // Add in the moving tiles

        // Collision
        wallLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player, wallLayer);

        // RESOLVE HOW THIS OVERLAP SHIT WORKS SO THAT OUR STUFF IS GOOD
        // this.physics.add.overlap(this.player, wallLayer, () => {
        //     console.log("Player zooped into wall");
        //     //this.player.playerDeath(this.p1Spawn.x, this.p1Spawn.y); 
        // }); // Use to check if player is overlapping a wall

        // Playtest puzzle testing camera scroll, 0 being start, 7 being the end room.
        this.roomScroll(this.cameras.main, 1)
    }

    roomScroll(cam, room){
        this.cameras.main.once('camerafaeoutcomplete', function(camera) {
            camera.fadeIn(6000, 255);
        }, this);
        this.cameras.main.setScroll(0, (7 - room) * 576);
    }

    sendToBottom () {
        if(tpLength < 6){
            ++tpLength;
        }
        this.roomNumber = 0;
        this.player.x = this.spawns[0].x;
        this.player.y = this.spawns[0].y;
    }

    update(time, delta) {
        // If player is off camera && levelSwitch != true : Kill
        // Thanks to : https://phaser.discourse.group/t/what-is-incamera-in-phaser-3/7031
        // If player is overlapping bad tile : Kill
        // if(this.player.touching.???){ this.player.playerDeath }
        if(tpLength >= 6 && !this.cameras.main.worldView.contains(this.player.x + 1, this.player.y + 1)) {
            console.log('A winner is you!');
        }
        else{
            this.player.update();
        }        
        if(this.deathEnabled && (!this.cameras.main.worldView.contains(this.player.x + 1, this.player.y + 1) // + 1 prevents weird behavior
                                || this.map.getTileAtWorldXY(this.player.x, this.player.y, false, this.cameras.main, this.wallLayer) != null) ) { // Boolean set to be always false. Replace with bad player location overlaps.
            this.player.playerDeath(this.p1Spawn.x, this.p1Spawn.y);
            this.roomScroll(this.cameras.main, 1);
            this.roomNumber = 0;
        }
        // this.movingBlocks.update() ?

        if (this.roomNumber < 6 && this.player.isCollidedWith(this.exits[this.roomNumber])) {
            //TODO: Go to next level
            console.log("To Next Level");
            this.deathEnabled = false;
            if(this.roomNumber > tpLength - 2){
                this.roomScroll(this.cameras.main, 7);
                this.player.x = this.spawns[6].x;
                this.player.y = this.spawns[6].y;
                this.roomNumber = 6;
            }
            else{
                this.roomNumber++;
                this.roomScroll(this.cameras.main, this.roomNumber + 1);
                this.player.x = this.spawns[this.roomNumber].x;
                this.player.y = this.spawns[this.roomNumber].y;
            }
            this.time.delayedCall(500, () => this.deathEnabled = true);
        }
        else if(this.player.isCollidedWith(this.p2Exit)){
            this.deathEnabled = false;
            this.sendToBottom();
            this.roomScroll(this.cameras.main, this.roomNumber + 1);
            this.deathEnabled = true;
        }
    }
}