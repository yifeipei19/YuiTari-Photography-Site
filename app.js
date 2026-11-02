const photos=window.STAR_PHOTOS||[];
const archiveGrid=document.getElementById('archiveGrid');
const archiveCount=document.getElementById('archiveCount');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let expandedId=null;
let lastGridWidth=0;

function currentPhotos(){
 const category=document.querySelector('[data-filter].active')?.dataset.filter||'All';
 return photos.filter(photo=>category==='All'||photo.category===category);
}

function galleryRows(items,width){
 const gap=width<700?6:10;
 const target=width<520?180:width<900?230:290;
 const minWidth=width<520?95:135;
 const rows=[];
 let index=0;
 while(index<items.length){
  const row=[items[index++]];
  let ratioSum=row[0].width/row[0].height;
  while(index<items.length){
   const next=items[index];
   const nextRatio=next.width/next.height;
   const before=(width-gap*(row.length-1))/ratioSum;
   const after=(width-gap*row.length)/(ratioSum+nextRatio);
   if(row.some(photo=>photo.width/photo.height*after<minWidth)||nextRatio*after<minWidth)break;
   if(Math.abs(before-target)<=Math.abs(after-target))break;
   row.push(next);
   ratioSum+=nextRatio;
   index++;
  }
  const fullHeight=(width-gap*(row.length-1))/ratioSum;
  const height=index===items.length?Math.min(target,fullHeight):fullHeight;
  rows.push({photos:row,height});
 }
 return rows;
}

function photoTile(photo,height,zh){
 const title=zh?photo.zhTitle:photo.title;
 const place=zh?photo.zhPlace:photo.place;
 const width=(photo.width/photo.height)*height;
 return `<button class="archive-item" type="button" data-photo="${photo.id}" aria-expanded="false" aria-controls="archiveDetail" aria-label="${escapeHtml((zh?'查看《':'View ')+title+(zh?'》':''))}" style="width:${width.toFixed(2)}px;height:${height.toFixed(2)}px"><img src="${escapeHtml(photo.thumb)}" alt="" width="${photo.width}" height="${photo.height}" loading="lazy"><span class="archive-item-caption"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(place)}</small></span></button>`;
}

function fact(label,value,wide=false){
 if(!String(value??'').trim())return '';
 return `<div${wide?' class="wide"':''}><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function detailMarkup(photo){
 const zh=window.portfolioLang!=='en';
 const title=zh?photo.zhTitle:photo.title;
 const body=zh?photo.zhBody:photo.body;
 const facts=[
  fact(zh?'拍摄时间':'Date',photo.date),
  fact(zh?'拍摄地点':'Location',zh?photo.zhPlace:photo.place),
  fact(zh?'器材':'Equipment',photo.equipment,true),
  fact(zh?'参数':'Settings',photo.parameters,true),
  fact(zh?'荣誉与奖项':'Awards',photo.awards,true)
 ].join('');
 return `<article id="archiveDetail" class="archive-detail" aria-labelledby="detailTitle"><div class="archive-detail-image"><img src="${escapeHtml(photo.image)}" alt="${escapeHtml(title)}" width="${photo.width}" height="${photo.height}"></div><div class="archive-detail-copy"><button type="button" class="archive-detail-close" data-close-detail aria-label="${zh?'收起作品详情':'Close photo details'}">×</button><span class="archive-detail-category">${escapeHtml(zh?photo.zhCategory:photo.category)}</span><h3 id="detailTitle">${escapeHtml(title)}</h3>${zh?'':`<p class="archive-detail-original">${escapeHtml(photo.originalTitle)}</p>`}<p class="archive-detail-description">${escapeHtml(body)}</p>${facts?`<dl class="archive-detail-facts">${facts}</dl>`:''}</div></article>`;
}

function showDetail(id,{scroll=true}={}){
 const previous=archiveGrid.querySelector('[aria-expanded="true"]');
 const wasOpen=expandedId===id;
 archiveGrid.querySelector('.archive-detail')?.remove();
 previous?.setAttribute('aria-expanded','false');
 if(wasOpen){expandedId=null;return;}
 const tile=archiveGrid.querySelector(`[data-photo="${id}"]`);
 const photo=photos.find(item=>item.id===id);
 if(!tile||!photo){expandedId=null;return;}
 expandedId=id;
 tile.setAttribute('aria-expanded','true');
 tile.closest('.gallery-row').insertAdjacentHTML('afterend',detailMarkup(photo));
 if(scroll)requestAnimationFrame(()=>archiveGrid.querySelector('.archive-detail')?.scrollIntoView({behavior:'smooth',block:'nearest'}));
}

window.renderPortfolioArchive=()=>{
 if(!archiveGrid)return;
 const items=currentPhotos();
 const width=archiveGrid.clientWidth;
 if(!width)return;
 lastGridWidth=width;
 const zh=window.portfolioLang!=='en';
 archiveGrid.innerHTML=galleryRows(items,width).map(row=>`<div class="gallery-row">${row.photos.map(photo=>photoTile(photo,row.height,zh)).join('')}</div>`).join('');
 archiveCount.textContent=String(items.length).padStart(2,'0');
 const restore=expandedId;
 expandedId=null;
 if(restore&&items.some(item=>item.id===restore))showDetail(restore,{scroll:false});
};

if(archiveGrid){
 const initialCategory=new URLSearchParams(location.search).get('category');
 const initialButton=[...document.querySelectorAll('[data-filter]')].find(button=>button.dataset.filter===initialCategory);
 if(initialButton)document.querySelectorAll('[data-filter]').forEach(button=>{button.classList.toggle('active',button===initialButton);button.setAttribute('aria-pressed',String(button===initialButton));});
 window.renderPortfolioArchive();
 document.addEventListener('click',event=>{
  const tile=event.target.closest('.archive-item[data-photo]');
  if(tile){showDetail(Number(tile.dataset.photo));return;}
  if(event.target.closest('[data-close-detail]')){
   const selected=archiveGrid.querySelector('[aria-expanded="true"]');
   if(selected){showDetail(Number(selected.dataset.photo),{scroll:false});selected.focus();}
   return;
  }
  const filter=event.target.closest('[data-filter]');
  if(filter){
   document.querySelectorAll('[data-filter]').forEach(button=>{button.classList.toggle('active',button===filter);button.setAttribute('aria-pressed',String(button===filter));});
   expandedId=null;
   window.renderPortfolioArchive();
   try{
    const url=new URL(location.href);
    if(filter.dataset.filter==='All')url.searchParams.delete('category');
    else url.searchParams.set('category',filter.dataset.filter);
    history.replaceState(null,'',url.href);
   }catch{}
  }
 });
 let resizeFrame;
 window.addEventListener('resize',()=>{
  cancelAnimationFrame(resizeFrame);
  resizeFrame=requestAnimationFrame(()=>{if(Math.abs(archiveGrid.clientWidth-lastGridWidth)>1)window.renderPortfolioArchive();});
 });
}
