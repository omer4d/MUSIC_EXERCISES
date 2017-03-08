function shuffle(arr) {
  var n = arr.length;
  
  while(n > 0) {
    var i = Math.floor(Math.random() * n);
    var t = arr[i];
    --n;
    arr[i] = arr[n];
    arr[n] = t;
  }
  
  return arr;
}

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

function clamp(x, min, max) {
  min = min || 0;
  max = max || 1;
  return x < min ? min : (x > max ? max : x);
}

function pickRandom(arr, excluded) {
  var x;
  for(var i = 0; i < 100; ++i) {
    x = arr[Math.floor(Math.random() * arr.length)];
    if(x !== excluded)
      return x;
  }
  return x;
}

function mix(a, b) {
  var res = [];
  
  var bIdx = 0;
  shuffle(b);
  
  for(var k = 0; k < 3; ++k) {
    var oldLast = a[a.length - 1];
    shuffle(a);
    if(a[0] == oldLast) {
      var si = Math.floor(Math.random() * a.length);
      var tmp = a[si];
      a[si] = a[0];
      a[0] = tmp;
    }
    
    for(var i = 0; i < a.length; ++i) {
      res.push(a[i]);
      
      var n = Math.random() < 0.5 ? 1 : 2;
      for(var j = 0; j < n; ++j) {
        res.push(b[(bIdx++) % b.length]);
      }
    }
  }
  
  return res;
}

function ExerciseGenerator(pool) {
  this.pool = pool.slice();
  this.items = this.pool;
  this.responses = [];
  this.count = 0;
  shuffle(this.pool);
}

function proficiency(correct, responseTime, avgResponseTime) {
  return (correct ? 90 : 30) * (avgResponseTime / responseTime);
}

ExerciseGenerator.prototype.findById = function(id) {
  for(var i = 0; i < this.pool.length; ++i)
    if(this.pool[i].id === id)
      return this.pool[i];
}

ExerciseGenerator.prototype.get = function() {
  if(this.count === this.items.length) {
	  console.log(JSON.stringify(this.responses, null, 3));
	  
    if(this.items == this.pool) {
	  console.log("Finished test batch! (" + this.count + " items)");
		
      var avgTime = this.responses.reduce(function(t, res) {
        return t + res.time;
      }, 0) / this.responses.length;
      
      var avgProficiency = this.responses.reduce(function(accum, res) {
        return accum + proficiency(res.correct, res.time, avgTime);
      }, 0) / this.responses.length;
      
      this.responses.sort(function(a, b) {
        return proficiency(b.correct, b.time, avgTime) - proficiency(a.correct, a.time, avgTime);
      });
	  
	  console.log("Avg. time:" + avgTime);
	  console.log("Avg. proficiency: " + avgProficiency);
	  
      var challengeSet = [];
      var fillerSet = [];
      
      for(var i = this.responses.length - 1; i >= 0; --i) {
        var res = this.responses[i];
        
        if(challengeSet.length < 3 &&
          (proficiency(res.correct, res.time, avgTime) - avgProficiency) / avgProficiency < -0.25)
          challengeSet.push(this.findById(res.id));
        else
          fillerSet.push(this.findById(res.id));
      }
	  
	  console.log("Challenge set: " + JSON.stringify(challengeSet.map(function(item) { return item.id; }), null, 3));
      
      if(challengeSet.length > 0) {
        //var desiredFillerNum = Math.max(10, this.pool.length - challengeSet.length * 3);
        //fillerSet.slice(Math.max(fillerSet.length - desiredFillerNum, 0));
        
        //console.log("Challenge: " + challengeSet);
        //console.log("Filler: " + fillerSet);
        this.items = mix(challengeSet, fillerSet);
        //console.log("mix:" + this.items);
      }
      else {
		  console.log("Not enough challenging items.");
        shuffle(this.items);
      }
      
      /*
      console.log(challengeSet);
      console.log(fillerSet);
      
      //console.log("avgProficiency = " + avgProficiency);
      
      var tmp = this.responses.map(function(res) {
        return proficiency(res.correct, res.time, avgTime);
      });
      
      console.log(tmp);*/
    }
    else {
	  console.log("Finished challenge batch! (" + this.count + " items)");
      shuffle(this.pool);
      this.items = this.pool;
    }
    
    this.responses.length = 0;
    this.count = 0;
  }
  
  return this.items[this.count++];
};

ExerciseGenerator.prototype.respond = function(answer, time) {
  this.responses.push({
    time: time,
    correct: answer === this.items[this.count - 1].answer,
    id: this.items[this.count - 1].id
  });
};