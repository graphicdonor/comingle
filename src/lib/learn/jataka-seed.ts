// Jātaka tales: stories of the Buddha's earlier lives, when, as the
// Bodhisatta, he practised the perfections (pāramī) such as generosity,
// patience and truthfulness. The 547 Jātakas are part of the Khuddaka Nikāya
// of the Pali Canon.
//
// These are short retellings, in English and Hindi, following the Pali story
// as given in the Jātaka commentary (English translation ed. E. B. Cowell,
// 1895–1907, public domain). Retellings are drafts until a subject and
// language reviewer signs them off, and say so on screen. Stories published
// in the CMS replace this built-in set (src/lib/learn/jataka.ts).
//
// This file must not import the generated CMS files: the build step that
// creates them (scripts/fetch-cms-content.ts) imports it.

import type { Localised, PrayerReview } from "../practice/prayers";

export interface JatakaStory {
  slug: string;
  /** Number in the Jātaka collection (1–547). */
  number: number;
  title: { pi: string } & Localised;
  /** The quality the story is about, e.g. Generosity. */
  theme: Localised;
  summary: Localised;
  paragraphs: Localised[];
  /** What the story teaches, in a sentence or two. */
  lesson: Localised;
  minutes: number;
  source: { title: string; reference: string };
  review: { hi: PrayerReview; en: PrayerReview };
}

const DRAFT = { status: "draft" } as const;
const REVIEW = { hi: DRAFT, en: DRAFT };
const SOURCE = (n: number) => ({ title: "Jātaka (Khuddaka Nikāya)", reference: `Jātaka ${n}` });

/** What the Jātakas are, for the top of the list. */
export const JATAKA_INTRO: Localised[] = [
  {
    en: "The Jātakas are stories of the Buddha's earlier lives. In them the Bodhisatta, the one who would become the Buddha, is born as a king, a merchant, a teacher, or an animal such as a deer, a monkey or a hare, and in each life practises a quality like generosity, patience or truthfulness.",
    hi: "जातक कथाएँ भगवान बुद्ध के पूर्व जन्मों की कहानियाँ हैं। इनमें बोधिसत्त, यानी वे जो आगे चलकर बुद्ध बने, कभी राजा, व्यापारी या आचार्य के रूप में जन्म लेते हैं, तो कभी हिरण, बंदर या खरगोश जैसे पशु के रूप में, और हर जन्म में दान, धैर्य या सत्य जैसे किसी गुण का अभ्यास करते हैं।",
  },
  {
    en: "There are 547 Jātakas in the Khuddaka Nikāya of the Pali Canon. The Buddha told each one about something happening at the time, and at the end showed who each character had been. These are short retellings for reading and reflection; the full stories are longer and include verses.",
    hi: "पालि तिपिटक के खुद्दक निकाय में 547 जातक हैं। भगवान बुद्ध ने हर कथा उस समय की किसी घटना के प्रसंग में सुनाई, और अंत में बताया कि कौन पात्र कौन था। यहाँ पढ़ने और मनन करने के लिए संक्षिप्त रूप दिए गए हैं; मूल कथाएँ इनसे लंबी हैं और उनमें गाथाएँ भी हैं।",
  },
];

