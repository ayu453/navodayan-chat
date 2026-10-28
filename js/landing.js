(function(){
  var landing=document.getElementById('navodayan-landing');
  var start=document.getElementById('startNavodayanChat');
  if(start&&landing){start.addEventListener('click',function(){landing.style.display='none';document.body.style.overflow='hidden';});}
})();
