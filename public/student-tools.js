
/* ================= أدوات الطالب السريعة ================= */

/* ================= قارئ القرآن التفاعلي للطالب ================= */
const STUDENT_QURAN_SURAHS = [
'الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'
];
const STUDENT_QURAN_RECITERS={
  alafasy:{label:'مشاري العفاسي',edition:'ar.alafasy'},
  minshawi:{label:'محمد صديق المنشاوي',edition:'ar.minshawi'},
  husary:{label:'محمود خليل الحصري',edition:'ar.husary'},
  abdulbasit:{label:'عبد الباسط عبد الصمد',edition:'ar.abdulbasitmurattal'}
};
let studentQuranState={surah:1,reciter:'alafasy',data:null,recognition:null,listening:false,hidden:false,spokenWords:0,wordIndex:0};
function studentQuranNormalize(v){return String(v||'').normalize('NFD').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[ٱأإآ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[\u06D6-\u06ED]/g,'').replace(/[^\u0621-\u064Aa-zA-Z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
function studentQuranEscape(v){return escapeHtml(String(v||''))}
function studentQuranWords(text){return String(text||'').trim().split(/\s+/).filter(Boolean)}
function studentQuranOptions(){return STUDENT_QURAN_SURAHS.map((name,i)=>'<option value="'+(i+1)+'">'+(i+1)+'. '+studentQuranEscape(name)+'</option>').join('')}
function renderStudentQuran(){
 const c=studentQuickContent(); if(!c)return;
 const reciters=Object.entries(STUDENT_QURAN_RECITERS).map(([k,r])=>'<option value="'+k+'" '+(studentQuranState.reciter===k?'selected':'')+'>'+r.label+'</option>').join('');
 c.innerHTML='<h3>📖 القرآن الكريم</h3><div class="student-quran-browser">'
 +'<div class="student-quran-toolbar"><select id="studentQuranSurah" class="student-quran-select" onchange="studentQuranLoadSurah(Number(this.value))">'+studentQuranOptions()+'</select><select id="studentQuranReciter" class="student-quran-select" onchange="studentQuranState.reciter=this.value;studentQuranLoadSurah(studentQuranState.surah)">'+reciters+'</select></div>'
 +'<div class="student-quran-actions"><button class="btn btn-primary" onclick="studentQuranLoadSurah(Number(document.getElementById(\'studentQuranSurah\').value))">فتح السورة</button><button class="btn btn-outline" onclick="studentQuranToggleHidden()">إخفاء/إظهار الآيات</button><button class="btn btn-outline student-quran-mic" id="studentQuranMicBtn" onclick="studentQuranToggleMic()">🎙️ تشغيل الميكروفون</button></div>'
 +'<div id="studentQuranStatus" class="student-quran-status">اختر سورة ثم افتحها. يمكنك القراءة مع الميكروفون أو الاستماع إلى قارئ معروف.</div><div id="studentQuranWarning" class="student-quran-warning"></div>'
 +'<div id="studentQuranContent" class="student-quran-verses" aria-live="polite"></div>'
 +'<div class="student-quran-meta">الصوت يُجلب من الإنترنت ويمكن حفظه محليًا على الجهاز مؤقتًا داخل المتصفح إلى أن تتم إضافة قاعدة بيانات.</div><button class="btn btn-secondary" id="studentQuranDownloadBtn" onclick="studentQuranCacheAudio()">⬇️ حفظ الصوت محليًا</button><div id="studentQuranAudioBox"></div></div>';
 const sel=document.getElementById('studentQuranSurah'); if(sel)sel.value=String(studentQuranState.surah);
 if(studentQuranState.data) studentQuranRenderData(); else studentQuranLoadSurah(studentQuranState.surah);
}
async function studentQuranLoadSurah(number){
 studentQuranState.surah=Math.max(1,Math.min(114,Number(number)||1)); studentQuranState.data=null; studentQuranState.spokenWords=0; studentQuranState.wordIndex=0;
 const status=document.getElementById('studentQuranStatus'), box=document.getElementById('studentQuranContent'); if(status)status.textContent='جارٍ تحميل السورة…'; if(box)box.innerHTML='';
 const rec=STUDENT_QURAN_RECITERS[studentQuranState.reciter]||STUDENT_QURAN_RECITERS.alafasy;
 try{
   const url='https://api.alquran.cloud/v1/surah/'+studentQuranState.surah+'/'+encodeURIComponent(rec.edition);
   const res=await fetch(url,{cache:'force-cache'}); if(!res.ok)throw new Error('فشل تحميل السورة'); const json=await res.json();
   if(!json?.data?.ayahs)throw new Error('بيانات السورة غير مكتملة');
   studentQuranState.data=json.data; studentQuranRenderData(); if(status)status.textContent='تم فتح سورة '+json.data.name+' — يمكنك الاستماع أو القراءة.';
 }catch(e){if(status)status.textContent='تعذر تحميل السورة من الإنترنت. تحقق من الاتصال ثم حاول مرة أخرى.';}
}
function studentQuranRenderData(){
 const box=document.getElementById('studentQuranContent'), audioBox=document.getElementById('studentQuranAudioBox'); if(!box||!studentQuranState.data)return;
 const ayahs=studentQuranState.data.ayahs||[]; let global=0;
 box.classList.toggle('student-quran-hidden',!!studentQuranState.hidden);
 box.innerHTML=ayahs.map((a,ai)=>{const words=studentQuranWords(a.text).map(w=>{const idx=global++;return '<span class="student-quran-word '+(idx<studentQuranState.spokenWords?'is-word-spoken ':'')+(idx===studentQuranState.wordIndex?'is-word-current ':'')+'" data-qword="'+idx+'">'+studentQuranEscape(w)+'</span>'}).join(' ');return '<div class="student-quran-ayah '+(ai===studentQuranCurrentAyahIndex()?'is-current ':'')+'" data-qayah="'+ai+'">'+words+' <small>۝'+a.numberInSurah+'</small></div>'}).join('');
 const firstAudio=ayahs.find(a=>a.audio)?.audio; if(audioBox&&firstAudio){audioBox.innerHTML='<audio class="student-quran-audio" controls preload="none"><source src="'+studentQuranEscape(firstAudio)+'" type="audio/mpeg">المتصفح لا يدعم تشغيل الصوت.</audio>'}
}
function studentQuranCurrentAyahIndex(){let n=0,target=studentQuranState.wordIndex;for(let i=0;i<(studentQuranState.data?.ayahs||[]).length;i++){const count=studentQuranWords(studentQuranState.data.ayahs[i].text).length;if(target<n+count)return i;n+=count}return 0}
function studentQuranToggleHidden(){studentQuranState.hidden=!studentQuranState.hidden;studentQuranRenderData();}
function studentQuranSetWarning(text){const el=document.getElementById('studentQuranWarning');if(el)el.textContent=text||'';}
function studentQuranExpectedWords(){return (studentQuranState.data?.ayahs||[]).flatMap(a=>studentQuranWords(a.text))}
function studentQuranProcessSpeech(transcript){
 const expected=studentQuranExpectedWords(); if(!expected.length)return; const heard=studentQuranNormalize(transcript).split(' ').filter(Boolean); if(!heard.length)return;
 let pointer=studentQuranState.spokenWords, matched=0, mismatch=false;
 for(const hw of heard){const ew=studentQuranNormalize(expected[pointer]); if(!ew)break; if(hw===ew || hw.includes(ew) || ew.includes(hw)){pointer++;matched++;}else{mismatch=true;break}}
 if(matched){studentQuranState.spokenWords=pointer;studentQuranState.wordIndex=Math.min(pointer,Math.max(0,expected.length-1));studentQuranRenderData();const current=document.querySelector('.student-quran-word.is-word-current');current?.scrollIntoView({block:'center',behavior:'smooth'});studentQuranSetWarning('');}
 if(mismatch){studentQuranSetWarning('⚠️ يبدو أن هناك كلمة مختلفة. راجع الكلمة الحالية وحاول مرة أخرى.'); if(navigator.vibrate)navigator.vibrate([90,60,90]);}
}
function studentQuranToggleMic(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){studentQuranSetWarning('التعرف الصوتي غير مدعوم في هذا المتصفح. استخدم متصفحًا يدعم Web Speech API.');return;}
 if(studentQuranState.listening&&studentQuranState.recognition){studentQuranState.recognition.stop();return;}
 const r=new SR(); studentQuranState.recognition=r; r.lang='ar-SA'; r.continuous=true; r.interimResults=false; r.maxAlternatives=1;
 r.onstart=()=>{studentQuranState.listening=true;const b=document.getElementById('studentQuranMicBtn');if(b)b.textContent='⏹️ إيقاف الميكروفون';studentQuranSetWarning('الميكروفون يعمل. اقرأ من الموضع الحالي.');};
 r.onresult=e=>{let text='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)text+=e.results[i][0].transcript+' ';studentQuranProcessSpeech(text)};
 r.onerror=e=>{studentQuranSetWarning(e.error==='not-allowed'?'لم يتم السماح باستخدام الميكروفون.':'تعذر تحليل الصوت: '+e.error)};
 r.onend=()=>{studentQuranState.listening=false;const b=document.getElementById('studentQuranMicBtn');if(b)b.textContent='🎙️ تشغيل الميكروفون';};
 r.start();
}
async function studentQuranOpenAudioDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('thimar-quran-audio',1);req.onupgradeneeded=()=>req.result.createObjectStore('audio');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function studentQuranCacheAudio(){
 const status=document.getElementById('studentQuranStatus'), ayahs=studentQuranState.data?.ayahs||[]; if(!ayahs.length){if(status)status.textContent='افتح سورة أولًا.';return;}
 if(status)status.textContent='جارٍ حفظ الصوت محليًا داخل المتصفح…'; try{const db=await studentQuranOpenAudioDB();let saved=0;for(const a of ayahs){if(!a.audio)continue;const key=studentQuranState.reciter+'-'+studentQuranState.surah+'-'+a.numberInSurah;let res=await fetch(a.audio);if(!res.ok)throw new Error('audio');let blob=await res.blob();await new Promise((resolve,reject)=>{const tx=db.transaction('audio','readwrite');tx.objectStore('audio').put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});saved++;}db.close();if(status)status.textContent='تم حفظ '+saved+' مقطعًا صوتيًا محليًا داخل المتصفح. يمكن تشغيلها لاحقًا من التخزين المحلي عندما تتم إضافة قاعدة البيانات.';}catch(e){if(status)status.textContent='تعذر حفظ الصوت محليًا من المصدر الحالي. يمكن الاستماع عبر الإنترنت، أو أعد المحاولة لاحقًا.';}}
const STUDENT_QUICK_CONTENT={
  dua:['اللهم أعني على ذكرك وشكرك وحسن عبادتك.','رب اشرح لي صدري ويسر لي أمري.','اللهم انفعني بما علمتني وعلمني ما ينفعني وزدني علماً.'],
  adhkar:['سبحان الله وبحمده، سبحان الله العظيم.','لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.','أستغفر الله وأتوب إليه.'],
  hadith:['قال رسول الله ﷺ: «خيركم من تعلم القرآن وعلمه».','قال رسول الله ﷺ: «من لا يَرحم لا يُرحم».','قال رسول الله ﷺ: «إنما الأعمال بالنيات».']
};
let studentTasbeehCount=Number(localStorage.getItem('studentTasbeehCount')||'0');
function studentQuickModal(){return document.getElementById('studentQuickModal')}
function studentQuickContent(){return document.getElementById('studentQuickModalContent')}
function closeStudentQuickTool(){if(studentQuranState.recognition&&studentQuranState.listening){try{studentQuranState.recognition.stop()}catch(e){}} const m=studentQuickModal(); if(m)m.classList.add('hidden');}
function studentQuickEscape(s){return escapeHtml(String(s||''));}
function studentQuickIndex(key){return Math.floor((new Date().getDate()+new Date().getMonth())%STUDENT_QUICK_CONTENT[key].length)}
function openStudentQuickTool(tool){
  if(tool==='exam'){showPage('studentExamPage');return}
  const m=studentQuickModal(), c=studentQuickContent(); if(!m||!c)return;
  m.classList.remove('hidden');
  if(tool==='quran'){
    renderStudentQuran();
  } else if(tool==='tasbeeh') renderStudentTasbeeh();
  else if(tool==='dua'||tool==='adhkar'||tool==='hadith'){
    const title=tool==='dua'?'🤲 دعاء':tool==='adhkar'?'✨ الأذكار':'📕 حديث';
    const value=STUDENT_QUICK_CONTENT[tool][studentQuickIndex(tool)];
    c.innerHTML='<h3>'+title+'</h3><div class="student-tool-main">'+studentQuickEscape(value)+'</div><button class="btn btn-outline student-tool-action" onclick="openStudentQuickTool(\''+tool+'\')">عرض آخر</button>';
  } else if(tool==='prayer'){
    c.innerHTML='<h3>🕌 مواقيت الصلاة</h3><p class="student-tool-main">يتم تحديد المواقيت حسب موقع جهازك بعد السماح بالموقع.</p><div id="studentPrayerStatus" class="student-qibla-meta">جارٍ تحديد موقعك…</div><div id="studentPrayerTimes"></div>';
    loadStudentPrayerTimes();
  } else if(tool==='qibla'){
    c.innerHTML='<h3>🧭 اتجاه القبلة</h3><p class="student-tool-main">يُحسب الاتجاه من موقعك الحالي. اسمح بالوصول إلى الموقع، ويمكنك استخدام بوصلة الجهاز عند توفرها.</p><div id="studentQiblaArrow" class="student-qibla-arrow">▲</div><div id="studentQiblaMeta" class="student-qibla-meta">جارٍ تحديد موقعك…</div><button class="btn btn-outline student-tool-action" onclick="enableStudentCompass()">تشغيل بوصلة الجهاز</button>';
    loadStudentQibla();
  }
}
function renderStudentTasbeeh(){const c=studentQuickContent(); if(!c)return;c.innerHTML='<h3>📿 التسبيح</h3><div class="student-tool-main">اضغط في أي مكان على العداد للتسبيح.</div><button type="button" class="student-tool-counter" style="width:100%;border:0;background:transparent;cursor:pointer" onclick="studentTasbeehCount++;localStorage.setItem(\'studentTasbeehCount\',studentTasbeehCount);renderStudentTasbeeh()">'+studentTasbeehCount+'</button><button class="btn btn-outline student-tool-action" onclick="studentTasbeehCount=0;localStorage.setItem(\'studentTasbeehCount\',0);renderStudentTasbeeh()">تصفير العداد</button>'}
function studentGetPosition(){return new Promise((resolve,reject)=>{if(!navigator.geolocation)return reject(new Error('الموقع غير مدعوم'));navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:12000,maximumAge:300000})})}
async function loadStudentPrayerTimes(){const status=document.getElementById('studentPrayerStatus'), box=document.getElementById('studentPrayerTimes');try{const pos=await studentGetPosition();const {latitude,longitude}=pos.coords;const d=new Date();const date=[d.getDate(),d.getMonth()+1,d.getFullYear()].join('-');const url='https://api.aladhan.com/v1/timings/'+encodeURIComponent(date)+'?latitude='+encodeURIComponent(latitude)+'&longitude='+encodeURIComponent(longitude)+'&method=3';const res=await fetch(url);if(!res.ok)throw new Error('تعذر تحميل المواقيت');const data=await res.json();const t=data.data?.timings;if(!t)throw new Error('تعذر قراءة المواقيت');status.textContent='تم تحديد المواقيت حسب موقع جهازك.';const rows=[['الفجر',t.Fajr],['الشروق',t.Sunrise],['الظهر',t.Dhuhr],['العصر',t.Asr],['المغرب',t.Maghrib],['العشاء',t.Isha]];box.innerHTML='<div class="student-prayer-grid">'+rows.map(r=>'<div class="student-prayer-item"><strong>'+r[0]+'</strong><span>'+studentQuickEscape(r[1])+'</span></div>').join('')+'</div>'}catch(e){if(status)status.textContent='تعذر تحديد الموقع أو تحميل المواقيت. اسمح للموقع باستخدام موقع الجهاز ثم حاول مرة أخرى.'}}
function studentQiblaBearing(lat,lon){const kaabaLat=21.422487,kaabaLon=39.826206;const r=Math.PI/180;const y=Math.sin((kaabaLon-lon)*r)*Math.cos(kaabaLat*r);const x=Math.cos(lat*r)*Math.sin(kaabaLat*r)-Math.sin(lat*r)*Math.cos(kaabaLat*r)*Math.cos((kaabaLon-lon)*r);return (Math.atan2(y,x)/r+360)%360}
async function loadStudentQibla(){const meta=document.getElementById('studentQiblaMeta'),arrow=document.getElementById('studentQiblaArrow');try{const pos=await studentGetPosition();const b=studentQiblaBearing(pos.coords.latitude,pos.coords.longitude);if(arrow)arrow.style.transform='rotate('+b+'deg)';if(meta)meta.textContent='اتجاه القبلة من موقعك الحالي: '+Math.round(b)+'° من الشمال.'}catch(e){if(meta)meta.textContent='تعذر تحديد الموقع. اسمح للموقع باستخدام موقع الجهاز ثم حاول مرة أخرى.'}}
async function enableStudentCompass(){try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted')throw new Error('denied')}window.addEventListener('deviceorientation',function handler(e){const heading=typeof e.webkitCompassHeading==='number'?e.webkitCompassHeading:(360-(e.alpha||0));const arrow=document.getElementById('studentQiblaArrow');const meta=document.getElementById('studentQiblaMeta');if(!arrow||!meta)return;const text=meta.textContent||'';const m=text.match(/(\d+)°/);const q=m?Number(m[1]):0;arrow.style.transform='rotate('+(q-heading)+'deg)';meta.textContent='تمت معايرة السهم مع اتجاه جهازك.'},{once:true})}catch(e){const meta=document.getElementById('studentQiblaMeta');if(meta)meta.textContent='تعذر تشغيل بوصلة الجهاز. يمكنك استخدام الاتجاه المحسوب من موقعك.'}}
document.addEventListener('click',function(e){const m=studentQuickModal();if(m&&!m.classList.contains('hidden')&&e.target===m)closeStudentQuickTool()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeStudentQuickTool()});