/** The stories built into the app; the CMS starts from these. */
export const SEED_STORIES: JatakaStory[] = [
  {
    slug: "sasa-jataka",
    number: 316,
    title: { pi: "Sasa Jātaka", en: "The Hare in the Moon", hi: "चाँद में खरगोश" },
    theme: { en: "Generosity", hi: "दान" },
    summary: {
      en: "A hare with nothing to give but grass offers his own body to a hungry traveller.",
      hi: "एक खरगोश, जिसके पास देने को केवल घास थी, एक भूखे पथिक को अपना शरीर ही अर्पित कर देता है।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as a hare in a forest. He lived with three friends, an otter, a jackal and a monkey, and taught them to be generous and to keep the precepts.",
        hi: "बहुत समय पहले बोधिसत्त एक वन में खरगोश के रूप में जन्मे। वे अपने तीन मित्रों, एक ऊदबिलाव, एक सियार और एक बंदर के साथ रहते थे, और उन्हें दान देने तथा शील का पालन करने की शिक्षा देते थे।",
      },
      {
        en: "One holy day the hare said, \"Today, if anyone asks us for food, let us give.\" The otter found some fish on a riverbank, the jackal found meat and a pot of curd, and the monkey gathered mangoes. But the hare ate only grass, and grass is no gift for a guest. So he made up his mind: \"If someone comes, I will give my own body.\"",
        hi: "एक उपोसथ के दिन खरगोश ने कहा, \"आज यदि कोई हमसे भोजन माँगे, तो हम दान देंगे।\" ऊदबिलाव को नदी के किनारे कुछ मछलियाँ मिलीं, सियार को मांस और दही का एक पात्र मिला, और बंदर आम तोड़ लाया। पर खरगोश तो केवल घास खाता था, और घास किसी अतिथि को देने योग्य नहीं। इसलिए उसने निश्चय किया, \"यदि कोई आएगा, तो मैं अपना शरीर ही दान कर दूँगा।\"",
      },
      {
        en: "Sakka, king of the gods, heard of this resolve and came to test him, disguised as a hungry brahmin. The hare welcomed him and said, \"Gather wood and light a fire, and I will give you something no hare has given before.\" When the fire blazed, the hare shook himself three times, so that no small creature in his fur would be hurt, and leapt joyfully into the flames.",
        hi: "देवराज सक्क (इंद्र) ने इस संकल्प के बारे में सुना और एक भूखे ब्राह्मण का रूप धरकर उसकी परीक्षा लेने आए। खरगोश ने उनका स्वागत किया और कहा, \"लकड़ियाँ इकट्ठी करके आग जलाइए, मैं आपको वह दूँगा जो किसी खरगोश ने पहले कभी नहीं दिया।\" जब आग धधक उठी, तो खरगोश ने तीन बार अपना शरीर झटका, ताकि उसके रोओं में बसे किसी छोटे जीव को हानि न पहुँचे, और प्रसन्न मन से लपटों में कूद पड़ा।",
      },
      {
        en: "But the fire was as cool as snow; not a hair was burned. Sakka revealed himself and said, \"Your goodness should be known for as long as the world lasts.\" He drew the shape of a hare on the face of the moon, and that, the story says, is the hare we still see there.",
        hi: "पर वह आग बर्फ़ जैसी शीतल थी; एक रोआँ भी नहीं जला। सक्क ने अपना असली रूप प्रकट किया और कहा, \"तुम्हारी यह भलाई तब तक याद रखी जाए जब तक यह संसार रहे।\" उन्होंने चंद्रमा पर खरगोश की आकृति बना दी, और कथा कहती है कि वही खरगोश आज भी चाँद में दिखाई देता है।",
      },
    ],
    lesson: {
      en: "True generosity gives what one has, gladly and without holding back, and takes care not to harm even the smallest being.",
      hi: "सच्चा दान वह है जो अपने पास जो हो, उसे प्रसन्नता से और बिना हिचक दे, और सबसे छोटे जीव को भी हानि न पहुँचाने का ध्यान रखे।",
    },
    minutes: 3,
    source: SOURCE(316),
    review: REVIEW,
  },
  {
    slug: "nigrodhamiga-jataka",
    number: 12,
    title: { pi: "Nigrodhamiga Jātaka", en: "The Banyan Deer", hi: "न्यग्रोध मृग" },
    theme: { en: "Compassion", hi: "करुणा" },
    summary: {
      en: "A king of deer offers his own life to save a mother deer and her unborn fawn.",
      hi: "हिरणों का एक राजा एक हिरणी और उसके अजन्मे बच्चे को बचाने के लिए अपना जीवन अर्पित कर देता है।",
    },
    paragraphs: [
      {
        en: "Long ago in Bārāṇasī, the Bodhisatta was born as a golden deer, king of a herd, and was called the Banyan Deer. Nearby lived another herd, led by the Branch Deer. The king of Bārāṇasī loved hunting, so his people drove both herds into a royal park, and the king ordered that the two golden deer kings must never be harmed.",
        hi: "बहुत समय पहले वाराणसी के पास बोधिसत्त एक सुनहरे हिरण के रूप में जन्मे, जो एक झुंड के राजा थे और न्यग्रोध मृग (बरगद हिरण) कहलाते थे। पास ही एक दूसरा झुंड था, जिसका राजा शाखा मृग था। वाराणसी के राजा को शिकार का बहुत शौक था, इसलिए प्रजा ने दोनों झुंडों को राजा के उद्यान में घेर दिया, और राजा ने आदेश दिया कि दोनों सुनहरे मृगराजों को कभी हानि न पहुँचाई जाए।",
      },
      {
        en: "So that the deer would not suffer from being hunted every day, the two herds agreed that each day one deer, chosen in turn from each herd, would go to the king's kitchen. One day the turn fell on a doe of the Branch Deer's herd who was about to give birth. She begged her leader to let her wait until her fawn was born, but he refused.",
        hi: "ताकि हर दिन शिकार से हिरणों को पीड़ा न हो, दोनों झुंडों ने तय किया कि हर दिन बारी-बारी से हर झुंड से एक हिरण राजा की रसोई में जाएगा। एक दिन बारी शाखा मृग के झुंड की एक गर्भवती हिरणी की आई। उसने अपने राजा से विनती की कि बच्चे के जन्म तक उसे रुकने दिया जाए, पर उसने मना कर दिया।",
      },
      {
        en: "She went to the Banyan Deer instead. He said, \"Go home; I will take your place,\" and went himself and laid his head on the block. When the king heard that the golden deer king had come, he hurried there and asked why. \"A mother and her unborn young were in danger,\" said the deer. \"I could not ask another to suffer in her place.\"",
        hi: "तब वह न्यग्रोध मृग के पास गई। उन्होंने कहा, \"घर जाओ, तुम्हारी जगह मैं जाऊँगा,\" और स्वयं जाकर वध-स्थल पर सिर रख दिया। जब राजा ने सुना कि सुनहरे मृगराज आए हैं, तो वे दौड़े आए और कारण पूछा। मृग ने कहा, \"एक माँ और उसका अजन्मा बच्चा संकट में थे। मैं किसी और से उसकी जगह कष्ट सहने को नहीं कह सकता था।\"",
      },
      {
        en: "The king was deeply moved. \"I have never seen such kindness even among people,\" he said, and spared the deer and the doe. The Banyan Deer asked, \"And the others?\" Step by step the king granted safety to all the deer, then to all four-footed animals, the birds and the fish. The Bodhisatta taught him the Dhamma, and the forest became a place where every creature could live without fear.",
        hi: "राजा का हृदय भर आया। उन्होंने कहा, \"ऐसी दया मैंने मनुष्यों में भी नहीं देखी,\" और मृगराज तथा हिरणी दोनों को जीवनदान दिया। न्यग्रोध मृग ने पूछा, \"और बाकी जीवों का क्या?\" एक-एक करके राजा ने सब हिरणों को, फिर सब चौपायों को, पक्षियों और मछलियों को भी अभय दिया। बोधिसत्त ने राजा को धम्म का उपदेश दिया, और वह वन ऐसा स्थान बन गया जहाँ हर जीव निर्भय होकर रह सकता था।",
      },
    ],
    lesson: {
      en: "Compassion does not ask whose turn it is to suffer; it steps forward to protect, and its example can change even the powerful.",
      hi: "करुणा यह नहीं पूछती कि कष्ट सहने की बारी किसकी है; वह रक्षा के लिए आगे बढ़ती है, और उसका उदाहरण शक्तिशाली को भी बदल सकता है।",
    },
    minutes: 3,
    source: SOURCE(12),
    review: REVIEW,
  },
  {
    slug: "mahakapi-jataka",
    number: 407,
    title: { pi: "Mahākapi Jātaka", en: "The Great Monkey King", hi: "महाकपि" },
    theme: { en: "Leadership as service", hi: "सेवा भरा नेतृत्व" },
    summary: {
      en: "A monkey king turns his own body into a bridge so that his troop can escape.",
      hi: "एक वानरराज अपने ही शरीर को पुल बना देते हैं, ताकि उनका पूरा दल बच सके।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as a great monkey king who led a troop of eighty thousand monkeys in the Himalayas. They lived in a huge mango tree on the bank of the Ganges, whose fruit was wonderfully sweet. The monkey king warned, \"Never let a single mango fall into the river, or men will come looking for this tree.\"",
        hi: "बहुत समय पहले बोधिसत्त एक महान वानरराज के रूप में जन्मे, जो हिमालय में अस्सी हज़ार वानरों के दल के नायक थे। वे गंगा के किनारे एक विशाल आम के पेड़ पर रहते थे, जिसके फल अत्यंत मीठे थे। वानरराज ने चेताया, \"एक भी आम नदी में न गिरने देना, नहीं तो मनुष्य इस पेड़ को ढूँढ़ते हुए आ जाएँगे।\"",
      },
      {
        en: "But one ripe mango, hidden in an ants' nest, dropped into the water and floated down to Bārāṇasī, where the king was bathing. He tasted it and longed for more, so he travelled upriver with his men, found the tree full of monkeys, and ordered his archers to surround it at dawn.",
        hi: "पर एक पका आम, जो चींटियों के घोंसले में छिपा था, पानी में गिर गया और बहते-बहते वाराणसी पहुँच गया, जहाँ राजा स्नान कर रहे थे। उन्होंने उसे चखा और और भी आम पाने की इच्छा हुई। वे अपने लोगों के साथ नदी के ऊपर की ओर गए, वानरों से भरा वह पेड़ ढूँढ़ निकाला, और धनुर्धारियों को आदेश दिया कि भोर होते ही पेड़ को घेर लें।",
      },
      {
        en: "The monkey king did not run. He leapt across the river, tied a long bamboo cane to his foot, and leapt back towards the tree, but the cane was a little too short. So he caught hold of a branch and stretched his own body across the gap, and the whole troop crossed to safety over his back. The last monkey, who had long envied him, jumped down hard on his back and broke it.",
        hi: "वानरराज भागे नहीं। वे छलाँग लगाकर नदी के पार गए, एक लंबा बाँस अपने पैर में बाँधा और वापस पेड़ की ओर कूदे, पर बाँस थोड़ा छोटा पड़ गया। तब उन्होंने एक डाल पकड़ ली और अपने ही शरीर को उस दूरी पर फैला दिया, और पूरा दल उनकी पीठ पर से होकर सुरक्षित पार हो गया। सबसे आख़िरी बंदर, जो बहुत समय से उनसे ईर्ष्या करता था, ज़ोर से उनकी पीठ पर कूदा और उसे तोड़ दिया।",
      },
      {
        en: "The king of Bārāṇasī had watched it all. He had the monkey king gently lowered and cared for, and asked why he had done this. \"I was their leader,\" he said. \"Their safety mattered more to me than my life. A good ruler should care for the well-being of all who depend on him.\" With these words he died, and the king honoured him and ruled with this teaching in his heart.",
        hi: "वाराणसी के राजा यह सब देख रहे थे। उन्होंने वानरराज को धीरे से नीचे उतरवाया, उनकी सेवा करवाई, और पूछा कि उन्होंने ऐसा क्यों किया। वानरराज ने कहा, \"मैं उनका नायक था। उनकी सुरक्षा मेरे लिए मेरे प्राणों से बढ़कर थी। एक अच्छे शासक को उन सबके कल्याण की चिंता करनी चाहिए जो उस पर निर्भर हैं।\" यह कहकर उन्होंने प्राण त्याग दिए, और राजा ने उनका सम्मान किया और इस शिक्षा को हृदय में रखकर राज्य चलाया।",
      },
    ],
    lesson: {
      en: "To lead is to serve: a true leader carries others across, even at a cost to himself.",
      hi: "नेतृत्व का अर्थ है सेवा: सच्चा नायक दूसरों को पार लगाता है, चाहे इसके लिए उसे स्वयं कष्ट उठाना पड़े।",
    },
    minutes: 3,
    source: SOURCE(407),
    review: REVIEW,
  },
  {
    slug: "sumsumara-jataka",
    number: 208,
    title: { pi: "Suṃsumāra Jātaka", en: "The Monkey and the Crocodile", hi: "बंदर और मगरमच्छ" },
    theme: { en: "Presence of mind", hi: "सूझ-बूझ" },
    summary: {
      en: "A monkey tricked into danger by a crocodile saves himself with calm, quick thinking.",
      hi: "मगरमच्छ के छल में फँसा एक बंदर शांत रहकर और तुरंत सोच-समझकर अपनी जान बचाता है।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as a monkey who lived by the Ganges. He grew strong and nimble and spent his days among the fruit trees on the riverbank. In the river lived a crocodile, and the crocodile's wife saw the monkey and longed to eat his heart.",
        hi: "बहुत समय पहले बोधिसत्त गंगा के किनारे रहने वाले एक बंदर के रूप में जन्मे। वे बलवान और फुर्तीले थे और दिन भर नदी के किनारे फलों के पेड़ों पर रहते थे। उसी नदी में एक मगरमच्छ रहता था, और मगरमच्छ की पत्नी ने बंदर को देखकर उसका हृदय खाने की इच्छा की।",
      },
      {
        en: "The crocodile came to the monkey and said kindly, \"On the far bank there are mangoes and jackfruit in plenty. Climb on my back and I will take you there.\" The monkey climbed on. In the middle of the river the crocodile began to dive. \"What are you doing?\" cried the monkey. \"My wife wants your heart,\" said the crocodile, \"so I am going to drown you.\"",
        hi: "मगरमच्छ बंदर के पास आया और मीठे स्वर में बोला, \"उस पार ढेर सारे आम और कटहल हैं। मेरी पीठ पर बैठ जाओ, मैं तुम्हें वहाँ ले चलूँगा।\" बंदर उसकी पीठ पर बैठ गया। बीच नदी में पहुँचकर मगरमच्छ डुबकी लगाने लगा। बंदर ने पुकारा, \"यह क्या कर रहे हो?\" मगरमच्छ बोला, \"मेरी पत्नी को तुम्हारा हृदय चाहिए, इसलिए मैं तुम्हें डुबाने जा रहा हूँ।\"",
      },
      {
        en: "The monkey did not panic. \"Friend, why didn't you tell me before?\" he said. \"Monkeys don't keep their hearts inside them when they jump about in the trees, or they would be torn to pieces. We hang them up on that fig tree over there.\" And he pointed to a fig tree on the bank, heavy with ripe figs.",
        hi: "बंदर घबराया नहीं। उसने कहा, \"मित्र, यह बात पहले क्यों नहीं बताई? पेड़ों पर उछल-कूद करते समय हम बंदर अपना हृदय अपने भीतर नहीं रखते, नहीं तो वह टुकड़े-टुकड़े हो जाए। हम उसे उस गूलर के पेड़ पर टाँग देते हैं।\" और उसने किनारे पर पके फलों से लदे एक गूलर के पेड़ की ओर इशारा किया।",
      },
      {
        en: "The foolish crocodile swam back to the bank. The monkey sprang into the tree and called down, \"Crocodile, you are big in body but small in wisdom. There is no heart hanging in any tree. You tried to deceive me, but you have lost the game.\"",
        hi: "मूर्ख मगरमच्छ वापस किनारे की ओर तैर आया। बंदर उछलकर पेड़ पर चढ़ गया और नीचे पुकारा, \"मगरमच्छ, तुम्हारा शरीर तो बड़ा है, पर बुद्धि छोटी। किसी पेड़ पर कोई हृदय नहीं टँगा होता। तुमने मुझे धोखा देना चाहा, पर बाज़ी तुम हार गए।\"",
      },
    ],
    lesson: {
      en: "A calm mind sees a way out where fear sees none; wisdom matters more than size or strength.",
      hi: "शांत मन वहाँ भी रास्ता देख लेता है जहाँ भय को कुछ नहीं सूझता; बुद्धि आकार या बल से बढ़कर है।",
    },
    minutes: 2,
    source: SOURCE(208),
    review: REVIEW,
  },
  {
    slug: "kacchapa-jataka",
    number: 215,
    title: { pi: "Kacchapa Jātaka", en: "The Talkative Tortoise", hi: "बातूनी कछुआ" },
    theme: { en: "Mindful speech", hi: "वाणी पर संयम" },
    summary: {
      en: "A tortoise carried through the sky by two geese cannot keep his mouth shut.",
      hi: "दो हंसों द्वारा आकाश में ले जाया जा रहा एक कछुआ अपना मुँह बंद नहीं रख पाता।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was a wise minister to the king of Bārāṇasī. The king was very fond of talking; once he began, no one else could say a word. The minister wished to help him, and waited for the right moment.",
        hi: "बहुत समय पहले बोधिसत्त वाराणसी के राजा के एक बुद्धिमान मंत्री थे। राजा को बोलने का बहुत शौक था; एक बार बोलना शुरू करते, तो किसी और को एक शब्द कहने का अवसर न मिलता। मंत्री उनकी सहायता करना चाहते थे, और सही अवसर की प्रतीक्षा कर रहे थे।",
      },
      {
        en: "In a lake in the Himalayas lived a tortoise who made friends with two young geese. They invited him to their beautiful home in a golden cave. \"But how will I get there?\" asked the tortoise. \"Hold this stick tightly in your mouth,\" they said, \"and we will each take one end and carry you. Only, do not say a word on the way.\"",
        hi: "हिमालय की एक झील में एक कछुआ रहता था, जिसकी दो युवा हंसों से मित्रता हो गई। उन्होंने उसे स्वर्ण गुफा में अपने सुंदर घर चलने का निमंत्रण दिया। कछुए ने पूछा, \"पर मैं वहाँ पहुँचूँगा कैसे?\" हंसों ने कहा, \"यह डंडी अपने मुँह से कसकर पकड़ लो, हम दोनों एक-एक सिरा पकड़कर तुम्हें ले चलेंगे। बस, रास्ते में एक शब्द भी मत बोलना।\"",
      },
      {
        en: "So they flew up, carrying the tortoise between them. As they passed over Bārāṇasī, some children saw them and shouted, \"Look! Two geese carrying a tortoise on a stick!\" The tortoise wanted to answer, \"If my friends carry me, what is that to you?\" He opened his mouth, let go of the stick, and fell into the palace courtyard.",
        hi: "हंस कछुए को बीच में लेकर उड़ चले। जब वे वाराणसी के ऊपर से गुज़रे, तो कुछ बच्चों ने उन्हें देखा और चिल्लाए, \"देखो! दो हंस डंडी पर एक कछुए को ले जा रहे हैं!\" कछुआ जवाब देना चाहता था, \"मेरे मित्र मुझे ले जा रहे हैं, तो तुम्हें क्या?\" उसने मुँह खोला, डंडी छूट गई, और वह राजमहल के आँगन में आ गिरा।",
      },
      {
        en: "The king asked his minister what had happened. The minister explained, and said gently, \"Your Majesty, those who cannot hold back their words come to grief. Speak what is fitting, at the right time, and in measure.\" The king understood that the words were meant for him, and from then on he spoke less and listened more.",
        hi: "राजा ने मंत्री से पूछा कि यह क्या हुआ। मंत्री ने सब बताया और नम्रता से कहा, \"महाराज, जो अपनी वाणी पर संयम नहीं रख पाते, वे दुख पाते हैं। उचित बात, उचित समय पर और सीमित मात्रा में कहनी चाहिए।\" राजा समझ गए कि ये बातें उन्हीं के लिए थीं, और उस दिन से वे कम बोलने और अधिक सुनने लगे।",
      },
    ],
    lesson: {
      en: "Right speech includes knowing when to stay silent; a moment's restraint can save a great deal of harm.",
      hi: "सम्यक वाणी में यह जानना भी शामिल है कि कब चुप रहना है; क्षण भर का संयम बहुत बड़ी हानि से बचा सकता है।",
    },
    minutes: 2,
    source: SOURCE(215),
    review: REVIEW,
  },
  {
    slug: "tittira-jataka",
    number: 37,
    title: { pi: "Tittira Jātaka", en: "The Partridge, the Monkey and the Elephant", hi: "तीतर, बंदर और हाथी" },
    theme: { en: "Respect for elders", hi: "बड़ों का सम्मान" },
    summary: {
      en: "Three friends decide to honour the eldest among them, and learn who that is from a banyan tree.",
      hi: "तीन मित्र अपने में सबसे बड़े का सम्मान करने का निर्णय लेते हैं, और एक बरगद के पेड़ से जानते हैं कि वह कौन है।",
    },
    paragraphs: [
      {
        en: "The Buddha told this story when his chief disciple Sāriputta, arriving late at a new monastery, found no place left to sleep and spent the night under a tree. The Buddha taught that lodging and respect should go first to those who have been longest in the Saṅgha, and told of three friends long ago.",
        hi: "भगवान बुद्ध ने यह कथा तब सुनाई जब उनके प्रमुख शिष्य सारिपुत्त एक नए विहार में देर से पहुँचे, उन्हें सोने का कोई स्थान न मिला और उन्होंने रात एक पेड़ के नीचे बिताई। भगवान ने सिखाया कि आवास और सम्मान पहले उन्हें मिलना चाहिए जो संघ में सबसे लंबे समय से हैं, और बहुत पहले के तीन मित्रों की कथा सुनाई।",
      },
      {
        en: "A partridge, a monkey and an elephant lived near a great banyan tree. They did not treat one another with much respect, and one day they said, \"Let us find out who is the eldest, and honour him.\" The elephant said, \"When I was young, this banyan was a small bush. I walked over it, and its top just touched my belly.\" The monkey said, \"When I was young, I sat on the ground and nibbled its topmost shoots.\"",
        hi: "एक तीतर, एक बंदर और एक हाथी एक विशाल बरगद के पेड़ के पास रहते थे। वे एक-दूसरे का ज़्यादा सम्मान नहीं करते थे, और एक दिन उन्होंने कहा, \"चलो पता करें कि हममें सबसे बड़ा कौन है, और उसका सम्मान करें।\" हाथी बोला, \"जब मैं छोटा था, तब यह बरगद एक छोटी-सी झाड़ी था। मैं उसके ऊपर से चलता था, और उसकी चोटी बस मेरे पेट को छूती थी।\" बंदर बोला, \"जब मैं छोटा था, तब ज़मीन पर बैठे-बैठे ही इसकी सबसे ऊपर की कोंपलें खा लेता था।\"",
      },
      {
        en: "Then the partridge said, \"Long ago there was a great banyan tree in another place. I ate one of its fruits and dropped the seed here, and from that seed this very tree grew. So I am older than this tree.\" The monkey and the elephant agreed that the partridge was the eldest.",
        hi: "तब तीतर बोला, \"बहुत पहले किसी दूसरी जगह एक विशाल बरगद था। मैंने उसका एक फल खाया और उसका बीज यहाँ गिरा दिया, और उसी बीज से यह पेड़ उगा। इसलिए मैं इस पेड़ से भी बड़ा हूँ।\" बंदर और हाथी ने मान लिया कि तीतर ही सबसे बड़ा है।",
      },
      {
        en: "From then on they honoured the partridge and listened to his advice. He taught them to keep the five precepts, and the three friends lived together in harmony and goodwill. The Buddha said that he himself had been the partridge in that life.",
        hi: "उस दिन से वे तीतर का सम्मान करने लगे और उसकी सलाह मानने लगे। उसने उन्हें पंचशील का पालन करना सिखाया, और तीनों मित्र मेल-जोल और सद्भाव से साथ रहने लगे। भगवान ने बताया कि उस जन्म में वे स्वयं तीतर थे।",
      },
    ],
    lesson: {
      en: "Respect for those who came before us, and for experience, keeps a community in harmony.",
      hi: "जो हमसे पहले आए, उनका और अनुभव का सम्मान समुदाय में मेल-जोल बनाए रखता है।",
    },
    minutes: 2,
    source: SOURCE(37),
    review: REVIEW,
  },
  {
    slug: "sammodamana-jataka",
    number: 33,
    title: { pi: "Sammodamāna Jātaka", en: "The Quails and the Net", hi: "बटेरें और जाल" },
    theme: { en: "Unity", hi: "एकता" },
    summary: {
      en: "Working together, a flock of quails lifts a hunter's net, until they start to quarrel.",
      hi: "मिलकर काम करते हुए बटेरों का एक झुंड शिकारी का जाल उठा ले जाता है, जब तक वे आपस में झगड़ने नहीं लगतीं।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as a quail and led a flock of many thousands of quails in a forest. A fowler used to imitate the quails' call, and when they gathered he threw his net over them and carried them off to sell.",
        hi: "बहुत समय पहले बोधिसत्त एक बटेर के रूप में जन्मे और एक वन में कई हज़ार बटेरों के झुंड के नायक बने। एक बहेलिया बटेरों जैसी आवाज़ निकालता, और जब वे इकट्ठी हो जातीं तो उन पर जाल फेंककर उन्हें बेचने ले जाता।",
      },
      {
        en: "The leader said to the flock, \"When the net falls on us, let each of you put your head through a mesh, and all together fly up with it. We can drop it on a thorn bush and slip out from underneath.\" The next time the net fell, they did just that. Day after day the fowler went home with nothing but a torn net, and his wife scolded him.",
        hi: "नायक ने झुंड से कहा, \"जब जाल हम पर गिरे, तो हर कोई अपना सिर जाल के एक छेद में डाले, और सब एक साथ उसे लेकर उड़ें। हम उसे किसी काँटेदार झाड़ी पर गिरा देंगे और नीचे से निकल जाएँगे।\" अगली बार जब जाल गिरा, तो उन्होंने ठीक ऐसा ही किया। दिन-ब-दिन बहेलिया केवल फटा जाल लेकर घर लौटता, और उसकी पत्नी उसे डाँटती।",
      },
      {
        en: "\"Be patient,\" said the fowler. \"One day they will quarrel, and then I will catch them.\" Not long after, while feeding, one quail stepped on another's head by mistake. \"Who trod on my head?\" \"I didn't mean to; don't be angry!\" The quarrel grew: \"You are so strong, you lift the net by yourself!\"",
        hi: "बहेलिए ने कहा, \"धैर्य रखो। एक दिन वे झगड़ेंगी, तब मैं उन्हें पकड़ लूँगा।\" कुछ ही समय बाद, दाना चुगते हुए एक बटेर का पैर भूल से दूसरी के सिर पर पड़ गया। \"किसने मेरे सिर पर पैर रखा?\" \"मैंने जानबूझकर नहीं किया, नाराज़ मत हो!\" झगड़ा बढ़ता गया: \"तुम बड़ी बलवान हो न, तो अकेले ही जाल उठा लेना!\"",
      },
      {
        en: "The leader saw where this would end. \"Where there is quarrelling, there is danger,\" he said, and left with those who would listen. Soon the fowler came and threw his net. The quails that stayed behind were still arguing about who should lift it, and he caught them all.",
        hi: "नायक समझ गए कि इसका अंत कहाँ होगा। उन्होंने कहा, \"जहाँ झगड़ा है, वहाँ संकट है,\" और जो उनकी बात मानती थीं, उन्हें लेकर चले गए। जल्दी ही बहेलिया आया और उसने जाल फेंका। जो बटेरें पीछे रह गई थीं, वे अब भी इसी पर बहस कर रही थीं कि जाल कौन उठाए, और वह उन सबको पकड़ ले गया।",
      },
    ],
    lesson: {
      en: "Together we can lift what none can lift alone; quarrelling breaks that strength.",
      hi: "मिलकर हम वह उठा सकते हैं जो कोई अकेले नहीं उठा सकता; झगड़ा उस शक्ति को तोड़ देता है।",
    },
    minutes: 2,
    source: SOURCE(33),
    review: REVIEW,
  },
  {
    slug: "baka-jataka",
    number: 38,
    title: { pi: "Baka Jātaka", en: "The Crane and the Crab", hi: "बगुला और केकड़ा" },
    theme: { en: "Honesty", hi: "ईमानदारी" },
    summary: {
      en: "A cunning crane deceives the fish of a drying pond, until he meets a crab.",
      hi: "एक चालाक बगुला सूखते तालाब की मछलियों को धोखा देता है, जब तक उसका सामना एक केकड़े से नहीं होता।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as the spirit of a tree beside a lotus pond. Nearby was a small pond that was drying up in the hot season, and in it lived many fish.",
        hi: "बहुत समय पहले बोधिसत्त कमल के एक तालाब के किनारे खड़े पेड़ के वृक्ष-देवता के रूप में जन्मे। पास ही एक छोटा तालाब था, जो गर्मी के मौसम में सूख रहा था, और उसमें बहुत-सी मछलियाँ रहती थीं।",
      },
      {
        en: "A crane came and stood at the edge, looking thoughtful. \"What are you thinking about?\" asked the fish. \"About you,\" said the crane. \"This pond is drying up. I know a big lake full of lotuses. If you like, I will carry you there one by one.\" The fish trusted him. But each time, the crane carried a fish to a tree out of sight, ate it, and came back for another.",
        hi: "एक बगुला आया और विचारमग्न-सा किनारे खड़ा हो गया। मछलियों ने पूछा, \"क्या सोच रहे हो?\" बगुले ने कहा, \"तुम्हारे बारे में। यह तालाब सूख रहा है। मैं कमलों से भरी एक बड़ी झील जानता हूँ। तुम चाहो तो मैं एक-एक करके तुम्हें वहाँ पहुँचा दूँ।\" मछलियों ने उस पर भरोसा कर लिया। पर हर बार बगुला एक मछली को आँखों से ओझल एक पेड़ पर ले जाता, उसे खा जाता, और अगली के लिए लौट आता।",
      },
      {
        en: "When all the fish were gone, only a crab was left. The crane offered to carry him too. The crab said, \"Let me hold on to your neck with my claws,\" and the crane agreed. When they reached the tree and the crab saw the heap of fish bones beneath it, he understood everything. He tightened his claws and said, \"Take me back to the water at once.\"",
        hi: "जब सारी मछलियाँ ख़त्म हो गईं, तो केवल एक केकड़ा बचा। बगुले ने उसे भी ले चलने की पेशकश की। केकड़े ने कहा, \"मुझे अपने पंजों से तुम्हारी गर्दन पकड़ने दो,\" और बगुला मान गया। जब वे उस पेड़ के पास पहुँचे और केकड़े ने नीचे मछलियों की हड्डियों का ढेर देखा, तो वह सब समझ गया। उसने अपने पंजे कस लिए और कहा, \"मुझे तुरंत पानी में वापस ले चलो।\"",
      },
      {
        en: "Frightened, the crane carried him back to the pond. But the crab did not let go, and the crane who had deceived so many lost his life. The tree spirit, who had seen it all, said: \"Cunning may succeed for a while, but the deceiver does not prosper for ever; in the end he meets what he has done.\"",
        hi: "डरकर बगुला उसे तालाब तक वापस ले आया। पर केकड़े ने उसकी गर्दन नहीं छोड़ी, और जिस बगुले ने इतनों को धोखा दिया था, उसके प्राण चले गए। यह सब देख रहे वृक्ष-देवता ने कहा, \"चालाकी कुछ समय तक सफल हो सकती है, पर धोखेबाज़ सदा नहीं फलता; अंत में उसे अपने ही किए का फल मिलता है।\"",
      },
    ],
    lesson: {
      en: "Deceit may seem clever, but our own actions return to us; honesty is the safer path.",
      hi: "छल चतुराई जैसा लग सकता है, पर हमारे कर्म लौटकर हमारे ही पास आते हैं; ईमानदारी ही सुरक्षित मार्ग है।",
    },
    minutes: 2,
    source: SOURCE(38),
    review: REVIEW,
  },
  {
    slug: "mahasuka-jataka",
    number: 429,
    title: { pi: "Mahāsuka Jātaka", en: "The Grateful Parrot", hi: "कृतज्ञ तोता" },
    theme: { en: "Gratitude", hi: "कृतज्ञता" },
    summary: {
      en: "A parrot refuses to leave the fig tree that fed him, even after it withers.",
      hi: "एक तोता उस गूलर के पेड़ को छोड़ने से इनकार कर देता है जिसने उसे पाला, सूख जाने के बाद भी।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as a parrot king who lived in a great fig tree by the Ganges in the Himalayas. For many years the tree gave him fruit and shelter, and he was content with it.",
        hi: "बहुत समय पहले बोधिसत्त एक तोतों के राजा के रूप में जन्मे, जो हिमालय में गंगा के किनारे एक विशाल गूलर के पेड़ पर रहते थे। बरसों तक उस पेड़ ने उन्हें फल और आश्रय दिया, और वे उसी में संतुष्ट थे।",
      },
      {
        en: "Then the tree began to wither. Its fruit was gone, and its leaves fell. The other birds flew away to greener trees, but the parrot stayed, living on whatever little the tree still had, its shoots and bark, and drinking from the river.",
        hi: "फिर वह पेड़ सूखने लगा। उसके फल ख़त्म हो गए और पत्ते झड़ गए। दूसरे पक्षी हरे-भरे पेड़ों की ओर उड़ गए, पर तोता वहीं रहा, पेड़ पर जो थोड़ा-बहुत बचा था, उसकी कोंपलें और छाल, उसी पर गुज़ारा करता, और नदी का पानी पीता।",
      },
      {
        en: "Sakka, king of the gods, wished to test him and came in disguise. \"When a tree is green and full of fruit, birds gather to it,\" he said. \"This tree is dead. Why do you not leave it, as the others have?\" The parrot replied, \"This tree fed me when it could. A friend does not abandon a friend in hard times. I will stay with it for as long as I live.\"",
        hi: "देवराज सक्क उसकी परीक्षा लेना चाहते थे और भेस बदलकर आए। उन्होंने कहा, \"जब पेड़ हरा और फलों से लदा होता है, तब पक्षी उस पर आते हैं। यह पेड़ तो सूख चुका है। तुम दूसरों की तरह इसे छोड़ क्यों नहीं देते?\" तोते ने उत्तर दिया, \"जब तक यह पेड़ दे सकता था, इसने मुझे पाला। मित्र कठिन समय में मित्र का साथ नहीं छोड़ता। जब तक जीवित हूँ, मैं इसी के साथ रहूँगा।\"",
      },
      {
        en: "Sakka was delighted, revealed himself and offered the parrot a wish. \"Let this tree bear fruit again,\" said the parrot. Sakka sprinkled water from the Ganges over it, and at once the tree grew green, its branches filled with sweet fruit, and the parrot lived there happily.",
        hi: "सक्क अत्यंत प्रसन्न हुए, अपना असली रूप प्रकट किया और तोते से वर माँगने को कहा। तोते ने कहा, \"यह पेड़ फिर से फल दे।\" सक्क ने उस पर गंगा का जल छिड़का, और तुरंत ही पेड़ हरा-भरा हो गया, उसकी डालें मीठे फलों से भर गईं, और तोता वहाँ सुख से रहने लगा।",
      },
    ],
    lesson: {
      en: "Gratitude remembers kindness received and stays loyal in hard times, not only in good ones.",
      hi: "कृतज्ञता मिली हुई भलाई को याद रखती है, और केवल अच्छे समय में नहीं, कठिन समय में भी साथ निभाती है।",
    },
    minutes: 2,
    source: SOURCE(429),
    review: REVIEW,
  },
  {
    slug: "ruru-jataka",
    number: 482,
    title: { pi: "Ruru Jātaka", en: "The Golden Deer", hi: "स्वर्ण मृग" },
    theme: { en: "Kindness and truth", hi: "दया और सत्य" },
    summary: {
      en: "A golden deer saves a drowning man, who then betrays him to the king.",
      hi: "एक स्वर्ण मृग डूबते हुए व्यक्ति को बचाता है, जो बाद में राजा के सामने उसके साथ विश्वासघात करता है।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as a golden deer called Ruru, who lived alone in a forest by the Ganges. One day he heard a man crying for help in the river. The man was a merchant's son who had wasted his wealth, and in despair had thrown himself into the water. The deer swam out, carried him to the shore on his back, and cared for him.",
        hi: "बहुत समय पहले बोधिसत्त रुरु नाम के एक स्वर्ण मृग के रूप में जन्मे, जो गंगा के किनारे एक वन में अकेले रहते थे। एक दिन उन्होंने नदी में किसी व्यक्ति को सहायता के लिए पुकारते सुना। वह एक व्यापारी का बेटा था, जिसने अपना धन उड़ा दिया था और निराश होकर पानी में कूद गया था। मृग तैरकर उसके पास गए, उसे अपनी पीठ पर बिठाकर किनारे ले आए और उसकी देखभाल की।",
      },
      {
        en: "When the man was well, the deer asked only one thing: \"Do not tell anyone that a golden deer lives here.\" The man promised. But soon after, the queen dreamed of a golden deer teaching the Dhamma, and the king offered a rich reward to anyone who could find one. The man forgot his promise and led the king to the forest.",
        hi: "जब वह व्यक्ति स्वस्थ हो गया, तो मृग ने केवल एक बात माँगी: \"किसी को मत बताना कि यहाँ एक स्वर्ण मृग रहता है।\" उसने वचन दिया। पर कुछ ही समय बाद रानी ने सपने में एक स्वर्ण मृग को धम्म का उपदेश देते देखा, और राजा ने ऐसा मृग ढूँढ़ने वाले को भारी इनाम देने की घोषणा की। वह व्यक्ति अपना वचन भूल गया और राजा को वन तक ले आया।",
      },
      {
        en: "As the king raised his bow, the deer spoke in a human voice: \"Who showed you where I live?\" The king pointed to the man. The deer said, \"It is better to pull a log out of the river than to save an ungrateful man.\" Hearing the whole story, the king was angry and wanted to shoot the man.",
        hi: "जैसे ही राजा ने धनुष उठाया, मृग मनुष्य की वाणी में बोले, \"मेरा निवास आपको किसने बताया?\" राजा ने उस व्यक्ति की ओर इशारा किया। मृग ने कहा, \"नदी से लकड़ी का लट्ठा निकाल लेना एक कृतघ्न मनुष्य को बचाने से बेहतर है।\" पूरी कथा सुनकर राजा क्रोधित हुए और उस व्यक्ति को बाण मारना चाहा।",
      },
      {
        en: "But the deer asked the king to spare him. \"Do not harm him,\" he said. \"Let him go.\" The king was moved by such kindness towards one who had betrayed him. He let the man go, and at the deer's request granted protection to all creatures in his kingdom. The golden deer taught the king and queen the Dhamma, and returned to the forest.",
        hi: "पर मृग ने राजा से उसे छोड़ देने की विनती की। उन्होंने कहा, \"इसे हानि मत पहुँचाइए, इसे जाने दीजिए।\" अपने साथ विश्वासघात करने वाले के प्रति भी ऐसी दया देखकर राजा का हृदय भर आया। उन्होंने उस व्यक्ति को जाने दिया, और मृग के कहने पर अपने राज्य के सब जीवों को अभय दिया। स्वर्ण मृग ने राजा और रानी को धम्म का उपदेश दिया और वन लौट गए।",
      },
    ],
    lesson: {
      en: "Keep your word, and answer even betrayal with kindness; compassion that asks nothing in return can change hearts.",
      hi: "अपना वचन निभाइए, और विश्वासघात का उत्तर भी दया से दीजिए; जो करुणा बदले में कुछ नहीं माँगती, वह हृदय बदल सकती है।",
    },
    minutes: 3,
    source: SOURCE(482),
    review: REVIEW,
  },
  {
    slug: "apannaka-jataka",
    number: 1,
    title: { pi: "Apaṇṇaka Jātaka", en: "The Two Caravans", hi: "दो कारवाँ" },
    theme: { en: "Wisdom", hi: "प्रज्ञा" },
    summary: {
      en: "Two merchants cross the same desert. One believes a stranger's tale and throws away his water; the other holds to what he can see for himself.",
      hi: "दो व्यापारी एक ही मरुस्थल पार करते हैं। एक अजनबी की बात मानकर अपना पानी फेंक देता है; दूसरा उसी पर टिका रहता है जो वह स्वयं देख सकता है।",
    },
    paragraphs: [
      {
        en: "Long ago in Benares, the Bodhisatta was a merchant who travelled with five hundred carts. Another merchant, young and foolish, was about to set out on the same road across a great desert, and he hurried to go first, so that he would have the best grass, the freshest water and the best prices.",
        hi: "बहुत समय पहले वाराणसी में बोधिसत्त एक व्यापारी थे, जो पाँच सौ गाड़ियों के साथ यात्रा करते थे। एक दूसरा व्यापारी, जो युवा और नासमझ था, उसी रास्ते से एक बड़ा मरुस्थल पार करने वाला था। वह जल्दी से पहले निकल पड़ा, ताकि सबसे अच्छी घास, सबसे ताज़ा पानी और सबसे अच्छे दाम उसे ही मिलें।",
      },
      {
        en: "In the middle of the desert a stranger met him in a fine carriage, with wet lotus flowers in his hair and mud on his wheels. \"Why carry all that water?\" said the stranger. \"Just ahead it is raining, and the pools are full. Throw it away and travel light.\" The young merchant believed him and emptied every jar. But no rain came, the stranger was a demon of the desert, and that caravan never came home.",
        hi: "मरुस्थल के बीच एक अजनबी एक सुंदर रथ में उससे मिला; उसके बालों में भीगे कमल थे और पहियों पर कीचड़ लगा था। अजनबी बोला, \"इतना पानी क्यों ढो रहे हो? आगे वर्षा हो रही है और तालाब भरे हैं। इसे फेंक दो और हल्के होकर चलो।\" युवा व्यापारी ने उसकी बात मान ली और सारे घड़े खाली कर दिए। पर वर्षा नहीं आई; वह अजनबी मरुस्थल का एक यक्ष था, और वह कारवाँ फिर कभी घर नहीं लौटा।",
      },
      {
        en: "Later the Bodhisatta crossed the same desert, and the same stranger came with the same story. The Bodhisatta looked around: no cool wind, no clouds, no smell of rain. \"Not one drop of water will be thrown away,\" he told his men, \"until we reach water we can see.\" They went on carefully, reached the far side safely, and sold their goods well.",
        hi: "बाद में बोधिसत्त उसी मरुस्थल से गुज़रे, और वही अजनबी वही कहानी लेकर आया। बोधिसत्त ने चारों ओर देखा: न ठंडी हवा थी, न बादल, न वर्षा की गंध। उन्होंने अपने लोगों से कहा, \"जब तक हम ऐसा पानी न देख लें जो आँखों के सामने हो, तब तक पानी की एक बूँद भी नहीं फेंकी जाएगी।\" वे सावधानी से आगे बढ़े, सुरक्षित उस पार पहुँचे, और अपना माल अच्छे दामों पर बेचा।",
      },
    ],
    lesson: {
      en: "Do not throw away what is sure for a pleasant promise. Look and test for yourself, and hold to what is certain.",
      hi: "किसी मीठे वादे के लिए जो निश्चित है उसे मत छोड़िए। स्वयं देखिए और परखिए, और उसी पर टिके रहिए जो पक्का है।",
    },
    minutes: 2,
    source: SOURCE(1),
    review: REVIEW,
  },
  {
    slug: "seriva-jataka",
    number: 3,
    title: { pi: "Serivāṇija Jātaka", en: "The Golden Bowl", hi: "सोने का कटोरा" },
    theme: { en: "Honesty", hi: "ईमानदारी" },
    summary: {
      en: "Two pedlars are shown the same old bowl. One tries to cheat a poor family out of it; the other tells them it is gold.",
      hi: "दो फेरीवालों को एक ही पुराना कटोरा दिखाया जाता है। एक गरीब परिवार को ठगना चाहता है; दूसरा उन्हें बता देता है कि वह सोने का है।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was a pedlar of pots and pans in the kingdom of Seri. He travelled with another pedlar who was greedy. In one town lived a poor old woman and her granddaughter. Their family had once been rich, and all that was left was an old bowl, so black with dirt that no one knew it was made of gold.",
        hi: "बहुत समय पहले बोधिसत्त सेरि राज्य में बर्तन बेचने वाले एक फेरीवाले थे। उनके साथ एक दूसरा फेरीवाला चलता था, जो लालची था। एक नगर में एक गरीब बूढ़ी स्त्री अपनी पोती के साथ रहती थी। उनका परिवार कभी धनी था, और अब बस एक पुराना कटोरा बचा था, जो मैल से इतना काला था कि कोई नहीं जानता था कि वह सोने का है।",
      },
      {
        en: "The girl longed for a bangle, so they offered the bowl to the greedy pedlar. He scratched it with a needle and saw the gold, but he wanted it for nothing. \"This is worthless,\" he said, threw it on the floor and walked off, planning to come back later and take it for a few coins.",
        hi: "लड़की को एक कंगन चाहिए था, इसलिए उन्होंने वह कटोरा लालची फेरीवाले को दिखाया। उसने सुई से उसे खुरचा और सोना देख लिया, पर वह उसे मुफ़्त में लेना चाहता था। उसने कहा, \"यह किसी काम का नहीं,\" उसे ज़मीन पर फेंका और चला गया, यह सोचकर कि बाद में लौटकर कुछ सिक्कों में ले लेगा।",
      },
      {
        en: "Then the Bodhisatta came by, and they showed him the bowl too. \"Mother, this is gold, worth far more than everything I own,\" he said. \"Take all my money and all my goods for it.\" He kept only eight coins for the ferry and left.",
        hi: "फिर बोधिसत्त वहाँ आए, और उन्होंने उन्हें भी कटोरा दिखाया। उन्होंने कहा, \"माँ, यह सोना है, और इसका मूल्य मेरी हर चीज़ से कहीं अधिक है। इसके बदले मेरा सारा धन और सारा सामान ले लीजिए।\" उन्होंने नाव के किराए के लिए केवल आठ सिक्के रखे और चल दिए।",
      },
      {
        en: "When the greedy pedlar returned, the old woman told him, \"An honest man has paid us well for the bowl you called worthless.\" He ran to the river, but the Bodhisatta's boat was already far across the water. He was left on the bank with nothing, and his heart broke with rage and grief.",
        hi: "जब लालची फेरीवाला लौटा, तो बूढ़ी स्त्री ने कहा, \"जिस कटोरे को तुमने बेकार कहा था, उसका एक ईमानदार व्यक्ति ने हमें अच्छा मूल्य दिया है।\" वह भागकर नदी तक गया, पर बोधिसत्त की नाव पानी में बहुत दूर जा चुकी थी। वह खाली हाथ किनारे पर रह गया, और क्रोध और पछतावे से उसका हृदय टूट गया।",
      },
    ],
    lesson: {
      en: "Honesty brings a gain that cheating never can; greed in the end loses even what it reached for.",
      hi: "ईमानदारी से जो मिलता है, वह छल से कभी नहीं मिलता; लालच अंत में वह भी खो देता है जिसके लिए वह हाथ बढ़ाता है।",
    },
    minutes: 3,
    source: SOURCE(3),
    review: REVIEW,
  },
  {
    slug: "cullakasetthi-jataka",
    number: 4,
    title: { pi: "Cullakaseṭṭhi Jātaka", en: "The Merchant of the Mouse", hi: "चूहे से व्यापारी" },
    theme: { en: "Effort", hi: "वीर्य" },
    summary: {
      en: "A poor young man picks up a dead mouse, and with care and hard work turns it into a fortune.",
      hi: "एक गरीब युवक एक मरा हुआ चूहा उठाता है, और लगन और मेहनत से उसे एक बड़ी संपत्ति में बदल देता है।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was the king's treasurer in Benares, a man named Cullaka. One day, seeing a dead mouse in the road, he said, \"A sharp young man could start a business with that.\" A poor young man heard him, picked up the mouse, and sold it to a shopkeeper for his cat, for a single small coin.",
        hi: "बहुत समय पहले बोधिसत्त वाराणसी में राजा के कोषाध्यक्ष थे, जिनका नाम चुल्लक था। एक दिन सड़क पर एक मरा चूहा देखकर उन्होंने कहा, \"कोई समझदार युवक इससे भी व्यापार शुरू कर सकता है।\" एक गरीब युवक ने यह सुना, चूहा उठाया, और एक दुकानदार को उसकी बिल्ली के लिए एक छोटे सिक्के में बेच दिया।",
      },
      {
        en: "With the coin he bought molasses, and gave water and molasses to the tired flower-gatherers coming in from the woods; each gave him a handful of flowers, which he sold. After a storm he cleared the fallen branches from the king's garden and sold the wood to a potter. He gave water to five hundred grass-cutters, and when a horse-dealer came to town, they gave him their grass, which he sold for a thousand coins.",
        hi: "उस सिक्के से उसने गुड़ खरीदा, और जंगल से लौटते थके फूल चुनने वालों को पानी और गुड़ दिया; हर एक ने उसे मुट्ठी भर फूल दिए, जिन्हें उसने बेच दिया। एक आँधी के बाद उसने राजा के बाग से गिरी टहनियाँ साफ़ कीं और लकड़ी एक कुम्हार को बेच दी। उसने पाँच सौ घास काटने वालों को पानी पिलाया, और जब एक घोड़ों का व्यापारी नगर आया, तो उन्होंने उसे अपनी घास दे दी, जिसे उसने एक हज़ार सिक्कों में बेचा।",
      },
      {
        en: "Soon he heard that a ship was coming into port, bought its whole cargo with a ring as his promise, and sold it to the city's merchants at a good profit. Within a few months the young man who had started with a dead mouse had two hundred thousand coins.",
        hi: "जल्द ही उसने सुना कि बंदरगाह पर एक जहाज़ आ रहा है। उसने एक अंगूठी को वचन के रूप में देकर उसका सारा माल खरीद लिया, और नगर के व्यापारियों को अच्छे लाभ पर बेच दिया। कुछ ही महीनों में वह युवक, जिसने एक मरे चूहे से शुरुआत की थी, दो लाख सिक्कों का मालिक बन गया।",
      },
      {
        en: "He did not forget where it began. He went to Cullaka with a gift of a hundred thousand coins and told him the whole story. The treasurer was so pleased with his gratitude and hard work that he gave him his daughter in marriage, and in time the young man became the city's treasurer himself.",
        hi: "वह यह नहीं भूला कि शुरुआत कहाँ से हुई थी। वह एक लाख सिक्कों का उपहार लेकर चुल्लक के पास गया और पूरी कहानी सुनाई। कोषाध्यक्ष उसकी कृतज्ञता और मेहनत से इतने प्रसन्न हुए कि उन्होंने अपनी बेटी का विवाह उससे कर दिया, और समय आने पर वह युवक स्वयं नगर का कोषाध्यक्ष बना।",
      },
    ],
    lesson: {
      en: "Begin with what is in front of you, however small. Steady effort and good sense can grow it, and gratitude keeps it good.",
      hi: "जो सामने है, उसी से शुरुआत कीजिए, चाहे वह कितना भी छोटा हो। लगातार मेहनत और समझदारी उसे बढ़ा सकती है, और कृतज्ञता उसे अच्छा बनाए रखती है।",
    },
    minutes: 3,
    source: SOURCE(4),
    review: REVIEW,
  },
  {
    slug: "mahilamukha-jataka",
    number: 26,
    title: { pi: "Mahilāmukha Jātaka", en: "The Gentle Elephant", hi: "सौम्य हाथी" },
    theme: { en: "Good company", hi: "सत्संग" },
    summary: {
      en: "The king's gentle elephant turns fierce after listening to robbers talk each night, and gentle again after listening to wise men.",
      hi: "राजा का सौम्य हाथी हर रात चोरों की बातें सुनकर उग्र हो जाता है, और ज्ञानियों की बातें सुनकर फिर से सौम्य हो जाता है।",
    },
    paragraphs: [
      {
        en: "Long ago, the king of Benares had a state elephant so gentle that he was called Mahilāmukha, \"the one with a kind face\". Then a band of robbers began to meet at night beside his stall. They talked of breaking into houses and of beating anyone who stood in their way.",
        hi: "बहुत समय पहले वाराणसी के राजा के पास एक राजकीय हाथी था, जो इतना सौम्य था कि उसे महिलामुख, यानी \"कोमल मुख वाला\" कहा जाता था। फिर चोरों का एक दल रात में उसके बाड़े के पास मिलने लगा। वे घरों में सेंध लगाने और रास्ते में आने वाले हर व्यक्ति को मारने-पीटने की बातें करते थे।",
      },
      {
        en: "Night after night the elephant listened, and thought, \"They must be teaching me how to behave.\" He grew rough and angry, and one morning he struck down his own keeper. No one dared go near him.",
        hi: "रात-दर-रात हाथी यह सुनता रहा और सोचता रहा, \"ये मुझे सिखा रहे हैं कि कैसा व्यवहार करना चाहिए।\" वह कठोर और क्रोधी हो गया, और एक सुबह उसने अपने ही महावत को मार गिराया। फिर किसी की उसके पास जाने की हिम्मत नहीं हुई।",
      },
      {
        en: "The king sent his wise minister, the Bodhisatta, to find out why. He found the elephant was not sick, and on asking around he learned of the robbers' meetings. \"Let good and gentle people sit by his stall instead,\" he said, \"and talk of kindness and self-control.\"",
        hi: "राजा ने कारण जानने के लिए अपने बुद्धिमान मंत्री, बोधिसत्त, को भेजा। उन्होंने पाया कि हाथी बीमार नहीं है, और पूछताछ करने पर उन्हें चोरों की बैठकों का पता चला। उन्होंने कहा, \"अब उसके बाड़े के पास अच्छे और सौम्य लोगों को बिठाइए, जो दया और संयम की बातें करें।\"",
      },
      {
        en: "So it was done. Night after night the elephant heard words of patience and goodwill, and little by little he became as gentle as before. The king was delighted and honoured his minister.",
        hi: "ऐसा ही किया गया। रात-दर-रात हाथी धैर्य और सद्भाव की बातें सुनता रहा, और धीरे-धीरे पहले जैसा सौम्य हो गया। राजा बहुत प्रसन्न हुए और अपने मंत्री का सम्मान किया।",
      },
    ],
    lesson: {
      en: "We become like what we listen to every day. Choose your company and your words with care.",
      hi: "हम हर दिन जो सुनते हैं, वैसे ही बनते जाते हैं। अपनी संगति और अपने शब्द सोच-समझकर चुनिए।",
    },
    minutes: 2,
    source: SOURCE(26),
    review: REVIEW,
  },
  {
    slug: "nandivisala-jataka",
    number: 28,
    title: { pi: "Nandivisāla Jātaka", en: "The Bull Who Wanted Kind Words", hi: "मीठे बोल चाहने वाला बैल" },
    theme: { en: "Kind speech", hi: "मधुर वाणी" },
    summary: {
      en: "A mighty bull will not move a step when his master speaks harshly, but pulls a hundred carts when spoken to kindly.",
      hi: "एक बलवान बैल कठोर बोल सुनकर एक कदम नहीं हिलता, पर प्यार से कहने पर सौ गाड़ियाँ खींच लेता है।",
    },
    paragraphs: [
      {
        en: "Long ago in Gandhāra, the Bodhisatta was born as a calf. A brahmin raised him with great love, fed him rice and gruel, and named him Nandivisāla. When the bull grew strong, he thought, \"This man has cared for me so well. I will repay him.\"",
        hi: "बहुत समय पहले गांधार में बोधिसत्त एक बछड़े के रूप में जन्मे। एक ब्राह्मण ने बड़े प्रेम से उनका पालन किया, उन्हें चावल और दलिया खिलाया, और उनका नाम नंदिविसाल रखा। जब बैल बलवान हो गया, तो उसने सोचा, \"इस व्यक्ति ने मेरी इतनी अच्छी देखभाल की है। मैं इसका ऋण चुकाऊँगा।\"",
      },
      {
        en: "\"Go to the merchant in town,\" said the bull, \"and bet him a thousand coins that your bull can pull a hundred loaded carts.\" The brahmin did. But on the day, standing on the cart, he cracked the whip and shouted, \"Pull, you cheat! Move, you rascal!\" Hearing himself called a cheat, the bull stood still, and the brahmin lost the bet.",
        hi: "बैल ने कहा, \"नगर के सेठ के पास जाइए, और उससे एक हज़ार सिक्कों की शर्त लगाइए कि आपका बैल सौ लदी हुई गाड़ियाँ खींच सकता है।\" ब्राह्मण ने ऐसा ही किया। पर उस दिन गाड़ी पर खड़े होकर उसने चाबुक फटकारा और चिल्लाया, \"खींच, धोखेबाज़! चल, बदमाश!\" स्वयं को धोखेबाज़ कहा जाता सुनकर बैल अपनी जगह खड़ा रहा, और ब्राह्मण शर्त हार गया।",
      },
      {
        en: "At home the brahmin lay sad on his bed. \"Have I ever broken a pot or trampled anyone in all these years?\" asked the bull. \"Then why call me a cheat? The fault is yours, not mine. Bet two thousand this time, and speak to me kindly.\"",
        hi: "घर पर ब्राह्मण दुखी होकर लेटा रहा। बैल ने पूछा, \"क्या इतने वर्षों में मैंने कभी कोई बर्तन तोड़ा है या किसी को कुचला है? तो फिर मुझे धोखेबाज़ क्यों कहा? दोष आपका है, मेरा नहीं। इस बार दो हज़ार की शर्त लगाइए, और मुझसे प्यार से बात कीजिए।\"",
      },
      {
        en: "This time the brahmin stroked the bull's neck and said, \"Now then, my good Nandivisāla, pull them along.\" With one great heave the bull moved all hundred carts, and the brahmin won two thousand coins.",
        hi: "इस बार ब्राह्मण ने बैल की गर्दन सहलाई और कहा, \"चलो, मेरे प्यारे नंदिविसाल, इन्हें खींच ले चलो।\" एक ही ज़ोर में बैल ने सौ की सौ गाड़ियाँ खींच दीं, और ब्राह्मण दो हज़ार सिक्के जीत गया।",
      },
    ],
    lesson: {
      en: "Speak only kind words, never harsh ones. Kind speech moves what force and anger cannot.",
      hi: "सदा मीठे बोल बोलिए, कभी कठोर नहीं। मधुर वाणी वह कर दिखाती है जो बल और क्रोध नहीं कर पाते।",
    },
    minutes: 2,
    source: SOURCE(28),
    review: REVIEW,
  },
  {
    slug: "nacca-jataka",
    number: 32,
    title: { pi: "Nacca Jātaka", en: "The Dancing Peacock", hi: "नाचता मोर" },
    theme: { en: "Modesty", hi: "विनम्रता" },
    summary: {
      en: "The golden swan's daughter chooses the peacock for a husband, but he loses her by showing off.",
      hi: "स्वर्ण हंस की बेटी मोर को पति के रूप में चुनती है, पर दिखावे के कारण मोर उसे खो देता है।",
    },
    paragraphs: [
      {
        en: "In the first age of the world, the birds chose a golden swan as their king, and that swan was the Bodhisatta. He had a lovely daughter, and he let her choose her own husband. So all the birds of the Himālaya gathered on a great rock.",
        hi: "संसार के पहले युग में पक्षियों ने एक स्वर्ण हंस को अपना राजा चुना, और वह हंस बोधिसत्त थे। उनकी एक सुंदर बेटी थी, और उन्होंने उसे अपना पति स्वयं चुनने की अनुमति दी। इसलिए हिमालय के सारे पक्षी एक बड़ी चट्टान पर इकट्ठे हुए।",
      },
      {
        en: "The young swan looked over them all, and chose the peacock, with his neck like a jewel and his tail of many colours. \"She has chosen me!\" thought the peacock, \"Now they will see how fine I am.\" He spread his tail and danced in front of everyone, so wildly that he forgot all modesty and dignity.",
        hi: "युवा हंसिनी ने सबको देखा, और मोर को चुना, जिसकी गर्दन रत्न जैसी थी और पूँछ रंग-बिरंगी। मोर ने सोचा, \"उसने मुझे चुन लिया! अब सब देखेंगे कि मैं कितना सुंदर हूँ।\" उसने अपनी पूँछ फैलाई और सबके सामने नाचने लगा, इतनी उच्छृंखलता से कि वह सारी मर्यादा और गरिमा भूल गया।",
      },
      {
        en: "The swan king was ashamed. \"Your voice is sweet and your feathers are beautiful,\" he said, \"but you have no modesty. I will not give my daughter to one who has no shame.\" He gave her instead to a young swan, his nephew, and the peacock flew away, embarrassed.",
        hi: "हंसराज लज्जित हुए। उन्होंने कहा, \"तुम्हारी वाणी मधुर है और पंख सुंदर हैं, पर तुममें विनम्रता नहीं है। जिसमें लज्जा नहीं, उसे मैं अपनी बेटी नहीं दूँगा।\" उन्होंने उसका विवाह अपने भतीजे, एक युवा हंस, से कर दिया, और मोर शर्मिंदा होकर उड़ गया।",
      },
    ],
    lesson: {
      en: "Gifts and good looks are not enough; how we carry them matters more. Showing off can lose what good fortune brings.",
      hi: "गुण और सुंदरता ही पर्याप्त नहीं हैं; उन्हें हम कैसे सँभालते हैं, वह अधिक मायने रखता है। दिखावा सौभाग्य से मिली चीज़ भी खो सकता है।",
    },
    minutes: 2,
    source: SOURCE(32),
    review: REVIEW,
  },
  {
    slug: "vattaka-jataka",
    number: 35,
    title: { pi: "Vaṭṭaka Jātaka", en: "The Baby Quail and the Forest Fire", hi: "नन्हा बटेर और जंगल की आग" },
    theme: { en: "Truthfulness", hi: "सत्य" },
    summary: {
      en: "A baby quail too young to fly faces a forest fire with nothing but the power of truth.",
      hi: "उड़ने के लिए बहुत छोटा एक नन्हा बटेर केवल सत्य के बल से जंगल की आग का सामना करता है।",
    },
    paragraphs: [
      {
        en: "Long ago in Magadha, the Bodhisatta was born as a quail. While he was still tiny, with no feathers to fly and legs too weak to walk, his parents fed him in the nest, bringing food in their beaks.",
        hi: "बहुत समय पहले मगध में बोधिसत्त एक बटेर के रूप में जन्मे। जब वे अभी बहुत छोटे थे, उड़ने के लिए पंख नहीं थे और चलने के लिए पैर कमज़ोर थे, तब उनके माता-पिता घोंसले में अपनी चोंच से दाना लाकर उन्हें खिलाते थे।",
      },
      {
        en: "One summer a great fire swept through the forest. The birds flew off screaming; even his parents, afraid for their lives, flew away. The little quail was left alone in his nest as the flames came closer.",
        hi: "एक गर्मी में जंगल में भयानक आग लगी। पक्षी चीखते हुए उड़ गए; उसके माता-पिता भी, अपनी जान के डर से, उड़ गए। लपटें पास आती गईं और नन्हा बटेर अपने घोंसले में अकेला रह गया।",
      },
      {
        en: "He could not fly and he could not run. So he thought of the goodness of the Buddhas of the past and of the truth they taught, and said, \"I have wings that cannot fly, and feet that cannot walk, and my parents have left me. By this truth, fire, turn back!\"",
        hi: "वह न उड़ सकता था, न भाग सकता था। तब उसने पूर्व बुद्धों के गुणों और उनके सिखाए सत्य का स्मरण किया, और कहा, \"मेरे पंख हैं पर उड़ नहीं सकते, पैर हैं पर चल नहीं सकते, और मेरे माता-पिता मुझे छोड़ गए हैं। इस सत्य के बल से, हे अग्नि, लौट जाओ!\"",
      },
      {
        en: "At once the fire died down all around him, as if a torch had been dipped in water. The story says that spot of forest stayed safe from fire for a whole age of the world.",
        hi: "तुरंत उसके चारों ओर आग ऐसे बुझ गई, मानो किसी मशाल को पानी में डुबो दिया गया हो। कथा कहती है कि जंगल का वह स्थान पूरे एक कल्प तक आग से सुरक्षित रहा।",
      },
    ],
    lesson: {
      en: "Truth spoken from the heart has great power, even for the smallest and weakest.",
      hi: "हृदय से बोले गए सत्य में बड़ी शक्ति होती है, सबसे छोटे और कमज़ोर के लिए भी।",
    },
    minutes: 2,
    source: SOURCE(35),
    review: REVIEW,
  },
  {
    slug: "sihacamma-jataka",
    number: 189,
    title: { pi: "Sīhacamma Jātaka", en: "The Donkey in the Lion's Skin", hi: "शेर की खाल में गधा" },
    theme: { en: "Being genuine", hi: "सच्चाई" },
    summary: {
      en: "A donkey dressed in a lion's skin frightens the farmers, until he opens his mouth.",
      hi: "शेर की खाल पहने एक गधा किसानों को डराता है, जब तक वह अपना मुँह नहीं खोलता।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as a farmer. In those days a travelling trader carried his goods on a donkey. At each village he would unload it, throw a lion's skin over it, and turn it loose in the barley fields to graze.",
        hi: "बहुत समय पहले बोधिसत्त एक किसान के रूप में जन्मे। उन दिनों एक घुमंतू व्यापारी अपना माल एक गधे पर ढोता था। हर गाँव में वह गधे से सामान उतारता, उस पर शेर की खाल डाल देता, और उसे जौ के खेतों में चरने छोड़ देता।",
      },
      {
        en: "The watchmen saw a lion in the fields and did not dare go near, so the donkey ate his fill wherever he went. But at one village the farmers gathered together with sticks, conch shells and drums, and went out to face the lion.",
        hi: "रखवालों को खेत में शेर दिखता और वे पास जाने की हिम्मत नहीं करते, इसलिए गधा जहाँ भी जाता, पेट भरकर खाता। पर एक गाँव में किसान लाठियाँ, शंख और ढोल लेकर इकट्ठे हुए, और शेर का सामना करने निकल पड़े।",
      },
      {
        en: "The donkey was so frightened by the noise that he lifted his head and brayed. \"That is no lion,\" said the Bodhisatta. \"A lion roars; that is a donkey!\" The farmers chased it from the fields with their sticks, and the trader learned that a borrowed skin hides nothing for long.",
        hi: "शोर से गधा इतना डर गया कि उसने सिर उठाकर रेंकना शुरू कर दिया। बोधिसत्त बोले, \"यह शेर नहीं है। शेर दहाड़ता है; यह तो गधा है!\" किसानों ने लाठियों से उसे खेतों से खदेड़ दिया, और व्यापारी ने सीखा कि उधार की खाल कुछ भी देर तक नहीं छिपा सकती।",
      },
    ],
    lesson: {
      en: "Pretending to be what we are not cannot last; sooner or later our true voice is heard. It is better simply to be genuine.",
      hi: "जो हम नहीं हैं, वह होने का दिखावा टिकता नहीं; देर-सबेर हमारी असली आवाज़ सुनाई दे ही जाती है। सच्चा होना ही अच्छा है।",
    },
    minutes: 2,
    source: SOURCE(189),
    review: REVIEW,
  },
  {
    slug: "kurungamiga-jataka",
    number: 206,
    title: { pi: "Kuruṅgamiga Jātaka", en: "The Antelope, the Woodpecker and the Tortoise", hi: "हिरण, कठफोड़वा और कछुआ" },
    theme: { en: "Friendship", hi: "मित्रता" },
    summary: {
      en: "When an antelope is caught in a hunter's snare, his two small friends risk everything to set him free.",
      hi: "जब एक हिरण शिकारी के फंदे में फँस जाता है, तो उसके दो छोटे मित्र उसे छुड़ाने के लिए सब कुछ दाँव पर लगा देते हैं।",
    },
    paragraphs: [
      {
        en: "Long ago, the Bodhisatta was born as an antelope who lived by a lake in the forest. His two close friends were a woodpecker in a nearby tree and a tortoise in the lake. One night a hunter set a snare of leather straps on the path to the water, and the antelope was caught in it.",
        hi: "बहुत समय पहले बोधिसत्त एक हिरण के रूप में जन्मे, जो जंगल में एक झील के पास रहते थे। उनके दो घनिष्ठ मित्र थे: पास के पेड़ पर रहने वाला एक कठफोड़वा और झील में रहने वाला एक कछुआ। एक रात एक शिकारी ने पानी तक जाने वाले रास्ते पर चमड़े की पट्टियों का फंदा लगाया, और हिरण उसमें फँस गया।",
      },
      {
        en: "\"Friend tortoise, you have teeth; gnaw through the straps,\" said the woodpecker. \"I will keep the hunter away.\" At dawn, as the hunter stepped out of his front door, the woodpecker flew at his face, crying. \"A bad sign,\" thought the hunter, and went back in. He tried the back door, and there was the woodpecker again.",
        hi: "कठफोड़वे ने कहा, \"मित्र कछुए, तुम्हारे दाँत हैं; पट्टियाँ कुतर डालो। मैं शिकारी को दूर रखूँगा।\" भोर में जैसे ही शिकारी अपने आगे के दरवाज़े से निकला, कठफोड़वा चीखता हुआ उसके मुँह पर झपटा। शिकारी ने सोचा, \"अपशकुन है,\" और भीतर लौट गया। उसने पीछे का दरवाज़ा आज़माया, और वहाँ भी कठफोड़वा फिर आ गया।",
      },
      {
        en: "Meanwhile the tortoise gnawed and gnawed until his mouth bled, and only one strap was left when the hunter finally came running. The antelope broke it with one great pull and bounded into the woods, and the woodpecker flew up into his tree. But the tortoise was too tired to move, and the hunter put him in a bag and hung it on a branch.",
        hi: "इस बीच कछुआ कुतरता रहा, यहाँ तक कि उसके मुँह से खून बहने लगा, और जब शिकारी अंततः दौड़ता हुआ आया, तब केवल एक पट्टी बची थी। हिरण ने एक ज़ोरदार झटके से उसे तोड़ा और छलाँग लगाकर जंगल में चला गया, और कठफोड़वा उड़कर अपने पेड़ पर जा बैठा। पर कछुआ इतना थक गया था कि हिल न सका, और शिकारी ने उसे एक थैले में डालकर डाल पर टाँग दिया।",
      },
      {
        en: "The antelope would not leave his friend. He showed himself to the hunter, limping as if he were weak, and led him deep into the forest. Then he raced back by another way, lifted the bag with his horns, tore it open and set the tortoise free. \"You have saved my life,\" he told his friends, \"now let us all go somewhere safe.\" And they lived together happily far away.",
        hi: "हिरण अपने मित्र को छोड़कर नहीं गया। वह लँगड़ाता हुआ, मानो कमज़ोर हो, शिकारी के सामने आया और उसे जंगल के बहुत भीतर ले गया। फिर दूसरे रास्ते से दौड़कर लौटा, अपने सींगों से थैला उठाया, उसे फाड़ा और कछुए को आज़ाद कर दिया। उसने अपने मित्रों से कहा, \"तुमने मेरी जान बचाई है; अब चलो, हम सब किसी सुरक्षित जगह चलें।\" और वे दूर जाकर साथ-साथ सुख से रहने लगे।",
      },
    ],
    lesson: {
      en: "True friends stand by each other in danger, each giving what they can. Together even the small can do what one alone cannot.",
      hi: "सच्चे मित्र संकट में एक-दूसरे का साथ देते हैं, और हर कोई जो दे सकता है, देता है। साथ मिलकर छोटे भी वह कर सकते हैं जो अकेला कोई नहीं कर सकता।",
    },
    minutes: 3,
    source: SOURCE(206),
    review: REVIEW,
  },
  {
    slug: "mahisa-jataka",
    number: 278,
    title: { pi: "Mahisa Jātaka", en: "The Patient Buffalo", hi: "धैर्यवान भैंसा" },
    theme: { en: "Patience", hi: "क्षमा" },
    summary: {
      en: "A strong buffalo puts up with a monkey's endless tricks, and will not harm him.",
      hi: "एक बलवान भैंसा एक बंदर की अनगिनत शरारतें सहता है, पर उसे हानि नहीं पहुँचाता।",
    },
    paragraphs: [
      {
        en: "Long ago in the Himālaya, the Bodhisatta was born as a wild buffalo, huge and strong. A naughty monkey lived nearby, and whenever the buffalo stood resting under a tree, the monkey would jump on his back, pull his ears and horns, swing from his tail, and play every kind of trick on him.",
        hi: "बहुत समय पहले हिमालय में बोधिसत्त एक जंगली भैंसे के रूप में जन्मे, विशाल और बलवान। पास में एक नटखट बंदर रहता था। जब भी भैंसा किसी पेड़ के नीचे आराम करता, बंदर उसकी पीठ पर कूद जाता, उसके कान और सींग खींचता, उसकी पूँछ से झूलता, और हर तरह की शरारत करता।",
      },
      {
        en: "The buffalo bore it all calmly. One day the spirit of the tree asked him, \"You could crush him with a single blow. Why do you put up with this?\" The buffalo answered, \"If I cannot bear this from him without hurting him, how will I ever grow in patience? He will meet others who are not so patient, and they will teach him.\"",
        hi: "भैंसा यह सब शांति से सहता रहा। एक दिन उस पेड़ के देवता ने उससे पूछा, \"तुम एक ही वार में उसे कुचल सकते हो। फिर यह सब क्यों सहते हो?\" भैंसे ने उत्तर दिया, \"यदि मैं उसे हानि पहुँचाए बिना यह नहीं सह सकता, तो मेरा धैर्य कैसे बढ़ेगा? वह ऐसे दूसरों से मिलेगा जो इतने धैर्यवान नहीं, और वे उसे सिखा देंगे।\"",
      },
      {
        en: "Some time later the buffalo moved to another part of the forest, and a different buffalo came to rest under that tree. The monkey jumped on his back to play the same tricks, but this buffalo was not patient at all. He threw the monkey to the ground and trampled him, and the monkey's tricks came to an end.",
        hi: "कुछ समय बाद भैंसा जंगल के दूसरे हिस्से में चला गया, और एक दूसरा भैंसा उस पेड़ के नीचे आराम करने आया। बंदर वही शरारतें करने उसकी पीठ पर कूदा, पर यह भैंसा बिल्कुल भी धैर्यवान नहीं था। उसने बंदर को ज़मीन पर पटककर कुचल दिया, और बंदर की शरारतों का अंत हो गया।",
      },
    ],
    lesson: {
      en: "Patience is strength that chooses not to harm. Bearing with others gently trains the heart, and unkindness in the end comes back to the one who gives it.",
      hi: "धैर्य वह बल है जो हानि न पहुँचाने का चुनाव करता है। दूसरों को कोमलता से सहना हृदय को साधता है, और अंत में बुराई उसी के पास लौटती है जो उसे करता है।",
    },
    minutes: 2,
    source: SOURCE(278),
    review: REVIEW,
  },
];

