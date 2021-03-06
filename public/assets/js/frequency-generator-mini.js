var freqGen = function($, context) {
    function DocumentClickTracker() {
        var e = this;
        e.mouseDownTarget = null, e.touchStartData = {
            id: null,
            target: null
        }, e.callback = null, e.start = function(t) {
            if (null !== e.callback) throw "Cannot execute DocumentClickTracker.start(): already started.";
            document.addEventListener("mousedown", e.onMouseDown, !1), document.addEventListener("mouseup", e.onMouseUp, !1), document.addEventListener("keydown", e.onKeyDown, !1), void 0 !== document.ontouchstart && (document.addEventListener("touchstart", e.onTouchStart, !1), document.addEventListener("touchmove", e.onTouchMove, !1), document.addEventListener("touchend", e.onTouchEnd, !1)), e.callback = t
        }, e.stop = function() {
            null !== e.callback && (e.callback = null, document.removeEventListener("mousedown", e.onMouseDown, !1), document.removeEventListener("mouseup", e.onMouseUp, !1), document.removeEventListener("keydown", e.onKeyDown, !1), void 0 !== document.ontouchstart && (document.removeEventListener("touchstart", e.onTouchStart, !1), document.removeEventListener("touchmove", e.onTouchMove, !1), document.removeEventListener("touchend", e.onTouchEnd, !1)))
        }, e.reset = function() {
            e.mouseDownTarget = null, e.touchStartData.id = null
        }, e.onMouseDown = function(t) {
            0 === t.button && (e.mouseDownTarget = t.target)
        }, e.onMouseUp = function(t) {
            0 === t.button && null !== e.mouseDownTarget && (e.callback(e.mouseDownTarget), e.mouseDownTarget = null)
        }, e.onTouchStart = function(t) {
            if (1 != t.touches.length || (t.altKey || t.shiftKey || t.ctrlKey || t.metaKey)) null !== e.touchStartData.id && (e.touchStartData.id = null);
            else {
                var n = t.changedTouches[0];
                e.touchStartData.id = n.identifier, e.touchStartData.target = t.target
            }
        }, e.onTouchMove = function(t) {
            null !== e.touchStartData.id && 1 == t.changedTouches.length && (e.touchStartData.id = null)
        }, e.onTouchEnd = function(t) {
            0 != t.touches.length || t.altKey || t.shiftKey || t.ctrlKey || t.metaKey || t.changedTouches[0].identifier == e.touchStartData.id && (e.callback(e.touchStartData.target), e.touchStartData.id = null)
        }, e.onKeyDown = function(t) {
            27 != t.keyCode || t.shiftKey || t.altKey || t.ctrlKey || t.metaKey || e.callback(document)
        }
    }

    function getViewportHeight() {
        return window.innerHeight ? window.innerHeight : document.documentElement.clientHeight > 0 ? document.documentElement.clientHeight : _context.clientHeight > 0 ? _context.clientHeight : !1
    }

    function getViewportWidth() {
        return window.innerWidth ? window.innerWidth : document.documentElement.clientWidth > 0 ? document.documentElement.clientWidth : _context.clientWidth > 0 ? _context.clientWidth : !1
    }

    function onPlayButtonClick() {
        tones.playing ? (window.playButton.innerHTML = " <i class='glyphicon glyphicon-play'> </i> Reproducir", window.playIndicator.className = "<i class='glyphicon glyphicon-pause'>  </i> Parado", tones.stop()) : (window.playButton.innerHTML = " <i class='glyphicon glyphicon-pause'> </i> Parar", window.playIndicator.className = " <i class='glyphicon glyphicon-play'> </i> Reproduciendo", tones.play(window.sliderFreq))
    }

    function separateThousands(e) {
       // for (var t = e.toString(), n = "", o = t.length - 1 - 2; o > 0; o -= 3) n = "," + t.substr(o, 3) + n;
        return e //n = t.slice(0, o + 3) + n
    }

    function formatPercent(e) {
        return Math.round(100 * e).toString() + "%"
    }

    function sliderPosToFreq(e) {
        return Math.round(20 * Math.pow(1.0025, e) - 19)
    }

    function freqToSliderPos(e) {
        return Math.round(Math.log((e + 19) / 20) / Math.log(1.0025))
    }

    function changeFreqBy(e) {
        e > 0 ? window.setFreq(Math.floor(window.sliderFreq) + e) : 0 > e && window.setFreq(Math.ceil(window.sliderFreq) + e)
    }

    function FrequencyReadout(e) {
        var t = document.querySelector(e);
        if (!t) throw "Cannot find element " + e;
        var n = document.createElement("small"),
            o = document.createTextNode(""),
            i = document.createTextNode(""),
            l = document.createTextNode(""),
            d = document.createElement("small"),
            a = document.createTextNode(" Hz");
        n.appendChild(o), d.appendChild(l), d.appendChild(a), t.appendChild(n), t.appendChild(i), t.appendChild(d), this.tildeOn = !1, this.fractionOn = !1, this.update = function() {
            var e = window.sliderFreq.toString().split(".");
            if (e.length >= 1)
                if (i.nodeValue = separateThousands(e[0]), 2 == e.length)
                    if (e[1].length <= 2) l.nodeValue = "." + e[1], this.fractionOn = !0, o.nodeValue = "";
                    else {
                        if (e[1].charAt(2) >= "5") var t = parseInt(e[1].slice(0, 2)) + 1;
                        else var t = e[1].slice(0, 2);
                        l.nodeValue = "." + t, this.fractionOn = !0, o.nodeValue = "~ ", this.tildeOn = !0
                    }
            else this.fractionOn && (l.nodeValue = ""), this.tildeOn && (o.nodeValue = "")
        }
    }

    function NoteSelector(e, t) {
        var n = this;
        n.button = e, n.tilde = document.createTextNode(""), n.button.appendChild(n.tilde), n.buttonText = document.createTextNode(""), n.button.appendChild(n.buttonText), n.button.onclick = function(e) {
            noteSelectorWindow.show(t, function() {
                n.button.classList.remove("window-shown")
            }), n.button.classList.add("window-shown")
        }, n.updateFromFreq = function() {
            var e = 12 * Math.log2(window.sliderFreq / 440) + 49,
                t = Math.round(e);
            t >= MIN_PIANO_KEY && MAX_PIANO_KEY >= t ? (n.buttonText.nodeValue = NOTE_NAMES[t], n.tilde.nodeValue = e == t ? "" : "~ ") : (n.buttonText.nodeValue = "pick note", n.tilde.nodeValue = "")
        }, n.displayKey = function(e) {
            n.buttonText.nodeValue = NOTE_NAMES[e], n.tilde.nodeValue = ""
        }
    }

    function handleKeyDown(e) {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) switch (e.keyCode) {
            case 37:
                if (e.target == window.volSliderHandle) return;
                e.shiftKey ? (e.preventDefault(), changeFreqBy(-1)) : (e.preventDefault(), window.moveSliderBy(-1));
                break;
            case 39:
                if (e.target == window.volSliderHandle) return;
                e.shiftKey ? (e.preventDefault(), changeFreqBy(1)) : (e.preventDefault(), window.moveSliderBy(1));
                break;
            case 32:
                e.preventDefault(), onPlayButtonClick()
        }
    }

    function blockSpaceKeydown(e) {
        e.ctrlKey || e.altKey || e.metaKey || 32 != e.keyCode || (e.preventDefault(), e.stopPropagation())
    }

    function UpDownButton(e, t) {
        if (this.button = document.getElementById(e), !this.button) return !1;
        this.timeoutID = null, this.intervalID = null, this.action = t;
        var n = this;
        this.startRepeatPress = function() {
            n.action(), n.intervalID = setInterval(n.action, 80)
        }, this.button.onmousedown = function(e) {
            n.timeoutID || n.intervalID || (n.action(), n.timeoutID = setTimeout(n.startRepeatPress, 500), window.addEventListener("mouseup", n.onMouseUp, !0))
        }, this.onMouseUp = function(e) {
            n.timeoutID && (clearTimeout(n.timeoutID), n.timeoutID = null), n.intervalID && (clearInterval(n.intervalID), n.intervalID = null), window.removeEventListener("mouseup", n.onMouseUp)
        }, this.button.ontouchstart = function(e) {
            n.timeoutID || n.intervalID || (e.preventDefault(), n.action(), n.timeoutID = setTimeout(n.startRepeatPress, 500))
        }, this.button.ontouchend = function(e) {
            n.timeoutID && (clearTimeout(n.timeoutID), n.timeoutID = null), n.intervalID && (clearInterval(n.intervalID), n.intervalID = null), e.preventDefault()
        }
    }

    function init() {
        if ("undefined" == typeof OscillatorNode || "undefined" == typeof OscillatorNode.prototype.start || void 0 === Math.log2) {
            var e = document.createElement("div");
            e.id = "browser-warning", e.innerHTML = "The Online Tone Generator won’t work because your browser does not fully support the Web Audio API. You can use the Online Tone Generator if you install a recent version of Firefox, Chrome or Safari.", _context.appendChild(e)
        }
        $("#slider").slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 2770,
            value: 440,
            step: 1,
            slide: function(e, t) {
                window.sliderFreq = sliderPosToFreq(t.value), window.freqReadout.update(), window.noteSelector.updateFromFreq(), tones.playing && tones.play(window.sliderFreq)
            },
            stop: function(e, t) {}
        }), $("#volume-slider").slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: 100,
            step: 1,
            slide: function(e, t) {
                window.volume = t.value / 100, $("#volume-readout").html(formatPercent(window.volume)), tones.changeVolume(window.volume)
            },
            stop: function(e, t) {}
        });
        var t = $("#slider").slider().data("ui-slider");
        t._handleEvents.keydown = function(e) {}, t._setupEvents(), new UpDownButton("freq-up-button", function() {
            changeFreqBy(1)
        }), new UpDownButton("freq-down-button", function() {
            changeFreqBy(-1)
        });
        var n = document.getElementById("octave-up-button"),
            o = document.getElementById("octave-down-button");
        n.onclick = function() {
            window.setFreq(2 * window.sliderFreq)
        }, o.onclick = function() {
            window.setFreq(window.sliderFreq / 2)
        }, window.slider_jq = $("#slider"), window.freqReadout = new FrequencyReadout("#freq-readout"), window.volSlider_jq = $("#volume-slider"), window.volume = $("#volume-slider").slider("value") / 100, $("#volume-readout").html(formatPercent(window.volume)), window.setFreq = function(e) {
            return MIN_FREQ > e || e > MAX_FREQ ? !1 : e == window.sliderFreq ? !0 : (window.slider_jq.slider("value", freqToSliderPos(e)), window.sliderFreq = e, window.freqReadout.update(), window.noteSelector.updateFromFreq(), void(tones.playing && tones.play(window.sliderFreq)))
        }, window.setKey = function(e) {
            return MIN_PIANO_KEY > e || e > MAX_PIANO_KEY ? !1 : (window.sliderFreq = 440 * Math.pow(2, (e - 49) / 12), window.slider_jq.slider("value", freqToSliderPos(window.sliderFreq)), window.freqReadout.update(), window.noteSelector.displayKey(e), void(tones.playing && tones.play(window.sliderFreq)))
        }, window.moveSliderBy = function(e) {
            var t = window.slider_jq.slider("value") + e;
            window.slider_jq.slider("option", "value", t), window.sliderFreq = sliderPosToFreq(t), window.freqReadout.update(), window.noteSelector.updateFromFreq(), tones.playing && tones.play(window.sliderFreq)
        }, window.noteSelector = new NoteSelector(document.getElementById("note-selector"), window.setKey), window.getLinkButton = document.getElementById("get-link"), window.getLinkButton.onclick = function() {
            getLinkWindow.show(window.getLinkButton)
        };
        var i = window.location.hash.substr(1);
        if ("" !== i)
            if (i.charAt(0) >= "0" && i.charAt(0) <= "9") i = parseFloat(window.location.hash.substr(1)), window.setFreq(i >= MIN_FREQ && MAX_FREQ >= i ? i : 440);
            else if (/^\ws?\d$/.test(i)) {
            i = i.replace("s", "♯");
            var l = NOTE_NAMES.findIndex(function(e) {
                return i == e.substr(0, i.length)
            }); - 1 != l ? window.setKey(l) : window.setFreq(440)
        } else window.setFreq(440);
        else window.setFreq(440);
        "undefined" != typeof AudioContext ? window.context = new AudioContext : "undefined" != typeof webkitAudioContext && (window.context = new webkitAudioContext), window.playButton = document.getElementById("play-button"), window.playIndicator = document.getElementById("play-indicator"), window.sliderHandle = document.querySelector("#slider .ui-slider-handle"), window.volSliderHandle = document.querySelector("#volume-slider .ui-slider-handle"), document.addEventListener("keydown", handleKeyDown), window.playButton.addEventListener("keydown", blockSpaceKeydown)
    }
    var FADE_TIME = .1,
        MIN_FREQ = 1,
        MAX_FREQ = 20154,
        MIN_PIANO_KEY = 1,
        MAX_PIANO_KEY = 99,
        FIRST_C = 4,
        NOTE_NAMES = ["", "A0 Dbl Pedal A", "A♯0 / B♭0", "B0", "C1 Pedal C", "C♯1 / D♭1", "D1", "D♯1 / E♭1", "E1", "F1", "F♯1 / G♭1", "G1", "G♯1 / A♭1", "A1", "A♯1 / B♭1", "B1", "C2 Deep C", "C♯2 / D♭2", "D2", "D♯2 / E♭2", "E2", "F2", "F♯2 / G♭2", "G2", "G♯2 / A♭2", "A2", "A♯2 / B♭2", "B2", "C3 Tenor C", "C♯3 / D♭3", "D3", "D♯3 / E♭3", "E3", "F3", "F♯3 / G♭3", "G3", "G♯3 / A♭3", "A3", "A♯3 / B♭3", "B3", "C4 Middle C", "C♯4 / D♭4", "D4", "D♯4 / E♭4", "E4", "F4", "F♯4 / G♭4", "G4", "G♯4 / A♭4", "A4", "A♯4 / B♭4", "B4", "C5", "C♯5 / D♭5", "D5", "D♯5 / E♭5", "E5", "F5", "F♯5 / G♭5", "G5", "G♯5 / A♭5", "A5", "A♯5 / B♭5", "B5", "C6 Soprano C", "C♯6 / D♭6", "D6", "D♯6 / E♭6", "E6", "F6", "F♯6 / G♭6", "G6", "G♯6 / A♭6", "A6", "A♯6 / B♭6", "B6", "C7 Dbl high C", "C♯7 / D♭7", "D7", "D♯7 / E♭7", "E7", "F7", "F♯7 / G♭7", "G7", "G♯7 / A♭7", "A7", "A♯7 / B♭7", "B7", "C8", "C♯8 / D♭8", "D8", "D♯8 / E♭8", "E8", "F8", "F♯8 / G♭8", "G8", "G♯8 / A♭8", "A8", "A♯8 / B♭8", "B8"],
        _context = $(".freqGenContainer")[0] || document.body,
        getLinkWindow = {
            WIDTH: 450,
            button: null,
            div: null,
            input: null,
            windowHeight: 0,
            tracker: null,
            prepare: function() {
                getLinkWindow.div = document.createElement("div"), getLinkWindow.div.id = "get-link-window", getLinkWindow.div.style.position = "fixed", getLinkWindow.div.style.visibility = "hidden", getLinkWindow.div.style.opacity = "0", getLinkWindow.div.style.width = getLinkWindow.WIDTH + "px", getLinkWindow.div.innerHTML = "<div class=desc>This URL goes straight to the current tone:</div>", getLinkWindow.box = document.createElement("div"), getLinkWindow.box.className = "box", getLinkWindow.div.appendChild(getLinkWindow.box);
                var e = document.createElement("div");
                e.className = "message", e.appendChild(document.createTextNode("Esc or click outside window to close")), getLinkWindow.div.appendChild(e), _context.appendChild(getLinkWindow.div);
                var t = getLinkWindow.div.getBoundingClientRect();
                getLinkWindow.height = t.bottom - t.top
            },
            show: function(button) {
                null == getLinkWindow.div && getLinkWindow.prepare(), getLinkWindow.button = button, getLinkWindow.button.classList.add("window-shown"), getLinkWindow.box.innerHTML = getLinkWindow.getShortURL();
                var viewportHeight = getViewportHeight(),
                    viewportWidth = getViewportWidth();
                with(getLinkWindow.div.style) left = (viewportWidth - getLinkWindow.WIDTH > 0 ? Math.round((viewportWidth - getLinkWindow.WIDTH) / 2) : 0) + "px", top = (viewportHeight - getLinkWindow.height > 0 ? Math.round((viewportHeight - getLinkWindow.height) / 2) : 0) + "px";
                getLinkWindow.div.style.transition = "opacity 0.1s linear", getLinkWindow.div.style.visibility = "", getLinkWindow.div.style.opacity = "";
                var range = new Range;
                range.selectNodeContents(getLinkWindow.box);
                var sel = window.getSelection();
                sel.removeAllRanges(), sel.addRange(range), getLinkWindow.tracker = new DocumentClickTracker, getLinkWindow.tracker.start(getLinkWindow.hide)
            },
            hide: function(e) {
                getLinkWindow.div && !getLinkWindow.div.contains(e) && (getLinkWindow.button.classList.remove("window-shown"), getLinkWindow.tracker.stop(), getLinkWindow.div.style.transition = "opacity 0.1s linear, visibility 0s linear 0.1s", getLinkWindow.div.style.opacity = "0", getLinkWindow.div.style.visibility = "hidden")
            },
            getShortURL: function() {
                var e, t = 12 * Math.log2(window.sliderFreq / 440) + 49;
                if (t % 1 == 0 && t >= MIN_PIANO_KEY && MAX_PIANO_KEY >= t) {
                    var n = /^\w♯?\d/.exec(NOTE_NAMES[t]);
                    e = null !== n ? n[0].replace("♯", "s") : window.sliderFreq
                } else e = window.sliderFreq;
                var o = "www." == window.location.hostname.slice(0, 4) ? window.location.hostname.slice(4) : window.location.hostname;
                return window.location.protocol + "//" + o + "/tone#" + e
            }
        },
        noteSelectorWindow = {
            shown: !1,
            panel: null,
            callback4NoteSelect: null,
            callback4WindowClose: null,
            prepare: function() {
                with(noteSelectorWindow.panel = document.createElement("div"), noteSelectorWindow.panel.id = "note-selector-panel", noteSelectorWindow.panel.style) position = "fixed", visibility = "hidden", opacity = "0";
                var closeButton = document.createElement("button");
                closeButton.className = "close-button", closeButton.onclick = noteSelectorWindow.hide, closeButton.appendChild(document.createTextNode("×")), noteSelectorWindow.panel.appendChild(closeButton);
                var table = document.createElement("table"),
                    key = FIRST_C > 1 ? FIRST_C - 12 : 1,
                    nextC = FIRST_C - 12;
                do {
                    var row = document.createElement("tr");
                    for (nextC += 12, key; nextC > key && MAX_PIANO_KEY >= key; key++) {
                        var cell = document.createElement("td"),
                            noteIndexOnScale = (key - FIRST_C + 12) % 12;
                        (1 == noteIndexOnScale || 3 == noteIndexOnScale || 6 == noteIndexOnScale || 8 == noteIndexOnScale || 10 == noteIndexOnScale) && (cell.className = "halftone"), key >= 1 && cell.appendChild(noteSelectorWindow.getButton(key)), row.appendChild(cell)
                    }
                    table.appendChild(row)
                } while (MAX_PIANO_KEY >= key);
                noteSelectorWindow.panel.appendChild(table), _context.appendChild(noteSelectorWindow.panel), noteSelectorWindow.panelShown = !1;
                noteSelectorWindow.panel.clientHeight
            },
            getButton: function(e) {
                var t = document.createElement("button"),
                    n = 440 * Math.pow(2, (e - 49) / 12);
                t.value = e;
                var o = NOTE_NAMES[e].indexOf(" "),
                    i = NOTE_NAMES[e].indexOf(" /"); - 1 == o && (o = NOTE_NAMES[e].length), -1 == i && (i = NOTE_NAMES[e].length);
                var l = NOTE_NAMES[e].slice(0, Math.min(o, i)),
                    n = (n !== Math.floor(n) ? "~" : "") + n.toFixed(0);
                return t.innerHTML = l + "<small>" + n + "</small>", t.title = l + " (" + n + " Hz)", t.onclick = noteSelectorWindow.onButtonClick, t
            },
            onButtonClick: function(e) {
                noteSelectorWindow.callback4NoteSelect(this.value)
            },
            show: function(callback4NoteSelect, callback4WindowClose) {
                if (null == noteSelectorWindow.panel && noteSelectorWindow.prepare(), noteSelectorWindow.shown) noteSelectorWindow.callback4WindowClose();
                else {
                    with(noteSelectorWindow.panel.style) transition = "opacity 0.1s linear", visibility = "", opacity = "";
                    noteSelectorWindow.shown = !0
                }
                noteSelectorWindow.callback4NoteSelect = callback4NoteSelect, noteSelectorWindow.callback4WindowClose = callback4WindowClose
            },
            hide: function(event) {
                if (!noteSelectorWindow.shown) return !1;
                with(noteSelectorWindow.panel.style) transition = "opacity 0.1s linear, visibility 0s linear 0.1s", opacity = "0", visibility = "hidden";
                noteSelectorWindow.callback4WindowClose(), noteSelectorWindow.shown = !1
            }
        },
        tones = {
            playing: !1,
            volume: 1,
            play: function(e) {
                this.playing ? this.oscillator.frequency.value = e : (this.playing = !0, this.oscillator = window.context.createOscillator(), this.gainNode = window.context.createGain(), this.oscillator.connect(this.gainNode), this.gainNode.connect(window.context.destination), this.oscillator.frequency.value = e, this.gainNode.gain.linearRampToValueAtTime(0, window.context.currentTime), this.gainNode.gain.linearRampToValueAtTime(this.volume, window.context.currentTime + FADE_TIME), this.oscillator.start(0))
            },
            stop: function() {
                if (this.playing) {
                    var e = window.context.currentTime;
                    this.gainNode.gain.linearRampToValueAtTime(this.volume, e + .05), this.gainNode.gain.linearRampToValueAtTime(0, e + .05 + FADE_TIME), this.oscillator.stop(e + .05 + FADE_TIME), this.playing = !1
                }
            },
            changeVolume: function(e) {
                this.playing && (this.gainNode.gain.linearRampToValueAtTime(this.gainNode.gain.value, window.context.currentTime), this.gainNode.gain.linearRampToValueAtTime(e, window.context.currentTime + FADE_TIME)), this.volume = e
            }
        };
    return document.addEventListener ? document.addEventListener("DOMContentLoaded", init, !1) : window.onload = init, {
        onPlayButtonClick: onPlayButtonClick
    }
}(jQuery);