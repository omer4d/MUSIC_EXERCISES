function rand(min, max) {
  min = min || -1;
  max = max || 1;
  return min + Math.random() * (max - min);
}

function nrand(mean, stdev) {
  return mean + (rand() + rand() + rand()) * stdev;
}

function wrand(weights, items) {
  var sum = weights.reduce(function(accum, x) {
    return accum + x;
  }, 0);
  
  var i, r = Math.random() * sum;
  for(i = 0; i < weights.length && r >= 0; r -= weights[i], ++i);
  return items[i - 1];
}

function clamp(x, min, max) {
  return x < min ? min : (x > max ? max : x);
}

function dupdate(obj, keys, f) {
  var curr = obj;
  for(var i = 0; i < keys.length - 1; ++i) {
    if(!(keys[i] in curr)) {
      curr[keys[i]] = {};
    }
    curr = curr[keys[i]];
  }
  curr[keys[keys.length - 1]] = f(curr[keys[keys.length - 1]]);
  return obj;
}

function dget(obj, keys, def) {
  for(var i = 0; i < keys.length; ++i) {
    if(keys[i] in obj)
      obj = obj[keys[i]];
    else
      return def;
  }
  return obj;
}

function dset(obj, keys, val) {
  return dupdate(obj, keys, function(x) {
    return val;
  });
}

function dinc(obj, keys, x) {
  return dupdate(obj, keys, function(y) {
    return y ? (x + y) : x;
  });
}


var patt = ["C", "D", "E", "F", "G", "A", "B"];
var notes = [];

for(var i = 0; i < 6; ++i) {
  for(var j = 0; j < patt.length; ++j) {
    notes.push(patt[j] + (i + 1));
  }
}

notes = notes.slice(4, 39).reverse();



function genTransitionWeights(notes, stats) {
  var t = [];
  
  for(var i = 0; i < notes.length; ++i) {
    t.push([]);
    for(var j = 0; j < notes.length; ++j) {
      var noteName = notes[j];
      var total = dget(stats, [noteName, "total"], 0);
      var right = dget(stats, [noteName, "right"], 0);
      t[i].push(1);
    }
  }
  
  return t;
}

var noteStats = {};

notes.forEach(function(note) {
  dset(noteStats, [note, "time"], nrand(2.5, 0.6)*1000*20);
  dset(noteStats, [note, "total"], 20);
  dset(noteStats, [note, "right"], clamp(Math.ceil(nrand(15, 5)), 0, 20));
});

Object.keys(noteStats).forEach(function(key) {
	var total = noteStats[key].total;
	
	if(total) {
		console.log(key + " " + (dget(noteStats, [key, "right"], 0) / total) + ", "
							+ (dget(noteStats, [key, "time"], 0) / 1000 /  total));
	}
});

function makeExercise(lastExerciseName) {
	//var idx = randi(notes.indexOf("C6"), notes.indexOf("C2"));
	//var idx = randi(notes.indexOf("C4"), notes.indexOf("C5"));
	var t = genTransitionWeights(notes, noteStats);
	//t[notes.indexOf(lastExerciseName)]
	var note = wrand(t[notes.indexOf(lastExerciseName)], notes);
	return {name: note, answer: note.charAt(0)};
}

var lastExerciseName = "C4";
var counters = {};
for(var i = 0; i < 500; ++i) {
  var exn = makeExercise(lastExerciseName).name;
  lastExerciseName = exn;
  dinc(counters, [exn], 1);
}




function normalize(v) {
  var sum = v.reduce(function(s, x) {
    return s + x;
  }, 0);
  return v.map(function(x) {
    return x / sum;
  });
}

var w1 = [], w2 = [];
for(var i = 0; i < notes.length; ++i) {
  var name = notes[i];
  
  var total = dget(noteStats, [name, "total"], 0);
  var right = dget(noteStats, [name, "right"], 0);
  
  w1.push(counters[name]);
  w2.push(1);//right / total);
}

w1 = normalize(w1);
w2 = normalize(w2);

for(var i = 0; i < w1.length; ++i) {
  console.log((w2[i] - w1[i]) / w2[i] * 100);
}

counters;


/*
Object.keys(counters).forEach(function(key) {
    var total = dget(noteStats, [key, "total"], 0);
    var right = dget(noteStats, [key, "right"], 0);
    console.log((counters[key] * notes.length) / 10000);
});*/

