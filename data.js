// ===== RAMEN MENU DATA =====
const RAMEN_MENU = [
  {
    id: 'samyang',
    name: 'ซัมยัง',
    nameKr: '삼양',
    nameFull: 'Samyang Buldak Bokkeummyeon',
    brand: 'Samyang',
    flavor: 'ไก่เผ็ดย่าง (Buldak)',
    spiceLevel: 4,
    description: 'ราเมนไก่เผ็ดสุดฮิตจากเกาหลี เผ็ดจัดจ้านระดับ 4/5 กลิ่นไก่ย่างหอมเข้มข้น ซอสเคลือบเส้นแน่น เผ็ดนัวถึงใจ ต้นตำรับความเผ็ดที่คนทั่วโลกรู้จัก',
    tags: ['เผ็ดมาก', 'ไก่ย่าง', 'ยอดนิยม'],
    color: '#E84545',
    emoji: '🔥',
    image: 'https://s66122202080-spec.github.io/ramen-app/samyang.jpg',
    imageFallback: 'https://s66122202080-spec.github.io/ramen-app/samyang.jpg'
  },
  {
    id: 'jjajang',
    name: 'จาจัง',
    nameKr: '짜장',
    nameFull: 'Samyang Jjajangmyeon',
    brand: 'Samyang',
    flavor: 'ซอสถั่วดำ (Jjajang)',
    spiceLevel: 0,
    description: 'ไม่เผ็ดเลย! รสชาติเข้มข้นแบบซอสถั่วดำเกาหลีแท้ๆ มัน นัว เค็มกลมกล่อม กลิ่นหอมซอสถั่วดำเคลือบเส้นหนึบ อร่อยแบบไม่ต้องทนเผ็ด',
    tags: ['ไม่เผ็ด', 'ซอสถั่วดำ', 'มันนัว'],
    color: '#3D2B1F',
    emoji: '⚫',
    image: 'https://github.com/s66122202080-spec/ramen-app/blob/main/jajang.jpg?raw=true'"style="width:120px; height:90px;",
    imageFallback: 'https://s66122202080-spec.github.io/ramen-app/jajang.jpg'
  },
  {
    id: 'nongshim',
    name: 'นงชิม',
    nameKr: '농심',
    nameFull: 'Nongshim Shin Ramyun',
    brand: 'Nongshim',
    flavor: 'ซุปเผ็ดเนื้อ (Shin)',
    spiceLevel: 3,
    description: 'คลาสสิกเกาหลีที่ขายดีที่สุดในโลก ซุปเผ็ดเนื้อเข้มข้น มีเห็ดและพริก กลิ่นหอมซุปลึก เผ็ดกลางๆ กินได้ทุกวัน เส้นหนึบนุ่ม',
    tags: ['เผ็ดกลาง', 'ซุปเนื้อ', 'คลาสสิก'],
    color: '#C0392B',
    emoji: '🍖',
    image: 'https://s66122202080-spec.github.io/ramen-app/nongshim.jpg',
    imageFallback: 'https://s66122202080-spec.github.io/ramen-app/nongshim.jpg'
  },
  {
    id: 'yeol',
    name: 'ยอล',
    nameKr: '열라면',
    nameFull: 'Paldo Yeul Ramen',
    brand: 'Paldo',
    flavor: 'ซุปเผ็ดจัด (Yeol)',
    spiceLevel: 5,
    description: 'เผ็ดระดับ 5 เต็มๆ! ซุปเผ็ดร้อนแรงจาก Paldo รสชาติจัดจ้านมาก กลิ่นพริกหอมฉุน ท้าทายทุกคนที่กล้าลอง เส้นนุ่มหนึบ',
    tags: ['เผ็ดสุด!', 'ร้อนแรง', 'ท้าทาย'],
    color: '#E67E22',
    emoji: '🌶️',
    image: 'https://s66122202080-spec.github.io/ramen-app/yeol.jpg',
    imageFallback: 'https://s66122202080-spec.github.io/ramen-app/yeol.jpg'
  },
  {
    id: 'jin',
    name: 'จิน',
    nameKr: '진라면',
    nameFull: 'Ottogi Jin Ramen Mild',
    brand: 'Ottogi',
    flavor: 'ซุปไก่อ่อนๆ (Jin)',
    spiceLevel: 1,
    description: 'เบาๆ ไม่เผ็ด เหมาะสำหรับคนทานเผ็ดไม่ได้ ซุปไก่กระดูกอ่อนๆ หวานนิดๆ กลิ่นหอมสดชื่น กินได้ทุกเพศทุกวัย รสชาติอ่อนโยน',
    tags: ['ไม่เผ็ด', 'ซุปไก่', 'อ่อนโยน'],
    color: '#F39C12',
    emoji: '🍗',
    image: 'https://s66122202080-spec.github.io/ramen-app/jin.jpg',
    imageFallback: 'https://s66122202080-spec.github.io/ramen-app/jin.jpg'
  },
  {
    id: 'kimchi',
    name: 'กิมจิ',
    nameKr: '김치라면',
    nameFull: 'Nongshim Kimchi Ramyun',
    brand: 'Nongshim',
    flavor: 'กิมจิเปรี้ยวเผ็ด',
    spiceLevel: 3,
    description: 'รสชาติกิมจิหมักดองแท้ๆ เปรี้ยวอมเผ็ด ซุปข้นมีกลิ่นกิมจิโดดเด่น อร่อยแบบเกาหลีแท้ๆ ชอบกิมจิห้ามพลาดเด็ดขาด',
    tags: ['กิมจิ', 'เปรี้ยวเผ็ด', 'เกาหลีแท้'],
    color: '#8E44AD',
    emoji: '🥬',
    image: 'https://s66122202080-spec.github.io/ramen-app/kimchi.jpg',
    imageFallback: 'https://s66122202080-spec.github.io/ramen-app/kimchi.jpg'
  }
];

// Spice level display
function getSpiceDisplay(level) {
  const flames = '🌶️'.repeat(level) + '🤍'.repeat(5 - level);
  const labels = ['ไม่เผ็ด', 'อ่อนมาก', 'อ่อน', 'กลาง', 'เผ็ด', 'เผ็ดมาก!'];
  return { flames, label: labels[level] };
}
