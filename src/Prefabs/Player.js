class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        // call Phaser Physics Sprite constructor
        super(scene, x, y, sprite); 
        
        // set up physics sprite
        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);       // add to physics system
        this.isMoving = false;
        this.width = 32;
        this.height =32;
        this.walkSpeed = 5;
        this.failedTeleport = false;
        this.animationFramerate = frameRate;
        this.controlLock = false;
        this.collisionOff = false;
        this.ghostMode = false;

        this.deathSound = this.scene.sound.add('die');
        this.exitTeleportSound = this.scene.sound.add('TPOut');
        this.teleportSound = this.scene.sound.add('TPIn');
        this.stepSound = this.scene.sound.add('step');

        this.anims.create({
            key: 'standForward',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standForward']}),
            frameRate: this.animationFramerate,
            repeat: -1
        });

        this.anims.create({
            key: 'walkForward',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standForward', 'walkForward1', 'standForward', 'walkForward2']}),
            frameRate: this.animationFramerate,
            skipMissedFrames: false,
            repeat: -1
        });

        this.anims.create({
            key: 'standLeft',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standLeft']}),
            frameRate: this.animationFramerate,
            repeat: -1
        });

        this.anims.create({
            key: 'walkLeft',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standLeft', 'walkLeft1', 'standLeft', 'walkLeft2']}),
            frameRate: this.animationFramerate,
            skipMissedFrames: false,
            repeat: -1
        });

        this.anims.create({
            key: 'standRight',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standRight']}),
            frameRate: this.animationFramerate,
            repeat: -1
        });

        this.anims.create({
            key: 'walkRight',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standRight', 'walkRight1', 'standRight', 'walkRight2']}),
            frameRate: this.animationFramerate,
            skipMissedFrames: false,
            repeat: -1
        });

        this.anims.create({
            key: 'standBackward',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standBackward']}),
            frameRate: this.animationFramerate,
            repeat: -1
        });

        this.anims.create({
            key: 'walkBackward',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standBackward', 'walkBackward1', 'standBackward', 'walkBackward2']}),
            frameRate: this.animationFramerate,
            skipMissedFrames: false,
            repeat: -1
        });

        this.anims.create({
            key: 'teleport',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['standForward', 'teleport1', 'teleport2', 'teleport3', 'teleport4', 'teleport5']}),
            frameRate: this.animationFramerate*4,
            skipMissedFrames: false,
            repeat: 0
        });

        this.anims.create({
            key: 'death',
            frames:this.anims.generateFrameNames('player', { zeroPad: 0, frames: ['death1', 'death2', 'death3', 'death4', 'death5', 'death6', 'death7', 'death8', 'teleport5']}),
            frameRate: this.animationFramerate*2,
            skipMissedFrames: false,
            repeat: 0
        });

    }

    playerDeath (x, y) {
        this.controlLock = true;
        this.anims.play('death', false);
        this.deathSound.play();
        this.scene.time.delayedCall(1000, () => {
            console.log('I am Dead!')
            this.x = x;
            this.y = y;
            this.scene.time.delayedCall(500, () => {
                this.anims.playReverse('teleport', false);
                this.scene.time.delayedCall(600, () => {this.controlLock = false});
            });
        });
    }

    // Pass an object with x and y member variables, returns whether player and the object are colliding
    isCollidedWith(obj) {
        return (Math.abs(this.x - obj.x) <= this.width && Math.abs(this.x - obj.x - 32) >= this.width) && 
        (Math.abs(this.y - obj.y) <= this.height && Math.abs(this.y - obj.y - 32) >= this.width);
    }

    exitTeleport(){
        this.anims.playReverse('teleport', false);
        if (!this.scene.deathEnabled){
            this.scene.time.delayedCall(300, () => {this.scene.deathEnabled = true});
        }
        this.scene.time.delayedCall(300, () => {this.controlLock = false});
        this.exitTeleportSound.play();
    }

    collisionCheck(isTeleporting = false){
        if(this.scene.deathEnabled && ((!this.scene.cameras.main.worldView.contains(this.x, this.y)
        || (!this.ghostMode && this.scene.map.getTileAtWorldXY(this.x+4, this.y+4, false, this.scene.cameras.main, this.scene.wallLayer) != null)) 
        || this.scene.roomNumber == 0 && (this.x >= roomWidth || this.y >= roomHeight * 7 || this.x < 0 || this.y < 0))) {
            this.scene.deathEnabled = false;
            this.controlLock = true;
            this.playerDeath(this.scene.p1Spawn.x, this.scene.p1Spawn.y);
            this.scene.time.delayedCall(1000, () => {
                this.scene.roomScroll(this.scene.cameras.main, 1);
                this.scene.roomNumber = 0;
            });
        }
        else if(isTeleporting) {
            this.controlLock = true;
            this.exitTeleport();
        }
    }

    // I'll have to look a bit more into FSMs
    // setState() {
    // 
    // }
    // Give me a heads up if you want the time, delta part
    update() {
        if (!this.collisionOff){
            this.collisionCheck();
        }

        if(Phaser.Input.Keyboard.JustDown(keyZERO)){
            if(!this.ghostMode){
                this.ghostMode = true;
                this.setAlpha(0.5);
                this.scene.physics.world.colliders.destroy();
            } else if(this.ghostMode) {
                this.ghostMode = false;
                this.setAlpha(1);
                this.scene.physics.add.collider(this, this.scene.wallLayer);
                this.collisionCheck(true);
            }
        }

        // if keySHIFT and not walking -> teleport logic
        // Something like this, src : https://phaser.io/examples/v3/view/game-objects/lights/tilemap-layer
        if(keySHIFT.isDown && !this.controlLock){
            if (keyA.isDown && !this.controlLock){
                this.controlLock = true;
                this.collisionOff = true;
                this.teleportSound.play();
                this.anims.play('teleport', false);
                this.scene.time.delayedCall(375, () => {
                    this.x -= tileSize * tpLength;
                    this.collisionOff = false;
                    this.collisionCheck(true);
                });
            }
            else if (keyD.isDown && !this.controlLock){
                this.controlLock = true;
                this.collisionOff = true;
                this.teleportSound.play();
                this.anims.play('teleport', false);
                this.scene.time.delayedCall(375, () => {
                    this.x += tileSize * tpLength;
                    this.collisionOff = false;
                    this.collisionCheck(true);
                });
            }
            else if (keyW.isDown && !this.controlLock){            
                this.controlLock = true;
                this.collisionOff = true;
                this.teleportSound.play();
                this.anims.play('teleport', false);
                this.scene.time.delayedCall(375, () => {
                    this.y -= tileSize * tpLength;
                    this.collisionOff = false;
                    this.collisionCheck(true);
                });
            }
            else if (keyS.isDown && !this.controlLock){
                this.controlLock = true;
                this.collisionOff = true;
                this.teleportSound.play();
                this.anims.play('teleport', false);
                this.scene.time.delayedCall(375, () => {
                    this.y += tileSize * tpLength;
                    this.collisionOff = false;
                    this.collisionCheck(true);
                });
            }
        }
        else if(!this.controlLock){
            if (keyA.isDown && !this.controlLock){
                if(!this.isMoving){
                    this.isMoving = true;
                    this.anims.play('walkLeft', true);
                    this.setVelocity(-tileSize * this.walkSpeed, 0);
                    this.scene.time.delayedCall(1000 / this.walkSpeed, () => {
                        if(!this.stepSound.isPlaying){
                            this.stepSound.play();
                        }
                        this.isMoving = false;
                        this.setVelocity(0, 0);
                        if(this.x % 32 != 0){
                            if(this.x % 32 > 16){
                                this.x += 32 - (this.x % 32);
                            }
                            else{
                                this.x -= this.x % 32;
                            }
                        }
                    });
                }
            }
            else if (keyD.isDown && !this.controlLock){
                if (!this.isMoving) {
                    this.isMoving = true;
                    this.anims.play('walkRight', true);
                    this.setVelocity(tileSize * this.walkSpeed, 0);
                    this.scene.time.delayedCall(1000 / this.walkSpeed, () => {
                        if(!this.stepSound.isPlaying){
                            this.stepSound.play();
                        }
                        this.isMoving = false;
                        this.setVelocity(0, 0);
                        if(this.x % 32 != 0){
                            if(this.x % 32 > 16){
                                this.x += 32 - (this.x % 32);
                            }
                            else{
                                this.x -= this.x % 32;
                            }
                        }
                    });
                }
            }
            else if (keyW.isDown && !this.controlLock){
                while(!this.isMoving){
                    this.isMoving = true;
                    this.anims.play('walkBackward', true);
                    this.setVelocity(0, -tileSize * this.walkSpeed);
                    this.scene.time.delayedCall(1000 / this.walkSpeed, () => {
                        if(!this.stepSound.isPlaying){
                            this.stepSound.play();
                        }
                        this.isMoving = false;
                        this.setVelocity(0, 0);
                        if(this.y % 32 != 0){
                            if(this.y % 32 > 16){
                                this.y += 32 - (this.y % 32);
                            }
                            else{
                                this.y -= this.y % 32;
                            }
                        }
                    });
                }
            }
            else if (keyS.isDown && !this.controlLock){
                while(!this.isMoving){
                    this.isMoving = true;
                    this.anims.play('walkForward', true);
                    this.setVelocity(0, tileSize * this.walkSpeed);
                    this.scene.time.delayedCall(1000 / this.walkSpeed, () => {
                        if(!this.stepSound.isPlaying){
                            this.stepSound.play();
                        }
                        this.isMoving = false;
                        this.setVelocity(0, 0);
                        if(this.y % 32 != 0){
                            if(this.y % 32 > 16){
                                this.y += 32 - (this.y % 32);
                            }
                            else{
                                this.y -= this.y % 32;
                            }
                        }
                    });
                }
            }
            else if (!this.controlLock){
                this.anims.restart();
                this.anims.stop(null, true);
            }
        }
    }
}