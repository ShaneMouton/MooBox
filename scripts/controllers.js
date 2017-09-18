/* events closure */
(function() {
    var keyPressed = [];

    var shouldKeyBeToggled = (function() {
        var keyToggler = [];
        return function(keycode){
            /* keyboard event clears toggler */
            if (arguments[1] === true){
                keyToggler[keycode] = 0;
                return;
            }
            if(keyToggler[keycode]) keyToggler[keycode] = 0;
            return (keyToggler[keycode]++ % 4);
        };
    }());

    function keyDown(keyCode){
        var e = new KeyboardEvent("keydown", {
            bubbles : true,
            cancelable : true,
            shiftKey : true,
            keyCode : keyCode
        });

        /* to ensure we don't send multiple keydown events */
        if(!keyPressed[keyCode])
        {
            window.dispatchEvent(e);
            keyPressed[keyCode] = true;
        }
    }

    function keyUp(keyCode){
        var e = new KeyboardEvent("keyup", {
            bubbles : true,
            cancelable : true,
            shiftKey : true,
            keyCode : keyCode
        });

        /* to ensure we don't send multiple keyup events */
        if(keyPressed[keyCode])
        {
            window.dispatchEvent(e);
            keyPressed[keyCode] = false;
        }
    }

    (function() {
        /*    direc   data-id */
        const up    = 0;
        const left  = 1;
        const down  = 2;
        const right = 3;
        const b     = 4;
        const a     = 5;
        const select= 6;
        const start = 7;

        /* Classes used for badges in onScreenKeyboard */
        var className = [];
        className[up]    = 'conUp';
        className[left]  = 'conLeft';
        className[right] = 'conRight';
        className[down]  = 'conDown';
        className[a]     = 'conA';
        className[b]     = 'conB';
        className[select]= 'conSelect';
        className[start] = 'conStart';

        var conBindings = [];

        /*          direc     keycode */
        conBindings[up]     = 38;
        conBindings[left]   = 37;
        conBindings[down]   = 40;
        conBindings[right]  = 39;
        conBindings[a]      = 16;
        conBindings[b]      = 16;
        conBindings[select] = 83;
        conBindings[start]  = 13;

        var pressed = [false,false,false,false,false];
        var lastPressed = [false,false,false,false,false];

        /* input events closure */
        (function() {
            var xoffset;
            var yoffset;

            /* used with touch events since they provide absolute coords */
            function getAbsoluteJoystickCenter(){
                var x = $('#joystick').offset().left + ($('#joystick').width() - $('#innerJoystick').width())/2;
                var y = $('#joystick').offset().top + ($('#joystick').height() - $('#innerJoystick').height())/2;

                return {x:x,y:y};
            }

            /* all other positioning */
            function getRelativeJoystickCenter(){
                var x = ($('#joystick').width() - $('#innerJoystick').width())/2;
                var y = ($('#joystick').height() - $('#innerJoystick').height())/2;

                return {x:x,y:y};
            }

            function getAbsoluteInnerJoystickCenter(){
                var x = $('#innerJoystick').offset().left;
                var y = $('#innerJoystick').offset().top;

                return {x:x,y:y};
            }

            function getDistance(c0, c1){
                //return Math.sqrt(2**(c1.x-c0.x)+2**(c1.y-c0.y));
                return Math.sqrt(Math.pow(c1.x-c0.x,2)+Math.pow(c1.y-c0.y,2));
            }

            // var thisId;

            $('#innerJoystick').bind("touchstart", (function(){
                return function(e){
                    // console.log(e);
                    //var thisTouch;

                    var thisId;

                    for(var i = 0; i < e.touches.length ; i++){
                        if(e.touches[i].target.id === 'innerJoystick')
                            thisId = i;
                    }

                    xoffset = $('#innerJoystick').offset().left -
                              e.touches[thisId].clientX +
                              ($('#joystick').width() - $('#innerJoystick').width())/2;

                    yoffset = $('#innerJoystick').offset().top -
                              e.touches[thisId].clientY +
                              ($('#joystick').width() - $('#innerJoystick').height())/2;
                }
            }()));

            $('#innerJoystick').bind("touchmove", (function(){
                function findIntersection(vertex, point){
                    var d = getDistance(vertex, point);
                    var dt = ($('#joystick').width() - $('#innerJoystick').width())/2;
                    var t = dt/d;
                    var x0 = vertex.x;
                    var y0 = vertex.y;
                    var x1 = point.x;
                    var y1 = point.y;
                    var x = (1 - t) * x0 + t*x1;
                    var y = (1 - t) * y0 + t*y1;

                    return {x: x, y: y};
                }

                function interpretControls(x,y){
                    const deadZoneRadius = 8;
                    const z = 1.5; //diag overlap -- 1.5 yeilds 8 zones of equal size
                    var d = getDistance({x:0, y:0}, {x:x,y:y});

                    if(d > deadZoneRadius){
                        if(x < y*z && -x < y*z){//up
                            pressed[up] = true;
                        }

                        if(x < -y*z && -x < -y*z){//down
                            pressed[down] = true;
                        }

                        if(-x*z < -y && -x*z < y){//left
                            pressed[left] = true;
                        }

                        if(x*z < -y && x*z < y){//right
                            pressed[right] = true;
                        }
                    }

                    for(let i = 0; i < 4; i++){
                        if(pressed[i] !== lastPressed[i]){
                            /* keystate changed */
                            if(pressed[i]) // press virtual key
                                keyDown(conBindings[i]);

                            if(lastPressed[i]) // release virtual key
                                keyUp(conBindings[i]);
                        }
                    }

                    /* set up for next iteration */
                    lastPressed = pressed;
                    pressed = [false,false,false,false,false];
                }

                return function(e){
                    var thisId;
                    for(var i = 0; i < e.touches.length ; i++){
                        if(e.touches[i].target.id === 'innerJoystick')
                            thisId = i;
                    }

                    var joystickCenter = getAbsoluteJoystickCenter();
                    var innerWidth = ($('#joystick').width() - $('#innerJoystick').width())/2;
                    var widths = $('#innerJoystick').width()/innerWidth;

                    var x = e.touches[thisId].clientX + xoffset - innerWidth;
                    var y = e.touches[thisId].clientY + yoffset - innerWidth;

                    var distance = getDistance(joystickCenter,
                        {x:x,
                        y:y});

                    if(distance > innerWidth)
                    {
                        var intersection = findIntersection(joystickCenter,
                            {x:x,
                            y:y});

                        x = intersection.x;
                        y = intersection.y;
                    }

                    // /* The finger has left the joystick */
                    // if(distance > innerWidth)
                    // {
                    //     xoffset = $('#innerJoystick').offset().left -
                    //               e.touches[thisId].clientX +
                    //               ($('#joystick').width() - $('#innerJoystick').width())/2;
                    //
                    //     yoffset = $('#innerJoystick').offset().top -
                    //               e.touches[thisId].clientY +
                    //               ($('#joystick').width() - $('#innerJoystick').height())/2;
                    //
                    // }

                    interpretControls(joystickCenter.x - x, joystickCenter.y - y);

                    x += innerWidth;
                    y += innerWidth;

                    $('#innerJoystick').css('top',  y - joystickCenter.y + 'px');
                    $('#innerJoystick').css('left', x - joystickCenter.x + 'px');
                }

            }()));

            $('#innerJoystick').bind("touchend", (function(){
                return function(e){
                    var joy = getRelativeJoystickCenter();

                    pressed = [false,false,false,false,false];

                    for(let i = 0; i < 4; i++){
                        if(pressed[i] !== lastPressed[i]){
                            /* keystate changed */
                            if(pressed[i]) // press virtual key
                                keyDown(conBindings[i]);

                            if(lastPressed[i]) // release virtual key
                                keyUp(conBindings[i]);
                        }
                    }

                    lastPressed = [false,false,false,false,false];

                    $('#innerJoystick').css('top', joy.y + 'px');
                    $('#innerJoystick').css('left', joy.x + 'px');
                }

            }()));

            $('.conButton').bind("touchstart", (function(){
                return function(e){
                    var buttonId = parseInt($(this).data('id'));
                    var keycode = conBindings[buttonId];
                    //console.log("keydown: " + keycode);
                    keyDown(keycode);
                }
            }()));

            $('.conButton').bind("touchend", (function(){
                return function(e){
                    var buttonId = parseInt($(this).data('id'));
                    var keycode = conBindings[buttonId];
                    keyUp(keycode);
                }
            }()));

            //$( "#keyboardContainer" ).animate({top: "0"}, 400);

            $('#keyboardGlyph').bind("touchstart", (function(){
                var keyboardVisible = false;
                return function(e){
                    if (!keyboardVisible){
                        $( "#keyboardContainer" ).animate({top: "0"}, 400);
                    } else {
                        $( "#keyboardContainer" ).animate({top: "-28.5vw"}, 400);
                    }

                    keyboardVisible = !keyboardVisible;
                }
            }()));

            //
            // $('.conButton').bind("touchend", function(){
            //
            // });


            // $('.conButton').mousedown(function(){
            //     var buttonId = parseInt($(this).data('id'));
            //     var keycode = conBindings[buttonId];
            //     lastKeyClicked = keycode;
            //     //console.log("keydown: " + keycode);
            //     keyDown(keycode);
            // });

            var lastKeyClicked = null;

            $(".key").mousedown(function(){
                var keycode = $(this).data('id');
                lastKeyClicked = keycode;
                keyDown(keycode);
            });

            $("body").mouseup(function(){
                if(lastKeyClicked){
                    var keycode = lastKeyClicked;
                    //console.log("keyup: " + keycode);
                    keyUp(keycode);
                    lastKeyClicked = null;
                }
            });
        }());

        /* Add bindings to UI */
        (function() {
            conBindings.forEach(function(keycode, button){
                var selector = getSelectorFromKeycode(keycode);
                var secondaryClass = className[button];

                $(selector).addClass('bound');
                $(selector).addClass(secondaryClass);
            });
        }());
    }());





    function getSelectorFromKeycode(keycode){
        var selectorString = '';

        switch (keycode) {
            case 16: selectorString = '.shiftKey'; break;
            case 17: selectorString = '.controlKey'; break;
            case 18: selectorString = '.altKey'; break;
            default: selectorString = '#key' + keycode; break;
        }

        return selectorString;
    }

    /* key event listeners */
    (function() {
        window.addEventListener("keydown", function(e){
            var keycode = e.keyCode;
            var selectorString = getSelectorFromKeycode(keycode);

            $(selectorString).addClass('keyPressed');
        });

        window.addEventListener("keyup", function(e){
            var keycode = e.keyCode;

            var selectorString = getSelectorFromKeycode(keycode);
            $(selectorString).removeClass('keyPressed');
        });
    }());
}());
