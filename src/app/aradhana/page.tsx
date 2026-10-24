"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Deity {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  title: string;
  imageUrl: string;
  moolMantra: string;
  shloka: string;
  meaningHindi: string;
  chausaOrStuti?: string;
  blessing: string;
  symbol: string;
}

const DEITIES: Deity[] = [
  {
    id: "neem-karoli-baba",
    nameHindi: "नीम करौली बाबा (महाराज जी)",
    nameEnglish: "Neem Karoli Baba",
    title: "परम सिद्ध सन्त एवं प्रेम-सेवा के साक्षात् विग्रह • कैंची धाम",
    imageUrl: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/devotional/neem_karoli_baba.jpg",
    moolMantra: "॥ श्री राम जय राम जय जय राम ॥",
    shloka: "सब प्रेम करो, सबको खिलाओ, सच बोलो और प्रभु का स्मरण करो।",
    meaningHindi: "महाराज जी का मूल सन्देश: 'Love Everyone, Feed Everyone, Remember God & Tell the Truth.' जो भी निष्कपट भाव से शरण में आता है, उसके सारे कष्ट बाबा पल भर में हर लेते हैं।",
    chausaOrStuti: "अकबरपुर के पावन सन्त, कैंची धाम के नाथ।\nकल्याण करो हे महाराज, सदा रहो हमारे साथ॥",
    blessing: "सदा सर्वदा रक्षा, अटूट भक्ति, मानसिक शान्ति एवं अलौकिक कृपा",
    symbol: "ॐ राम"
  },
  {
    id: "lord-hanuman",
    nameHindi: "संकटमोचन श्री हनुमान जी",
    nameEnglish: "Lord Hanuman",
    title: "रुद्रावतार • अतुलितबलधामा • श्रीरामदूत",
    imageUrl: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/devotional/lord_hanuman.jpg",
    moolMantra: "॥ ॐ श्री हनुमते नमः ॥",
    shloka: "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्।\nवातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥",
    meaningHindi: "मन के समान वेग वाले, वायु के समान पराक्रमी, समस्त इन्द्रियों को जीतने वाले, ज्ञानियों में सर्वश्रेष्ठ, पवनपुत्र श्री रामदूत हनुमान जी के चरणों में मैं नतमस्तक होकर शरण लेता हूँ।",
    chausaOrStuti: "संकट कटै मिटै सब पीरा। जो सुमिरै हनुमत बलबीरा॥\nजै जै जै हनुमान गोसाईं। कृपा करहु गुरुदेव की नाईं॥",
    blessing: "समस्त भय व संकटों से मुक्ति, अपार साहस, बुद्धि एवं विजय",
    symbol: "卐"
  },
  {
    id: "lord-shiva",
    nameHindi: "देवाधिदेव महादेव शिव शम्भू",
    nameEnglish: "Lord Shiva",
    title: "कैलाशपति • महामृत्युंजय • त्रिकालदर्शी",
    imageUrl: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/devotional/lord_shiva.jpg",
    moolMantra: "॥ ॐ नमः शिवाय ॥",
    shloka: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्यschemaोर्मुक्षीय माऽमृतात्॥",
    meaningHindi: "हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो समस्त संसार को सुगन्धि और पोषण प्रदान करते हैं। जैसे पका हुआ फल डाल से सहज मुक्त हो जाता है, वैसे ही हम मृत्यु और बन्धनों से मुक्त होकर अमरत्व को प्राप्त हों।",
    chausaOrStuti: "कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्।\nसदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥",
    blessing: "मोक्ष, अकाल मृत्यु से रक्षा, आरोग्य, आन्तरिक शान्ति और दिव्य ऊर्जा",
    symbol: "ॐ नमः शिवाय"
  },
  {
    id: "goddess-saraswati",
    nameHindi: "विद्यादायिनी माँ सरस्वती",
    nameEnglish: "Maa Saraswati",
    title: "ज्ञान, कला, वाणी एवं संगीत की अधिष्ठात्री देवी",
    imageUrl: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/devotional/goddess_saraswati.jpg",
    moolMantra: "॥ ॐ ऐं सरस्वत्यै नमः ॥",
    shloka: "सरस्वति नमस्तुभ्यं वरदे कामरूपिणि।\nविद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा॥",
    meaningHindi: "हे वरदायिनी और समस्त मनोरथों को पूर्ण करने वाली माँ सरस्वती! आपको सादर नमन। मैं अपने समस्त कार्यों और विद्या का आरम्भ करता हूँ, मुझे सदा सफलता और सिद्धियाँ प्राप्त हों।",
    chausaOrStuti: "या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता\nया वीणावरदण्डमण्डितकरा या श्वेतपद्मासना।\nसा मां पातु सरस्वती भगवती निःशेषजाड्यापहा॥",
    blessing: "बुद्धि, स्पष्ट वाणी, विवेक, रचनात्मकता एवं सफलता",
    symbol: "वीणा"
  },
  {
    id: "goddess-lakshmi",
    nameHindi: "धनदायिनी महालक्ष्मी माता",
    nameEnglish: "Maa Lakshmi",
    title: "समृद्धि, सौभाग्य, यश एवं अष्टसिद्धियों की अधिष्ठात्री",
    imageUrl: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/devotional/goddess_lakshmi.jpg",
    moolMantra: "॥ ॐ श्रीं ह्रीं क्लीं श्री सिद्ध लक्ष्म्यै नमः ॥",
    shloka: "नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते।\nशङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥",
    meaningHindi: "हे महामाया, देवों द्वारा पूजित, श्रीपीठ में विराजमान और हाथों में शंख, चक्र तथा गदा धारण करने वाली भगवती महालक्ष्मी! आपको कोटि-कोटि प्रणाम।",
    chausaOrStuti: "सर्वज्ञे सर्ववरदे सर्वदुष्टभयङ्करि।\nसर्वदुःखहरे देवि महालक्ष्मि नमोऽस्तु ते॥",
    blessing: "अखण्ड लक्ष्मी, व्यापारिक वृद्धि, गृह शान्ति, वैभव एवं अष्टैश्वर्य",
    symbol: "श्रीं"
  },
  {
    id: "laughing-buddha",
    nameHindi: "कुबेर रूप लाफिंग बुद्धा (बुदई)",
    nameEnglish: "Laughing Buddha (Budai)",
    title: "सदा प्रसन्नता, धन-धान्य, सौभाग्य एवं सकारात्मक ऊर्जा के प्रतीक",
    imageUrl: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/devotional/laughing_buddha.jpg",
    moolMantra: "॥ ॐ मैत्रेय महासुख समृद्धि सर्वसिद्धि देहि मे नमः ॥",
    shloka: "सदा हँसो, चिन्ताओं को विसर्जित करो, प्रभु की सृष्टि में आनन्द और संतोष ही परम धन है।",
    meaningHindi: "लाफिंग बुद्धा हर नकारात्मक ऊर्जा को दूर कर घर और व्यापार में असीम खुशहाली, प्रचुर धन, आरोग्य और उत्सवमय आनन्द भर देते हैं।",
    chausaOrStuti: "आनन्द घन, मंगल करन, हरहिं क्लेश सन्ताप।\nजहाँ विराजे प्रेम-सुख, तहँ मिटे सब पाप॥",
    blessing: "तनावमुक्ति, असीमित धन-आगमन, पारिवारिक प्रसन्नता एवं सर्वत्र विजय",
    symbol: "आनन्द"
  }
];

