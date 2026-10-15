/* Kasaade.lk – Sri Lanka's Wedding Hub  (Firebase build) */
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendPasswordResetEmail,reauthenticateWithCredential,EmailAuthProvider,deleteUser} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,collection,doc,setDoc,getDoc,getDocs,addDoc,updateDoc,deleteDoc,onSnapshot,query,where,orderBy,serverTimestamp,Timestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {getStorage,ref as sref,uploadString,getDownloadURL,deleteObject} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
import {firebaseConfig,PHOTO_MODE,SHOW_SAMPLES} from './firebase-config.js';

const LOGO='logo.webp',RINGS='rings.webp';
document.documentElement.style.setProperty('--rings',"url('"+RINGS+"')");

/* ======================= CONFIG (owner edits here) ======================= */
const PLANS=[{id:'m1',months:1,price:1000},{id:'m6',months:6,price:5000},{id:'m12',months:12,price:10000}];
const AD_PRICES={main:25000,cat:10000};            // per month, Rs. – PLACEHOLDER, to be revised
const TRIAL_MONTHS=2;
const COMPANY={name:'Anjalee Tech Solutions',email:'studioanjalee@gmail.com',phone:'+94758829317'};
/* PayHere: when your merchant account is ready, set enabled:true and implement startPayHere()
   (the hash must be created on a server with your Merchant Secret – never in this file). */
const PAYHERE={enabled:false,merchantId:'YOUR_MERCHANT_ID',sandbox:true};

