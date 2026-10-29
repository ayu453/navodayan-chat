(function(){
  var landing=document.getElementById('navodayan-landing');
  var start=document.getElementById('startNavodayanChat');
  var storageKey='navodayanChatLandingDismissed_v1';
  function hideLanding(){
    if(landing) landing.style.display='none';
    document.body.style.overflow='hidden';
  }
  try {
    if(localStorage.getItem(storageKey)==='1') hideLanding();
  } catch(e) {}
  if(start&&landing){
    start.addEventListener('click',function(){
      hideLanding();
      try { localStorage.setItem(storageKey,'1'); } catch(e) {}
    });
  }
})();
