/**
 * Terms & Conditions and Privacy Policy text, rendered by /terms and
 * /privacy. The native app mirrors this file exactly (src/lib/legal.ts
 * there) — same sections, same wording, same date — so the two never say
 * different things. If you change the text here, copy it there too.
 *
 * Paragraphs within a section are separated by a blank line ("\n\n").
 */
export interface LegalSection {
  title: string;
  body: string;
}

export const LEGAL_LAST_UPDATED = "29 September 2026";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "1. About WePray and these terms",
    body: "WePray is a platform that brings faith communities together, on the web and in our Android app. These Terms & Conditions apply whenever you use any part of WePray.\n\nBy creating an account or using WePray, you agree to these terms and to our Privacy Policy. If you do not agree, please do not use WePray.",
  },
  {
    title: "2. Who can use WePray",
    body: "You must be at least 13 years old to use WePray. If you are under 18, you may use WePray only with the permission of a parent or legal guardian, who agrees to these terms on your behalf and is responsible for your use of WePray.\n\nThe Matrimonial service is only for adults aged 18 or over who are of legal age to marry where they live.\n\nYou agree to give accurate information, to use only one personal account, and to keep your login details secure. You are responsible for activity on your account.",
  },
  {
    title: "3. Communities",
    body: "Communities are created and run by members. You can be a member of up to 5 communities at a time. Each community's admins and moderators may set their own rules, which you agree to follow alongside these terms.\n\nWe may remove a community, or content in it, that breaks these terms or the law.",
  },
  {
    title: "4. Your content",
    body: "You own what you post on WePray: posts, comments, photos, videos, listings, profiles and fundraisers you share. By posting it, you give WePray a non-exclusive, royalty-free licence to host, store, display, resize and share it as needed to run WePray and show it to the people you share it with.\n\nOnly post content you have the right to share. You are responsible for your content and for any information you choose to make public, such as contact details in a listing.",
  },
  {
    title: "5. Community guidelines",
    body: "Treat every member, and every faith, with respect. You must not post or share content that:\n\n• promotes hatred or violence against any person or group, including on the basis of religion, caste, gender or origin;\n• harasses, threatens, bullies or impersonates anyone;\n• is sexual, obscene, or exploits or endangers children in any way;\n• is false or misleading in a way that could cause harm, including fake fundraisers or listings;\n• is spam, a scam, or illegal, or infringes someone else's rights.",
  },
  {
    title: "6. Moderation, reports and appeals",
    body: "To keep WePray safe, posts, comments, photos, profiles, listings and fundraisers are checked by automated moderation, including AI tools, before other members can see them. Content may be published, held for review by a person, or blocked.\n\nYou can report content that breaks these terms, and you can appeal a moderation decision you believe was wrong. We may remove content and suspend or close accounts that break these terms, including automatically after repeated violations.",
  },
  {
    title: "7. Community services and listings",
    body: "The Matrimonial, Jobs, Events, Businesses, Housing, Education, Health Care and Legal Aid services let members list profiles, offers and services. These are provided by members, not by WePray. We do not verify anyone's identity, qualifications, properties, offers or claims, and we are not a party to any arrangement between members. Please make your own checks before you meet, pay, hire, rent or share personal details.\n\nHealth Care listings are not medical advice. In an emergency, call 108 or 112.\n\nLegal Aid listings are not legal advice. For free legal aid in India, call the NALSA helpline on 15100.",
  },
  {
    title: "8. Donations",
    body: "WePray does not collect, hold or process any money. The Donate tab links to fundraisers and donation platforms run by other organisations, such as Ketto, Milaap and GoFundMe. Any donation you make happens on that platform's own website, under its own terms, fees and receipts.\n\nFundraisers shared by members are reviewed before they appear, but WePray cannot guarantee that a fundraiser is genuine or how its funds are used. Please check a cause before you give, and report anything that looks suspicious.",
  },
  {
    title: "9. Third-party services and links",
    body: "WePray links to, and relies on, services run by others, including donation platforms, Google sign-in and app stores. We are not responsible for their content, availability or practices, which are governed by their own terms and policies.",
  },
  {
    title: "10. Surveys and feedback",
    body: "Surveys and the feedback form are optional. If you send us ideas or suggestions, we may use them to improve WePray without any obligation to you.",
  },
  {
    title: "11. Suspending or deleting your account",
    body: "We may suspend or close accounts that break these terms or put other members at risk. You can delete your account at any time from Settings. Deleting your account removes your profile and the content you created, as described in our Privacy Policy.",
  },
  {
    title: "12. Disclaimers and limitation of liability",
    body: "WePray is provided \"as is\" and \"as available\". We work hard to keep it running and safe, but we cannot promise it will always be available, error-free or secure.\n\nTo the fullest extent permitted by law, WePray is not liable for indirect or consequential losses, or for anything arising from content posted by members, from dealings between members, from listings, or from donations made on other platforms.",
  },
  {
    title: "13. Governing law",
    body: "These terms are governed by the laws of India, and any disputes will be subject to the jurisdiction of the courts in India.",
  },
  {
    title: "14. Changes to these terms",
    body: "We may update these terms as WePray changes. We will show the new date at the top of this page and let you know about significant changes. If you keep using WePray after changes take effect, you accept the updated terms.",
  },
  {
    title: "15. Contact",
    body: "If you have questions about these terms, please use our Contact us form: open Settings and choose Contact us, or go to www.wepray.in/contact. Our team reads every message and replies to the email or phone number you give.",
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "1. About this policy",
    body: "This Privacy Policy explains what personal data WePray collects, why, who we share it with, and the choices and rights you have. It applies to our website, our web app and our Android app.",
  },
  {
    title: "2. Information you give us",
    body: "• Account details: your phone number, or your name and email if you sign in with Google.\n• Profile: your name, username, photo, bio, date of birth, gender, and city and state.\n• Communities: the communities you join or create. Because communities on WePray are faith communities, your memberships can show your religious beliefs. You choose which communities to join.\n• What you post: posts, comments, likes, photos, videos, event and service listings (including any contact details you add), and fundraisers you share.\n• Matrimonial profile, if you create one: details such as date, time and place of birth, education, occupation, income range, marital status and photos, and your messages with other members.\n• Surveys, feedback and messages: your survey answers, anything you send through the Contact us form, and your name and contact details only if you choose to give them.",
  },
  {
    title: "3. Information collected automatically",
    body: "• Technical data needed to run WePray, such as your device and browser type, and your IP address. For the feedback form, we store only a scrambled (hashed) form of your IP address, to prevent spam.\n• A notification token, if you allow push notifications in the Android app.\n• Cookies: we use essential cookies to keep you signed in. Our public pages (the home page and feedback survey) also use Google Analytics, which sets cookies and collects information such as the pages you visit, your device and your approximate location, to help us understand how people find WePray. The app itself, including everything you do after signing in, is not tracked by Google Analytics.",
  },
  {
    title: "4. How we use your information",
    body: "We use your information to run WePray: to sign you in, show your profile and content to the people you share it with, connect you with your communities, send notifications, and keep WePray safe through moderation and by preventing spam, fraud and abuse. We also use survey answers, feedback and analytics to improve WePray, and we use data where the law requires us to.",
  },
  {
    title: "5. Content moderation",
    body: "Before your posts, comments, photos, profiles, listings and fundraisers are shown to others, their text and images are checked by an automated moderation service (currently provided by OpenAI). Text may first be translated into English for this check. We keep a record of each moderation decision, and our team may review content that is held or reported.",
  },
  {
    title: "6. What other members can see",
    body: "WePray is a community platform, so other members can see your profile, your posts and comments, the communities you belong to, and any listings or fundraisers you share, including contact details you choose to add. Your Matrimonial profile is visible to other members using the Matrimonial service. Please don't share anything you don't want others to see.",
  },
  {
    title: "7. Who we share information with",
    body: "We do not sell your personal data. We share it only with service providers who help us run WePray, and only as needed for that purpose:\n\n• Supabase, for our database, sign-in and one-time login codes (sent by SMS through its SMS provider);\n• Cloudinary, to store and deliver photos and videos;\n• Netlify, to host our website;\n• OpenAI, to moderate content;\n• Google, for Google sign-in and, on public pages, Google Analytics;\n• Expo, to deliver push notifications to the Android app.\n\nSome of these providers may process data outside India. We may also share information if the law requires it, or to protect the safety of our members.\n\nWhen you open a fundraiser or donation platform, you leave WePray, and that platform's own privacy policy applies.",
  },
  {
    title: "8. Children",
    body: "WePray is for people aged 13 and over. If you are under 18, you may use WePray only with the consent of a parent or legal guardian. We do not knowingly collect data from children under 13; if we learn that we have, we will delete it. The Matrimonial service is for adults aged 18 and over only.\n\nA parent or guardian who has questions about a child's account, or wants it deleted, can use our Contact us form and choose \"Parent or guardian request\".",
  },
  {
    title: "9. How long we keep your information",
    body: "We keep your information while your account is active. When you delete your account from Settings, we delete your profile and the content you created, including posts, comments, likes, listings, fundraisers, your Matrimonial profile and messages, notifications and moderation records.\n\nCommunities you created stay on WePray without you listed as the creator, and feedback survey answers are kept without being linked to you. Uploaded photo and video files, and backups, may take longer to be removed from our storage. We may keep limited information where the law requires it.",
  },
  {
    title: "10. Security",
    body: "We use reasonable safeguards to protect your data, including encrypted connections and access controls that limit who can see what. No system is completely secure, so please keep your login details private and let us know if you notice anything suspicious.",
  },
  {
    title: "11. Your rights",
    body: "Under India's Digital Personal Data Protection Act, 2023, and other applicable laws, you can ask to access, correct or delete your personal data, withdraw your consent, and nominate someone to exercise your rights if you are unable to. You can edit your profile at any time and delete your account from Settings.\n\nTo make a request, or if you have a concern, use our Contact us form and choose \"Privacy or data request\". If we cannot resolve your concern, you may complain to the Data Protection Board of India.",
  },
  {
    title: "12. Changes to this policy",
    body: "We may update this policy as WePray changes. We will show the new date at the top of this page and let you know about significant changes.",
  },
  {
    title: "13. Contact",
    body: "If you have questions about this policy or your personal data, please use our Contact us form: open Settings and choose Contact us (or Privacy or data request), or go to www.wepray.in/contact. We use the details you give there only to reply to you.",
  },
];
