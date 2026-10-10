// Yazdıkça öneri: ülke, şehir ve IATA kodu araması.
// Türkçe karakterler ve aksanlar katlanır (İ→i, ş→s, é→e); her karakter tek karaktere
// katlandığı için eşleşme konumu orijinal metinde vurgulamak için de kullanılabilir.

const TR={ı:'i',ş:'s',ğ:'g',ü:'u',ö:'o',ç:'c'};

export function foldChar(c){
  const l=c.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g,'');
  return TR[l]||l.charAt(0)||c;
}
export function fold(s){return Array.from(s||'',foldChar).join('');}

// İngilizce ve yaygın alternatif adlar, ör. "Thailand" veya "Bali" yazan da Tayland'ı bulsun.
export const COUNTRY_ALIASES={
  'BAE':'birlesik arap emirlikleri uae united arab emirates dubai emirates',
  'Ermenistan':'armenia','Arjantin':'argentina','Avusturya':'austria','Avustralya':'australia',
  'Azerbaycan':'azerbaijan','Belçika':'belgium','Brezilya':'brazil','Kanada':'canada',
  'İsviçre':'switzerland swiss','Küba':'cuba','Çek Cumh.':'cekya czechia czech republic',
  'Almanya':'germany deutschland','Danimarka':'denmark','Mısır':'egypt','İspanya':'spain espana',
  'Etiyopya':'ethiopia','Finlandiya':'finland','Fiji':'fiji','Fransa':'france',
  'İngiltere':'birlesik krallik united kingdom uk england britain','Gürcistan':'georgia',
  'Yunanistan':'greece','Hırvatistan':'croatia','Macaristan':'hungary','Endonezya':'indonesia bali',
  'Hindistan':'india','İtalya':'italy italia','Ürdün':'jordan','Japonya':'japan','Kenya':'kenya',
  'Kamboçya':'cambodia','Sri Lanka':'sri lanka seylan','Fas':'morocco','Maldivler':'maldives',
  'Meksika':'mexico','Malezya':'malaysia','Hollanda':'netherlands holland','Norveç':'norway',
  'Nepal':'nepal','Yeni Zelanda':'new zealand','Filipinler':'philippines','Polonya':'poland',
  'Portekiz':'portugal','Katar':'qatar','İsveç':'sweden','Singapur':'singapore','Tayland':'thailand',
  'Tunus':'tunisia','Türkiye':'turkey turkiye','ABD':'amerika usa united states america',
  'Özbekistan':'uzbekistan','Vietnam':'vietnam','Güney Afrika':'south africa',
};

// "🇹🇭 Tayland" → {flag:'🇹🇭', name:'Tayland'}
export function splitCountry(c){
  const i=c.indexOf(' ');
  return i>0?{flag:c.slice(0,i),name:c.slice(i+1)}:{flag:'',name:c};
}

// Bir alan için puan: tam eşleşme > baştan > kelime başından > içinde.
function fieldScore(field,q){
  if(!field)return 0;
  if(field===q)return 100;
  if(field.startsWith(q))return 80;
  if(field.includes(' '+q)||field.includes('-'+q)||field.includes('('+q))return 60;
  if(q.length>=4&&field.includes(q))return 30;
  return 0;
}

// En fazla 1 harf hatası (yer değiştirme, eksik, fazla) ile kelime başı eşleşmesi.
function nearPrefix(field,q){
  if(q.length<3)return false;
  return field.split(/[\s(-]+/).some(w=>{
    for(const len of [q.length-1,q.length,q.length+1]){
      if(len<1||len>w.length)continue;
      if(editDistance(w.slice(0,len),q)<=1)return true;
    }
    return false;
  });
}
function editDistance(a,b){
  const d=Array.from({length:a.length+1},(_,i)=>[i]);
  for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[a.length][b.length];
}

// Havalimanı listesinden bir kez arama dizini kurar.
export function buildIndex(airports){
  const byCountry=new Map();
  const items=airports.map(a=>{
    const {flag,name}=splitCountry(a.country);
    const item={...a,flag,countryName:name,
      fCode:fold(a.code),fName:fold(a.name),fCountry:fold(name),fAlias:fold(COUNTRY_ALIASES[name]||'')};
    if(!byCountry.has(a.country))byCountry.set(a.country,{key:a.country,flag,name,
      fName:item.fCountry,fAlias:item.fAlias,airports:[]});
    byCountry.get(a.country).airports.push(item);
    return item;
  });
  return {items,countries:[...byCountry.values()]};
}

// Sonuç: {countries, airports, fuzzy}. fuzzy=true ise sonuçlar yazım hatası toleransıyla bulundu.
export function searchPlaces(index,query,{maxCountries=4,maxAirports=8}={}){
  const q=fold(query).trim();
  if(!q)return {countries:[],airports:index.items.slice(0,maxAirports),fuzzy:false};

  let countries=index.countries
    .map(c=>({...c,score:Math.max(fieldScore(c.fName,q),fieldScore(c.fAlias,q)*0.9)}))
    .filter(c=>c.score>=50);
  let airports=index.items
    .map(a=>{
      const code=a.fCode===q?120:(q.length<=3&&a.fCode.startsWith(q)?70:0);
      const s=Math.max(code,fieldScore(a.fName,q),fieldScore(a.fCountry,q)*0.5,fieldScore(a.fAlias,q)*0.45);
      return {...a,score:s};
    })
    .filter(a=>a.score>0);

  let fuzzy=false;
  if(!countries.length&&!airports.length){
    fuzzy=true;
    countries=index.countries.filter(c=>nearPrefix(c.fName,q)||nearPrefix(c.fAlias,q)).map(c=>({...c,score:1}));
    airports=index.items.filter(a=>nearPrefix(a.fName,q)).map(a=>({...a,score:1}));
  }

  const byScore=(x,y)=>y.score-x.score||x.name.localeCompare(y.name,'tr');
  countries.sort(byScore);
  airports.sort(byScore);
  return {countries:countries.slice(0,maxCountries),airports:airports.slice(0,maxAirports),fuzzy};
}

// Vurgulama için eşleşen aralık: [başlangıç, bitiş] veya null.
export function matchRange(text,query){
  const q=fold(query).trim();
  if(!q)return null;
  const t=fold(text);
  for(let i=t.indexOf(q);i>=0;i=t.indexOf(q,i+1)){
    if(i===0||' (-'.includes(t[i-1])||q.length>=4)return [i,i+q.length];
  }
  return null;
}
