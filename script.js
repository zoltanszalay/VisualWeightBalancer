/* ───────────────────────── CONFIG & STATE ───────────────────────── */
let logos = [], uid = 0, sortMode = 'height';
let autoTheme = true, theme = 'light';

/* ───────────────────────── DOM REFS ───────────────────────── */
const wall = document.getElementById('wall');
const tbl  = document.getElementById('tbl');
const tbody= tbl.querySelector('tbody');
const zone = document.getElementById('zone');
const themeToggle = document.getElementById('themeToggle');
const bgPicker    = document.getElementById('bgPicker');
const maxHInput   = document.getElementById('maxH');
const gapInput    = document.getElementById('gap');
const copyBtn     = document.getElementById('copyBtn');
const zipBtn      = document.getElementById('zipBtn');

/* ───────────────────────── UPLOAD PLUMBING ───────────────────────── */
['dragenter','dragover'].forEach(ev =>
  zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add('hover');})
);
['dragleave','drop'].forEach(ev =>
  zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove('hover');})
);

zone.addEventListener('drop',e=>handleFiles(e.dataTransfer.files));
zone.addEventListener('click',()=>{
  const inp=document.createElement('input');
  inp.type='file'; inp.multiple=true; inp.accept='image/*,image/svg+xml';
  inp.onchange=()=>handleFiles(inp.files);
  inp.click();
});
function handleFiles(list){
  [...list].forEach(f=>{
    if(!f.type.startsWith('image/')) return;
    const img=new Image();
    img.onload=()=>addLogo(f,img);
    img.src=URL.createObjectURL(f);
  });
}

/* ───────────────────────── HELPERS ───────────────────────── */
function avgBrightness(img,bg=255,downH=100){
  const s=Math.min(downH/img.height,1),
        w=Math.round(img.width*s),
        h=Math.round(img.height*s),
        c=Object.assign(document.createElement('canvas'),{width:w,height:h}),
        ctx=c.getContext('2d');
  ctx.drawImage(img,0,0,w,h);
  const d=ctx.getImageData(0,0,w,h).data;
  let sum=0;
  for(let i=0;i<d.length;i+=4)
    sum+=d[i+3]===0?bg*3:d[i]+d[i+1]+d[i+2];
  return (sum/(3*w*h))/255*100;
}

/* logo bookkeeping */
function addLogo(file,img){
  logos.push({id:uid++,file,img,name:file.name,type:file.type,w0:img.width,h0:img.height,bright:0});
  if(autoTheme && logos.length===1){
    applyTheme(avgBrightness(img,255)>70?'dark':'light');
  }
  refresh();
}

/* ───────────────────────── THEME ───────────────────────── */
function applyTheme(t,updateToggle=true){
  theme=t;
  document.body.classList.toggle('dark',t==='dark');
  if(updateToggle) themeToggle.checked=(t==='dark');
  bgPicker.value=t==='dark'?'#000000':'#ffffff';
  document.body.style.backgroundColor=bgPicker.value;
  refresh();
}

/* ───────────────────────── INPUT HANDLERS ───────────────────────── */
themeToggle.onchange=e=>{autoTheme=false;applyTheme(e.target.checked?'dark':'light',false);};
bgPicker.oninput=e=>{document.body.style.backgroundColor=e.target.value;};

maxHInput.oninput =
gapInput.oninput = e=>{
  if(e.target===gapInput){
    document.documentElement.style.setProperty('--wall-gap',`${gapInput.value}px`);
  }
  refresh();
};

document.querySelectorAll('[data-s]').forEach(b=>
  b.onclick=()=>{sortMode=b.dataset.s;refresh();}
);

