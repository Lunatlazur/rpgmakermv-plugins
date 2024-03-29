//=============================================================================
// Lunatlazur_Transition.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 Taku Aoi
// This plugin is released under the zlib License.
// https://zlib.net/zlib_license.html
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2018-04-01
// ----------------------------------------------------------------------------
// [Web]    : https://lunatlazur.com
// [Twitter]: https://twitter.com/aoitaku
// [GitHub] : https://github.com/lunatlazur
//=============================================================================
/*:
 * @plugindesc Fade-in / fade-out with transition
 * @author Taku Aoi
 * @help This plugin makes it possible to set the transition at fade-in / fade-out.
 *
 * It supports fade-in / fade-out and fade time specification on a white screen.
 * You can also use it as a custom fade function without using transitions.
 *
 * Usage
 * =====
 *
 * Transition images need to be placed in the `img/transitions` folder.
 *
 *
 * Plug-in command list
 * ====================
 *
 * fadein
 * ------
 *
 *     fadein <color> <transition image name> <duration>
 *
 * Perform fade-in.
 *
 *
 *     <color> { white | black }
 *
 * Color when fading in.
 *
 * Specify white to fade in from a white screen, specify black to fade in
 * from a black screen.
 *
 *
 *     <transition image name> string
 *
 * Image file name in `img/transitions` folder.
 *
 *
 *     <duration> number
 *
 * Specify the time to fade by the number of frames.
 *
 *
 * fadeout
 * -------
 *
 *     fadeout <color> <transition image name> <duration>
 *
 * Perform fade-out.
 *
 *
 *     <color> { white | black }
 *
 * Color when fading out.
 *
 * Specify white to fade out from a white screen, specify black to fade out
 * from a black screen.
 *
 *
 *     <transition image name> string
 *
 * Image file name in `img/transitions` folder.
 *
 *
 *     <duration> number
 *
 * Specify the time to fade by the number of frames.
 *
 *
 * History
 * =======
 *
 * 1.0.0 2018-04-01
 * ----------------
 * - Published.
 *
 */
/*:ja
 * @plugindesc トランジションつきフェードイン／フェードアウトプラグイン
 * @author あおいたく
 * @help このプラグインはフェードイン／フェードアウトの際にトランジションを設定できる
 * ようにします。
 *
 * 白画面でのフェードイン／フェードアウトや、フェード時間の指定に対応しているため
 * トランジションを使わずにカスタムフェード機能として使うこともできます。
 *
 * 使い方
 * ======
 *
 * トランジション画像は `img/transitions` フォルダに配置してください。
 *
 *
 * プラグインコマンド一覧
 * ======================
 *
 * フェードイン
 * ------------
 *
 *     フェードイン <色> <トランジション画像名> <フェードにかける時間>
 *
 * フェードインを行います。
 *
 *
 *     <色> { 白 | 黒 }
 *
 * フェードインするときの色を指定します。
 *
 * 白を指定すると白画面からフェードイン、
 * 黒を指定する黒画面からフェードインします。
 *
 *
 *     <トランジション画像名> 文字列
 *
 * `img/transitions` フォルダ内の画像ファイル名
 *
 *
 *     <フェードにかける時間> nフレーム
 *
 * フェードにかける時間をフレーム数で指定します。
 *
 *
 * フェードアウト
 * --------------
 *
 *     フェードアウト <色> <トランジション画像名> <フェードにかける時間>
 *
 * フェードアウトを行います。
 *
 *
 *     <色> { 白 | 黒 }
 *
 * フェードアウトするときの色を指定します。
 *
 * 白を指定すると白画面からフェードアウト、
 * 黒を指定する黒画面からフェードアウトします。
 *
 *
 *     <トランジション画像名> 文字列
 *
 * `img/transitions` フォルダ内の画像ファイル名
 *
 *
 *     <フェードにかける時間> nフレーム
 *
 * フェードにかける時間をフレーム数で指定します。
 *
 *
 * 変更履歴
 * ========
 *
 * 1.0.0 2018-04-01
 * ----------------
 * - 公開
 *
 */