/* ======================= FIREBASE ======================= */
const fbApp=initializeApp(firebaseConfig);
const auth=getAuth(fbApp);
const db=initializeFirestore(fbApp,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
let _st=null;const getSt=()=>_st||(_st=getStorage(fbApp));

/* ======================= DATA ======================= */
const CATS=[
 {id:'photo',ic:'📷',en:'Photographers',si:'ඡායාරූප ශිල්පීන්'},
 {id:'bridal',ic:'💄',en:'Bridal Dressing',si:'මනාලියන් සැරසීම'},
 {id:'venue',ic:'🏛️',en:'Venues',si:'මංගල ශාලා'},
 {id:'honey',ic:'🌴',en:'Honeymoon Hotels',si:'මධුසමය හෝටල්'},
 {id:'music',ic:'🎶',en:'Music Bands & DJ',si:'සංගීත කණ්ඩායම් සහ DJ'},
 {id:'cater',ic:'🍽️',en:'Catering',si:'ආහාර සපයන්නන්'},
 {id:'floral',ic:'💐',en:'Floral & Decor',si:'මල් සහ සැරසිලි'},
 {id:'poruwa',ic:'🪔',en:'Poruwa Ceremony',si:'පොරුව මංගල්‍යය'},
 {id:'groom',ic:'🤵',en:'Grooms Outfits',si:'මනාලයාගේ ඇඳුම්'},
 {id:'jewel',ic:'💍',en:'Jewellery',si:'ස්වර්ණාභරණ'},
 {id:'cars',ic:'🚗',en:'Wedding Cars',si:'මංගල වාහන'},
 {id:'cakes',ic:'🎂',en:'Cakes & Sweets',si:'කේක් සහ රසකැවිලි'},
 {id:'dance',ic:'💃',en:'Dancing Groups',si:'නර්තන කණ්ඩායම්'},
 {id:'invite',ic:'💌',en:'Invitations',si:'ආරාධනා පත්'}];
const DIST=[['Colombo','කොළඹ'],['Gampaha','ගම්පහ'],['Kalutara','කළුතර'],['Kandy','මහනුවර'],['Matale','මාතලේ'],['Nuwara Eliya','නුවරඑළිය'],['Galle','ගාල්ල'],['Matara','මාතර'],['Hambantota','හම්බන්තොට'],['Jaffna','යාපනය'],['Kilinochchi','කිලිනොච්චි'],['Mannar','මන්නාරම'],['Vavuniya','වවුනියාව'],['Mullaitivu','මුලතිව්'],['Batticaloa','මඩකලපුව'],['Ampara','අම්පාර'],['Trincomalee','ත්‍රිකුණාමලය'],['Kurunegala','කුරුණෑගල'],['Puttalam','පුත්තලම'],['Anuradhapura','අනුරාධපුරය'],['Polonnaruwa','පොළොන්නරුව'],['Badulla','බදුල්ල'],['Monaragala','මොණරාගල'],['Ratnapura','රත්නපුර'],['Kegalle','කෑගල්ල']];
const SEEDS={photo:['Lumière Wedding Studio','Golden Frame Photography','Sudaru Moments'],bridal:['Rose Petal Bridal','Nilu Bridal Studio'],venue:['Grand Ivory Ballroom','Lakeside Garden Hall'],honey:['Mirissa Bay Retreat','Ella Hills Hideaway'],music:['Sapphire Live Band','DJ Rangana Sounds'],cater:['Spice Route Catering','Royal Feast Caterers'],floral:['Bloom & Bliss Decor','Mal Sarasuna Florals'],poruwa:['Heritage Poruwa Crafts','Suba Mangalya Rituals'],groom:['Gentleman’s Attire','Heritage Tailors'],jewel:['Aurora Jewellers','Swarna Mahal Jewellery'],cars:['Classic Wedding Cars','Royal Rides'],cakes:['Sugar Lace Cakes','Madhu Sweets'],dance:['Kandyan Dancers Troupe','Ranga Dance Collective'],invite:['Ribbon & Ink Invitations','Aarathana Cards']};

/* ======================= i18n ======================= */
const T={
tagline:['Sri Lanka’s Wedding Hub','ශ්‍රී ලංකාවේ මංගල කේන්ද්‍රස්ථානය'],
signin:['Sign in','පිවිසෙන්න'],signup:['Create account','ගිණුමක් සාදන්න'],
email:['Email','ඊමේල් ලිපිනය'],password:['Password','මුරපදය'],yourname:['Your name','ඔබේ නම'],
customer:['Customer','ගනුදෙනුකරු'],vendor:['Vendor','සේවා සපයන්නා'],
cust_d:['Looking for wedding services','මංගල සේවා සොයමින්'],vend_d:['I offer services. First 2 months free','සේවා සපයමි. මුල් මාස 2 නොමිලේ'],
forgot:['Forgot password?','මුරපදය අමතකද?'],reset_sent:['Password reset email sent','මුරපද යළි සැකසීමේ ඊමේල් එක යැවුවා'],
signout:['Sign out','ඉවත් වන්න'],
n_home:['Home','මුල් පිටුව'],n_dist:['Districts','දිස්ත්‍රික්'],n_about:['About','අප ගැන'],n_acc:['Account','ගිණුම'],
n_dash:['Dashboard','පුවරුව'],n_prof:['Profile','පැතිකඩ'],n_plan:['Plans','ගෙවීම්'],n_ads:['Ads','දැන්වීම්'],
n_over:['Overview','සාරාංශය'],n_vend:['Vendors','වෙන්ඩර්'],n_cust:['Customers','පාරිභෝගික'],
search:['Search vendors or categories','සේවා සපයන්නන් හෝ ප්‍රවර්ග සොයන්න'],
cats:['Categories','ප්‍රවර්ග'],byd:['Browse by district','දිස්ත්‍රික්කය අනුව'],all:['All','සියල්ල'],alld:['All 25 districts','දිස්ත්‍රික්ක 25ම'],
feat:['Vendors','සේවා සපයන්නන්'],vn:['{n} vendors','සපයන්නන් {n}'],
novend:['No vendors found here yet. Try another district.','මෙහි තවම සේවා සපයන්නන් නැත. වෙනත් දිස්ත්‍රික්කයක් බලන්න.'],
call:['Call','ඇමතුම'],wa:['WhatsApp','WhatsApp'],fb:['Facebook','Facebook'],ig:['Instagram','Instagram'],
aboutv:['About this vendor','විස්තරය'],nophoto:['No photos yet','ඡායාරූප තවම නැත'],
adhere:['Advertise here','මෙහි ඔබේ දැන්වීම'],adsub:['Reach couples planning their wedding','මංගල සැලසුම් කරන යුවළන් වෙත ළඟා වන්න'],spon:['Sponsored','දැන්වීම'],
b1h:['Every wedding service. All 25 districts.','සියලු මංගල සේවා. දිස්ත්‍රික්ක 25ම.'],b1s:['Photographers, venues, catering and more','ඡායාරූප, ශාලා, ආහාර සහ තවත්'],
b2h:['Vendors: first 2 months free','සේවා සපයන්නන්ට: මුල් මාස 2 නොමිලේ'],b2s:['Create your profile and add 20 photos','පැතිකඩ සාදා ඡායාරූප 20ක් දමන්න'],
catadh:['Your {c} business here','ඔබේ {c} ව්‍යාපාරය මෙහි'],
dash:['Dashboard','පුවරුව'],myprof:['My profile','මගේ පැතිකඩ'],myph:['My photos','මගේ ඡායාරූප'],plans:['Plans & payment','සැලසුම් සහ ගෙවීම්'],ads:['Advertise','දැන්වීම් පළ කරන්න'],
trial:['Free period: {n} days left','නොමිලේ කාලය: තව දින {n}ක්'],trialsub:['Pay before it ends to stay visible.','අවසන් වීමට පෙර ගෙවා පැතිකඩ පෙනෙන්නට සලස්වන්න.'],
subact:['Subscription active','දායකත්වය ක්‍රියාත්මකයි'],until:['Until {d}','{d} දක්වා'],
subexp:['Your free period has ended','ඔබේ නොමිලේ කාලය අවසන්'],subexps:['Please pay to make your profile visible to customers again.','ගනුදෙනුකරුවන්ට නැවත පෙනෙන්නට ගෙවීම් කරන්න.'],
paynow:['Choose a plan','සැලසුමක් තෝරන්න'],later:['Later','පසුව'],
viewpub:['View my public profile','මගේ පැතිකඩ බලන්න'],
bname:['Business name','ව්‍යාපාරයේ නම'],bcat:['Category','ප්‍රවර්ගය'],bdist:['District','දිස්ත්‍රික්කය'],bdesc:['About your business','ව්‍යාපාරය ගැන'],
bphone:['Phone number','දුරකථන අංකය'],bwa:['WhatsApp number','WhatsApp අංකය'],bfb:['Facebook link','Facebook සබැඳිය'],big:['Instagram link','Instagram සබැඳිය'],
choose:['Choose…','තෝරන්න…'],save:['Save changes','වෙනස්කම් සුරකින්න'],saved:['Saved','සුරැකිණි'],
addph:['Add photos','ඡායාරූප එක් කරන්න'],phcount:['{n} of 20 photos','ඡායාරූප {n} / 20'],phfull:['You can add up to 20 photos','උපරිම ඡායාරූප 20යි'],
phtip:['The first photo is shown first on your profile. Use the arrows to change the order.','පළමු ඡායාරූපය පැතිකඩේ මුලින්ම පෙනේ. අනුපිළිවෙල වෙනස් කරන්න ඊතල භාවිතා කරන්න.'],phfirst:['Make first','පළමු ඡායාරූපය කරන්න'],phleft:['Move left','වමට'],phright:['Move right','දකුණට'],phcover:['Cover','ප්‍රධාන'],prev:['Previous','කලින්'],next:['Next','ඊළඟ'],close:['Close','වසන්න'],
m1:['1 month','මාස 1'],m6:['6 months','මාස 6'],m12:['12 months','මාස 12'],best:['Best value','වඩාත් ලාභදායී'],save_n:['Save Rs. {n}','රු. {n} ඉතිරියි'],
manual:['Online card payment is coming soon. To activate this plan now, please contact us.','අන්තර්ජාල කාඩ් ගෙවීම ඉක්මනින්. මෙම සැලසුම දැන්ම සක්‍රිය කරගන්න අප අමතන්න.'],
history:['Payment history','ගෙවීම් ඉතිහාසය'],nopay:['No payments yet','ගෙවීම් තවම නැත'],
adslot:['Ad space','දැන්වීම් ඉඩ'],admain:['Main banner (home page)','ප්‍රධාන බැනරය (මුල් පිටුව)'],adcat:['Top of: {c}','{c} ප්‍රවර්ගයේ ඉහළින්'],
adhead:['Headline','ප්‍රධාන වාක්‍යය'],adsubl:['Short text (optional)','කෙටි විස්තරය (අමතර)'],adimg:['Banner image (optional)','බැනර් ඡායාරූපය (අමතර)'],admonths:['Months','මාස ගණන'],
adprice:['Main banner Rs. {a} / month. Category banner Rs. {b} / month.','ප්‍රධාන බැනරය මාසයකට රු. {a}. ප්‍රවර්ග බැනරය මාසයකට රු. {b}.'],
adsubmit:['Submit ad request','දැන්වීම් ඉල්ලීම යවන්න'],adsent:['Request sent. We will contact you.','ඉල්ලීම යැවුවා. අපි ඔබව සම්බන්ධ කරගන්නෙමු.'],myads:['My ad requests','මගේ දැන්වීම් ඉල්ලීම්'],noads:['No requests yet','ඉල්ලීම් තවම නැත'],
pending:['Pending','සමාලෝචනයේ'],live:['Live','පළ කර ඇත'],rejected:['Rejected','ප්‍රතික්ෂේපිතයි'],
approve:['Approve','අනුමත කරන්න'],reject:['Reject','ප්‍රතික්ෂේප'],activate:['Activate plan','සැලසුම සක්‍රිය කරන්න'],activated:['Plan activated','සැලසුම සක්‍රිය කළා'],
st_trial:['Free trial','නොමිලේ'],st_active:['Active','ක්‍රියාත්මක'],st_exp:['Expired','කල් ඉකුත්'],
revenue:['Revenue','ආදායම'],kcust:['Customers','පාරිභෝගිකයන්'],kvend:['Vendors','වෙන්ඩර්ස්ලා'],kact:['Paid vendors','ගෙවූ වෙන්ඩර්ස්'],kexp:['Expired','කල් ඉකුත්'],kpend:['Ads pending','අනුමැතිය බලාපොරොත්තුවෙන්'],
recent:['Recent payments','මෑත ගෙවීම්'],
nodata:['Nothing here yet','තවම කිසිවක් නැත'],joined:['Joined {d}','එක් වූයේ {d}'],
accinfo:['Signed in as','පිවිසී ඇත'],langl:['Language','භාෂාව'],
aboutt:['Kasaade.lk brings Sri Lanka’s wedding professionals together in one place, across all 25 districts.','Kasaade.lk යනු දිස්ත්‍රික්ක 25ම පුරා ලංකාවේ මංගල සේවා සපයන්නන් එක තැනකට ගෙන එන වේදිකාවයි.'],
built:['Built and managed by','නිර්මාණය හා පාලනය'],
e_email:['Enter a valid email','නිවැරදි ඊමේල් ලිපිනයක් ඇතුළත් කරන්න'],e_pw:['Password needs at least 6 characters','මුරපදයේ අවම අකුරු 6ක් තිබිය යුතුයි'],e_name:['Please enter your name','ඔබේ නම ඇතුළත් කරන්න'],
e_exist:['This email is already registered. Sign in instead.','මෙම ඊමේල් දැනටමත් ලියාපදිංචියි. පිවිසෙන්න.'],e_login:['Email or password is incorrect','ඊමේල් හෝ මුරපදය වැරදියි'],
e_net:['No internet connection. Please try again.','අන්තර්ජාල සම්බන්ධතාවක් නැත. නැවත උත්සාහ කරන්න.'],e_many:['Too many attempts. Please wait a few minutes.','උත්සාහ ගණන වැඩියි. විනාඩි කිහිපයකින් නැවත උත්සාහ කරන්න.'],
e_generic:['Something went wrong. Please try again.','යම් දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.'],
privacy:['Privacy Policy','රහස්‍යතා ප්‍රතිපත්තිය'],terms:['Terms of Service','සේවා කොන්දේසි'],agree:['By creating an account you agree to our {t} and {p}.','ගිණුමක් සාදන්නේ නම්, ඔබ අපගේ {t} සහ {p} පිළිගන්නවා.'],
delacc:['Delete my account','මගේ ගිණුම මකන්න'],del_t:['Delete your account?','ගිණුම මකන්නද?'],
del_d:['This permanently deletes your profile, photos and ad requests. Payment records are kept as required by law. This cannot be undone.','ඔබේ පැතිකඩ, ඡායාරූප සහ දැන්වීම් ඉල්ලීම් සදහටම මැකේ. ගෙවීම් වාර්තා නීතිය අනුව තබා ගැනේ. මෙය ආපසු හැරවිය නොහැක.'],
del_pw:['Enter your password to confirm','තහවුරු කිරීමට ඔබේ මුරපදය ඇතුළත් කරන්න'],del_go:['Delete permanently','සදහටම මකන්න'],deleted:['Your account has been deleted','ඔබේ ගිණුම මකා දමන ලදී'],cancel:['Cancel','අවලංගු කරන්න'],e_wrongpw:['Wrong password','මුරපදය වැරදියි'],
adimg_tip:['Best: a portrait photo, about 4:5 (for example 1080×1350). Keep the important part in the middle.','හොඳම: සිරස් (portrait) ඡායාරූපයක්, ආසන්න වශයෙන් 4:5 (උදා: 1080×1350). වැදගත් කොටස මැද තබන්න.'],
inst_t:['Install the app','ඇප් එක ස්ථාපනය කරන්න'],inst_d:['Add Kasaade.lk to your home screen. iPhone: tap Share, then “Add to Home Screen”. Android: browser menu ⋮, then “Install app”.','Kasaade.lk ඔබේ ෆෝන් එකේ home screen එකට එක් කරන්න. iPhone: Share බටන් එක, ඉන්පසු “Add to Home Screen”. Android: browser menu ⋮, ඉන්පසු “Install app”.'],inst_b:['Install','ස්ථාපනය කරන්න'],
e_req:['Please fill the required fields','අවශ්‍ය ක්ෂේත්‍ර පුරවන්න'],
del:['Remove','ඉවත් කරන්න'],profinc:['Complete your profile so customers can find you.','ගනුදෙනුකරුවන්ට ඔබව සොයාගත හැකි වන්නට පැතිකඩ සම්පූර්ණ කරන්න.'],
sample:['Sample listing for preview','පෙරදසුන සඳහා නියැදි සේවා සපයන්නෙක්'],loading:['Loading…','පූරණය වෙමින්…'],
mk_desc:['Professional wedding services in {d}, listed under {c}. Contact us for packages and available dates.','{d} දිස්ත්‍රික්කයේ {c} ප්‍රවර්ගය යටතේ වෘත්තීය මංගල සේවාවක්. පැකේජ සහ ලබාගත හැකි දින සඳහා අප අමතන්න.']
};
let LANG='si';try{LANG=localStorage.getItem('kasaade:lang')||'si'}catch(e){}
const t=(k,v)=>{const e=T[k];if(!e)return k;let s=e[LANG==='si'?1:0];if(v)for(const x in v)s=s.replace('{'+x+'}',v[x]);return s};
const nm=o=>o[LANG==='si'?'si':'en'];

/* ======================= STATE ======================= */
const S={users:[],vendors:{},payments:[],ads:[],liveAds:[],myAds:[]};   // live copies of Firestore data
const AUTH={user:null,role:null,profile:null,ready:false};
let route={n:'splash'},stack=[],draft={},timers=[],noticed=false,splashDone=false,signing=false;
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=864e5;
const rs=n=>'Rs. '+Number(n).toLocaleString('en-US');
const fdate=d=>{try{return new Date(d).toLocaleDateString(LANG==='si'?'si-LK':'en-GB',{day:'numeric',month:'short',year:'numeric'})}catch(e){return''}};
const catOf=id=>CATS.find(c=>c.id===id);
const distN=i=>nm({en:DIST[i][0],si:DIST[i][1]});
const cur=()=>AUTH.user?{uid:AUTH.user.uid,role:AUTH.role||'customer'}:null;
const myV=()=>AUTH.user?S.vendors[AUTH.user.uid]:null;
function nd(d){const x=d.data({serverTimestamps:'estimate'}),o={id:d.id};for(const k in x){const v=x[k];o[k]=(v&&typeof v.toDate==='function')?v.toDate().toISOString():v}return o}

/* icons */
const IC={home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',pin:'<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',mega:'<path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M18 9a4 4 0 0 1 0 6"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2.5.7 4 2.3 4 5"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',photo:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 16l-5-5-8 8"/>',back:'<path d="M15 5l-7 7 7 7"/>',phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1z"/>',chat:'<path d="M4 20l1.3-4A8 8 0 1 1 8.2 18.8z"/>',fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z"/>',ig:'<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M17 7h.01"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',next:'<path d="M9 5l7 7-7 7"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'};
const ic=(n,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* placeholder pictures (sample vendors / vendors without photos) */
function ph(seed,icon){const P=[['#F4D9D6','#D9A5AD'],['#F6E7C8','#D8B26A'],['#EBCFD3','#B8707B'],['#FBEBD9','#C9973F']],[a,b]=P[seed%4];
 const svg=`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><circle cx='${80+(seed*37)%240}' cy='${60+(seed*23)%160}' r='95' fill='#fff' opacity='.2'/><text x='200' y='178' font-size='96' text-anchor='middle'>${icon}</text></svg>`;
 return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg)}

/* subscription */
const trialEnd=v=>{const d=new Date(v.createdAt||Date.now());d.setMonth(d.getMonth()+TRIAL_MONTHS);return d};
function subStatus(v){const now=Date.now();if(v.paidUntil&&new Date(v.paidUntil)>now)return{s:'active',until:new Date(v.paidUntil)};const te=trialEnd(v);if(now<te)return{s:'trial',days:Math.max(1,Math.ceil((te-now)/DAY)),until:te};return{s:'expired'}}

/* vendors */
const SEEDV=SHOW_SAMPLES?(()=>{const o=[];CATS.forEach((c,ci)=>(SEEDS[c.id]||[]).forEach((name,k)=>{const n=ci*3+k,num='+9477000'+String(1000+n);o.push({id:'s_'+c.id+k,seed:true,n,name,cat:c.id,dist:(ci*7+k*11+3)%25,phone:num,whatsapp:num,facebook:'https://facebook.com',instagram:'https://instagram.com'})}));return o})():[];
const validV=v=>v&&v.name&&catOf(v.cat)&&v.dist!=null&&v.dist!==''&&DIST[Number(v.dist)];
const regV=()=>Object.values(S.vendors).filter(v=>validV(v)&&subStatus(v).s!=='expired').map(v=>Object.assign({},v,{id:v.uid||v.id,seed:false,dist:Number(v.dist)}));
const allV=()=>regV().concat(SEEDV);
const getV=id=>allV().find(v=>v.id===id)||(S.vendors[id]&&validV(S.vendors[id])?Object.assign({},S.vendors[id],{id,seed:false,dist:Number(S.vendors[id].dist)}):null);
const thumb=v=>v.seed?ph(v.n,catOf(v.cat).ic):(v.cover||ph(3,catOf(v.cat).ic));
const vdesc=v=>v.seed?t('mk_desc',{d:distN(v.dist),c:nm(catOf(v.cat))}):v.desc;
function vendorsFor(f){const q=(f.q||'').trim().toLowerCase();return allV().filter(v=>(!f.cat||v.cat===f.cat)&&(f.dist===undefined||f.dist===''||f.dist===null||v.dist===Number(f.dist))&&(!q||(v.name+' '+catOf(v.cat).en+' '+catOf(v.cat).si+' '+DIST[v.dist][0]+' '+DIST[v.dist][1]).toLowerCase().includes(q)))}

/* ======================= PHOTOS ======================= */
const PC={},PL={};                      // PC[uid] = [{id,src,path?}]
async function loadPhotos(uid){const s=await getDocs(query(collection(db,'vendors',uid,'photos'),orderBy('at')));return s.docs.map(d=>({id:d.id,src:d.data().src,path:d.data().path}))}
function ensurePhotos(uid){if(PC[uid]!==undefined)return Promise.resolve();if(!PL[uid])PL[uid]=loadPhotos(uid).then(l=>{PC[uid]=l;delete PL[uid];schedule()}).catch(e=>{console.warn(e);PC[uid]=[];delete PL[uid]});return PL[uid]}
function compress(file,max=640,q=.65){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const r=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*r);c.height=Math.round(im.height*r);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',q))};im.onerror=rej;im.src=u})}
function thumbOf(dataUrl,max=200){return new Promise(res=>{const im=new Image();im.onload=()=>{const r=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*r);c.height=Math.round(im.height*r);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.6))};im.onerror=()=>res('');im.src=dataUrl})}
async function syncCover(uid){const l=PC[uid]||[];let cover='';if(l.length)cover=PHOTO_MODE==='storage'?l[0].src:await thumbOf(l[0].src);await updateDoc(doc(db,'vendors',uid),{cover,photoCount:l.length})}
async function addPhotos(files){const uid=AUTH.user.uid;busy(true);try{await ensurePhotos(uid);const list=PC[uid],room=20-list.length;if(room<=0){toast(t('phfull'));busy(false);return}
  for(const f of [...files].slice(0,room)){const data=await compress(f);
   if(PHOTO_MODE==='storage'){const path=`vendors/${uid}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.jpg`,r=sref(getSt(),path);await uploadString(r,data,'data_url');const url=await getDownloadURL(r);const d=await addDoc(collection(db,'vendors',uid,'photos'),{src:url,path,at:Date.now()});list.push({id:d.id,src:url,path})}
   else{const d=await addDoc(collection(db,'vendors',uid,'photos'),{src:data,at:Date.now()});list.push({id:d.id,src:data})}}
  await syncCover(uid)}catch(e){console.error(e);toast(t('e_generic'))}busy(false);render()}
