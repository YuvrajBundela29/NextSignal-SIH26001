import type { DistrictProfile, RiskScoreBreakdown, WeatherTelemetry, AppLanguage } from '../../services/landslide/types';

interface LangLabels {
  portalTitle: string;
  dangerStatus: string;
  cautionStatus: string;
  safeStatus: string;
  rain24: string;
  compRisk: string;
  avgSlope: string;
  guidelinesTitle: string;
  emergencyTitle: string;
  emergencyDesc: string;
  deocContact: string;
  ndrfHotline: string;
  disasterControl: string;
  policeHelp: string;
  advisoriesDanger: string[];
  advisoriesCaution: string[];
  advisoriesSafe: string[];
}

const TRANSLATIONS: Record<AppLanguage, LangLabels> = {
  en: {
    portalTitle: 'CITIZEN SAFETY & EARLY WARNING PORTAL (NER INDIA)',
    dangerStatus: 'HIGH LANDSLIDE DANGER - STAY ALERT & PREPARE TO EVACUATE',
    cautionStatus: 'MODERATE RISK - EXERCISE HEIGHTENED CAUTION',
    safeStatus: 'AREA STABLE & NORMAL MONITORING',
    rain24: '24h Rainfall',
    compRisk: 'Composite Risk',
    avgSlope: 'Average Slope',
    guidelinesTitle: 'IMMEDIATE CITIZEN SAFETY GUIDELINES',
    emergencyTitle: 'EMERGENCY CONTACTS & RESCUE HELPLINES',
    emergencyDesc: 'If you observe active tension cracks, bulging ground, or tilting trees, contact local authorities immediately:',
    deocContact: 'District Disaster Control (DEOC)',
    ndrfHotline: 'National Disaster Response (NDRF)',
    disasterControl: 'State Disaster Management Authority (SDMA)',
    policeHelp: 'Emergency Response Support System (ERSS)',
    advisoriesDanger: [
      'Stay strictly away from steep hill slopes, toe cuts, river banks, and waterlogged drainage channels.',
      'Avoid all non-essential road travel along hill passes, ghat roads, and active landslide corridors.',
      'If you observe tension cracks in the ground or tilting trees/poles, evacuate immediately to safe high ground.',
      'Keep an emergency grab-bag ready with drinking water, first-aid, flashlights, power banks, and personal documents.',
    ],
    advisoriesCaution: [
      'Keep track of local meteorological forecasts and district administrative safety advisories.',
      'Ensure household and community drainage channels are clear of debris, silt, and fallen boulders.',
      'Drive with extreme caution on mountain roads during rainfall showers, keeping safe distance from cuts.',
    ],
    advisoriesSafe: [
      'Current geotechnical parameters indicate baseline regional stability.',
      'Continue standard monsoon preparedness and report any newly developing ground cracks to local panchayat/DEOC.',
    ],
  },
  hi: {
    portalTitle: 'नागरिक सुरक्षा एवं भूस्खलन पूर्व चेतावनी पोर्टल (उत्तर पूर्व भारत)',
    dangerStatus: 'अत्यधिक भूस्खलन खतरा - सतर्क रहें और सुरक्षित स्थान पर जाएं',
    cautionStatus: 'मध्यम भूस्खलन जोखिम - विशेष सावधानी बरतें',
    safeStatus: 'क्षेत्र स्थिर एवं सामान्य निगरानी',
    rain24: '24 घंटे की वर्षा',
    compRisk: 'समग्र जोखिम सूचकांक',
    avgSlope: 'औसत ढलान कोण',
    guidelinesTitle: 'नागरिक सुरक्षा हेतु त्वरित दिशा-निर्देश',
    emergencyTitle: 'आपातकालीन संपर्क एवं बचाव हेल्पलाइन',
    emergencyDesc: 'यदि आपको जमीन में दरारें, पानी का अचानक रिसाव या झुकते पेड़ दिखाई दें, तो तुरंत संपर्क करें:',
    deocContact: 'जिला आपदा नियंत्रण कक्ष (DEOC)',
    ndrfHotline: 'राष्ट्रीय आपदा मोचन बल (NDRF)',
    disasterControl: 'राज्य आपदा प्रबंधन प्राधिकरण (SDMA)',
    policeHelp: 'आपातकालीन प्रतिक्रिया सहायता प्रणाली (ERSS)',
    advisoriesDanger: [
      'खड़ी पहाड़ी ढलानों, नदी तटों और जलभराव वाले नालों से तुरंत दूर रहें।',
      'पहाड़ी दर्रों और संवेदनशील घाट मार्गों पर सभी गैर-जरूरी यात्राएं तुरंत स्थगित करें।',
      'यदि जमीन में दरारें या पेड़/खंभे झुकते दिखें, तो तुरंत सुरक्षित पक्के आश्रय में जाएं।',
      'आपातकालीन बैग तैयार रखें (टॉर्च, जरूरी दवाइयां, पीने का पानी, जरूरी दस्तावेज)।',
    ],
    advisoriesCaution: [
      'स्थानीय मौसम पूर्वानुमान और जिला प्रशासन की सलाह पर लगातार नजर रखें।',
      'घर और आसपास के जल निकासी नालों को मलबे और पत्थरों से साफ रखें।',
      'बारिश के दौरान पहाड़ी सड़कों पर अत्यंत धीमी गति और सतर्कता से वाहन चलाएं।',
    ],
    advisoriesSafe: [
      'वर्तमान भू-तकनीकी आंकड़े सामान्य क्षेत्रीय स्थिरता दर्शाते हैं।',
      'मानक मानसून सुरक्षा नियमों का पालन करें और किसी भी दरार की सूचना तुरंत दें।',
    ],
  },
  as: {
    portalTitle: 'নাগৰিক সুৰক্ষা আৰু আগতীয়া সতৰ্কবাণী পৰ্টেল (উত্তৰ-পূব ভাৰত)',
    dangerStatus: 'উচ্চ ভূমিস্খলনৰ বিপদ - সতৰ্ক থাকক আৰু স্থান ত্যাগৰ বাবে সাজু হওক',
    cautionStatus: 'মধ্যমীয়া আশংকা - বিশেষ সাৱধানতা অৱলম্বন কৰক',
    safeStatus: 'অঞ্চলটো বৰ্তমান সুস্থিৰ আৰু স্বাভাৱিক',
    rain24: '২৪ ঘণ্টাৰ বৰষুণ',
    compRisk: 'সামগ্ৰিক বিপদাশংকা',
    avgSlope: 'গড় ঢালৰ কোণ',
    guidelinesTitle: 'নাগৰিক সুৰক্ষাৰ জৰুৰী নিৰ্দেশনাৱলী',
    emergencyTitle: 'জৰুৰীকালীন যোগাযোগ আৰু উদ্ধাৰ হেল্পলাইন',
    emergencyDesc: 'মাটিত ফাঁট, হঠাতে পানীৰ নিৰ্গমন বা গছ হালি পৰা দেখা পালে তাৎক্ষণিকভাৱে যোগাযোগ কৰক:',
    deocContact: 'জিলা দুৰ্যোগ নিয়ন্ত্ৰণ কক্ষ (DEOC)',
    ndrfHotline: 'ৰাষ্ট্ৰীয় দুৰ্যোগ সঁহাৰি বাহিনী (NDRF)',
    disasterControl: 'ৰাজ্যিক দুৰ্যোগ ব্যৱস্থাপনা প্ৰাধিকৰণ (ASDMA)',
    policeHelp: 'জৰুৰীকালীন সেৱা হেল্পলাইন (ERSS)',
    advisoriesDanger: [
      'থিয় পাহাৰীয়া ঢাল, নদীৰ পাৰ আৰু পানী জমা হোৱা নলা-নৰ্দমাৰ পৰা আঁতৰি থাকক।',
      'পাহাৰীয়া পথ আৰু বিপদজনক ঘাটসমূহেৰে সকলো অপ্ৰয়োজনীয় যাতায়াত বন্ধ ৰাখক।',
      'মাটিত ফাঁট মেলা বা গছ-খুঁটা হেলনীয়া হোৱা দেখিলে পলম নকৰি নিৰাপদ আশ্ৰয়স্থললৈ যাওক।',
      'জৰুৰী বেগ সাজু ৰাখক (টৰ্ছ, প্ৰাথমিক চিকিৎসাৰ ঔষধ, খোৱাপানী, গুৰুত্বপূৰ্ণ নথি-পত্ৰ)।',
    ],
    advisoriesCaution: [
      'স্থানীয় বতৰৰ আগজাননী আৰু জিলা প্ৰশাসনৰ নিৰ্দেশনাসমূহ নিয়মীয়াকৈ অনুসৰণ কৰক।',
      'ঘৰৰ আৰু অঞ্চলৰ পানী ওলাই যোৱা নলাসমূহ আৱৰ্জনাৰ পৰা পৰিষ্কাৰ কৰি ৰাখক।',
      'বৰষুণৰ সময়ত পাহাৰীয়া পথত অত্যন্ত সাৱধানে গাড়ী চলাওক।',
    ],
    advisoriesSafe: [
      'বৰ্তমান ভূ-কাৰিকৰী তথ্যই এলেকাটোত স্বাভাৱিক সুস্থিৰতা দেখুৱাইছে।',
      'বৰ্ষাকালীন নিয়মীয়া সতৰ্কতা মানি চলক আৰু যিকোনো অস্বাভাৱিক ফাঁটৰ বিষয়ে খবৰ দিয়ক।',
    ],
  },
  bn: {
    portalTitle: 'নাগরিক সুরক্ষা ও ভূমিধস পূর্ব সতর্কতা পোর্টাল (উত্তর-পূর্ব ভারত)',
    dangerStatus: 'উচ্চ ভূমিধস সতর্কতা - সতর্ক থাকুন এবং নিরাপদ স্থানে সরুন',
    cautionStatus: 'মাঝারি ঝুঁকি - অতিরিক্ত সতর্কতা অবলম্বন করুন',
    safeStatus: 'এলাকা বর্তমানে স্থিতিশীল ও স্বাভাবিক',
    rain24: '২৪ ঘণ্টার বৃষ্টিপাত',
    compRisk: 'সামগ্রিক ঝুঁকি সূচক',
    avgSlope: 'গড় ঢাল',
    guidelinesTitle: 'নাগরিক সুরক্ষায় তাৎক্ষণিক নির্দেশাবলী',
    emergencyTitle: 'জরুরি যোগাযোগ ও উদ্ধার হেল্পলাইন',
    emergencyDesc: 'মাটিতে ফাটল বা অস্বাভাবিক জলপ্রবাহ দেখলে অবিলম্বে স্থানীয় প্রশাসনকে জানান:',
    deocContact: 'জেলা দুর্যোগ নিয়ন্ত্রণ কেন্দ্র (DEOC)',
    ndrfHotline: 'জাতীয় দুর্যোগ মোকাবিলা বাহিনী (NDRF)',
    disasterControl: 'রাজ্য দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষ (SDMA)',
    policeHelp: 'জরুরি প্রতিক্রিয়া সহায়তা ব্যবস্থা (ERSS)',
    advisoriesDanger: [
      'খাড়া পাহাড়ের ঢাল, নদীর তীর এবং জল জমা নিকাশি নালা থেকে দূরে থাকুন।',
      'পাহাড়ি রাস্তায় সমস্ত অপ্রয়োজনীয় ভ্রমণ অবিলম্বে স্থগিত রাখুন।',
      'মাটিতে ফাটল বা গাছ হেলে পড়তে দেখলে কালবিলম্ব না করে নিরাপদ আশ্রয়ে যান।',
      'জরুরি ব্যাগ প্রস্তুত রাখুন (টর্চ, ওষুধ, পানীয় জল, শুকনো খাবার ও প্রয়োজনীয় নথিপত্র)।',
    ],
    advisoriesCaution: [
      'স্থানীয় আবহাওয়া বার্তা এবং জেলা প্রশাসনের সতর্কবার্তার দিকে খেয়াল রাখুন।',
      'জল নিষ্কাশন নালাগুলি মাটি ও পাথর থেকে মুক্ত রাখুন।',
      'বৃষ্টির সময় পাহাড়ি সড়কে অত্যন্ত সতর্কতার সাথে গাড়ি চালান।',
    ],
    advisoriesSafe: [
      'বর্তমান ভূতাত্ত্বিক উপাত্ত অনুসারে এলাকাটি স্থিতিশীল অবস্থায় রয়েছে।',
      'স্বাভাবিক বর্ষাকালীন নিয়ম মেনে চলুন এবং যেকোনো ফাটল দেখলে রিপোর্ট করুন।',
    ],
  },
  mni: {
    portalTitle: 'লৈবাক মীয়ামগী য়ুম্বু অমসুং ঈশিং-ঈচাও ঈ-পাউ ৱার্নিং পোর্তেল',
    dangerStatus: 'চীং নিংবা হাই রিক্স - চেকশিন্না লৈবীয়ু অমসুং শেফরক্তা চৎখিয়ু',
    cautionStatus: 'মরক চিব্বা রিক্স - চেকশিন-থৌরাং পায়খৎপীয়ু',
    safeStatus: 'অঞ্চল অসি শান্ত ওইরি',
    rain24: 'পুং ২৪ গিজা চুবা',
    compRisk: 'কম্পোজিত রিক্স',
    avgSlope: 'চীংগী ওনবা',
    guidelinesTitle: 'মীয়ামগী চেকশিন-থৌরাং নির্দেশিকা',
    emergencyTitle: 'জরুরি পাউ ফাওনবা হেল্পলাইন',
    emergencyDesc: 'লমহাংদা ঈচাও থোকপা নত্রগা লম ফাটপা উরবদি অথুবা মতমদা পাউ পীগদবনি:',
    deocContact: 'জিলা দিজাস্তর কন্ত্রোল রুম (DEOC)',
    ndrfHotline: 'নেসনেল দিজাস্তর রেস্পোন্স ফোর্স (NDRF)',
    disasterControl: 'স্তৈত দিজাস্তর মেনেজমেন্ত ওথোরিতি (SDMA)',
    policeHelp: 'ইমার্জেন্সি হেল্পলাইন (ERSS)',
    advisoriesDanger: [
      'খেন্না থম্বা চীং মপান্দগী অমসুং ঈরেল মপান্দগী অথুবা মতমদা লাপ্না লৈবীয়ু।',
      'চীংগী লম্বীশিংদা চৎ-থোক তৌবা লেপপীয়ু।',
      'লৈবাক ফাটপা নত্রগা উ-পাম্বী হেন্দোরকপা উরবদি অথুবদা মীয়াম পুল্লপ হোংদোকপীয়ু।',
      'জরুরি পোৎলম (টোর্চ, হিদাক, থক্নবা ঈশিং, দরকারি চে-চাং) শেদুনা থম্বীয়ু।',
    ],
    advisoriesCaution: [
      'লোকেল নোং-চিংগী পাউ অমসুং এদমিনিস্ত্রেসনগী পাউ মীয়াম্না চেকশিন্না তাবীগদবনি।',
      'ঈশিং চেনবা নলাশিং শেংনা থম্বীয়ু।',
    ],
    advisoriesSafe: [
      'হৌজিক্কী ওইনা লম অসিদা লৈবাক নিংবগী ফিভম শান্ত ওইরি।',
    ],
  },
  lus: {
    portalTitle: 'MIPUI HIMNA LEH LEILASIN VENCHHUNG PORTAL (NER INDIA)',
    dangerStatus: 'LEILASIN HLAUHLAWM CHUNGCHUANG - HLAUHTHAWNNA NENA INVEN TUR',
    cautionStatus: 'HLAUHLAWM ZAWNG A AWM - FIMKHUR A NGAI',
    safeStatus: 'HMUN HIM LEH HMANGAIHNA NENA ENZUI MEK',
    rain24: 'Darkar 24 Ruahsur',
    compRisk: 'Risk Tehchhuah',
    avgSlope: 'Chhuk-Chhoh Dan',
    guidelinesTitle: 'MIPUI HIMNA ATANGA THURAWNTE',
    emergencyTitle: 'KHAWPUI LEH CHHIATRUPNA HELPLINE',
    emergencyDesc: 'Leilung khi emaw, thing thal thluang emaw i hmuh chuan a rang lamin DEOC hriattir rawh:',
    deocContact: 'District Emergency Operation Center (DEOC)',
    ndrfHotline: 'National Disaster Response Force (NDRF)',
    disasterControl: 'State Disaster Management Authority (SDMA)',
    policeHelp: 'Emergency Response Support System (ERSS)',
    advisoriesDanger: [
      'Kham chung leh kawngpuia lei chim theihna hmun atangin inthiarfihlim vat rawh.',
      'Tlangkawng zawh hrim hrim a tul lo anih chuan thulh rih tur a ni.',
      'Leilung a khi emaw tui a chhuah chuan rang takin hmun himah insawn rawh.',
      'Hmanrua pawimawh (Torch, damdawi, tui thianghlim, lehkha pawimawh) keng reng rawh.',
    ],
    advisoriesCaution: [
      'Khawchin chanchin leh sorkar thuchhuahte ngaihven reng rawh.',
      'Tuihawk luanna te tulsual awm lovin tifai rawh.',
    ],
    advisoriesSafe: [
      'Tun dinhmunah leilung a la nghet tawk a ni.',
    ],
  },
  kha: {
    portalTitle: 'KA PORTAL JINGIADA BA JINGMAHAM SHWA NA KA JINGTWA KA KHYNDEW (NER)',
    dangerStatus: 'KA JINGMA BA KHRAW NA KA JINGTWA KHYNDEW - MAHAM BA KIEH SHROH',
    cautionStatus: 'DON KA JINGMA - PHIKHIR SHROH',
    safeStatus: 'KA SHNONG KA THAW KA SHNGIAIN',
    rain24: 'Jinghap Slap 24 Kynta',
    compRisk: 'Jingkhein Jingma',
    avgSlope: 'Ka Jingriam Lum',
    guidelinesTitle: 'KI JINGBTHAH IADA NA KA BYNTA KI PAIBAH',
    emergencyTitle: 'KI HELPLINE PYRTOI HA KA POR JINGMA',
    emergencyDesc: 'Lada phi iohi ba pait ka khyndew lane ba noh ki dieng, pyntip mar-mar sha:',
    deocContact: 'District Emergency Operation Center (DEOC)',
    ndrfHotline: 'National Disaster Response Force (NDRF)',
    disasterControl: 'State Disaster Management Authority (SDMA)',
    policeHelp: 'Emergency Response Support System (ERSS)',
    advisoriesDanger: [
      'Kieng jngai na ki lum ba thie, ki nala um ba khlai, bad ki wah bah.',
      'Sangeh lut ia ki jingleit jinglei ha ki surok lum ba don jingma.',
      'Lada pait ka khyndew, kynriah mardor sha ki jaka ba shngiain.',
      'Pynkhreh ia ka pla jingiada (Torch, dawai, umdih, ki kot ki sla ba kongsan).',
    ],
    advisoriesCaution: [
      'Bud thuh ia ka khubor suinbneng bad ki jingbthah jong ka District Administration.',
      'Pynkhuid ia ki nala pynkit um ban lait na ka jingsah ktieh bad maw.',
    ],
    advisoriesSafe: [
      'Ka jaka ka don ha ka kyrdan ba shngiain mynta.',
    ],
  },
  ne: {
    portalTitle: 'नागरिक सुरक्षा तथा पहिरो पूर्व चेतावनी पोर्टल (उत्तर पूर्व भारत)',
    dangerStatus: 'उच्च पहिरो जोखिम - सतर्क रहनुहोस् र सुरक्षित स्थानमा जानुहोस्',
    cautionStatus: 'मध्यम जोखिम - विशेष सावधानी अपनाउनुहोस्',
    safeStatus: 'क्षेत्र स्थिर तथा सामान्य निगरानीमा',
    rain24: '२४ घण्टाको वर्षा',
    compRisk: 'समग्र जोखिम स्तर',
    avgSlope: 'औसत भिरालोपन',
    guidelinesTitle: 'नागरिक सुरक्षाका लागि तुरुन्त निर्देशनहरू',
    emergencyTitle: 'आपतकालीन सम्पर्क तथा उद्धार हेल्पलाइन',
    emergencyDesc: 'यदि जमिनमा चिरा परेको, पानीको अनौठो बहाव वा रुख ढल्किन थालेको देखेमा तुरुन्त सम्पर्क गर्नुहोस्:',
    deocContact: 'जिल्ला विपद् नियन्त्रण कक्ष (DEOC)',
    ndrfHotline: 'राष्ट्रिय विपद् प्रतिकार्य बल (NDRF)',
    disasterControl: 'प्रदेश विपद् व्यवस्थापन प्राधिकरण (SDMA)',
    policeHelp: 'आपतकालीन प्रतिक्रिया सहायता प्रणाली (ERSS)',
    advisoriesDanger: [
      'भिरालो पहाडी पाखा, खोला किनारा र पहिरोग्रस्त क्षेत्रबाट तुरुन्त टाढा रहनुहोस्।',
      'पहाडी सडक र जोखिमपूर्ण खण्डहरूमा अनावश्यक यात्रा तुरुन्त बन्द गर्नुहोस्।',
      'जमिनमा नयाँ चिरा परेको देखेमा बिना ढिलाइ सुरक्षित आश्रयस्थलमा जानुहोस्।',
      'आपतकालीन झोला तयार राख्नुहोस् (टर्च, प्राथमिक उपचार औषधि, पिउने पानी, कागजातहरू)।',
    ],
    advisoriesCaution: [
      'स्थानीय मौसम पूर्वानुमान तथा जिल्ला प्रशासनको निर्देशनहरू नियमित हेर्नुहोस्।',
      'घर तथा वरपरका पानी निकास हुने नालाहरू सफा राख्नुहोस्।',
      'झरी परेको समयमा पहाडी सडकमा सवारी चलाउँदा विशेष सतर्कता अपनाउनुहोस्।',
    ],
    advisoriesSafe: [
      'हालको भू-प्राविधिक तथ्याङ्कले क्षेत्र सामान्य र स्थिर रहेको देखाउँछ।',
      'वर्षायामको सामान्य नियमहरू पालना गर्नुहोस् र कुनै असामान्य परिवर्तन देखिए जानकारी दिनुहोस्।',
    ],
  },
};

