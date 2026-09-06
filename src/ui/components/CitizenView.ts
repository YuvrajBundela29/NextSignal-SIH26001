import type { DistrictProfile, RiskScoreBreakdown, WeatherTelemetry, AppLanguage } from '../../services/landslide/types';
import { NER_DISTRICTS } from '../../services/landslide/ner-districts';
import { groundReportsService, type GroundReport } from '../../services/landslide/ground-reports';
import { GroundReportModal } from './GroundReportModal';

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
  reportHazardBtn: string;
  communityReportsTitle: string;
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
    reportHazardBtn: 'REPORT A HAZARD / GROUND CONDITION',
    communityReportsTitle: 'COMMUNITY & FIELD GROUND REPORTS',
    advisoriesDanger: [
      'Avoid all non-essential travel along identified hillside highway corridors.',
      'Move immediately to designated safe elevation shelters if tension cracks widen.',
      'Stay away from steep natural slopes, river banks, and mountain drainage channels.',
      'Keep emergency grab-bag ready with drinking water, torch, medications, and IDs.',
    ],
    advisoriesCaution: [
      'Monitor local meteorological advisories and rainfall updates continuously.',
      'Ensure hillside retaining walls and household stormwater drains are clear.',
      'Drive cautiously on hill roads; watch for loose debris and small rockfalls.',
    ],
    advisoriesSafe: [
      'Normal baseline geohazard conditions detected.',
      'Maintain awareness of seasonal monsoon trends and standard slope safety.',
    ],
  },
  hi: {
    portalTitle: 'नागरिक सुरक्षा एवं भूस्खलन पूर्व चेतावनी पोर्टल (उत्तर पूर्व भारत)',
    dangerStatus: 'उच्च भूस्खलन खतरा - सतर्क रहें एवं सुरक्षित स्थान पर जाएं',
    cautionStatus: 'मध्यम जोखिम - अतिरिक्त सावधानी बरतें',
    safeStatus: 'क्षेत्र स्थिर एवं सामान्य निगरानी में',
    rain24: '24 घंटे की वर्षा',
    compRisk: 'समग्र जोखिम',
    avgSlope: 'औसत ढलान',
    guidelinesTitle: 'नागरिकों हेतु तत्काल सुरक्षा दिशानिर्देश',
    emergencyTitle: 'आपातकालीन संपर्क एवं आपदा नियंत्रण कक्ष',
    emergencyDesc: 'यदि आपको जमीन में दरारें, झुकते पेड़ या पत्थरों का गिरना दिखाई दे तो तुरंत सूचित करें:',
    deocContact: 'जिला आपदा नियंत्रण कक्ष (DEOC)',
    ndrfHotline: 'राष्ट्रीय आपदा मोचन बल (NDRF)',
    disasterControl: 'राज्य आपदा प्रबंधन प्राधिकरण (SDMA)',
    policeHelp: 'आपातकालीन प्रतिक्रिया प्रणाली (ERSS)',
    reportHazardBtn: 'भूस्खलन या खतरे की सूचना दें (फोटो/वीडियो)',
    communityReportsTitle: 'नागरिक एवं फील्ड ग्राउंड रिपोर्ट',
    advisoriesDanger: [
      'पहाड़ी राजमार्गों और जोखिम भरे ढलानों पर अनावश्यक यात्रा से बचें।',
      'दरारें चौड़ी होने पर तुरंत नजदीकी सुरक्षित आश्रय स्थलों में जाएं।',
      'नदी किनारों और तेज ढलानों वाले रास्तों से दूर रहें।',
      'आवश्यक दस्तावेज, टार्च और दवाइयों से युक्त इमरजेंसी बैग तैयार रखें।',
    ],
    advisoriesCaution: [
      'मौसम विभाग और जिला प्रशासन के निर्देशों का पालन करें।',
      'नालियों और जल निकासी को खुला रखें ताकि पानी ढलान पर न भरे।',
    ],
    advisoriesSafe: [
      'वर्तमान में भूस्खलन का कोई तात्कालिक खतरा नहीं है।',
    ],
  },
  as: {
    portalTitle: 'নাগৰিক সুৰক্ষা আৰু আগতীয়া সতৰ্কবাৰ্তা প\'ৰ্টেল (উত্তৰ-পূৰ্বাঞ্চল)',
    dangerStatus: 'উচ্চ ভূমিস্খলনৰ বিপদ - সতৰ্ক থাকক আৰু নিৰাপদ স্থানলৈ যাওক',
    cautionStatus: 'মধ্যমীয়া বিপদ - বিশেষ সাৱধানতা অৱলম্বন কৰক',
    safeStatus: 'অঞ্চল সুস্থিৰ আৰু স্বাভাৱিক নিৰীক্ষণ চলি আছে',
    rain24: '২৪ ঘণ্টাৰ বৰষুণ',
    compRisk: 'সামগ্ৰিক বিপদাশংকা',
    avgSlope: 'গড় হেলনীয়া ঢাল',
    guidelinesTitle: 'নাগৰিকৰ বাবে জৰুৰী সুৰক্ষা নিৰ্দেশনাৱলী',
    emergencyTitle: 'জৰুৰীকালীন যোগাযোগ আৰু উদ্ধাৰ হেল্পলাইন',
    emergencyDesc: 'মাটিত ফাঁট মেলা, গছ হেলনীয়া হোৱা বা মাটি খহি পৰা দেখা পালে লগে লগে জনাওক:',
    deocContact: 'জিলা দুৰ্যোগ নিয়ন্ত্ৰণ কক্ষ (DEOC)',
    ndrfHotline: 'ৰাষ্ট্ৰীয় দুৰ্যোগ সঁহাৰি বাহিনী (NDRF)',
    disasterControl: 'ৰাজ্যিক দুৰ্যোগ ব্যৱস্থাপনা কৰ্তৃপক্ষ (SDMA)',
    policeHelp: 'জৰুৰীকালীন সঁহাৰি সেৱা (ERSS)',
    reportHazardBtn: 'ভূমিস্খলন বা বিপদৰ ৰিপ\'ৰ্ট কৰক (ফটো/ভিডিঅ\')',
    communityReportsTitle: 'নাগৰিক আৰু ফিল্ড গ্ৰাউণ্ড ৰিপ\'ৰ্টসমূহ',
    advisoriesDanger: [
      'পাহাৰীয়া পথত সকলো অনাহুত যাতায়াত স্থগিত ৰাখক।',
      'ফাঁট বৃদ্ধি পালে নিকটৱৰ্তী নিৰাপদ আশ্ৰয় শিবিৰলৈ যাওক।',
      'পাহাৰৰ তীব্ৰ ঢাল আৰু নদীৰ পাৰৰ পৰা আঁতৰি থাকক।',
    ],
    advisoriesCaution: [
      'বতৰৰ সতৰ্কবাৰ্তা আৰু জিলা প্ৰশাসনৰ নিৰ্দেশ অনুসৰণ কৰক।',
      'পানী নিষ্কাশন নলাসমূহ পৰিষ্কাৰ কৰি ৰাখক।',
    ],
    advisoriesSafe: [
      'বৰ্তমান অঞ্চলটোত ভূমিস্খলনৰ কোনো তাৎক্ষণিক সম্ভাৱনা নাই।',
    ],
  },
  bn: {
    portalTitle: 'নাগরিক সুরক্ষা ও আগাম সতর্কতা পোর্টাল (উত্তর-পূর্ব ভারত)',
    dangerStatus: 'উচ্চ ভূমিধসের ঝুঁকি - সতর্ক থাকুন ও নিরাপদ স্থানে যান',
    cautionStatus: 'মাঝারি ঝুঁকি - বাড়তি সতর্কতা অবলম্বন করুন',
    safeStatus: 'এলাকা স্থিতিশীল ও স্বাভাবিক পর্যবেক্ষণে রয়েছে',
    rain24: '২৪ ঘণ্টার বৃষ্টিপাত',
    compRisk: 'সামগ্রিক ঝুঁকি সূচক',
    avgSlope: 'গড় ঢাল',
    guidelinesTitle: 'নাগরিকদের জন্য জরুরি সুরক্ষা নির্দেশিকা',
    emergencyTitle: 'জরুরি যোগাযোগ ও উদ্ধার হেল্পলাইন',
    emergencyDesc: 'মাটিতে ফাটল বা ভূমিধসের লক্ষণ দেখা দিলে অবিলম্বে জানান:',
    deocContact: 'জেলা বিপর্যয় নিয়ন্ত্রণ কেন্দ্র (DEOC)',
    ndrfHotline: 'জাতীয় বিপর্যয় মোকাবিলা বাহিনী (NDRF)',
    disasterControl: 'রাজ্য বিপর্যয় মোকাবিলা কর্তৃপক্ষ (SDMA)',
    policeHelp: 'জরুরি সহায়তা ব্যবস্থা (ERSS)',
    reportHazardBtn: 'ভূমিধস বা ঝুঁকির তথ্য রিপোর্ট করুন',
    communityReportsTitle: 'নাগরিক ও ফিল্ড গ্রাউন্ড রিপোর্ট',
    advisoriesDanger: [
      'পাহাড়ি রাস্তায় অপ্রয়োজনীয় চলাচল এড়িয়ে চলুন।',
      'ফাটল চওড়া হলে অবিলম্বে নিরাপদ আশ্রয়কেন্দ্রে যান।',
      'খাড়া ঢাল ও পাহাড়ি নদীর তীর থেকে দূরে থাকুন।',
    ],
    advisoriesCaution: [
      'আবহাওয়ার খবর এবং জেলা প্রশাসনের বিজ্ঞপ্তিতে নজর রাখুন।',
    ],
    advisoriesSafe: [
      'বর্তমানে এলাকায় ভূমিধসের সরাসরি ঝুঁকি নেই।',
    ],
  },
  mni: {
    portalTitle: 'নাগরিক য়ুম্বু অমসুং লৈবাক নিংবগী অহানবা চেকশিন ৱাফম (NER)',
    dangerStatus: 'লৈবাক নিংবগী য়াম্না শাথিবা খুদোংথিব - চেকশিন্না লৈবীয়ু',
    cautionStatus: 'চাউনা খুদোংথিবা লৈ - চেকশিন্না লৈবীয়ু',
    safeStatus: 'হৌজিক্কী ওইনা লম অসিদা লৈবাক নিংবগী ফিভম শান্ত ওইরি',
    rain24: 'পুং ২৪গী নোংচুবা',
    compRisk: 'খুদোংথিবগী চাং',
    avgSlope: 'চীংগী চিংখৈ চাং',
    guidelinesTitle: 'মীয়ামগী অথুবা সুৰক্ষা চেকশিন-ৱাফমশিং',
    emergencyTitle: 'জরুরি হেল্পলাইন নম্বরশিং',
    emergencyDesc: 'লৈবাক ফাটপা নত্রগা উ-পাম্বী হেন্দোরকপা উরবদি অথুবদা খঙহনবীয়ু:',
    deocContact: 'ডিস্ট্রিক্ট দিজাস্টার কন্ত্রোল (DEOC)',
    ndrfHotline: 'নেস্নেল দিজাস্টার রেস্পোন্স ফোর্স (NDRF)',
    disasterControl: 'স্তেত দিজাস্টার মেনেজমেন্ত ওথোরিতি (SDMA)',
    policeHelp: 'ইমর্জেন্সী রেস্পোন্স সপোর্ত সিস্তেম (ERSS)',
    reportHazardBtn: 'লৈবাক নিংবগী পাউ ইমেল/ফটো থাবীয়ু',
    communityReportsTitle: 'মীয়াম অমসুং ফিল্ড গ্রাউণ্ড রিপোর্ট',
    advisoriesDanger: [
      'চীংগী লম্বীশিংদা চৎ-থোক তৌবা লেপপীয়ু।',
      'লৈবাক ফাটপা উরবদি অথুবদা মীয়াম পুল্লপ হোংদোকপীয়ু।',
      'জরুরি পোৎলম (টোর্চ, হিদাক, থক্নবা ঈশিং) শেদুনা থম্বীয়ু।',
    ],
    advisoriesCaution: [
      'লোকেল নোং-চিংগী পাউ মীয়াম্না চেকশিন্না তাবীগদবনি।',
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
    reportHazardBtn: 'LEILASIN CHANCHIN REPORT RAWH (PHOTO/VIDEO)',
    communityReportsTitle: 'MIPUI LEH FIELD OFFICIAL REPORT-TE',
    advisoriesDanger: [
      'Kham chung leh kawngpuia lei chim theihna hmun atangin inthiarfihlim vat rawh.',
      'Tlangkawng zawh hrim hrim a tul lo anih chuan thulh rih tur a ni.',
      'Leilung a khi emaw tui a chhuah chuan rang takin hmun himah insawn rawh.',
      'Hmanrua pawimawh (Torch, damdawi, tui thianghlim, lehkha pawimawh) keng reng rawh.',
    ],
    advisoriesCaution: [
      'Khawchin chanchin leh sorkar thuchhuahte ngaihven reng rawh.',
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
    reportHazardBtn: 'PYNTIP IA KA JINGTWA KHYNDEW (PHOTO/VIDEO)',
    communityReportsTitle: 'KI KHUBOR PAIBAH NA KHYNDEW',
    advisoriesDanger: [
      'Kieng jngai na ki lum ba thie, ki nala um ba khlai, bad ki wah bah.',
      'Sangeh lut ia ki jingleit jinglei ha ki surok lum ba don jingma.',
      'Lada pait ka khyndew, kynriah mardor sha ki jaka ba shngiain.',
      'Pynkhreh ia ka pla jingiada (Torch, dawai, umdih, ki kot ki sla ba kongsan).',
    ],
    advisoriesCaution: [
      'Bud thuh ia ka khubor suinbneng bad ki jingbthah jong ka District Administration.',
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
    reportHazardBtn: 'पहिरो वा जोखिमको फोटो/भिडियो रिपोर्ट गर्नुहोस्',
    communityReportsTitle: 'नागरिक तथा फिल्ड रिपोर्टहरू',
    advisoriesDanger: [
      'भिरालो पहाडी पाखा, खोला किनारा र पहिरोग्रस्त क्षेत्रबाट तुरुन्त टाढा रहनुहोस्।',
      'पहाडी सडक र जोखिमपूर्ण खण्डहरूमा अनावश्यक यात्रा तुरुन्त बन्द गर्नुहोस्।',
      'जमिनमा नयाँ चिरा परेको देखेमा बिना ढिलाइ सुरक्षित आश्रयस्थलमा जानुहोस्।',
      'आपतकालीन झोला तयार राख्नुहोस् (टर्च, प्राथमिक उपचार औषधि, पिउने पानी, कागजातहरू)।',
    ],
    advisoriesCaution: [
      'स्थानीय मौसम पूर्वानुमान तथा जिल्ला प्रशासनको निर्देशनहरू नियमित हेर्नुहोस्।',
    ],
    advisoriesSafe: [
      'हालको भू-प्राविधिक तथ्याङ्कले क्षेत्र सामान्य र स्थिर रहेको देखाउँछ।',
    ],
  },
};

export class CitizenView {
  private container: HTMLElement;
  private lang: AppLanguage = 'en';
  private currentDistrict: DistrictProfile = NER_DISTRICTS[0];
  private onSelectDistrictCallback?: (districtId: string) => void;

  constructor(containerId: string, onSelectDistrict?: (districtId: string) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.onSelectDistrictCallback = onSelectDistrict;
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
    this.currentDistrict = district;
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

    const districtReports = groundReportsService.getReportsForDistrict(district.id);

    this.container.innerHTML = `
      <div style="max-width: 880px; margin: 0 auto; padding: 20px 16px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #f8fafc; box-sizing: border-box;">
        
        <!-- Location Selector & GPS Header Bar -->
        <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">📍</span>
            <div>
              <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
                Selected District Area
              </div>
              <div style="font-size: 14px; font-weight: 800; color: #38bdf8;">
                ${districtName}, ${district.state}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <select id="citizen-district-select" style="background: #0b1120; border: 1px solid #334155; color: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
              ${NER_DISTRICTS.map((d) => `
                <option value="${d.id}" ${d.id === district.id ? 'selected' : ''}>
                  ${this.getDistrictName(d)} (${d.state})
                </option>
              `).join('')}
            </select>
            <button id="btn-citizen-gps" style="background: #0284c720; border: 1px solid #0284c7; color: #38bdf8; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <span>🛰️</span> My Location
            </button>
          </div>
        </div>

        <!-- Hero Hazard Report Button -->
        <div style="margin-bottom: 24px;">
          <button id="btn-open-ground-report" style="width: 100%; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); border: 1px solid #fb923c; color: #ffffff; font-size: 14px; font-weight: 900; padding: 14px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 20px rgba(234, 88, 12, 0.4); text-transform: uppercase; letter-spacing: 0.5px; transition: transform 0.15s ease;">
            <span style="font-size: 20px;">📸</span> ${t.reportHazardBtn}
          </button>
        </div>

        <!-- Status Hero Card -->
        <div style="background: ${statusBg}15; border: 2px solid ${statusBg}; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 24px; box-shadow: 0 0 25px ${statusBg}20;">
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

        <!-- Community Ground Reports Feed Section -->
        <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
              <span>📍</span> ${t.communityReportsTitle} (${districtReports.length})
            </div>
            <span style="font-size: 10px; color: #94a3b8;">${districtName} Sector</span>
          </div>

          ${districtReports.length === 0 ? `
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 11px; background: #0b1120; border-radius: 8px;">
              No community reports submitted in this district yet. Use the "Report a Hazard" button above if you observe slope cracks or road blockage.
            </div>
          ` : `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
              ${districtReports.map((r) => {
                const isVerified = r.status === 'VERIFIED';
                const isEscalated = r.status === 'ESCALATED';
                const pillColor = isEscalated ? '#ef4444' : isVerified ? '#22c55e' : '#eab308';

                return `
                  <div class="citizen-community-report-card" data-id="${r.id}" style="background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; display: flex; gap: 10px; cursor: pointer;">
                    <div style="width: 50px; height: 50px; border-radius: 6px; overflow: hidden; background: #020617; border: 1px solid #1e293b; flex-shrink: 0;">
                      <img src="${r.mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Report Media" />
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <span style="font-size: 11px; font-weight: 700; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                          ${r.categoryLabel}
                        </span>
                        <span style="font-size: 8px; font-weight: 800; background: ${pillColor}20; color: ${pillColor}; border: 1px solid ${pillColor}; padding: 1px 4px; border-radius: 3px;">
                          ${r.status}
                        </span>
                      </div>
                      <div style="font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${r.locationName}
                      </div>
                      <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
                        ${new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; ${r.reporterRole}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
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

    this.bindEvents(risk, weather);
  }

  private bindEvents(risk: RiskScoreBreakdown, weather: WeatherTelemetry) {
    // Open Ground Report Modal Button
    this.container.querySelector('#btn-open-ground-report')?.addEventListener('click', () => {
      const modal = new GroundReportModal(this.currentDistrict, () => {
        this.render(this.currentDistrict, risk, weather);
      });
      modal.open();
    });

    // District Selector Dropdown
    const selDist = this.container.querySelector('#citizen-district-select') as HTMLSelectElement;
    selDist?.addEventListener('change', () => {
      const id = selDist.value;
      if (this.onSelectDistrictCallback) {
        this.onSelectDistrictCallback(id);
      }
    });

    // GPS Auto-Detect Button
    const btnGps = this.container.querySelector('#btn-citizen-gps') as HTMLButtonElement;
    btnGps?.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        btnGps.textContent = '🛰️ Finding...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Find closest district
            let closestDist = NER_DISTRICTS[0];
            let minDist = Infinity;
            NER_DISTRICTS.forEach((d) => {
              const dist = Math.hypot(d.lat - pos.coords.latitude, d.lon - pos.coords.longitude);
              if (dist < minDist) {
                minDist = dist;
                closestDist = d;
              }
            });
            btnGps.textContent = `✓ ${closestDist.name}`;
            if (this.onSelectDistrictCallback) {
              this.onSelectDistrictCallback(closestDist.id);
            }
          },
          () => {
            btnGps.textContent = '📍 East Khasi Hills';
            if (this.onSelectDistrictCallback) {
              this.onSelectDistrictCallback('east_khasi_hills');
            }
          },
          { timeout: 5000 }
        );
      }
    });

    // Click on Community Report Card
    const reportCards = this.container.querySelectorAll('.citizen-community-report-card');
    reportCards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (id) {
          const report = groundReportsService.getReportById(id);
          if (report) {
            alert(`Report #${report.id}\nCategory: ${report.categoryLabel}\nLocation: ${report.locationName}\nStatus: ${report.status}\n\nObservation: ${report.description}`);
          }
        }
      });
    });
  }
}
