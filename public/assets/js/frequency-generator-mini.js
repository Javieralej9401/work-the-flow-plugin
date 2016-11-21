var freqGen = (function($, context){

	var FADE_TIME = 0.1;
	var MIN_FREQ = 1;
	var MAX_FREQ = 20154;
	var MIN_PIANO_KEY = 1;
	var MAX_PIANO_KEY = 99;
	var FIRST_C = 4;
	var NOTE_NAMES = ["", "A0 Dbl Pedal A", "A♯0 / B♭0", "B0", "C1 Pedal C", "C♯1 / D♭1", "D1", "D♯1 / E♭1", "E1", "F1", "F♯1 / G♭1", "G1", "G♯1 / A♭1", "A1", "A♯1 / B♭1", "B1", "C2 Deep C", "C♯2 / D♭2", "D2", "D♯2 / E♭2", "E2", "F2", "F♯2 / G♭2", "G2", "G♯2 / A♭2", "A2", "A♯2 / B♭2", "B2", "C3 Tenor C", "C♯3 / D♭3", "D3", "D♯3 / E♭3", "E3", "F3", "F♯3 / G♭3", "G3", "G♯3 / A♭3", "A3", "A♯3 / B♭3", "B3", "C4 Middle C", "C♯4 / D♭4", "D4", "D♯4 / E♭4", "E4", "F4", "F♯4 / G♭4", "G4", "G♯4 / A♭4", "A4", "A♯4 / B♭4", "B4", "C5", "C♯5 / D♭5", "D5", "D♯5 / E♭5", "E5", "F5", "F♯5 / G♭5", "G5", "G♯5 / A♭5", "A5", "A♯5 / B♭5", "B5", "C6 Soprano C", "C♯6 / D♭6", "D6", "D♯6 / E♭6", "E6", "F6", "F♯6 / G♭6", "G6", "G♯6 / A♭6", "A6", "A♯6 / B♭6", "B6", "C7 Dbl high C", "C♯7 / D♭7", "D7", "D♯7 / E♭7", "E7", "F7", "F♯7 / G♭7", "G7", "G♯7 / A♭7", "A7", "A♯7 / B♭7", "B7", "C8", "C♯8 / D♭8", "D8", "D♯8 / E♭8", "E8", "F8", "F♯8 / G♭8", "G8", "G♯8 / A♭8", "A8", "A♯8 / B♭8", "B8"];
	var _context =  $(".freqGenContainer")[0] || document.body;

	function DocumentClickTracker() {
	    var a = this;
	    a.mouseDownTarget = null;
	    a.touchStartData = {
	        id: null,
	        target: null
	    };
	    a.callback = null;
	    a.start = function(b) {
	        if (a.callback !== null) {
	            throw "Cannot execute DocumentClickTracker.start(): already started."
	        }
	        document.addEventListener("mousedown", a.onMouseDown, false);
	        document.addEventListener("mouseup", a.onMouseUp, false);
	        document.addEventListener("keydown", a.onKeyDown, false);
	        if (document.ontouchstart !== undefined) {
	            document.addEventListener("touchstart", a.onTouchStart, false);
	            document.addEventListener("touchmove", a.onTouchMove, false);
	            document.addEventListener("touchend", a.onTouchEnd, false)
	        }
	        a.callback = b
	    };
	    a.stop = function() {
	        if (a.callback === null) {
	            return
	        }
	        a.callback = null;
	        document.removeEventListener("mousedown", a.onMouseDown, false);
	        document.removeEventListener("mouseup", a.onMouseUp, false);
	        document.removeEventListener("keydown", a.onKeyDown, false);
	        if (document.ontouchstart !== undefined) {
	            document.removeEventListener("touchstart", a.onTouchStart, false);
	            document.removeEventListener("touchmove", a.onTouchMove, false);
	            document.removeEventListener("touchend", a.onTouchEnd, false)
	        }
	    };
	    a.reset = function() {
	        a.mouseDownTarget = null;
	        a.touchStartData.id = null
	    };
	    a.onMouseDown = function(b) {
	        if (b.button === 0) {
	            a.mouseDownTarget = b.target
	        }
	    };
	    a.onMouseUp = function(b) {
	        if (b.button === 0 && a.mouseDownTarget !== null) {
	            a.callback(a.mouseDownTarget);
	            a.mouseDownTarget = null
	        }
	    };
	    a.onTouchStart = function(c) {
	        if (c.touches.length == 1 && !(c.altKey || c.shiftKey || c.ctrlKey || c.metaKey)) {
	            var b = c.changedTouches[0];
	            a.touchStartData.id = b.identifier;
	            a.touchStartData.target = c.target
	        } else {
	            if (a.touchStartData.id !== null) {
	                a.touchStartData.id = null
	            }
	        }
	    };
	    a.onTouchMove = function(b) {
	        if (a.touchStartData.id !== null) {
	            if (b.changedTouches.length == 1) {
	                a.touchStartData.id = null
	            }
	        }
	    };
	    a.onTouchEnd = function(b) {
	        if (b.touches.length == 0 && !(b.altKey || b.shiftKey || b.ctrlKey || b.metaKey)) {
	            if (b.changedTouches[0].identifier == a.touchStartData.id) {
	                a.callback(a.touchStartData.target);
	                a.touchStartData.id = null
	            }
	        }
	    };
	    a.onKeyDown = function(b) {
	        if (b.keyCode == 27 && !b.shiftKey && !b.altKey && !b.ctrlKey && !b.metaKey) {
	            a.callback(document)
	        }
	    }
	}

	function getViewportHeight() {
	    if (window.innerHeight) {
	        return window.innerHeight
	    } else {
	        if (document.documentElement.clientHeight > 0) {
	            return document.documentElement.clientHeight
	        } else {
	            if (_context.clientHeight > 0) {
	                return _context.clientHeight
	            } else {
	                return false
	            }
	        }
	    }
	}

	function getViewportWidth() {
	    if (window.innerWidth) {
	        return window.innerWidth
	    } else {
	        if (document.documentElement.clientWidth > 0) {
	            return document.documentElement.clientWidth
	        } else {
	            if (_context.clientWidth > 0) {
	                return _context.clientWidth
	            } else {
	                return false
	            }
	        }
	    }
	}

	function onPlayButtonClick() {
	    if (tones.playing) {
	        window.playButton.innerHTML = "Play";
	        window.playIndicator.className = "stopped";
	        tones.stop()
	    } else {
	        window.playButton.innerHTML = "Stop";
	        window.playIndicator.className = "playing";
	        tones.play(window.sliderFreq)
	    }
	}

	function formatNumber(a) {
	    var b = a.toString().split(".");
	    if (b.length == 1) {
	        return b[0].toLocaleString("en-US", {
	            style: "currency",
	            useGrouping: true
	        }) + " <small>Hz</small>"
	    } else {
	        if (b.length == 2) {
	            if (b[1].length <= 2) {
	                return b[0].toLocaleString("en-US") + "<small>." + b[1] + " Hz</small>"
	            } else {
	                return "<small>~&thinsp;</small>" + b[0].toLocaleString("en-US") + "<small>." + b[1].slice(0, 2) + " Hz</small>"
	            }
	        }
	    }
	}

	function separateThousands(c) {
	    var d = c.toString();
	    var b = "";
	    for (var a = d.length - 1 - 2; a > 0; a -= 3) {
	        b = "," + d.substr(a, 3) + b
	    }
	    b = d.slice(0, a + 3) + b;
	    return b
	}

	function formatHertz(b) {
	    var c = b.toString().split(".");
	    if (c.length == 1) {
	        return separateThousands(c[0]) + " <small>Hz</small>"
	    } else {
	        if (c.length == 2) {
	            if (c[1].length <= 2) {
	                return separateThousands(c[0]) + "<small>." + c[1] + " Hz</small>"
	            } else {
	                if (c[1].charAt(2) >= "5") {
	                    var a = parseInt(c[1].slice(0, 2)) + 1
	                } else {
	                    var a = c[1].slice(0, 2)
	                }
	                return "<small>~&thinsp;</small>" + separateThousands(c[0]) + "<small>." + a + " Hz</small>"
	            }
	        }
	    }
	}

	function formatPercent(a) {
	    return Math.round(a * 100).toString() + "%"
	}

	function sliderPosToFreq(a) {
	    return Math.round(20 * Math.pow(1.0025, a) - 19)
	}

	function freqToSliderPos(a) {
	    return Math.round(Math.log((a + 19) / 20) / Math.log(1.0025))
	}

	function changeFreqBy(a) {
	    if (a > 0) {
	        window.setFreq(Math.floor(window.sliderFreq) + a)
	    } else {
	        if (a < 0) {
	            window.setFreq(Math.ceil(window.sliderFreq) + a)
	        }
	    }
	}
	var getLinkWindow = {
	    WIDTH: 450,
	    button: null,
	    div: null,
	    input: null,
	    windowHeight: 0,
	    tracker: null,
	    prepare: function() {
	    	
	        getLinkWindow.div = document.createElement("div");
	        getLinkWindow.div.id = "get-link-window";
	        getLinkWindow.div.style.position = "fixed";
	        getLinkWindow.div.style.visibility = "hidden";
	        getLinkWindow.div.style.opacity = "0";
	        getLinkWindow.div.style.width = getLinkWindow.WIDTH + "px";
	        getLinkWindow.div.innerHTML = "<div class=desc>This URL goes straight to the current tone:</div>";
	        getLinkWindow.box = document.createElement("div");
	        getLinkWindow.box.className = "box";
	        getLinkWindow.div.appendChild(getLinkWindow.box);
	        var b = document.createElement("div");
	        b.className = "message";
	        b.appendChild(document.createTextNode("Esc or click outside window to close"));
	        getLinkWindow.div.appendChild(b);
	        _context.appendChild(getLinkWindow.div);
	        var a = getLinkWindow.div.getBoundingClientRect();
	        getLinkWindow.height = a.bottom - a.top
	    },
	    show: function(button) {
	        if (getLinkWindow.div == null) {
	            getLinkWindow.prepare()
	        }
	        getLinkWindow.button = button;
	        getLinkWindow.button.classList.add("window-shown");
	        getLinkWindow.box.innerHTML = getLinkWindow.getShortURL();
	        var viewportHeight = getViewportHeight();
	        var viewportWidth = getViewportWidth();
	        with(getLinkWindow.div.style) {
	            left = ((viewportWidth - getLinkWindow.WIDTH > 0) ? Math.round((viewportWidth - getLinkWindow.WIDTH) / 2) : 0) + "px";
	            top = ((viewportHeight - getLinkWindow.height > 0) ? Math.round((viewportHeight - getLinkWindow.height) / 2) : 0) + "px"
	        }
	        getLinkWindow.div.style.transition = "opacity 0.1s linear";
	        getLinkWindow.div.style.visibility = "";
	        getLinkWindow.div.style.opacity = "";
	        var range = new Range();
	        range.selectNodeContents(getLinkWindow.box);
	        var sel = window.getSelection();
	        sel.removeAllRanges();
	        sel.addRange(range);
	        getLinkWindow.tracker = new DocumentClickTracker();
	        getLinkWindow.tracker.start(getLinkWindow.hide)
	    },
	    hide: function(a) {
	        if (getLinkWindow.div && !getLinkWindow.div.contains(a)) {
	            getLinkWindow.button.classList.remove("window-shown");
	            getLinkWindow.tracker.stop();
	            getLinkWindow.div.style.transition = "opacity 0.1s linear, visibility 0s linear 0.1s";
	            getLinkWindow.div.style.opacity = "0";
	            getLinkWindow.div.style.visibility = "hidden"
	        }
	    },
	    getShortURL: function() {
	        var c = 12 * Math.log2(window.sliderFreq / 440) + 49;
	        var d;
	        if (c % 1 == 0 && c >= MIN_PIANO_KEY && c <= MAX_PIANO_KEY) {
	            var a = /^\w♯?\d/.exec(NOTE_NAMES[c]);
	            if (a !== null) {
	                d = a[0].replace("♯", "s")
	            } else {
	                d = window.sliderFreq
	            }
	        } else {
	            d = window.sliderFreq
	        }
	        var b = (window.location.hostname.slice(0, 4) == "www." ? window.location.hostname.slice(4) : window.location.hostname);
	        return window.location.protocol + "//" + b + "/tone#" + d
	    }
	};

	function FrequencyReadout(a) {
	    var b = document.querySelector(a);
	    if (!b) {
	        throw "Cannot find element " + a
	    }
	    var e = document.createElement("small");
	    var d = document.createTextNode("");
	    var c = document.createTextNode("");
	    var f = document.createTextNode("");
	    var h = document.createElement("small");
	    var g = document.createTextNode(" Hz");
	    e.appendChild(d);
	    h.appendChild(f);
	    h.appendChild(g);
	    b.appendChild(e);
	    b.appendChild(c);
	    b.appendChild(h);
	    this.tildeOn = false;
	    this.fractionOn = false;
	    this.update = function() {
	        var j = window.sliderFreq.toString().split(".");
	        if (j.length >= 1) {
	            c.nodeValue = separateThousands(j[0]);
	            if (j.length == 2) {
	                if (j[1].length <= 2) {
	                    f.nodeValue = "." + j[1];
	                    this.fractionOn = true;
	                    d.nodeValue = ""
	                } else {
	                    if (j[1].charAt(2) >= "5") {
	                        var i = parseInt(j[1].slice(0, 2)) + 1
	                    } else {
	                        var i = j[1].slice(0, 2)
	                    }
	                    f.nodeValue = "." + i;
	                    this.fractionOn = true;
	                    d.nodeValue = "~ ";
	                    this.tildeOn = true
	                }
	            } else {
	                if (this.fractionOn) {
	                    f.nodeValue = ""
	                }
	                if (this.tildeOn) {
	                    d.nodeValue = ""
	                }
	            }
	        }
	    }
	}
	var noteSelectorWindow = {
	    shown: false,
	    panel: null,
	    callback4NoteSelect: null,
	    callback4WindowClose: null,
	    prepare: function() {

	        noteSelectorWindow.panel = document.createElement("div");
	        noteSelectorWindow.panel.id = "note-selector-panel";
	        with(noteSelectorWindow.panel.style) {
	            position = "fixed";
	            visibility = "hidden";
	            opacity = "0"
	        }
	        var closeButton = document.createElement("button");
	        closeButton.className = "close-button";
	        closeButton.onclick = noteSelectorWindow.hide;
	        closeButton.appendChild(document.createTextNode("×"));
	        noteSelectorWindow.panel.appendChild(closeButton);
	        var table = document.createElement("table");
	        var key = (FIRST_C > 1 ? FIRST_C - 12 : 1);
	        var nextC = FIRST_C - 12;
	        do {
	            var row = document.createElement("tr");
	            nextC += 12;
	            for (key;
	                (key < nextC) && (key <= MAX_PIANO_KEY); key++) {
	                var cell = document.createElement("td");
	                var noteIndexOnScale = (key - FIRST_C + 12) % 12;
	                if (noteIndexOnScale == 1 || noteIndexOnScale == 3 || noteIndexOnScale == 6 || noteIndexOnScale == 8 || noteIndexOnScale == 10) {
	                    cell.className = "halftone"
	                }
	                if (key >= 1) {
	                    cell.appendChild(noteSelectorWindow.getButton(key))
	                }
	                row.appendChild(cell)
	            }
	            table.appendChild(row)
	        } while (key <= MAX_PIANO_KEY);
	        noteSelectorWindow.panel.appendChild(table);
	        _context.appendChild(noteSelectorWindow.panel);
	        noteSelectorWindow.panelShown = false;
	        var dummy = noteSelectorWindow.panel.clientHeight
	    },
	    getButton: function(c) {
	        var e = document.createElement("button");
	        var f = Math.pow(2, (c - 49) / 12) * 440;
	        e.value = c;
	        var a = NOTE_NAMES[c].indexOf(" ");
	        var b = NOTE_NAMES[c].indexOf(" /");
	        if (a == -1) {
	            a = NOTE_NAMES[c].length
	        }
	        if (b == -1) {
	            b = NOTE_NAMES[c].length
	        }
	        var d = NOTE_NAMES[c].slice(0, Math.min(a, b));
	        var f = (f !== Math.floor(f) ? "~" : "") + f.toFixed(0);
	        e.innerHTML = d + "<small>" + f + "</small>";
	        e.title = d + " (" + f + " Hz)";
	        e.onclick = noteSelectorWindow.onButtonClick;
	        return e
	    },
	    onButtonClick: function(a) {
	        noteSelectorWindow.callback4NoteSelect(this.value)
	    },
	    show: function(callback4NoteSelect, callback4WindowClose) {

	        if (noteSelectorWindow.panel == null) {
	            noteSelectorWindow.prepare()
	        }
	        if (noteSelectorWindow.shown) {
	            noteSelectorWindow.callback4WindowClose()
	        } else {
	            with(noteSelectorWindow.panel.style) {
	                transition = "opacity 0.1s linear";
	                visibility = "";
	                opacity = ""
	            }
	            noteSelectorWindow.shown = true
	        }
	        noteSelectorWindow.callback4NoteSelect = callback4NoteSelect;
	        noteSelectorWindow.callback4WindowClose = callback4WindowClose
	    },
	    hide: function(event) {
	        if (!noteSelectorWindow.shown) {
	            return false
	        }
	        with(noteSelectorWindow.panel.style) {
	            transition = "opacity 0.1s linear, visibility 0s linear 0.1s";
	            opacity = "0";
	            visibility = "hidden"
	        }
	        noteSelectorWindow.callback4WindowClose();
	        noteSelectorWindow.shown = false
	    }
	};

	function NoteSelector(b, c) {
	    var a = this;
	    a.button = b;
	    a.tilde = document.createTextNode("");
	    a.button.appendChild(a.tilde);
	    a.buttonText = document.createTextNode("");
	    a.button.appendChild(a.buttonText);
	    a.button.onclick = function(d) {
	        noteSelectorWindow.show(c, function() {
	            a.button.classList.remove("window-shown")
	        });
	        a.button.classList.add("window-shown")
	    };
	    a.updateFromFreq = function() {
	        var d = 12 * Math.log2(window.sliderFreq / 440) + 49;
	        var e = Math.round(d);
	        if (e >= MIN_PIANO_KEY && e <= MAX_PIANO_KEY) {
	            a.buttonText.nodeValue = NOTE_NAMES[e];
	            a.tilde.nodeValue = (d == e ? "" : "~ ")
	        } else {
	            a.buttonText.nodeValue = "pick note";
	            a.tilde.nodeValue = ""
	        }
	    };
	    a.displayKey = function(d) {
	        a.buttonText.nodeValue = NOTE_NAMES[d];
	        a.tilde.nodeValue = ""
	    }
	}

	function handleKeyDown(a) {
	    if (!a.ctrlKey && !a.altKey && !a.metaKey) {
	        switch (a.keyCode) {
	            case 37:
	                if (a.target == window.volSliderHandle) {
	                    return
	                }
	                if (a.shiftKey) {
	                    a.preventDefault();
	                    window.changeFreqBy(-1)
	                } else {
	                    a.preventDefault();
	                    window.moveSliderBy(-1)
	                }
	                break;
	            case 39:
	                if (a.target == window.volSliderHandle) {
	                    return
	                }
	                if (a.shiftKey) {
	                    a.preventDefault();
	                    window.changeFreqBy(1)
	                } else {
	                    a.preventDefault();
	                    window.moveSliderBy(1)
	                }
	                break;
	            case 32:
	                a.preventDefault();
	                onPlayButtonClick();
	                break
	        }
	    }
	}

	function blockSpaceKeydown(a) {
	    if (!a.ctrlKey && !a.altKey && !a.metaKey && a.keyCode == 32) {
	        a.preventDefault();
	        a.stopPropagation()
	    }
	}

	function UpDownButton(a, c) {
	    this.button = document.getElementById(a);
	    if (!this.button) {
	        return false
	    }
	    this.timeoutID = null;
	    this.intervalID = null;
	    this.action = c;
	    var b = this;
	    this.startRepeatPress = function() {
	        b.action();
	        b.intervalID = setInterval(b.action, 80)
	    };
	    this.button.onmousedown = function(d) {
	        if (b.timeoutID || b.intervalID) {
	            return
	        }
	        b.action();
	        b.timeoutID = setTimeout(b.startRepeatPress, 500);
	        window.addEventListener("mouseup", b.onMouseUp, true)
	    };
	    this.onMouseUp = function(d) {
	        if (b.timeoutID) {
	            clearTimeout(b.timeoutID);
	            b.timeoutID = null
	        }
	        if (b.intervalID) {
	            clearInterval(b.intervalID);
	            b.intervalID = null
	        }
	        window.removeEventListener("mouseup", b.onMouseUp)
	    };
	    this.button.ontouchstart = function(d) {
	        if (b.timeoutID || b.intervalID) {
	            return
	        }
	        d.preventDefault();
	        b.action();
	        b.timeoutID = setTimeout(b.startRepeatPress, 500)
	    };
	    this.button.ontouchend = function(d) {
	        if (b.timeoutID) {
	            clearTimeout(b.timeoutID);
	            b.timeoutID = null
	        }
	        if (b.intervalID) {
	            clearInterval(b.intervalID);
	            b.intervalID = null
	        }
	        d.preventDefault()
	    }
	}

	function getFreqFromHash() {
	    var b = window.location.hash.substr(1);
	    if (b !== "") {
	        if (b.charAt(0) >= "0" && b.charAt(0) <= "9") {
	            b = parseFloat(window.location.hash.substr(1));
	            if (b < MIN_FREQ || b > MAX_FREQ) {
	                return 440
	            } else {
	                return b
	            }
	        } else {
	            if (/^\ws?\d$/.test(b)) {
	                b = b.replace("s", "♯");
	                var a = NOTE_NAMES.findIndex(function(c) {
	                    return (b == c.substr(0, b.length))
	                });
	                return (a == -1 ? 440 : Math.pow(2, (a - 49) / 12) * 440)
	            } else {
	                return 440
	            }
	        }
	    } else {
	        return 440
	    }
	}
	var tones = {
	    playing: false,
	    volume: 1,
	    play: function(a) {
	        if (!this.playing) {
	            this.playing = true;
	            this.oscillator = window.context.createOscillator();
	            this.gainNode = window.context.createGain();
	            this.oscillator.connect(this.gainNode);
	            this.gainNode.connect(window.context.destination);
	            this.oscillator.frequency.value = a;
	            this.gainNode.gain.linearRampToValueAtTime(0, window.context.currentTime);
	            this.gainNode.gain.linearRampToValueAtTime(this.volume, window.context.currentTime + FADE_TIME);
	            this.oscillator.start(0)
	        } else {
	            this.oscillator.frequency.value = a
	        }
	    },
	    stop: function() {
	        if (!this.playing) {
	            return
	        }
	        var a = window.context.currentTime;
	        this.gainNode.gain.linearRampToValueAtTime(this.volume, a + 0.05);
	        this.gainNode.gain.linearRampToValueAtTime(0, a + 0.05 + FADE_TIME);
	        this.oscillator.stop(a + 0.05 + FADE_TIME);
	        this.playing = false
	    },
	    changeVolume: function(a) {
	        if (this.playing) {
	            this.gainNode.gain.linearRampToValueAtTime(this.gainNode.gain.value, window.context.currentTime);
	            this.gainNode.gain.linearRampToValueAtTime(a, window.context.currentTime + FADE_TIME)
	        }
	        this.volume = a
	    }
	};
	if (document.addEventListener) {
	    document.addEventListener("DOMContentLoaded", init, false)
	} else {
	    window.onload = init
	}

	function init() {
	    if (typeof(OscillatorNode) === "undefined" || typeof(OscillatorNode.prototype.start) === "undefined" || Math.log2 === undefined) {
	        var e = document.createElement("div");
	        e.id = "browser-warning";
	        e.innerHTML = "The Online Tone Generator won’t work because your browser does not fully support the Web Audio API. You can use the Online Tone Generator if you install a recent version of Firefox, Chrome or Safari.";
	        _context.appendChild(e)
	    }
	    $("#slider").slider({
	        orientation: "horizontal",
	        range: "min",
	        min: 0,
	        max: 2770,
	        value: 440,
	        step: 1,
	        slide: function(g, h) {
	            window.sliderFreq = sliderPosToFreq(h.value);
	            window.freqReadout.update();
	            window.noteSelector.updateFromFreq();
	            if (tones.playing) {
	                tones.play(window.sliderFreq)
	            }
	        },
	        stop: function(h, g) {}
	    });
	    $("#volume-slider").slider({
	        orientation: "horizontal",
	        range: "min",
	        min: 0,
	        max: 100,
	        value: 100,
	        step: 1,
	        slide: function(g, h) {
	            window.volume = h.value / 100;
	            $("#volume-readout").html(formatPercent(window.volume));
	            tones.changeVolume(window.volume)
	        },
	        stop: function(h, g) {}
	    });
	    var b = $("#slider").slider().data("ui-slider");
	    b._handleEvents.keydown = function(g) {};
	    b._setupEvents();
	    new UpDownButton("freq-up-button", function() {
	        window.changeFreqBy(1)
	    });
	    new UpDownButton("freq-down-button", function() {
	        window.changeFreqBy(-1)
	    });
	    var a = document.getElementById("octave-up-button");
	    var d = document.getElementById("octave-down-button");
	    a.onclick = function() {
	        window.setFreq(window.sliderFreq * 2)
	    };
	    d.onclick = function() {
	        window.setFreq(window.sliderFreq / 2)
	    };
	    window.slider_jq = $("#slider");
	    window.freqReadout = new FrequencyReadout("#freq-readout");
	    window.volSlider_jq = $("#volume-slider");
	    window.volume = $("#volume-slider").slider("value") / 100;
	    $("#volume-readout").html(formatPercent(window.volume));
	    window.setFreq = function(g) {
	        if (g < MIN_FREQ || g > MAX_FREQ) {
	            return false
	        }
	        if (g == window.sliderFreq) {
	            return true
	        }
	        window.slider_jq.slider("value", freqToSliderPos(g));
	        window.sliderFreq = g;
	        window.freqReadout.update();
	        window.noteSelector.updateFromFreq();
	        if (tones.playing) {
	            tones.play(window.sliderFreq)
	        }
	    };
	    window.setKey = function(g) {
	        if (g < MIN_PIANO_KEY || g > MAX_PIANO_KEY) {
	            return false
	        }
	        window.sliderFreq = Math.pow(2, (g - 49) / 12) * 440;
	        window.slider_jq.slider("value", freqToSliderPos(window.sliderFreq));
	        window.freqReadout.update();
	        window.noteSelector.displayKey(g);
	        if (tones.playing) {
	            tones.play(window.sliderFreq)
	        }
	    };
	    window.moveSliderBy = function(h) {
	        var g = window.slider_jq.slider("value") + h;
	        window.slider_jq.slider("option", "value", g);
	        window.sliderFreq = sliderPosToFreq(g);
	        window.freqReadout.update();
	        window.noteSelector.updateFromFreq();
	        if (tones.playing) {
	            tones.play(window.sliderFreq)
	        }
	    };
	    window.noteSelector = new NoteSelector(document.getElementById("note-selector"), window.setKey);
	    window.getLinkButton = document.getElementById("get-link");
	    window.getLinkButton.onclick = function() {
	        getLinkWindow.show(window.getLinkButton)
	    };
	    var f = window.location.hash.substr(1);
	    if (f !== "") {
	        if (f.charAt(0) >= "0" && f.charAt(0) <= "9") {
	            f = parseFloat(window.location.hash.substr(1));
	            window.setFreq((f >= MIN_FREQ && f <= MAX_FREQ) ? f : 440)
	        } else {
	            if (/^\ws?\d$/.test(f)) {
	                f = f.replace("s", "♯");
	                var c = NOTE_NAMES.findIndex(function(g) {
	                    return (f == g.substr(0, f.length))
	                });
	                if (c != -1) {
	                    window.setKey(c)
	                } else {
	                    window.setFreq(440)
	                }
	            } else {
	                window.setFreq(440)
	            }
	        }
	    } else {
	        window.setFreq(440)
	    }
	    if (typeof(AudioContext) !== "undefined") {
	        window.context = new AudioContext()
	    } else {
	        if (typeof(webkitAudioContext) !== "undefined") {
	            window.context = new webkitAudioContext()
	        }
	    }
	    window.playButton = document.getElementById("play-button");
	    window.playIndicator = document.getElementById("play-indicator");
	    window.sliderHandle = document.querySelector("#slider .ui-slider-handle");
	    window.volSliderHandle = document.querySelector("#volume-slider .ui-slider-handle");
	    document.addEventListener("keydown", handleKeyDown);
	    window.playButton.addEventListener("keydown", blockSpaceKeydown)
	};

	return {
		onPlayButtonClick: onPlayButtonClick
	}
}(jQuery));