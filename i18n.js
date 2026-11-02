// Chinese and English editions of the work archive.
const zhText={
 'Night Archive — YuiTari':'星夜档案 — 夏黎YuiTari',
 'Skip to archive':'跳到作品索引',
 'Browse the collection':'浏览作品',
 'Hami, Xinjiang / 2026':'新疆哈密 / 2026',
 'All work':'全部作品',
 'All':'全部',
 'Milky Way':'银河',
 'Star trails':'星轨',
 'Meteors':'流星',
 'Deep sky':'深空',
 'Comet':'彗星',
 'YUITARI / NIGHTSCAPE PHOTOGRAPHY':'夏黎YuiTari / 星空摄影',
 '31 PHOTOGRAPHS · 2025—2026':'31 张作品 · 2025—2026',
 'BACK TO TOP ↑':'返回顶部 ↑'
};
const zhAttrs={
 'Filter photos by subject':'按题材筛选照片',
 'Old poplar tree beneath the Milky Way':'银河下的枯树'
};
const enAttrs={'主导航':'Main navigation'};
const localizedElements=[...document.querySelectorAll('[data-zh][data-en]')].map(el=>({el,zh:el.dataset.zh,en:el.dataset.en}));
const localizedHtml=[...document.querySelectorAll('[data-zh-html]')].map(el=>({el,zh:el.dataset.zhHtml,en:el.innerHTML}));
const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
const localizedText=[];
while(walker.nextNode()){
 const node=walker.currentNode;
 if(node.parentElement?.closest('script,style,[data-zh-html]'))continue;
 const key=node.nodeValue.trim();
 if(Object.hasOwn(zhText,key))localizedText.push({node,en:node.nodeValue,zh:node.nodeValue.replace(key,zhText[key])});
}
const localizedAttrs=[];
document.querySelectorAll('[aria-label],[alt]').forEach(el=>{
 for(const attr of ['aria-label','alt']){
  if(!el.hasAttribute(attr))continue;
  const source=el.getAttribute(attr);
  localizedAttrs.push({el,attr,en:enAttrs[source]||source,zh:zhAttrs[source]||source});
 }
});
function setPortfolioLanguage(next){
 const lang=next==='en'?'en':'zh';
 window.portfolioLang=lang;
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 document.documentElement.dataset.language=lang;
 localizedElements.forEach(item=>{item.el.textContent=item[lang];});
 localizedHtml.forEach(item=>{item.el.innerHTML=item[lang];});
 localizedText.forEach(item=>{item.node.nodeValue=item[lang];});
 localizedAttrs.forEach(item=>{item.el.setAttribute(item.attr,item[lang]);});
 document.querySelectorAll('[data-lang]').forEach(button=>{
  const active=button.dataset.lang===lang;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 window.renderPortfolioArchive?.();
 try{localStorage.setItem('portfolioLang',lang)}catch{}
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-lang]');
 if(button)setPortfolioLanguage(button.dataset.lang);
});
let initial='zh';
try{initial=localStorage.getItem('portfolioLang')||'zh'}catch{}
setPortfolioLanguage(initial);