export default function AradhanaPage() {
  const [selectedDeity, setSelectedDeity] = useState<Deity>(DEITIES[0]);
  const [japaCount, setJapaCount] = useState<number>(0);
  const [isDiyaLit, setIsDiyaLit] = useState<boolean>(true);
  const [flowerPetals, setFlowerPetals] = useState<Array<{ id: number; left: number; animDuration: number }>>([]);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [personalPrayer, setPersonalPrayer] = useState<string>("");
  const [savedPrayerStatus, setSavedPrayerStatus] = useState<string>("");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("awasio_isht_prayer");
    if (saved) setPersonalPrayer(saved);

    const savedCount = localStorage.getItem("awasio_japa_count");
    if (savedCount) setJapaCount(parseInt(savedCount, 10) || 0);
  }, []);

  const playDivineBell = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(108, ctx.currentTime + 3.0);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.2);
    } catch {
      // audio fallback
    }
  };

  const toggleOmDrone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;

      if (audioPlaying) {
        if (oscillatorNodeRef.current) {
          oscillatorNodeRef.current.stop();
          oscillatorNodeRef.current.disconnect();
          oscillatorNodeRef.current = null;
        }
        setAudioPlaying(false);
      } else {
        if (ctx.state === "suspended") ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(136.1, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        oscillatorNodeRef.current = osc;
        gainNodeRef.current = gain;
        setAudioPlaying(true);
      }
    } catch {
      setAudioPlaying(false);
    }
  };

  const offerFlowers = () => {
    playDivineBell();
    const newPetals = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 95,
      animDuration: 2.5 + Math.random() * 2
    }));
    setFlowerPetals((prev) => [...prev, ...newPetals]);

    setTimeout(() => {
      setFlowerPetals((prev) => prev.filter((p) => !newPetals.some((np) => np.id === p.id)));
    }, 4500);
  };

  const incrementJapa = () => {
    playDivineBell();
    setJapaCount((prev) => {
      const next = prev + 1;
      localStorage.setItem("awasio_japa_count", next.toString());
      return next;
    });
  };

  const resetJapa = () => {
    setJapaCount(0);
    localStorage.setItem("awasio_japa_count", "0");
  };

  const savePrayer = () => {
    localStorage.setItem("awasio_isht_prayer", personalPrayer);
    setSavedPrayerStatus("प्रार्थना सुरक्षित हो गई है। आपके इष्टदेव सदा आपकी रक्षा करें।");
    setTimeout(() => setSavedPrayerStatus(""), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070505] text-[#F3E8D6] selection:bg-amber-600 selection:text-white relative overflow-hidden font-sans">
      {/* Flower Offering Shower Canvas */}
      {flowerPetals.map((petal) => (
        <div
          key={petal.id}
          className="fixed pointer-events-none z-50 text-2xl animate-fall"
          style={{
            left: `${petal.left}%`,
            top: "-40px",
            animationDuration: `${petal.animDuration}s`,
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          }}
        >
          🌸
        </div>
      ))}

      {/* Atmospheric Temple Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,6,0.18),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(180,83,9,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      {/* Main Container */}
      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Header: Sacred Shrine Header */}
        <header className="text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <span className="text-amber-400 text-lg">卐</span>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-200/90 font-medium">
              परम पावन इष्टदेव शरणम् • नित्य आराधना
            </span>
            <span className="text-amber-400 text-lg">卐</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]">
            श्री इष्टदेव दिव्य मन्दिर
          </h1>

          <p className="text-sm sm:text-base text-amber-200/70 max-w-2xl mx-auto italic font-serif">
            &ldquo;कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।&rdquo; — निष्काम भाव, सम्पूर्ण समर्पण एवं अटूट श्रद्धा के साथ अपने आराध्य का पावन दर्शन।
          </p>

          {/* Quick Puja Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
            <button
              onClick={offerFlowers}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <span>🌸</span> पुष्प अर्पण करें (पुष्पाञ्जलि)
            </button>

            <button
              onClick={() => {
                setIsDiyaLit(!isDiyaLit);
                playDivineBell();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-600/50 hover:to-yellow-600/50 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <span>{isDiyaLit ? "🪔" : "🕯️"}</span> {isDiyaLit ? "दीपक प्रज्वलित है" : "दीपक जलाएँ"}
            </button>

            <button
              onClick={toggleOmDrone}
              className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 ${
                audioPlaying
                  ? "bg-amber-500 text-black border-amber-300 font-semibold"
                  : "bg-amber-950/40 border-amber-500/40 text-amber-200"
              }`}
            >
              <span>{audioPlaying ? "🔊" : "🔈"}</span> {audioPlaying ? "ॐ ध्वनि चालू (136.1Hz)" : "ॐ दिव्य ध्वनि आरम्भ"}
            </button>
          </div>
        </header>

        {/* Deity Selector Tabs */}
        <nav className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {DEITIES.map((deity) => {
            const isSelected = selectedDeity.id === deity.id;
            return (
              <button
                key={deity.id}
                onClick={() => {
                  setSelectedDeity(deity);
                  playDivineBell();
                }}
                className={`relative px-4 py-2.5 rounded-2xl whitespace-nowrap text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-500/30 via-orange-600/30 to-amber-950/80 border-amber-400 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105"
                    : "bg-stone-900/60 border-stone-800 text-stone-400 hover:text-amber-200 hover:border-amber-500/30"
                }`}
              >
                <span className="text-base">{deity.symbol}</span>
                <span>{deity.nameEnglish}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Darshan Sanctum */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Divine Portrait Sanctum */}
          <section className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden p-1.5 bg-gradient-to-b from-amber-400/50 via-amber-700/30 to-stone-900 shadow-[0_0_50px_rgba(245,158,11,0.25)] group">
              
              {/* Inner Radiant Container */}
              <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-stone-950">
                <Image
                  src={selectedDeity.imageUrl}
                  alt={selectedDeity.nameEnglish}
                  fill
                  priority
                  unoptimized
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Golden Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Bottom Aura & Diya */}
                <div className="absolute bottom-4 inset-x-4 flex items-end justify-between pointer-events-none">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-amber-300 font-semibold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                      {selectedDeity.symbol}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white drop-shadow-md mt-1">
                      {selectedDeity.nameHindi}
                    </h2>
                  </div>

                  {isDiyaLit && (
                    <div className="relative flex flex-col items-center">
                      <div className="w-5 h-7 rounded-full bg-gradient-to-t from-amber-600 via-yellow-300 to-white animate-pulse blur-[1px] shadow-[0_0_18px_#F59E0B]" />
                      <span className="text-2xl -mt-2">🪔</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cloudflare CDN Badge */}
            <div className="mt-3 text-[11px] text-stone-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Cloudflare R2 CDN Verified High-Res Darshan</span>
            </div>
          </section>

          {/* Right Column: Mantras, Shlokas & Sadhana Details */}
          <section className="lg:col-span-7 flex flex-col justify-between gap-6 bg-stone-900/40 border border-amber-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
            <div className="flex flex-col gap-6">
              
              {/* Deity Title & Epithet */}
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                  {selectedDeity.title}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 mt-1">
                  {selectedDeity.nameHindi}
                </h3>
              </div>

              {/* Mool Mantra Highlight Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900/80 to-amber-950/60 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-center relative overflow-hidden">
                <div className="text-xs uppercase tracking-widest text-amber-300/80 mb-1">
                  सिद्ध महामन्त्र
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 py-1">
                  {selectedDeity.moolMantra}
                </div>
              </div>

              {/* Sanskrit Shloka */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold flex items-center gap-2">
                  <span>✦</span> पावन श्लोक / स्तुति
                </h4>
                <div className="text-base sm:text-lg font-serif text-amber-100/90 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-black/40 border border-stone-800">
                  {selectedDeity.shloka}
                </div>
              </div>

              {/* Meaning & Devotional Significance */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold flex items-center gap-2">
                  <span>✦</span> भावार्थ एवं उपदेश
                </h4>
                <p className="text-sm text-stone-300 leading-relaxed bg-amber-950/20 p-4 rounded-xl border border-amber-500/10">
                  {selectedDeity.meaningHindi}
                </p>
              </div>

              {/* Stuti / Additional Couplet if available */}
              {selectedDeity.chausaOrStuti && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold flex items-center gap-2">
                    <span>✦</span> अमृत वाणी
                  </h4>
                  <p className="text-sm font-serif text-amber-200/80 italic leading-relaxed whitespace-pre-line bg-black/30 p-3.5 rounded-xl border border-stone-800">
                    {selectedDeity.chausaOrStuti}
                  </p>
                </div>
              )}

              {/* Divine Blessing Header */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-transparent border-l-4 border-amber-400">
                <span className="text-xl">🕉️</span>
                <div className="text-xs sm:text-sm text-amber-200">
                  <strong className="text-amber-300 font-semibold">प्राप्त होने वाले वरदान: </strong>
                  {selectedDeity.blessing}
                </div>
              </div>
            </div>

            {/* Japa Bead Counter (108 Sadhana Mala) */}
            <div className="pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-xs text-stone-400 uppercase tracking-widest">
                  माला जप गणना:
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-amber-300">{japaCount}</span>
                  <span className="text-xs text-stone-500">/ 108</span>
                </div>
                {japaCount >= 108 && (
                  <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-full font-medium">
                    १ माला पूर्ण 卐
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={incrementJapa}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>📿</span> जप करें (+1)
                </button>
                <button
                  onClick={resetJapa}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs transition-colors"
                  title="पुनः आरम्भ करें"
                >
                  रीसेट
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Private Devotional Prayer Box (Stored Locally on your device only) */}
        <section className="bg-stone-900/50 border border-amber-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
                <span>🙏</span> नित्य प्रार्थना एवं व्यक्तिगत संकल्प
              </h3>
              <p className="text-xs text-stone-400">
                यह आपका व्यक्तिगत साधना कक्ष है। यह प्रार्थना केवल आपके इस उपकरण पर सुरक्षित रहेगी।
              </p>
            </div>
            <button
              onClick={savePrayer}
              className="px-4 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-medium transition-all"
            >
              संकल्प सुरक्षित करें
            </button>
          </div>

          <textarea
            value={personalPrayer}
            onChange={(e) => setPersonalPrayer(e.target.value)}
            placeholder="हे मेरे इष्टदेव महाराज जी, पवनपुत्र हनुमान जी, भोलेनाथ, माँ सरस्वती, महालक्ष्मी जी... मेरे परिवार, कार्य और जीवन पर अपनी कृपा दृष्टि बनाए रखें..."
            rows={3}
            className="w-full bg-black/50 border border-stone-800 rounded-2xl p-4 text-sm text-amber-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 transition-colors"
          />

          {savedPrayerStatus && (
            <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
              <span>✓</span> {savedPrayerStatus}
            </p>
          )}
        </section>

        {/* Footer Sanctum Inscription */}
        <footer className="text-center py-6 border-t border-stone-900 flex flex-col items-center gap-2 text-xs text-stone-600">
          <div className="flex items-center gap-2 text-amber-500/60 font-serif">
            <span>ॐ</span>
            <span>शान्तिः शान्तिः शान्तिः</span>
            <span>ॐ</span>
          </div>
          <p>सदा विजयते धर्मः • सत्यमेव जयते</p>
        </footer>
      </div>

      {/* Embedded CSS for Flower Falling Animation */}
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
