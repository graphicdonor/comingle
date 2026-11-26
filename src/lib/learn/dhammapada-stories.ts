// Stories from the Dhammapada Commentary (Dhammapada-aṭṭhakathā): the
// occasions on which, by tradition, the Buddha spoke particular verses.
// These are commentarial narratives, not canonical text, and the app labels
// them so.
//
// Short retellings in English and Hindi, following the commentary as
// translated by E. W. Burlingame, "Buddhist Legends" (Harvard Oriental Series
// 28–30, 1921; public domain). Drafts until a subject and language reviewer
// signs them off, and say so on screen. The Pali story names (vatthu) match
// the headings in the SuttaCentral edition (dhammapada-source.json).

import type { Localised, PrayerReview } from "../practice/prayers";

export interface CommentaryStory {
  slug: string;
  /** The story's Pali name, as headed in the commentary. */
  vatthu: string;
  title: { pi: string } & Localised;
  /** The Dhammapada verses the Buddha spoke at the end. */
  verses: number[];
  theme: Localised;
  summary: Localised;
  paragraphs: Localised[];
  /** What the story teaches (editorial). */
  lesson: Localised;
  /** A question to sit with (editorial). */
  reflection: Localised;
  minutes: number;
  source: { title: string; reference: string };
  review: { hi: PrayerReview; en: PrayerReview };
}

const DRAFT = { status: "draft" } as const;
const REVIEW = { hi: DRAFT, en: DRAFT };
const SOURCE = (verses: number[]) => ({
  title: "Dhammapada Commentary (Dhammapada-aṭṭhakathā)",
  reference: `Story of Dhammapada ${verses.length > 1 ? `verses ${verses.join(", ")}` : `verse ${verses[0]}`}; retold from E. W. Burlingame, Buddhist Legends (1921)`,
});

/** What the commentary stories are, for the top of their list. */
export const COMMENTARY_INTRO: Localised = {
  en: "The Dhammapada Commentary, compiled in Sri Lanka in the fifth century from older traditions, tells the occasion on which the Buddha spoke each verse. These stories are not scripture, but for fifteen centuries they have helped readers see the verses lived.",
  hi: "धम्मपद-अट्ठकथा, जो पाँचवीं शताब्दी में श्रीलंका में पुरानी परंपराओं से संकलित हुई, बताती है कि भगवान बुद्ध ने हर गाथा किस प्रसंग में कही। ये कथाएँ तिपिटक का अंग नहीं हैं, पर पंद्रह सौ वर्षों से इन्होंने पाठकों को गाथाओं को जीवन में उतरा हुआ देखने में मदद की है।",
};

