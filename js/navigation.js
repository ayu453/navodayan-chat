(()=>{
          // Shared navigation component used by both responsive shells.
          if(!document.getElementById('nvBottomNav')){
            const navMarkup = '<nav aria-label="Main navigation" class="fixed bottom-0 left-0 right-0 z-[99990] grid grid-cols-3 border-t border-cyan-900/60 bg-[#040e1d]/95 backdrop-blur-xl px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,.35)]" id="nvBottomNav"><button aria-current="page" class="nv-tab flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-cyan-300" data-nv-tab="messages" type="button"><span class="text-xl leading-none">💬</span><span class="text-[11px] sm:text-xs font-semibold">Messages</span></button><button class="nv-tab flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-slate-400 hover:text-amber-300" data-nv-tab="memories" type="button"><span class="text-xl leading-none">📸</span><span class="text-[11px] sm:text-xs font-semibold text-center">Navodaya Memories</span></button><button class="nv-tab flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-slate-400 hover:text-cyan-300" data-nv-tab="creativity" type="button"><span class="text-xl leading-none">🎨</span><span class="text-[11px] sm:text-xs font-semibold text-center">Navodaya Creativity</span></button></nav>';
            document.body.insertAdjacentHTML('beforeend', navMarkup);
          }

          const nav=document.getElementById('nvBottomNav'); if(!nav)return;
          const main=document.querySelector('main');
          const tabView=document.getElementById('nvTabView');
          const memories=document.getElementById('nvMemoriesPanel');
          const creativity=document.getElementById('nvCreativityPanel');
          function setDisplay(el, value){ if(!el)return; if(value==='') el.style.removeProperty('display'); else el.style.setProperty('display',value,'important'); }
          function activate(name){
            const messages=name==='messages';
            // Hide the complete chat page, not just its contents. The original .flex
            // class overrides the HTML hidden attribute, so use explicit display styles.
            setDisplay(main, messages ? '' : 'none');
            setDisplay(tabView, messages ? 'none' : 'block');
            setDisplay(memories, name==='memories' ? 'block' : 'none');
            setDisplay(creativity, name==='creativity' ? 'block' : 'none');
            nav.querySelectorAll('[data-nv-tab]').forEach(b=>{
              const on=b.dataset.nvTab===name;
              b.setAttribute('aria-current',on?'page':'false');
              b.classList.toggle('text-cyan-300',on);
              b.classList.toggle('text-slate-400',!on);
            });
            try{sessionStorage.setItem('nvActiveTab',name)}catch(e){}
            window.scrollTo({top:0,behavior:'instant'});
          }
          nav.addEventListener('click',e=>{const b=e.target.closest('[data-nv-tab]');if(b)activate(b.dataset.nvTab)});
          const avatar=document.getElementById('userHeaderAvatar');
          if(avatar){avatar.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();avatar.click()}})}
          activate('messages');
        })();

