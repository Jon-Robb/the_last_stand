import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import { MatchState } from '../../../server/rooms/schema/MatchState';
import spriteSheetsLoader from './spritesheetsLoader';
import { capitalizeFirstLetter } from '../../../utils/text_format';
import { IGameEntityMapper } from '../../../typescript/interfaces/IGameEntityMapper';
import backgroundImage from '/assets/craftpix/backgrounds/background.png';
import tuile03 from '/assets/craftpix/tiles/IndustrialTile_03.png';
interface MovePlayerMessage {
  x: number;
  y: number;
  anim?: string;
  flipX?: boolean;
  direction?: string;
}

const baseSpeedHandler: Record<string, number> = {
  chuck: 1000,
  solana: 500,
  sirius: 150,
  logan: 150,
};

const airborneSpeedHandler: Record<string, number> = {
  chuck: 500,
  solana: 1000,
  sirius: 150,
  logan: 150,
};

const jumpHeightHandler: Record<string, number> = {
  chuck: 800,
  solana: 800,
  sirius: 1500,
  logan: 1500,
};

const weightHandler: Record<string, number> = {
  chuck: 400,
  solana: 300,
  sirius: 300,
  logan: 300,
};

const maxJumpHandler: Record<string, number> = {
  chuck: 2,
  solana: 2,
  sirius: 2,
  logan: 2,
};

const bounceHandler: Record<string, number> = {
  chuck: 0.1,
  solana: 0.1,
  sirius: 0.1,
  logan: 0.1,
};

const fixedAnimations: string[] = ['Jump', 'DoubleJump', 'Attack1', 'Attack2', 'Attack3'];

export default class ClientMatch extends Phaser.Scene {
  private gameClient?: Client;
  private playerId?: string;
  private gameEntities: Map<string, any> = new Map<string, any>();
  private mo: Room | undefined;
  private spriteSheetsLoader = spriteSheetsLoader;
  private updateSpriteMessage?: MovePlayerMessage;
  private background?: Phaser.GameObjects.Image;

  // TOUTES LES KEYS
  private keys?: any;

  constructor() {
    super('the-last-stand');
  }

  preload() {
    // LOAD DES SPRITESHEETS AVEC LE SPRITESHEETLOADER
    this.spriteSheetsLoader.forEach((spritePaths) => {
      const spriteSheetPaths = Object.values(spritePaths.spriteSheets);
      spriteSheetPaths.forEach((key) => {
        const spriteSheetName = `${spritePaths.heroName}${capitalizeFirstLetter(key.key)}`;
        this.load.spritesheet({ key: spriteSheetName, url: key.path, frameConfig: { frameWidth: key.frameWidth, frameHeight: key.frameHeight } });
      });
    });

    // Load backgrounds and tiles
    this.load.image('background', backgroundImage);
    this.load.image('tuile03', tuile03);
  }