async function delPhoto(i){const uid=AUTH.user.uid,l=PC[uid];if(!l||!l[i])return;busy(true);try{const p=l[i];await deleteDoc(doc(db,'vendors',uid,'photos',p.id));if(p.path)try{await deleteObject(sref(getSt(),p.path))}catch(_){}l.splice(i,1);await syncCover(uid)}catch(e){console.error(e);toast(t('e_generic'))}busy(false);render()}

/* ======================= HELPERS ======================= */
let toastT;function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2600)}
const busy=b=>$('#busy').classList.toggle('on',!!b);
function modal(h){const m=$('#modal');m.innerHTML=h?`<div class="sheet">${h}</div>`:'';m.classList.toggle('open',!!h)}
const safeUrl=u=>{try{u=String(u||'').trim();if(!u)return'';if(!/^https?:\/\//i.test(u))u='https://'+u;const x=new URL(u);return['http:','https:'].includes(x.protocol)?x.href:''}catch(e){return''}};
const digits=p=>{let d=String(p||'').replace(/\D/g,'');if(d.startsWith('0'))d='94'+d.slice(1);return d};
const val=(k,s)=>k in draft?draft[k]:(s==null?'':s);
const fld=(k,l,o={})=>`<div class="f"><label for="f_${k}">${l}</label>${o.area?`<textarea id="f_${k}" name="${k}" rows="4">${esc(val(k,o.v))}</textarea>`:`<input id="f_${k}" name="${k}" type="${o.type||'text'}" value="${esc(val(k,o.v))}" autocomplete="${o.ac||'off'}" ${o.ph?`placeholder="${esc(o.ph)}"`:''} ${o.mode?`inputmode="${o.mode}"`:''}>`}</div>`;
const sel=(k,l,opts,v)=>`<div class="f"><label for="f_${k}">${l}</label><select id="f_${k}" name="${k}"><option value="">${t('choose')}</option>${opts.map(([a,b])=>`<option value="${esc(a)}" ${String(val(k,v))===String(a)?'selected':''}>${esc(b)}</option>`).join('')}</select></div>`;
const catOpts=()=>CATS.map(c=>[c.id,c.ic+' '+nm(c)]);
const distOpts=()=>DIST.map((d,i)=>[i,distN(i)]);
const byNew=k=>(a,b)=>String(b[k]||'').localeCompare(String(a[k]||''));
function authErr(e){const c=(e&&e.code)||'';if(c==='auth/email-already-in-use')return t('e_exist');if(['auth/invalid-credential','auth/wrong-password','auth/user-not-found','auth/invalid-login-credentials'].includes(c))return t('e_login');if(c==='auth/weak-password')return t('e_pw');if(c==='auth/invalid-email')return t('e_email');if(c==='auth/network-request-failed')return t('e_net');if(c==='auth/too-many-requests')return t('e_many');return t('e_generic')+(c?' ('+c+')':'')}

/* ======================= NAVIGATION ======================= */
const ROOTS=['home','districts','about','account','vdash','vprofile','vphotos','vplan','vads','aover','avendors','acust','aads'];
function go(n,p){draft={};if(route.n!=='splash'&&!ROOTS.includes(n))stack.push(route);else if(ROOTS.includes(n))stack=[];route=Object.assign({n},p||{});render();window.scrollTo(0,0)}
function back(){draft={};route=stack.pop()||homeRoute();render();window.scrollTo(0,0)}
function homeRoute(){const s=cur();return!s?{n:'auth'}:s.role==='vendor'?{n:'vdash'}:s.role==='admin'?{n:'aover'}:{n:'home'}}
function navItems(){const r=cur()&&cur().role;
 if(r==='vendor')return[['vdash','home','n_dash'],['vprofile','edit','n_prof'],['vplan','card','n_plan'],['vads','mega','n_ads'],['about','info','n_about']];
 if(r==='admin')return[['aover','chart','n_over'],['avendors','users','n_vend'],['acust','user','n_cust'],['aads','mega','n_ads'],['about','info','n_about']];
 return[['home','home','n_home'],['districts','pin','n_dist'],['about','info','n_about'],['account','user','n_acc']]}
const navView=()=>`<nav class="nav" aria-label="Main">${navItems().map(([r,i,l])=>`<button data-act="tab" data-to="${r}" class="${route.n===r?'on':''}" ${route.n===r?'aria-current="page"':''}>${ic(i)}<span>${t(l)}</span></button>`).join('')}</nav>`;
function titleOf(){switch(route.n){case'category':return nm(catOf(route.cat));case'district':return distN(route.dist);case'vendor':{const v=getV(route.id);return v?v.name:''}default:return''}}
function header(){const sub=!ROOTS.includes(route.n)&&!['auth','splash','boot'].includes(route.n);
 const left=sub?`<button class="ib" data-act="back" aria-label="Back">${ic('back')}</button><div class="ttl">${esc(titleOf())}</div>`:`<div class="brand"><img src="${RINGS}" alt="">Kasaade.lk</div>`;
 return`<header class="hdr">${left}<div class="seg" role="group" aria-label="${t('langl')}"><button data-act="lang" data-l="si" class="${LANG==='si'?'on':''}">සිං</button><button data-act="lang" data-l="en" class="${LANG==='en'?'on':''}">EN</button></div></header>`}

/* ======================= VIEWS ======================= */
function splashView(){return`<section class="splash" style="--logo:url('${LOGO}')"><div class="sp-logo"><img src="${LOGO}" alt="Kasaade.lk – ${esc(t('tagline'))}"><span class="sheen"></span></div><div class="sp-bar"><i></i></div></section>`}
const loadingView=()=>`<div class="empty" style="padding-top:80px"><div class="spin" style="margin:0 auto 14px"></div>${t('loading')}</div>`;

function authView(){const m=route.mode||'signin',role=route.role||'customer';
 return`<div class="auth"><img class="auth-logo" src="${LOGO}" alt="Kasaade.lk">
 <div class="seg2" role="tablist"><button data-act="mode" data-m="signin" class="${m==='signin'?'on':''}">${t('signin')}</button><button data-act="mode" data-m="signup" class="${m==='signup'?'on':''}">${t('signup')}</button></div>
 <form class="form" data-form="${m}">
 ${m==='signup'?`<div class="roles"><button type="button" class="role ${role==='customer'?'on':''}" data-act="role" data-r="customer"><b>${t('customer')}</b><span>${t('cust_d')}</span></button><button type="button" class="role ${role==='vendor'?'on':''}" data-act="role" data-r="vendor"><b>${t('vendor')}</b><span>${t('vend_d')}</span></button></div>${fld('name',t('yourname'),{ac:'name'})}`:''}
 ${fld('email',t('email'),{type:'email',ac:'email',mode:'email'})}${fld('password',t('password'),{type:'password',ac:m==='signup'?'new-password':'current-password'})}
 ${m==='signup'?`<p class="hint" style="margin:0">${t('agree',{t:`<a href="terms.html" ${LK}>${t('terms')}</a>`,p:`<a href="privacy.html" ${LK}>${t('privacy')}</a>`})}</p>`:''}
 <div class="err" id="err" role="alert"></div>
 <button class="btn btn-primary btn-block">${m==='signup'?t('signup'):t('signin')}</button></form>
 ${m==='signin'?`<div style="text-align:center"><button class="link" data-act="reset">${t('forgot')}</button></div>`:''}</div>`}

/* banners */
const adsAll=()=>{if(AUTH.role==='admin')return S.ads;const m=new Map();S.liveAds.concat(S.myAds).forEach(a=>m.set(a.id,a));return[...m.values()]};
const adsFor=slot=>adsAll().filter(a=>a.status==='live'&&a.slot===slot);
function bannerHtml(slot,big){let s='';
 const ads=adsFor(slot);
 s+=ads.map(a=>`<div class="bn ${a.img?'img':'g3'}" ${a.img?`style="background-image:url('${a.img}')"`:''} data-act="go" data-to="vendor" data-id="${esc(a.uid)}"><span class="spon">${t('spon')}</span><h3>${esc(a.head)}</h3>${a.sub?`<p>${esc(a.sub)}</p>`:''}</div>`).join('');
 if(slot==='main'){s+=`<div class="bn g1"><h3>${t('b1h')}</h3><p>${t('b1s')}</p></div><div class="bn g2"><h3>${t('b2h')}</h3><p>${t('b2s')}</p></div>`}
 if(!ads.length||slot==='main')s+=`<div class="bn g3" ${cur()&&cur().role==='vendor'?'data-act="tab" data-to="vads"':''}><span class="spon">${t('spon')}</span><h3>${slot==='main'?t('adhere'):t('catadh',{c:nm(catOf(slot))})}</h3><p>${t('adsub')}</p></div>`;
 const n=(s.match(/class="bn /g)||[]).length;
 return`<div class="banner${big?' hero':''}" data-banner><div class="bn-track">${s}</div>${big&&n>1?`<button class="gal-nav prev" data-act="bnprev" aria-label="${t('prev')}">${ic('back',22)}</button><button class="gal-nav next" data-act="bnnext" aria-label="${t('next')}">${ic('next',22)}</button>`:''}${n>1?`<div class="dots">${Array.from({length:n},(_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div>`:''}</div>`}
function bnGo(el,dir){const b=el.closest('[data-banner]'),tr=b&&b.querySelector('.bn-track');if(!tr)return;const n=tr.children.length,i=(Math.round(tr.scrollLeft/tr.clientWidth)+dir+n)%n;tr.scrollTo({left:i*tr.clientWidth,behavior:'smooth'})}

const vrow=v=>`<button class="vrow" data-act="go" data-to="vendor" data-id="${esc(v.id)}"><img src="${thumb(v)}" alt="" loading="lazy"><div><h3>${esc(v.name)}</h3><div class="tags"><span class="tag">${catOf(v.cat).ic} ${esc(nm(catOf(v.cat)))}</span><span class="tag ghost">${esc(distN(v.dist))}</span></div></div><span class="chev" aria-hidden="true">›</span></button>`;
const vlist=a=>a.length?`<div class="vlist">${a.map(vrow).join('')}</div>`:`<div class="empty">${t('novend')}</div>`;
const catTile=c=>{const n=vendorsFor({cat:c.id}).length;return`<button class="tile" data-act="go" data-to="category" data-cat="${c.id}"><span class="em">${c.ic}</span><span><b>${esc(nm(c))}</b><small>${t('vn',{n})}</small></span></button>`};

function homeBody(){const q=(route.q||'').trim();
 if(q){const cs=CATS.filter(c=>(c.en+' '+c.si).toLowerCase().includes(q.toLowerCase())),vs=vendorsFor({q});
  return`${cs.length?`<div class="sec"><h2>${t('cats')}</h2></div><div class="tiles">${cs.map(catTile).join('')}</div>`:''}<div class="sec"><h2>${t('n_vend')}</h2></div>${vlist(vs)}`}
 const some=allV().slice(0,6);
 return`<div class="sec"><h2>${t('cats')}</h2></div><div class="tiles">${CATS.map(catTile).join('')}</div>
 <div class="sec"><h2>${t('byd')}</h2><button class="link" data-act="tab" data-to="districts">${t('alld')}</button></div>
 <div class="chips">${DIST.map((d,i)=>`<button class="chip" data-act="go" data-to="district" data-dist="${i}">${esc(distN(i))}</button>`).join('')}</div>
 ${some.length?`<div class="sec"><h2>${t('feat')}</h2></div>${vlist(some)}`:''}`}
function homeView(){return`${bannerHtml('main',true)}<div class="search"><span aria-hidden="true">${ic('search')}</span><input type="search" data-search placeholder="${esc(t('search'))}" value="${esc(route.q||'')}" aria-label="${esc(t('search'))}"></div><div id="hb">${homeBody()}</div>`}

function districtsView(){return`<div class="sec" style="margin-top:6px"><h2>${t('alld')}</h2></div><div class="tiles">${DIST.map((d,i)=>`<button class="tile" data-act="go" data-to="district" data-dist="${i}"><span class="em">${ic('pin',20)}</span><span><b>${esc(distN(i))}</b><small>${t('vn',{n:vendorsFor({dist:i}).length})}</small></span></button>`).join('')}</div>`}

function categoryView(){const c=catOf(route.cat),d=route.dist;
 return`${bannerHtml(c.id)}<div class="sec"><h2>${c.ic} ${esc(nm(c))}</h2></div>
 <div class="chips"><button class="chip ${d===undefined||d===''?'on':''}" data-act="filt" data-k="dist" data-v="">${t('all')}</button>${DIST.map((x,i)=>`<button class="chip ${String(d)===String(i)?'on':''}" data-act="filt" data-k="dist" data-v="${i}">${esc(distN(i))}</button>`).join('')}</div>${vlist(vendorsFor({cat:c.id,dist:d}))}`}
function districtView(){const c=route.cat;
 return`<div class="sec" style="margin-top:6px"><h2>${esc(distN(route.dist))}</h2></div><div class="chips"><button class="chip ${!c?'on':''}" data-act="filt" data-k="cat" data-v="">${t('all')}</button>${CATS.map(x=>`<button class="chip ${c===x.id?'on':''}" data-act="filt" data-k="cat" data-v="${x.id}">${x.ic} ${esc(nm(x))}</button>`).join('')}</div>${vlist(vendorsFor({dist:route.dist,cat:c}))}`}

let curPhotos=[];
function galleryHtml(ps,v){curPhotos=ps;
 if(!ps.length)return`<div class="gal"><div class="empty" style="aspect-ratio:4/3;display:grid;place-items:center">${t('nophoto')}</div></div>`;
 const multi=ps.length>1;
 return`<div class="gal"><div class="gal-track" data-gal>${ps.map((p,i)=>`<img src="${p}" alt="${esc(v.name)}" data-act="lbopen" data-i="${i}">`).join('')}</div><span class="gal-count" data-cnt>1/${ps.length}</span>${multi?`<button class="gal-nav prev" data-act="galprev" aria-label="${t('prev')}">${ic('back',22)}</button><button class="gal-nav next" data-act="galnext" aria-label="${t('next')}">${ic('next',22)}</button>`:''}</div>${multi?`<div class="gal-thumbs">${ps.map((p,i)=>`<button class="gal-th ${i?'':'on'}" data-act="galthumb" data-i="${i}" aria-label="${i+1}"><img src="${p}" alt=""></button>`).join('')}</div>`:''}`}
function vendorView(){const v=getV(route.id);
 if(!v)return`<div class="empty">${t('novend')}</div>`;
 const c=catOf(v.cat),ps=v.seed?[0,1,2,3,4,5].map(i=>ph(v.n+i,c.ic)):(PC[v.id]?PC[v.id].map(p=>p.src):(v.cover?[v.cover]:[])),wa=digits(v.whatsapp||v.phone),tel=String(v.phone||'').replace(/[^\d+]/g,''),fb=safeUrl(v.facebook),ig=safeUrl(v.instagram);
 return`${galleryHtml(ps,v)}
 <h1 style="font-size:28px;margin:16px 0 8px;line-height:1.2">${esc(v.name)}</h1>
 <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="tag">${c.ic} ${esc(nm(c))}</span><span class="tag ghost">${esc(distN(v.dist))}</span></div>
 <div class="contact">${wa?`<a class="cbtn wa" href="https://wa.me/${wa}" target="_blank" rel="noopener">${ic('chat',26)}${t('wa')}</a>`:'<span></span>'}${tel?`<a class="cbtn tel" href="tel:${tel}">${ic('phone',26)}${t('call')}</a>`:'<span></span>'}${fb?`<a class="cbtn fb" href="${esc(fb)}" target="_blank" rel="noopener">${ic('fb',26)}${t('fb')}</a>`:'<span></span>'}</div>
 ${ig?`<a class="btn btn-ghost btn-block btn-sm" href="${esc(ig)}" target="_blank" rel="noopener">${ic('ig',18)} ${t('ig')}</a>`:''}
 <div class="orn"></div><h2 style="margin-bottom:6px">${t('aboutv')}</h2><p style="margin:0;white-space:pre-line">${esc(vdesc(v))}</p>${v.seed?`<p class="hint" style="margin-top:14px">${t('sample')}</p>`:''}`}

function accountView(){return`<div class="sec" style="margin-top:6px"><h2>${t('n_acc')}</h2></div><div class="kpi"><span>${t('accinfo')}</span><b style="font-size:22px;word-break:break-all">${esc(AUTH.user.email)}</b><span>${esc((AUTH.profile&&AUTH.profile.name)||'')}</span></div><div style="margin-top:16px"><button class="btn btn-ghost btn-block" data-act="logout">${t('signout')}</button></div><div style="margin-top:28px"><button class="btn btn-bad btn-block" data-act="delacc">${t('delacc')}</button></div>`}

let deferredInstall=null;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const LK='style="color:var(--rose-d);text-decoration:underline" target="_blank" rel="noopener"';
const legalLinks=()=>`<a href="privacy.html" ${LK}>${t('privacy')}</a> · <a href="terms.html" ${LK}>${t('terms')}</a>`;
const installCard=()=>`<div class="co"><h3>${t('inst_t')}</h3><p class="hint" style="margin:6px 0 0">${t('inst_d')}</p>${deferredInstall?`<div class="acts"><button class="btn btn-primary" data-act="install">${ic('home',20)} ${t('inst_b')}</button></div>`:''}</div>`;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;if(route.n==='about')render()});
window.addEventListener('appinstalled',()=>{deferredInstall=null;if(route.n==='about')render()});
function aboutView(){return`<div class="about"><img src="${LOGO}" alt="Kasaade.lk" style="width:70%;max-width:280px"><p style="margin:0">${t('aboutt')}</p>${standalone()?'':installCard()}<div class="co"><span class="muted" style="font-size:13px">${t('built')}</span><h3 style="font-size:26px;background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent">${COMPANY.name}</h3><div class="acts"><a class="btn btn-primary" href="tel:${COMPANY.phone}">${ic('phone',20)} ${COMPANY.phone}</a><a class="btn btn-ghost" href="https://wa.me/${digits(COMPANY.phone)}" target="_blank" rel="noopener">${ic('chat',20)} WhatsApp</a><a class="btn btn-ghost" href="mailto:${COMPANY.email}">${ic('mail',20)} ${COMPANY.email}</a></div></div><p class="hint">${legalLinks()}</p><p class="hint">© 2026 ${COMPANY.name}</p></div>`}

/* ---- vendor side ---- */
function subCard(v){const s=subStatus(v);
 if(s.s==='trial')return`<div class="stat"><h2>${t('trial',{n:s.days})}</h2><div class="bar"><i style="width:${Math.min(100,Math.round((1-s.days/61)*100))}%"></i></div><span>${t('until',{d:fdate(s.until)})}. ${t('trialsub')}</span></div>`;
 if(s.s==='active')return`<div class="stat ok"><h2>${t('subact')}</h2><span>${t('until',{d:fdate(s.until)})}</span></div>`;
 return`<div class="stat bad"><h2>${t('subexp')}</h2><span>${t('subexps')}</span><button class="btn btn-ghost btn-block" data-act="tab" data-to="vplan">${t('paynow')}</button></div>`}
const complete=v=>validV(v)&&v.phone;
const nPh=v=>PC[v.uid||v.id]?PC[v.uid||v.id].length:(v.photoCount||0);
function vdashView(){const v=myV();if(!v)return loadingView();
 return`<div class="sec" style="margin-top:6px"><h2>${t('dash')}</h2></div>${subCard(v)}
 ${complete(v)?'':`<div class="notice" style="margin-top:14px"><span>${t('profinc')}</span><button class="btn btn-primary btn-sm" data-act="tab" data-to="vprofile">${t('myprof')}</button></div>`}
 <div class="grid2" style="margin-top:14px"><button class="kpi" data-act="tab" data-to="vprofile" style="text-align:left;cursor:pointer"><b>${ic('edit',26)}</b><span>${t('myprof')}</span></button><button class="kpi" data-act="tab" data-to="vphotos" style="text-align:left;cursor:pointer"><b>${nPh(v)}/20</b><span>${t('myph')}</span></button><button class="kpi" data-act="tab" data-to="vplan" style="text-align:left;cursor:pointer"><b>${ic('card',26)}</b><span>${t('plans')}</span></button><button class="kpi" data-act="tab" data-to="vads" style="text-align:left;cursor:pointer"><b>${ic('mega',26)}</b><span>${t('ads')}</span></button></div>
 ${complete(v)?`<button class="btn btn-ghost btn-block" style="margin-top:14px" data-act="go" data-to="vendor" data-id="${v.uid}">${t('viewpub')}</button>`:''}
 <button class="btn btn-ghost btn-block" style="margin-top:18px" data-act="logout">${t('signout')}</button><button class="btn btn-bad btn-block" style="margin-top:28px" data-act="delacc">${t('delacc')}</button>`}

function vprofileView(){const v=myV();if(!v)return loadingView();return`<div class="sec" style="margin-top:6px"><h2>${t('myprof')}</h2></div><form class="form" data-form="profile">${fld('name',t('bname'),{v:v.name})}${sel('cat',t('bcat'),catOpts(),v.cat)}${sel('dist',t('bdist'),distOpts(),v.dist)}${fld('desc',t('bdesc'),{v:v.desc,area:1})}${fld('phone',t('bphone'),{v:v.phone,type:'tel',ph:'+94 77 123 4567',mode:'tel'})}${fld('whatsapp',t('bwa'),{v:v.whatsapp,type:'tel',mode:'tel'})}${fld('facebook',t('bfb'),{v:v.facebook,type:'url',ph:'facebook.com/yourpage'})}${fld('instagram',t('big'),{v:v.instagram,type:'url',ph:'instagram.com/yourpage'})}<div class="err" id="err" role="alert"></div><button class="btn btn-primary btn-block">${t('save')}</button></form>`}

function vphotosView(){const ps=PC[AUTH.user.uid];if(!ps)return loadingView();return`<div class="sec" style="margin-top:6px"><h2>${t('myph')}</h2><span class="muted">${t('phcount',{n:ps.length})}</span></div><p class="hint" style="margin-top:0">${t('phtip')}</p>
 <label class="btn btn-primary btn-block" style="margin:10px 0 16px">${ic('photo',20)} ${t('addph')}<input type="file" accept="image/*" multiple hidden data-file="photos"></label>
 <div class="ph-grid">${ps.map((p,i)=>`<div class="pi"><img src="${p.src}" alt="">${i===0?`<span class="cvr">${t('phcover')}</span>`:''}<button class="del" data-act="delph" data-i="${i}" aria-label="${t('del')}">${ic('x',16)}</button><div class="mv">${i>0?`<button data-act="phmove" data-i="${i}" data-j="${i-1}" aria-label="${t('phleft')}">${ic('back',16)}</button><button data-act="phmove" data-i="${i}" data-j="0" aria-label="${t('phfirst')}">${ic('star',16)}</button>`:'<span></span><span></span>'}${i<ps.length-1?`<button data-act="phmove" data-i="${i}" data-j="${i+1}" aria-label="${t('phright')}">${ic('next',16)}</button>`:'<span></span>'}</div></div>`).join('')}</div>`}

function vplanView(){const v=myV();if(!v)return loadingView();const pays=S.payments.filter(p=>p.uid===AUTH.user.uid).slice().sort(byNew('at'));
 return`<div class="sec" style="margin-top:6px"><h2>${t('plans')}</h2></div>${subCard(v)}<div class="plans" style="margin-top:20px">${PLANS.map(p=>{const sv=p.months*1000-p.price;return`<button class="plan ${p.id==='m12'?'best':''}" data-act="pay" data-id="${p.id}">${p.id==='m12'?`<span class="badge">${t('best')}</span>`:''}<span><b>${t(p.id)}</b><small>${sv>0?t('save_n',{n:sv.toLocaleString('en-US')}):'&nbsp;'}</small></span><span class="pr">${rs(p.price)}</span></button>`}).join('')}</div>
 <div class="sec"><h2>${t('history')}</h2></div>${pays.length?`<div class="rows">${pays.map(p=>`<div class="rrow"><div><b>${t('m'+p.months)}</b><small>${fdate(p.at)}</small></div><b>${rs(p.amount)}</b></div>`).join('')}</div>`:`<div class="empty">${t('nopay')}</div>`}`}

const stag=s=>`<span class="tag ${s==='live'?'ok':s==='rejected'?'bad':'warn'}">${t(s)}</span>`;
function vadsView(){const mine=S.myAds.slice().sort(byNew('at'));
 return`<div class="sec" style="margin-top:6px"><h2>${t('ads')}</h2></div><p class="hint" style="margin-top:0">${t('adprice',{a:AD_PRICES.main.toLocaleString('en-US'),b:AD_PRICES.cat.toLocaleString('en-US')})}</p>
 <form class="form" data-form="ad">${sel('slot',t('adslot'),[['main',t('admain')]].concat(CATS.map(c=>[c.id,t('adcat',{c:c.ic+' '+nm(c)})])),'main')}${fld('head',t('adhead'))}${fld('sub',t('adsubl'))}
 <div class="f"><label>${t('adimg')}</label><label class="btn btn-ghost btn-sm" style="width:100%">${ic('photo',18)} ${draft._img?'✓':t('addph')}<input type="file" accept="image/*" hidden data-file="adimg"></label><p class="hint" style="margin:6px 0 0">${t('adimg_tip')}</p></div>
 ${sel('months',t('admonths'),[[1,'1'],[2,'2'],[3,'3'],[6,'6']],1)}<div class="err" id="err" role="alert"></div><button class="btn btn-primary btn-block">${t('adsubmit')}</button></form>
 <div class="sec"><h2>${t('myads')}</h2></div>${mine.length?`<div class="rows">${mine.map(a=>`<div class="rrow"><div><b>${esc(a.head)}</b><small>${esc(a.slot==='main'?t('admain'):nm(catOf(a.slot)))} · ${a.months}m · ${rs(a.price)}</small></div>${stag(a.status)}</div>`).join('')}</div>`:`<div class="empty">${t('noads')}</div>`}`}

/* ---- admin ---- */
const vstat=v=>{const s=subStatus(v).s;return`<span class="tag ${s==='active'?'ok':s==='trial'?'warn':'bad'}">${t('st_'+s)}</span>`};
function aoverView(){const vs=Object.values(S.vendors),cs=S.users.filter(u=>String(u.role).toLowerCase()==='customer'),rev=S.payments.reduce((a,p)=>a+(Number(p.amount)||0),0);
 return`<div class="sec" style="margin-top:6px"><h2>${t('n_over')}</h2></div><div class="grid2"><div class="kpi"><b>${rs(rev)}</b><span>${t('revenue')}</span></div><div class="kpi"><b>${cs.length}</b><span>${t('kcust')}</span></div><div class="kpi"><b>${vs.length}</b><span>${t('kvend')}</span></div><div class="kpi"><b>${vs.filter(v=>subStatus(v).s==='active').length}</b><span>${t('kact')}</span></div><div class="kpi"><b>${vs.filter(v=>subStatus(v).s==='expired').length}</b><span>${t('kexp')}</span></div><div class="kpi"><b>${S.ads.filter(a=>a.status==='pending').length}</b><span>${t('kpend')}</span></div></div>
 <div class="sec"><h2>${t('recent')}</h2></div>${S.payments.length?`<div class="rows">${S.payments.slice().sort(byNew('at')).slice(0,8).map(p=>`<div class="rrow"><div><b>${esc(p.name||'')}</b><small>${fdate(p.at)} · ${t('m'+p.months)}</small></div><b>${rs(p.amount)}</b></div>`).join('')}</div>`:`<div class="empty">${t('nopay')}</div>`}
 <button class="btn btn-ghost btn-block" data-act="logout" style="margin-top:18px">${t('signout')}</button>`}
function avendorsView(){const vs=Object.values(S.vendors).sort(byNew('createdAt'));return`<div class="sec" style="margin-top:6px"><h2>${t('n_vend')}</h2></div>${vs.length?`<div class="rows">${vs.map(v=>{const u=S.users.find(x=>x.id===(v.uid||v.id))||{};const ok=catOf(v.cat);return`<div class="rrow" style="align-items:flex-start"><div><b>${esc(v.name||u.name||'—')}</b><small>${esc(u.email||'')}</small><small>${ok?esc(nm(ok))+' · ':''}${DIST[Number(v.dist)]&&v.dist!=null?esc(distN(Number(v.dist)))+' · ':''}${t('joined',{d:fdate(v.createdAt)})}</small></div><div style="display:grid;gap:6px;justify-items:end">${vstat(v)}<button class="btn btn-ghost btn-sm" data-act="adminplan" data-uid="${esc(v.uid||v.id)}">${t('activate')}</button></div></div>`}).join('')}</div>`:`<div class="empty">${t('nodata')}</div>`}`}
function acustView(){const cs=S.users.filter(u=>String(u.role).toLowerCase()==='customer').sort(byNew('createdAt'));return`<div class="sec" style="margin-top:6px"><h2>${t('n_cust')}</h2></div>${cs.length?`<div class="rows">${cs.map(u=>`<div class="rrow"><div><b>${esc(u.name||'—')}</b><small>${esc(u.email||'')}</small></div><small>${fdate(u.createdAt)}</small></div>`).join('')}</div>`:`<div class="empty">${t('nodata')}</div>`}`}
function aadsView(){const a=S.ads.slice().sort(byNew('at'));return`<div class="sec" style="margin-top:6px"><h2>${t('n_ads')}</h2></div>${a.length?`<div class="rows">${a.map(x=>`<div class="rrow" style="align-items:flex-start"><div><b>${esc(x.head)}</b><small>${esc(x.vname||'')} · ${esc(x.slot==='main'?t('admain'):(catOf(x.slot)?nm(catOf(x.slot)):''))}</small><small>${x.months}m · ${rs(x.price)}</small></div><div style="display:grid;gap:6px;justify-items:end">${stag(x.status)}${x.status==='pending'?`<div style="display:flex;gap:6px"><button class="btn btn-ok btn-sm" data-act="adset" data-id="${x.id}" data-s="live">${t('approve')}</button><button class="btn btn-bad btn-sm" data-act="adset" data-id="${x.id}" data-s="rejected">${t('reject')}</button></div>`:''}</div></div>`).join('')}</div>`:`<div class="empty">${t('nodata')}</div>`}`}

const VIEWS={boot:loadingView,auth:authView,home:homeView,districts:districtsView,category:categoryView,district:districtView,vendor:vendorView,account:accountView,about:aboutView,vdash:vdashView,vprofile:vprofileView,vphotos:vphotosView,vplan:vplanView,vads:vadsView,aover:aoverView,avendors:avendorsView,acust:acustView,aads:aadsView};
const VENDOR_ONLY=['vdash','vprofile','vphotos','vplan','vads'],ADMIN_ONLY=['aover','avendors','acust','aads'];

/* ======================= RENDER ======================= */
let rp=false;function schedule(){if(rp)return;rp=true;setTimeout(()=>{rp=false;const a=document.activeElement;if(route.n==='splash'||(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)))return;render()},150)}
function render(){timers.forEach(clearInterval);timers=[];
 document.documentElement.lang=LANG;
 if(route.n==='splash'){$('#app').innerHTML=splashView();return}
 const s=cur();
 if(!s&&route.n!=='auth'&&route.n!=='boot')route={n:'auth'};
 if(s&&route.n==='auth')route=homeRoute();
 if(s&&((VENDOR_ONLY.includes(route.n)&&s.role!=='vendor')||(ADMIN_ONLY.includes(route.n)&&s.role!=='admin')))route=homeRoute();
 const ready=!s||AUTH.ready;
 $('#app').innerHTML=header()+`<main class="main" id="main">${ready?(VIEWS[route.n]||(()=>''))():loadingView()}</main>`+(['auth','boot'].includes(route.n)?'':navView());
 hooks();
 if(s&&s.role==='vendor'){ if(route.n==='vphotos'||route.n==='vdash')ensurePhotos(s.uid); if(!noticed&&myV()&&subStatus(myV()).s==='expired'){noticed=true;expiredModal()}}
 if(route.n==='vendor'&&route.id&&!String(route.id).startsWith('s_'))ensurePhotos(route.id)}
function hooks(){
 const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
 document.querySelectorAll('[data-banner]').forEach(b=>{const tr=b.querySelector('.bn-track'),dots=[...b.querySelectorAll('.dots i')];if(!dots.length)return;
  tr.addEventListener('scroll',()=>{const i=Math.round(tr.scrollLeft/tr.clientWidth);dots.forEach((d,k)=>d.classList.toggle('on',k===i))},{passive:true});
  if(!rm)timers.push(setInterval(()=>{const i=(Math.round(tr.scrollLeft/tr.clientWidth)+1)%dots.length;tr.scrollTo({left:i*tr.clientWidth,behavior:'smooth'})},4500))});
 const g=$('[data-gal]');if(g){const c=$('[data-cnt]'),n=g.children.length;g.addEventListener('scroll',()=>{const i=Math.round(g.scrollLeft/g.clientWidth);c.textContent=(i+1)+'/'+n;document.querySelectorAll('.gal-th').forEach((b,k)=>b.classList.toggle('on',k===i))},{passive:true})}
 document.querySelectorAll('.chips').forEach(c=>{const o=c.querySelector('.chip.on');if(o)c.scrollLeft=o.offsetLeft-c.clientWidth/2+o.clientWidth/2})}
function expiredModal(){modal(`<h2>${t('subexp')}</h2><p style="margin:0">${t('subexps')}</p><button class="btn btn-primary btn-block" data-act="closepay">${t('paynow')}</button><button class="btn btn-ghost btn-block" data-act="closemodal">${t('later')}</button>`)}

/* ======================= FIREBASE: sign-in state + live data ======================= */
let unsubs=[];
function stopListeners(){unsubs.forEach(u=>{try{u()}catch(e){}});unsubs=[];S.users=[];S.vendors={};S.payments=[];S.ads=[];S.liveAds=[];S.myAds=[]}
function listen(q,cb){unsubs.push(onSnapshot(q,s=>{cb(s);schedule()},e=>console.warn('listen',e.code||e)))}
function startListeners(){const r=AUTH.role,uid=AUTH.user.uid;
 listen(collection(db,'vendors'),s=>{const m={};s.forEach(d=>{m[d.id]=nd(d)});S.vendors=m});
 if(r==='admin'){
  listen(collection(db,'users'),s=>{S.users=s.docs.map(nd)});
  listen(collection(db,'payments'),s=>{S.payments=s.docs.map(nd)});
  listen(collection(db,'ads'),s=>{S.ads=s.docs.map(nd)});
 }else{
  listen(query(collection(db,'ads'),where('status','==','live')),s=>{S.liveAds=s.docs.map(nd)});
  if(r==='vendor'){
   listen(query(collection(db,'ads'),where('uid','==',uid)),s=>{S.myAds=s.docs.map(nd)});
   listen(query(collection(db,'payments'),where('uid','==',uid)),s=>{S.payments=s.docs.map(nd)});
  }}}
const newVendor=uid=>({uid,name:'',cat:'',dist:null,desc:'',phone:'',whatsapp:'',facebook:'',instagram:'',cover:'',photoCount:0,createdAt:serverTimestamp(),paidUntil:null});
async function enter(u,forced,pname){
 stopListeners();AUTH.user=u;AUTH.role=null;AUTH.profile=null;AUTH.ready=false;
 if(u){
  try{const a=await getDoc(doc(db,'admins',u.uid));if(a.exists())AUTH.role='admin'}catch(e){}
  if(!AUTH.role){
   try{const ud=await getDoc(doc(db,'users',u.uid));
    if(ud.exists()){AUTH.profile=nd(ud);AUTH.role=String(AUTH.profile.role||'customer').toLowerCase()==='vendor'?'vendor':'customer'}
    else{const role=forced||'customer',name=pname||(u.email||'').split('@')[0];await setDoc(doc(db,'users',u.uid),{uid:u.uid,email:(u.email||'').toLowerCase(),name,role,createdAt:serverTimestamp()});AUTH.profile={name,role};AUTH.role=role}
   }catch(e){console.warn('profile',e);AUTH.role=forced||'customer'}
  }
  if(AUTH.role==='vendor'){try{const vd=await getDoc(doc(db,'vendors',u.uid));if(!vd.exists())await setDoc(doc(db,'vendors',u.uid),newVendor(u.uid))}catch(e){console.warn('vendor doc',e)}}
  startListeners();
 }
 AUTH.ready=true;busy(false);afterAuth()}
function afterAuth(){if(!splashDone)return;noticed=false;stack=[];route=homeRoute();render();window.scrollTo(0,0)}
onAuthStateChanged(auth,u=>{if(signing)return;if(!u&&AUTH.user===null&&AUTH.ready){return}enter(u)});

/* ======================= ACTIONS ======================= */
async function adminActivate(uid,planId){const p=PLANS.find(x=>x.id===planId),v=S.vendors[uid];if(!p||!v)return;busy(true);
 try{const base=new Date(Math.max(Date.now(),trialEnd(v).getTime(),v.paidUntil?new Date(v.paidUntil).getTime():0));base.setMonth(base.getMonth()+p.months);
  await updateDoc(doc(db,'vendors',uid),{paidUntil:Timestamp.fromDate(base)});
  await addDoc(collection(db,'payments'),{uid,name:v.name||'',months:p.months,amount:p.price,method:'manual',at:serverTimestamp()});toast(t('activated'))}
 catch(e){console.error(e);toast(t('e_generic'))}busy(false)}
let LB=null;
function lbDraw(){let el=$('#lb');if(!LB){if(el)el.remove();return}
 if(!el){el=document.createElement('div');el.id='lb';document.body.appendChild(el);let x0=0;el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)lbStep(dx<0?1:-1)},{passive:true})}
 const n=curPhotos.length;
 el.innerHTML=`<button class="lb-x" data-act="lbclose" aria-label="${t('close')}">${ic('x',26)}</button><img src="${curPhotos[LB.i]}" alt="">${n>1?`<button class="lb-n prev" data-act="lbprev" aria-label="${t('prev')}">${ic('back',28)}</button><button class="lb-n next" data-act="lbnext" aria-label="${t('next')}">${ic('next',28)}</button>`:''}<span class="lb-c">${LB.i+1}/${n}</span>`}
function lbStep(d){if(!LB)return;const n=curPhotos.length;LB.i=(LB.i+d+n)%n;lbDraw()}
function galGo(d){const g=$('[data-gal]');if(!g)return;const n=g.children.length,i=Math.max(0,Math.min(n-1,Math.round(g.scrollLeft/g.clientWidth)+d));g.scrollTo({left:i*g.clientWidth,behavior:'smooth'})}
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||''))return;if(e.key==='Escape'&&LB){LB=null;lbDraw();return}const d=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0;if(!d)return;if(LB)lbStep(d);else galGo(d)});
async function movePhoto(i,j){const uid=AUTH.user.uid,l=PC[uid];if(!l||i===j||!l[i]||!l[j])return;busy(true);
 try{const [p]=l.splice(i,1);l.splice(j,0,p);await Promise.all(l.map((q,k)=>updateDoc(doc(db,'vendors',uid,'photos',q.id),{at:1e12+k})));await syncCover(uid)}
 catch(e){console.error(e);toast(t('e_generic'));delete PC[uid];ensurePhotos(uid)}busy(false);render()}