/* ───────────────────────── CORE REFRESH ───────────────────────── */
function refresh(){
  if(!logos.length){wall.style.display=tbl.style.display='none';return;}
  wall.style.display='flex'; tbl.style.display='table';

  const bg=theme==='dark'?0:255, inverse=theme==='dark';

  logos.forEach(l=>{
    l.bright=avgBrightness(l.img,bg);
    l.weight=inverse?l.bright/100:1-l.bright/100;
  });

  const base=logos[0], A0=base.w0*base.h0, d0=base.weight;
  logos.forEach((l,i)=>{
    if(!i){ l.preW=l.w0; l.preH=l.h0; return; }
    const sh=base.h0/l.h0,
          A =l.w0*sh*base.h0,
          rel=Math.sqrt(d0*A0/(l.weight*A))*sh;
    l.preW=l.w0*rel;
    l.preH=l.h0*rel;
  });

  const factor=(+maxHInput.value||40)/Math.max(...logos.map(l=>l.preH));
  logos.forEach(l=>{
    l.fW=Math.round(l.preW*factor);
    l.fH=+(l.preH*factor).toFixed(1);
    l.scale=l.fH/l.h0*100;
  });

  /* uniform row height */
  document.documentElement.style.setProperty('--row-height',`${+maxHInput.value||40}px`);

  render();
}

/* ───────────────────────── RENDER WALL & TABLE ───────────────────────── */
function render(){
  const list=[...logos].sort((a,b)=>{
    if(sortMode==='added')    return a.id-b.id;
    if(sortMode==='filename') return a.name.localeCompare(b.name,'en',{sensitivity:'base'});
    if(sortMode==='height')   return b.fH-a.fH||a.id-b.id;
    if(sortMode==='width')    return b.fW-a.fW||a.id-b.id;
    return Math.random()-.5;
  });

  /* wall */
  wall.innerHTML='';
  list.forEach(l=>{
    const i=new Image();
    i.src=l.img.src;
    i.style.width =`${l.fW}px`;
    i.style.height=`${l.fH}px`;
    wall.appendChild(i);
  });

  /* table */
  tbody.innerHTML='';
  const widest  = Math.max(...list.map(l=>l.fW));
  const tallest = Math.max(...list.map(l=>l.fH));

  list.forEach(l=>{
    const widthPart  = l.fW===widest  ? `<strong>${l.fW} Widest</strong>`  : l.fW;
    const heightPart = l.fH===tallest ? `<strong>${l.fH} Tallest</strong>` : l.fH;
    const sizeCell   = `${widthPart} × ${heightPart}`;

    const r=tbody.insertRow();
    r.innerHTML=`
      <td><img src="${l.img.src}" style="width:${l.fW}px;height:${l.fH}px" /></td>
      <td>${l.name}</td>
      <td>${l.bright.toFixed(1)}</td>
      <td>${l.scale.toFixed(1)}</td>
      <td>${sizeCell}</td>`;
  });
}

/* ───────────────────────── CLIPBOARD & ZIP ───────────────────────── */
copyBtn.onclick=()=>{
  navigator.clipboard.writeText(logos.map(l=>`${l.name},${l.fW},${l.fH}`).join('\n'));
  copyBtn.textContent='Copied!';
  setTimeout(()=>copyBtn.textContent='Copy specs',1800);
};

async function png2x(img,w,h){
  const c=Object.assign(document.createElement('canvas'),{width:w*2,height:h*2}),
        x=c.getContext('2d',{alpha:true});
  x.imageSmoothingQuality='high';
  x.drawImage(img,0,0,w*2,h*2);
  return new Promise(r=>c.toBlob(r,'image/png'));
}

zipBtn.onclick=async()=>{
  if(!logos.length) return;
  const zip=new JSZip();
  for(const l of logos){
    if(/svg/.test(l.type)){
      const txt=await l.file.text();
      zip.file(
        l.name,
        txt.replace(/<svg([^>]*)>/,
          (_,a)=>`<svg${a.replace(/\s(width|height)="[^"]*"/g,'')} width="${l.fW}" height="${l.fH}">`
        )
      );
    }else{
      zip.file(
        l.name.replace(/\.[^.]+$/,'')+'@2x.png',
        await png2x(l.img,l.fW,l.fH)
      );
    }
  }
  const blob=await zip.generateAsync({type:'blob'});
  const url=URL.createObjectURL(blob);
  Object.assign(document.createElement('a'),{href:url,download:'balanced-logos.zip'}).click();
  URL.revokeObjectURL(url);
};