
(function () {

    var createPropVal = function (value, enumerable, writable, configurable) {
        return { value: value, enumerable: !!enumerable, writable: !!writable, configurable: !!configurable };
    };

    var createAnimation = function (frameCreationFunc, transparency, direction, loops, framesSize, framesRate, ending) {
        var obj = Object.create(animation_type, {
            frameCreationFunc: createPropVal(frameCreationFunc, true),
            transparency: createPropVal(typeof transparency == 'undefined' ? true : transparency, true),
            direction: createPropVal(!direction ? 'both' : direction),
            loops: createPropVal(!loops ? Infinity : loops, true),
            framesSize: createPropVal(!framesSize ? null : framesSize, true),
            framesRate: createPropVal(!framesRate ? 1 : framesRate, true),
            ending: createPropVal(!ending ? {smooth: true, frame: Infinity} : ending)
        });

        obj.createFrames();
        return obj;
    };

    var animation_type = {
        frameCreationFunc: function (frameIndex) { },
        frames: [],
        direction: 'both',
        framesRate: 1,
        loops: Infinity,
        ending: {smooth: true, frame: null},
        transparency: true,
        framesSize: { w: 0, h: 0 },
        createFrames: function () {
            this.frames = [];
            var frame;
            var index = 0;
            while (frame = this.frameCreationFunc(index)) {
                this.frames.push(frame);
                index++;
            }
        },
        start: function (ctx, box) {
            if (!ctx) ctx = document.createElement("canvas").getContext('2d'); // design_mode
            if (!this.frames)
                this.createFrames();
            if (!box.w || !box.h) {
                box.w = this.framesSize.w;
                box.h = this.framesSize.h;
            }
            // a copy of the original state of background Canvas where animation is going to be drawn
            var noAnimImage = ctx.getImageData(box.x, box.y, box.w, box.h);
            var framesRate = this.framesRate;
            var totalFrames = this.frames.length;
            var loops = this.loops * totalFrames;
            var frames = this.frames;
            var currentFrameIndex = 0;
            var currentReqAnimFrameIndex = 0;
            var direction = this.direction == 'both' ? 3 : 1; // 1=forward, 2=backward, 3=both
            var aending = this.ending;

            var animationStatus = Object.create(animation_status_type,
            {
            ///<param name='endAtLoop'>End the animation smoothly at the end of the current loop.</param>
            ///<param name='frame'>Specify the frame in which the animaiton should stop. Pass -1 to back to original background image</param>
                stop: createPropVal(function (ending) {
                    if(!ending) ending = aending;
                        this._ending = ending;
                    if (!ending.smooth)
                        loops = 0;
                    else {
                        var directedTotalFrames = (totalFrames * (direction == 3 ? 2 : 1));
                        loops = (Math.floor(currentFrameIndex / directedTotalFrames) * directedTotalFrames + directedTotalFrames);
                    }
                }, true, false, false),
                ///<summary>Called privatley by animate() function</summary>
                _ended: createPropVal(function () {
                    var frame = this._ending.frame;
                    if (typeof frame == 'number') {
                        if (frame > -1) {
                            if (!this._ending.smooth)
                                drawFrame(frame == Infinity ? (frames.length - 1) : frame);
                        } else
                            ctx.putImageData(noAnimImage, box.x, box.y);
                    }
                }, false, false, false),
                _ending: createPropVal(aending, false, true, false)
            });

            var drawFrame = function (index) {
                var frame = frames[index];
                ctx.putImageData(noAnimImage, box.x, box.y);
                ctx.drawImage(frame, box.x, box.y);
            };

            var animate = function () {
                if ((currentReqAnimFrameIndex % framesRate) == 0) {
                    var mod1 = currentFrameIndex % totalFrames;
                    var reversing = false;
                    if (direction == 3) {
                        var mod2 = currentFrameIndex % (totalFrames * 2);
                        reversing = mod1 != mod2;
                    }

                    drawFrame(reversing ? totalFrames - mod1 - 1 : mod1);
                    currentFrameIndex++;
                }
                currentReqAnimFrameIndex++;
                if (currentFrameIndex < loops)
                    window.requestAnimFrame(animate);
                else
                    animationStatus._ended();
            };
            window.requestAnimFrame(animate);

            return animationStatus;
        }
    };

    var animation_status_type = {
        stop: function (frame) {

        }
    };

    this.createCanvasAnimation = createAnimation;
})(this);