"use client";

import React, { useId } from "react";

export interface SeekerAvatarPlaceholderProps {
  displayName?: string | null;
  gender?: string | null;
  occupation?: string | null;
  mode?: "NEED_ROOM" | "BUDDY_UP" | "HAVE_ROOM" | string;
  className?: string;
}

// Deterministic string hash
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// 6 Modern Gradient Themes
const GRADIENT_THEMES = [
  {
    id: "violet-rose",
    stops: [
      { offset: "0%", color: "#4F46E5" },
      { offset: "50%", color: "#7C3AED" },
      { offset: "100%", color: "#DB2777" },
    ],
    sparkleColor: "#FDE047",
    clothesColor: "#1E293B",
  },
  {
    id: "sunset-amber",
    stops: [
      { offset: "0%", color: "#E11D48" },
      { offset: "50%", color: "#F97316" },
      { offset: "100%", color: "#FBBF24" },
    ],
    sparkleColor: "#FEF08A",
    clothesColor: "#047857",
  },
  {
    id: "ocean-teal",
    stops: [
      { offset: "0%", color: "#0284C7" },
      { offset: "50%", color: "#0D9488" },
      { offset: "100%", color: "#10B981" },
    ],
    sparkleColor: "#A7F3D0",
    clothesColor: "#1E3A8A",
  },
  {
    id: "royal-indigo",
    stops: [
      { offset: "0%", color: "#312E81" },
      { offset: "50%", color: "#4F46E5" },
      { offset: "100%", color: "#818CF8" },
    ],
    sparkleColor: "#FDE047",
    clothesColor: "#0F172A",
  },
  {
    id: "berry-punch",
    stops: [
      { offset: "0%", color: "#9D174D" },
      { offset: "50%", color: "#BE185D" },
      { offset: "100%", color: "#FB7185" },
    ],
    sparkleColor: "#FED7AA",
    clothesColor: "#334155",
  },
  {
    id: "emerald-mint",
    stops: [
      { offset: "0%", color: "#065F46" },
      { offset: "50%", color: "#059669" },
      { offset: "100%", color: "#34D399" },
    ],
    sparkleColor: "#FDE047",
    clothesColor: "#1E293B",
  },
];

