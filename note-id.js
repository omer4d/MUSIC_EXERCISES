function makeLine(x1, y1, x2, y2, color, w) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', w);
	return line;
}

function makeImage(x, y, src) {
	var img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttribute('x', x);
    img.setAttribute('y', y);
	img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src);
	return img;
}

var patt = ["C", "D", "E", "F", "G", "A", "B"];
var notes = [];

for(var i = 0; i < 6; ++i) {
  for(var j = 0; j < patt.length; ++j) {
    notes.push(patt[j] + (i + 1));
  }
}

notes = notes.slice(4, 39).reverse();

function noteY(idx) {
	return (idx + 1) * 10;
}

var SPACE_WIDTH = 20;
var NOTE_CENTER_X = 275;

function makeNote(idx) {
	var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	
	if(idx < notes.indexOf("G5")) {
		for(var y = noteY(notes.indexOf("G5")) - 10; y > noteY(idx) - 10; y -= SPACE_WIDTH)
			g.appendChild(makeLine(NOTE_CENTER_X - 20, y, NOTE_CENTER_X + 20, y, "black", 1));
	}
	
	else if(idx === notes.indexOf("C4"))
		g.appendChild(makeLine(NOTE_CENTER_X - 20, noteY(idx), NOTE_CENTER_X + 20, noteY(idx), "black", 1));
	
	if(idx > notes.indexOf("F2")) {
		for(var y = noteY(notes.indexOf("F2")) + 10; y < noteY(idx) + 10; y += SPACE_WIDTH)
			g.appendChild(makeLine(NOTE_CENTER_X - 20, y, NOTE_CENTER_X + 20, y, "black", 1));
	}
	
	g.appendChild(makeImage(NOTE_CENTER_X - 17, noteY(idx) - 12, "note.svg"));
	return g;
}

var expool = [];
for(var i = notes.indexOf("C6"); i < notes.indexOf("C2"); ++i)
	expool.push({graphic: makeNote(i), id: notes[i], answer: notes[i].charAt(0)});
var exgen = new ExerciseGenerator(expool);

function makeExercise() {
	//var idx = randi(notes.indexOf("C6"), notes.indexOf("C2"));
	//var idx = randi(notes.indexOf("C4"), notes.indexOf("C5"));
	//return {graphic: makeNote(idx), name: notes[idx], answer: notes[idx].charAt(0)};
	return exgen.get();
}

function makecol(col) {
	return "rgb(" + col + ")";
}

function getStyle(el, styleProp) {
    if (el.currentStyle)
        return el.currentStyle[styleProp];
    return document.defaultView.getComputedStyle(el, null)[styleProp]; 
}

function blend(src, dst, k) {
	k = k < 0 ? 0 : (k > 1 ? 1 : k);
	
	return [Math.floor(src[0] + (dst[0] - src[0]) * k),
			Math.floor(src[1] + (dst[1] - src[1]) * k),
			Math.floor(src[2] + (dst[2] - src[2]) * k)];
}

function colorize(target, col) {
	var k = -0.5;
	target.style.backgroundColor = "";
	var initial = getStyle(target, "backgroundColor").match(/\d+/g).map(function(s) {
		return parseInt(s); // Can't use it directly because map would pass an index for the radix arg.
	});
	
	if(target.colorizeAnimation)
		clearInterval(target.colorizeAnimation);
	
	var id = setInterval(function() {
		k += 0.04;
		var kk = 1 - k;
		target.style.backgroundColor = makecol(blend(initial, col, kk));
		if(k >= 1) {
			clearInterval(id);
			delete target.colorizeAnimation;
		}
	}, 20);
	
	target.colorizeAnimation = id;
}

var globalStartTime = performance.now();
var exercise = makeExercise();
var totalCount = 0, correctCount = 0;
var exerciseStartTime = new Date().getTime();

setInterval(function() {
	var secs = Math.floor((performance.now() - globalStartTime) / 1000);
	var fmt = function(x) {
		x = Math.floor(x);
		return x < 10 ? "0" + x : "" + x;
	}
	
	document.getElementById("timer").textContent = fmt(secs / 60) + ":" + fmt(secs % 60);
}, 1000);

document.getElementById("staff").appendChild(exercise.graphic);

function handleAnswer(event) {
	var currTime = new Date().getTime();
	
	++totalCount;
	
	if(event.target.value === exercise.answer) {
		colorize(event.target, [160, 255, 160]);
		++correctCount;
	}else {
		colorize(event.target, [255, 160, 160]);
	}
	
	exgen.respond(event.target.value, (currTime - exerciseStartTime) / 1000);
	
	exercise.graphic.remove();
	exercise = makeExercise();
	exerciseStartTime = currTime;
	
	document.getElementById("stats").textContent = correctCount + "/" + totalCount + " (" + Math.floor(correctCount / totalCount * 100) + "%)";
	document.getElementById("staff").appendChild(exercise.graphic);
}