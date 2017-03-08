function rand(min, max) {
  min = min || -1;
  max = max || 1;
  return min + Math.random() * (max - min);
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
var N = 10;

for(var i = 0; i < N; ++i) {
  arr[i] = nrand(5, 2);
  err[i] = 0;
}
  
arr2 = scale(normalize(arr), 3);

for(var n = 0; n < 100; ++n) {
  var esum = sum(err);
  arr3 = arr2.map(function(x) {
    return Math.floor(x + esum / N);
  });
  err = subv(arr2, arr3);
}

console.log(arr2);
console.log(arr3);
console.log(err);
console.log(sum(err));
console.log(sum(arr3));