// Beginner guides (PRD §7.7, §7.8, §7.9) in English and Hindi. Drafts until an
// editorial and language reviewer signs them off, and labelled as such on
// screen. No posture is presented as mandatory, and practice differs between
// traditions — the guides say both.

import type { Localised, ReviewStatus } from "@/lib/practice/prayers";
import type { AnimationId, FigureId, FigurePoint, SceneId } from "@/components/visuals/posture-figure";

export interface GuideCue {
  text: Localised;
  /** Part of the illustration this cue refers to; tapping the cue highlights it. */
  point?: FigurePoint;
}

export interface GuideStep {
  title: Localised;
  body: Localised[];
  /** Posture illustration(s) shown with the step. */
  figures?: FigureId[];
  /** Illustrated scene shown with the step. */
  scene?: SceneId;
  /** Animated illustration shown with the step. */
  animation?: AnimationId;
  /** Short bullet cues, e.g. alignment points. */
  cues?: GuideCue[];
  /** Optional caution shown with emphasis. */
  caution?: Localised;
}

export interface Guide {
  slug: string;
  title: Localised;
  summary: Localised;
  minutes: number;
  intro: Localised[];
  /** Still illustration for cards. */
  cover: FigureId;
  /** Animated illustration for the guide's header. */
  coverAnimation: AnimationId;
  steps: GuideStep[];
  closing?: Localised;
  review: ReviewStatus;
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-pray",
    title: { en: "How to pray", hi: "वंदना कैसे करें" },
    summary: {
      en: "A simple, step-by-step way to recite a prayer at home, for complete beginners.",
      hi: "घर पर वंदना करने का एक सरल, चरण-दर-चरण तरीका, बिलकुल नए लोगों के लिए।",
    },
    minutes: 4,
    cover: "standing-anjali",
    coverAnimation: "bow",
    intro: [
      {
        en: "There is no single correct way to pray in Buddhism. Traditions, monasteries and families each have their own customs. What follows is a simple pattern many people find helpful; adapt it to your own community's practice.",
        hi: "बौद्ध धम्म में वंदना करने का कोई एक ही सही तरीका नहीं है। हर परंपरा, विहार और परिवार की अपनी रीतियाँ होती हैं। नीचे एक सरल क्रम दिया गया है जो अनेक लोगों को उपयोगी लगता है; इसे अपने समुदाय की परंपरा के अनुसार ढाल लें।",
      },
    ],
    steps: [
      {
        title: { en: "Choose a quiet, comfortable place", hi: "एक शांत, आरामदायक स्थान चुनें" },
        scene: "scene-place",
        body: [
          {
            en: "Any calm corner works: a room, a balcony, a bench in a park. What matters is that you can sit undisturbed for a few minutes.",
            hi: "कोई भी शांत कोना चलेगा: कमरा, बालकनी या पार्क की बेंच। ज़रूरी बस इतना है कि आप कुछ मिनट बिना व्यवधान के बैठ सकें।",
          },
        ],
      },
      {
        title: { en: "Prepare the space, if you wish", hi: "चाहें तो स्थान तैयार करें" },
        scene: "scene-prepare",
        body: [
          {
            en: "Some people keep a small shrine with an image of the Buddha, and offer a candle, incense, flowers or water. These are optional and their meaning varies between traditions. A clean, simple space is enough.",
            hi: "कुछ लोग बुद्ध की प्रतिमा के साथ एक छोटा पूजा-स्थान रखते हैं और मोमबत्ती, धूप, फूल या जल अर्पित करते हैं। ये वैकल्पिक हैं और परंपराओं में इनका अर्थ अलग-अलग है। एक साफ़, सादा स्थान पर्याप्त है।",
          },
        ],
      },
      {
        title: { en: "Choose a comfortable posture", hi: "आरामदायक आसन चुनें" },
        animation: "sit-down",
        body: [
          {
            en: "Sit on a chair, a cushion or a bench, or stand if that suits you better. The guide on how to sit covers the options. Comfort and an upright, relaxed back matter more than any particular position.",
            hi: "कुर्सी, गद्दी या बेंच पर बैठें, या यदि आपको सुविधाजनक लगे तो खड़े रहें। 'कैसे बैठें' मार्गदर्शिका में सभी विकल्प दिए गए हैं। किसी विशेष आसन से अधिक ज़रूरी है आराम और सीधी, शिथिल पीठ।",
          },
        ],
      },
      {
        title: { en: "Settle with a few natural breaths", hi: "कुछ सहज श्वासों के साथ स्थिर हों" },
        animation: "breathe",
        body: [
          {
            en: "Let your hands rest, soften your shoulders and notice a few breaths without changing them. This helps the mind arrive before you begin.",
            hi: "हाथों को विश्राम दें, कंधों को ढीला छोड़ें और बिना बदले कुछ श्वासों पर ध्यान दें। इससे आरंभ से पहले मन यहाँ उपस्थित हो जाता है।",
          },
        ],
      },
      {
        title: { en: "Begin with an opening recitation", hi: "आरंभिक वंदना से शुरुआत करें" },
        animation: "bow",
        body: [
          {
            en: "Many people open with the homage to the Buddha (Namo tassa…), recited three times, with palms joined at the chest. Some bow before or after. Follow your community's custom where you have one.",
            hi: "अनेक लोग हाथ जोड़कर बुद्ध वंदना (नमो तस्स…) तीन बार कहकर आरंभ करते हैं। कुछ लोग पहले या बाद में प्रणाम करते हैं। यदि आपके समुदाय की कोई रीति है, तो उसका पालन करें।",
          },
        ],
      },
      {
        title: { en: "Read or recite the prayer", hi: "वंदना पढ़ें या उसका पाठ करें" },
        figures: ["anjali"],
        body: [
          {
            en: "Recite at a steady, unhurried pace. If you are new to Pali, it is fine to read slowly from the text or to read the translation. Understanding grows with repetition.",
            hi: "स्थिर, बिना जल्दबाज़ी की गति से पाठ करें। यदि आप पालि में नए हैं, तो पाठ को धीरे-धीरे पढ़ना या अनुवाद पढ़ना भी ठीक है। दोहराने से समझ बढ़ती है।",
          },
        ],
      },
      {
        title: { en: "Reflect on its meaning", hi: "उसके अर्थ पर चिंतन करें" },
        scene: "scene-reflect",
        body: [
          {
            en: "Take a moment with the translation. Which quality or intention does this prayer point to, and how might it show up in your day?",
            hi: "अनुवाद के साथ एक क्षण रुकें। यह वंदना किस गुण या संकल्प की ओर संकेत करती है, और वह आपके दिन में कैसे दिख सकता है?",
          },
        ],
      },
      {
        title: { en: "Close with a wish for others' well-being", hi: "दूसरों के कल्याण की कामना के साथ समापन करें" },
        scene: "scene-dedicate",
        body: [
          {
            en: 'Many people end by wishing well to all beings or by dedicating the merit of their practice. A simple wish such as "May all beings be happy" is enough.',
            hi: "अनेक लोग सभी प्राणियों के कल्याण की कामना करके या अपने अभ्यास का पुण्य समर्पित करके समापन करते हैं। \"सभी प्राणी सुखी हों\" जैसी सरल कामना पर्याप्त है।",
          },
        ],
      },
    ],
    closing: {
      en: "A few minutes of regular, unhurried practice is worth more than a long session done out of pressure. Be gentle with yourself.",
      hi: "दबाव में किए गए लंबे सत्र से कहीं अधिक मूल्यवान है नियमित, बिना जल्दबाज़ी के कुछ मिनट का अभ्यास। अपने प्रति कोमल रहें।",
    },
    review: "draft",
  },
  {
    slug: "how-to-sit",
    title: { en: "How to sit", hi: "कैसे बैठें" },
    summary: {
      en: "Comfortable postures for prayer and meditation, from a chair to the lotus position.",
      hi: "वंदना और ध्यान के लिए आरामदायक आसन, कुर्सी से लेकर पद्मासन तक।",
    },
    minutes: 5,
    cover: "burmese",
    coverAnimation: "breathe",
    intro: [
      {
        en: "You can pray and meditate in any posture that is safe and comfortable for your body: on a chair, kneeling, cross-legged, standing, or lying down when appropriate. No posture is required.",
        hi: "आप किसी भी ऐसे आसन में वंदना और ध्यान कर सकते हैं जो आपके शरीर के लिए सुरक्षित और आरामदायक हो: कुर्सी पर, घुटनों के बल, पालथी मारकर, खड़े होकर, या उचित हो तो लेटकर। कोई आसन अनिवार्य नहीं है।",
      },
      {
        en: "Whichever you choose, aim for a back that is upright but not stiff, relaxed shoulders, and a position you can hold without strain.",
        hi: "जो भी चुनें, प्रयास करें कि पीठ सीधी हो पर अकड़ी न हो, कंधे ढीले हों, और आसन ऐसा हो जिसमें आप बिना तनाव के बैठ सकें।",
      },
    ],
    steps: [
      {
        title: { en: "Chair sitting", hi: "कुर्सी पर बैठना" },
        figures: ["chair"],
        body: [
          {
            en: "The most accessible option, and a good choice for anyone with knee, hip or back discomfort.",
            hi: "सबसे सुलभ विकल्प, और घुटने, कूल्हे या पीठ में तकलीफ़ वालों के लिए अच्छा।",
          },
        ],
        cues: [
          {
            text: {
              en: "Sit towards the front of the seat so your back holds itself up, or use the backrest if you need support.",
              hi: "सीट के आगे की ओर बैठें ताकि पीठ अपने आप सीधी रहे, या ज़रूरत हो तो पीठ टिकाने का सहारा लें।",
            },
            point: "seat",
          },
          {
            text: {
              en: "Feet flat on the floor, about hip-width apart; knees roughly level with your hips.",
              hi: "पैर ज़मीन पर सपाट, कूल्हों जितनी दूरी पर; घुटने लगभग कूल्हों की ऊँचाई पर।",
            },
            point: "feet",
          },
          {
            text: { en: "Rest your hands on your thighs or in your lap.", hi: "हाथों को जाँघों पर या गोद में रखें।" },
            point: "hands",
          },
          {
            text: {
              en: "A folded blanket under your feet helps if they don't reach the floor.",
              hi: "यदि पैर ज़मीन तक न पहुँचें, तो उनके नीचे तह किया हुआ कंबल रखें।",
            },
            point: "feet",
          },
        ],
      },
      {
        title: { en: "Kneeling, or sitting on a bench", hi: "घुटनों के बल, या बेंच पर बैठना" },
        figures: ["bench"],
        body: [
          {
            en: "Common in some traditions and comfortable for many people's backs.",
            hi: "कुछ परंपराओं में प्रचलित, और अनेक लोगों की पीठ के लिए आरामदायक।",
          },
        ],
        cues: [
          {
            text: {
              en: "Kneel with a cushion or a low meditation bench under your sitting bones, taking weight off your ankles.",
              hi: "बैठने की हड्डियों के नीचे गद्दी या छोटी ध्यान-बेंच रखकर घुटनों के बल बैठें, ताकि टखनों पर भार न पड़े।",
            },
            point: "seat",
          },
          {
            text: {
              en: "Knees about hip-width apart; tops of the feet resting on the floor or a soft mat.",
              hi: "घुटने कूल्हों जितनी दूरी पर; पैरों का ऊपरी भाग ज़मीन या मुलायम चटाई पर।",
            },
            point: "feet",
          },
          {
            text: {
              en: "Add padding under the knees and ankles if you feel pressure.",
              hi: "यदि दबाव लगे तो घुटनों और टखनों के नीचे गद्दी लगाएँ।",
            },
            point: "knees",
          },
        ],
      },
      {
        title: { en: "Burmese (easy cross-legged) position", hi: "बर्मी (सरल पालथी) आसन" },
        figures: ["burmese"],
        body: [
          {
            en: "Both legs rest on the floor, one in front of the other, with neither foot on top of the other leg.",
            hi: "दोनों पैर ज़मीन पर, एक के आगे दूसरा; कोई भी पैर दूसरे पैर के ऊपर नहीं।",
          },
        ],
        cues: [
          {
            text: {
              en: "Sit on the front third of a firm cushion so your hips are higher than your knees.",
              hi: "मज़बूत गद्दी के आगे के एक-तिहाई भाग पर बैठें ताकि कूल्हे घुटनों से ऊँचे रहें।",
            },
            point: "cushion",
          },
          {
            text: {
              en: "Let both knees rest on the floor, or on cushions if they don't reach.",
              hi: "दोनों घुटने ज़मीन पर टिकाएँ, या न पहुँचें तो उनके नीचे गद्दियाँ रखें।",
            },
            point: "knees",
          },
          {
            text: { en: "Lengthen through the spine and let the chin tuck slightly.", hi: "रीढ़ को लंबा रखें और ठुड्डी को थोड़ा अंदर की ओर रखें।" },
            point: "spine",
          },
        ],
      },
      {
        title: { en: "Half-lotus", hi: "अर्ध-पद्मासन" },
        figures: ["half-lotus"],
        body: [
          {
            en: "One foot rests on the opposite thigh and the other foot on the floor. It needs open hips; only try it if Burmese position is easy for you.",
            hi: "एक पैर दूसरी जाँघ पर और दूसरा पैर ज़मीन पर रहता है। इसके लिए कूल्हों में लचीलापन चाहिए; इसे तभी आज़माएँ जब बर्मी आसन आपके लिए सहज हो।",
          },
        ],
        cues: [
          {
            text: { en: "Use a cushion so your hips are above your knees.", hi: "गद्दी का उपयोग करें ताकि कूल्हे घुटनों से ऊपर रहें।" },
            point: "cushion",
          },
          {
            text: {
              en: "Alternate which leg is on top in different sessions to keep things balanced.",
              hi: "संतुलन बनाए रखने के लिए अलग-अलग सत्रों में ऊपर वाला पैर बदलते रहें।",
            },
            point: "foot",
          },
        ],
        caution: {
          en: "If you feel any pain in the knee, stop and return to an easier posture. Knees are vulnerable to twisting.",
          hi: "घुटने में कोई भी दर्द हो तो रुकें और आसान आसन पर लौट आएँ। घुटने मुड़ने से आसानी से चोटिल हो सकते हैं।",
        },
      },
      {
        title: { en: "Full-lotus (optional)", hi: "पद्मासन (वैकल्पिक)" },
        figures: ["full-lotus"],
        body: [
          {
            en: "Each foot rests on the opposite thigh. It is a traditional posture but it is not suitable for everyone and is never necessary. Many experienced practitioners never use it.",
            hi: "दोनों पैर एक-दूसरे की विपरीत जाँघ पर रहते हैं। यह पारंपरिक आसन है, पर सबके लिए उपयुक्त नहीं और कभी अनिवार्य नहीं। अनेक अनुभवी साधक इसका उपयोग कभी नहीं करते।",
          },
        ],
        caution: {
          en: "Never force your legs into position. Pain in the knees or hips is a signal to stop.",
          hi: "पैरों को कभी ज़बरदस्ती आसन में न लाएँ। घुटनों या कूल्हों में दर्द रुकने का संकेत है।",
        },
      },
      {
        title: { en: "Hands", hi: "हाथ" },
        figures: ["lap-hands", "anjali"],
        body: [
          {
            en: "For meditation, many people rest the hands in the lap, right hand on the left with the thumbs lightly touching, or simply place them on the knees.",
            hi: "ध्यान के लिए अनेक लोग हाथों को गोद में रखते हैं, दाहिना हाथ बाएँ हाथ पर और अंगूठे हल्के से मिले हुए, या उन्हें बस घुटनों पर रख लेते हैं।",
          },
          {
            en: "For homage and recitation, palms are often joined at the chest (añjali). Customs vary between traditions and places.",
            hi: "वंदना और पाठ के समय प्रायः छाती के सामने हथेलियाँ जोड़ी जाती हैं (अंजलि)। परंपराओं और स्थानों के अनुसार रीतियाँ भिन्न होती हैं।",
          },
        ],
      },
    ],
    closing: {
      en: "Don't stay in a position that hurts. Moving mindfully to ease discomfort is part of practice, not a failure of it. This guide is general information, not medical advice.",
      hi: "जिस आसन में दर्द हो, उसमें न रहें। असुविधा कम करने के लिए सजगता से हिलना अभ्यास का हिस्सा है, उसकी विफलता नहीं। यह मार्गदर्शिका सामान्य जानकारी है, चिकित्सा सलाह नहीं।",
    },
    review: "draft",
  },
  {
    slug: "temple-etiquette",
    title: { en: "Visiting a temple", hi: "विहार में शिष्टाचार" },
    summary: {
      en: "How to visit a temple or monastery respectfully: footwear, greeting monastics, offerings and more.",
      hi: "विहार या मठ में सम्मान के साथ कैसे जाएँ: जूते-चप्पल, भिक्षुओं का अभिवादन, दान और बहुत कुछ।",
    },
    minutes: 4,
    cover: "anjali",
    coverAnimation: "bow",
    intro: [
      {
        en: "Buddhist temples, vihāras and monasteries usually welcome respectful visitors. Customs differ between traditions, countries and individual places, so what follows are common courtesies rather than rules. When unsure, watch what others do, or quietly ask.",
        hi: "बौद्ध विहार और मठ सामान्यतः सम्मान रखने वाले आगंतुकों का स्वागत करते हैं। परंपराओं, देशों और स्थानों के अनुसार रीतियाँ भिन्न होती हैं, इसलिए नीचे दी गई बातें नियम नहीं, बल्कि सामान्य शिष्टाचार हैं। संदेह हो तो देखें कि दूसरे क्या करते हैं, या धीरे से पूछ लें।",
      },
    ],
    steps: [
      {
        title: { en: "Arriving: footwear and dress", hi: "पहुँचने पर: जूते-चप्पल और वस्त्र" },
        body: [
          {
            en: "Dress modestly, with shoulders and knees covered. Many lay Buddhists in India and Theravāda countries wear white or light clothing to the vihāra; it is customary but not required.",
            hi: "शालीन वस्त्र पहनें, जिनसे कंधे और घुटने ढके हों। भारत और थेरवाद देशों में अनेक उपासक विहार में सफ़ेद या हल्के रंग के कपड़े पहनते हैं; यह प्रचलित है, पर अनिवार्य नहीं।",
          },
        ],
        cues: [
          {
            text: {
              en: "Remove your shoes before entering the shrine hall, or wherever you see others' footwear left at the door.",
              hi: "पूजा-कक्ष में जाने से पहले, या जहाँ दरवाज़े पर दूसरों के जूते रखे दिखें, वहाँ अपने जूते उतार दें।",
            },
          },
          {
            text: { en: "Switch your phone to silent and speak softly.", hi: "फ़ोन को साइलेंट पर रखें और धीमे स्वर में बात करें।" },
          },
          {
            text: { en: "Remove hats and sunglasses inside.", hi: "अंदर टोपी और धूप का चश्मा उतार दें।" },
          },
        ],
      },
      {
        title: { en: "At the shrine", hi: "पूजा-स्थान पर" },
        figures: ["anjali"],
        body: [
          {
            en: "Before the Buddha image, people often join their palms and bow. In many communities this is done three times, sometimes touching the forehead to the floor. Bow in whatever way you are comfortable with, or simply stand quietly.",
            hi: "बुद्ध प्रतिमा के सामने लोग प्रायः हाथ जोड़कर प्रणाम करते हैं। अनेक समुदायों में यह तीन बार किया जाता है, कभी-कभी माथा ज़मीन से छुआकर। जिस तरह आपको सहज लगे उस तरह प्रणाम करें, या बस शांत खड़े रहें।",
          },
        ],
        cues: [
          {
            text: {
              en: "Avoid pointing your feet towards the Buddha image or towards monastics; tuck them to the side or behind you.",
              hi: "पैरों का रुख़ बुद्ध प्रतिमा या भिक्षुओं की ओर न करें; उन्हें एक ओर या पीछे की ओर मोड़ लें।",
            },
          },
          {
            text: {
              en: "Don't climb on, lean against or pose beside statues and stupas.",
              hi: "प्रतिमाओं और स्तूपों पर न चढ़ें, न उनसे टेक लगाएँ, न उनके साथ पोज़ देकर तस्वीर लें।",
            },
          },
          {
            text: {
              en: "Where it is the custom, walk around stupas and shrines clockwise, keeping them on your right.",
              hi: "जहाँ यह परंपरा हो, स्तूप और पूजा-स्थान की परिक्रमा घड़ी की दिशा में करें, उन्हें अपनी दाईं ओर रखते हुए।",
            },
          },
        ],
      },
      {
        title: { en: "Greeting monastics", hi: "भिक्षुओं का अभिवादन" },
        animation: "bow",
        body: [
          {
            en: "Greet monks and nuns with joined palms and a slight bow. In many Theravāda and Indian Buddhist communities, monks are addressed as \"Bhante\".",
            hi: "भिक्षुओं और भिक्षुणियों का अभिवादन हाथ जोड़कर और हल्का झुककर करें। अनेक थेरवाद और भारतीय बौद्ध समुदायों में भिक्षुओं को \"भंते\" कहकर संबोधित किया जाता है।",
          },
        ],
        cues: [
          {
            text: {
              en: "Where possible, sit at a lower level than a monastic, and don't sit on a seat set aside for them.",
              hi: "जहाँ संभव हो, भिक्षु से नीचे के स्तर पर बैठें, और उनके लिए रखे आसन पर न बैठें।",
            },
          },
          {
            text: {
              en: "In some Theravāda communities, monks do not touch women or take items directly from their hands; an offering may be placed on a cloth or table instead. Follow what others do.",
              hi: "कुछ थेरवाद समुदायों में भिक्षु महिलाओं को नहीं छूते और न उनके हाथ से सीधे कोई वस्तु लेते हैं; ऐसे में भेंट किसी कपड़े या मेज़ पर रखी जाती है। दूसरों को देखकर उसी तरह करें।",
            },
          },
        ],
      },
      {
        title: { en: "Offerings (dāna)", hi: "दान" },
        scene: "scene-prepare",
        body: [
          {
            en: "Common offerings are flowers, candles, incense, water, food or everyday necessities. Offer with both hands and give what you can; offerings are always voluntary.",
            hi: "प्रचलित भेंट हैं फूल, मोमबत्ती, धूप, जल, भोजन या दैनिक उपयोग की वस्तुएँ। दोनों हाथों से अर्पित करें और जितना संभव हो उतना दें; दान हमेशा स्वैच्छिक होता है।",
          },
          {
            en: "In the Theravāda tradition monastics generally eat only before midday, so food is offered in the morning.",
            hi: "थेरवाद परंपरा में भिक्षु सामान्यतः दोपहर से पहले ही भोजन करते हैं, इसलिए भोजन सुबह के समय दान किया जाता है।",
          },
        ],
      },
      {
        title: { en: "Joining chanting or meditation", hi: "वंदना या ध्यान में शामिल होना" },
        animation: "breathe",
        body: [
          {
            en: "If you arrive during chanting or meditation, enter quietly and sit near the back. You are welcome to listen without joining in, and to follow others' lead on when to stand, bow or sit.",
            hi: "यदि आप वंदना या ध्यान के समय पहुँचें, तो चुपचाप अंदर आएँ और पीछे की ओर बैठ जाएँ। आप बिना शामिल हुए भी सुन सकते हैं, और कब खड़ा होना, प्रणाम करना या बैठना है, यह दूसरों को देखकर कर सकते हैं।",
          },
        ],
      },
      {
        title: { en: "Photography", hi: "फ़ोटोग्राफ़ी" },
        body: [
          {
            en: "Ask before photographing people, monastics or ceremonies, and look for signs: some shrine halls don't allow photos at all. Never use flash during chanting or meditation.",
            hi: "लोगों, भिक्षुओं या समारोहों की तस्वीर लेने से पहले पूछें, और सूचना-पट देखें: कुछ पूजा-कक्षों में फ़ोटो लेना बिलकुल मना होता है। वंदना या ध्यान के समय कभी फ़्लैश का उपयोग न करें।",
          },
        ],
      },
    ],
    closing: {
      en: "Visitors are rarely expected to know every custom. Quietness, a respectful attitude and a willingness to learn matter far more than getting everything right.",
      hi: "आगंतुकों से हर रीति जानने की अपेक्षा शायद ही की जाती है। हर बात सही करने से कहीं अधिक महत्वपूर्ण हैं शांति, सम्मान का भाव और सीखने की इच्छा।",
    },
    review: "draft",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
