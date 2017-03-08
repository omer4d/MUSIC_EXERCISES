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

// *****************************************************
// *****************************************************
// *****************************************************
// *****************************************************
// *****************************************************

function RandSeq(items, weights) {
  this.items = items;
  this.weights = normalize(weights);
  this.errors = [];
  for(var i = 0; i < weights.length; ++i)
    this.errors.push(0);
}

RandSeq.prototype.get = function() {
  this.errors = addv(this.errors, this.weights);
  var idx;
  var flag = this.errors.some(function(x) {
    return x >= 1;
  });
  
  if(flag) {
    idx = wrand(this.errors.map(function(x) {
      return x < 1 ? 0 : x;
    }));
  }else {
    idx = wrand(this.errors.map(function(x) {
      return Math.max(x, 0);
    }));
  }
  
  this.errors[idx] -= 1;
  return this.items[idx];
};

RandSeq.prototype.reset = function() {
  for(var i = 0; i < this.errors.length; ++i) {
    this.errors[i] = 0;
  }
};

function segment(arr, levels) {
  var min = arr.reduce(function(a, x) {
    return Math.min(a, x);
  }, 1);

  var max = arr.reduce(function(a, x) {
    return Math.max(a, x);
  }, 0);

  var out = [];
  for(var i = 0; i < levels; ++i)
    out.push([]);
  
  for(i = 0; i < arr.length; ++i) {
    var x = Math.floor((arr[i] - min) / ((max - min) || 1) * (levels - 1));
    out[x].push(i);
  }
  
  return out.filter(function(v) {
    return v.length > 0;
  });
}


function RandSeq2(items, weights) {
  var segs = segment(weights, 5);
  var segGens = [];
  
  for(var i = 0; i < segs.length; ++i) {
    var t = segs[i].map(function(idx) {
      return items[idx];
    });
    var w = segs[i].map(function(idx) {
      return weights[idx];
    });
    
    //console.log(w, t);
    
    segGens.push(new RandSeq(t, w));
  }
  
  var metaWeights = segs.map(function(v) {
    return sum(v.map(function(idx) {
      return weights[idx];
    }));
  });
  
  var metaItems = segs.map(function(_, idx) {
    return idx;
  });
  
  //console.log(metaItems);
  //console.log(metaWeights);
  
  this.metaGen = new RandSeq(metaItems, metaWeights);
  this.segGens = segGens;
  //console.log(segs);
}

RandSeq2.prototype.get = function() {
  return this.segGens[this.metaGen.get()].get();
};

RandSeq2.prototype.reset = function() {
  for(var i = 0; i < this.segGens.length; ++i) {
    this.segGens[i].reset();
  }
  this.metaGen.reset();
};

// *****************************************************
// *****************************************************
// *****************************************************
// *****************************************************
// *****************************************************


function measureAvgError(gen, items, weights, seqLen) {
  var counters = {};
  for(var i = 0; i < items.length; ++i)
    counters[items[i]] = 0;
  
  for(i = 0; i < seqLen; ++i) {
    ++counters[gen()];
  }
  
  console.log(counters);
  
  weights = normalize(weights);
  var errorSum = 0;
  
  for(i = 0; i < items.length; ++i) {
    errorSum += Math.abs((counters[items[i]] / seqLen - weights[i]) / weights[i]) * 100;
  }
  
  return errorSum / items.length;
}

function measureAvgErrorCoarse(gen, items, weights, seqLen) {
  gen.reset();
  
  var counters = {};
  var countersFine = {};
  var segs = segment(weights, 5);
  var metaWeights = segs.map(function(v) {
    return sum(v.map(function(idx) {
      return weights[idx];
    }));
  });
  var segItems = segs.map(function(v) {
    return v.map(function(idx) {
      return items[idx];
    });
  });
  
  for(var i = 0; i < segs.length; ++i)
    counters[i] = 0;
  for(var i = 0; i < items.length; ++i)
    countersFine[items[i]] = 0;
  
  for(i = 0; i < seqLen; ++i) {
    var x = gen.get();
    for(var j = 0; j < segItems.length; ++j)
      if(segItems[j].indexOf(x) >= 0){
        ++counters[j];
      }
    ++countersFine[x];
  }
  
  //console.log(segs);
  //console.log(segItems);
  //console.log(metaWeights);
  //console.log(counters);
  
  metaWeights = normalize(metaWeights);
  weights = normalize(weights);
  var errorSum = 0;
  
  for(i = 0; i < segs.length; ++i) {
    errorSum += Math.abs((counters[i] / seqLen - metaWeights[i]) / metaWeights[i]) * 100;
  }
  
  var errorSumFine = 0;
  
  for(i = 0; i < items.length; ++i) {
    errorSumFine += Math.abs((countersFine[items[i]] / seqLen - weights[i]) / weights[i]) * 100;
  }
  
  return [errorSum / segs.length, errorSumFine / items.length];
}


// *****************************************************
// *****************************************************
// *****************************************************
// *****************************************************
// *****************************************************

var items = ["A", "B", "C", "D", "E", "F", "G"];
var weights = [1, 2, 3, 1, 20, 60, 700];

var seq = new RandSeq(items, weights);
var seq2 = new RandSeq2(items, weights);


//for(var i = 0; i < 200; ++i)
//  console.log(seq2.get(), seq.get());


function metaTest(n, ...gens) {
  var errorAccums = [];
  var fineErrorAccums = [];
  
  for(var j = 0; j < gens.length; ++j) {
    errorAccums.push(0);
    fineErrorAccums.push(0);
  }
  
  var N = 100000;
  
  for(var i = 0; i < N; ++i) {
	if(i % 100 === 0)
		console.log(i);
	  
    for(var j = 0; j < gens.length; ++j) {
      var res = measureAvgErrorCoarse(gens[j], items, weights, n);
      errorAccums[j] += res[0];
      fineErrorAccums[j] += res[1];
    }
  }
  
  for(j = 0; j < gens.length; ++j) {
    errorAccums[j] /= N;
    fineErrorAccums[j] /= N;
  }
  
  return {coarseErrors: errorAccums, fineErrors: fineErrorAccums};
  
  //console.log(test(arr2, gen0, 100));
  //console.log("-------------------------");
  //console.log(test(arr2, gen1, 100));
  //console.log("-------------------------");
  //console.log(test(arr2, gen2, 100));
}

var res = metaTest(100, seq, seq2, {
  get: function() {
    return items[wrand(weights)];
  },
  reset: function() {},
});

console.log(JSON.stringify(res, null, 3));


/*
console.log(measureAvgErrorCoarse(seq, items, weights, 50));
console.log(measureAvgErrorCoarse(seq2, items, weights, 50));
console.log(measureAvgErrorCoarse({
  get: function() {
    return items[wrand(weights)];
  },
  reset: function() {},
}, items, weights, 50));*/



//for(var i = 0; i < 20; ++i)
//  console.log(seq.get());

/*
var arr = [];
var N = 10;

for(var i = 0; i < N; ++i) {
  arr[i] = Math.max(nrand(5, 5), 0.5);
}

arr = normalize(arr);
console.log(arr);
console.log(segment(arr, 5));*/