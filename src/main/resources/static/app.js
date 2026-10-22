const root = document.getElementById('viewRoot');
const toastEl = document.getElementById('toast');
let currentView = 'settings';
let expenses = JSON.parse(localStorage.getItem('agriExpenses') || '[]');
let activities = JSON.parse(localStorage.getItem('agriActivities') || '[]');
let inventory = JSON.parse(localStorage.getItem('agriInventory') || '[]');
let chatHistory = [];
let selectedImage = null;
let signedInUser = null;
let accountRevenue = null;
function revenueValue(){return accountRevenue===null?Number(localStorage.getItem('agriRevenue')||0):Number(accountRevenue)}
const titles = {overview:'Overview',crop:'Crop advisor',disease:'Leaf health scan',assistant:'AI farming assistant',market:'Market watch',finance:'Farm finances',calendar:'Crop calendar',inventory:'Inventory & rentals',reports:'Reports',settings:'Preferences'};
const money = n => '₹' + Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),3000)}
function go(view){currentView=view;document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));document.getElementById('crumbTitle').textContent=titles[view]||'Overview';render()}
document.getElementById('navigation').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)go(b.dataset.view)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-goto]');if(b)go(b.dataset.goto)});
document.getElementById('themeToggle').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('agriDark',document.body.classList.contains('dark'))};
if(localStorage.getItem('agriDark')==='true')document.body.classList.add('dark');
const languageSelect=document.getElementById('languageSelect');
const savedLanguage=localStorage.getItem('agriLanguage')||'English';
if(languageSelect) languageSelect.value=savedLanguage;
const AG_TRANSLATIONS = {
'தமிழ்': {
'Overview':'மேலோட்டம்','Crop advisor':'பயிர் ஆலோசகர்','Leaf health scan':'இலை ஆரோக்கியப் பரிசோதனை','AI farming assistant':'AI விவசாய உதவியாளர்','Market watch':'சந்தை நிலவரம்','Farm finances':'பண்ணை நிதி','Crop calendar':'பயிர் காலண்டர்','Inventory & rentals':'சரக்கு மற்றும் வாடகை','Reports':'அறிக்கைகள்','Preferences':'விருப்பங்கள்','Workspace':'பணியிடம்','Your farm, at a glance':'உங்கள் பண்ணை ஒரே பார்வையில்','Farm expenses':'பண்ணைச் செலவுகள்','Revenue entered':'பதிவு செய்த வருவாய்','Estimated profit':'மதிப்பிடப்பட்ட லாபம்','Planned activities':'திட்டமிட்ட பணிகள்','Get crop advice':'பயிர் ஆலோசனை பெறுங்கள்','Meet your AI assistant ↗':'AI உதவியாளரைச் சந்திக்கவும் ↗','Check a leaf':'இலையைப் பரிசோதிக்கவும்','Choose a crop':'பயிரைத் தேர்ந்தெடுக்கவும்','Track spending':'செலவுகளைக் கண்காணிக்கவும்','Explore plant health':'தாவர ஆரோக்கியத்தை அறியவும்','Match your conditions':'உங்கள் சூழலுக்கு ஏற்றதைத் தேர்ந்தெடுக்கவும்','See sample prices':'மாதிரி விலைகளைப் பார்க்கவும்','Know your numbers':'உங்கள் கணக்குகளை அறியவும்','Grow smarter,':'சிறப்பாகப் பயிரிடுங்கள்,','one season at a time.':'ஒவ்வொரு பருவத்திலும்.','Farm snapshot':'பண்ணை நிலவரம்','Your next steps':'உங்கள் அடுத்த படிகள்','Review crop suitability':'பயிர் பொருத்தத்தை மதிப்பிடுங்கள்','Check a leaf photo':'இலைப் படத்தைப் பரிசோதிக்கவும்','Record farm expenses':'பண்ணைச் செலவுகளைப் பதிவு செய்யுங்கள்','Open crop calendar →':'பயிர் காலண்டரைத் திறக்கவும் →','Recently recorded expenses':'சமீபத்தில் பதிவு செய்த செலவுகள்','Manage expenses ↗':'செலவுகளை நிர்வகிக்கவும் ↗','View reports ↗':'அறிக்கைகளைப் பார்க்கவும் ↗','Item':'பொருள்','Category':'வகை','Date':'தேதி','Amount':'தொகை','Sign in':'உள்நுழையவும்','Create farmer account':'விவசாயி கணக்கை உருவாக்கவும்','Full name':'முழுப் பெயர்','Email':'மின்னஞ்சல்','Password (10+ characters)':'கடவுச்சொல் (குறைந்தது 10 எழுத்துகள்)','Preferred language':'விரும்பும் மொழி','Display':'காட்சி','Toggle light / dark mode':'ஒளி / இருள் தோற்றத்தை மாற்றவும்','Local demo data':'உள்ளூர் மாதிரி தரவு','Clear local demo data':'உள்ளூர் மாதிரி தரவை அழிக்கவும்','Send ↗':'அனுப்பு ↗','Clear conversation':'உரையாடலை அழிக்கவும்','Ask a question':'கேள்வி கேளுங்கள்','Need a hand?':'உதவி வேண்டுமா?','Your farm ledger is ready when you are. Add your first expense to see it here.':'உங்கள் பண்ணை கணக்கு தயாராக உள்ளது. இங்கே காண முதல் செலவைச் சேர்க்கவும்.','Tell us about your field':'உங்கள் நிலத்தைப் பற்றி சொல்லுங்கள்','Find a crop that fits your farm':'உங்கள் பண்ணைக்கு ஏற்ற பயிரைக் கண்டறியுங்கள்','Share a few details to see preliminary crop options. Local conditions and expert advice still matter.':'பயிர் பரிந்துரைகளைப் பெற சில விவரங்களைப் பகிரவும். உள்ளூர் சூழலும் நிபுணர் ஆலோசனையும் முக்கியம்.','Save':'சேமிக்கவும்','Cancel':'ரத்து செய்யவும்','Delete':'நீக்கவும்','Add':'சேர்க்கவும்','Search':'தேடவும்','Loading…':'ஏற்றப்படுகிறது…','No data yet':'இன்னும் தரவு இல்லை','TUESDAY, YOUR FARM WORKSPACE':'செவ்வாய்க்கிழமை, உங்கள் பண்ணைப் பணியிடம்','YOUR FARMING COMPANION':'உங்கள் விவசாயத் துணை','A little care today. A better harvest tomorrow.':'இன்று சிறு கவனம். நாளை சிறந்த அறுவடை.','Your farm at a glance — thoughtful tools to help you make informed decisions.':'உங்கள் பண்ணை நிலவரம் — சிறந்த முடிவுகளுக்கு உதவும் கருவிகள்.','Illustrative weekly activity':'வாராந்திர செயல்பாட்டு எடுத்துக்காட்டு','Sample visualization':'மாதிரி காட்சிப்படுத்தல்','Small steps, steady progress':'சிறிய படிகள், தொடர்ச்சியான முன்னேற்றம்','Start with soil, season, and water.':'மண், பருவம், நீர் ஆகியவற்றில் தொடங்குங்கள்.','Use a model only when configured.':'அமைத்த பிறகே மாதிரியைப் பயன்படுத்தவும்.','Keep your estimates up to date.':'உங்கள் மதிப்பீடுகளைப் புதுப்பித்து வைத்திருங்கள்.'
},
'తెలుగు': {
'Overview':'సారాంశం','Crop advisor':'పంట సలహాదారు','Leaf health scan':'ఆకు ఆరోగ్య పరీక్ష','AI farming assistant':'AI వ్యవసాయ సహాయకుడు','Market watch':'మార్కెట్ సమాచారం','Farm finances':'వ్యవసాయ ఆర్థికాలు','Crop calendar':'పంట క్యాలెండర్','Inventory & rentals':'నిల్వలు మరియు అద్దెలు','Reports':'నివేదికలు','Preferences':'ప్రాధాన్యతలు','Workspace':'పని స్థలం','Your farm, at a glance':'మీ వ్యవసాయం ఒక చూపులో','Farm expenses':'వ్యవసాయ ఖర్చులు','Revenue entered':'నమోదైన ఆదాయం','Estimated profit':'అంచనా లాభం','Planned activities':'ప్రణాళిక పనులు','Get crop advice':'పంట సలహా పొందండి','Meet your AI assistant ↗':'AI సహాయకుడిని చూడండి ↗','Check a leaf':'ఆకును పరీక్షించండి','Choose a crop':'పంటను ఎంచుకోండి','Track spending':'ఖర్చులను ట్రాక్ చేయండి','Explore plant health':'మొక్కల ఆరోగ్యాన్ని చూడండి','Match your conditions':'మీ పరిస్థితులకు సరిపోల్చండి','See sample prices':'నమూనా ధరలను చూడండి','Know your numbers':'మీ లెక్కలను తెలుసుకోండి','Farm snapshot':'వ్యవసాయ స్థితి','Your next steps':'మీ తదుపరి చర్యలు','Review crop suitability':'పంట అనుకూలతను పరిశీలించండి','Check a leaf photo':'ఆకు ఫోటోను పరీక్షించండి','Record farm expenses':'వ్యవసాయ ఖర్చులను నమోదు చేయండి','Open crop calendar →':'పంట క్యాలెండర్ తెరవండి →','Recently recorded expenses':'ఇటీవల నమోదు చేసిన ఖర్చులు','Manage expenses ↗':'ఖర్చులను నిర్వహించండి ↗','View reports ↗':'నివేదికలను చూడండి ↗','Item':'వస్తువు','Category':'వర్గం','Date':'తేదీ','Amount':'మొత్తం','Sign in':'సైన్ ఇన్','Create farmer account':'రైతు ఖాతాను సృష్టించండి','Full name':'పూర్తి పేరు','Email':'ఇమెయిల్','Preferred language':'ఇష్టమైన భాష','Display':'ప్రదర్శన','Save':'సేవ్ చేయండి','Cancel':'రద్దు చేయండి','Delete':'తొలగించండి','Add':'జోడించండి','Search':'వెతకండి','Loading…':'లోడ్ అవుతోంది…','No data yet':'ఇంకా డేటా లేదు','Tell us about your field':'మీ పొలం గురించి చెప్పండి','Find a crop that fits your farm':'మీ పొలానికి సరిపోయే పంటను కనుగొనండి'
},
'മലയാളം': {
'Overview':'അവലോകനം','Crop advisor':'വിള ഉപദേഷ്ടാവ്','Leaf health scan':'ഇല ആരോഗ്യ പരിശോധന','AI farming assistant':'AI കൃഷി സഹായി','Market watch':'വിപണി വിവരം','Farm finances':'കൃഷി ധനകാര്യം','Crop calendar':'വിള കലണ്ടർ','Inventory & rentals':'ശേഖരവും വാടകയും','Reports':'റിപ്പോർട്ടുകൾ','Preferences':'മുൻഗണനകൾ','Workspace':'പ്രവർത്തന സ്ഥലം','Your farm, at a glance':'നിങ്ങളുടെ കൃഷി ഒറ്റനോട്ടത്തിൽ','Farm expenses':'കൃഷി ചെലവുകൾ','Revenue entered':'രേഖപ്പെടുത്തിയ വരുമാനം','Estimated profit':'കണക്കാക്കിയ ലാഭം','Planned activities':'ആസൂത്രിത പ്രവർത്തനങ്ങൾ','Get crop advice':'വിള ഉപദേശം നേടുക','Meet your AI assistant ↗':'AI സഹായിയെ കാണുക ↗','Check a leaf':'ഒരു ഇല പരിശോധിക്കുക','Choose a crop':'ഒരു വിള തിരഞ്ഞെടുക്കുക','Track spending':'ചെലവുകൾ നിരീക്ഷിക്കുക','Explore plant health':'സസ്യാരോഗ്യം പരിശോധിക്കുക','Farm snapshot':'കൃഷിയുടെ സംഗ്രഹം','Your next steps':'നിങ്ങളുടെ അടുത്ത ഘട്ടങ്ങൾ','Review crop suitability':'വിളയുടെ അനുയോജ്യത പരിശോധിക്കുക','Check a leaf photo':'ഇലയുടെ ചിത്രം പരിശോധിക്കുക','Record farm expenses':'കൃഷി ചെലവുകൾ രേഖപ്പെടുത്തുക','Open crop calendar →':'വിള കലണ്ടർ തുറക്കുക →','Recently recorded expenses':'സമീപകാല ചെലവുകൾ','Manage expenses ↗':'ചെലവുകൾ നിയന്ത്രിക്കുക ↗','View reports ↗':'റിപ്പോർട്ടുകൾ കാണുക ↗','Item':'ഇനം','Category':'വിഭാഗം','Date':'തീയതി','Amount':'തുക','Sign in':'സൈൻ ഇൻ','Create farmer account':'കർഷക അക്കൗണ്ട് സൃഷ്ടിക്കുക','Full name':'പൂർണ്ണ പേര്','Email':'ഇമെയിൽ','Preferred language':'ഇഷ്ടപ്പെട്ട ഭാഷ','Display':'പ്രദർശനം','Save':'സേവ് ചെയ്യുക','Cancel':'റദ്ദാക്കുക','Delete':'നീക്കം ചെയ്യുക','Add':'ചേർക്കുക','Search':'തിരയുക','Loading…':'ലോഡ് ചെയ്യുന്നു…','No data yet':'ഡാറ്റയില്ല','Tell us about your field':'നിങ്ങളുടെ വയലിനെക്കുറിച്ച് പറയൂ','Find a crop that fits your farm':'നിങ്ങളുടെ കൃഷിക്ക് അനുയോജ്യമായ വിള കണ്ടെത്തുക'
},
'ಕನ್ನಡ': {
'Overview':'ಅವಲೋಕನ','Crop advisor':'ಬೆಳೆ ಸಲಹೆಗಾರ','Leaf health scan':'ಎಲೆ ಆರೋಗ್ಯ ಪರಿಶೀಲನೆ','AI farming assistant':'AI ಕೃಷಿ ಸಹಾಯಕ','Market watch':'ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ','Farm finances':'ಕೃಷಿ ಹಣಕಾಸು','Crop calendar':'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್','Inventory & rentals':'ದಾಸ್ತಾನು ಮತ್ತು ಬಾಡಿಗೆ','Reports':'ವರದಿಗಳು','Preferences':'ಆದ್ಯತೆಗಳು','Workspace':'ಕಾರ್ಯಸ್ಥಳ','Your farm, at a glance':'ನಿಮ್ಮ ಕೃಷಿ ಒಂದೇ ನೋಟದಲ್ಲಿ','Farm expenses':'ಕೃಷಿ ವೆಚ್ಚಗಳು','Revenue entered':'ನಮೂದಿಸಿದ ಆದಾಯ','Estimated profit':'ಅಂದಾಜು ಲಾಭ','Planned activities':'ಯೋಜಿತ ಚಟುವಟಿಕೆಗಳು','Get crop advice':'ಬೆಳೆ ಸಲಹೆ ಪಡೆಯಿರಿ','Meet your AI assistant ↗':'AI ಸಹಾಯಕನನ್ನು ಭೇಟಿ ಮಾಡಿ ↗','Check a leaf':'ಎಲೆಯನ್ನು ಪರಿಶೀಲಿಸಿ','Choose a crop':'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ','Track spending':'ವೆಚ್ಚಗಳನ್ನು ಗಮನಿಸಿ','Farm snapshot':'ಕೃಷಿ ಸ್ಥಿತಿಗತಿ','Your next steps':'ನಿಮ್ಮ ಮುಂದಿನ ಹಂತಗಳು','Review crop suitability':'ಬೆಳೆ ಸೂಕ್ತತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ','Check a leaf photo':'ಎಲೆಯ ಚಿತ್ರ ಪರಿಶೀಲಿಸಿ','Record farm expenses':'ಕೃಷಿ ವೆಚ್ಚ ದಾಖಲಿಸಿ','Open crop calendar →':'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ ತೆರೆಯಿರಿ →','Recently recorded expenses':'ಇತ್ತೀಚಿನ ವೆಚ್ಚಗಳು','Manage expenses ↗':'ವೆಚ್ಚ ನಿರ್ವಹಿಸಿ ↗','View reports ↗':'ವರದಿಗಳನ್ನು ನೋಡಿ ↗','Item':'ವಸ್ತು','Category':'ವರ್ಗ','Date':'ದಿನಾಂಕ','Amount':'ಮೊತ್ತ','Sign in':'ಸೈನ್ ಇನ್','Create farmer account':'ರೈತರ ಖಾತೆ ರಚಿಸಿ','Full name':'ಪೂರ್ಣ ಹೆಸರು','Email':'ಇಮೇಲ್','Preferred language':'ಆದ್ಯತೆಯ ಭಾಷೆ','Display':'ಪ್ರದರ್ಶನ','Save':'ಉಳಿಸಿ','Cancel':'ರದ್ದುಮಾಡಿ','Delete':'ಅಳಿಸಿ','Add':'ಸೇರಿಸಿ','Search':'ಹುಡುಕಿ','Loading…':'ಲೋಡ್ ಆಗುತ್ತಿದೆ…','No data yet':'ಇನ್ನೂ ಮಾಹಿತಿ ಇಲ್ಲ','Tell us about your field':'ನಿಮ್ಮ ಹೊಲದ ಬಗ್ಗೆ ತಿಳಿಸಿ','Find a crop that fits your farm':'ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ಹೊಂದುವ ಬೆಳೆಯನ್ನು ಹುಡುಕಿ'
},
'हिन्दी': {
'Overview':'अवलोकन','Crop advisor':'फसल सलाहकार','Leaf health scan':'पत्ती स्वास्थ्य जाँच','AI farming assistant':'AI कृषि सहायक','Market watch':'बाज़ार जानकारी','Farm finances':'खेती का वित्त','Crop calendar':'फसल कैलेंडर','Inventory & rentals':'भंडार और किराया','Reports':'रिपोर्ट','Preferences':'प्राथमिकताएँ','Workspace':'कार्यस्थल','Your farm, at a glance':'आपका खेत एक नज़र में','Farm expenses':'खेती का खर्च','Revenue entered':'दर्ज आय','Estimated profit':'अनुमानित लाभ','Planned activities':'नियोजित गतिविधियाँ','Get crop advice':'फसल सलाह लें','Meet your AI assistant ↗':'AI सहायक से मिलें ↗','Check a leaf':'पत्ती जाँचें','Choose a crop':'फसल चुनें','Track spending':'खर्च पर नज़र रखें','Farm snapshot':'खेत का विवरण','Your next steps':'आपके अगले कदम','Review crop suitability':'फसल की उपयुक्तता जाँचें','Check a leaf photo':'पत्ती की तस्वीर जाँचें','Record farm expenses':'खेती का खर्च दर्ज करें','Open crop calendar →':'फसल कैलेंडर खोलें →','Recently recorded expenses':'हाल में दर्ज खर्च','Manage expenses ↗':'खर्च प्रबंधित करें ↗','View reports ↗':'रिपोर्ट देखें ↗','Item':'वस्तु','Category':'श्रेणी','Date':'तारीख','Amount':'राशि','Sign in':'साइन इन','Create farmer account':'किसान खाता बनाएँ','Full name':'पूरा नाम','Email':'ईमेल','Preferred language':'पसंदीदा भाषा','Display':'प्रदर्शन','Save':'सहेजें','Cancel':'रद्द करें','Delete':'हटाएँ','Add':'जोड़ें','Search':'खोजें','Loading…':'लोड हो रहा है…','No data yet':'अभी कोई डेटा नहीं','Tell us about your field':'अपने खेत के बारे में बताएँ','Find a crop that fits your farm':'अपने खेत के अनुकूल फसल खोजें'
}
};
function applyLanguage(){
  const lang=languageSelect?.value||localStorage.getItem('agriLanguage')||'English';
  localStorage.setItem('agriLanguage',lang);
  const translations=AG_TRANSLATIONS[lang]||{};
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    if(!n.parentElement || n.parentElement.closest('script,style')) return;
    if(n.__agriOriginal===undefined) n.__agriOriginal=n.nodeValue;
    const original=n.__agriOriginal;
    const trimmed=original.trim();
    if(!trimmed) return;
    let translated=translations[trimmed];
    if(!translated){
      translated=trimmed;
      Object.keys(translations).sort((a,b)=>b.length-a.length).forEach(key=>{
        translated=translated.split(key).join(translations[key]);
      });
    }
    n.nodeValue=original.replace(trimmed,translated);
  });
  document.querySelectorAll('[placeholder]').forEach(el=>{
    if(el.dataset.agriOriginalPlaceholder===undefined)el.dataset.agriOriginalPlaceholder=el.placeholder;
    const original=el.dataset.agriOriginalPlaceholder;
    el.placeholder=translations[original]||original;
  });
  document.querySelectorAll('input[type="submit"],button[title],select[aria-label]').forEach(el=>{
    if(el.dataset.agriOriginalTitle===undefined)el.dataset.agriOriginalTitle=el.title||el.getAttribute('aria-label')||'';
    const original=el.dataset.agriOriginalTitle;
    if(el.title)el.title=translations[original]||original;
    if(el.hasAttribute('aria-label'))el.setAttribute('aria-label',translations[original]||original);
  });
  const crumb=document.getElementById('crumbTitle');
  if(crumb){const original=titles[currentView]||'Overview';crumb.textContent=translations[original]||original;}
  const settingsLanguage=document.getElementById('settingsLanguage');
  if(settingsLanguage && settingsLanguage.value!==lang)settingsLanguage.value=lang;
}

