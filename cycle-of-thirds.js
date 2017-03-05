var thirds = ["A", "C", "E", "G", "B", "D", "F"];

function variation(n) {
	var seq = [];
  var rnd = n;
  for(var i = 0; i < thirds.length; ++i)
  	seq.push(thirds[(i + rnd) % thirds.length]);
  seq.push(seq[0]);
  return seq;
}

function exercise() {
	var rnd = Math.floor(Math.random() * thirds.length);
	var seq = ["*", "*", "*", "*", "*", "*", "*", "*"];
  var v = variation(rnd);
  var d1 = Math.floor(Math.random() * 3);
  var d2 = Math.floor(Math.random() * 2);
  var answer = true;
  
  seq[0] = v[0];
  seq[7] = v[7];
  
  if(Math.random() < 0.5) {
  	v = variation(rnd - 1);
    answer = false;
  }
  
  seq[d1 + 2] = v[d1 + 2];
  seq[6 - d2] = v[6 - d2];

  return {seq: seq.join(" "), answer: answer};
}

var tries = 0, correct = 0;
var ex = exercise();

document.getElementById("question").textContent = ex.seq;

document.body.addEventListener('keydown', function (e) {
	if(e.key === "p" || e.key === "q") {
    ++tries;
    
    if(e.key === "p" && ex.answer || e.key === "q" && !ex.answer)
      ++correct;


    ex = exercise();
    document.getElementById("question").textContent = ex.seq;
    document.getElementById("counter").textContent = correct + "/" + tries + " "
    + Math.floor(correct / tries * 100) + "%";
  }
});