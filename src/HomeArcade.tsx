import { useEffect, useRef, useState } from 'react';
import Blobi, { type EmotionType } from './Blobi';

/* ─── Speech bubble ─── */
function SpeechBubble({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div className={`relative inline-block px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${dark ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}`}>
      {text}
      <div className={`absolute -bottom-2 left-6 w-4 h-4 rotate-45 ${dark ? 'bg-gray-800 border-b border-r border-gray-700' : 'bg-white border-b border-r border-gray-200'}`} />
    </div>
  );
}

/* ─── Blobi Chat — typing messages that pop in like DMs ─── */
interface ChatLine {
  text: string;
  size?: 'big' | 'normal' | 'small';
}

function BlobiChat({ visible, lines, align = 'left', delay = 600 }: {
  visible: boolean;
  lines: ChatLine[];
  align?: 'left' | 'center' | 'right';
  delay?: number;
}) {
  const [messages, setMessages] = useState<Array<{ text: string; typed: string; size: string }>>([]);
  const hasStarted = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setInterval> | ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    if (visible && !hasStarted.current) {
      hasStarted.current = true;
      let lineIdx = 0;

      const addLine = () => {
        if (lineIdx >= lines.length) return;
        const { text: fullText, size = 'normal' } = lines[lineIdx];
        lineIdx++;

        setMessages(prev => [...prev, { text: fullText, typed: '', size }]);

        let charIdx = 0;
        const typeInterval = setInterval(() => {
          charIdx++;
          setMessages(prev => {
            const copy = [...prev];
            const msg = copy.find(m => m.text === fullText);
            if (msg) msg.typed = fullText.slice(0, charIdx);
            return copy;
          });
          if (charIdx >= fullText.length) {
            clearInterval(typeInterval);
            timers.current.push(setTimeout(addLine, 350));
          }
        }, 30);
        timers.current.push(typeInterval);
      };

      timers.current.push(setTimeout(addLine, delay));
    }

    if (!visible && hasStarted.current) {
      hasStarted.current = false;
      timers.current.forEach(t => clearTimeout(t as ReturnType<typeof setTimeout>));
      timers.current = [];
      setMessages([]);
    }
  }, [visible]);

  const sizeClass = (s: string) =>
    s === 'big' ? 'text-2xl sm:text-3xl lg:text-4xl font-black' :
    s === 'small' ? 'text-xs sm:text-sm lg:text-base' :
    'text-sm sm:text-base lg:text-lg font-bold';

  const alignClass = align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-1 max-w-[340px] sm:max-w-[450px] ${alignClass}`}>
      {messages.map((msg, i) => (
        <div key={i} className="animate-slide-in-up">
          <p className={`text-white ${sizeClass(msg.size)}`}>
            {msg.typed}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Indi brand mark ─── */
function IndiBrand() {
  return (
    <div className="absolute top-3 left-3 sm:top-4 sm:left-5 z-[60] pointer-events-auto">
      <a
        href="/"
        className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl group transition-all"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          boxShadow: '0 0 25px rgba(236, 72, 153, 0.15), 0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <Blobi emotion="pink" size={24} animate={false} className="sm:hidden" />
        <Blobi emotion="pink" size={32} animate={false} className="hidden sm:block" />
        <span
          className="font-headline font-black text-base sm:text-xl tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #f9a8d4, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          indi
        </span>
      </a>
    </div>
  );
}

/* ─── Browser window (Extension) ─── */
function ExtensionWindow() {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border-[3px] border-purple-500/70 w-[85vw] max-w-[320px] arcade-card-extension">
      <div className="bg-gray-900 px-3 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 bg-gray-800 rounded px-2 py-1 text-[10px] text-gray-300 font-mono border border-gray-700">
          your-app.com
        </div>
      </div>
      <div className="p-6 sm:p-5 bg-gray-800">
        <div className="flex flex-col items-center text-center">
          <SpeechBubble text={'"lemme peek at your browseri~"'} dark />
          <Blobi emotion="happy" size={64} className="mt-4 mb-3 sm:mt-3 sm:mb-2" />
          <h3 className="text-base sm:text-sm font-black text-white mb-1 sm:mb-0.5">Indi Mapper</h3>
          <p className="text-sm sm:text-[10px] text-gray-400 mb-4 sm:mb-3 max-w-[280px] sm:max-w-[240px]">The best Chrome extension in the world. Maps your APIs so you don't have to.</p>
          <a
            href="https://chromewebstore.google.com/detail/indi-mapper-developer-too/fhjekmbfchnehkoplcpmdgeabgimgcna"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 sm:px-3 sm:py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm sm:text-[10px] font-bold rounded-lg transition-all hover:scale-105"
          >
            Add to Browseri — Free
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Terminal window (Runtime SDK) ─── */
function RuntimeWindow() {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border-[3px] border-green-500/50 w-[85vw] max-w-[320px] arcade-card-runtime">
      <div className="bg-gray-950 px-3 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 bg-gray-800 rounded px-2 py-1 text-[10px] text-green-400 font-mono border border-gray-700">
          ~/your-api
        </div>
      </div>
      <div className="p-6 sm:p-5 bg-gray-900">
        <div className="flex flex-col items-center text-center">
          <div className="relative inline-block px-4 py-2 rounded-2xl text-sm font-bold shadow-lg bg-gray-950 text-gray-200 border border-green-500/30">
            "shh i'm watching the serveri~"
            <div className="absolute -bottom-2 left-6 w-4 h-4 rotate-45 bg-gray-950 border-b border-r border-green-500/30" />
          </div>
          <Blobi emotion="calm" size={64} className="mt-4 mb-3 sm:mt-3 sm:mb-2" />
          <div className="font-mono text-xs sm:text-[10px] mb-3 sm:mb-2 rounded-lg px-3 py-1.5 sm:px-2.5 sm:py-1 bg-gray-950 text-green-400/80 border border-green-500/20">
            <span className="text-green-500">$</span> indi monitor --watch<span className="animate-pulse">▊</span>
          </div>
          <h3 className="text-base sm:text-sm font-black text-white mb-1 sm:mb-0.5">Indi Runtime</h3>
          <p className="text-sm sm:text-[10px] text-gray-400 mb-4 sm:mb-3 max-w-[280px] sm:max-w-[240px]">The most simple, clever, smart lil' thingy missing from your monitoring.</p>
          <a
            href="/runtime"
            className="px-4 py-2.5 sm:px-3 sm:py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm sm:text-[10px] font-bold rounded-lg transition-all hover:scale-105"
          >
            npm install — let's gooo
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Retro grid background ─── */
function RetroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: '55%',
          background: 'linear-gradient(to bottom, transparent, rgba(124, 58, 237, 0.06))',
          maskImage: 'linear-gradient(to top, white 30%, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, white 30%, transparent)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `
              linear-gradient(rgba(124, 58, 237, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124, 58, 237, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 40px',
            transform: 'perspective(400px) rotateX(45deg)',
            transformOrigin: 'bottom',
          }}
        />
      </div>
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            background: 'rgba(200, 180, 255, 0.4)',
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: '40%',
          height: '20%',
          background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(124, 58, 237, 0.12), transparent)',
        }}
      />
    </div>
  );
}