export class CitizenView {
  private container: HTMLElement;
  private lang: AppLanguage = 'en';

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
  }

  private getDistrictName(d: DistrictProfile): string {
    switch (this.lang) {
      case 'hi': return d.nameHi || d.name;
      case 'as': return d.nameAs || d.name;
      case 'bn': return d.nameBn || d.name;
      case 'mni': return d.nameMni || d.name;
      case 'lus': return d.nameLus || d.name;
      case 'kha': return d.nameKha || d.name;
      case 'ne': return d.nameNe || d.name;
      default: return d.name;
    }
  }

  public render(district: DistrictProfile, risk: RiskScoreBreakdown, weather: WeatherTelemetry) {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.en;
    const isDanger = risk.level === 'CRITICAL' || risk.level === 'HIGH';
    const isCaution = risk.level === 'MODERATE';

    const statusTitle = isDanger
      ? t.dangerStatus
      : isCaution
      ? t.cautionStatus
      : t.safeStatus;

    const statusBg = isDanger ? '#ef4444' : isCaution ? '#eab308' : '#22c55e';
    const districtName = this.getDistrictName(district);

    const advisories = isDanger
      ? t.advisoriesDanger
      : isCaution
      ? t.advisoriesCaution
      : t.advisoriesSafe;

    this.container.innerHTML = `
      <div style="max-width: 860px; margin: 0 auto; padding: 20px 16px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; box-sizing: border-box;">
        
        <!-- Status Hero Card -->
        <div style="background: ${statusBg}15; border: 2px solid ${statusBg}; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 24px; box-shadow: 0 0 20px ${statusBg}20;">
          <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px;">
            ${t.portalTitle}
          </div>
          <div style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 8px 0;">
            ${districtName}, ${district.state}
          </div>
          <div style="display: inline-block; padding: 6px 18px; border-radius: 20px; background: ${statusBg}; color: #ffffff; font-weight: 800; font-size: 13px; margin-bottom: 12px; letter-spacing: 0.5px;">
            ${statusTitle}
          </div>
          <div style="font-size: 13px; color: #e2e8f0; max-width: 680px; margin: 0 auto; line-height: 1.6;">
            ${risk.dominantTrigger ? `Primary Trigger: <strong style="color:${statusBg};">${risk.dominantTrigger}</strong>. ` : ''}${risk.advisoryEn || ''}
          </div>
        </div>

        <!-- 3-Column Local Status -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px;">
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              ${t.rain24}
            </div>
            <div style="font-size: 26px; font-weight: 800; color: #38bdf8; margin-top: 4px;">
              ${weather.rainfall24hMm} <span style="font-size: 12px; font-weight: 400; color: #64748b;">mm</span>
            </div>
          </div>
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              ${t.compRisk}
            </div>
            <div style="font-size: 26px; font-weight: 800; color: ${statusBg}; margin-top: 4px;">
              ${risk.compositeScore}<span style="font-size: 13px; color: #64748b;">/100</span>
            </div>
          </div>
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              ${t.avgSlope}
            </div>
            <div style="font-size: 26px; font-weight: 800; color: #f59e0b; margin-top: 4px;">
              ${district.averageSlopeDeg}&deg;
            </div>
          </div>
        </div>

        <!-- Citizen Safety Checklist -->
        <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8;"></span>
            ${t.guidelinesTitle}
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${advisories.map((a, i) => `
              <div style="display: flex; gap: 12px; align-items: flex-start; background: #0b1120; padding: 12px 14px; border-radius: 8px; border: 1px solid #1e293b;">
                <span style="background: #1e293b; color: #38bdf8; font-size: 11px; font-weight: 800; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  ${i + 1}
                </span>
                <span style="font-size: 12px; color: #e2e8f0; line-height: 1.5;">${a}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Emergency Helplines -->
        <div style="background: linear-gradient(135deg, #180d0d 0%, #0f172a 100%); border: 1px solid #ef444440; border-radius: 12px; padding: 20px;">
          <div style="font-size: 13px; font-weight: 800; color: #ef4444; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${t.emergencyTitle}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 14px;">
            ${t.emergencyDesc}
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
              <div style="font-size: 10px; color: #94a3b8;">${t.deocContact}</div>
              <div style="font-size: 15px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${district.deocContact}</div>
            </div>
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
              <div style="font-size: 10px; color: #94a3b8;">${t.policeHelp}</div>
              <div style="font-size: 15px; font-weight: 800; color: #22c55e; margin-top: 4px;">112 (Toll Free)</div>
            </div>
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
              <div style="font-size: 10px; color: #94a3b8;">${t.disasterControl}</div>
              <div style="font-size: 15px; font-weight: 800; color: #f59e0b; margin-top: 4px;">1070 / 1077</div>
            </div>
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
              <div style="font-size: 10px; color: #94a3b8;">${t.ndrfHotline}</div>
              <div style="font-size: 15px; font-weight: 800; color: #ef4444; margin-top: 4px;">011-24363260</div>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}