async function deleteAccount(pw){
 const u=auth.currentUser;if(!u)return;busy(true);
 try{await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,pw))}
 catch(e){busy(false);const b=$('#derr');if(b)b.textContent=['auth/wrong-password','auth/invalid-credential'].includes(e.code)?t('e_wrongpw'):authErr(e);return}
 const uid=u.uid;
 try{
  stopListeners();
  if(AUTH.role==='vendor'){
   const ps=await getDocs(collection(db,'vendors',uid,'photos'));
   for(const d of ps.docs){const p=d.data().path;if(p){try{await deleteObject(sref(getSt(),p))}catch(_){}}await deleteDoc(doc(db,'vendors',uid,'photos',d.id))}
   await deleteDoc(doc(db,'vendors',uid));
  }
  const ads=await getDocs(query(collection(db,'ads'),where('uid','==',uid)));
  for(const d of ads.docs)await deleteDoc(doc(db,'ads',d.id));
  await deleteDoc(doc(db,'users',uid));
  await deleteUser(u);
  modal('');toast(t('deleted'));
 }catch(e){console.error(e);try{startListeners()}catch(_){}const b=$('#derr');if(b)b.textContent=authErr(e)}
 busy(false)}
const ACT={
 bnprev:(d,el)=>bnGo(el,-1),bnnext:(d,el)=>bnGo(el,1),
 delacc:()=>modal(`<h2>${t('del_t')}</h2><p style="margin:0">${t('del_d')}</p><div class="f"><label for="dpw">${t('del_pw')}</label><input id="dpw" type="password" autocomplete="current-password"></div><div class="err" id="derr" role="alert"></div><button class="btn btn-bad btn-block" data-act="delgo">${t('del_go')}</button><button class="btn btn-ghost btn-block" data-act="closemodal">${t('cancel')}</button>`),
 delgo:()=>{const pw=($('#dpw')||{}).value||'';if(!pw){const b=$('#derr');if(b)b.textContent=t('e_pw');return}deleteAccount(pw)},
 install:async()=>{if(!deferredInstall)return;deferredInstall.prompt();try{await deferredInstall.userChoice}catch(e){}deferredInstall=null;render()},
 go:d=>go(d.to,{id:d.id,cat:d.cat,dist:d.dist}),
 tab:d=>go(d.to),back:()=>back(),
 lang:d=>{LANG=d.l;try{localStorage.setItem('kasaade:lang',LANG)}catch(e){}render()},
 mode:d=>{route.mode=d.m;render()},role:d=>{route.role=d.r;render()},
 filt:d=>{route[d.k]=d.v;render()},
 closemodal:()=>modal(''),closepay:()=>{modal('');go('vplan')},
 logout:async()=>{busy(true);try{await signOut(auth)}catch(e){}stopListeners();AUTH.user=null;AUTH.role=null;AUTH.profile=null;AUTH.ready=true;busy(false);noticed=false;stack=[];route={n:'auth'};render()},
 delph:d=>delPhoto(Number(d.i)),
 phmove:d=>movePhoto(Number(d.i),Number(d.j)),
 galprev:()=>galGo(-1),galnext:()=>galGo(1),
 galthumb:d=>{const g=$('[data-gal]');if(g)g.scrollTo({left:Number(d.i)*g.clientWidth,behavior:'smooth'})},
 lbopen:d=>{if(curPhotos.length){LB={i:Number(d.i)};lbDraw()}},lbclose:()=>{LB=null;lbDraw()},lbprev:()=>lbStep(-1),lbnext:()=>lbStep(1),
 reset:async()=>{const em=((draft.email)||($('#f_email')&&$('#f_email').value)||'').trim();if(!/^\S+@\S+\.\S+$/.test(em)){const b=$('#err');if(b)b.textContent=t('e_email');return}try{await sendPasswordResetEmail(auth,em);toast(t('reset_sent'))}catch(e){const b=$('#err');if(b)b.textContent=authErr(e)}},
 pay:d=>{const p=PLANS.find(x=>x.id===d.id);
  /* When PayHere is ready: if(PAYHERE.enabled) return startPayHere(p); */
  modal(`<h2>${t(p.id)}: ${rs(p.price)}</h2><p style="margin:0">${t('manual')}</p><a class="btn btn-primary btn-block" href="https://wa.me/${digits(COMPANY.phone)}?text=${encodeURIComponent('Kasaade.lk – '+t(p.id)+' '+rs(p.price))}" target="_blank" rel="noopener">${ic('chat',20)} WhatsApp</a><a class="btn btn-ghost btn-block" href="tel:${COMPANY.phone}">${ic('phone',20)} ${COMPANY.phone}</a><button class="btn btn-ghost btn-block" data-act="closemodal">${t('later')}</button>`)},
 adminplan:d=>modal(`<h2>${t('activate')}</h2><p class="muted" style="margin:0">${esc((S.vendors[d.uid]||{}).name||'')}</p>${PLANS.map(p=>`<button class="btn btn-primary btn-block" data-act="adminpay" data-uid="${esc(d.uid)}" data-plan="${p.id}">${t(p.id)} · ${rs(p.price)}</button>`).join('')}<button class="btn btn-ghost btn-block" data-act="closemodal">${t('later')}</button>`),
 adminpay:d=>{modal('');adminActivate(d.uid,d.plan)},
 adset:async d=>{busy(true);try{await updateDoc(doc(db,'ads',d.id),{status:d.s})}catch(e){console.error(e);toast(t('e_generic'))}busy(false)}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.tagName==='A')return;const f=ACT[el.dataset.act];if(f){e.preventDefault();f(el.dataset,el)}});
