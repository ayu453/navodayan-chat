(()=>{
 const root=document.getElementById('nvTabView');
 if(!root||root.dataset.boardScrollReady)return;
 root.dataset.boardScrollReady='1';
 let lastY=root.scrollTop||0,ticking=false;
 const activeBoard=()=>{
   const m=document.getElementById('nvMemoriesPanel'),c=document.getElementById('nvCreativityPanel');
   if(m&&getComputedStyle(m).display!=='none')return m.querySelector('.nv-memory-hero');
   if(c&&getComputedStyle(c).display!=='none')return c.querySelector('.nv-corner-board');
   return null;
 };
 const update=()=>{
   const y=root.scrollTop||0,board=activeBoard();
   if(board){
     if(y>lastY+4&&y>45)board.classList.add('nv-board-scroll-hidden');
     else if(y<lastY-4||y<12)board.classList.remove('nv-board-scroll-hidden');
   }
   lastY=y;ticking=false;
 };
 root.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
 const normalizeOldestBottom=()=>{
   const memoryPanel=document.getElementById('nvMemoriesPanel');
   if(memoryPanel&&!memoryPanel.dataset.orderNormalized){
     const cards=Array.from(memoryPanel.querySelectorAll(':scope > .nv-memory-card'));
     cards.reverse().forEach(card=>memoryPanel.appendChild(card));memoryPanel.dataset.orderNormalized='1';
   }
   const creativityPanel=document.getElementById('nvCreativityPanel');
   const feed=creativityPanel&&creativityPanel.querySelector('#nvcFeed');
   if(feed&&!feed.dataset.orderNormalized){
     const cards=Array.from(feed.children);cards.reverse().forEach(card=>feed.appendChild(card));feed.dataset.orderNormalized='1';
   }
 };
 normalizeOldestBottom();
 const resetBoard=()=>{root.scrollTop=0;lastY=0;root.querySelectorAll('.nv-board-scroll-hidden').forEach(x=>x.classList.remove('nv-board-scroll-hidden'));};
 document.querySelectorAll('[data-nv-tab]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(()=>requestAnimationFrame(resetBoard))));
})();
