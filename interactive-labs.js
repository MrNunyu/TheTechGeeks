"use strict";
/* Interactive labs v9: educational demonstrations; no assessment text is modified. */
(()=>{
  const grid = document.getElementById('pixel-board');
  if (grid) {
    const palette = document.getElementById('pixel-palette');
    const sizeSelector = document.getElementById('pixel-size');
    const totals = [document.getElementById('pixel-total'), document.getElementById('pixel-bytes'), document.getElementById('pixel-bits')];
    const status = document.getElementById('pixel-status');
    const preview = document.getElementById('pixel-preview');
    const previewCtx = preview.getContext('2d');
    const colours = ['#ffffff','#091225','#42f5e9','#fc7bd9','#f9e66e','#6fb9ff','#38bc6c','#ba69fc','#f56b6b','#fa9f47','#899abd','#404c76'];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let selected = colours[1], size = 16, tool = 'pencil';
    let painted = [], cells = [], undoStack = [], redoStack = [];
    let strokeActive = false, strokeChanged = false, previewFrame = 0;
    const tools = {
      pencil: document.getElementById('pixel-pencil'),
      fill: document.getElementById('pixel-fill'),
      eraser: document.getElementById('pixel-eraser')
    };
    const undo = document.getElementById('pixel-undo');
    const redo = document.getElementById('pixel-redo');
    const historyLimit = 40;
    const label = document.getElementById('studio-zoom-label');

    function updateHistoryButtons() {
      undo.disabled = undoStack.length === 0;
      redo.disabled = redoStack.length === 0;
    }
    function snapshot() {
      undoStack.push(painted.slice());
      if (undoStack.length > historyLimit) undoStack.shift();
      redoStack.length = 0;
      updateHistoryButtons();
    }
    function renderPreview() {
      previewFrame = 0;
      if (!previewCtx) return;
      previewCtx.imageSmoothingEnabled = false;
      previewCtx.clearRect(0, 0, 96, 96);
      const tile = 96 / size;
      painted.forEach((color,i) => {
        previewCtx.fillStyle = color;
        previewCtx.fillRect((i % size) * tile, Math.floor(i / size) * tile, tile, tile);
      });
    }
    function queuePreview() {
      if (!previewFrame) previewFrame = requestAnimationFrame(renderPreview);
    }
    function updatePixel(index,color,animated=true) {
      if (index < 0 || index >= painted.length || painted[index] === color) return false;
      painted[index] = color;
      const cell = cells[index];
      cell.style.backgroundColor = color;
      cell.setAttribute('aria-label', `Pixel ${index+1}, colour ${color}`);
      if (animated && !reduced && cell.animate) {
        cell.animate([
          {transform: 'scale(.74)',filter: 'brightness(1.6)'},
          {transform: 'scale(1)',filter: 'brightness(1)'}
        ], {duration:180, easing:'cubic-bezier(.16,1,.3,1)'});
      }
      queuePreview();
      return true;
    }
    function paint(index) {
      const changed = updatePixel(index, tool === 'eraser' ? '#ffffff' : selected);
      if (changed) { strokeChanged = true; status.textContent = ''; }
    }
    function floodFill(index) {
      const previous = painted[index], next = tool === 'eraser' ? '#ffffff' : selected;
      if (!previous || previous === next) return false;
      const seen = new Set([index]);
      const queue = [index];
      for (let p=0; p<queue.length; p++) {
        const i = queue[p], col = i % size, row = Math.floor(i / size);
        for (const ni of [col>0?i-1:-1, col<size-1?i+1:-1, row>0?i-size:-1, row<size-1?i+size:-1]) {
          if (ni>=0 && !seen.has(ni) && painted[ni]===previous) {seen.add(ni);queue.push(ni);}
        }
      }
      snapshot();
      for (const i of queue) updatePixel(i,next,false);
      if (!reduced) grid.classList.remove('studio-pulse');
      if (!reduced) { void grid.offsetWidth; grid.classList.add('studio-pulse'); }
      status.textContent = `Filled ${queue.length} pixels.`;
      return true;
    }
    function selectTool(t) {
      tool = t;
      Object.entries(tools).forEach(([key,button]) => {
        button.classList.toggle('active',key === t);
        button.setAttribute('aria-pressed',String(key === t));
      });
      grid.dataset.tool=t;
      status.textContent = `${t.toUpperCase()} tool ready.`;
    }
    function chooseColour(color) {
      selected=color;
      for (const swatch of palette.children) swatch.setAttribute('aria-pressed',String(swatch.dataset.colour===color));
      selectTool('pencil');
    }
    for (const color of colours) {
      const button = document.createElement('button');
      button.type='button'; button.className='pixel-swatch';button.dataset.colour=color;
      button.style.backgroundColor=color;
      button.setAttribute('aria-label',`Use colour ${color}`);
      button.addEventListener('click',()=>chooseColour(color));
      palette.appendChild(button);
    }
    chooseColour(selected);
    Object.entries(tools).forEach(([key,button]) => button.addEventListener('click',()=>selectTool(key)));

    function restore(snapshotData) {
      painted = snapshotData.slice();
      painted.forEach((color,i) => {cells[i].style.backgroundColor=color;cells[i].setAttribute('aria-label',`Pixel ${i+1}, colour ${color}`);});
      queuePreview();
    }
    undo.addEventListener('click',()=>{
      if (!undoStack.length)return;
      redoStack.push(painted.slice()); restore(undoStack.pop());updateHistoryButtons();status.textContent='Last change undone.';
    });
    redo.addEventListener('click',()=>{
      if (!redoStack.length)return;
      undoStack.push(painted.slice());restore(redoStack.pop());updateHistoryButtons();status.textContent='Change restored.';
    });
    function drawBoard() {
      painted=Array(size*size).fill('#ffffff');cells=[];undoStack=[];redoStack=[];
      grid.replaceChildren();grid.style.setProperty('--grid-size',String(size));
      const frag=document.createDocumentFragment();
      for(let i=0;i<painted.length;i++){
        const cell=document.createElement('button');cell.type='button';cell.className='pixel-cell';
        cell.dataset.pixel=String(i);cell.style.backgroundColor='#ffffff';
        cell.setAttribute('aria-label',`Pixel ${i+1}, colour #ffffff`);
        // Click handles keyboard, and pointerup-click would duplicate a stroke, so ignore click after pointer presses.
        cell.addEventListener('click', e=>{
          if (e.detail !== 0)return;
          if(tool==='fill') {floodFill(i);return;}
          const newColor=tool==='eraser'?'#ffffff':selected;
          if(painted[i]!==newColor){snapshot();paint(i);}
        });
        frag.appendChild(cell);cells.push(cell);
      }
      grid.appendChild(frag);
      totals[0].textContent=(size*size).toLocaleString();
      totals[1].textContent=(size*size*3).toLocaleString();
      totals[2].textContent=(size*size*24).toLocaleString();
      label.textContent=`${size} × ${size} / LIVE`;
      updateHistoryButtons();queuePreview();status.textContent=`Ready: ${size} × ${size} canvas.`;
    }
    grid.addEventListener('pointerdown',e=>{
      if (e.button !== 0 && e.pointerType==='mouse')return;
      const cell=e.target.closest('.pixel-cell');if(!cell)return;
      const i=Number(cell.dataset.pixel);
      if(tool==='fill') {floodFill(i);e.preventDefault();return;}
      if(painted[i]===(tool==='eraser'?'#ffffff':selected)) return;
      snapshot();strokeChanged=false;strokeActive=true;
      try{grid.setPointerCapture(e.pointerId);}catch{} // Not available on every browser.
      paint(i);e.preventDefault();
    });
    grid.addEventListener('pointermove',e=>{
      if(!strokeActive)return;
      const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.pixel-cell');
      if(el && grid.contains(el)) paint(Number(el.dataset.pixel));
    });
    const finishStroke=()=>{strokeActive=false;};
    grid.addEventListener('pointerup',finishStroke);
    grid.addEventListener('pointercancel',finishStroke);
    window.addEventListener('pointerup',finishStroke);
    sizeSelector.addEventListener('change',()=>{size=Number(sizeSelector.value);drawBoard();});
    document.getElementById('pixel-clear').addEventListener('click',()=>{
      if(painted.some(c=>c!=='#ffffff')){snapshot();restore(Array(size*size).fill('#ffffff'));}
      status.textContent='Canvas cleared.';
    });
    document.getElementById('pixel-sample').addEventListener('click',()=>{
      snapshot();
      const sample=Array(size*size).fill('#122143');
      const mid=(size-1)/2;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const d=Math.hypot(x-mid,y-mid);
        if(d<size*.43)sample[y*size+x]='#f9e66e';
        if(d<size*.43 && Math.abs(x-mid)>size*.14 && Math.abs(x-mid)<size*.27 && Math.abs(y-mid+size*.10)<size*.09) sample[y*size+x]='#14244c';
        if(d<size*.34 && Math.abs(y-mid-size*.15)<size*.055 && Math.abs(x-mid)<size*.19)sample[y*size+x]='#14244c';
      }
      restore(sample);status.textContent='Sample loaded! Try editing it, then export your art.';
      if(!reduced)grid.animate([{opacity:.6,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}],{duration:330,easing:'ease-out'});
    });
    document.getElementById('pixel-download').addEventListener('click',()=>{
      const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
      const ctx=canvas.getContext('2d');
      if(!ctx){status.textContent='PNG export is unavailable.';return;}
      painted.forEach((color,i)=>{ctx.fillStyle=color;ctx.fillRect(i%size,Math.floor(i/size),1,1);});
      const link=document.createElement('a');link.download=`thetechgeeks-pixel-art-${size}x${size}.png`;
      link.href=canvas.toDataURL('image/png');link.click();
      status.textContent='PNG saved at its original pixel dimensions.';
    });
    drawBoard();
  }

  const network = document.getElementById('network-canvas');
  if (network) {
    const nodes=[...network.querySelectorAll('.network-node')];
    const byDevice=Object.fromEntries(nodes.map(node=>[node.dataset.device,node]));
    const packet=document.getElementById('net-packet');
    const halo=document.getElementById('net-packet-halo');
    const activeRoute=document.getElementById('net-route-active');
    const title=document.getElementById('network-device-name');
    const description=document.getElementById('network-device-description');
    const status=document.getElementById('network-status');
    const routeText=document.getElementById('network-route');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const knowledge={
      computer:['Computer','A computer sends and receives data. On this network, it reaches the router through the switch.'],
      switch:['Switch','A switch links devices on the same local network and sends Ethernet frames toward the appropriate connected device.'],
      router:['Router','A router directs data between networks. This router also provides the Wi-Fi connection shown for the phone.'],
      modem:['Modem','A modem connects the home network to its internet service connection by converting or adapting signals for the connection technology.'],
      server:['Server','A server provides resources such as websites and stored files. This example server is reached through the internet connection.'],
      printer:['Printer','A network printer can accept jobs from connected devices. It is connected to the switch in this diagram.'],
      phone:['Phone','A smartphone connects to the router wirelessly through Wi-Fi, then can access local or internet services.']
    };
    // The route is an educational model, not actual network tracing.
    const routes={
      computer:['server','modem','router','switch','computer'],
      switch:['computer','switch'],
      router:['computer','switch','router'],
      modem:['computer','switch','router','modem'],
      server:['computer','switch','router','modem','server'],
      printer:['computer','switch','printer'],
      phone:['computer','switch','router','phone']
    };
    const coords=name=>{const node=byDevice[name];return{x:Number(node.dataset.x),y:Number(node.dataset.y)};};
    let token=0,raf=0;
    function showRoute(names){
      const myToken=++token;if(raf)cancelAnimationFrame(raf);raf=0;
      const points=names.map(coords);
      const route=points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
      routeText.textContent=names.map(s=>s.toUpperCase()).join(' → ');
      activeRoute.setAttribute('d',route);
      if(reduced){
        activeRoute.classList.add('immediate');
        packet.setAttribute('opacity','0');halo.setAttribute('opacity','0');
        status.textContent='Packet route shown. Motion disabled in accessibility settings.';
        return;
      }
      activeRoute.classList.remove('immediate');
      packet.setAttribute('opacity','1');halo.setAttribute('opacity','1');
      const stageDuration=530;
      const total=(points.length-1)*stageDuration;
      const begun=performance.now();
      const tick=now=>{
        if(token!==myToken)return;
        const elapsed=Math.max(0,Math.min(now-begun,total));
        const stage=Math.min(points.length-2,Math.floor(elapsed/stageDuration));
        const t=Math.min(1,(elapsed-stage*stageDuration)/stageDuration);
        const eased=t*t*(3-2*t);
        const a=points[stage],b=points[stage+1];
        const x=a.x+(b.x-a.x)*eased,y=a.y+(b.y-a.y)*eased;
        packet.setAttribute('cx',String(x));packet.setAttribute('cy',String(y));
        halo.setAttribute('cx',String(x));halo.setAttribute('cy',String(y));
        if(elapsed<total)raf=requestAnimationFrame(tick);
        else{raf=0;packet.setAttribute('opacity','0');halo.setAttribute('opacity','0');status.textContent='Packet delivered (simulation complete).';}
      };
      raf=requestAnimationFrame(tick);
    }
    nodes.forEach(node=>node.addEventListener('click',()=>{
      nodes.forEach(n=>n.classList.toggle('selected',n===node));
      const device=node.dataset.device;
      title.textContent=knowledge[device][0];description.textContent=knowledge[device][1];
      status.textContent=`Sending packet to ${device}...`;
      showRoute(routes[device]);
    }));
    byDevice.computer.classList.add('selected');
  }

  const timeline = document.getElementById('internet-timeline');
  if (timeline) {
    const stops=[...timeline.querySelectorAll('.timeline-stop')];
    const history=[
      ['1962','An early vision of connected computers','J. C. R. Licklider described an early vision of a network connecting computers and people.'],
      ['1969','ARPANET begins connecting computers','ARPANET, a forerunner of the internet, established its first connections between research computers.'],
      ['1989','The World Wide Web is invented','Tim Berners-Lee proposed the World Wide Web while working at CERN, making linked information easier to access.'],
      ['1991','The Web becomes publicly available','The World Wide Web began opening to people beyond its original research community, setting the stage for wider adoption.']
    ];
    const year=document.getElementById('timeline-selected-year');
    const title=document.getElementById('timeline-selected-title');
    const detail=document.getElementById('timeline-selected-text');
    const card=document.getElementById('timeline-story-card');
    const bar=document.getElementById('timeline-rail-fill');
    const spark=document.getElementById('timeline-rail-spark');
    const prog=document.getElementById('timeline-progress-copy');
    const announce=document.getElementById('timeline-announce');
    const play=document.getElementById('timeline-play');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const storyItems=[year,title,detail,prog];
    let current=0,autoplay=0;
    let enterAnimations=[];

    // Make every milestone card the same height, based on the longest entry.
    // Measure in an invisible copy so no wording, animations or original
    // assessment content is altered while a visitor changes the year.
    function sizeMilestoneCard(){
      const width=card.getBoundingClientRect().width;
      if(!width)return;
      const sample=card.cloneNode(true);
      sample.removeAttribute('id');
      sample.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
      sample.setAttribute('aria-hidden','true');
      Object.assign(sample.style, {
        position:'absolute', visibility:'hidden', pointerEvents:'none',
        width:`${width}px`, minHeight:'0px', height:'auto',
        left:'0px', top:'0px', zIndex:'-1'
      });
      card.after(sample);
      const sampleYear=sample.querySelector('.timeline-big-year');
      const sampleTitle=sample.querySelector('h3');
      const sampleText=sample.querySelector('p');
      const sampleProgress=sample.querySelector('.timeline-progress-copy');
      let maxHeight=0;
      history.forEach((event,index)=>{
        sampleYear.textContent=event[0];
        sampleTitle.textContent=event[1];
        sampleText.textContent=event[2];
        sampleProgress.textContent=`MILESTONE ${String(index+1).padStart(2,'0')} / ${String(history.length).padStart(2,'0')}`;
        maxHeight=Math.max(maxHeight,sample.getBoundingClientRect().height);
      });
      sample.remove();
      // A fractional pixel may be rounded differently after a font loads.
      card.style.minHeight=`${Math.ceil(maxHeight)+1}px`;
    }
    let layoutFrame=0;
    const rescheduleCardSize=()=>{
      if(layoutFrame)cancelAnimationFrame(layoutFrame);
      layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;sizeMilestoneCard();});
    };

    function stopPlayback(){
      if(autoplay){clearInterval(autoplay);autoplay=0;}
      play.setAttribute('aria-pressed','false');
      play.innerHTML='<span aria-hidden="true">▶</span> PLAY TIMELINE';
    }
    function select(index,manual=true){
      if(manual)stopPlayback();
      const next=Math.max(0,Math.min(history.length-1,index));
      const old=current;
      current=next;
      enterAnimations.forEach(animation=>animation.cancel());
      enterAnimations=[];
      stops.forEach((button,i)=>{
        button.classList.toggle('active',i===next);
        button.classList.toggle('visited',i<=next);
        button.setAttribute('aria-pressed',String(i===next));
      });
      // Only the supplementary timeline presentation is changed.
      // Imported assessment text and images are not modified by this activity.
      year.textContent=history[next][0];
      title.textContent=history[next][1];
      detail.textContent=history[next][2];
      prog.textContent=`MILESTONE ${String(next+1).padStart(2,'0')} / ${String(history.length).padStart(2,'0')}`;
      const progress=100*next/(history.length-1);
      bar.style.width=`${progress}%`;
      spark.style.left=`${progress}%`;
      timeline.dataset.era=history[next][0];
      card.dataset.era=history[next][0];
      document.getElementById('timeline-prev').disabled=next===0;
      document.getElementById('timeline-next').disabled=next===history.length-1;
      announce.textContent=`${history[next][0]}: ${history[next][1]}`;
      if(!reduced && old!==next && typeof year.animate==='function'){
        const direction=next>old?1:-1;
        const movement=direction*13;
        const timings={duration:600,easing:'cubic-bezier(.18,.78,.19,1)',fill:'none'};
        for (const [i,item] of storyItems.entries()) {
          const animation=item.animate([
            {opacity:0,transform:`translate3d(${movement}px, ${9+i*2}px, 0)`},
            {opacity:1,transform:'translate3d(0, 0, 0)'}
          ],{...timings,delay:i*42});
          enterAnimations.push(animation);
        }
      }
    }
    stops.forEach((button,i)=>{
      button.addEventListener('click',()=>select(i));
      button.addEventListener('keydown',e=>{
        const target=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?stops.length-1:null;
        if(target!==null){
          e.preventDefault();
          const fixed=Math.max(0,Math.min(stops.length-1,target));
          select(fixed);
          stops[fixed].focus();
        }
      });
    });
    document.getElementById('timeline-prev').addEventListener('click',()=>select(current-1));
    document.getElementById('timeline-next').addEventListener('click',()=>select(current+1));
    play.addEventListener('click',()=>{
      if(autoplay){stopPlayback();return;}
      if(current===history.length-1)select(0,false);
      play.setAttribute('aria-pressed','true');
      play.innerHTML='<span aria-hidden="true">❚❚</span> PAUSE TIMELINE';
      autoplay=setInterval(()=>{
        if(document.hidden){stopPlayback();return;}
        if(current<history.length-1)select(current+1,false);
        else stopPlayback();
      }, reduced?3000:3600);
    });
    // Horizontal swipes switch milestones without interfering with vertical page scrolling.
    let touchStart=null;
    card.addEventListener('touchstart',e=>{
      if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
    },{passive:true});
    card.addEventListener('touchend',e=>{
      if(!touchStart || !e.changedTouches.length)return;
      const dx=e.changedTouches[0].clientX-touchStart.x;
      const dy=e.changedTouches[0].clientY-touchStart.y;
      touchStart=null;
      if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.5){
        select(current+(dx<0?1:-1));
      }
    },{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
    select(0);
    sizeMilestoneCard();
    window.addEventListener('resize',rescheduleCardSize,{passive:true});
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(rescheduleCardSize);
    }
  }

  const quiz = document.getElementById('quiz-lab');
  if (quiz) {
    const questions = [
      {q:'How many bits make up one byte?', choices:['4','8','16','24'], answer:1, why:'Eight bits make one byte.'},
      {q:'How many bits does one pixel use in a 24-bit RGB image?', choices:['8','16','24','32'],answer:2,why:'A 24-bit RGB pixel uses eight bits each for red, green and blue.'},
      {q:'Which device directs data between networks?',choices:['Printer','Monitor','Router','Keyboard'],answer:2,why:'A router forwards data between networks.'},
      {q:'Which early network helped lead to the internet?',choices:['ARPANET','Bluetooth','HDMI','USB'],answer:0,why:'ARPANET connected research computers and helped shape the internet.'},
      {q:'Who invented the World Wide Web?',choices:['J. C. R. Licklider','Tim Berners-Lee','Alan Turing','Ada Lovelace'],answer:1,why:'Tim Berners-Lee invented the Web while at CERN.'},
      {q:'What is a good response to a suspicious link asking for your password?',choices:['Enter your password immediately','Forward the link to everyone','Ignore or verify it through a trusted source','Share your account details'],answer:2,why:'Verify suspicious messages through trusted channels and do not share passwords.'},
      {q:'What does AI stand for?',choices:['Automatic Internet','Artificial Intelligence','Active Interface','Advanced Input'],answer:1,why:'AI stands for Artificial Intelligence.'}
    ];
    const questionLabel = document.getElementById('quiz-question');
    const options = document.getElementById('quiz-options');
    const button = document.getElementById('quiz-next');
    const feedback = document.getElementById('quiz-feedback');
    const play = document.getElementById('quiz-playing');
    const results = document.getElementById('quiz-results');
    let index = 0, score = 0, picked = null, checked = false;
    function render() {
      picked = null; checked = false;
      const q = questions[index];
      document.getElementById('quiz-count').textContent = `QUESTION ${String(index+1).padStart(2,'0')} / ${String(questions.length).padStart(2,'0')}`;
      document.getElementById('quiz-score').textContent = `SCORE: ${score}`;
      document.getElementById('quiz-progress').style.width = `${index / questions.length * 100}%`;
      questionLabel.textContent = q.q;
      options.replaceChildren();
      feedback.textContent = '';
      button.textContent = 'CHECK ANSWER';
      button.disabled = true;
      q.choices.forEach((choice,i) => {
        const opt = document.createElement('button');
        opt.className = 'quiz-option'; opt.type = 'button'; opt.setAttribute('aria-pressed','false');
        opt.textContent = `${String.fromCharCode(65+i)}. ${choice}`;
        opt.addEventListener('click', () => {
          if (checked) return;
          picked = i;
          [...options.children].forEach((el,k) => {el.classList.toggle('picked',k===i);el.setAttribute('aria-pressed',String(k===i));});
          button.disabled = false;
        });
        options.appendChild(opt);
      });
    }
    button.addEventListener('click', () => {
      if (!checked) {
        if (picked === null) return;
        checked = true;
        const q = questions[index];
        const correct = picked === q.answer;
        if (correct) score++;
        [...options.children].forEach((el,i) => {
          el.disabled = true;
          if (i === q.answer) el.classList.add('correct');
          else if (i === picked) el.classList.add('wrong');
        });
        feedback.textContent = `${correct ? 'Correct!' : 'Not quite.'} ${q.why}`;
        button.textContent = index === questions.length - 1 ? 'VIEW SCORE →' : 'NEXT QUESTION →';
      } else if (index < questions.length - 1) { index++; render(); }
      else {
        play.hidden = true;
        results.hidden = false;
        document.getElementById('quiz-final-score').textContent = `${score} / ${questions.length}`;
        window.dispatchEvent(new CustomEvent('techgeeks:quiz-complete', { detail: { score, total: questions.length } }));
        document.getElementById('quiz-final-message').textContent = score === questions.length ? 'Perfect! You are a TechGeek master.' : score >= 5 ? 'Great work! Try again for a perfect score.' : 'Good practice. Revisit the topics and try again!';
      }
    });
    document.getElementById('quiz-restart').addEventListener('click', () => { index = 0; score = 0; play.hidden = false; results.hidden = true; render(); });
    render();
  }
})();
