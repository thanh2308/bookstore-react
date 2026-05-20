/**
 * 🧠 AI Dataset – Knowledge Base (v2 - Improved)
 * Mỗi category: từ khóa riêng biệt, ít overlap nhất có thể
 * Dataset càng "đặc trưng" thì TF-IDF càng chính xác
 */
export const CATEGORY_DOCS = {
    "Kỹ năng sống":
        "tam ly stress buon chan lo lang ap luc tinh than suc khoe tam tri self help phat trien ban than dong luc thoi quen song hanh phuc tu duy chinh phuc muc tieu mindset habit focus vuot qua so hai giao tiep kynanglam goi y cuoc song tot hon cam xuc quan he xa hoi ky nang mem lanh dao tu tin quyet dinh sang tao",

    "Kinh tế":
        "kinh doanh dau tu tai chinh tien giau startup marketing business quan tri quan ly chung khoan bat dong san thu nhap loi nhuan von kinh te chien luoc cong ty thuong mai ke toan ngan hang khoi nghiep ban hang sale thuong hieu brand ngan sach budget phong phap thu nhap thu dong",

    "Thiếu nhi":
        "tre em thieu nhi truyen tranh hoat hinh be con nit hoc sinh tieu hoc mam non choi hoc vui choi sang tao gia dinh dong vat mau sac dao duc tuoi tho fairy tale chuyen co tich",

    "Tiểu thuyết":
        "tieu thuyet truyen fiction novel lang man tinh yeu cam xuc nhan vat cuoc doi phieu luu bi kich hai kich gia dinh thuong tiec nho nhung chuyen tinh lich su the gioi trinh tham kinh di huyen bi",

    "Khoa học":
        "khoa hoc science cong nghe ai artificial intelligence machine learning lap trinh vu tru vat ly hoa hoc sinh hoc robot tu dong hoa may tinh phan mem du lieu tri tue nhan tao thong minh kham pha vu tru hanh tinh bien doi khi hau tien hoa than kinh nao",

    "Văn học Việt Nam":
        "van hoc viet nam truyen ngan tho ca dao tuc ngu tac pham dan gian lich su truyen thong que huong dat nuoc con nguoi van hoa doi song xa hoi chien tranh giai phong thu truong thanh nong thon dong bang"
};

/**
 * 🔄 Synonym map – mở rộng hiểu của AI (v2)
 * Quan trọng: normalize input → từ trong dataset
 */
export const SYNONYMS = {
    // Kỹ năng sống
    "buon": "buon cam xuc",
    "chan": "chan dong luc",
    "lo lang": "lo lang tam ly",
    "lo lắng": "lo lang tam ly",
    "stress": "stress tam ly ap luc",
    "áp lực": "ap luc tam ly",
    "áp": "ap luc",
    "muc tieu": "muc tieu dong luc",
    "hanh phuc": "hanh phuc song",
    "self help": "self help phat trien",
    "ky nang": "ky nang song",
    "thoi quen": "thoi quen habit",
    "giao tiep": "giao tiep ky nang",
    "tu duy": "tu duy mindset",
    "cam xuc": "cam xuc tam ly",
    "ban than": "ban than phat trien",
    "cai thien": "phat trien ban than",
    "cải thiện": "phat trien ban than",

    // Kinh tế
    "tiền": "tien tai chinh",
    "tien": "tien tai chinh",
    "giàu": "giau tai chinh",
    "giau": "giau tai chinh",
    "đầu tư": "dau tu tai chinh kinh doanh",
    "dau tu": "dau tu tai chinh",
    "kiếm tiền": "kiem tien tai chinh",
    "kinh doanh": "kinh doanh startup",
    "khởi nghiệp": "khoi nghiep startup",
    "bán hàng": "ban hang marketing",
    "marketing": "marketing kinh doanh",
    "chứng khoán": "chung khoan dau tu",
    "bat dong san": "bat dong san dau tu",

    // Thiếu nhi
    "trẻ em": "tre em thieu nhi",
    "trẻ": "tre thieu nhi",
    "bé": "be thieu nhi",
    "con cái": "con cai tre em",
    "mầm non": "mam non tre em",
    "tiểu học": "tieu hoc hoc sinh",

    // Tiểu thuyết
    "tình yêu": "tinh yeu tinh cam lang man",
    "yêu": "tinh yeu lang man",
    "lãng mạn": "lang man tinh cam",
    "tinh cam": "tinh cam lang man",
    "phiêu lưu": "phieu luu tieu thuyet",
    "trinh thám": "trinh tham tieu thuyet",
    "bi kịch": "bi kich tieu thuyet",

    // Khoa học
    "công nghệ": "cong nghe khoa hoc",
    "lập trình": "lap trinh cong nghe",
    "máy tính": "may tinh cong nghe",
    "trí tuệ nhân tạo": "tri tue nhan tao ai",
    "ai": "ai tri tue nhan tao",
    "robot": "robot cong nghe",
    "vũ trụ": "vu tru khoa hoc",
    "khoa học": "khoa hoc science",

    // Văn học Việt Nam
    "việt nam": "viet nam van hoc",
    "dân tộc": "dan toc van hoa",
    "quê hương": "que huong viet nam",
    "lịch sử": "lich su viet nam",
    "thơ": "tho van hoc",
    "ca dao": "ca dao van hoc",
    "nông thôn": "nong thon viet nam"
};