export const COMMENTARY_STORIES: CommentaryStory[] = [
  {
    slug: "cakkhupala",
    vatthu: "Cakkhupālattheravatthu",
    title: { pi: "Cakkhupāla", en: "The Blind Monk", hi: "नेत्रहीन भिक्षु" },
    verses: [1],
    theme: { en: "Intention", hi: "चेतना" },
    summary: {
      en: "A monk who has lost his sight treads on insects in the dark, and the Buddha explains why no wrong was done.",
      hi: "अपनी आँखें खो चुका एक भिक्षु अँधेरे में कीड़ों पर पैर रख देता है, और बुद्ध समझाते हैं कि कोई अकुशल कर्म क्यों नहीं हुआ।",
    },
    paragraphs: [
      {
        en: "In Sāvatthī there lived a rich man named Mahāpāla. After hearing the Buddha teach, he left his home and became a monk, and went with sixty other monks to spend the rainy season in a forest village. There he made a firm resolve: for those three months he would meditate sitting, standing and walking, but never lie down.",
        hi: "सावत्थी में महापाल नाम का एक धनी व्यक्ति रहता था। बुद्ध का उपदेश सुनकर उसने घर छोड़ दिया और भिक्षु बन गया, और साठ भिक्षुओं के साथ वर्षावास बिताने एक वन-ग्राम में गया। वहाँ उसने दृढ़ संकल्प किया कि उन तीन महीनों में वह बैठकर, खड़े होकर और चलकर ध्यान करेगा, पर कभी लेटेगा नहीं।",
      },
      {
        en: "Soon his eyes became diseased. A physician gave him medicine to be taken through the nose while lying down, but he would not break his resolve, and took it sitting up. His eyes grew worse. \"Let the eyes go,\" he thought, \"the Buddha's teaching is what matters,\" and he kept on practising. In the same night that he lost his sight, his mind was freed: he became an arahant. From then on he was known as Cakkhupāla.",
        hi: "जल्द ही उसकी आँखों में रोग हो गया। एक वैद्य ने उसे ऐसी दवा दी जो लेटकर नाक से लेनी थी, पर उसने अपना संकल्प नहीं तोड़ा और बैठे-बैठे ही दवा ली। आँखें और बिगड़ गईं। उसने सोचा, \"आँखें जाएँ तो जाएँ, बुद्ध की शिक्षा ही सबसे महत्त्वपूर्ण है,\" और अभ्यास करता रहा। जिस रात उसकी दृष्टि गई, उसी रात उसका चित्त मुक्त हो गया: वह अर्हत हो गया। तब से वह चक्खुपाल कहलाया।",
      },
      {
        en: "Later he came to stay at the Jetavana monastery. One night after rain he did walking meditation, and many insects that had come out on the wet path died beneath his feet. In the morning some visiting monks saw them and complained to the Buddha: \"Cakkhupāla has been killing living beings.\"",
        hi: "बाद में वह जेतवन विहार में रहने आया। एक रात वर्षा के बाद उसने चंक्रमण (चलते हुए ध्यान) किया, और गीले रास्ते पर निकले बहुत-से कीड़े उसके पैरों तले मर गए। सुबह कुछ आगंतुक भिक्षुओं ने यह देखा और बुद्ध से शिकायत की, \"चक्खुपाल जीवों की हत्या कर रहा है।\"",
      },
      {
        en: "\"Did you see him kill them?\" asked the Buddha. \"No.\" \"Just as you did not see him, he did not see them. One who is free from defilements has no intention to kill. Where there is no intention, there is no wrong.\" Then he spoke the first verse of the Dhammapada: mind goes before all things, and suffering follows a corrupted mind as the wheel follows the ox.",
        hi: "बुद्ध ने पूछा, \"क्या तुमने उसे उन्हें मारते देखा?\" \"नहीं।\" \"जैसे तुमने उसे नहीं देखा, वैसे ही उसने उन्हें नहीं देखा। जिसके क्लेश नष्ट हो चुके हैं, उसकी मारने की चेतना नहीं होती। जहाँ चेतना नहीं, वहाँ पाप नहीं।\" फिर उन्होंने धम्मपद की पहली गाथा कही: मन सब धम्मों का अगुआ है, और दूषित मन के पीछे दुःख वैसे ही चलता है जैसे बैल के पीछे पहिया।",
      },
    ],
    lesson: {
      en: "The weight of an action lies in the intention behind it. Guarding the mind is the root of guarding speech and deed.",
      hi: "किसी कर्म का भार उसके पीछे की चेतना में होता है। मन की रक्षा ही वाणी और कर्म की रक्षा की जड़ है।",
    },
    reflection: { en: "What intention lay behind something I did today?", hi: "आज के मेरे किसी काम के पीछे कौन-सी चेतना थी?" },
    minutes: 3,
    source: SOURCE([1]),
    review: REVIEW,
  },
  {
    slug: "matthakundali",
    vatthu: "Maṭṭhakuṇḍalīvatthu",
    title: { pi: "Maṭṭhakuṇḍalī", en: "The Boy with the Burnished Earrings", hi: "चमकते कुंडलों वाला बालक" },
    verses: [2],
    theme: { en: "Faith", hi: "श्रद्धा" },
    summary: {
      en: "A dying boy, kept hidden by his miserly father, sees the Buddha at the door and his heart fills with faith.",
      hi: "अपने कंजूस पिता द्वारा छिपाकर रखा गया एक मरणासन्न बालक द्वार पर बुद्ध को देखता है, और उसका हृदय श्रद्धा से भर जाता है।",
    },
    paragraphs: [
      {
        en: "In Sāvatthī lived a brahmin so stingy that people called him Adinnapubbaka, \"the one who never gave\". He loved his only son, but rather than pay a goldsmith he hammered out a pair of plain earrings for him himself, so the boy was called Maṭṭhakuṇḍalī, \"Burnished Earrings\".",
        hi: "सावत्थी में एक ब्राह्मण इतना कंजूस था कि लोग उसे अदिन्नपुब्बक, यानी \"जिसने कभी कुछ नहीं दिया\" कहते थे। वह अपने इकलौते बेटे से प्रेम करता था, पर सुनार को पैसे देने के बजाय उसने स्वयं पीटकर उसके लिए सादे कुंडल बना दिए, इसलिए बालक मट्ठकुंडली, यानी \"चमकते कुंडलों वाला\" कहलाया।",
      },
      {
        en: "When the boy was sixteen he fell gravely ill. His father would not call a physician, for fear of the fee, and tried remedies he had heard of. When it was clear the boy would die, he carried him out onto the veranda, so that visitors would not come inside and see the wealth of the house.",
        hi: "जब बालक सोलह वर्ष का था, वह गंभीर रूप से बीमार पड़ गया। पिता ने फ़ीस के डर से वैद्य को नहीं बुलाया, और सुनी-सुनाई दवाएँ आज़माता रहा। जब साफ़ हो गया कि बालक नहीं बचेगा, तो वह उसे बरामदे में ले आया, ताकि आने-जाने वाले भीतर आकर घर का धन न देख लें।",
      },
      {
        en: "Early that morning the Buddha, surveying the world with compassion, saw the boy and went to stand at the door. The boy, too weak to move, could not offer anything or even raise his hands; but seeing the Buddha, his heart filled with faith. With that faith in his mind he died, and was reborn among the gods.",
        hi: "उसी सुबह बुद्ध ने करुणा से संसार को देखते हुए उस बालक को देखा और जाकर द्वार पर खड़े हो गए। बालक इतना कमज़ोर था कि हिल भी नहीं सकता था, न कुछ दे सकता था, न हाथ जोड़ सकता था; पर बुद्ध को देखकर उसका हृदय श्रद्धा से भर गया। उसी श्रद्धा भरे मन के साथ उसने देह छोड़ी, और देवलोक में जन्म लिया।",
      },
      {
        en: "Later the father, still grieving, invited the Buddha to a meal, and many people gathered. There the son appeared in his new form and told how a moment of faith had brought him happiness. The Buddha then spoke the second verse: if one speaks or acts with a pure mind, happiness follows like a shadow that never leaves.",
        hi: "बाद में शोक में डूबे पिता ने बुद्ध को भोजन के लिए आमंत्रित किया, और बहुत-से लोग इकट्ठे हुए। वहाँ बेटा अपने नए रूप में प्रकट हुआ और बताया कि श्रद्धा के एक क्षण ने उसे सुख दिया। तब बुद्ध ने दूसरी गाथा कही: जो प्रसन्न (निर्मल) मन से बोलता या करता है, सुख उसके पीछे वैसे ही चलता है जैसे कभी न छोड़ने वाली छाया।",
      },
    ],
    lesson: {
      en: "Even when we can do nothing outwardly, a clear and trusting mind is itself a good action, and its fruit follows.",
      hi: "जब हम बाहर से कुछ भी नहीं कर सकते, तब भी निर्मल और श्रद्धा भरा मन अपने आप में एक कुशल कर्म है, और उसका फल पीछे आता है।",
    },
    reflection: { en: "Where can a quiet, clear mind be my offering today?", hi: "आज कहाँ एक शांत, निर्मल मन ही मेरी भेंट बन सकता है?" },
    minutes: 3,
    source: SOURCE([2]),
    review: REVIEW,
  },
  {
    slug: "kala-yakkhini",
    vatthu: "Kāḷayakkhinīvatthu",
    title: { pi: "Kāḷayakkhinī", en: "The Feud Across Lifetimes", hi: "जन्म-जन्मांतर का वैर" },
    verses: [5],
    theme: { en: "Ending hatred", hi: "वैर का अंत" },
    summary: {
      en: "Two women harm each other life after life, until the Buddha shows them that hatred only ends with non-hatred.",
      hi: "दो स्त्रियाँ जन्म-दर-जन्म एक-दूसरे को हानि पहुँचाती हैं, जब तक बुद्ध उन्हें नहीं दिखाते कि वैर अवैर से ही समाप्त होता है।",
    },
    paragraphs: [
      {
        en: "Long ago a young wife who had no children arranged a second wife for her husband. But when the second wife became pregnant, jealousy took hold of the first, and she secretly made her lose the child, once, twice, and a third time, when both mother and child died. Dying, the second wife vowed to take revenge.",
        hi: "बहुत पहले एक निःसंतान युवा पत्नी ने अपने पति के लिए दूसरी पत्नी ला दी। पर जब दूसरी पत्नी गर्भवती हुई, तो पहली के मन में ईर्ष्या जाग उठी, और उसने चुपके से उसका गर्भ गिरा दिया, एक बार, दो बार, और तीसरी बार, जब माँ और शिशु दोनों की मृत्यु हो गई। मरते समय दूसरी पत्नी ने बदला लेने की प्रतिज्ञा की।",
      },
      {
        en: "So began a long chain of enmity. They were born as a cat and a hen, and the cat ate the hen's eggs; as a leopardess and a deer, and the leopardess killed the deer's young. Each time, the one who suffered vowed revenge in the next life. At last one was born as a woman of Sāvatthī, and the other as an ogress named Kāḷī.",
        hi: "इस तरह वैर की एक लंबी शृंखला शुरू हुई। वे बिल्ली और मुर्गी बनीं, और बिल्ली ने मुर्गी के अंडे खा लिए; फिर तेंदुई और हिरणी बनीं, और तेंदुई ने हिरणी के बच्चों को मार डाला। हर बार पीड़ा सहने वाली ने अगले जन्म में बदले की प्रतिज्ञा की। अंत में एक सावत्थी की एक स्त्री बनी, और दूसरी काली नाम की एक यक्षिणी।",
      },
      {
        en: "The ogress came hunting for the woman's newborn son. The terrified mother ran with the baby into the Jetavana monastery, where the Buddha was teaching, and laid the child at his feet. The Buddha had the ogress brought in too, and spoke to them both: \"If you had not come to me, your hatred would have gone on for ages, like that of a snake and a mongoose.\"",
        hi: "यक्षिणी उस स्त्री के नवजात बेटे की खोज में आई। डरी हुई माँ बच्चे को लेकर जेतवन विहार में भागी, जहाँ बुद्ध उपदेश दे रहे थे, और बच्चे को उनके चरणों में रख दिया। बुद्ध ने यक्षिणी को भी भीतर बुलवाया और दोनों से कहा, \"यदि तुम मेरे पास न आतीं, तो तुम्हारा वैर साँप और नेवले की तरह युगों तक चलता रहता।\"",
      },
      {
        en: "Then he spoke the fifth verse: hatred is never ended by hatred in this world; by non-hatred alone it ends. This is an ancient law. Both women let go. The ogress took refuge, and the woman, now without fear, gave her the baby to hold, took her home, and cared for her. In return the ogress told her each year when the rains would come, so her fields always did well.",
        hi: "फिर उन्होंने पाँचवीं गाथा कही: इस संसार में वैर से वैर कभी शांत नहीं होता; अवैर से ही शांत होता है। यही सनातन धम्म है। दोनों ने वैर छोड़ दिया। यक्षिणी ने शरण ली, और वह स्त्री, अब बिना भय के, बच्चे को उसकी गोद में दे सकी, उसे अपने घर ले गई और उसकी देखभाल की। बदले में यक्षिणी हर वर्ष उसे बताती कि वर्षा कब आएगी, जिससे उसके खेत सदा अच्छे रहे।",
      },
    ],
    lesson: {
      en: "Revenge only adds another link to the chain. It ends when one side chooses non-hatred, and old enemies can even become friends.",
      hi: "बदला शृंखला में एक और कड़ी जोड़ देता है। यह तभी टूटती है जब कोई एक पक्ष अवैर चुनता है, और पुराने शत्रु भी मित्र बन सकते हैं।",
    },
    reflection: { en: "Is there an old grudge I am ready to set down?", hi: "क्या कोई पुराना वैर है जिसे अब छोड़ा जा सकता है?" },
    minutes: 3,
    source: SOURCE([5]),
    review: REVIEW,
  },
  {
    slug: "kosambi-monks",
    vatthu: "Kosambakavatthu",
    title: { pi: "Kosambaka", en: "The Quarrel at Kosambi", hi: "कोसंबी का कलह" },
    verses: [6],
    theme: { en: "Reconciliation", hi: "मेल-मिलाप" },
    summary: {
      en: "A small dispute splits the monks of Kosambi, the Buddha leaves for the forest, and remembering death brings them back to peace.",
      hi: "एक छोटा-सा विवाद कोसंबी के भिक्षुओं को दो दलों में बाँट देता है, बुद्ध वन चले जाते हैं, और मृत्यु का स्मरण उन्हें फिर शांति की ओर लाता है।",
    },
    paragraphs: [
      {
        en: "At Kosambi two respected monks, one a teacher of the monastic rules and the other a teacher of the Dhamma, fell out over a small thing: whether water had wrongly been left in a vessel. Their pupils took sides, the lay supporters took sides, and soon the whole community was split into two angry camps.",
        hi: "कोसंबी में दो सम्मानित भिक्षु, एक विनय (संघ के नियमों) के आचार्य और दूसरे धम्म के आचार्य, एक छोटी-सी बात पर उलझ गए: क्या एक पात्र में पानी छोड़ देना ग़लत था। उनके शिष्यों ने पक्ष ले लिए, उपासकों ने पक्ष ले लिए, और जल्द ही पूरा संघ दो क्रोधित दलों में बँट गया।",
      },
      {
        en: "The Buddha urged them again and again to make peace, but they would not listen. So he left them and went alone into the Pārileyyaka forest, where, the story says, a great elephant cared for him, bringing water and keeping watch, and a monkey offered him a honeycomb.",
        hi: "बुद्ध ने बार-बार उनसे मेल करने को कहा, पर उन्होंने नहीं सुना। तब वे उन्हें छोड़कर अकेले पारिलेय्यक वन चले गए, जहाँ, कथा कहती है, एक विशाल हाथी ने पानी लाकर और पहरा देकर उनकी सेवा की, और एक बंदर ने उन्हें मधु का छत्ता भेंट किया।",
      },
      {
        en: "When the people of Kosambi learned why the Buddha had gone, they stopped bowing to the quarrelling monks and stopped giving them alms. Humbled, the monks went to the Buddha at Sāvatthī and asked his forgiveness.",
        hi: "जब कोसंबी के लोगों को पता चला कि बुद्ध क्यों चले गए, तो उन्होंने झगड़ने वाले भिक्षुओं को प्रणाम करना और भिक्षा देना बंद कर दिया। लज्जित होकर भिक्षु सावत्थी में बुद्ध के पास गए और क्षमा माँगी।",
      },
      {
        en: "The Buddha reminded them how short life is, and spoke the sixth verse: others do not understand that we must all come to an end here; those who do understand this, their quarrels cease.",
        hi: "बुद्ध ने उन्हें याद दिलाया कि जीवन कितना छोटा है, और छठी गाथा कही: दूसरे नहीं जानते कि हम सबको यहाँ एक दिन समाप्त होना है; जो इसे जान लेते हैं, उनके कलह शांत हो जाते हैं।",
      },
    ],
    lesson: {
      en: "Most quarrels shrink when we remember that our time together is short. Being right matters less than living in peace.",
      hi: "जब हम याद रखते हैं कि साथ का समय छोटा है, तो अधिकतर झगड़े छोटे हो जाते हैं। सही साबित होने से अधिक ज़रूरी है शांति से रहना।",
    },
    reflection: { en: "Which disagreement would look different if I remembered how brief life is?", hi: "जीवन की क्षणभंगुरता याद रहे, तो कौन-सा मतभेद अलग दिखेगा?" },
    minutes: 3,
    source: SOURCE([6]),
    review: REVIEW,
  },
  {
    slug: "culapanthaka",
    vatthu: "Cūḷapanthakavatthu",
    title: { pi: "Cūḷapanthaka", en: "The Monk and the White Cloth", hi: "भिक्षु और सफ़ेद कपड़ा" },
    verses: [25],
    theme: { en: "Effort", hi: "वीर्य" },
    summary: {
      en: "A monk who cannot learn a single verse in four months is given a clean cloth, and through it finds freedom.",
      hi: "चार महीनों में एक गाथा भी याद न कर पाने वाले भिक्षु को एक साफ़ कपड़ा दिया जाता है, और उसी के सहारे वह मुक्ति पाता है।",
    },
    paragraphs: [
      {
        en: "Two brothers, Mahāpanthaka and Cūḷapanthaka, became monks. The elder quickly mastered the teaching, but the younger could not learn even one verse; each new line drove the last one out of his mind. After four months his brother told him, \"You are not able for this. Go home.\"",
        hi: "दो भाई, महापंथक और चूळपंथक, भिक्षु बने। बड़ा भाई जल्दी ही धम्म में निपुण हो गया, पर छोटा एक गाथा भी याद नहीं कर पाता था; हर नई पंक्ति पिछली को मन से निकाल देती। चार महीने बाद बड़े भाई ने उससे कहा, \"यह तुम्हारे बस का नहीं। घर लौट जाओ।\"",
      },
      {
        en: "Heartbroken, Cūḷapanthaka was standing outside the monastery gate in the early morning when the Buddha met him. He took him gently by the hand, gave him a clean white cloth, and said, \"Sit facing the east, rub this cloth, and repeat: removing the dirt, removing the dirt.\"",
        hi: "दुःखी चूळपंथक सुबह-सुबह विहार के द्वार के बाहर खड़ा था, तब बुद्ध उससे मिले। उन्होंने स्नेह से उसका हाथ पकड़ा, उसे एक साफ़ सफ़ेद कपड़ा दिया, और कहा, \"पूर्व की ओर मुँह करके बैठो, यह कपड़ा मलते रहो, और दोहराओ: मैल हट रहा है, मैल हट रहा है।\"",
      },
      {
        en: "As he rubbed, the white cloth slowly grew dirty in his hands. \"This cloth was clean,\" he thought, \"and through this body it has become soiled. Everything changes.\" Seeing this deeply, he went further, understood the dirt of greed, hatred and delusion in the mind, and became an arahant.",
        hi: "जैसे-जैसे वह मलता गया, सफ़ेद कपड़ा उसके हाथों में धीरे-धीरे मैला होता गया। उसने सोचा, \"यह कपड़ा साफ़ था, और इस शरीर के कारण मैला हो गया। सब कुछ बदलता है।\" इसे गहराई से देखते हुए वह आगे बढ़ा, मन के लोभ, द्वेष और मोह रूपी मैल को समझा, और अर्हत हो गया।",
      },
      {
        en: "That same day, when the physician Jīvaka offered a meal to the monks, the one who had been sent away was found teaching with great skill. When the monks marvelled, the Buddha spoke the twenty-fifth verse: by effort and heedfulness, by restraint and self-control, the wise make an island that no flood can overwhelm.",
        hi: "उसी दिन जब वैद्य जीवक ने भिक्षुओं को भोजन कराया, तो जिसे लौट जाने को कहा गया था, वही बड़ी कुशलता से धम्म सिखाता पाया गया। जब भिक्षुओं ने आश्चर्य किया, तो बुद्ध ने पच्चीसवीं गाथा कही: उद्यम, अप्रमाद, संयम और दम से बुद्धिमान अपने लिए ऐसा द्वीप बना लेता है जिसे कोई बाढ़ नहीं डुबा सकती।",
      },
    ],
    lesson: {
      en: "There is no one way to learn. With the right method and steady effort, even the one others give up on can reach the goal.",
      hi: "सीखने का कोई एक ही तरीका नहीं होता। सही विधि और लगातार प्रयास से वह भी लक्ष्य तक पहुँच सकता है जिससे दूसरे उम्मीद छोड़ चुके हों।",
    },
    reflection: { en: "Where have I given up on myself too early?", hi: "कहाँ मैंने स्वयं से बहुत जल्दी उम्मीद छोड़ दी है?" },
    minutes: 3,
    source: SOURCE([25]),
    review: REVIEW,
  },
  {
    slug: "putigatta-tissa",
    vatthu: "Pūtigattatissattheravatthu",
    title: { pi: "Pūtigatta Tissa", en: "The Sick Monk", hi: "रोगी भिक्षु" },
    verses: [41],
    theme: { en: "Care for the sick", hi: "रोगी की सेवा" },
    summary: {
      en: "When a monk with festering sores is left alone, the Buddha himself heats water, bathes him, and washes his robes.",
      hi: "जब सड़ते घावों वाले एक भिक्षु को अकेला छोड़ दिया जाता है, तो बुद्ध स्वयं पानी गर्म करते हैं, उसे नहलाते हैं और उसके चीवर धोते हैं।",
    },
    paragraphs: [
      {
        en: "A monk named Tissa fell ill. Small boils spread over his body, burst into open sores, and his robes stuck to them. The smell was so bad that he came to be called Pūtigatta Tissa, \"Tissa of the rotting body\", and one by one his companions left him lying alone.",
        hi: "तिस्स नाम का एक भिक्षु बीमार पड़ गया। उसके शरीर पर छोटे-छोटे फोड़े फैल गए, फूटकर खुले घाव बन गए, और उसके चीवर उनसे चिपक गए। दुर्गंध इतनी तेज़ थी कि उसे पूतिगत्त तिस्स, यानी \"सड़ते शरीर वाला तिस्स\" कहा जाने लगा, और उसके साथी एक-एक करके उसे अकेला छोड़ गए।",
      },
      {
        en: "The Buddha, seeing this, went to the fire-room, set water to boil, and came to the sick monk's room. He took hold of one end of the bed, and the monks, ashamed, hurried to carry Tissa to the fire-room. There the Buddha had his outer robe washed and dried while he gently bathed him with warm water.",
        hi: "बुद्ध ने यह देखा, अग्निशाला में जाकर पानी गर्म करने रखा, और रोगी भिक्षु के कमरे में आए। उन्होंने चारपाई का एक सिरा पकड़ा, तो लज्जित भिक्षु दौड़कर तिस्स को अग्निशाला तक ले गए। वहाँ बुद्ध ने उसका ऊपरी चीवर धुलवाकर सुखवाया और स्वयं गर्म पानी से उसे धीरे-धीरे नहलाया।",
      },
      {
        en: "Clean, in fresh robes and lying comfortably, Tissa's mind became calm and clear. The Buddha sat by him and spoke the forty-first verse: before long this body will lie on the earth, cast aside and without consciousness, like a useless log.",
        hi: "साफ़, धुले चीवर में और आराम से लेटे हुए तिस्स का मन शांत और स्पष्ट हो गया। बुद्ध उसके पास बैठे और इकतालीसवीं गाथा कही: जल्द ही यह शरीर चेतना-रहित होकर, फेंक दी गई निरर्थक लकड़ी की तरह, धरती पर पड़ा होगा।",
      },
      {
        en: "Hearing this with a peaceful mind, Tissa saw the truth of the body and became an arahant, and soon afterwards he died. The care the Buddha gave with his own hands is remembered to this day.",
        hi: "शांत मन से यह सुनकर तिस्स ने शरीर का सत्य देखा और अर्हत हो गया, और कुछ ही समय बाद उसने देह त्याग दी। बुद्ध ने अपने हाथों से जो सेवा की, वह आज तक याद की जाती है।",
      },
    ],
    lesson: {
      en: "Compassion is shown in plain acts of care, especially for those others avoid. And remembering the body's frailty can bring calm rather than fear.",
      hi: "करुणा सेवा के सीधे-सादे कामों में दिखती है, ख़ासकर उनके लिए जिनसे दूसरे बचते हैं। और शरीर की नश्वरता का स्मरण भय नहीं, शांति ला सकता है।",
    },
    reflection: { en: "Who near me needs simple care that others have overlooked?", hi: "मेरे आसपास किसे ऐसी सादी सेवा चाहिए जिसे दूसरों ने अनदेखा किया है?" },
    minutes: 3,
    source: SOURCE([41]),
    review: REVIEW,
  },
  {
    slug: "patacara",
    vatthu: "Paṭācārātherīvatthu",
    title: { pi: "Paṭācārā", en: "Paṭācārā", hi: "पटाचारा" },
    verses: [113],
    theme: { en: "Grief and healing", hi: "शोक और उपचार" },
    summary: {
      en: "A woman who loses her whole family in a single storm is brought back to herself by the Buddha's words.",
      hi: "एक ही तूफ़ान में अपना पूरा परिवार खो देने वाली एक स्त्री बुद्ध के वचनों से फिर अपने आप में लौट आती है।",
    },
    paragraphs: [
      {
        en: "Paṭācārā was the daughter of a rich merchant of Sāvatthī. She ran away with a young servant of the house, and they lived poorly in a distant village. When she was expecting her second child, she set out with her husband and little son to give birth at her parents' home.",
        hi: "पटाचारा सावत्थी के एक धनी सेठ की बेटी थी। वह घर के एक युवा सेवक के साथ भाग गई, और वे एक दूर गाँव में गरीबी में रहने लगे। जब वह दूसरी बार गर्भवती हुई, तो वह पति और छोटे बेटे के साथ माता-पिता के घर प्रसव के लिए निकली।",
      },
      {
        en: "On the way a great storm broke. Her husband went to cut wood for a shelter and was bitten by a snake and died. That night, alone in the rain, she gave birth. The next day she came to a river in flood. She carried the baby across first, but as she turned back for her older son, a hawk swooped on the newborn; and the boy, seeing his mother wave her arms, stepped into the water and was swept away.",
        hi: "रास्ते में भयंकर तूफ़ान आया। उसका पति आश्रय के लिए लकड़ी काटने गया, साँप ने उसे डस लिया और उसकी मृत्यु हो गई। उस रात, वर्षा में अकेले, उसने बच्चे को जन्म दिया। अगले दिन वह बाढ़ से उफनती एक नदी पर पहुँची। उसने पहले नवजात को पार पहुँचाया, पर जैसे ही वह बड़े बेटे के लिए लौटी, एक बाज़ नवजात पर झपट पड़ा; और बड़ा बेटा, माँ को हाथ हिलाते देखकर, पानी में उतर गया और बह गया।",
      },
      {
        en: "Reaching Sāvatthī, she learned that in the night's storm her parents' house had fallen, and her mother, father and brother were burning on a single pyre. Her mind gave way. She wandered the streets, her clothes falling from her, and people drove her off.",
        hi: "सावत्थी पहुँचकर उसे पता चला कि रात के तूफ़ान में उसके माता-पिता का घर गिर गया था, और उसके माता, पिता और भाई एक ही चिता पर जल रहे थे। उसका मन टूट गया। वह गलियों में भटकने लगी, उसके वस्त्र उतरते चले गए, और लोग उसे दुत्कारने लगे।",
      },
      {
        en: "She came to the Jetavana, where the Buddha was teaching, and he said to her, \"Sister, recover your mindfulness.\" At those words she came back to herself. Someone gave her a cloak, and the Buddha comforted her, teaching that the tears shed for loved ones over countless lives are more than the waters of the four oceans. She became a nun, and one day, watching water she poured on the ground run a little way and sink, she saw the rising and passing of life and was freed. Of her the Buddha spoke the verse: better one day seeing rise and fall than a hundred years without seeing it.",
        hi: "वह जेतवन पहुँची, जहाँ बुद्ध उपदेश दे रहे थे, और उन्होंने उससे कहा, \"बहन, अपनी सति (सजगता) वापस पाओ।\" उन शब्दों से वह अपने आप में लौट आई। किसी ने उसे चादर दी, और बुद्ध ने उसे सांत्वना दी, यह सिखाते हुए कि अनगिनत जन्मों में प्रियजनों के लिए बहाए आँसू चारों महासागरों के जल से भी अधिक हैं। वह भिक्षुणी बनी, और एक दिन ज़मीन पर डाले पानी को थोड़ी दूर बहकर सूखते देखकर उसने जीवन का उदय और व्यय देखा और मुक्त हो गई। उसी के लिए बुद्ध ने गाथा कही: उदय और व्यय को न देखते हुए सौ वर्ष जीने से, उन्हें देखते हुए एक दिन जीना श्रेष्ठ है।",
      },
    ],
    lesson: {
      en: "Even the deepest grief can be met. Mindfulness, kind presence and understanding change can bring a broken heart back to steadiness.",
      hi: "गहरे से गहरे शोक का भी सामना किया जा सकता है। सजगता, स्नेहपूर्ण साथ और परिवर्तन की समझ टूटे हृदय को फिर स्थिर कर सकती है।",
    },
    reflection: { en: "Who has helped me come back to myself in a hard time?", hi: "कठिन समय में किसने मुझे फिर अपने आप में लौटने में मदद की?" },
    minutes: 4,
    source: SOURCE([113]),
    review: REVIEW,
  },
  {
    slug: "kisa-gotami",
    vatthu: "Kisāgotamīvatthu",
    title: { pi: "Kisā Gotamī", en: "Kisā Gotamī and the Mustard Seed", hi: "किसा गोतमी और सरसों के दाने" },
    verses: [114],
    theme: { en: "Accepting death", hi: "मृत्यु की स्वीकृति" },
    summary: {
      en: "A mother carries her dead child from house to house looking for medicine, and the Buddha sends her for a mustard seed.",
      hi: "एक माँ अपने मृत बच्चे को लेकर घर-घर दवा ढूँढती है, और बुद्ध उसे सरसों का एक दाना लाने भेजते हैं।",
    },
    paragraphs: [
      {
        en: "Gotamī, called Kisā Gotamī, \"thin Gotamī\", came from a poor family and married into a rich one. She was looked down on until she bore a son; then she was honoured. But when the boy was just old enough to run about, he fell ill and died.",
        hi: "गोतमी, जिसे दुबलेपन के कारण किसा गोतमी कहा जाता था, एक गरीब परिवार से थी और एक धनी परिवार में ब्याही गई। जब तक उसने बेटे को जन्म नहीं दिया, उसे नीची नज़र से देखा गया; फिर उसका सम्मान होने लगा। पर जब बालक दौड़ने-भागने लायक ही हुआ था, वह बीमार पड़ा और मर गया।",
      },
      {
        en: "Unable to accept it, she carried the little body on her hip from door to door, asking everyone for medicine for her son. People laughed or turned away. At last a wise man said, \"I know no medicine, but the Buddha may. Go to him.\"",
        hi: "इसे स्वीकार न कर पाने के कारण वह छोटे-से शव को कमर पर उठाए घर-घर जाती, सबसे अपने बेटे के लिए दवा माँगती। लोग हँसते या मुँह फेर लेते। अंत में एक समझदार व्यक्ति ने कहा, \"मैं कोई दवा नहीं जानता, पर बुद्ध जानते होंगे। उनके पास जाओ।\"",
      },
      {
        en: "\"Yes, I can help,\" said the Buddha. \"Bring me a few mustard seeds, but they must come from a house where no one has ever died.\" She went from house to house. Everyone gladly offered mustard seed, but at every door she heard: \"Here my father died\", \"here my child\", \"here my husband\". By evening she understood: death comes to every family. Her grip on her grief loosened.",
        hi: "बुद्ध ने कहा, \"हाँ, मैं मदद कर सकता हूँ। मेरे लिए कुछ सरसों के दाने ले आओ, पर वे ऐसे घर से हों जहाँ कभी किसी की मृत्यु न हुई हो।\" वह घर-घर गई। हर कोई ख़ुशी से सरसों देने को तैयार था, पर हर द्वार पर उसने सुना: \"यहाँ मेरे पिता गुज़रे\", \"यहाँ मेरा बच्चा\", \"यहाँ मेरे पति\"। शाम तक वह समझ गई: मृत्यु हर परिवार में आती है। उसके शोक की जकड़ ढीली पड़ गई।",
      },
      {
        en: "She laid her son to rest in the charnel ground and returned to the Buddha, who taught her that death carries off those whose minds cling, as a flood carries off a sleeping village. She became a nun. One day, watching lamp flames flare up and die down, she saw that beings too arise and pass away; the Buddha spoke the verse: better one day seeing the deathless than a hundred years without seeing it.",
        hi: "उसने अपने बेटे को श्मशान में विदा किया और बुद्ध के पास लौटी, जिन्होंने उसे सिखाया कि मृत्यु आसक्त मन वालों को वैसे ही बहा ले जाती है जैसे बाढ़ सोते हुए गाँव को। वह भिक्षुणी बनी। एक दिन दीपक की लौ को भड़कते और बुझते देखकर उसने समझा कि प्राणी भी उत्पन्न होते और मिटते हैं; तब बुद्ध ने गाथा कही: अमृत पद (निब्बान) को न देखते हुए सौ वर्ष जीने से, उसे देखते हुए एक दिन जीना श्रेष्ठ है।",
      },
    ],
    lesson: {
      en: "Loss is part of every life. Seeing that we are not alone in it can soften grief and open the way to peace.",
      hi: "हानि हर जीवन का हिस्सा है। यह देखना कि इसमें हम अकेले नहीं हैं, शोक को कोमल कर सकता है और शांति का रास्ता खोल सकता है।",
    },
    reflection: { en: "What would it mean to hold a loss more gently?", hi: "किसी हानि को और कोमलता से थामने का क्या अर्थ होगा?" },
    minutes: 3,
    source: SOURCE([114]),
    review: REVIEW,
  },
  {
    slug: "angulimala",
    vatthu: "Aṅgulimālattheravatthu",
    title: { pi: "Aṅgulimāla", en: "Aṅgulimāla", hi: "अंगुलिमाल" },
    verses: [173],
    theme: { en: "Transformation", hi: "परिवर्तन" },
    summary: {
      en: "A feared bandit chases the Buddha and cannot catch him, stops, and becomes a monk whose goodness lights up the world.",
      hi: "एक भयानक डाकू बुद्ध का पीछा करता है पर उन्हें पकड़ नहीं पाता, रुक जाता है, और ऐसा भिक्षु बनता है जिसकी भलाई संसार को प्रकाशित करती है।",
    },
    paragraphs: [
      {
        en: "Ahiṃsaka, \"the harmless one\", was a gifted student at Takkasilā. Jealous fellow pupils turned his teacher against him, and the teacher, wishing to destroy him, demanded a terrible fee: a thousand human fingers. Ahiṃsaka became a bandit in the forests of Kosala and wore the fingers of his victims on a string, so people called him Aṅgulimāla, \"finger garland\".",
        hi: "अहिंसक, यानी \"जो हिंसा न करे\", तक्षशिला का एक प्रतिभाशाली विद्यार्थी था। ईर्ष्यालु सहपाठियों ने उसके आचार्य को उसके विरुद्ध कर दिया, और आचार्य ने उसे नष्ट करने के लिए एक भयानक गुरु-दक्षिणा माँगी: एक हज़ार मानव उँगलियाँ। अहिंसक कोसल के जंगलों में डाकू बन गया और अपने शिकारों की उँगलियाँ माला में पिरोकर पहनने लगा, इसलिए लोग उसे अंगुलिमाल कहने लगे।",
      },
      {
        en: "One day, needing only one more finger, he saw his own mother coming to find him, and was ready to kill even her. At that moment the Buddha walked onto the path between them. Aṅgulimāla ran after him with all his strength, yet the Buddha, walking at an easy pace, stayed ahead. \"Stop, monk!\" he shouted. \"I have stopped, Aṅgulimāla,\" came the reply. \"You stop too.\"",
        hi: "एक दिन, जब उसे केवल एक और उँगली चाहिए थी, उसने अपनी ही माँ को उसे ढूँढते आते देखा, और उसे भी मारने को तैयार हो गया। उसी क्षण बुद्ध उन दोनों के बीच के रास्ते पर आ गए। अंगुलिमाल पूरी शक्ति से उनके पीछे दौड़ा, फिर भी सहज चाल से चलते बुद्ध आगे ही रहे। वह चिल्लाया, \"रुको, श्रमण!\" उत्तर आया, \"मैं तो रुका हुआ हूँ, अंगुलिमाल। तुम भी रुक जाओ।\"",
      },
      {
        en: "The words reached his heart: the Buddha had stopped harming; he had not. He threw his weapons into a ravine, bowed at the Buddha's feet and asked to become a monk. When King Pasenadi rode out with soldiers to capture the bandit, he found instead a quiet monk with a shaven head.",
        hi: "ये शब्द उसके हृदय तक पहुँच गए: बुद्ध ने हानि पहुँचाना रोक दिया था; उसने नहीं। उसने अपने हथियार खाई में फेंक दिए, बुद्ध के चरणों में झुका और भिक्षु बनने की प्रार्थना की। जब राजा पसेनदि सैनिकों के साथ डाकू को पकड़ने निकले, तो उन्हें मुंडित सिर वाला एक शांत भिक्षु मिला।",
      },
      {
        en: "On alms round people still threw sticks and stones at him, and he came back bleeding. \"Bear it,\" said the Buddha; \"you are meeting now the results of what you did.\" He bore it patiently, practised with all his heart, and became an arahant. When he passed away, the Buddha spoke of him: whoever covers past evil with good lights up the world, like the moon freed from a cloud.",
        hi: "भिक्षा के लिए जाते समय लोग अब भी उस पर डंडे और पत्थर फेंकते, और वह लहूलुहान लौटता। बुद्ध ने कहा, \"इसे सहन करो; तुम अपने किए कर्मों का फल अभी भोग रहे हो।\" उसने धैर्य से सहा, पूरे मन से अभ्यास किया, और अर्हत हो गया। जब उसने देह छोड़ी, तो बुद्ध ने उसके बारे में कहा: जो पहले किए पाप को कुशल से ढक देता है, वह संसार को वैसे ही प्रकाशित करता है जैसे बादल से मुक्त चंद्रमा।",
      },
    ],
    lesson: {
      en: "No one is beyond change. Stopping harm is the first step, and patiently bearing the consequences is part of the healing.",
      hi: "कोई भी परिवर्तन से परे नहीं है। हानि पहुँचाना रोकना पहला कदम है, और परिणामों को धैर्य से सहना उपचार का हिस्सा है।",
    },
    reflection: { en: "What harmful habit could I simply stop today?", hi: "कौन-सी हानिकारक आदत आज बस रोकी जा सकती है?" },
    minutes: 4,
    source: SOURCE([173]),
    review: REVIEW,
  },
  {
    slug: "uttara",
    vatthu: "Uttarāupāsikavatthu",
    title: { pi: "Uttarā", en: "Uttarā and the Boiling Ghee", hi: "उत्तरा और खौलता घी" },
    verses: [223],
    theme: { en: "Overcoming anger", hi: "क्रोध पर विजय" },
    summary: {
      en: "When a jealous woman throws boiling ghee at her, Uttarā meets her with loving-kindness, and the ghee does her no harm.",
      hi: "जब एक ईर्ष्यालु स्त्री उस पर खौलता घी फेंकती है, तो उत्तरा मैत्री से उसका सामना करती है, और घी उसे कोई हानि नहीं पहुँचाता।",
    },
    paragraphs: [
      {
        en: "Uttarā, a devoted follower of the Buddha, was married into a family that did not follow his teaching, and she had no chance to give alms or hear the Dhamma. Her father sent her money, and she hired a courtesan named Sirimā to keep her husband company for fifteen days, so that she herself could serve the Buddha and his monks.",
        hi: "उत्तरा, बुद्ध की एक श्रद्धालु उपासिका, ऐसे परिवार में ब्याही गई जो उनकी शिक्षा नहीं मानता था, और उसे दान देने या धम्म सुनने का अवसर नहीं मिलता था। उसके पिता ने उसे धन भेजा, और उसने सिरिमा नाम की एक गणिका को पंद्रह दिनों के लिए अपने पति का साथ देने को रख लिया, ताकि वह स्वयं बुद्ध और भिक्षुओं की सेवा कर सके।",
      },
      {
        en: "On the last day, as Uttarā worked hot and tired in the kitchen preparing the meal, her husband looked in and smiled at her. Sirimā saw the smile and, forgetting that she was only a guest, burned with jealousy. She took a ladle of boiling ghee and went to pour it over Uttarā's head.",
        hi: "अंतिम दिन, जब उत्तरा रसोई में गर्मी और थकान में भोजन बना रही थी, उसके पति ने झाँककर उसे देखा और मुस्कुराया। सिरिमा ने वह मुस्कान देखी और यह भूलकर कि वह केवल अतिथि है, ईर्ष्या से जल उठी। उसने खौलते घी से भरी करछी उठाई और उत्तरा के सिर पर डालने चली।",
      },
      {
        en: "Uttarā saw her coming. She thought, \"This woman has done me great kindness; because of her I could give alms and hear the Dhamma. If I bear her any anger, let this ghee burn me; if not, let it not.\" She filled her heart with loving-kindness for Sirimā, and the boiling ghee poured over her like cool water.",
        hi: "उत्तरा ने उसे आते देखा। उसने सोचा, \"इस स्त्री ने मुझ पर बड़ा उपकार किया है; इसके कारण मैं दान दे सकी और धम्म सुन सकी। यदि मेरे मन में इसके प्रति ज़रा भी क्रोध हो, तो यह घी मुझे जला दे; न हो, तो न जलाए।\" उसने अपना हृदय सिरिमा के प्रति मैत्री से भर लिया, और खौलता घी उस पर ठंडे पानी की तरह बह गया।",
      },
      {
        en: "The servants seized Sirimā and began to beat her, but Uttarā stopped them, bathed her and soothed her with oil. Sirimā, ashamed, fell at her feet and asked forgiveness. \"Ask it of my father in the Dhamma,\" said Uttarā. The next day Sirimā asked the Buddha's forgiveness, and he spoke the verse: conquer anger with non-anger, evil with good, meanness with giving, and the liar with truth.",
        hi: "नौकरों ने सिरिमा को पकड़कर पीटना शुरू किया, पर उत्तरा ने उन्हें रोका, उसे नहलाया और तेल लगाकर उसे राहत दी। लज्जित सिरिमा उसके पैरों पर गिर पड़ी और क्षमा माँगी। उत्तरा ने कहा, \"धम्म में मेरे पिता से क्षमा माँगो।\" अगले दिन सिरिमा ने बुद्ध से क्षमा माँगी, और उन्होंने गाथा कही: अक्रोध से क्रोध को जीतो, भलाई से बुराई को, दान से कंजूसी को, और सत्य से झूठ बोलने वाले को।",
      },
    ],
    lesson: {
      en: "Meeting anger with loving-kindness protects the one who does it and can transform the one who attacks.",
      hi: "क्रोध का उत्तर मैत्री से देना स्वयं की रक्षा करता है और आक्रमण करने वाले को भी बदल सकता है।",
    },
    reflection: { en: "How might I answer the next harsh word with kindness?", hi: "अगले कठोर शब्द का उत्तर मैत्री से कैसे दिया जा सकता है?" },
    minutes: 3,
    source: SOURCE([223]),
    review: REVIEW,
  },
];

export const getCommentaryStory = (slug: string) => COMMENTARY_STORIES.find((s) => s.slug === slug);

/** The story told for a verse, if it's one of these. */
export const storyForVerse = (n: number) => COMMENTARY_STORIES.find((s) => s.verses.includes(n));

/** Stories with a painting, at /illustrations/dhammapada/{slug}.webp. Filled in as paintings arrive. */
export const COMMENTARY_ART = new Set<string>([]);
export const commentaryArt = (slug: string) => (COMMENTARY_ART.has(slug) ? `/illustrations/dhammapada/${slug}.webp` : null);
