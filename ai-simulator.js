"use strict";
/* Educational demo only: all responses are locally prepared combinations.
   The illustration does not execute a neural network or contact a model. */
(() => {
  const lab = document.getElementById('ai-lab');
  if (!lab) return;
  const $ = id => document.getElementById(id);
  const prompt = $('ai-prompt'), slider = $('ai-temperature');
  const value = $('ai-temperature-value'), generate = $('ai-generate');
  const answer = $('ai-answer'), mode = $('ai-result-mode');
  const neuralStatus = $('ai-brain-status'), resultPanel = $('ai-result-panel');
  const disclaimer = $('ai-disclaimer');
  const focusedSample = $('ai-focused-sample'), creativeSample = $('ai-creative-sample');
  const choices = [...lab.querySelectorAll('.ai-example')];
  const stageButtons = [...lab.querySelectorAll('.ai-stage')];
  const stageTitle = $('ai-stage-title'), stageDescription = $('ai-stage-description');
  const pulseCount = $('ai-pulse-count'), svg = $('ai-neural-art');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fallback = 'This is an offline teaching tool with prepared examples. Choose a prompt about binary, pixels, networks, AI, safety, algorithms, storage or internet history. It does not generate answers to unrelated questions.';

  /* Each topic supplies factual low/medium examples and reusable high-temperature
     components. Mixing these makes many distinct, still-topic-specific explanations. */
  const topics = {
    binary: {
      terms: /\b(binary|bits?|bytes?|zeroes?|zeros?|ones?|base.?2)\b/i,
      focused: 'Binary is a number system that uses 0 and 1. Computers represent information using combinations of these digits.',
      balanced: [
        'Binary uses only two digits, 0 and 1. Combining them lets computers represent numbers, text and images.',
        'Computers store information using binary patterns. A bit is a 0 or 1, and eight bits make a byte.',
        'Think of a bit as one of two possible states. Arrange enough bits together, and computers can store complex information.',
        'Even a simple sequence of zeros and ones can represent a letter or colour when a shared encoding system is used.'
      ],
      seed: 'Binary is the system of zeros and ones computers use to represent information.',
      images: ['a mosaic where every tile can be light or dark','a code made from two tiny symbols','a row of switches set to off or on','a digital alphabet made from only two marks'],
      closers: ['Different arrangements can stand for different numbers or letters.','A collection of eight bits is called a byte.','An agreed encoding gives those patterns meaning.','The simplicity of each bit makes larger digital patterns possible.']
    },
    pixels: {
      terms: /\b(pixels?|pictures?|images?|rgb|colou?rs?|resolution|digital art)\b/i,
      focused: 'A digital image is made of pixels. In a 24-bit RGB image, each pixel uses 8 bits each for red, green and blue.',
      balanced: ['Pixels are tiny coloured squares. Their combined RGB values build the images shown on a screen.','Images are built pixel by pixel. In 24-bit RGB, a pixel holds three 8-bit colour values.','Picture resolution describes how many pixels an image contains, while RGB values define their colours.','Digital art often stores colours as red, green and blue values for each pixel.'],
      seed: 'Pixels are the small picture elements used to form digital images.',
      images: ['a wall of tiny coloured tiles','a screen painted with millions of miniature squares','a giant mosaic viewed from across the room','a colourful grid where each cell has three dials'],
      closers: ['Each 24-bit RGB pixel has a red, green and blue channel.','Zoom in far enough and the individual squares become visible.','Combining channel values produces many different colours.','More pixels can show finer detail when displayed at a suitable size.']
    },
    packet: {
      terms: /\b(data packets?|packet switching|transmission|travels? across|send data)\b/i,
      focused: 'A packet is a small unit of data sent across a network. Network devices forward packets toward their destination.',
      balanced: ['Large messages can be split into packets, sent across a network, then put together again.','Packets carry data through interconnected network devices toward a destination.','Network communication often sends information as separate packets rather than one continuous block.','Packets include information that helps the network deliver them correctly.'],
      seed: 'Network packets are small pieces of information carried between connected devices.',
      images: ['parcels travelling through a sorting centre','tiny digital envelopes passing from node to node','a journey made by many small messages','a set of labelled puzzle pieces sent separately'],
      closers: ['The receiving system can reassemble the pieces in the right order.','Routers help packets move between networks.','Different packets may take different paths.','A destination address helps each packet reach the correct system.']
    },
    router: {
      terms: /\b(routers?|route data|wi.?fi router)\b/i,
      focused: 'A router directs data between networks, including a home network and the internet.',
      balanced: ['Routers decide where data packets should go between networks.','A home router connects local devices to other networks and may also provide Wi-Fi.','When data leaves one network for another, routers help forward it toward the destination.','Routers use network addressing information to choose the next step for packets.'],
      seed: 'A router directs data between different networks.',
      images: ['a traffic controller at a busy junction','a signpost choosing roads for digital packets','a junction connecting neighbourhoods','a guide directing messages toward distant destinations'],
      closers: ['A router is not the same as a switch, which links local network devices.','A home router often works with a modem.','Routers make decisions using network destinations.','Multiple routers may forward a packet before it arrives.']
    },
    switch: {
      terms: /\b(switch|ethernet frames?)\b/i,
      focused: 'A network switch connects devices on a local network and forwards Ethernet frames to the appropriate port.',
      balanced: ['A switch lets connected local devices exchange data efficiently.','Switches help computers and printers communicate on the same Ethernet network.','A switch learns which device addresses are reachable through its ports.','Unlike a router, a typical Ethernet switch forwards frames within a local network.'],
      seed: 'A switch connects devices within a local network.',
      images: ['a receptionist directing mail to nearby desks','a hallway with a door for each connected device','a local sorting station for Ethernet frames','a map of neighbouring offices linked by cables'],
      closers: ['Switches forward frames toward the relevant port.','They commonly connect computers, printers and access points.','A router handles communication between different networks.','Ethernet switches are important in wired local networks.']
    },
    modem: {
      terms: /\b(modems?|broadband|internet service provider|\bisp\b)\b/i,
      focused: 'A modem adapts signals for a particular internet access connection, such as a cable or DSL link.',
      balanced: ['A modem connects a home network to a service-provider connection and adapts signals for that technology.','Modems are used with some broadband connections, often alongside a router.','The exact modem or termination equipment depends on the type of internet service.','The modem and router are different devices, although some home gateways combine them.'],
      seed: 'A modem helps equipment communicate across an internet access connection.',
      images: ['an interpreter between two ways of sending signals','a gateway translating between connection technologies','a bridge between household equipment and an access line','the link that helps connect a home to its provider'],
      closers: ['What the modem does depends on the broadband technology.','Some home devices combine modem and router functions.','It is not the same job as switching Ethernet frames.','A router commonly forwards data onward to local devices.']
    },
    network: {
      terms: /\b(networks?|connected|connectivity|internet|communicat(?:e|ion))\b/i,
      focused: 'A computer network connects devices so they can communicate and share information or resources.',
      balanced: ['Networks connect devices so they can exchange messages and files.','A network can be as small as two computers or as large as the global internet.','Switches, routers and network connections work together to move data.','Connected devices use agreed communication rules called protocols.'],
      seed: 'A network links devices so they can share information.',
      images: ['a city of connected buildings and digital roads','a web of computers passing messages','a team of devices sharing information','a transport system carrying bits from place to place'],
      closers: ['Different devices play different roles in moving data.','Networks can use cables or wireless connections.','The internet is a network of networks.','Shared protocols help connected devices understand one another.']
    },
    passwords: {
      terms: /\b(passwords?|passphrases?|two.?factor|multi.?factor|\bmfa\b)\b/i,
      focused: 'A strong password should be unique for each important account. A password manager and multi-factor authentication improve security.',
      balanced: ['Use long, unique passwords or passphrases, and turn on multi-factor authentication where available.','A password manager can create and store different passwords for different websites.','Avoid reusing the same password across important accounts.','Multi-factor authentication adds another protection step beyond a password.'],
      seed: 'Good password habits protect online accounts.',
      images: ['different keys for different doors','a lock with an extra security checkpoint','a safe with its own unique combination','a strong gate that needs more than one form of proof'],
      closers: ['Reuse makes it easier for one stolen password to affect several accounts.','A password manager can help manage unique credentials.','Multi-factor authentication strengthens protection.','Never share your passwords with strangers or suspicious websites.']
    },
    safety: {
      terms: /\b(saf(e|ety)|phish(?:ing)?|scams?|cyber|hack(?:ing)?|privacy|suspicious|online threats?)\b/i,
      focused: 'Internet safety involves protecting personal information and being cautious about suspicious messages, links and requests.',
      balanced: ['Online safety includes checking links, protecting personal information and keeping accounts secure.','Think carefully before clicking unexpected messages or giving away details.','Scams often try to create urgency, so slow down and check who sent a message.','Reliable security habits help reduce online risks.'],
      seed: 'Internet safety means recognising risks and protecting information online.',
      images: ['a digital castle with guarded doors','a traveller checking signs before choosing a path','a security checkpoint for unfamiliar links','a lighthouse that helps spot danger online'],
      closers: ['Verify unexpected messages through trusted channels.','Do not enter passwords through suspicious links.','Personal data deserves careful handling.','Being cautious helps protect both accounts and devices.']
    },
    history: {
      terms: /\b(arpanet|history|1962|1969|1989|1991|world wide web|tim berners.lee|licklider|first internet)\b/i,
      focused: 'ARPANET was an early packet-switching research network. The World Wide Web was created later, in 1989, by Tim Berners-Lee.',
      balanced: ['ARPANET connected research computers and helped shape the development of modern networking.','The World Wide Web, proposed by Tim Berners-Lee in 1989, is a service built on the internet.','Internet history includes early network ideas, ARPANET, and the creation of the Web.','The internet and the World Wide Web are related but not identical.'],
      seed: 'The internet developed through decades of research and connected networks.',
      images: ['a growing web stretching between research labs','a trail of connected computer experiments','an expanding digital map of connected centres','the building of roads before websites could travel on them'],
      closers: ['ARPANET was one important early step.','The Web arrived later and made linked pages easier to access.','Many people and projects contributed to the internet.','Tim Berners-Lee developed the World Wide Web at CERN.']
    },
    storage: {
      terms: /\b(stor(e|age|ing)|hard drives?|ssd|file sizes?|megabytes?|gigabytes?|memory|usb|data formats?)\b/i,
      focused: 'Digital storage keeps information as encoded data. File sizes are commonly measured in bytes, kilobytes, megabytes and gigabytes.',
      balanced: ['Computers store text, images and other information as binary data.','Different file types and compression methods affect how much storage an item needs.','Data storage includes devices such as SSDs and USB drives.','A byte is eight bits, and large files can contain millions or billions of bytes.'],
      seed: 'Digital storage keeps files as patterns of information.',
      images: ['a library built from binary building blocks','a shelf of invisible digital containers','a warehouse holding countless little data patterns','a collection of numbered boxes for files'],
      closers: ['File formats affect how information is stored.','Compression can reduce the space a file needs.','Different storage devices hold data in different physical ways.','Bytes help describe file sizes.']
    },
    algorithm: {
      terms: /\b(algorithms?|instructions?|programs?|coding|programming|loops?|steps? in code)\b/i,
      focused: 'An algorithm is a sequence of steps or rules used to solve a problem or complete a task.',
      balanced: ['Algorithms give computers a sequence of instructions to follow.','A computer program can use algorithms to sort, search or process information.','Algorithms can contain decisions and repeated steps.','Clear steps help turn a task into a process a computer can carry out.'],
      seed: 'An algorithm is a set of instructions for completing a task.',
      images: ['a recipe made from logical steps','a maze with a set of directions','a treasure map that tells you what to do next','a plan that transforms an input into an output'],
      closers: ['Programs often implement algorithms.','Loops repeat steps and conditions choose between paths.','Algorithms are useful even outside computing.','Testing helps check that an algorithm works correctly.']
    },
    learning: {
      terms: /\b(machine learning|training data|trained|learn(?:ing)? patterns|models? learn)\b/i,
      focused: 'Machine learning is a method in which systems learn patterns from data to make predictions or produce outputs.',
      balanced: ['Machine-learning models adjust internal parameters using examples during training.','Training data helps models learn statistical patterns.','A trained model applies learned patterns to new inputs.','Learning patterns is different from a person understanding something.'],
      seed: 'Machine learning uses examples to find patterns in data.',
      images: ['a pattern detector trained on many examples','a map gradually shaped by practice data','a sorting machine that improves with examples','a system tuning thousands of internal dials'],
      closers: ['The quality of the training data matters.','Models can make mistakes on unfamiliar inputs.','Patterns learned in training affect predictions.','A model is not automatically correct just because it is confident.']
    },
    aiwords: {
      terms: /\b(predict(?:ion)?|choos(?:e|ing) words?|next token|tokens?|generat(?:e|ing) (?:a )?response|language models?|llms?)\b/i,
      focused: 'A language model generates text by predicting tokens based on the context and patterns learned during training.',
      balanced: ['Language models use the preceding context to estimate what token should come next.','A response is built step by step from token predictions.','Sampling settings, such as temperature, can influence which possible next token is chosen.','Language-model output is based on learned statistical patterns rather than a fixed lookup of whole replies.'],
      seed: 'A language model builds responses by choosing tokens based on context.',
      images: ['a word path branching into possible next steps','a sentence being assembled one piece at a time','a trail of possible phrases with different probabilities','a branching tree of possible next tokens'],
      closers: ['Higher temperature typically makes less likely choices more possible.','The resulting text can still contain mistakes.','Tokens are often word pieces, not necessarily whole words.','This simulator is only illustrating that idea with prepared examples.']
    },
    temperature: {
      terms: /\b(temperature|creativ(?:e|ity)|randomness|sampling|predictability)\b/i,
      focused: 'Temperature is a sampling setting that changes how strongly a model favours high-probability tokens.',
      balanced: ['Low temperature usually makes outputs more predictable; higher temperature can increase variety.','Increasing temperature spreads probability across more possible token choices.','Temperature does not guarantee creativity or accuracy.','An identical prompt can sometimes produce different answers, even at a low temperature.'],
      seed: 'Temperature changes how a language model samples its next token.',
      images: ['a dial changing how many paths a model considers','a choice wheel that becomes less narrowly focused','a spotlight that broadens to illuminate more possibilities','a crossroads where extra routes become plausible'],
      closers: ['A higher setting can lead to greater wording variation.','It is not a measurement of model intelligence.','More variation does not guarantee a better answer.','This offline demo shows the idea using prepared choices.']
    },
    ai: {
      terms: /\b(ai|artificial intelligence|chatbots?|neural networks?|assistants?)\b/i,
      focused: 'Artificial intelligence is a field of computing that develops systems able to perform tasks such as pattern recognition and language processing.',
      balanced: ['AI systems can recognise patterns, classify information and help produce text.','Some AI tools use models trained on many examples.','AI can help with tasks but may still produce incorrect results.','Artificial intelligence covers a wide range of methods, from rules to machine learning.'],
      seed: 'Artificial intelligence helps computers perform tasks that involve learning or recognising patterns.',
      images: ['a digital pattern detective','a mapmaker exploring mountains of examples','a machine connecting clues across data','a system looking for shapes in a sea of information'],
      closers: ['Human judgement is still important when checking results.','Different AI systems work in very different ways.','Learned patterns affect what models predict.','This simulator uses prepared explanations, not a real AI model.']
    },
    protocols: {
      terms: /\b(protocols?|tcp|ip addresses?|\bdns\b|http|https)\b/i,
      focused: 'Network protocols are agreed rules that devices follow to exchange data and understand messages.',
      balanced: ['Protocols help devices send and receive data consistently.','IP addresses identify network destinations, and DNS can help translate domain names into addresses.','HTTP and HTTPS are used when browsers request website resources.','Different protocols are used for different layers of network communication.'],
      seed: 'Protocols are shared rules that make network communication possible.',
      images: ['a shared language between computers','rules for delivering digital mail','traffic signals organising the flow of data','an instruction manual that both devices understand'],
      closers: ['Common rules help different devices communicate.','DNS helps people use familiar names for websites.','HTTPS adds encryption to web communication.','Network protocols work together in layers.']
    },
    digital: {
      terms: /\b(digit(?:al|isation|ization)|scan(?:ning)?|encoding|analog(?:ue)?|recording)\b/i,
      focused: 'Digitisation converts information into a digital form that computers can store or process.',
      balanced: ['Scanning a document is one way to digitise physical information.','Digitisation transforms physical or analogue information into digital data.','Recorded sound can be sampled and stored digitally.','Encoding allows digital information to be represented as binary data.'],
      seed: 'Digitisation turns information into a form computers can store.',
      images: ['turning a drawing into a grid of digital values','capturing sounds as a series of measurements','translating a paper page into computer-readable data','a bridge from the physical world into bits'],
      closers: ['Digital files can be copied and shared between compatible devices.','The technique depends on whether the source is text, sound or images.','Scanners and recording equipment are common tools.','The result can be represented using binary data.']
    },
    privacy: {
      terms: /\b(personal information|personal data|data protection|tracking|private info|online privacy)\b/i,
      focused: 'Online privacy means controlling how personal information is collected, used and shared.',
      balanced: ['Think carefully before posting or sharing personal details.','Privacy settings can limit who sees information online.','Apps and websites may collect data, so review permissions and notices.','Keep sensitive information away from untrusted requests.'],
      seed: 'Digital privacy involves protecting and managing personal data.',
      images: ['a private journal with carefully chosen readers','a digital curtain that controls what is visible','a locked cabinet for personal information','a map showing which data you choose to share'],
      closers: ['Privacy settings can help limit exposure.','Review what information websites ask for.','Shared posts may be difficult to take back.','Protecting personal data supports online safety.']
    }
  };

  const priority = ['privacy','passwords','safety','temperature','aiwords','learning','protocols','router','switch','modem','packet','history','pixels','storage','binary','digital','algorithm','ai','network'];
  // Each topic/mode uses a shuffle bag so repeated questions produce different high-temperature
  // examples until the combinations are exhausted, even if Math.random repeats.
  const bags = new Map();
  let completed = 0;
  let timer = 0, run = 0, phaseTimers = [];
  const normalize = n => Math.max(0,Math.min(100, Number(n) || 0));
  function selectedTopic() {
    const text = prompt.value.trim();
    for (const key of priority) if (topics[key].terms.test(text)) return key;
    return null;
  }
  function modeFrom(temp) { return temp < 35 ? 'focused' : temp < 70 ? 'balanced' : 'creative'; }
  const openings = [
    seed => `Imagine ${seed.toLowerCase()}`,
    seed => `Let's picture it another way. ${seed}`,
    seed => `Start with this idea: ${seed}`,
    seed => `Here's a different angle: ${seed}`
  ];
  const segues = ['Visualise','Picture','Think of','Imagine'];
  const poolFor = (key,level) => {
    const item=topics[key];
    if (level==='focused') return [item.focused];
    if (level==='balanced') return item.balanced;
    const result=[];
    for(let a=0;a<item.images.length;a++){
      for(let b=0;b<item.closers.length;b++){
        for(let c=0;c<openings.length;c++){
          const visual=segues[(a+b+c)%segues.length];
          result.push(`${openings[c](item.seed)} ${visual} ${item.images[a]}. ${item.closers[b]}`);
        }
      }
    }
    return result;
  };
  const bagKey=(key,level)=>key+':'+level;
  function choose(key,level) {
    const options=poolFor(key,level);
    if(options.length===1) return [options[0],1,1];
    const id=bagKey(key,level);
    let bag=bags.get(id);
    if(!bag||!bag.available.length){
      const available=Array.from({length:options.length},(_,i)=>i);
      for(let i=available.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[available[i],available[j]]=[available[j],available[i]];}
      if(bag && available.length>1 && available[available.length-1]===bag.previous){
        [available[0],available[available.length-1]]=[available[available.length-1],available[0]];
      }
      bag={available,previous:bag?.previous??-1,total:options.length,shown:0};
    }
    const idx=bag.available.pop();
    bag.previous=idx;bag.shown++;
    bags.set(id,bag);
    return [options[idx],bag.shown,options.length];
  }

  function setExampleSelection() {
    const input=prompt.value.trim();
    choices.forEach(button=>{
      const selected=button.dataset.aiPrompt===input;
      button.classList.toggle('selected',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
  }
  function updateComparisons(){
    const key=selectedTopic();
    focusedSample.textContent=key?topics[key].focused:fallback;
    creativeSample.textContent=key?`${topics[key].seed} Picture ${topics[key].images[1]}. ${topics[key].closers[0]}`:fallback;
  }
  function updateTemperature(){
    const temp=normalize(slider.value);
    value.textContent=(temp/100).toFixed(2);
    slider.style.setProperty('--ai-slider-progress',`${temp}%`);
    lab.dataset.temperature=modeFrom(temp);
    const description=temp<35?'FOCUSED':temp<70?'BALANCED':'EXPLORATORY';
    $('ai-temp-indicator')?.replaceChildren(document.createTextNode(description));
  }
  choices.forEach(button=>button.addEventListener('click',()=>{
    prompt.value=button.dataset.aiPrompt;
    setExampleSelection(); updateComparisons(); prompt.focus();
  }));
  prompt.addEventListener('input',()=>{setExampleSelection();updateComparisons();});
  slider.addEventListener('input',updateTemperature);

  const stageDetails = [
    ['INPUT / RECEIVE PROMPT','Words in the prompt supply context for a language model.'],
    ['ENCODING / TOKEN REPRESENTATION','A model works with token representations, not plain sentences as whole objects.'],
    ['PATTERNS / MANY LAYERS','Neural-network layers transform representations and learn statistical relationships.'],
    ['SAMPLING / TEMPERATURE','Possible next tokens have probabilities. Temperature changes how those probabilities are sampled.'],
    ['OUTPUT / RESPONSE','Chosen tokens become the text of the response, one step at a time.']
  ];
  const setStage=index=>{
    stageButtons.forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-pressed',String(i===index));});
    stageTitle.textContent=stageDetails[index][0];
    stageDescription.textContent=stageDetails[index][1];
    svg.dataset.activeStage=String(index);
  };
  stageButtons.forEach((b,i)=>b.addEventListener('click',()=>setStage(i)));

  // Decorative particles travel along drawn SVG curves. The SVG is a conceptual
  // illustration, never a rendering of real hidden network activations.
  const particleGroup=$('ai-signal-particles');
  if(!reducedMotion && particleGroup){
    const paths=[...svg.querySelectorAll('.neural-synapse')];
    const ns='http://www.w3.org/2000/svg';
    const dots=Array.from({length:19},(_,index)=>{
      const circle=document.createElementNS(ns,'circle');
      circle.setAttribute('r',index%4===0?'4':'2.5');
      circle.setAttribute('class','neural-travel-dot');
      circle.setAttribute('fill',['#42f5e9','#9db1ff','#fc7bd9','#f9e66e'][index%4]);
      particleGroup.appendChild(circle);
      const selected=paths[(index*11+7)%paths.length];
      return {circle,path:selected,length:selected.getTotalLength(),phase:(index*0.061)%1,speed:.065+(index%6)*.014};
    });
    let last=0,offset=0;
    const frame=now=>{
      const delta=last?Math.min((now-last)/1000,.07):0;last=now;
      if(document.visibilityState==='visible')offset+=delta*(lab.classList.contains('ai-processing')?2.1:1);
      dots.forEach(d=>{
        const position=(d.phase+offset*d.speed)%1;
        const pt=d.path.getPointAtLength(d.length*position);
        d.circle.setAttribute('cx',pt.x.toFixed(2));
        d.circle.setAttribute('cy',pt.y.toFixed(2));
        d.circle.style.opacity=String(Math.min(.94, Math.sin(position*Math.PI)*.95));
      });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  const endProgress=()=>{phaseTimers.forEach(clearTimeout);phaseTimers=[];};
  function simulate(){
    clearTimeout(timer);endProgress();run++;
    const myRun=run;
    const key=selectedTopic();
    const temp=normalize(slider.value);
    const level=modeFrom(temp);
    const [reply,variant,total] = key ? choose(key,level) : [fallback,1,1];
    const label=level==='focused'?'LOW TEMPERATURE':level==='balanced'?'MEDIUM TEMPERATURE':'HIGH TEMPERATURE';
    mode.textContent=key?label:'TOPIC NOT FOUND';
    generate.disabled=true;
    generate.textContent='SIMULATING...';
    answer.textContent='';
    lab.classList.add('ai-processing');
    resultPanel.classList.remove('ai-result-reveal');
    neuralStatus.textContent=reducedMotion?'● PREPARING':'◉ PROCESSING';
    if(!reducedMotion){
      stageButtons.forEach((_,i)=>{
        phaseTimers.push(setTimeout(()=>{if(myRun===run){setStage(i);pulseCount.textContent=`STAGE 0${i+1} / 05`; }},i*185));
      });
    }
    timer=setTimeout(()=>{
      if(myRun!==run)return;
      completed++;
      answer.textContent=reply;
      $('ai-run-count').textContent=`SIMULATION ${String(completed).padStart(2,'0')}`;
      $('ai-run-variation').textContent=key?`VARIATION ${String(variant).padStart(2,'0')} / ${total}`:'NO MATCH';
      $('ai-run-topic').textContent=key?`TOPIC / ${key.toUpperCase()}`:'TOPIC / UNSUPPORTED';
      disclaimer.textContent=key
        ?'Prepared, recombined examples only; not live AI. A higher temperature can increase variation in actual models, but does not guarantee a different or more accurate answer.'
        :'No live AI is connected. This offline demo cannot answer arbitrary questions.';
      lab.classList.remove('ai-processing');
      resultPanel.classList.add('ai-result-reveal');
      generate.disabled=false;
      generate.innerHTML='<span aria-hidden="true">✦</span> GENERATE ANOTHER EXAMPLE <span aria-hidden="true">↗</span>';
      neuralStatus.textContent='● COMPLETE';
      pulseCount.textContent='SEQUENCE COMPLETE';
      setStage(4);
      if(key)window.dispatchEvent(new CustomEvent('techgeeks:ai-tried'));
    },reducedMotion?0:1040);
  }
  generate.addEventListener('click',simulate);
  updateTemperature();updateComparisons();setExampleSelection();setStage(0);
})();
