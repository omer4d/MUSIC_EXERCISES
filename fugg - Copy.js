function adjust(a, b, ratio) {
  return (ratio * b - a) / (ratio + 1);
}

function adjustTransitions(ts, ps, psum, crs, i, j) {
  var tmp = ts[i] * ps[i] + ts[j] * ps[j];
  var d = adjust(ts[i], ts[j], crs[i] / crs[j]);
  ts[i] += d;
  ts[j] -= d;
  var diff = ts[i] * ps[i] + ts[j] * ps[j] - tmp;
  var k = diff / (psum - ps[i] - ps[j]);
  
  for(var idx = 0; idx < ts.length; ++idx)
    ts[idx] -= k;
    
  ts[i] += k;
  ts[j] += k;
}

function adjustTransitions2(ts, ps, psum, crs, i, j) {
  var tmp = ts[i] * ps[i] + ts[j] * ps[j];
  var d = adjust(ts[i], ts[j], crs[i] / crs[j]);
  ts[i] += d;
  ts[j] -= d;
  var diff = ts[i] * ps[i] + ts[j] * ps[j] - tmp;
  
  
  
  psum = 0;
  for(var idx = 0; idx < ts.length; ++idx) {
    if(idx !== i && idx !== j)
      psum += ts[idx] * ps[idx];
  }
  
  var k = diff / psum;
  
  for(var idx = 0; idx < ts.length; ++idx)
    if(idx !== i && idx !== j)
      ts[idx] -= ts[idx] * k;
    
  //ts[i] += k;
  //ts[j] += k;
}

function adjustTransitions3(ts, ps, psum, crs, i, j) {
  var tmp = ts[i] * ps[i] + ts[j] * ps[j];
  var d = adjust(ts[i], ts[j], crs[i] / crs[j]);
  ts[i] += d;
  ts[j] -= d;
  var diff = ts[i] * ps[i] + ts[j] * ps[j] - tmp;
  
  
  
  psum = 0;
  for(var idx = 0; idx < ts.length; ++idx) {
    if(idx !== i && idx !== j)
      psum += ts[idx] * ps[idx];
  }
  
  var k = diff / psum;
  
  for(var idx = 0; idx < ts.length; ++idx)
    if(idx !== i && idx !== j)
      ts[idx] -= ts[idx] * k;
    
  //ts[i] += k;
  //ts[j] += k;
}


function totalChance(ts, ps) {
  var t = 0;
  for(var i = 0; i < ts.length; ++i)
    t += ts[i] * ps[i];
  return t;
}


function test(adjfun) {
  var N = 35;
  var P = [];
  var CR = [];
  var T3 = [];
  
  for(var i = 0; i < N; ++i) {
    P.push(Math.random());
    CR.push(Math.random());
    T3.push(0);
  }
  
  var sum = P.reduce(function(accum, x) {
    return accum + x;
  }, 0);
  
  for(var i = 0; i < N; ++i) {
    T3[i] = P[3] / sum;
  }
  
  for(var n = 0; n < 5; ++n) {
    for(var i = 0; i < N; ++i) {
      for(var j = i + 1; j < N; ++j) {
        adjfun(T3, P, sum, CR, i, j);
      }
    }
  }
  
  var maxError = 0;
  
  for(var i = 0; i < N; ++i) {
    for(var j = i + 1; j < N; ++j) {
      var real = T3[i] / T3[j];
      var expected =  CR[i] / CR[j];
      
      var err = (real - expected) / expected * 100;
      if(Math.abs(err) > maxError)
        maxError = Math.abs(err);
      
      //totalError += Math.abs(err);
      //console.log(Math.abs(err) > 0.01 ? err : 0);
    }
  }
  
  return {maxError: maxError, chanceDiff: (totalChance(T3, P) - P[3])};
}



var N = 10000;
var avgMaxError = 0;
var maxMaxError = 0;

for(var i = 0; i < N; ++i) {
  var res = test(adjustTransitions2);
  
  if(Math.abs(res.chanceDiff) > 0.0001) {
    console.log("FUCK!" + res.chanceDiff);
    break;
  }
  
  if(res.maxError > 100)
    console.log(res.maxError);
  
  avgMaxError += res.maxError;
  if(res.maxError > maxMaxError)
    maxMaxError = res.maxError;
}

avgMaxError /= N;
console.log(N, avgMaxError, maxMaxError);


/*
for(var i = 0; i < N; ++i) {
  for(var j = 0; j < N; ++j) {
    var tmp = T3[0] * P[0] + T3[1] * P[1];
    var d = adjust(T3[0], T3[1], CR[0] / CR[1]);
    T3[0] += d;
    T3[1] -= d;
    
    var diff = T3[0] * P[0] + T3[1] * P[1] - tmp;
    var k = diff / (sum - P[0] - P[1]);
    
    for(var i = 2; i < N; ++i)
      T3[i] -= k;
  }
}*/





//console.log(diff);

/*
console.log(T3[0]/T3[1], CR[0]/CR[1]);
console.log();

var diff = T3[0] * P[0] + T3[1] * P[1] - tmp;


for(var i = 2; i < N; ++i)
  T3[i] -= P[i] * (diff / (sum - P[0] - P[1]));

var z = 0;
for(var i = 0; i < N; ++i)
  z += T3[i] * P[i];
console.log(z, P[3]);

console.log(T3);*/




//T3[0]


/*
for(var n = 0; n < 10; ++n) {
  
  for(var i = 0; i < N; ++i) {
    for(var j = i + 1; j < N; ++j) {
    }
  }
  
  
}

for(var i = 0; i < N; ++i) {
  for(var j = i + 1; j < N; ++j) {
    //var err = ys[i]/ys[j] - xs[i]/xs[j];
    //console.log(Math.abs(err) > 0.01 ? err : 0);
  }
}*/