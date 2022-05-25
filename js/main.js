
const game_width = 600, game_height = 900;
var spawn_counter = 0, spawn_cdr = 30, timer, score = 0, grvt_multiply = 1,
    global_counter = 0, combo_timer, combo_effect = 1, combo_stacks = 0, combo_counter = 3, emitter_time = 2, particles, pimenta_deployed = false,
    sorvete_deployed = false, grow_deployed = false, dismiss_deployed = false, onSpeed = false, speed_count = 5, freezed = false, freeze_count = 5, grow = false, grow_count = 5, pimenta = false, pimenta_count = 5,
    emitter, product_destroys, input;

var score_text, combo_text, lifes = 3, text_lifes;

var music, fire, freeze, buff, god, damage;
let item_list = ["carne", "arroz", "cereal", "lasanha", "refrigerante", "abacaxi", "computador", "camisa", "shampoo", "miojo", "chocolate", "leite"]
special = ["cafe", "sorvete", "salgadinho", "pimenta"];
bonus = "apple";
var player_speed = 400;
var sceneA = new Phaser.Class({

    Extends: Phaser.Scene,
    initialize:
        function sceneA() {
            Phaser.Scene.call(this, { key: 'sceneA' });

        },

    preload: function () {


        //Utilizar esse caminho e url para teste em web server
        //var folder = "DescontozProjeto";
        //this.load.setBaseURL('http://127.0.0.1');
        var folder = "."



        //produtos
        this.load.image('carne', folder + "/img/carne.png");
        this.load.image('arroz', folder + "/img/arroz.png");
        this.load.image('cereal', folder + "/img/cereal.png");
        this.load.image('lasanha', folder + "/img/lasanha.png");
        this.load.image('refrigerante', folder + "/img/refrigerante.png");
        this.load.image('abacaxi', folder + "/img/abacaxi.png");
        this.load.image('computador', folder + "/img/computador.png");
        this.load.image('camisa', folder + "/img/camisa.png");
        this.load.image('shampoo', folder + "/img/shampoo.png");
        this.load.image('miojo', folder + "/img/miojo.png");
        this.load.image('chocolate', folder + "/img/chocolate.png");
        this.load.image('leite', folder + "/img/leite.png");

        this.load.image('sorvete', folder + "/img/sorvete.png")
        this.load.image('pimenta', folder + "/img/pimenta.png");
        this.load.image('cafe', folder + "/img/cafe.png");
        this.load.image('salgadinho', folder + "/img/salgadinho.png");
        this.load.image('apple', folder + "/img/apple.png");

        //efeitos
        this.load.image('spark', folder + "/img/spark.png");
        this.load.image('snow', folder + "/img/snow.png");
        this.load.image('pimenta_spr', folder + "/img/pimenta_sprite.png");
        this.load.audio('tema', folder+"/sounds/theme.mp3");
        this.load.audio('fire', folder+"/sounds/fire.mp3");
        this.load.audio('freeze', folder+"/sounds/freeze.mp3");
        this.load.audio('buff', folder+"/sounds/buff.mp3");
        this.load.audio('god', folder+"/sounds/god.mp3");
        this.load.audio('damage', folder+"/sounds/damage.mp3");

        //Static
        this.load.image('background', folder + "/img/game_back.png");
        this.load.image('player', folder + "/img/player.png");
        this.load.image('floor', folder + "/img/floor.png");
        this.load.image('heart', folder + "/img/heart.png");


    },

    create: function () {
        this.add.sprite(-100, 0, 'background').setOrigin(0, 0).setScale(2);
        keys = this.input.keyboard.createCursorKeys();
        products = this.physics.add.group();
        floor = this.physics.add.staticGroup();
        floor.create(game_width / 2, 900, "floor");
        particles = this.add.particles('spark');
        emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            visible: false
        });

        music = this.sound.add('tema');
        music.volume = 0.1;
        music.loop = true;
        music.play();

        fire = this.sound.add('fire');
        fire.volume = 0.3;

        freeze = this.sound.add('freeze');
        freeze.volume = 0.3;
       
        buff = this.sound.add('buff');
        buff.volume = 0.3;
        
        damage = this.sound.add('damage');
        damage.volume = 0.3;

        god = this.sound.add('god');
        god.volume = 0.3;
        player = this.physics.add.sprite(game_width / 2, 800, 'player').setCollideWorldBounds(true);
        emitter.startFollow(player);
        this.physics.add.overlap(products, floor, destroyProduct, null, this)
        this.physics.add.overlap(products, player, getProduct, null, this)
        timer = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: updateSpawnCounter
        });
        combo_timer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: decrementComboTimer
        });
        effect_timer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: decrementEffectTime
        });
        var style = { font: "bold 32px Arial", fill: "#fff" },
            style2 = { font: "bold 32px Arial", fill: "#ff0000" };
        score_text = this.add.text(0, 0, "Pontuação: ", style);
        combo_text = this.add.text(0, 30, "", style2);
        this.add.sprite(game_width - 80, 20, 'heart').setScale(1.2);
        text_lifes = this.add.text(game_width - 50, 0, lifes, style);
    },

    update: function () {
        var pointer = this.input.activePointer;
        if (pointer.isDown && pointer.x < game_width / 2 && pointer.x > 0 && pointer.y > 100 || keys.left.isDown) {
            //mover esquerda
            player.setVelocityX(-player_speed);
            player.flipX = true;
            console.log("left");
        } else if (pointer.isDown && pointer.x >= game_width / 2 && pointer.x < game_width && pointer.y > 100 || keys.right.isDown) {
            //mover direita
            player.setVelocityX(player_speed);
            player.flipX = false;
            console.log("right");
        } else {
            player.setVelocityX(0);
        }
        //spawn de produtos
        if (spawn_counter >= spawn_cdr) {
            //posicionamento aleatório, a cada produto que spawna, o tempo para aparecer outro diminuí gradativamente e a velocidade aumenta
            //20% de chances de um produto ser especial
            if (Phaser.Math.Between(1, 5) == 1) {
                //produto aleatório
                index = Phaser.Math.Between(0, special.length - 1);
                produto = products.create(Phaser.Math.Between(20, game_width - 20), -40, special[index])
                console.log("Especial: " + special[index])
                produto.setName(special[index]);
                //Maçã, raro! 5%
                if (Phaser.Math.Between(1, 20) == 1) {
                    produto = products.create(Phaser.Math.Between(20, game_width - 20), -40, bonus)
                    console.log("Especial: " + bonus)
                    produto.setName(bonus);
                }
            }
            else {
                //produto aleatório
                index = Phaser.Math.Between(0, item_list.length - 1);
                produto = products.create(Phaser.Math.Between(20, game_width - 20), -40, item_list[index]);
                produto.setName(item_list[index]);
            }
            produto.body.gravity.y = (20 + global_counter / 2) * grvt_multiply;
            if (freezed) {
                produto.setTint(0x00ffff);
            }
            if (spawn_cdr > 8) {
                spawn_cdr -= 0.4;
            }
            spawn_counter = 0;
        }
        products.getChildren().forEach(function (child) {
            child.angle += 1;

        });
        combo_text.setText("x" + combo_effect);
        score_text.setText("Pontuação: " + score);
        text_lifes.setText(lifes);

        if (lifes <= 0) {
            var style = { font: "bold 42px Arial", fill: "#fff" };
            this.add.text(100, game_height / 2, "Pontuação final: " + score, style);
            input = this.add.text(game_width / 3, (game_height / 2) + 100, "Reiniciar?", style);
            music.mute = true;
            this.scene.restart();
            this.input.on('pointerdown', function (pointer) {
                window.location.reload();
            });
        }
    }
});
function getProduct(player, product) {
    console.log("Get: " + product.name);
    combo_stacks++;
    combo_counter = 3;
    if (combo_stacks >= 2) {
        combo_effect = Math.floor(combo_stacks / 2);
    }
    score += 50 * combo_effect;
    switch (product.name) {
        case "cafe": {
            if (onSpeed = true) {
                speed_count = 5;
            }
            buff.play();
            onSpeed = true;
            player_speed = 700;
            emitter.setVisible(true);
            break;
        }
        case "sorvete": {
            if (freezed = true) {
                freeze_count = 5;
            }
            freeze.play();
            if (!sorvete_deployed) {
                sorvete_deployed = true;
                froze = this.add.particles('snow');
                create_snow = froze.createEmitter({
                    x: game_width / 2,
                    y: -50,
                    speed: 200,
                    scale: { start: 2, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 2000,
                    alpha: 0.7,
                })
                this.time.delayedCall(2000, function () {
                    froze.destroy();
                    sorvete_deployed = false;
                }, [], this);
            }
            freezed = true
            grvt_multiply = 0.3;
            break;
        }
        case "salgadinho": {
            if (grow = true) {
                grow_count = 5;
            }
            buff.play();
            if (!grow_deployed) {
                grow_deployed = true
                dismiss = this.add.particles('spark');
                grow = dismiss.createEmitter({
                    x: player.x,
                    y: player.y,
                    speed: 150,
                    tint: 0xff0000,
                    scale: { start: 2, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 5000,
                    alpha: 0.7,
                });
                this.time.delayedCall(500, function () {
                    dismiss.destroy();
                    grow_deployed = false;
                }, [], this);
            }
            grow = true
            player.scale = 1.5;

            break;
        }
        case "pimenta": {
            if (pimenta) {
                pimenta_count = 5;
            }
            fire.play();
            pimenta = true;
            grvt_multiply = 4;
            combo_effect *= 2;
            if (!pimenta_deployed) {
                pimenta_deployed = true;
                pimenta_pr = this.add.particles('pimenta_spr');
                create_pimenta = pimenta_pr.createEmitter({
                    x: game_width / 2,
                    y: -50,
                    speed: 200,
                    scale: { start: 2, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 2000,
                    alpha: 0.7,
                })
                this.time.delayedCall(2000, function () {
                    pimenta_pr.destroy();
                    pimenta_deployed = false;
                }, [], this);
            }
            break;
        }
        case "apple": {
            god.play();
            lifes += 1;
            break;
        }
    }
    product.destroy();
}
function destroyProduct(product) {
    damage.play();
    lifes -= 1;
    combo_effect = 1;
    if (!dismiss_deployed) {
        dismiss_deployed = true;
        dismiss = this.add.particles('spark');
        product_destroys = dismiss.createEmitter({
            x: product.x,
            y: product.y,
            speed: 50,
            tint: 0xff0000,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            alpha: 0.7,
        });
        this.time.delayedCall(500, function () {
            dismiss.destroy();
            dismiss_deployed = false;
        }, [], this);
    }
    product.destroy();
}
function updateSpawnCounter() {
    spawn_counter++;
    //console.log(spawn_counter);
    updateGlobalTimer(spawn_counter);
}

function updateGlobalTimer(counter) {
    //A cada vez que 100 milissegundos contar 10 vezes: 1 segundo se passa
    if (counter % 10 == 0) {
        global_counter++;
        //console.log(global_counter);
    }
    //para cada 1/5 de segundo
    if (counter % 2 == 0) {
        //console.log(score);
        score += 1;
    }
}
function decrementComboTimer() {
    combo_counter -= 1
    if (combo_counter <= 0) {
        combo_stacks = 0;
        combo_counter = 3;
        combo_effect = 1;
    }
}

function decrementEffectTime() {
    if (onSpeed) {
        speed_count -= 1
        if (speed_count <= 0) {
            speed_count = 5;
            onSpeed = false;
            player_speed = 400;
            emitter.setVisible(false);
        }
    }
    if (freezed) {
        freeze_count -= 1;
        if (freeze_count <= 0) {
            freezed = false;
            freeze_count = 5;
            grvt_multiply = 1;
        }
    }
    if (grow) {
        grow_count -= 1;
        if (grow_count <= 0) {
            player.scale = 1;
            grow = false;
            grow_count = 5;
        }
    }
    if (pimenta) {
        pimenta_count -= 1;
        if (pimenta_count <= 0) {
            pimenta = false;
            pimenta_count = 5;
            grvt_multiply = 1;
        }
    }
}
function ResetAttributs() {
    player_speed = 400;
    effect_count = 5;
}


const game_config = {
    type: Phaser.AUTO,
    width: game_width,
    height: game_height,
    parent: "main_frame",
    title: "DescontoZ",
    version: "0.01 alpha",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: "arcade",
        debug: false
    },
    scene: [sceneA]
}
var game = new Phaser.Game(game_config);



