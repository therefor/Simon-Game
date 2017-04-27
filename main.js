var MYAPP = {
    timeOuts: [],
    gameInPlay: false,
    strict: false,
    arr:[],
    count: 0,
    audioSelect: document.createElement('audio'),
    audio:[
        "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",//color
        "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
        "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3",
        "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3",
        "http://www.zapsplat.com/wp-content/uploads/2015/sound-effects-little-robot-sound-factory/little_robot_sound_factory_Jingle_achievement_01.mp3", //start
        "http://www.zapsplat.com/wp-content/uploads/2015/sound-effects-noise-creations/noisecreations_SFX-NCFREE02_Flabby-Burd.mp3", //point up
        "https://www.myinstants.com/media/sounds/wrong-buzzer-sound-effect.mp3", //wrong
        "http://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/household_vacuum_cleaner_upright_on_off_switch_press.mp3", //button
        "https://www.myinstants.com/media/sounds/sfx_die.mp3",// die when strict
        "https://www.myinstants.com/media/sounds/168860__orginaljun__light-switch-01.mp3"], //on &off button

    initialize: function(){
        //点击on and off 开关
        $(".switch").click(function(){
            MYAPP.display.playAudio(9);
            //count led灯亮起
            if(!MYAPP.gameInPlay){
                $(".count").removeClass("ledOffNumber").addClass("ledOnNumber");
                $(".switchButton").css("left", "20px");

                MYAPP.timeOuts.push(
                    setTimeout(function(){
                        MYAPP.display.playAudio(4);
                    }, 400));
                MYAPP.gameInPlay = true;
            }else{
                //关闭所有灯，并关闭游戏
                $(".startLed, .strictLed").removeClass("ledOn").addClass("ledOff");
                $(".count").removeClass("ledOnNumber").addClass("ledOffNumber");
                $(".switchButton").css("left", "0px");

                MYAPP.timeOuts.push(
                    setTimeout(function(){
                        MYAPP.audioSelect.pause();
                    }, 40));
                MYAPP.game.resetStrict();
                MYAPP.game.clearVars();
                $(".count").html("--");
            }
        });

        //点击开始按钮
        $(".start").off().click(function(){
            MYAPP.display.playAudio(7);
            if(MYAPP.gameInPlay){
                //开始游戏，并开启start的led灯
                $(".startLed").removeClass("ledOff").addClass("ledOn");
                MYAPP.game.newGame();
            }
        });

        $(".strict").off().click(function(){
            //更改strict的值，开关led灯光
            MYAPP.display.playAudio(7);
            if(MYAPP.gameInPlay && !MYAPP.strict ){
                MYAPP.strict = true;
                $(".strictLed").removeClass("ledOff").addClass("ledOn");
            }else if(MYAPP.gameInPlay && MYAPP.strict){
                $(".strictLed").removeClass("ledOn").addClass("ledOff");
                MYAPP.strict = false;
            }
        });
    }
}

//display and play audio
MYAPP.display = {

    //闪烁感叹号
    flashCount: function(){
        $(".count").html("!!");
        MYAPP.timeOuts.push(
            setTimeout(function() {
                MYAPP.display.updateCount();
            }, 1500));
    },

    //依次闪烁各个颜色
    flashColor: function(tempCount){
        $(".green, .red, .blue, .yellow").off();
        var classArr = [ ".green", ".red", ".blue", ".yellow"];
        var delay = 900; //1 second
        for (var i = 0;  i < tempCount+1; i++) {
            var a = function(v){
                //为了正确实现setTimeout的顺序，使用闭包
                return function(){
                    $(classArr[MYAPP.arr[v]]).css("opacity", 1);
                    MYAPP.display.playAudio(MYAPP.arr[v]);
                    var b = function(w){
                        return function(){
                            $(classArr[MYAPP.arr[w]]).css("opacity", 0.8);
                        }
                    }
                    setTimeout(b(v), 500);
                }
            }
            setTimeout(a(i),delay*i+1500);
        }
        setTimeout(function(){
            MYAPP.game.clickColor();
        }, delay*(tempCount)+1500);

    },

    //更新得分count
    updateCount: function(){
        var count = MYAPP.count > 9 ? MYAPP.count : "0"+MYAPP.count;
        $(".count").html(count);
    },

    //播放audio
    playAudio: function(i){
        MYAPP.audioSelect.src = MYAPP.audio[i];
        MYAPP.audioSelect.play();
    }
}

//game logic
MYAPP.game = {
    //重设strict的值
    resetStrict: function(){
        MYAPP.strict = false;
    },

    //turn off the game, reset vars
    clearVars: function(){
        $(".green, .red, .blue, .yellow").off();
        MYAPP.timeOuts.forEach(function(timer) {
            clearTimeout(timer);
        });
        MYAPP.gameInPlay = false;
        MYAPP.arr = [];
        MYAPP.count = 0;
    },

    //点击start按钮开始新游戏
    newGame: function(){
        MYAPP.game.clearVars();
        MYAPP.display.updateCount();
        MYAPP.gameInPlay = true;
        MYAPP.arr = MYAPP.game.randomArr();
        MYAPP.display.flashColor(MYAPP.count);
    },

    //每次点击色块，都调用该函数
    clickColor: function(){
        var tempClick = 0;
        $(".green, .red, .blue, .yellow").mousedown(function(){
            //提高亮度，并播放声音
            var val = $(this).attr("value");
            MYAPP.display.playAudio(val);
            $(this).css("opacity", 1);
        });
        $(".green, .red, .blue, .yellow").mouseup(function(){
            $(this).css("opacity", 0.8);
            var val = $(this).attr("value");
            if (MYAPP.game.check(val, tempClick) && tempClick === MYAPP.count){
                //这一轮结束，开启下一轮
                MYAPP.count += 1;
                if( MYAPP.count >= 99 ){ MYAPP.count = 0; }
                setTimeout(function(){
                    MYAPP.display.playAudio(5);
                    MYAPP.display.updateCount();
                }, 800);
                MYAPP.display.flashColor(MYAPP.count);
            }else if(MYAPP.game.check(val, tempClick) && tempClick < MYAPP.count){
                //这一轮还没完，玩家继续点颜色
                tempClick += 1;
            }else if ( !MYAPP.game.check(val, tempClick) && !MYAPP.strict){
                //重新提醒一次
                setTimeout(function(){
                    MYAPP.display.flashCount();
                    MYAPP.display.playAudio(8);
                }, 800);
                MYAPP.display.flashColor(MYAPP.count);
            }else if ( !MYAPP.game.check(val, tempClick) && MYAPP.strict){
                //重来
                MYAPP.display.playAudio(6);
                setTimeout(function(){
                    MYAPP.count = 0;
                    MYAPP.display.flashCount();
                }, 800);
                setTimeout(function(){
                    MYAPP.display.flashCount();
                    MYAPP.display.updateCount();
                    MYAPP.game.newGame();
                }, 3000);
            }
        });
    },

    //获取随机数0-3
    random: function(){
        return Math.floor(Math.random() * 4);
    },

    //返回一个99位数组，应该没人玩到99步…
    randomArr: function(){
        var arr = [];
        for (var i = 0; i <= 99; i++){
            var j = MYAPP.game.random();
            arr.push(j);
        }
        return arr;
    },

    //按对了顺序没啊？
    check: function(i, tempClick){
        if(MYAPP.arr[tempClick] == i){
            return true;
        }else{
            return false;
        }
    }
}

$(document).ready(function(){
    MYAPP.initialize();
});