(function () {
    'use strict';

    class ColorThresholdFilter extends PIXI.Filter {
        constructor() {
            const fragmentSrc = /* glsl */ `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float threshold;
uniform bool white;
uniform bool fadingIn;
void main(void) {
    vec4 color = texture2D(uSampler, vTextureCoord);
    float v = 0.298912 * color.r + 0.586611 * color.g + 0.114478 * color.b;
    if (white) {
        if (fadingIn) {
            gl_FragColor = vec4(vec3(threshold - v), 0.0);
        } else {
            gl_FragColor = vec4(vec3(1.0 - (v - threshold)), 0.0);
        }
    } else {
        if (fadingIn) {
            gl_FragColor = vec4(vec3(0.0), threshold - v);
        } else {
            gl_FragColor = vec4(vec3(0.0), 1.0 - (v - threshold));
        }
    }
}`;
            const uniforms = {
                threshold: { type: '1f', value: 0.5 },
                white: { type: 'b', value: false },
                fadingIn: { type: 'b', value: false },
            };
            super(null, fragmentSrc, uniforms);
        }
    }

    PIXI.filters.ColorThresholdFilter = ColorThresholdFilter;
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        switch (command) {
            case 'fadein':
            case 'フェードイン':
            case 'fadeout':
            case 'フェードアウト':
                const isFadingIn = command === 'fadein' || command === 'フェードイン';
                _Game_Interpreter_processTransitionCommand.call(this, isFadingIn, args);
                break;
        }
    };
    function _Game_Interpreter_processTransitionCommand(isFadingIn, args) {
        const { isFilledWhite, name, duration } = _Game_Interpreter_parseTransitionParameters.call(this, args);
        const spriteset = SceneManager._scene._spriteset;
        if (spriteset) {
            if (isFilledWhite) {
                spriteset._fadeSprite.setWhite();
            }
            else {
                spriteset._fadeSprite.setBlack();
            }
        }
        if (name) {
            if (isFadingIn) {
                $gameScreen._brightness = 255;
            }
            $gameScreen.startTransition(isFadingIn, isFilledWhite, name, duration);
            this.wait(duration);
        }
        else {
            _Game_Interpreter_fadeEx.call(this, isFadingIn, isFilledWhite, duration);
        }
    }
    function _Game_Interpreter_parseTransitionParameters(args) {
        let [fillOrNameOrDurationOrNone, nameOrDurationOrNone, durationOrNone] = args;
        const parameters = {
            isFilledWhite: false,
            duration: _Game_Interpreter_defaultFadeSpeed.call(this),
        };
        const fill = fillOrNameOrDurationOrNone;
        if (fill === '白' || fill === 'white') {
            parameters.isFilledWhite = true;
        }
        else if (fill !== '黒' && fill === 'black') {
            nameOrDurationOrNone = fillOrNameOrDurationOrNone;
            fillOrNameOrDurationOrNone = null;
        }
        const duration = durationOrNone || nameOrDurationOrNone;
        const matched = duration.match(/(\d+)(?:フレーム)?/);
        if (matched) {
            parameters.duration = parseInt(matched[1], 10);
            if (durationOrNone) {
                if (nameOrDurationOrNone) {
                    parameters.name = nameOrDurationOrNone;
                }
            }
        }
        else {
            if (!durationOrNone) {
                if (nameOrDurationOrNone) {
                    parameters.name = nameOrDurationOrNone;
                }
            }
        }
        return parameters;
    }
    function _Game_Interpreter_fadeEx(isFadingIn, isFilledWhite, duration) {
        if (isFadingIn) {
            TransitionManager.fadeSpeed = duration;
            if (!$gameMessage.isBusy()) {
                TransitionManager.setTransition(isFadingIn, isFilledWhite, '', 1);
                $gameScreen.startFadeIn(this.fadeSpeed());
                this.wait(this.fadeSpeed());
            }
            TransitionManager.fadeSpeed = null;
        }
        else {
            TransitionManager.fadeSpeed = duration;
            if (!$gameMessage.isBusy()) {
                $gameScreen.startFadeOut(this.fadeSpeed());
                this.wait(this.fadeSpeed());
            }
            TransitionManager.fadeSpeed = null;
        }
    }
    const _Game_Interpreter_defaultFadeSpeed = Game_Interpreter.prototype.fadeSpeed;
    Game_Interpreter.prototype.fadeSpeed = function () {
        if (TransitionManager.fadeSpeed !== null) {
            return TransitionManager.fadeSpeed;
        }
        return _Game_Interpreter_defaultFadeSpeed.call(this);
    };
    Game_Screen.prototype.startTransition = function (isFadingIn, isFilledWhite, name, duration) {
        TransitionManager.setTransition(isFadingIn, isFilledWhite, name, duration);
    };
    const _Spriteset_Base_createUpperLayer = Spriteset_Base.prototype.createUpperLayer;
    Spriteset_Base.prototype.createUpperLayer = function () {
        _Spriteset_Base_createUpperLayer.call(this);
        this._transitionSprite = new Sprite_Transition();
        this.addChild(this._transitionSprite);
    };
    class TransitionManager {
        static transition() {
            return this._transition;
        }
        static setTransition(isFadingIn, isFilledWhite, name, duration) {
            this._transition = new Game_Transition(isFadingIn, isFilledWhite, name, duration);
        }
        static clearTransition() {
            this._transition = null;
        }
        static load(filename, hue) {
            return ImageManager.loadBitmap('img/transitions/', filename, hue, true);
        }
    }
    TransitionManager.fadeSpeed = null;
    class Game_Transition {
        constructor(isFadingIn, isFilledWhite, name, duration) {
            this.isFadingIn = isFadingIn;
            this.isFilledWhite = isFilledWhite;
            this.name = name;
            this.duration = duration;
            this.durationRest = duration;
        }
        update() {
            if (this.durationRest > 0) {
                this.durationRest -= 1;
            }
        }
    }
    class Sprite_Transition extends Sprite_Base {
        initialize() {
            super.initialize();
            this._duration = 0;
            this._durationRest = 0;
            this._transitionName = '';
            this._isFadingIn = false;
            this._isFilledWhite = false;
            this.z = 4;
            this._thresholdFilter = new PIXI.filters.ColorThresholdFilter();
            this._thresholdFilter.uniforms.threshold = this._isFadingIn ? 0.0 : 1.0;
            this._thresholdFilter.uniforms.white = this._isFilledWhite;
            this._thresholdFilter.uniforms.fadingIn = this._isFadingIn;
            this._filters = [this._thresholdFilter];
            this._fillBitmap = new Bitmap(Graphics.width, Graphics.height);
            this._fillBitmap.fillAll('white');
            this.bitmap = this._fillBitmap;
        }
        transition() {
            return TransitionManager.transition();
        }
        update() {
            super.update();
            this.updateBitmap();
            if (this.visible) {
                this.updateTransition();
                this.updateFilter();
            }
        }
        updateBitmap() {
            const transition = this.transition();
            if (transition) {
                const transitionName = transition.name;
                if (this._transitionName !== transitionName) {
                    this._transitionName = transitionName;
                    this.loadBitmap();
                }
                this.visible = true;
            }
            else {
                this._transitionName = '';
                this.bitmap = this._fillBitmap;
                this.visible = false;
            }
        }
        updateTransition() {
            const transition = this.transition();
            if (transition) {
                transition.update();
                this._duration = transition.duration;
                this._durationRest = transition.durationRest;
                this._isFadingIn = transition.isFadingIn;
                this._isFilledWhite = transition.isFilledWhite;
                this._thresholdFilter.uniforms.white = this._isFilledWhite;
                this._thresholdFilter.uniforms.fadingIn = this._isFadingIn;
                if (this._durationRest <= 0) {
                    if (!this._isFadingIn) {
                        $gameScreen._brightness = 0;
                    }
                    TransitionManager.clearTransition();
                }
            }
        }
        updateFilter() {
            if (this._durationRest > 0) {
                const threshold = (this._durationRest * 2) / this._duration;
                this._thresholdFilter.uniforms.threshold = (this._isFadingIn ? threshold : 1.0 - threshold);
            }
        }
        loadBitmap() {
            this.bitmap = TransitionManager.load(this._transitionName);
        }
    }
    const Game_Interpreter_requestImages = Game_Interpreter.requestImages;
    Game_Interpreter.requestImages = function (list, commonList) {
        if (!list) {
            return;
        }
        list.filter(({ code }) => code === 356).forEach(({ parameters }) => {
            const args = parameters[0].split(' ');
            const command = args.shift();
            if (command === 'fadein' ||
                command === 'フェードイン' ||
                command === 'fadeout' ||
                command === 'フェードアウト') {
                const { name } = _Game_Interpreter_parseTransitionParameters.call(this, args);
                if (name) {
                    ImageManager.requestBitmap('img/transitions/', name, 0, true);
                }
            }
        });
        Game_Interpreter_requestImages.apply(this, arguments);
    };

}());
