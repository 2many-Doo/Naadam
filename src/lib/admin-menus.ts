export const ADMIN_MENUS = [
  {
    href: "/admin/bokh",
    label: "Бөх",
    desc: "64 бөхийн барилдаан, оноолт",
  },
  {
    href: "/admin/kharvaa",
    label: "Харваа",
    desc: "Сур харвааны тэмцээн",
  },
  {
    href: "/admin/mori",
    label: "Морь",
    desc: "Хурдан морины уралдаан",
  },
  {
    href: "/admin/khos-deel",
    label: "Хос дээл",
    desc: "Хос дээлийн уралдаан",
  },
] as const;

export const ADMIN_GENERAL_MENUS = [
  {
    href: "/admin/hotolbor",
    label: "Хөтөлбөр",
    desc: "Баярын өдрийн цагийн хуваарь",
  },
] as const;

/** Нүүр + admin-ийн анхны хөтөлбөр */
export const DEFAULT_PROGRAM = [
  {
    time: "09:00",
    title: "Нээлтийн ёслол",
    category: "Ёслол",
    location: "Төв тайз",
    owner: "Зохион байгуулах комисс",
    detail: "Сутай Буянт группын 30 жилийн ойн нээлт",
    status: "Төлөвлөсөн",
  },
  {
    time: "10:00",
    title: "Хурдан морины уралдаан",
    category: "Спорт",
    location: "Морин уралдааны зам",
    owner: "Морины комисс",
    detail: "Хурдан морьдын гараа, байрлал зарлах",
    status: "Төлөвлөсөн",
  },
  {
    time: "12:00",
    title: "Сур харваа",
    category: "Спорт",
    location: "Сурын талбай",
    owner: "Харвааны комисс",
    detail: "Уламжлалт сур харвааны тэмцээн эхэлнэ",
    status: "Төлөвлөсөн",
  },
  {
    time: "14:00",
    title: "Бөхийн барилдаан",
    category: "Спорт",
    location: "Бөхийн талбай",
    owner: "Бөхийн комисс",
    detail: "64 бөхийн барилдаан — 1-р даваанаас финал хүртэл",
    status: "Төлөвлөсөн",
  },
  {
    time: "18:00",
    title: "Шагнал гардуулах",
    category: "Ёслол",
    location: "Төв тайз",
    owner: "Зохион байгуулах комисс",
    detail: "Аварга, түрүү, дэд байруудыг зарлана",
    status: "Төлөвлөсөн",
  },
  {
    time: "19:00",
    title: "Хаалтын арга хэмжээ",
    category: "Ёслол",
    location: "Төв тайз",
    owner: "Зохион байгуулах комисс",
    detail: "Баярын концерт, хүндэтгэлийн зоог",
    status: "Төлөвлөсөн",
  },
] as const;