if(languageSelect) languageSelect.addEventListener('change',()=>{
  localStorage.setItem('agriLanguage',languageSelect.value);
  const settingsLanguage=document.getElementById('settingsLanguage');
  if(settingsLanguage)settingsLanguage.value=languageSelect.value;
  render();
  toast(languageSelect.value==='English'?'Language changed to English.':'Language changed to '+languageSelect.value+'.');
});

const agriLanguageObserver = new MutationObserver(records=>{
  if((languageSelect?.value||'English')!=='English' && records.some(r=>r.addedNodes.length)){
    applyLanguage();
  }
});
agriLanguageObserver.observe(document.getElementById('viewRoot')||document.body,{childList:true,subtree:true});

function head(eyebrow,title,desc,button=''){return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${desc}</p></div>${button}</div>`}
function cardHead(title,desc='',action=''){return `<div class="card-head"><div><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div>${action}</div>`}
function metric(icon,label,value,foot){return `<div class="metric"><div class="metric-top"><span>${label}</span><span class="metric-icon">${icon}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div>`}
function totalExpenses(){return expenses.reduce((s,e)=>s+Number(e.amount||0),0)}
function overview(){
const total=totalExpenses(), revenue=revenueValue();
return `${head('TUESDAY, YOUR FARM WORKSPACE','A little care today. A better harvest tomorrow.','Your farm at a glance — thoughtful tools to help you make informed decisions.','<button class="btn btn-primary" data-goto="crop">✳ Get crop advice</button>')}
<div class="hero"><div class="hero-content"><div class="eyebrow">YOUR FARMING COMPANION</div><h2>Grow smarter,<br>one season at a time.</h2><p>Make confident decisions with practical crop guidance, farm records, and a little help whenever you need it.</p><button class="btn" data-goto="assistant">Meet your AI assistant ↗</button></div><div class="hero-art">🌾</div></div>
<div class="metrics">${metric('♧','Farm expenses',money(total),'<strong>Live total</strong> from your saved entries')}${metric('↗','Revenue entered',money(revenue),'Add your sales in Farm finances')}${metric('◉','Estimated profit',money(revenue-total),'Revenue minus recorded expenses')}${metric('▦','Planned activities',activities.length, 'Activities saved on this device')}</div>
<div class="quick-actions"><button class="quick" data-goto="disease"><span class="quick-icon">🍃</span><span><b>Check a leaf</b><small>Explore plant health</small></span></button><button class="quick" data-goto="crop"><span class="quick-icon">🌱</span><span><b>Choose a crop</b><small>Match your conditions</small></span></button><button class="quick" data-goto="market"><span class="quick-icon">↗</span><span><b>Market watch</b><small>See sample prices</small></span></button><button class="quick" data-goto="finance"><span class="quick-icon">₹</span><span><b>Track spending</b><small>Know your numbers</small></span></button></div>
<div class="grid-main"><div class="card">${cardHead('Farm snapshot','A simple view of your current records','<button class="link-button" data-goto="reports">View reports ↗</button>')}<div class="chart-area">${[35,53,43,70,48,82,60].map((v,i)=>`<div class="bar-group"><div class="bar" style="height:${v}%"></div><span class="bar-label">${['M','T','W','T','F','S','S'][i]}</span></div>`).join('')}</div><div class="chart-legend"><span>Illustrative weekly activity</span><b>Sample visualization</b></div></div>
<div class="card">${cardHead('Your next steps','Small steps, steady progress')}<div class="activity-list"><div class="activity"><div class="activity-icon">🌿</div><div><b>Review crop suitability</b><p>Start with soil, season, and water.</p></div></div><div class="activity"><div class="activity-icon">📷</div><div><b>Check a leaf photo</b><p>Use a model only when configured.</p></div></div><div class="activity"><div class="activity-icon">🧾</div><div><b>Record farm expenses</b><p>Keep your estimates up to date.</p></div></div></div><button class="btn btn-soft" style="margin-top:18px" data-goto="calendar">Open crop calendar →</button></div></div>
<div class="card">${cardHead('Recently recorded expenses','Your entries are saved in this browser','<button class="link-button" data-goto="finance">Manage expenses ↗</button>')}${expenses.length?`<div class="table-wrap"><table><thead><tr><th>Item</th><th>Category</th><th>Date</th><th>Amount</th></tr></thead><tbody>${expenses.slice(-4).reverse().map(e=>`<tr><td><b>${esc(e.item)}</b></td><td>${esc(e.category)}</td><td>${esc(e.date)}</td><td><b>${money(e.amount)}</b></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Your farm ledger is ready when you are. Add your first expense to see it here.</div>'}</div>`;
}
function cropView(){return `${head('MAKE AN INFORMED CHOICE','Find a crop that fits your farm','Share a few details to see preliminary crop options. Local conditions and expert advice still matter.')}
<div class="grid-main"><div class="card">${cardHead('Tell us about your field','A few details help narrow the options')}<form id="cropForm"><div class="form-grid"><div class="field"><label for="soil">Soil type</label><select id="soil"><option value="loamy">Loamy</option><option value="clay">Clay-rich</option><option value="sandy">Sandy</option><option value="black">Black soil</option><option value="red">Red soil</option></select></div><div class="field"><label for="season">Season</label><select id="season"><option value="monsoon">Monsoon</option><option value="summer">Summer</option><option value="winter">Winter</option></select></div><div class="field"><label for="water">Water availability</label><select id="water"><option value="medium">Moderate</option><option value="low">Limited</option><option value="high">Plentiful</option></select></div><div class="field"><label for="region">Region / district</label><input id="region" placeholder="e.g. Thanjavur"></div></div><div class="form-actions"><button class="btn btn-primary">Find suitable options ↗</button><button class="btn btn-line" type="reset">Reset</button></div></form><div id="cropResult"></div></div><div class="card">${cardHead('Before you plant','A good recommendation is local')}<div class="activity-list"><div class="activity"><div class="activity-icon">🧪</div><div><b>Start with a soil test</b><p>Nutrient levels and pH can change the right choice.</p></div></div><div class="activity"><div class="activity-icon">🌦️</div><div><b>Check your local forecast</b><p>Rain and temperature matter as much as the season.</p></div></div><div class="activity"><div class="activity-icon">🤝</div><div><b>Ask a local expert</b><p>Confirm variety, sowing window, and local market demand.</p></div></div></div></div></div>`}
function diseaseView(){return `${head('PLANT HEALTH','A closer look at your leaf','Upload a clear leaf photo to prepare it for disease analysis. A real prediction requires a trained model to be installed.')}
<div class="grid-main"><div class="card">${cardHead('Leaf health scanner','Good light and a clear image improve analysis')}<div class="upload-zone" id="dropZone"><div class="upload-icon">📷</div><h3>Bring your leaf into focus</h3><p>Choose a JPG, PNG, or WEBP image. Try to include the affected area and avoid blurry photos.</p><input id="leafFile" type="file" accept="image/png,image/jpeg,image/webp" style="max-width:220px;font-size:10px"><div id="imagePreview"></div><button class="btn btn-primary" id="scanBtn">Analyze leaf image ↗</button></div><div id="scanResult"></div></div><div class="card">${cardHead('For a useful photo','Before you upload')}<div class="activity-list"><div class="activity"><div class="activity-icon">☀️</div><div><b>Natural light</b><p>Take a sharp photo in even daylight.</p></div></div><div class="activity"><div class="activity-icon">🍃</div><div><b>Show the whole leaf</b><p>Include both healthy and affected areas if possible.</p></div></div><div class="activity"><div class="activity-icon">🧑‍🌾</div><div><b>Confirm before treatment</b><p>Image models can be wrong. Ask an agriculture expert before using chemicals.</p></div></div></div><div class="notice" style="margin-top:18px">Honest mode: configured AI vision can suggest possibilities, but it is not a validated disease classifier. A local ONNX/DJL model is not installed.</div></div></div>`}
function assistantView(){return `${head('HERE WHEN YOU NEED A HAND','Ask away. Farming or otherwise.','Ask a question naturally in Tamil or English. Live AI answers require an API key; without one, the app will tell you clearly.')}
<div class="chat-layout"><div class="card chat-card"><div class="chat-head"><div class="ai-avatar">✳</div><div><b>AgriConnect assistant</b><small>Curious questions welcome · Be kind to your crops</small></div><span class="pill">AI setup-aware</span></div><div class="chat-messages" id="chatMessages"><div class="message"><div class="ai-avatar">✳</div><div class="bubble">Vanakkam! 🌱 I'm your AgriConnect assistant. Ask me about farming, crop choices, soil, expenses, everyday questions, or how to use this app. I'll be clear when I don't know something.<small>AgriConnect assistant</small></div></div></div><form class="chat-compose" id="chatForm"><input id="chatInput" placeholder="Ask anything… e.g. How can I improve my soil?" autocomplete="off" required><button class="btn btn-primary" id="sendChat">Send ↗</button></form></div><div class="chat-aside"><div class="card">${cardHead('Try asking')}<button class="suggestion" data-prompt="How do I choose a crop for low water availability?">🌱 Crop for low water?<span>Crop planning</span></button><button class="suggestion" data-prompt="What can cause yellow spots on tomato leaves?">🍃 Yellow spots on tomato leaves?<span>Plant health</span></button><button class="suggestion" data-prompt="How do I calculate profit from my harvest?">₹ How do I calculate profit?<span>Farm finances</span></button><button class="suggestion" data-prompt="Explain crop rotation in simple Tamil.">💬 Explain crop rotation in simple Tamil<span>Learn something</span></button></div><div class="card">${cardHead('A note on answers')}<p style="font-size:11px;line-height:1.7;color:var(--muted)">The assistant can make mistakes. Live weather and market data are not assumed. For crop disease or pesticide decisions, confirm with a qualified local agriculture professional.</p><button class="btn btn-line" id="clearChat">Clear conversation</button></div></div></div>`}
const samplePrices=[['Tomato','Koyambedu (sample)','₹2,400','Per quintal','Sample record'],['Paddy','Thanjavur (sample)','₹2,183','Per quintal','Sample record'],['Onion','Chennai (sample)','₹1,800','Per quintal','Sample record'],['Groundnut','Villupuram (sample)','₹6,200','Per quintal','Sample record']];
function marketView(){return `${head('SELL WITH MORE CONTEXT','Market & weather','Live weather is available from Open-Meteo. Live mandi prices require a data.gov.in API key.')}<div class="grid-main"><div class="card">${cardHead('Local weather','Forecast for farm planning')}<form id="weatherForm"><div class="field"><label for="weatherCity">City / district</label><input id="weatherCity" value="Chennai" maxlength="100" required></div><div class="form-actions"><button class="btn btn-primary">Get live weather ↗</button></div></form><div id="weatherResult"></div></div><div class="card">${cardHead('Live mandi prices','Source: data.gov.in / AGMARKNET')}<form id="liveMarketForm"><div class="field"><label for="marketState">State</label><input id="marketState" value="Tamil Nadu" required></div><div class="field"><label for="marketCommodity">Commodity (optional)</label><input id="marketCommodity" placeholder="e.g. Tomato"></div><div class="field"><label for="marketDistrict">District (optional)</label><input id="marketDistrict" placeholder="e.g. Thanjavur"></div><div class="form-actions"><button class="btn btn-primary">Fetch live prices ↗</button></div></form><div id="liveMarketResult"></div></div></div><div class="card" style="margin-top:16px">${cardHead('Sample price board','Development examples only; do not use for selling decisions')}<div class="notice">⚠ SAMPLE DATA ONLY · These values are not verified live prices.</div><div class="table-wrap"><table><thead><tr><th>Crop</th><th>Market</th><th>Example price</th><th>Unit</th><th>Status</th></tr></thead><tbody>${samplePrices.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td><b>${r[2]}</b></td><td>${r[3]}</td><td><span class="pill orange">${r[4]}</span></td></tr>`).join('')}</tbody></table></div></div>`}
function financeView(){return `${head('KEEP YOUR FARM BOOKS CLEAR','Farm finances','Record costs, enter sales revenue, and see a simple profit estimate. Sign in to save records to MySQL.')}<div class="metrics">${metric('₹','Total expenses',money(totalExpenses()),'Sum of saved entries')}${metric('↗','Revenue',money(revenueValue()),'Your entered sales')}${metric('∑','Estimated profit',money(revenueValue()-totalExpenses()),'Revenue − expenses')}${metric('▤','Entries',expenses.length,'Recorded cost items')}</div><div class="grid-main"><div class="card">${cardHead('Add an expense','Keep a simple record of farm spending')}<form id="expenseForm"><div class="form-grid"><div class="field"><label>Expense item</label><input name="item" placeholder="e.g. Seed purchase" required></div><div class="field"><label>Category</label><select name="category"><option>Seeds</option><option>Fertilizer</option><option>Labour</option><option>Irrigation</option><option>Equipment</option><option>Transport</option><option>Other</option></select></div><div class="field"><label>Amount (₹)</label><input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></div><div class="field"><label>Date</label><input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></div></div><div class="form-actions"><button class="btn btn-primary">＋ Save expense</button></div></form><hr style="border:0;border-top:1px solid var(--line);margin:22px 0">${cardHead('Enter revenue','Total sales/revenue for your calculation')}<form id="revenueForm"><div class="field"><label>Revenue (₹)</label><input type="number" min="0" step=".01" id="revenueInput" value="${revenueValue()}" required></div><div class="form-actions"><button class="btn btn-soft">Update estimate</button></div></form></div><div class="card">${cardHead('Your ledger','Recent saved expenses')}${expenses.length?`<div class="table-wrap"><table><thead><tr><th>Item</th><th>Amount</th><th></th></tr></thead><tbody>${expenses.slice().reverse().map((e,i)=>`<tr><td><b>${esc(e.item)}</b><br><small>${esc(e.category)} · ${esc(e.date)}</small></td><td>${money(e.amount)}</td><td><button class="link-button" data-delete-expense="${expenses.length-1-i}">Remove</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No expenses yet. Your first entry will appear here.</div>'}<div class="result-box"><b>Estimated profit/loss</b><br>${money(revenueValue()-totalExpenses())}<br><small>This is an estimate, not accounting or tax advice.</small></div></div></div>`}
function calendarView(){let now=new Date(),year=now.getFullYear(),month=now.getMonth(),days=new Date(year,month+1,0).getDate(),start=new Date(year,month,1).getDay();let cells=Array.from({length:start},()=>'<div></div>');for(let d=1;d<=days;d++){let act=activities.find(a=>a.date===`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);cells.push(`<div class="day ${act?'event':''}"><b>${d}</b>${act?`<span>${esc(act.title)}</span>`:''}</div>`)}return `${head('PLAN WITH THE SEASON','Crop calendar','Keep your own planting and activity reminders in one place. Suggested timings are not expert-verified schedules.')}<div class="grid-main"><div class="card">${cardHead(now.toLocaleString('en',{month:'long',year:'numeric'}),'Your saved reminders are highlighted')}<div class="calendar-grid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="day" style="min-height:auto;border:0;font-weight:700">${x}</div>`).join('')}${cells.join('')}</div></div><div class="card">${cardHead('Add an activity','Choose a date and keep a note')}<form id="activityForm"><div class="field"><label>Activity</label><input name="title" placeholder="e.g. Check irrigation" required></div><div class="field" style="margin-top:13px"><label>Date</label><input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></div><div class="field" style="margin-top:13px"><label>Crop (optional)</label><input name="crop" placeholder="e.g. Tomato"></div><div class="form-actions"><button class="btn btn-primary">＋ Add reminder</button></div></form><hr style="border:0;border-top:1px solid var(--line);margin:20px 0">${activities.length?activities.map((a,i)=>`<div class="activity" style="margin-bottom:12px"><div class="activity-icon">▦</div><div><b>${esc(a.title)}</b><p>${esc(a.date)} ${a.crop?'· '+esc(a.crop):''}</p></div><button class="link-button" data-delete-activity="${i}">×</button></div>`).join(''):'<div class="empty">No reminders yet.</div>'}</div></div>`}
function inventoryView(){return `${head('EVERYTHING IN ITS PLACE','Inventory & equipment','Keep a simple local list of supplies and equipment rental requests. This demo does not submit bookings to a real provider.')}<div class="grid-main"><div class="card">${cardHead('Add inventory item','Track quantity you have on hand')}<form id="inventoryForm"><div class="form-grid"><div class="field"><label>Item</label><input name="name" placeholder="e.g. Drip hose" required></div><div class="field"><label>Quantity</label><input name="qty" type="number" min="0" step=".1" required></div><div class="field"><label>Unit</label><select name="unit"><option>pieces</option><option>kg</option><option>litres</option><option>bags</option><option>metres</option></select></div><div class="field"><label>Notes</label><input name="notes" placeholder="Optional"></div></div><div class="form-actions"><button class="btn btn-primary">＋ Add item</button></div></form><hr style="border:0;border-top:1px solid var(--line);margin:22px 0">${cardHead('Your inventory','Saved on this device')}${inventory.length?inventory.map((it,i)=>`<div class="activity" style="margin:12px 0"><div class="activity-icon">▤</div><div style="flex:1"><b>${esc(it.name)}</b><p>${it.qty} ${esc(it.unit)} ${it.notes?'· '+esc(it.notes):''}</p></div><button class="link-button" data-delete-inventory="${i}">Remove</button></div>`).join(''):'<div class="empty">Your inventory list is waiting for its first item.</div>'}</div><div class="card">${cardHead('Equipment rental request','Prepare a request to discuss with a local provider')}<form id="rentalForm"><div class="field"><label>Equipment</label><select name="equipment"><option>Tractor</option><option>Power tiller</option><option>Seed drill</option><option>Sprayer</option><option>Harvester</option><option>Other</option></select></div><div class="field" style="margin-top:13px"><label>Needed on</label><input type="date" name="date" required></div><div class="field" style="margin-top:13px"><label>Location</label><input name="location" placeholder="Village / district" required></div><div class="form-actions"><button class="btn btn-primary">Prepare request ↗</button></div></form><div id="rentalResult"></div><div class="notice" style="margin-top:16px">This is a draft request only. No provider has been contacted and no booking is confirmed.</div></div></div>`}
function reportsView(){let rev=revenueValue(),exp=totalExpenses();return `${head('SEE THE BIGGER PICTURE','Farm reports','A summary generated from your current records. Export a CSV to keep a copy.','<button class="btn btn-primary" id="exportCsv">Export expenses CSV ↓</button>')}<div class="metrics">${metric('₹','Recorded expenses',money(exp),(signedInUser?'MySQL records':'Current browser records'))}${metric('₹','Entered revenue',money(rev),'Manual entry')}${metric('∑','Estimated result',money(rev-exp),rev>=exp?'Revenue exceeds expenses':'Expenses exceed entered revenue')}${metric('▤','Expense records',expenses.length,'Saved records')}</div><div class="grid-main"><div class="card">${cardHead('Expense breakdown','Grouped by category')} ${expenses.length?Object.entries(expenses.reduce((a,e)=>(a[e.category]=(a[e.category]||0)+Number(e.amount),a),{})).map(([k,v])=>`<div style="margin:17px 0"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:7px"><b>${esc(k)}</b><span>${money(v)}</span></div><div style="height:7px;background:#edf2e9;border-radius:10px;overflow:hidden"><div style="height:100%;width:${exp?Math.max(2,v/exp*100):0}%;background:#79a36a;border-radius:10px"></div></div></div>`).join(''):'<div class="empty">Add expenses to create a breakdown.</div>'}</div><div class="card">${cardHead('Report notes','Keep the numbers in context')}<div class="activity-list"><div class="activity"><div class="activity-icon">🧾</div><div><b>Expense records</b><p>${expenses.length} items ${signedInUser?'saved to MySQL':'saved in this browser'}.</p></div></div><div class="activity"><div class="activity-icon">💰</div><div><b>Profit estimate</b><p>Revenue minus expenses; not audited accounts.</p></div></div><div class="activity"><div class="activity-icon">🔒</div><div><b>Data location</b><p>${signedInUser?'Signed-in records are stored in MySQL.':'Demo records are stored in this browser until you sign in.'}</p></div></div></div></div></div>`}
function settingsView(){return `${head('MAKE IT YOURS','Account & preferences','Create a farmer account to save expense records to MySQL. Never share your password or API keys.')}<div class="grid-main"><div class="card">${cardHead('Farmer account','Registration creates a FARMER account only')}<div id="accountStatus" class="notice">${signedInUser?`Signed in as ${esc(signedInUser.fullName)} (${esc(signedInUser.email)}). Expense records can be saved in MySQL.`:'Not signed in. You can still explore the demo; sign in to save expenses to MySQL.'}</div><form id="authForm"><div class="field"><label for="authMode">Action</label><select id="authMode"><option value="login">Sign in</option><option value="register">Create farmer account</option></select></div><div class="field" id="authNameWrap" style="display:none"><label for="authName">Full name</label><input id="authName" maxlength="120" autocomplete="name"></div><div class="field"><label for="authEmail">Email</label><input id="authEmail" type="email" maxlength="190" autocomplete="email" required></div><div class="field"><label for="authPassword">Password (10+ characters)</label><input id="authPassword" type="password" minlength="10" maxlength="72" autocomplete="current-password" required></div><div class="form-actions"><button class="btn btn-primary" id="authSubmit">Sign in ↗</button><button class="btn btn-line" type="button" id="settingsLogoutBtn" ${signedInUser ? '' : 'disabled'}>Sign out</button></div></form><div id="authMessage"></div></div><div class="card">${cardHead('Your experience','Display and data settings')}<div class="field"><label>Preferred language</label><select id="settingsLanguage"><option>English</option><option>தமிழ்</option><option>తెలుగు</option><option>മലയാളം</option><option>ಕನ್ನಡ</option><option>हिन्दी</option></select></div><div class="field" style="margin-top:15px"><label>Display</label><button class="btn btn-line" id="settingsTheme">◐ Toggle light / dark mode</button></div><div class="field" style="margin-top:15px"><label>Local demo data</label><button class="btn btn-line" id="clearLocal">Clear local demo data</button></div><div class="notice" style="margin-top:16px">Use the same-origin app URL for session cookies. Admin accounts must be created by a trusted database administrator; public registration cannot create admins.</div></div><div class="card">${cardHead('Integration status','Live features and configuration')}<div id="integrationStatus">Checking app status…</div><div class="notice" style="margin-top:16px">AI responses need an API key. Live market prices need a data.gov.in key. Weather uses Open-Meteo. Leaf disease prediction still requires a compatible trained model and evaluation on real farm photos.</div></div></div>`}
function render() {
  const views = {
    overview,
    
    crop: cropView,
    disease: diseaseView,
    assistant: assistantView,
    market: marketView,
    finance: financeView,
    calendar: calendarView,
    inventory: inventoryView,
    reports: reportsView,
    settings: settingsView
  };



  
if (!signedInUser) {
  currentView = 'settings';
  document.body.classList.add('login-screen');
  root.innerHTML = settingsView();
} else {
  document.body.classList.remove('login-screen');

  if (currentView === 'settings') {
    currentView = 'overview';
  }

  root.innerHTML = (views[currentView] || overview)();
}


wireView();
applyLanguage();
forceShowLogoutButton();
  const sl = document.getElementById('settingsLanguage');
  if (sl) sl.value = localStorage.getItem('agriLanguage') || 'English';
}


function forceShowLogoutButton() {
    const actions = document.querySelector('.topbar .top-actions');
    if (!actions) return;

    // Remove the old duplicate button permanently whenever render runs
    document.getElementById('logoutBtn')?.remove();

    let btn = document.getElementById('topLogoutBtn');

    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'topLogoutBtn';
        btn.type = 'button';
        btn.textContent = 'Logout ↗';
        actions.appendChild(btn);
    }

    btn.style.cssText =
        'background:#dc2626;color:white;padding:10px 16px;' +
        'border:0;border-radius:8px;font-weight:bold;cursor:pointer;' +
        'white-space:nowrap;display:' +
        (signedInUser ? 'inline-flex' : 'none') + ';';

    if (btn.dataset.logoutReady === 'true') return;
    btn.dataset.logoutReady = 'true';

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });

            if (!response.ok) throw new Error('Logout failed');

            signedInUser = null;
            accountRevenue = null;
            currentView = 'settings';
            render();
            toast('Signed out successfully.');
        } catch (error) {
            console.error(error);
            toast('Logout failed. Please try again.');
        } finally {
            btn.disabled = false;
        }
    });
}