/* ─── Main component ─── */
export default function HomeArcade() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const blobWrapperRef = useRef<HTMLDivElement>(null);
  const oopsRef = useRef<HTMLDivElement>(null);
  const yoooRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const glowBurstRef = useRef<HTMLDivElement>(null);
  const mobileCard1Ref = useRef<HTMLDivElement>(null);
  const mobileCard2Ref = useRef<HTMLDivElement>(null);
  const mobileDotsRef = useRef<HTMLDivElement>(null);
  const desktopCardsRef = useRef<HTMLDivElement>(null);
  const peekCardsRef = useRef<HTMLDivElement>(null);
  const chatBubbleRef = useRef<HTMLDivElement>(null);
  const [blobiEmotion, setBlobiEmotion] = useState<EmotionType>('panic');
  const [introChatVisible, setIntroChatVisible] = useState(true);
  const [yoooChatVisible, setYoooChatVisible] = useState(false);
  const [titleChatVisible, setTitleChatVisible] = useState(false);
  const lastT = useRef(0);
  const lastBubbleKey = useRef('');
  const reverseIndex = useRef(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout>>();

  // Forward scroll messages — tied to scroll zones
  const forwardMessages: Array<{ min: number; max: number; text: string; side: 'left' | 'right' }> = [
    { min: 0.13, max: 0.25, text: 'oh finally some space! 😮‍💨', side: 'right' },
    { min: 0.30, max: 0.42, text: 'heyyy looking good from here~', side: 'left' },
    { min: 0.50, max: 0.58, text: 'wait don\'t go too far! 🥺', side: 'right' },
    { min: 0.60, max: 0.70, text: 'ok ok check this out 👇', side: 'left' },
  ];

  // Reverse scroll messages — cycle through these
  const reverseMessages = [
    'hey where u going?! 😤',
    'wrong way man!! ☝️',
    'yo come back! 🥺',
    'the good stuff is DOWN there 👇',
    'bro. BRO. scroll DOWN. 😭',
    'i swear it\'s worth it!! 🙏',
  ];

  useEffect(() => {
    const START_SCALE = 12;
    const END_SCALE = 0.5;

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionH = section.offsetHeight;
      const viewH = window.innerHeight;
      const t = Math.max(0, Math.min(1, -rect.top / (sectionH - viewH)));

      // Chat bubble — one bubble, changes based on scroll position & direction
      const scrollingUp = t < lastT.current - 0.008 && t > 0.12 && t < 0.9;
      const scrollingDown = t > lastT.current + 0.003;

      if (chatBubbleRef.current) {
        const bubble = chatBubbleRef.current;
        const textEl = bubble.querySelector('[data-bubble-text]') as HTMLElement;

        if (scrollingUp) {
          // Scrolling up — Blobi protests
          const key = `reverse-${reverseIndex.current}`;
          if (lastBubbleKey.current !== key) {
            lastBubbleKey.current = key;
            if (textEl) textEl.textContent = reverseMessages[reverseIndex.current % reverseMessages.length];
            reverseIndex.current++;
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateX(-50%) translateY(0)';
            bubble.className = bubble.className.replace(/border-\w+-\d+/g, '').trim();
            bubble.classList.add('border-red-300');
            if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
            bubbleTimer.current = setTimeout(() => {
              bubble.style.opacity = '0';
              bubble.style.transform = 'translateX(-50%) translateY(-8px)';
              lastBubbleKey.current = '';
            }, 1800);
          }
        } else if (scrollingDown) {
          // Scrolling down — show zone-based message
          const msg = forwardMessages.find(m => t >= m.min && t <= m.max);
          if (msg) {
            const key = `fwd-${msg.min}`;
            if (lastBubbleKey.current !== key) {
              lastBubbleKey.current = key;
              if (textEl) textEl.textContent = msg.text;
              bubble.style.opacity = '1';
              bubble.style.transform = 'translateX(-50%) translateY(0)';
              bubble.className = bubble.className.replace(/border-\w+-\d+/g, '').trim();
              bubble.classList.add('border-pink-200');
              if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
              bubbleTimer.current = setTimeout(() => {
                bubble.style.opacity = '0';
                bubble.style.transform = 'translateX(-50%) translateY(-8px)';
                lastBubbleKey.current = '';
              }, 2000);
            }
          }
        }
      }
      lastT.current = t;

      const eased = 1 - Math.pow(1 - t, 3);
      const scale = START_SCALE - eased * (START_SCALE - END_SCALE);

      // Blobi stays centered + wobble at mid-stage
      if (blobWrapperRef.current) {
        const wobblePhase = (t > 0.30 && t < 0.55)
          ? Math.sin(((t - 0.30) / 0.25) * Math.PI * 4) * Math.sin(((t - 0.30) / 0.25) * Math.PI) * 8
          : 0;
        blobWrapperRef.current.style.transform = `scale(${scale}) rotate(${wobblePhase}deg)`;
        if (scale > 3) {
          blobWrapperRef.current.classList.add('arcade-zoom-blobi');
        } else {
          blobWrapperRef.current.classList.remove('arcade-zoom-blobi');
        }
      }

      // Pink → purple color shift (always smiling)
      const newEmotion: EmotionType = t < 0.5 ? 'pink' : 'happy';
      setBlobiEmotion(prev => prev !== newEmotion ? newEmotion : prev);

      // Intro chat and peek cards fade out early
      setIntroChatVisible(t < 0.12);
      setYoooChatVisible(t > 0.35 && t < 0.55);
      setTitleChatVisible(t > 0.55);
      if (oopsRef.current) {
        oopsRef.current.style.opacity = String(t < 0.12 ? 1 - t / 0.12 : 0);
      }
      if (peekCardsRef.current) {
        peekCardsRef.current.style.opacity = String(t < 0.12 ? 1 - t / 0.12 : 0);
      }

      // Retro bg fades in
      if (bgRef.current) {
        const bgT = t > 0.3 ? Math.min(1, (t - 0.3) / 0.3) : 0;
        bgRef.current.style.opacity = String(bgT);
      }

      // "yooohooo" appears mid-zoom — small bubble above Blobi
      if (yoooRef.current) {
        const yoooIn = t > 0.35 && t < 0.55 ? Math.sin(((t - 0.35) / 0.2) * Math.PI) : 0;
        yoooRef.current.style.opacity = String(yoooIn);
        yoooRef.current.style.transform = `translateX(-50%) translateY(${(1 - yoooIn) * 15}px)`;
      }

      // Glow burst — dramatic pink flash
      if (glowBurstRef.current) {
        const burstT = t > 0.55 && t < 0.85 ? Math.sin(((t - 0.55) / 0.3) * Math.PI) : 0;
        glowBurstRef.current.style.opacity = String(burstT * 0.7);
        glowBurstRef.current.style.transform = `scale(${1 + burstT * 0.5})`;
      }

      // Title appears
      if (titleRef.current) {
        const titleT = t > 0.55 ? Math.min(1, (t - 0.55) / 0.15) : 0;
        const titleEased = 1 - Math.pow(1 - titleT, 2);
        titleRef.current.style.opacity = String(titleEased);
        titleRef.current.style.transform = `translateY(${(1 - titleEased) * 20}px)`;
      }

      // Cards
      const isMobile = window.innerWidth < 1024;

      if (isMobile) {
        // Mobile: scroll-driven crossfade between stacked cards
        if (cardsRef.current) {
          const cardT = t > 0.65 ? Math.min(1, (t - 0.65) / 0.15) : 0;
          cardsRef.current.style.opacity = String(1 - Math.pow(1 - cardT, 3));
        }
        // Card 1 visible from 0.65–0.82, card 2 takes over from 0.82–1.0
        const switchPoint = 0.82;
        if (mobileCard1Ref.current) {
          const c1 = t < switchPoint ? 1 : Math.max(0, 1 - (t - switchPoint) / 0.06);
          mobileCard1Ref.current.style.opacity = String(c1);
          mobileCard1Ref.current.style.transform = t >= switchPoint ? `translateY(${-(t - switchPoint) / 0.06 * 20}px) scale(${1 - (t - switchPoint) / 0.06 * 0.05})` : '';
          mobileCard1Ref.current.style.pointerEvents = t < switchPoint ? 'auto' : 'none';
        }
        if (mobileCard2Ref.current) {
          const c2 = t >= switchPoint ? Math.min(1, (t - switchPoint) / 0.06) : 0;
          mobileCard2Ref.current.style.opacity = String(c2);
          mobileCard2Ref.current.style.transform = t < switchPoint ? `translateY(20px)` : `translateY(${(1 - Math.min(1, (t - switchPoint) / 0.06)) * 20}px)`;
          mobileCard2Ref.current.style.pointerEvents = t >= switchPoint ? 'auto' : 'none';
        }
        // Dots indicator
        if (mobileDotsRef.current) {
          const dot1 = mobileDotsRef.current.children[0] as HTMLElement;
          const dot2 = mobileDotsRef.current.children[1] as HTMLElement;
          if (dot1 && dot2) {
            dot1.style.opacity = t < switchPoint ? '1' : '0.3';
            dot2.style.opacity = t >= switchPoint ? '1' : '0.3';
          }
        }
      } else {
        // Desktop: slide in from sides
        if (desktopCardsRef.current) {
          const cardT = t > 0.65 ? (t - 0.65) / 0.35 : 0;
          const cardEased = 1 - Math.pow(1 - cardT, 3);
          desktopCardsRef.current.style.opacity = String(cardEased);
          const leftCards = desktopCardsRef.current.querySelectorAll('[data-card="left"]') as NodeListOf<HTMLElement>;
          const rightCards = desktopCardsRef.current.querySelectorAll('[data-card="right"]') as NodeListOf<HTMLElement>;
          leftCards.forEach(el => { el.style.transform = `translateX(${(1 - cardEased) * -120}px)`; });
          rightCards.forEach(el => { el.style.transform = `translateX(${(1 - cardEased) * 120}px)`; });
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    };
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: '#0c0618' }}>
      <section ref={sectionRef} className="relative" style={{ height: '500vh' }}>
        <div
          className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
          style={{ background: '#0c0618' }}
        >
          {/* Retro grid bg */}
          <div ref={bgRef} style={{ opacity: 0 }} className="absolute inset-0">
            <RetroGrid />
          </div>

          {/* Glow burst */}
          <div
            ref={glowBurstRef}
            className="absolute pointer-events-none"
            style={{
              opacity: 0,
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(219, 39, 119, 0.2) 40%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Blobi — stays centered, zooms from 12x to 0.5x */}
          <div
            ref={blobWrapperRef}
            className="arcade-zoom-blobi z-10"
            style={{
              transform: 'scale(12)',
              transformOrigin: '50% 35%',
              willChange: 'transform',
            }}
          >
            <Blobi emotion={blobiEmotion} size={300} animate />
          </div>

          {/* Single chat bubble — floats near Blobi, changes with scroll */}
          <div
            ref={chatBubbleRef}
            className="absolute z-40 pointer-events-none border-pink-200"
            style={{
              opacity: 0,
              top: '28%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-8px)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
          >
            <div className="relative inline-block px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-lg bg-white/95 text-gray-800 border-2 border-inherit">
              <p data-bubble-text className="font-bold text-xs sm:text-sm lg:text-base whitespace-nowrap" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white/95 border-b-2 border-r-2 border-inherit" />
            </div>
          </div>

          {/* Brand mark — always visible */}
          <IndiBrand />

          {/* Peek cards — visible when zoomed in */}
          <div
            ref={peekCardsRef}
            className="absolute top-3 right-3 sm:top-4 sm:right-5 z-[60] pointer-events-auto flex gap-2 sm:gap-3"
          >
            <a
              href="https://chromewebstore.google.com/detail/indi-mapper-developer-too/fhjekmbfchnehkoplcpmdgeabgimgcna"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all hover:scale-105"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.15), 0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-headline font-black text-xs sm:text-sm text-purple-300">Mapper</span>
            </a>
            <a
              href="/runtime"
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all hover:scale-105"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.15), 0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="font-headline font-black text-xs sm:text-sm text-green-300">Runtime</span>
            </a>
          </div>

          {/* Intro chat — DM-style typing messages from Blobi */}
          <div
            ref={oopsRef}
            className="absolute inset-0 z-50 pointer-events-none flex flex-col items-start justify-end pb-8 pl-4 sm:pb-12 sm:pl-8 lg:pb-16 lg:pl-12"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="relative">
              <BlobiChat
                visible={introChatVisible}
                lines={[
                  { text: 'hey!', size: 'big' },
                  { text: "you're way too close man" },
                  { text: 'some privacy please' },
                  { text: 'scroll down ↓', size: 'small' },
                ]}
              />
            </div>
          </div>

          {/* Yooo reveal — typing chat above Blobi */}
          <div
            ref={yoooRef}
            className="absolute z-50 pointer-events-none flex items-center justify-center"
            style={{ opacity: 0, top: '14%', left: '50%', transform: 'translateX(-50%) translateY(30px)' }}
          >
            <BlobiChat
              visible={yoooChatVisible}
              lines={[
                { text: 'yooohoooo~ 🎉', size: 'big' },
                { text: "that's more like it!" },
              ]}
              align="center"
              delay={300}
            />
          </div>

          {/* Title */}
          <div
            ref={titleRef}
            className="absolute top-4 sm:top-10 left-0 right-0 flex justify-center z-20 pointer-events-none px-4"
            style={{ opacity: 0 }}
          >
            <BlobiChat
              visible={titleChatVisible}
              lines={[
                { text: 'Welcome to Indi Mapper', size: 'big' },
                { text: 'Mr. blob here' },
                { text: 'come c what i got for u', size: 'small' },
              ]}
              align="center"
              delay={200}
            />
          </div>

          {/* Mobile: scroll-driven card gallery */}
          <div
            ref={cardsRef}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none lg:hidden"
            style={{ opacity: 0 }}
          >
            <div className="relative w-[85vw] max-w-[320px]" style={{ height: 440 }}>
              {/* Card 1 — Mapper */}
              <div ref={mobileCard1Ref} className="absolute inset-0 flex flex-col items-center gap-3" style={{ transition: 'opacity 0.15s, transform 0.15s' }}>
                <h3 className="font-headline font-black text-2xl text-white">Indi Mapper</h3>
                <p className="text-sm text-gray-300 text-center max-w-[280px]">The best Chrome extension in the world.</p>
                <ExtensionWindow />
              </div>
              {/* Card 2 — Runtime */}
              <div ref={mobileCard2Ref} className="absolute inset-0 flex flex-col items-center gap-3" style={{ opacity: 0, transition: 'opacity 0.15s, transform 0.15s' }}>
                <h3 className="font-headline font-black text-2xl text-white">Indi Runtime</h3>
                <p className="text-sm text-gray-300 text-center max-w-[280px]">The smart lil' thingy missing from your monitoring.</p>
                <RuntimeWindow />
              </div>
            </div>
            {/* Dots */}
            <div ref={mobileDotsRef} className="flex gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-pink-400 transition-opacity" />
              <div className="w-2 h-2 rounded-full bg-pink-400 transition-opacity" style={{ opacity: 0.3 }} />
            </div>
          </div>

          {/* Desktop: side by side with Blobi spacer */}
          <div
            ref={desktopCardsRef}
            className="absolute inset-0 hidden lg:flex items-center justify-center z-20 pointer-events-none"
            style={{ opacity: 0 }}
          >
            <div className="flex items-center gap-6 pointer-events-auto">
              <div data-card="left" className="flex flex-col items-center gap-3">
                <div className="text-center max-w-[300px]">
                  <h3 className="font-headline font-black text-2xl text-white mb-2">Indi Mapper</h3>
                  <p className="text-sm text-gray-300">The best Chrome extension in the world. Maps your APIs so you don't have to.</p>
                </div>
                <ExtensionWindow />
              </div>
              <div className="w-[180px] flex-shrink-0" />
              <div data-card="right" className="flex flex-col items-center gap-3">
                <div className="text-center max-w-[300px]">
                  <h3 className="font-headline font-black text-2xl text-white mb-2">Indi Runtime</h3>
                  <p className="text-sm text-gray-300 mb-4">The most simple, clever, smart lil' thingy missing from your monitoring.</p>
                </div>
                <RuntimeWindow />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