export function SeekerAvatarPlaceholder({
  displayName,
  gender,
  occupation: _occupation,
  mode,
  className = "",
}: SeekerAvatarPlaceholderProps) {
  const uniqueId = useId().replace(/:/g, "");
  const hash = getDeterministicHash(displayName || "Room Seeker");
  const theme = GRADIENT_THEMES[hash % GRADIENT_THEMES.length];

  const isBuddyUp = mode === "BUDDY_UP";
  const cleanGender = (gender || "").trim().toLowerCase();
  const isFemale =
    cleanGender === "female" ||
    cleanGender === "f" ||
    cleanGender.includes("woman") ||
    cleanGender.includes("women") ||
    (!cleanGender && hash % 5 === 0);

  // Persona index (0 to 2 for male, 0 to 1 for female)
  const personaVariant = hash % 3;

  return (
    <div className={`relative h-full w-full overflow-hidden select-none ${className}`}>
      <svg
        viewBox="0 0 140 174"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`bg-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {theme.stops.map((s, idx) => (
              <stop key={idx} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>

          <radialGradient id={`glow-${uniqueId}`} cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`skin1-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD6A5" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>

          <linearGradient id={`skin2-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>

          <linearGradient id={`bottom-fade-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </linearGradient>

          <filter id={`shadow-${uniqueId}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* 1. Vibrant Gradient Backdrop */}
        <rect width="140" height="174" fill={`url(#bg-${uniqueId})`} />
        <circle cx="70" cy="50" r="60" fill={`url(#glow-${uniqueId})`} />

        {/* 2. Abstract Decorative Sparkles & Star Accents */}
        <path
          d="M118 22 Q120 27 125 29 Q120 31 118 36 Q116 31 111 29 Q116 27 118 22 Z"
          fill={theme.sparkleColor}
          opacity="0.85"
        />
        <circle cx="22" cy="34" r="1.5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="124" cy="42" r="2" fill="#FFFFFF" opacity="0.5" />
        <path
          d="M24 74 Q25 77 28 78 Q25 79 24 82 Q23 79 20 78 Q23 77 24 74 Z"
          fill="#FDE047"
          opacity="0.75"
        />

        {/* 3. Illustrated Characters */}
        {isBuddyUp ? (
          isFemale ? (
            /* ======================================================== */
            /* BUDDY-UP FEMALE TEAM (Two Friendly Female Flatmates)     */
            /* ======================================================== */
            <g filter={`url(#shadow-${uniqueId})`}>
              {/* Left Mate Body */}
              <path d="M5 174 C5 140, 24 130, 48 130 C72 130, 85 140, 85 174 Z" fill="#DB2777" />
              <path d="M38 130 C42 138, 54 138, 58 130 Z" fill="#F43F5E" />

              {/* Right Mate Body */}
              <path d="M55 174 C55 138, 74 128, 98 128 C122 128, 135 138, 135 174 Z" fill="#7C3AED" />
              <path d="M88 128 C92 136, 104 136, 108 128 Z" fill="#A855F7" />

              {/* Left Mate Head & Neck */}
              <circle cx="48" cy="84" r="15" fill="#FDBA74" />
              {/* Left Mate Chic Bob Hair */}
              <path
                d="M33 82 C32 64, 40 58, 48 58 C56 58, 64 64, 63 82 C61 74, 55 70, 48 70 C41 70, 35 74, 33 82 Z"
                fill="#18181B"
              />
              <path d="M32 82 C32 90, 34 94, 36 96 C36 90, 34 84, 34 82 Z" fill="#18181B" />
              <path d="M64 82 C64 90, 62 94, 60 96 C60 90, 62 84, 62 82 Z" fill="#18181B" />
              {/* Left Mate Gold Hoop Earring */}
              <circle cx="34" cy="85" r="2.8" fill="none" stroke="#FBBF24" strokeWidth="1.2" />

              {/* Left Mate Eyes & Smile */}
              <circle cx="44" cy="83" r="2" fill="#18181B" />
              <circle cx="53" cy="83" r="2" fill="#18181B" />
              <circle cx="44.6" cy="82.3" r="0.7" fill="#FFFFFF" />
              <circle cx="53.6" cy="82.3" r="0.7" fill="#FFFFFF" />
              {/* Blush */}
              <ellipse cx="42" cy="87" rx="2.5" ry="1.2" fill="#FB7185" opacity="0.6" />
              <ellipse cx="55" cy="87" rx="2.5" ry="1.2" fill="#FB7185" opacity="0.6" />
              <path d="M46 89 Q48.5 93 51 89" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Right Mate Head & Topknot / Bun */}
              <circle cx="94" cy="82" r="15" fill="#FED7AA" />
              {/* Bun */}
              <circle cx="94" cy="54" r="7" fill="#18181B" />
              {/* Hair Base */}
              <path
                d="M79 80 C78 62, 86 58, 94 58 C102 58, 110 62, 109 80 C106 73, 100 69, 94 69 C88 69, 82 73, 79 80 Z"
                fill="#18181B"
              />
              {/* Right Mate Earring */}
              <circle cx="108" cy="83" r="2.8" fill="none" stroke="#FBBF24" strokeWidth="1.2" />

              {/* Right Mate Eyes & Smile */}
              <circle cx="89" cy="81" r="2" fill="#18181B" />
              <circle cx="98" cy="81" r="2" fill="#18181B" />
              <circle cx="89.6" cy="80.3" r="0.7" fill="#FFFFFF" />
              <circle cx="98.6" cy="80.3" r="0.7" fill="#FFFFFF" />
              {/* Blush */}
              <ellipse cx="87" cy="85" rx="2.5" ry="1.2" fill="#FB7185" opacity="0.6" />
              <ellipse cx="100" cy="85" rx="2.5" ry="1.2" fill="#FB7185" opacity="0.6" />
              <path d="M91 87 Q93.5 91 96 87" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* ======================================================== */
            /* BUDDY-UP MALE TEAM (Two Friendly Flatmates Side by Side) */
            /* ======================================================== */
            <g filter={`url(#shadow-${uniqueId})`}>
              {/* Left Mate Body */}
              <path d="M5 174 C5 140, 25 130, 48 130 C71 130, 85 140, 85 174 Z" fill="#1E293B" />
              {/* Right Mate Body */}
              <path d="M55 174 C55 138, 75 128, 98 128 C121 128, 135 138, 135 174 Z" fill="#0284C7" />

              {/* Left Mate Head */}
              <circle cx="48" cy="85" r="16" fill="#FDBA74" />
              {/* Left Mate Hair */}
              <path
                d="M32 82 C32 64, 42 60, 52 60 C62 60, 64 68, 64 82 C60 76, 54 72, 48 72 C40 72, 34 76, 32 82 Z"
                fill="#18181B"
              />
              {/* Left Mate Eyes & Smile */}
              <circle cx="44" cy="84" r="2" fill="#18181B" />
              <circle cx="54" cy="84" r="2" fill="#18181B" />
              <path d="M46 91 Q49 94 52 91" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Right Mate Head */}
              <circle cx="92" cy="82" r="16" fill="#FED7AA" />
              {/* Right Mate Curly Hair */}
              <path
                d="M76 80 C76 60, 88 56, 96 56 C106 56, 108 64, 108 80 C104 74, 98 70, 92 70 C86 70, 80 74, 76 80 Z"
                fill="#78350F"
              />
              <circle cx="86" cy="62" r="5" fill="#78350F" />
              <circle cx="96" cy="60" r="5" fill="#78350F" />
              <circle cx="104" cy="64" r="4.5" fill="#78350F" />
              {/* Right Mate Glasses & Smile */}
              <circle cx="88" cy="80" r="5" fill="none" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="98" cy="80" r="5" fill="none" stroke="#0F172A" strokeWidth="1.5" />
              <line x1="93" y1="80" x2="93" y2="80" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="88" cy="80" r="1.5" fill="#0F172A" />
              <circle cx="98" cy="80" r="1.5" fill="#0F172A" />
              <path d="M89 88 Q93 92 97 88" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )
        ) : isFemale ? (
          /* ======================================================== */
          /* FEMALE PERSONAS                                          */
          /* ======================================================== */
          <g filter={`url(#shadow-${uniqueId})`}>
            {/* Shoulders & Stylish Top */}
            <path d="M15 174 C15 132, 42 122, 70 122 C98 122, 125 132, 125 174 Z" fill={theme.clothesColor} />
            <path d="M54 122 C60 134, 80 134, 86 122 Z" fill="#F43F5E" />

            {/* Neck */}
            <path d="M60 102 L60 122 C64 124, 76 124, 80 122 L80 102 Z" fill="#FDBA74" />

            {/* Head */}
            <circle cx="46" cy="80" r="6" fill="#FDBA74" />
            <circle cx="94" cy="80" r="6" fill="#FDBA74" />
            <rect x="50" y="52" width="40" height="52" rx="20" fill={`url(#skin2-${uniqueId})`} />

            {/* Cute Hoop Earring */}
            <circle cx="45" cy="83" r="3.5" fill="none" stroke="#FBBF24" strokeWidth="1.5" />

            {/* Female Hairstyle: Chic Wavy Bob / Side Hair */}
            <path
              d="M44 64 C42 42, 54 34, 70 34 C86 34, 98 42, 96 64 C96 78, 98 90, 93 96 C90 92, 88 78, 86 64 C78 52, 62 52, 54 64 C52 78, 50 92, 47 96 C42 90, 44 78, 44 64 Z"
              fill="#18181B"
            />

            {/* Eyebrows */}
            <path d="M55 67 Q59 64 64 67" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M76 67 Q81 64 85 67" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" fill="none" />

            {/* Expressive Warm Eyes */}
            <ellipse cx="60" cy="74" rx="3.5" ry="4" fill="#18181B" />
            <ellipse cx="80" cy="74" rx="3.5" ry="4" fill="#18181B" />
            <circle cx="61.5" cy="72.5" r="1.3" fill="#FFFFFF" />
            <circle cx="81.5" cy="72.5" r="1.3" fill="#FFFFFF" />

            {/* Soft Blush */}
            <ellipse cx="54" cy="81" rx="4" ry="2" fill="#FB7185" opacity="0.5" />
            <ellipse cx="86" cy="81" rx="4" ry="2" fill="#FB7185" opacity="0.5" />

            {/* Nose & Sweet Smile */}
            <path d="M70 76 L68 81 L72 81" stroke="#EA580C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
            <path d="M64 86 Q70 93 76 86" stroke="#BE123C" strokeWidth="2.2" strokeLinecap="round" fill="#FFFFFF" />
          </g>
        ) : personaVariant === 0 ? (
          /* ======================================================== */
          /* MALE VARIANT 0: Techie (Glasses + Headphones + Hoodie)   */
          /* ======================================================== */
          <g filter={`url(#shadow-${uniqueId})`}>
            {/* Shoulders & Hoodie */}
            <path d="M15 174 C15 132, 42 120, 70 120 C98 120, 125 132, 125 174 Z" fill={theme.clothesColor} />
            <path d="M54 122 C58 132, 82 132, 86 122 Z" fill="#334155" />
            <line x1="62" y1="128" x2="62" y2="148" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="78" y1="128" x2="78" y2="148" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

            {/* Neck */}
            <path d="M58 100 L58 122 C62 125, 78 125, 82 122 L82 100 Z" fill="#FDBA74" />

            {/* Head & Ears */}
            <circle cx="45" cy="80" r="6.5" fill="#FDBA74" />
            <circle cx="95" cy="80" r="6.5" fill="#FDBA74" />
            <rect x="48" y="52" width="44" height="52" rx="20" fill={`url(#skin1-${uniqueId})`} />

            {/* Quiff / Taper Hair */}
            <path
              d="M46 65 C45 42, 60 36, 70 36 C82 36, 95 42, 94 65 C91 58, 86 52, 70 52 C54 52, 49 58, 46 65 Z"
              fill="#18181B"
            />
            <path
              d="M46 65 C48 56, 52 48, 64 42 C72 38, 85 40, 93 48 C94 56, 94 64, 94 65 Z"
              fill="#27272A"
            />

            {/* Eyebrows */}
            <path d="M54 68 Q58 66 63 68" stroke="#18181B" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M77 68 Q82 66 86 68" stroke="#18181B" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Modern Wireframe Glasses */}
            <circle cx="58" cy="76" r="7.5" fill="rgba(255,255,255,0.22)" stroke="#09090B" strokeWidth="2" />
            <circle cx="82" cy="76" r="7.5" fill="rgba(255,255,255,0.22)" stroke="#09090B" strokeWidth="2" />
            <line x1="65.5" y1="76" x2="74.5" y2="76" stroke="#09090B" strokeWidth="2" strokeLinecap="round" />

            {/* Eyes */}
            <circle cx="58" cy="76" r="2.2" fill="#09090B" />
            <circle cx="82" cy="76" r="2.2" fill="#09090B" />
            <circle cx="57" cy="75" r="0.8" fill="#FFFFFF" />
            <circle cx="81" cy="75" r="0.8" fill="#FFFFFF" />

            {/* Nose & Warm Smile */}
            <path d="M70 78 L68 83 L72 83" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
            <path d="M64 89 Q70 94 76 89" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Wireless Headphones on neck */}
            <path d="M38 96 C38 108, 48 116, 70 116 C92 116, 102 108, 102 96" stroke="#F43F5E" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <rect x="34" y="88" width="10" height="18" rx="5" fill="#E11D48" />
            <rect x="96" y="88" width="10" height="18" rx="5" fill="#E11D48" />
          </g>
        ) : personaVariant === 1 ? (
          /* ======================================================== */
          /* MALE VARIANT 1: Modern Pro (Curly Hair + Confident Smile)*/
          /* ======================================================== */
          <g filter={`url(#shadow-${uniqueId})`}>
            {/* Jacket & T-shirt */}
            <path d="M15 174 C15 132, 42 120, 70 120 C98 120, 125 132, 125 174 Z" fill={theme.clothesColor} />
            <path d="M52 120 C58 136, 82 136, 88 120 Z" fill="#FFFFFF" />

            {/* Neck */}
            <path d="M58 100 L58 122 C62 125, 78 125, 82 122 L82 100 Z" fill="#FDBA74" />

            {/* Head & Ears */}
            <circle cx="45" cy="80" r="6.5" fill="#FDBA74" />
            <circle cx="95" cy="80" r="6.5" fill="#FDBA74" />
            <rect x="48" y="52" width="44" height="52" rx="20" fill={`url(#skin2-${uniqueId})`} />

            {/* Textured Curly Hair */}
            <path d="M46 64 C44 48, 50 34, 70 34 C90 34, 96 48, 94 64 C88 56, 82 50, 70 50 C58 50, 52 56, 46 64 Z" fill="#1C1917" />
            <circle cx="54" cy="38" r="7" fill="#1C1917" />
            <circle cx="68" cy="34" r="8" fill="#1C1917" />
            <circle cx="82" cy="36" r="7" fill="#1C1917" />

            {/* Eyebrows */}
            <path d="M53 66 Q58 63 64 66" stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M76 66 Q82 63 87 66" stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Confident Friendly Eyes */}
            <ellipse cx="58" cy="74" rx="3.5" ry="4" fill="#1C1917" />
            <ellipse cx="82" cy="74" rx="3.5" ry="4" fill="#1C1917" />
            <circle cx="59.5" cy="72.5" r="1.3" fill="#FFFFFF" />
            <circle cx="83.5" cy="72.5" r="1.3" fill="#FFFFFF" />

            {/* Nose & Bright Grin */}
            <path d="M70 76 L68 81 L72 81" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
            <path d="M62 87 Q70 95 78 87" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" fill="#FFFFFF" />
          </g>
        ) : (
          /* ======================================================== */
          /* MALE VARIANT 2: Urban Casual (Side-Part + Acetate Glass) */
          /* ======================================================== */
          <g filter={`url(#shadow-${uniqueId})`}>
            {/* Denim / Casual Shirt */}
            <path d="M15 174 C15 132, 42 120, 70 120 C98 120, 125 132, 125 174 Z" fill={theme.clothesColor} />
            <path d="M56 120 L70 134 L84 120 Z" fill="#F8FAFC" />
            <circle cx="70" cy="148" r="1.5" fill="#94A3B8" />
            <circle cx="70" cy="160" r="1.5" fill="#94A3B8" />

            {/* Neck */}
            <path d="M58 100 L58 122 C62 125, 78 125, 82 122 L82 100 Z" fill="#FDBA74" />

            {/* Head & Ears */}
            <circle cx="45" cy="80" r="6.5" fill="#FDBA74" />
            <circle cx="95" cy="80" r="6.5" fill="#FDBA74" />
            <rect x="48" y="52" width="44" height="52" rx="20" fill={`url(#skin1-${uniqueId})`} />

            {/* Side part hairstyle */}
            <path d="M45 64 C44 42, 56 36, 76 36 C88 36, 95 44, 94 65 C90 56, 84 50, 72 50 C54 50, 48 56, 45 64 Z" fill="#292524" />
            <path d="M53 66 Q58 64 63 66" stroke="#292524" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M77 66 Q82 64 87 66" stroke="#292524" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Acetate Square Glasses */}
            <rect x="50" y="69" width="16" height="13" rx="3.5" fill="rgba(255,255,255,0.2)" stroke="#0F172A" strokeWidth="2" />
            <rect x="74" y="69" width="16" height="13" rx="3.5" fill="rgba(255,255,255,0.2)" stroke="#0F172A" strokeWidth="2" />
            <line x1="66" y1="74" x2="74" y2="74" stroke="#0F172A" strokeWidth="2" />

            <circle cx="58" cy="75.5" r="2.2" fill="#0F172A" />
            <circle cx="82" cy="75.5" r="2.2" fill="#0F172A" />
            <circle cx="57" cy="74.5" r="0.7" fill="#FFFFFF" />
            <circle cx="81" cy="74.5" r="0.7" fill="#FFFFFF" />

            {/* Nose & Smile */}
            <path d="M70 78 L68 83 L72 83" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
            <path d="M63 89 Q70 94 77 89" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* 4. Bottom Gradient Vignette for Depth */}
        <rect
          y="110"
          width="140"
          height="64"
          fill={`url(#bottom-fade-${uniqueId})`}
          opacity="0.32"
        />
      </svg>
    </div>
  );
}
