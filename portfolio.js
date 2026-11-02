(() => {
 const root=document.documentElement;
 function setLanguage(value){
  const lang=value==='en'?'en':'zh';
  root.lang=lang==='zh'?'zh-CN':'en';
  root.dataset.language=lang;
  document.querySelectorAll('[data-zh][data-en]').forEach(el=>{el.textContent=el.dataset[lang];});
  document.querySelectorAll('[data-zh-alt][data-en-alt]').forEach(el=>{el.alt=el.dataset[`${lang}Alt`];});
  document.querySelectorAll('[data-lang]').forEach(button=>{
   const active=button.dataset.lang===lang;
   button.classList.toggle('active',active);
   button.setAttribute('aria-pressed',String(active));
  });
  if(root.dataset.zhTitle&&root.dataset.enTitle)document.title=root.dataset[`${lang}Title`];
  try{localStorage.setItem('portfolioLang',lang)}catch{}
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-lang]');
  if(button)setLanguage(button.dataset.lang);
 });
 let lang='zh';
 try{lang=localStorage.getItem('portfolioLang')||'zh'}catch{}
 setLanguage(lang);
})();
