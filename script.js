(function(){
  /* theme */
  var root=document.documentElement;
  document.getElementById('theme').addEventListener('click',function(){
    var dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
    root.dataset.theme=dark?'light':'dark';
  });

  /* forest canvas */
  var cv=document.getElementById('forest'),cx=cv.getContext('2d'),W=0,H=0,dpr=1,trees=[];
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var nEl=document.getElementById('n');
  function size(){dpr=window.devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);}
  function css(v){return getComputedStyle(root).getPropertyValue(v).trim();}
  function horizon(){return H*0.42;}
  function plant(x,y,instant){
    var hz=horizon();
    y=Math.max(hz+12,Math.min(H-8,y));
    var depth=(y-hz)/(H-hz);
    trees.push({x:x,y:y,h:(46+Math.random()*34)*(0.55+depth*0.75),g:instant||reduce?1:0,s:Math.random()*6,t:Math.random()});
    nEl.textContent=trees.length;
  }
  function drawTree(t,time){
    var h=t.h*t.g,w=h*0.55,sway=reduce?0:Math.sin(time/900+t.s)*h*0.018;
    cx.fillStyle=css('--bark');cx.fillRect(t.x-h*0.035,t.y-h*0.2,h*0.07,h*0.2);
    var cols=[css('--leaf'),css('--fern'),css('--fern')];
    for(var i=0;i<3;i++){
      var base=t.y-h*0.14-i*h*0.25,top=base-h*0.45,hw=w*(1-i*0.22)/2,off=sway*(i+1)*0.6;
      cx.fillStyle=cols[i];cx.beginPath();cx.moveTo(t.x-hw,base);cx.lineTo(t.x+off,top);cx.lineTo(t.x+hw,base);cx.closePath();cx.fill();
    }
  }
  function frame(time){
    var hz=horizon();
    cx.clearRect(0,0,W,H);
    cx.fillStyle=css('--sky');cx.fillRect(0,0,W,hz);
    cx.fillStyle=css('--amber');cx.globalAlpha=.85;cx.beginPath();cx.arc(W*0.84,hz*0.5,Math.min(26,hz*0.22),0,7);cx.fill();cx.globalAlpha=1;
    cx.fillStyle=css('--ground');cx.fillRect(0,hz,W,H-hz);
    cx.strokeStyle=css('--line');cx.beginPath();cx.moveTo(0,hz);cx.lineTo(W,hz);cx.stroke();
    trees.sort(function(a,b){return a.y-b.y;});
    for(var i=0;i<trees.length;i++){var t=trees[i];if(t.g<1)t.g=Math.min(1,t.g+0.025);drawTree(t,time);}
    if(!trees.length){cx.fillStyle=css('--muted');cx.font='600 16px "Bricolage Grotesque",sans-serif';cx.textAlign='center';cx.fillText('The ground is bare. Plant the first tree.',W/2,hz+(H-hz)/2);}
    requestAnimationFrame(frame);
  }
  function seed(k){for(var i=0;i<k;i++)plant(20+Math.random()*(W-40),horizon()+Math.random()*(H-horizon()),false);}
  cv.addEventListener('pointerdown',function(e){var r=cv.getBoundingClientRect();plant(e.clientX-r.left,e.clientY-r.top,false);});
  document.getElementById('fill').addEventListener('click',function(){seed(10);});
  document.getElementById('clear').addEventListener('click',function(){trees=[];nEl.textContent=0;});
  window.addEventListener('resize',size);
  size();seed(6);requestAnimationFrame(frame);

  /* offset estimate */
  var co2=document.getElementById('co2'),co2v=document.getElementById('co2v'),treesEl=document.getElementById('trees');
  function calc(){var t=parseFloat(co2.value);co2v.textContent=t.toFixed(1);treesEl.textContent=Math.round(t*1000/22).toLocaleString('en-US');}
  co2.addEventListener('input',calc);calc();
  document.getElementById('plantcalc').addEventListener('click',function(){
    var k=Math.min(60,Math.round(parseFloat(co2.value)*1000/22/4));seed(k);
    document.getElementById('top').scrollIntoView();
  });

  /* pledges */
  var items=[
    ['Choose recycled or FSC-certified paper','The FSC label means the wood came from a forest managed to protect wildlife and local people.'],
    ['Cut back on palm oil and soy from unknown sources','Check labels for certified sources. Clearing land for these crops drives much of tropical deforestation.'],
    ['Plant a native tree where you live','Native species support local insects and birds. Ask a nursery or local forest office which ones suit your soil.'],
    ['Report illegal logging and forest fires','Call your local forest department or emergency line when you see smoke or illegal cutting.'],
    ['Tell three people about this page','Protection works when whole communities care about the same trees.']
  ];
  var key='stf-pledges',saved=[];
  try{saved=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){saved=[];}
  var ul=document.getElementById('todo'),bar=document.getElementById('bar'),lab=document.getElementById('barlabel');
  items.forEach(function(it,i){
    var li=document.createElement('li');
    li.innerHTML='<label><input type="checkbox"'+(saved.indexOf(i)>-1?' checked':'')+'><div><strong>'+it[0]+'</strong><span>'+it[1]+'</span></div></label>';
    li.querySelector('input').addEventListener('change',update);
    ul.appendChild(li);
  });
  function update(){
    var boxes=ul.querySelectorAll('input'),done=[];
    boxes.forEach(function(b,i){if(b.checked)done.push(i);});
    try{localStorage.setItem(key,JSON.stringify(done));}catch(e){}
    bar.style.width=(done.length/items.length*100)+'%';
    lab.textContent=done.length+' of '+items.length+' done'+(done.length===items.length?'. Thank you for standing up for forests.':'');
  }
  update();
})();