  // Get the client from the Boostrap scene
  async create(data: { client: Client }) {
    const { client } = data;
    this.gameClient = client;
    if (this.gameClient) {
    } else {
      throw new Error('client not found');
    }

    // if there is no one in the room, use joinOrCreate or it will throw an error
    this.mo = await this.gameClient.joinOrCreate<MatchState>('match_orchestrator');

    //  TOUTES LES KEYS DES MOUVEMENTS
    this.keys = this.input.keyboard.addKeys('W,A,S,D,J,K,L,U,I,O,SPACE,UP,DOWN,LEFT,RIGHT');

    //  CREATION DES ANIMATIONS AVEC LES SPRITESHEETS DU SPRITESHEET LOADER
    this.spriteSheetsLoader.forEach((spritePaths) => {
      const spriteSheetPaths = Object.values(spritePaths.spriteSheets);
      spriteSheetPaths.forEach((key) => {
        const animKey = `${spritePaths.heroName}${capitalizeFirstLetter(key.key)}`;
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(animKey, { start: key.startFrame, end: key.endFrame }),
          frameRate: key.frameRate,
          repeat: key.repeat,
        });
      });
    });

    //  CREATION DU BACKGROUND ET DU TUILAGE
    // Background
    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    // stretch the background to fit the whole screen
    this.background.displayWidth = this.sys.canvas.width;
    this.background.displayHeight = this.sys.canvas.height;

    // Tileset platform principale
    //const tileMap = this.make.tilemap({ tileWidth: 32, tileHeight: 32, width: 10, height: 1 });
    //const tileSet = tileMap.addTilesetImage('tuile03');
    //const layer = tileMap.createBlankLayer('Tile Layer 1', tileSet, 100, 100);
    //this.add.existing(layer);

    //tileMap.setCollisionBetween(0, 14);

    // Create platforms
    const platforms = this.physics.add.staticGroup();
    // platforms
    //   .create(100, this.sys.canvas.height - 100, 'tuile03')
    //   .setScale(2)
    //   .refreshBody();
    // create a platform with the platform builder
    const platform1 = this.add.tileSprite(this.sys.canvas.width * 0.52, this.sys.canvas.height * 0.36, this.sys.canvas.width * 0.25, 32, 'tuile03');
    const platform2 = this.add.tileSprite(this.sys.canvas.width * 0.3, this.sys.canvas.height * 0.95, this.sys.canvas.width * 0.22, 32, 'tuile03');
    const platform3 = this.add.tileSprite(this.sys.canvas.width * 0.75, this.sys.canvas.height * 0.95, this.sys.canvas.width * 0.22, 32, 'tuile03');

    this.physics.add.existing(platform1, true);
    this.physics.add.existing(platform2, true);
    this.physics.add.existing(platform3, true);

    platforms.add(platform1);
    platforms.add(platform2);
    platforms.add(platform3);

    // adjust the scale of the platform
    //platform.setScale(2);

    this.mo.onMessage('assign_player_id', (message: { id: string }) => {
      this.playerId = message.id;
    });

    this.mo.onMessage('create_entity', (message: IGameEntityMapper) => {
      this.gameEntities.set(message.id, this.physics.add.sprite(message.position.x, message.position.y, `${message.gameEntityType}Idle`));

      const entity = this.gameEntities.get(message.id);

      entity.setName(message.gameEntityType);
      //entity.setCollideWorldBounds(true);
      this.physics.add.collider(entity, platforms);
      entity.setBounce(bounceHandler[message.gameEntityType]);
      entity.setGravityY(weightHandler[message.gameEntityType]);
      entity.setScale(2);
      entity.anims.play(`${message.gameEntityType}Idle`, true);
      entity.baseSpeed = baseSpeedHandler[message.gameEntityType];
      entity.airborneSpeed = airborneSpeedHandler[message.gameEntityType];
      entity.jumpHeight = jumpHeightHandler[message.gameEntityType];
      entity.direction = message.direction;
      entity.jumpCount = 0;
      entity.maxJump = maxJumpHandler[message.gameEntityType];
      console.log(this.gameEntities);
    });

    this.mo.onMessage('remove_entity', (message: { id: string }) => {
      this.gameEntities.get(message.id)?.destroy();
      this.gameEntities.delete(message.id);
    });
  }

  update() {
    // le key down qui envoie l action pour le set velocity
    if (this.keys && this.mo?.state.gem.get(this.playerId)) {
      const entity = this.gameEntities.get(this.playerId!);
      const animKey = entity.anims.currentAnim.key.split(entity.name)[1];
      const canvasHeight: number = this.game.config.height as number;
      const spriteBottom = entity.y + entity.height;
      const bounceCorrection = 10;
      const keyboardPressed = this.keys.D?.isDown || this.keys.A?.isDown || this.keys.W?.isDown || this.keys.J?.isDown || this.keys.K?.isDown || this.keys.L?.isDown || this.keys.U?.isDown || this.keys.I?.isDown || this.keys.O?.isDown || this.keys.SPACE?.isDown || this.keys.UP?.isDown || this.keys.DOWN?.isDown || this.keys.LEFT?.isDown || this.keys.RIGHT?.isDown;
      const jumping = Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.UP) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
      const attacking = Phaser.Input.Keyboard.JustDown(this.keys.J) || Phaser.Input.Keyboard.JustDown(this.keys.K) || Phaser.Input.Keyboard.JustDown(this.keys.L);

      if (spriteBottom >= canvasHeight - bounceCorrection) {
        entity.body.blocked.down = true;
      }
      if (entity.body.blocked.down) {
        entity.jumpCount = 0;
      }

      // Input logic
      if (keyboardPressed) {
        // Moving logic
        if (this.keys.D?.isDown || this.keys.RIGHT?.isDown || this.keys.A?.isDown || this.keys.LEFT?.isDown) {
          if ((this.keys.A?.isDown && this.keys.D?.isDown) || (this.keys.LEFT?.isDown && this.keys.RIGHT?.isDown)) {
            entity.anim = `${entity.name}Idle`;
            entity.setVelocityX(0);
          } else {
            if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) {
              entity.body.blocked.down ? entity.setVelocityX(entity.baseSpeed) : entity.setVelocityX(entity.airborneSpeed);
              entity.direction = 'right';
            } else if (this.keys.A?.isDown || this.keys.LEFT?.isDown) {
              entity.body.blocked.down ? entity.setVelocityX(-entity.baseSpeed) : entity.setVelocityX(-entity.airborneSpeed);
              entity.direction = 'left';
            }
            if (animKey !== 'Jump' && animKey !== 'DoubleJump' && entity.anim !== `${entity.name}Jump`) {
              if (entity.body.blocked.down) {
                entity.anim = `${entity.name}Run`;
              } else {
                entity.anim = `${entity.name}Fall`;
              }
            }
          }
        }
        // Jumping logic
        if (jumping) {
          if (entity.jumpCount < entity.maxJump) {
            entity.jumpCount += 1;

            entity.setVelocityY(-entity.jumpHeight);
            if (entity.body.blocked.down) {
              entity.anim = `${entity.name}Jump`;
            } else if (entity.jumpCount >= 1) {
              entity.anim = `${entity.name}DoubleJump`;
            }
          } else if (entity.jumpCount >= entity.maxJump) {
            entity.anim = `${entity.name}Fall`;
          }
        }
        // Attacking logic
        if (attacking && entity.body.blocked.down) {
          if (!fixedAnimations.includes(animKey)) {
            if (this.keys.J?.isDown) {
              entity.anim = `${entity.name}Attack1`;
            } else if (this.keys.K?.isDown) {
              entity.anim = `${entity.name}Attack2`;
            } else if (this.keys.L?.isDown) {
              entity.anim = `${entity.name}Attack3`;
            }
          }
        }
      }
      // Idle logic
      else {
        entity.setVelocityX(0);

        if (!fixedAnimations.includes(animKey)) {
          if (entity.body.blocked.down) {
            entity.anim = `${entity.name}Idle`;
          } else {
            entity.anim = `${entity.name}Fall`;
          }
        }
      }

      // Make the sprite appear on the other side of the screen when it goes off screen
      if (entity.x > this.sys.canvas.width * 1.2) {
        entity.x = 0 - this.sys.canvas.width * 0.2;
      } else if (entity.x < 0 - this.sys.canvas.width * 0.2) {
        entity.x = this.sys.canvas.width * 1.2;
      }
      if (entity.y > this.sys.canvas.height * 1.2) {
        entity.y = 0 - this.sys.canvas.height * 0.2;
      } else if (entity.y < 0 - this.sys.canvas.height * 0.2) {
        entity.y = this.sys.canvas.height * 1.2;
      }

      this.updateSpriteMessage = {
        x: entity.x,
        y: entity.y,
        direction: entity.direction,
        anim: entity.anim,
      };

      this.mo.send('update_sprite', this.updateSpriteMessage);

      //Render all the sprites
      this.mo.state.gem.forEach((gem: IGameEntityMapper, key: string) => {
        const entity = this.gameEntities.get(key);
        const animKey = gem.anim?.split(gem.gameEntityType)[1];
        let flipX;

        if (entity) {
          entity.setPosition(gem.position.x, gem.position.y);

          if (gem.direction == 'left') {
            flipX = true;
          } else if (gem.direction == 'right') {
            flipX = false;
          }
          entity.setFlipX(flipX);

          // wait for fixed animations do be finished before playing other animations
          if (fixedAnimations.includes(animKey!)) {
            entity.anims.play(gem.anim, true);
            entity.once('animationcomplete', () => {
              if (animKey == 'Attack1' || animKey == 'Attack2' || animKey == 'Attack3') {
                entity.anims.play(`${gem.gameEntityType}Idle`, true);
                // TODO : Generate attack hitboxes
                console.log(`Generate ${entity.name}${animKey} from ${this.playerId} at ${entity.x}, ${entity.y}`);
              } else entity.anims.play(`${gem.gameEntityType}Fall`, true);
            });
          } else {
            entity.anims.play(gem.anim, true);
          }
        }
      });
    }
  }
}
