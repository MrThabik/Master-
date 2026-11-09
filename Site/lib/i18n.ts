// Fixed texts of the website in English and Tamil. Edit the Tamil side here if you want other wording.
export const UI = {
  visit: ["Visit website", "இணையதளத்தைப் பார்க்க"],
  visits: ["visits", "பார்வைகள்"],
  live: ["Live preview on hover", "நேரடி முன்னோட்டம்"],
  light: ["Light", "ஒளி"],
  dark: ["Dark", "இருள்"],
  myWebsites: ["My websites", "என் இணையதளங்கள்"],
  noPosts: ["No posts yet.", "இன்னும் பதிவுகள் இல்லை."],
  allPosts: ["← All posts", "← அனைத்து பதிவுகள்"],
  contactTitle: ["Contact", "தொடர்பு கொள்ள"],
  contactIntro: ["Send me a message and I will reply as soon as I can.", "எனக்கு ஒரு செய்தி அனுப்புங்கள்; முடிந்தவரை விரைவில் பதிலளிப்பேன்."],
  name: ["Your name", "உங்கள் பெயர்"],
  emailOpt: ["Email (optional)", "மின்னஞ்சல் (விருப்பம்)"],
  phoneOpt: ["Phone (optional)", "தொலைபேசி (விருப்பம்)"],
  message: ["Message", "செய்தி"],
  send: ["Send message", "செய்தி அனுப்பு"],
  sending: ["Sending…", "அனுப்புகிறது…"],
  thanks: ["Thank you! Your message was sent.", "நன்றி! உங்கள் செய்தி அனுப்பப்பட்டது."],
  failed: ["Could not send. Please try again, or use WhatsApp.", "அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது வாட்ஸ்அப் பயன்படுத்தவும்."],
  busy: ["Too many messages from this device. Please try again later.", "இந்தச் சாதனத்திலிருந்து அதிக செய்திகள். சிறிது நேரம் கழித்து முயற்சிக்கவும்."],
  whatsapp: ["Chat on WhatsApp", "வாட்ஸ்அப்பில் பேசுங்கள்"],
  subscribeTitle: ["Get new posts by email", "புதிய பதிவுகளை மின்னஞ்சலில் பெறுங்கள்"],
  email: ["Your email", "உங்கள் மின்னஞ்சல்"],
  subscribe: ["Subscribe", "சந்தாதாரர் ஆகுங்கள்"],
  subscribed: ["Thank you! You are subscribed.", "நன்றி! நீங்கள் சந்தா செய்துள்ளீர்கள்."],
  subscribeNote: ["Your email is used only to tell you about new posts.", "உங்கள் மின்னஞ்சல் புதிய பதிவுகளைத் தெரிவிக்க மட்டுமே பயன்படுத்தப்படும்."],
  invalidEmail: ["Please enter a valid email.", "சரியான மின்னஞ்சலை உள்ளிடவும்."],
} as const;

// Tamil names for the dock links (used when a link has no Tamil name of its own)
export const NAV_TA: Record<string, string> = {
  "/": "முகப்பு", "/gallery": "படத்தொகுப்பு", "/moodboard": "மூட்-போர்டு", "/blog": "வலைப்பதிவு", "/about": "என்னைப் பற்றி", "/contact": "தொடர்பு",
};
