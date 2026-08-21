import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { useMember } from '../memberContext.jsx';

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
  { id: 'gu', label: 'ગુજરાતી' },
];

const CONTENT = {
  en: [
    {
      icon: 'droplet',
      iconStyle: { background: 'var(--risk-high-bg)', color: 'var(--risk-high)' },
      title: 'Understanding Your Diabetes Risk',
      paragraphs: [
        'Your HbA1c level of 8.4% indicates that your blood sugar has been consistently high over the past 2–3 months. This puts you at significant risk for Type 2 Diabetes and its complications.',
        'Diabetes can affect your eyes, kidneys, nerves, and heart if blood sugar remains uncontrolled. The good news is that with proper management, these complications can be prevented or delayed.',
      ],
    },
    {
      icon: 'leaf',
      iconStyle: { background: 'var(--plum-100)', color: 'var(--plum-700)' },
      title: 'Diet Recommendations',
      list: [
        'Choose whole grains (brown rice, whole wheat roti) over refined grains',
        'Include plenty of vegetables — aim for half your plate',
        'Limit sugar, sweets, soft drinks, and fruit juices',
        'Reduce salt intake to less than 5g per day',
        'Choose lean proteins — fish, dal, legumes, tofu',
        'Avoid deep-fried foods and trans fats',
        'Eat smaller, more frequent meals to maintain steady blood sugar',
      ],
    },
    {
      icon: 'run',
      iconStyle: { background: 'var(--gold-100)', color: 'var(--gold-600)' },
      title: 'Exercise Guidance',
      list: [
        'Start with 30 minutes of brisk walking daily',
        'Gradually increase to 150 minutes of moderate exercise per week',
        'Include strength training 2–3 times per week',
        'Avoid prolonged sitting — stand or stretch every 30 minutes',
        'Exercise helps lower blood sugar, blood pressure, and weight',
      ],
    },
    {
      icon: 'noSmoking',
      iconStyle: { background: 'var(--risk-mod-bg)', color: 'var(--risk-mod)' },
      title: 'Smoking Cessation',
      paragraphs: [
        'Smoking significantly increases your risk of heart attack, stroke, and kidney disease — especially when combined with diabetes and high blood pressure.',
      ],
      list: [
        'Set a quit date and share it with family',
        'Ask your doctor about nicotine replacement therapy',
        'Avoid triggers — stress, alcohol, social situations',
        'Join a support group or call a quit helpline',
      ],
    },
    {
      icon: 'alert',
      iconStyle: { background: 'var(--risk-high-bg)', color: 'var(--risk-high)' },
      title: 'Warning Signs — Seek Immediate Care',
      list: [
        'Chest pain, tightness, or pressure',
        'Sudden severe headache or vision changes',
        'Numbness or weakness on one side of the body',
        'Difficulty breathing or excessive sweating',
        'Blood sugar above 300 mg/dL or signs of confusion',
        "Swelling in legs/feet that doesn't improve with rest",
      ],
    },
    {
      icon: 'calendar',
      iconStyle: { background: 'var(--plum-100)', color: 'var(--plum-700)' },
      title: 'When to See Your Doctor',
      list: [
        'Regular check-ups every 3 months for HbA1c and blood pressure monitoring',
        'Annual comprehensive exam including eye, kidney, and foot check',
        'Whenever you experience new or worsening symptoms',
        'If you run out of or need to change medications',
      ],
    },
  ],
  hi: [
    {
      icon: 'droplet',
      iconStyle: { background: 'var(--risk-high-bg)', color: 'var(--risk-high)' },
      title: 'आपके मधुमेह जोखिम को समझें',
      paragraphs: [
        'आपका HbA1c स्तर 8.4% है, जिसका मतलब है कि पिछले 2-3 महीनों में आपकी रक्त शर्करा लगातार ऊंची रही है। इससे टाइप 2 मधुमेह और उसकी जटिलताओं का खतरा बढ़ जाता है।',
        'अगर रक्त शर्करा नियंत्रित नहीं की जाती है, तो मधुमेह आपकी आंखों, गुर्दों, नसों और हृदय को प्रभावित कर सकता है। अच्छी खबर यह है कि उचित प्रबंधन से इन जटिलताओं को रोका या देरी की जा सकती है।',
      ],
    },
    {
      icon: 'leaf',
      iconStyle: { background: 'var(--plum-100)', color: 'var(--plum-700)' },
      title: 'आहार संबंधी सलाह',
      list: [
        'साबुत अनाज चुनें — ब्राउन राइस, गेहूं की रोटी',
        'ढेर सारी सब्जियां खाएं — प्लेट का आधा हिस्सा',
        'चीनी, मिठाई, कोल्ड ड्रिंक और जूस सीमित करें',
        'नमक का सेवन प्रतिदिन 5 ग्राम से कम रखें',
        'दाल, मछली और फलियां जैसे प्रोटीन चुनें',
        'तले हुए खाने और ट्रांस फैट से बचें',
      ],
    },
    {
      icon: 'run',
      iconStyle: { background: 'var(--gold-100)', color: 'var(--gold-600)' },
      title: 'व्यायाम मार्गदर्शन',
      list: [
        'रोज़ 30 मिनट तेज चलने से शुरू करें',
        'धीरे-धीरे सप्ताह में 150 मिनट तक बढ़ाएं',
        'हर 30 मिनट में खड़े हों या स्ट्रेच करें',
        'व्यायाम रक्त शर्करा, रक्तचाप और वजन कम करने में मदद करता है',
      ],
    },
    {
      icon: 'alert',
      iconStyle: { background: 'var(--risk-high-bg)', color: 'var(--risk-high)' },
      title: 'चेतावनी के संकेत — तुरंत डॉक्टर से मिलें',
      list: [
        'सीने में दर्द, जकड़न या दबाव',
        'अचानक तेज सिरदर्द या दृष्टि में बदलाव',
        'शरीर के एक तरफ सुन्नपन या कमजोरी',
        'सांस लेने में कठिनाई या अत्यधिक पसीना',
        'रक्त शर्करा 300 mg/dL से ऊपर',
      ],
    },
  ],
  gu: [
    {
      icon: 'droplet',
      iconStyle: { background: 'var(--risk-high-bg)', color: 'var(--risk-high)' },
      title: 'તમારા ડાયાબિટીસ જોખમને સમજો',
      paragraphs: [
        'તમારું HbA1c સ્તર 8.4% છે, જેનો અર્થ છે કે છેલ્લા 2-3 મહિનામાં તમારી બ્લડ શુગર સતત ઊંચી રહી છે. આ ટાઈપ 2 ડાયાબિટીસ અને તેની ગૂંચવણોનું નોંધપાત્ર જોખમ દર્શાવે છે.',
        'જો બ્લડ શુગર અનિયંત્રિત રહે તો ડાયાબિટીસ તમારી આંખો, કિડની, ચેતાઓ અને હૃદયને અસર કરી શકે છે. સારા સમાચાર એ છે કે યોગ્ય વ્યવસ્થાપનથી આ ગૂંચવણો અટકાવી શકાય છે.',
      ],
    },
    {
      icon: 'leaf',
      iconStyle: { background: 'var(--plum-100)', color: 'var(--plum-700)' },
      title: 'આહાર અંગે સલાહ',
      list: [
        'આખા અનાજ પસંદ કરો — બ્રાઉન રાઈસ, ઘઉંની રોટલી',
        'ભરપૂર શાકભાજી ખાઓ — થાળીનો અડધો ભાગ',
        'ખાંડ, મીઠાઈ, કોલ્ડ ડ્રિંક્સ અને જ્યુસ ઓછા કરો',
        'મીઠાનું સેવન દિવસમાં 5 ગ્રામથી ઓછું રાખો',
        'દાળ, માછલી, કઠોળ જેવા પ્રોટીન પસંદ કરો',
      ],
    },
    {
      icon: 'run',
      iconStyle: { background: 'var(--gold-100)', color: 'var(--gold-600)' },
      title: 'કસરત માર્ગદર્શન',
      list: [
        'દરરોજ 30 મિનિટ ઝડપથી ચાલવાની શરૂઆત કરો',
        'ધીમે ધીમે અઠવાડિયે 150 મિનિટ સુધી વધારો',
        'દર 30 મિનિટે ઊભા થાઓ અથવા સ્ટ્રેચ કરો',
        'કસરત બ્લડ શુગર, બ્લડ પ્રેશર અને વજન ઘટાડવામાં મદદ કરે છે',
      ],
    },
    {
      icon: 'alert',
      iconStyle: { background: 'var(--risk-high-bg)', color: 'var(--risk-high)' },
      title: 'ચેતવણીના સંકેતો — તાત્કાલિક ડૉક્ટરને મળો',
      list: [
        'છાતીમાં દુખાવો, ચુસ્તતા અથવા દબાણ',
        'અચાનક તીવ્ર માથાનો દુખાવો અથવા દ્રષ્ટિમાં ફેરફાર',
        'શરીરની એક બાજુ સુન્નતા અથવા નબળાઈ',
        'શ્વાસ લેવામાં તકલીફ અથવા વધુ પડતો પરસેવો',
        'બ્લડ શુગર 300 mg/dL ઉપર',
      ],
    },
  ],
};

export default function PatientEducation() {
  const [lang, setLang] = useState('en');
  const { member } = useMember();
  const sections = CONTENT[lang];

  return (
    <>
      <div className="page-header">
        <div className="page-title">Health Education</div>
        <div className="page-subtitle">Personalized health education materials for {member?.name || 'your family member'}.</div>
      </div>

      <div className="edu-tabs">
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            className={`edu-tab${lang === l.id ? ' active' : ''}`}
            onClick={() => setLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div key={lang} className="edu-grid" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
        {sections.map((s) => (
          <div className="edu-section" key={s.title}>
            <div className="edu-section-icon" style={s.iconStyle}>
              <Icon name={s.icon} size="lg" />
            </div>
            <h3>{s.title}</h3>
            {s.paragraphs?.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.list && (
              <ul className="edu-list">
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
