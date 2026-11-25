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
export function storyParts(story: JatakaStory, lang: "hi" | "en"): StoryPart[] {
  return [
    { key: "title", text: `${story.title[lang]}.`, paragraph: null },
    ...story.paragraphs.map((p, i) => ({ key: `p${i}`, text: p[lang], paragraph: i })),
    { key: "lesson", text: `${LESSON_INTRO[lang]} ${story.lesson[lang]}`, paragraph: null },
  ];
}
