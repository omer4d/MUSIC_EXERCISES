function rand(min, max) {
  min = min || -1;
  max = max || 1;
  return min + Math.random() * (max - min);
}

function wrand(weights) {
  var sum = weights.reduce(function(accum, x) {
    return accum + x;
  }, 0);
  
  var i, r = Math.random() * sum;
  for(i = 0; i < weights.length && r >= 0; r -= weights[i], ++i);
  return i - 1;
}

function nrand(mean, stdev) {
  return mean + (rand() + rand() + rand()) * stdev;
}

function plus(a, b) {
  return a + b;
}

function minus(a, b) {
  return a - b;
}

function sum(v) {
  return v.reduce(plus, 0);
}

function scale(v, k) {
  return v.map(function(x) {
    return x * k;
  });
}

function normalize(v) {
  return scale(v, 1 / sum(v));
}

function addv(v1, v2) {
  var n = Math.min(v1.length, v2.length);
  var res = [];
  for(var i = 0; i < n; ++i)
    res.push(v1[i] + v2[i]);
  return res;
}

function subv(v1, v2) {
  var n = Math.min(v1.length, v2.length);
  var res = [];
  for(var i = 0; i < n; ++i)
    res.push(v1[i] - v2[i]);
  return res;
}


var arr = [];
var err = [];
var N = 5;

for(var i = 0; i < N; ++i) {
  arr[i] = Math.max(nrand(5, 1), 0.1);
  err[i] = 0;
}

//console.log(arr);

arr2 = normalize(arr);

function gen0() {
  return wrand(arr2);
}

function gen1() {
  err = addv(err, arr2);
  var idx = wrand(err.map(function(x) {
    return Math.max(x, 0);
  }));
  err[idx] -= 1;
  return idx;
}

function gen2() {
  err = addv(err, arr2);
  var idx;
  var flag = err.some(function(x) {
    return x >= 1;
  });
  
  if(flag) {
    idx = wrand(err.map(function(x) {
      return x < 1 ? 0 : x;
    }));
  }else {
    idx = wrand(err.map(function(x) {
      return Math.max(x, 0);
    }));
    
    /*
    idx = 0;
    var max = err[0];
    for(var i = 1; i < err.length; ++i) {
      if(err[i] > max) {
        idx = i;
        max = err[i];
      }
    }*/
    
    
  }
  
  err[idx] -= 1;
  
  return idx;
}

function gen3() {
  err = addv(err, arr2);
  var idx = 0;
  var max = err[0];
  for(var i = 1; i < err.length; ++i) {
    if(err[i] > max) {
      idx = i;
      max = err[i];
    }
  }
    
  err[idx] -= 1;
  return idx;
}

function test(target, f, n) {
  var seq = [];
  var counters = [];
  
  for(var i = 0; i < target.length; ++i) {
    counters[i] = 0;
  }
  
  for(i = 0; i < n; ++i) {
    var item = f();
    seq.push(item);
    ++counters[item];
  }
  
  var res = normalize(counters);
  var avgError = 0;
  var tmp = [];
  
  for(i = 0; i < res.length; ++i) {
    var e = Math.abs((target[i] - res[i]) / target[i] * 100);
    if(true) {//target[i] * n > 1) {
      tmp.push(e);
      avgError += e;
    }
  }
  
  //console.log(seq);
  //console.log(tmp);
  avgError /= res.length;
  return avgError;
}

function metaTest(n, ...gens) {
  var errorAccums = [];
  for(var j = 0; j < gens.length; ++j)
    errorAccums.push(0);
  
  for(var i = 0; i < 100000; ++i) {
	if(i % 100 === 0)
		console.log(i);
	  
    for(var j = 0; j < gens.length; ++j) {
      errorAccums[j] += test(arr2, gens[j], n);
    }
  }
  
  for(j = 0; j < gens.length; ++j)
    errorAccums[j] /= 100000;
  
  return errorAccums;
  
  //console.log(test(arr2, gen0, 100));
  //console.log("-------------------------");
  //console.log(test(arr2, gen1, 100));
  //console.log("-------------------------");
  //console.log(test(arr2, gen2, 100));
}


console.log(metaTest(50, gen0, gen1, gen2));


//console.log("-------------------------");
//console.log(test(arr2, gen0, 100));
//console.log("-------------------------");
//console.log(test(arr2, gen1, 100));
//console.log("-------------------------");
//console.log(test(arr2, gen2, 100));
//console.log("-------------------------");
//console.log(test(arr2, gen3, 300));