document.addEventListener('input',e=>{const x=e.target;if(x.name)draft[x.name]=x.value;if(x.hasAttribute&&x.hasAttribute('data-search')){route.q=x.value;$('#hb').innerHTML=homeBody()}});
document.addEventListener('change',async e=>{const x=e.target;if(!x.dataset||!x.dataset.file)return;
 if(x.dataset.file==='photos'){const fs=[...x.files];x.value='';if(fs.length)addPhotos(fs)}
 if(x.dataset.file==='adimg'&&x.files[0]){try{draft._img=await compress(x.files[0],1000,.72);toast('✓')}catch(_){}}});
document.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,k=f.dataset.form,fd=Object.fromEntries(new FormData(f)),err=m=>{const b=$('#err');if(b)b.textContent=m};
 if(k==='signup'||k==='signin'){const em=(fd.email||'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(em))return err(t('e_email'));if((fd.password||'').length<6)return err(t('e_pw'));
  if(k==='signup'){const role=route.role||'customer',name=(fd.name||'').trim();if(!name)return err(t('e_name'));
   signing=true;busy(true);
   try{const c=await createUserWithEmailAndPassword(auth,em,fd.password);signing=false;await enter(c.user,role,name)}
   catch(x){signing=false;busy(false);err(authErr(x))}return}
  busy(true);
  try{await signInWithEmailAndPassword(auth,em,fd.password)}catch(x){busy(false);err(authErr(x))}return}
 if(k==='profile'){if(!(fd.name||'').trim()||!fd.cat||fd.dist===''||!(fd.phone||'').trim())return err(t('e_req'));
  busy(true);try{await updateDoc(doc(db,'vendors',AUTH.user.uid),{name:fd.name.trim(),cat:fd.cat,dist:Number(fd.dist),desc:(fd.desc||'').trim(),phone:fd.phone.trim(),whatsapp:(fd.whatsapp||'').trim()||fd.phone.trim(),facebook:(fd.facebook||'').trim(),instagram:(fd.instagram||'').trim()});draft={};busy(false);toast(t('saved'));go('vdash')}catch(x){console.error(x);busy(false);err(t('e_generic'))}return}
 if(k==='ad'){if(!(fd.head||'').trim()||!fd.slot)return err(t('e_req'));const months=Number(fd.months||1),v=myV()||{};
  busy(true);try{await addDoc(collection(db,'ads'),{uid:AUTH.user.uid,vname:v.name||'',slot:fd.slot,head:fd.head.trim(),sub:(fd.sub||'').trim(),img:draft._img||'',months,price:(fd.slot==='main'?AD_PRICES.main:AD_PRICES.cat)*months,status:'pending',at:serverTimestamp()});draft={};busy(false);toast(t('adsent'));render()}catch(x){console.error(x);busy(false);err(t('e_generic'))}}});

/* ======================= START ======================= */
render();
setTimeout(()=>{splashDone=true;if(AUTH.ready)afterAuth();else{route={n:'boot'};render()}},3100);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
