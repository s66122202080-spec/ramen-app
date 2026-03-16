// ===== RAMEN MENU DATA =====
const RAMEN_MENU = [
  {
    id: 'samyang',
    name: 'ซัมยัง',
    nameKr: '삼양',
    nameFull: 'Samyang Buldak',
    brand: 'Samyang',
    flavor: 'ไก่เผ็ดย่าง (Buldak)',
    spiceLevel: 4,
    description: 'ราเมนไก่เผ็ดสุดฮิต เผ็ดจัดจ้านระดับ 4/5 กลิ่นไก่ย่างหอมเข้มข้น ซอสเคลือบเส้นแน่น เผ็ดนัวถึงใจ ต้นตำรับความเผ็ดจากเกาหลี',
    tags: ['เผ็ดมาก', 'ไก่', 'ยอดนิยม'],
    color: '#E84545',
    emoji: '🔥',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Samyang_Buldak_Bokkeummyeon.jpg/800px-Samyang_Buldak_Bokkeummyeon.jpg',
    imageFallback: 'https://m.media-amazon.com/images/I/81FaKDFYHVL._SL1500_.jpg'
  },
  {
    id: 'jjajang',
    name: 'จาจัง',
    nameKr: '짜장',
    nameFull: 'Jjajang ',
    brand: 'JJajang',
    flavor: 'ซอสถั่วดำ',
    spiceLevel: 0,
    description: 'ไม่เผ็ดเลย! รสชาติเข้มข้นแบบซอสถั่วดำเกาหลีแท้ๆ มัน นัว เค็มกลมกล่อม กลิ่นหอมซอสถั่วดำเคลือบเส้นหนึบ อร่อยแบบไม่ต้องทนเผ็ด',
    tags: ['ไม่เผ็ด', 'ซอสถั่วดำ', 'อร่อย'],
    color: '#2D2D2D',
    emoji: '⚫',
    image: 'https://m.media-amazon.com/images/I/71hF5zzTBKL._SL1500_.jpg',
    imageFallback: 'https://www.samyangfoods.com/upload/product/img/jjajangbuldak.jpg'
  },
  {
    id: 'nongshim',
    name: 'นงชิม',
    nameKr: '농심',
    nameFull: 'Nongshim Shin Ramyun',
    brand: 'Nongshim',
    flavor: 'ซุปเผ็ดเนื้อ (Shin)',
    spiceLevel: 3,
    description: 'คลาสสิกเกาหลีแท้ ซุปเผ็ดเนื้อเข้มข้น มีเห็ดและพริก กลิ่นหอมซุปลึก เผ็ดกลางๆ กินได้ทุกวัน ต้มง่าย เส้นหนึบนุ่ม',
    tags: ['เผ็ดกลาง', 'ซุปเนื้อ', 'คลาสสิก'],
    color: '#C0392B',
    emoji: '🍖',
    image: 'https://m.media-amazon.com/images/I/81+u8PTCPHL._SL1500_.jpg',
    imageFallback: 'https://nongshimusa.com/wp-content/uploads/2021/11/Shin-Ramyun-Pack.jpg'
  },
  {
    id: 'yeol',
    name: 'ยอล',
    nameKr: '열',
    nameFull: 'Nongshim Neoguri Spicy',
    brand: 'Nongshim',
    flavor: 'ทะเลเผ็ดจัด (Yeol)',
    spiceLevel: 5,
    description: 'เผ็ดระดับ 5 เต็มๆ! ซุปทะเลเข้มข้น กลิ่นหอมอาหารทะเล รสเผ็ดจี๊ดจ้าน ท้าทายทุกคนที่กล้ากิน เส้นอุด้งหนาเหนียวนุ่ม',
    tags: ['เผ็ดสุด!', 'ทะเล', 'ท้าทาย'],
    color: '#E67E22',
    emoji: '🌊',
    image: 'https://m.media-amazon.com/images/I/71KkGDiXjCL._SL1500_.jpg',
    imageFallback: 'https://images-na.ssl-images-amazon.com/images/I/81g4WPDl7SL.jpg'
  },
  {
    id: 'jin',
    name: 'จิน',
    nameKr: '진',
    nameFull: 'Ottogi Jin Ramen Mild',
    brand: 'Ottogi',
    flavor: 'ซุปไก่กระดูก (Jin)',
    spiceLevel: 1,
    description: 'เบาๆ ไม่เผ็ด เหมาะสำหรับคนทานเผ็ดไม่ได้ ซุปไก่กระดูกอ่อนๆ หวานนิดๆ กลิ่นหอมสดชื่น กินได้ทุกเพศทุกวัย',
    tags: ['ไม่เผ็ด', 'ซุปไก่', 'อ่อนโยน'],
    color: '#F39C12',
    emoji: '🍗',
    image: 'https://m.media-amazon.com/images/I/71ECyLTvI5L._SL1500_.jpg',
    imageFallback: 'https://images-na.ssl-images-amazon.com/images/I/71ECyLTvI5L.jpg'
  },
  {
    id: 'kimchi',
    name: 'กิมจิ',
    nameKr: '김치',
    nameFull: 'Nongshim Kimchi Ramyun',
    brand: 'Nongshim',
    flavor: 'กิมจิเปรี้ยวเผ็ด',
    spiceLevel: 3,
    description: 'รสชาติกิมจิหมักดองแท้ๆ เปรี้ยวอมเผ็ด ซุปข้นมีกลิ่นกิมจิโดดเด่น รู้สึกอร่อยแบบเกาหลีแท้ๆ ชอบกิมจิห้ามพลาด',
    tags: ['กิมจิ', 'เปรี้ยวเผ็ด', 'เกาหลีแท้'],
    color: '#8E44AD',
    emoji: '🥬',
    image: 'https://m.media-amazon.com/images/I/81kWfm0+X3L._SL1500_.jpg',
    imageFallback: 'https://images-na.ssl-images-amazon.com/images/I/81kWfm0+X3L.jpg'
  }
];

// Spice level display
function getSpiceDisplay(level) {
  const flames = '🌶️'.repeat(level) + '🤍'.repeat(5 - level);
  const labels = ['', 'อ่อนมาก', 'อ่อน', 'กลาง', 'เผ็ด', 'เผ็ดมาก!'];
  return { flames, label: labels[level] };
}