function wireView(){
const cropForm=document.getElementById('cropForm');if(cropForm)cropForm.onsubmit=async e=>{e.preventDefault();let data={soil:document.getElementById('soil').value,season:document.getElementById('season').value,water:document.getElementById('water').value,region:document.getElementById('region').value};let result;try{let r=await fetch('/api/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});result=await r.json()}catch{result=localRecommend(data)}document.getElementById('cropResult').innerHTML=`<div class="result-box"><b>Preliminary options</b><p>${result.crops.map(esc).join(' · ')}</p>${esc(result.reason)}<p><small>${esc(result.notice||'Confirm with local agricultural guidance.')}</small></p></div>`};
const leafFile=document.getElementById('leafFile');if(leafFile)leafFile.onchange=()=>{let f=leafFile.files[0];selectedImage=f||null;let preview=document.getElementById('imagePreview');if(!f){preview.innerHTML='';return}if(!/^image\/(jpeg|png|webp)$/.test(f.type)||f.size>8*1024*1024){selectedImage=null;leafFile.value='';preview.innerHTML='';toast('Choose a JPG, PNG, or WEBP image under 8 MB.');return}preview.innerHTML=`<img class="preview-img" src="${URL.createObjectURL(f)}" alt="Selected leaf preview"><p style="font-size:10px;color:var(--muted)">${esc(f.name)} · ${(f.size/1024).toFixed(0)} KB</p>`};
const scanBtn=document.getElementById('scanBtn');if(scanBtn)scanBtn.onclick=async()=>{let box=document.getElementById('scanResult');if(!selectedImage){box.innerHTML='<div class="result-box"><b>Choose a leaf image first</b><p>Select a JPG, PNG, or WEBP image under 8 MB.</p></div>';return}box.innerHTML='<div class="result-box"><b>Analyzing image…</b><p>Image analysis needs the configured AI API and sends the image to that external provider.</p></div>';const form=new FormData();form.append('image',selectedImage);form.append('language',document.getElementById('languageSelect')?.value||'English');try{const r=await fetch('/api/disease/analyze',{method:'POST',body:form});const d=await r.json();if(!r.ok)throw new Error(d.message||'Image analysis unavailable');box.innerHTML=`<div class="result-box"><b>Preliminary leaf analysis</b><p style="white-space:pre-wrap">${esc(d.analysis||'No analysis returned.')}</p><small>${esc(d.notice||'Confirm with an agriculture expert.')}</small><p><small>Privacy: this image was sent to the configured external AI provider for analysis.</small></p></div>`}catch(err){box.innerHTML=`<div class="result-box"><b>Could not analyze image</b><p>${esc(err.message||'Check the AI API key and whether the configured model supports images.')}</p><small>No disease result has been generated. Never treat an unavailable scan as a diagnosis.</small></div>`}};
const chatForm=document.getElementById('chatForm');if(chatForm)chatForm.onsubmit=e=>{e.preventDefault();sendChat()};
document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{let input=document.getElementById('chatInput');if(input){input.value=b.dataset.prompt;input.focus()}});
const settingsLanguage=document.getElementById('settingsLanguage');if(settingsLanguage)settingsLanguage.onchange=()=>{const mainLang=document.getElementById('languageSelect');if(mainLang){mainLang.value=settingsLanguage.value;applyLanguage();render()}};
const clearChat=document.getElementById('clearChat');if(clearChat)clearChat.onclick=()=>{chatHistory=[];const m=document.getElementById('chatMessages');if(m)m.innerHTML='<div class="message"><div class="ai-avatar">✳</div><div class="bubble">Conversation cleared. What would you like to explore next? 🌱</div></div>'};
const ef=document.getElementById('expenseForm');if(ef)ef.onsubmit=async e=>{e.preventDefault();let d=Object.fromEntries(new FormData(ef));d.amount=Number(d.amount);if(signedInUser){try{let r=await fetch('/api/expenses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});if(!r.ok)throw new Error((await r.json()).message||'Could not save expense');await loadServerExpenses();render();toast('Expense saved to MySQL.')}catch(err){toast(err.message||'Database save failed.')}}else{expenses.push(d);save('agriExpenses',expenses);render();toast('Demo expense saved only in this browser. Sign in to use MySQL.')}};
const rf=document.getElementById('revenueForm');if(rf)rf.onsubmit=async e=>{e.preventDefault();const revenue=Math.max(0,Number(document.getElementById('revenueInput').value));if(signedInUser){try{const r=await fetch('/api/finance/revenue',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revenue})});if(!r.ok)throw new Error('Could not save revenue');accountRevenue=revenue;}catch{toast('Revenue could not be saved to MySQL.');return}}else{localStorage.setItem('agriRevenue',String(revenue));accountRevenue=null}render();toast(signedInUser?'Revenue saved to MySQL.':'Revenue estimate saved in this browser.')};
document.querySelectorAll('[data-delete-expense]').forEach(b=>b.onclick=async()=>{let idx=Number(b.dataset.deleteExpense);if(signedInUser&&expenses[idx]?.id){try{let r=await fetch('/api/expenses/'+expenses[idx].id,{method:'DELETE'});if(!r.ok)throw new Error('Could not remove database record');await loadServerExpenses()}catch{toast('Could not remove this database record.');return}}else{expenses.splice(idx,1);save('agriExpenses',expenses)}render();toast('Expense removed.')});
const af=document.getElementById('activityForm');if(af)af.onsubmit=async e=>{e.preventDefault();let d=Object.fromEntries(new FormData(af));if(signedInUser){try{const r=await fetch('/api/activities',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});if(!r.ok)throw new Error('Could not save reminder');await loadServerActivities()}catch(err){toast(err.message||'Reminder save failed.');return}}else{activities.push(d);save('agriActivities',activities)}render();toast(signedInUser?'Reminder saved to MySQL.':'Reminder saved in this browser.')};
document.querySelectorAll('[data-delete-activity]').forEach(b=>b.onclick=async()=>{const idx=Number(b.dataset.deleteActivity);if(signedInUser&&activities[idx]?.id){try{const r=await fetch('/api/activities/'+activities[idx].id,{method:'DELETE'});if(!r.ok)throw new Error();await loadServerActivities()}catch{toast('Could not delete reminder.');return}}else{activities.splice(idx,1);save('agriActivities',activities)}render()});
const inf=document.getElementById('inventoryForm');if(inf)inf.onsubmit=async e=>{e.preventDefault();let f=Object.fromEntries(new FormData(inf));let it={name:f.name,qty:f.qty,unit:f.unit,notes:f.notes};if(signedInUser){try{const r=await fetch('/api/inventory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item:f.name,quantity:f.qty,unit:f.unit,notes:f.notes})});if(!r.ok)throw new Error('Could not save inventory item');await loadServerInventory()}catch(err){toast(err.message||'Inventory save failed.');return}}else{inventory.push(it);save('agriInventory',inventory)}render();toast(signedInUser?'Inventory saved to MySQL.':'Inventory saved in this browser.')};
document.querySelectorAll('[data-delete-inventory]').forEach(b=>b.onclick=async()=>{const idx=Number(b.dataset.deleteInventory);if(signedInUser&&inventory[idx]?.id){try{const r=await fetch('/api/inventory/'+inventory[idx].id,{method:'DELETE'});if(!r.ok)throw new Error();await loadServerInventory()}catch{toast('Could not delete inventory item.');return}}else{inventory.splice(idx,1);save('agriInventory',inventory)}render()});
const rent=document.getElementById('rentalForm');if(rent)rent.onsubmit=e=>{e.preventDefault();let d=Object.fromEntries(new FormData(rent));document.getElementById('rentalResult').innerHTML=`<div class="result-box"><b>Draft request prepared</b><br>${esc(d.equipment)} · ${esc(d.date)}<br>${esc(d.location)}<p>No booking has been made. Contact a local equipment provider to confirm availability.</p><button class="btn btn-soft" id="copyRental">Copy request text</button></div>`;document.getElementById('copyRental').onclick=()=>navigator.clipboard?.writeText(`Equipment rental request: ${d.equipment}, date ${d.date}, location ${d.location}`).then(()=>toast('Request copied.')).catch(()=>toast('Copy unavailable in this browser.'))};
const exp=document.getElementById('exportCsv');if(exp)exp.onclick=exportCSV;
const refresh=document.getElementById('refreshMarket');if(refresh)refresh.onclick=()=>toast('These are sample records, not live prices. Configure a verified source for live updates.');
const st=document.getElementById('settingsTheme');if(st)st.onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('agriDark',document.body.classList.contains('dark'))};
const cl=document.getElementById('clearLocal');if(cl)cl.onclick=()=>{if(confirm('Clear expenses, revenue, reminders, and inventory saved in this browser?')){['agriExpenses','agriRevenue','agriActivities','agriInventory'].forEach(k=>localStorage.removeItem(k));expenses=[];activities=[];inventory=[];render();toast('Local demo data cleared.')}};
const sl=document.getElementById('settingsLanguage');if(sl)sl.onchange=()=>{const mainLang=document.getElementById('languageSelect');if(mainLang)mainLang.value=sl.value;localStorage.setItem('agriLanguage',sl.value);render();toast('Language preference updated.')};
const authMode=document.getElementById('authMode');if(authMode){const syncAuthMode=()=>{const reg=authMode.value==='register';document.getElementById('authNameWrap').style.display=reg?'block':'none';document.getElementById('authSubmit').textContent=reg?'Create farmer account ↗':'Sign in ↗';document.getElementById('authPassword').setAttribute('autocomplete',reg?'new-password':'current-password')};authMode.onchange=syncAuthMode;syncAuthMode()}
const authForm=document.getElementById('authForm');if(authForm)authForm.onsubmit=async e=>{e.preventDefault();const mode=document.getElementById('authMode').value;const message=document.getElementById('authMessage');message.textContent='Working…';const payload={email:document.getElementById('authEmail').value,password:document.getElementById('authPassword').value,fullName:document.getElementById('authName').value,preferredLanguage:document.getElementById('languageSelect')?.value||'English'};try{const r=await fetch('/api/auth/'+(mode==='register'?'register':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.message||'Account request failed');signedInUser=d;await Promise.all([loadServerExpenses(),loadServerActivities(),loadServerInventory(),loadServerRevenue()]);render();toast(mode==='register'?'Farmer account created.':'Signed in successfully.')}catch(err){message.textContent=err.message||'Could not connect to account service.'}};

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (!logoutBtn) return;

  logoutBtn.onclick = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    signedInUser = null;
    accountRevenue = null;

    expenses = JSON.parse(
      localStorage.getItem('agriExpenses') || '[]'
    );
    activities = JSON.parse(
      localStorage.getItem('agriActivities') || '[]'
    );
    inventory = JSON.parse(
      localStorage.getItem('agriInventory') || '[]'
    );

    currentView = 'settings';
    render();
    toast('Signed out.');
  };
}

const weatherForm=document.getElementById('weatherForm');if(weatherForm)weatherForm.onsubmit=async e=>{e.preventDefault();const box=document.getElementById('weatherResult');box.textContent='Loading live forecast…';try{const r=await fetch('/api/weather?city='+encodeURIComponent(document.getElementById('weatherCity').value));const d=await r.json();if(!r.ok)throw new Error(d.message||'Weather unavailable');const c=d.current||{},daily=d.daily||{};box.innerHTML=`<div class="result-box"><b>${esc(d.city)}${d.region?', '+esc(d.region):''} · Live forecast</b><p>Temperature: ${esc(c.temperature_2m??'—')} °C · Feels like: ${esc(c.apparent_temperature??'—')} °C</p><p>Humidity: ${esc(c.relative_humidity_2m??'—')}% · Wind: ${esc(c.wind_speed_10m??'—')} km/h · Precipitation: ${esc(c.precipitation??'—')} mm</p><small>Source: ${esc(d.source)} · ${esc(d.notice)}</small></div>`}catch(err){box.textContent=err.message||'Live weather could not be loaded.'}};
const liveMarketForm=document.getElementById('liveMarketForm');if(liveMarketForm)liveMarketForm.onsubmit=async e=>{e.preventDefault();const box=document.getElementById('liveMarketResult');box.textContent='Fetching official market records…';const q=new URLSearchParams({state:document.getElementById('marketState').value});const commodity=document.getElementById('marketCommodity').value.trim(),district=document.getElementById('marketDistrict').value.trim();if(commodity)q.set('commodity',commodity);if(district)q.set('district',district);try{const r=await fetch('/api/market/live?'+q.toString());const d=await r.json();if(!r.ok)throw new Error(d.message||'Live prices unavailable');const records=d.records||[];box.innerHTML=records.length?`<div class="table-wrap"><table><thead><tr><th>Commodity</th><th>Market</th><th>Min ₹/q</th><th>Modal ₹/q</th><th>Date</th></tr></thead><tbody>${records.map(x=>`<tr><td>${esc(x.commodity||'—')}</td><td>${esc(x.market||'—')} · ${esc(x.district||'')}</td><td>${esc(x.min_price||'—')}</td><td><b>${esc(x.modal_price||'—')}</b></td><td>${esc(x.arrival_date||'—')}</td></tr>`).join('')}</tbody></table></div><small>Source: ${esc(d.source)}. ${esc(d.notice)}</small>`:`<div class="result-box">No matching records returned. Try removing the district/commodity filter.<p><small>Source: ${esc(d.source)}.</small></p></div>`}catch(err){box.innerHTML=`<div class="notice">${esc(err.message||'Live market prices unavailable.')}<p>Configure AGRICONNECT_MARKET_API_KEY on the server, then restart the app.</p></div>`}};
const status=document.getElementById('integrationStatus');if(status)fetch('/api/status').then(r=>r.json()).then(d=>{status.innerHTML=`<div class="activity"><div class="activity-icon">☕</div><div><b>Java backend</b><p>${esc(d.status)}</p></div><span class="pill">Running</span></div><div class="activity" style="margin-top:14px"><div class="activity-icon">▤</div><div><b>MySQL database</b><p>${d.databaseConnected?'Database connection successful':'MySQL not connected; run schema.sql and check credentials'}</p></div><span class="pill ${d.databaseConnected?'':'orange'}">${d.databaseConnected?'Connected':'Setup needed'}</span></div><div class="activity" style="margin-top:14px"><div class="activity-icon">✳</div><div><b>AI chat API</b><p>${d.aiConfigured?'API key detected':'API key not configured'}</p></div><span class="pill ${d.aiConfigured?'':'orange'}">${d.aiConfigured?'Configured':'Setup needed'}</span></div><div class="activity" style="margin-top:14px"><div class="activity-icon">↗</div><div><b>Live market prices</b><p>${d.marketConfigured?'Market API key detected':'Needs data.gov.in API key; sample board remains labelled'}</p></div><span class="pill ${d.marketConfigured?'':'orange'}">${d.marketConfigured?'Configured':'Setup needed'}</span></div><div class="activity" style="margin-top:14px"><div class="activity-icon">🌦️</div><div><b>Weather</b><p>${esc(d.weatherMode)} (internet required)</p></div><span class="pill">Ready</span></div><div class="activity" style="margin-top:14px"><div class="activity-icon">🍃</div><div><b>Leaf disease model</b><p>${d.aiConfigured?'AI image analysis can run; no local validated classifier is installed':'No AI key and no local trained model; image preview only'}</p></div><span class="pill orange">${d.diseaseModelConfigured?'Configured':'Not configured'}</span></div>`}).catch(()=>status.textContent='Backend status unavailable. Start the Spring Boot app.');
}
function localRecommend(d){let crops=d.water==='low'?['Pearl millet','Green gram','Groundnut']:d.soil==='clay'?['Paddy','Black gram','Sesame']:d.season==='winter'?['Tomato','Chickpea','Leafy greens']:['Groundnut','Paddy','Tomato'];return {crops,reason:'Illustrative suggestions based on the limited details entered.',notice:'Confirm local suitability with soil test results and agricultural guidance.'}}
let chatRequestPending=false;
async function sendChat(){
 if(chatRequestPending)return;
 let input=document.getElementById('chatInput'),messages=document.getElementById('chatMessages'),send=document.getElementById('sendChat');
 if(!input||!messages||!input.value.trim())return;
 let question=input.value.trim();input.value='';chatRequestPending=true;if(send)send.disabled=true;
 appendMessage(question,true);
 let loading=document.createElement('div');loading.className='message';loading.innerHTML='<div class="ai-avatar">✳</div><div class="bubble">Thinking…</div>';
 messages.appendChild(loading);messages.scrollTop=messages.scrollHeight;
 try{
   let lang=document.getElementById('languageSelect')?.value||'English';
   let r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question,language:lang})});
   let d=await r.json();loading.remove();appendMessage(d.answer||'No answer returned.',false);
 }catch{loading.remove();appendMessage((document.getElementById('languageSelect')?.value==='தமிழ்')?'Java backend-ஐ அணுக முடியவில்லை. Spring Boot இயங்குகிறதா என்று சரிபார்க்கவும்.':'I could not reach the Java backend. Make sure the Spring Boot app is running.',false)}
 finally{chatRequestPending=false;if(send)send.disabled=false}
}
function appendMessage(text,isUser){let messages=document.getElementById('chatMessages');if(!messages)return;let row=document.createElement('div');row.className='message'+(isUser?' user':'');let av=document.createElement('div');av.className='ai-avatar';av.textContent=isUser?'🌾':'✳';let bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=text;row.append(av,bubble);messages.appendChild(row);messages.scrollTop=messages.scrollHeight}
function save(key,val){localStorage.setItem(key,JSON.stringify(val))}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