// ── Listening ───────────────────────────────────────────────────────────────
/** One narrated part of a story: its title, a paragraph, or its lesson. */
/** Stories with a painting, at /illustrations/jataka/{slug}.webp (and bundled in the app). */
export const STORY_ART = new Set(SEED_STORIES.map((s) => s.slug));

/** The story's painting on the website, or null (a story added in the CMS). */
export function storyArt(slug: string): string | null {
  return STORY_ART.has(slug) ? `/illustrations/jataka/${slug}.webp` : null;
}

export interface StoryPart {
  /** "title", "p0", "p1" … or "lesson". */
  key: string;
  text: string;
  /** Paragraph index, for following along; null for the title and lesson. */
  paragraph: number | null;
}

const LESSON_INTRO: Localised = { en: "What the story teaches.", hi: "कथा की सीख।" };

/** What "Listen" reads, in order. Clips are made for exactly these texts. */
/** Anything narrated like a Jātaka tale (also the Dhammapada commentary stories). */
export type NarratedStory = Pick<JatakaStory, "slug" | "title" | "paragraphs" | "lesson">;

export function storyParts(story: NarratedStory, lang: "hi" | "en"): StoryPart[] {
  return [
    { key: "title", text: `${story.title[lang]}.`, paragraph: null },
    ...story.paragraphs.map((p, i) => ({ key: `p${i}`, text: p[lang], paragraph: i })),
    { key: "lesson", text: `${LESSON_INTRO[lang]} ${story.lesson[lang]}`, paragraph: null },
  ];
}
