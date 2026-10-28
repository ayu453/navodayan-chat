(()=>{
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