checkAuth();




async function checkAuth() {
  try {
    const r = await fetch('/api/auth/me');

    if (!r.ok) {
      signedInUser = null;
      currentView = 'settings';
      render();
      return;
    }

    signedInUser = await r.json();
    render();

    try {
      await Promise.all([
        loadServerExpenses(),
        loadServerActivities(),
        loadServerInventory(),
        loadServerRevenue()
      ]);
      render();
    } catch (error) {
      console.error('Could not load saved farm data:', error);
    }
  } catch (error) {
    signedInUser = null;
    currentView = 'settings';
    render();
  }
}



async function loadServerExpenses(){if(!signedInUser)return;const r=await fetch('/api/expenses');if(!r.ok)throw new Error('Could not load saved expenses');const rows=await r.json();expenses=rows.map(x=>({id:x.id,item:x.item,category:x.category,amount:Number(x.amount),date:String(x.date).slice(0,10),crop:x.crop||'',notes:x.notes||''}));}

async function loadServerActivities(){if(!signedInUser)return;const r=await fetch('/api/activities');if(!r.ok)throw new Error('Could not load reminders');activities=(await r.json()).map(x=>({id:x.id,title:x.title,date:String(x.date).slice(0,10),crop:x.crop||'',notes:x.notes||''}));}
async function loadServerInventory(){if(!signedInUser)return;const r=await fetch('/api/inventory');if(!r.ok)throw new Error('Could not load inventory');inventory=(await r.json()).map(x=>({id:x.id,name:x.item,qty:x.quantity,unit:x.unit,notes:x.notes||''}));}
async function loadServerRevenue(){if(!signedInUser)return;const r=await fetch('/api/finance/revenue');if(!r.ok)throw new Error('Could not load revenue');const d=await r.json();accountRevenue=Number(d.revenue||0)}
