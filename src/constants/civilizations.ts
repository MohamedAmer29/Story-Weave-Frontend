/**
 * Central, data-driven civilization registry (mirrors the backend
 * civilizations.constants). The backend stores these stable enum values and
 * returns the same list from GET /stories/meta/civilizations.
 */
export type CivilizationKind =
  | "specific"
  | "other"
  | "custom"
  | "unspecified";

export interface CivilizationOption {
  value: StoryCivilization;
  label: string;
  kind: CivilizationKind;
}

export interface CivilizationRegionGroup {
  id: string;
  options: CivilizationOption[];
}

export const CIVILIZATION_REGION_IDS = ["Unspecified","Africa","Middle East & Ancient Near East","Mediterranean & Classical","Europe","South Asia","East Asia","Southeast Asia","Central Asia","North America","Mesoamerica","South America","Oceania","Religious-Historical","Modern Regional","Fantasy","Other","Custom"] as const;

export const CIVILIZATIONS_BY_REGION: CivilizationRegionGroup[] = [
  {
    id: "Unspecified",
    options: [
    { value: "UNSPECIFIED", label: "Unspecified", kind: "unspecified" },
    ],
  },
  {
    id: "Africa",
    options: [
    { value: "ANCIENT_EGYPTIAN", label: "Ancient Egyptian", kind: "specific" },
    { value: "EGYPTIAN", label: "Egyptian", kind: "specific" },
    { value: "NUBIAN", label: "Nubian", kind: "specific" },
    { value: "KUSHITE", label: "Kushite", kind: "specific" },
    { value: "MEROITIC", label: "Meroitic", kind: "specific" },
    { value: "AXUMITE", label: "Axumite", kind: "specific" },
    { value: "ETHIOPIAN", label: "Ethiopian", kind: "specific" },
    { value: "SOMALI", label: "Somali", kind: "specific" },
    { value: "BERBER_AMAZIGH", label: "Berber / Amazigh", kind: "specific" },
    { value: "CARTHAGINIAN", label: "Carthaginian", kind: "specific" },
    { value: "ANCIENT_NORTH_AFRICAN", label: "Ancient North African", kind: "specific" },
    { value: "WEST_AFRICAN", label: "West African", kind: "specific" },
    { value: "GHANA_EMPIRE", label: "Ghana Empire", kind: "specific" },
    { value: "MALI_EMPIRE", label: "Mali Empire", kind: "specific" },
    { value: "SONGHAI_EMPIRE", label: "Songhai Empire", kind: "specific" },
    { value: "YORUBA", label: "Yoruba", kind: "specific" },
    { value: "IGBO", label: "Igbo", kind: "specific" },
    { value: "HAUSA", label: "Hausa", kind: "specific" },
    { value: "BENIN_KINGDOM", label: "Benin Kingdom", kind: "specific" },
    { value: "ASHANTI", label: "Ashanti", kind: "specific" },
    { value: "KONGO", label: "Kongo", kind: "specific" },
    { value: "GREAT_ZIMBABWE", label: "Great Zimbabwe", kind: "specific" },
    { value: "SWAHILI_COAST", label: "Swahili Coast", kind: "specific" },
    { value: "ZULU", label: "Zulu", kind: "specific" },
    { value: "XHOSA", label: "Xhosa", kind: "specific" },
    { value: "MAASAI", label: "Maasai", kind: "specific" },
    { value: "TUAREG", label: "Tuareg", kind: "specific" },
    { value: "OTHER_AFRICAN", label: "Other African", kind: "other" },
    { value: "CUSTOM_AFRICAN_CIVILIZATION", label: "Custom African Civilization", kind: "custom" },
    ],
  },
  {
    id: "Middle East & Ancient Near East",
    options: [
    { value: "ARABIC", label: "Arabic", kind: "specific" },
    { value: "SUMERIAN", label: "Sumerian", kind: "specific" },
    { value: "AKKADIAN", label: "Akkadian", kind: "specific" },
    { value: "BABYLONIAN", label: "Babylonian", kind: "specific" },
    { value: "ASSYRIAN", label: "Assyrian", kind: "specific" },
    { value: "PERSIAN", label: "Persian", kind: "specific" },
    { value: "ACHAEMENID_PERSIAN", label: "Achaemenid Persian", kind: "specific" },
    { value: "SASANIAN_PERSIAN", label: "Sasanian Persian", kind: "specific" },
    { value: "MEDIAN", label: "Median", kind: "specific" },
    { value: "ELAMITE", label: "Elamite", kind: "specific" },
    { value: "HITTITE", label: "Hittite", kind: "specific" },
    { value: "PHOENICIAN", label: "Phoenician", kind: "specific" },
    { value: "CANAANITE", label: "Canaanite", kind: "specific" },
    { value: "ANCIENT_LEVANTINE", label: "Ancient Levantine", kind: "specific" },
    { value: "ARAMAEAN", label: "Aramaean", kind: "specific" },
    { value: "NABATAEAN", label: "Nabataean", kind: "specific" },
    { value: "UGARITIC", label: "Ugaritic", kind: "specific" },
    { value: "MESOPOTAMIAN", label: "Mesopotamian", kind: "specific" },
    { value: "ARABIAN", label: "Arabian", kind: "specific" },
    { value: "PRE_ISLAMIC_ARABIAN", label: "Pre-Islamic Arabian", kind: "specific" },
    { value: "ISLAMIC_ARABIAN", label: "Islamic Arabian", kind: "specific" },
    { value: "ABBASID", label: "Abbasid", kind: "specific" },
    { value: "UMAYYAD", label: "Umayyad", kind: "specific" },
    { value: "FATIMID", label: "Fatimid", kind: "specific" },
    { value: "MAMLUK", label: "Mamluk", kind: "specific" },
    { value: "OTTOMAN", label: "Ottoman", kind: "specific" },
    { value: "LEVANTINE", label: "Levantine", kind: "specific" },
    { value: "KURDISH", label: "Kurdish", kind: "specific" },
    { value: "ARMENIAN", label: "Armenian", kind: "specific" },
    { value: "GEORGIAN", label: "Georgian", kind: "specific" },
    { value: "MESOPOTAMIAN_ARAB", label: "Mesopotamian Arab", kind: "specific" },
    { value: "OTHER_MIDDLE_EASTERN", label: "Other Middle Eastern", kind: "other" },
    { value: "CUSTOM_MIDDLE_EASTERN_CIVILIZATION", label: "Custom Middle Eastern Civilization", kind: "custom" },
    ],
  },
  {
    id: "Mediterranean & Classical",
    options: [
    { value: "ANCIENT_GREEK", label: "Ancient Greek", kind: "specific" },
    { value: "GREEK", label: "Greek", kind: "specific" },
    { value: "ROMAN", label: "Roman", kind: "specific" },
    { value: "MYCENAEAN_GREEK", label: "Mycenaean Greek", kind: "specific" },
    { value: "MINOAN", label: "Minoan", kind: "specific" },
    { value: "CLASSICAL_GREEK", label: "Classical Greek", kind: "specific" },
    { value: "HELLENISTIC", label: "Hellenistic", kind: "specific" },
    { value: "SPARTAN", label: "Spartan", kind: "specific" },
    { value: "ATHENIAN", label: "Athenian", kind: "specific" },
    { value: "MACEDONIAN", label: "Macedonian", kind: "specific" },
    { value: "ANCIENT_ROMAN", label: "Ancient Roman", kind: "specific" },
    { value: "ROMAN_REPUBLIC", label: "Roman Republic", kind: "specific" },
    { value: "ROMAN_EMPIRE", label: "Roman Empire", kind: "specific" },
    { value: "BYZANTINE", label: "Byzantine", kind: "specific" },
    { value: "ETRUSCAN", label: "Etruscan", kind: "specific" },
    { value: "ILLYRIAN", label: "Illyrian", kind: "specific" },
    { value: "THRACIAN", label: "Thracian", kind: "specific" },
    { value: "DACIAN", label: "Dacian", kind: "specific" },
    { value: "CELTIC", label: "Celtic", kind: "specific" },
    { value: "PHOENICIAN_MEDITERRANEAN", label: "Phoenician Mediterranean", kind: "specific" },
    { value: "OTHER_MEDITERRANEAN", label: "Other Mediterranean", kind: "other" },
    { value: "CUSTOM_MEDITERRANEAN_CIVILIZATION", label: "Custom Mediterranean Civilization", kind: "custom" },
    ],
  },
  {
    id: "Europe",
    options: [
    { value: "ANGLO_SAXON", label: "Anglo-Saxon", kind: "specific" },
    { value: "VIKING_NORSE", label: "Viking / Norse", kind: "specific" },
    { value: "MEDIEVAL_ENGLISH", label: "Medieval English", kind: "specific" },
    { value: "MEDIEVAL_FRENCH", label: "Medieval French", kind: "specific" },
    { value: "MEDIEVAL_GERMANIC", label: "Medieval Germanic", kind: "specific" },
    { value: "MEDIEVAL_SPANISH", label: "Medieval Spanish", kind: "specific" },
    { value: "MEDIEVAL_PORTUGUESE", label: "Medieval Portuguese", kind: "specific" },
    { value: "MEDIEVAL_ITALIAN", label: "Medieval Italian", kind: "specific" },
    { value: "MEDIEVAL_SCANDINAVIAN", label: "Medieval Scandinavian", kind: "specific" },
    { value: "MEDIEVAL_SLAVIC", label: "Medieval Slavic", kind: "specific" },
    { value: "RUSSIAN", label: "Russian", kind: "specific" },
    { value: "KIEVAN_RUS", label: "Kievan Rus", kind: "specific" },
    { value: "POLISH", label: "Polish", kind: "specific" },
    { value: "BOHEMIAN", label: "Bohemian", kind: "specific" },
    { value: "HUNGARIAN", label: "Hungarian", kind: "specific" },
    { value: "BALKAN", label: "Balkan", kind: "specific" },
    { value: "VENETIAN", label: "Venetian", kind: "specific" },
    { value: "RENAISSANCE_ITALIAN", label: "Renaissance Italian", kind: "specific" },
    { value: "RENAISSANCE_EUROPEAN", label: "Renaissance European", kind: "specific" },
    { value: "VICTORIAN_BRITISH", label: "Victorian British", kind: "specific" },
    { value: "GEORGIAN_BRITISH", label: "Georgian British", kind: "specific" },
    { value: "EDWARDIAN_BRITISH", label: "Edwardian British", kind: "specific" },
    { value: "OTHER_EUROPEAN", label: "Other European", kind: "other" },
    { value: "CUSTOM_EUROPEAN_CIVILIZATION", label: "Custom European Civilization", kind: "custom" },
    ],
  },
  {
    id: "South Asia",
    options: [
    { value: "INDUS_VALLEY", label: "Indus Valley", kind: "specific" },
    { value: "VEDIC", label: "Vedic", kind: "specific" },
    { value: "ANCIENT_INDIAN", label: "Ancient Indian", kind: "specific" },
    { value: "MAURYAN", label: "Mauryan", kind: "specific" },
    { value: "GUPTA", label: "Gupta", kind: "specific" },
    { value: "CHOLA", label: "Chola", kind: "specific" },
    { value: "PALLAVA", label: "Pallava", kind: "specific" },
    { value: "MUGHAL", label: "Mughal", kind: "specific" },
    { value: "RAJPUT", label: "Rajput", kind: "specific" },
    { value: "MARATHA", label: "Maratha", kind: "specific" },
    { value: "VIJAYANAGARA", label: "Vijayanagara", kind: "specific" },
    { value: "BENGALI", label: "Bengali", kind: "specific" },
    { value: "PUNJABI", label: "Punjabi", kind: "specific" },
    { value: "TAMIL", label: "Tamil", kind: "specific" },
    { value: "TELUGU", label: "Telugu", kind: "specific" },
    { value: "SINHALA", label: "Sinhala", kind: "specific" },
    { value: "NEPALESE", label: "Nepalese", kind: "specific" },
    { value: "TIBETAN", label: "Tibetan", kind: "specific" },
    { value: "KASHMIRI", label: "Kashmiri", kind: "specific" },
    { value: "INDO_ISLAMIC", label: "Indo-Islamic", kind: "specific" },
    { value: "OTHER_SOUTH_ASIAN", label: "Other South Asian", kind: "other" },
    { value: "CUSTOM_SOUTH_ASIAN_CIVILIZATION", label: "Custom South Asian Civilization", kind: "custom" },
    ],
  },
  {
    id: "East Asia",
    options: [
    { value: "ANCIENT_CHINESE", label: "Ancient Chinese", kind: "specific" },
    { value: "SHANG", label: "Shang", kind: "specific" },
    { value: "ZHOU", label: "Zhou", kind: "specific" },
    { value: "QIN", label: "Qin", kind: "specific" },
    { value: "HAN", label: "Han", kind: "specific" },
    { value: "THREE_KINGDOMS_CHINA", label: "Three Kingdoms China", kind: "specific" },
    { value: "TANG", label: "Tang", kind: "specific" },
    { value: "SONG", label: "Song", kind: "specific" },
    { value: "YUAN", label: "Yuan", kind: "specific" },
    { value: "MING", label: "Ming", kind: "specific" },
    { value: "QING", label: "Qing", kind: "specific" },
    { value: "IMPERIAL_CHINESE", label: "Imperial Chinese", kind: "specific" },
    { value: "ANCIENT_JAPANESE", label: "Ancient Japanese", kind: "specific" },
    { value: "HEIAN_JAPANESE", label: "Heian Japanese", kind: "specific" },
    { value: "KAMAKURA_JAPANESE", label: "Kamakura Japanese", kind: "specific" },
    { value: "MUROMACHI_JAPANESE", label: "Muromachi Japanese", kind: "specific" },
    { value: "EDO_JAPANESE", label: "Edo Japanese", kind: "specific" },
    { value: "SAMURAI_JAPAN", label: "Samurai Japan", kind: "specific" },
    { value: "ANCIENT_KOREAN", label: "Ancient Korean", kind: "specific" },
    { value: "GOGURYEO", label: "Goguryeo", kind: "specific" },
    { value: "BAEKJE", label: "Baekje", kind: "specific" },
    { value: "SILLA", label: "Silla", kind: "specific" },
    { value: "GORYEO", label: "Goryeo", kind: "specific" },
    { value: "JOSEON", label: "Joseon", kind: "specific" },
    { value: "MONGOLIAN", label: "Mongolian", kind: "specific" },
    { value: "MANCHU", label: "Manchu", kind: "specific" },
    { value: "OTHER_EAST_ASIAN", label: "Other East Asian", kind: "other" },
    { value: "CUSTOM_EAST_ASIAN_CIVILIZATION", label: "Custom East Asian Civilization", kind: "custom" },
    ],
  },
  {
    id: "Southeast Asia",
    options: [
    { value: "KHMER", label: "Khmer", kind: "specific" },
    { value: "ANGKOR", label: "Angkor", kind: "specific" },
    { value: "SRIVIJAYA", label: "Srivijaya", kind: "specific" },
    { value: "MAJAPAHIT", label: "Majapahit", kind: "specific" },
    { value: "CHAMPA", label: "Champa", kind: "specific" },
    { value: "PAGAN_BAGAN", label: "Pagan / Bagan", kind: "specific" },
    { value: "BURMESE", label: "Burmese", kind: "specific" },
    { value: "THAI_SIAMESE", label: "Thai / Siamese", kind: "specific" },
    { value: "AYUTTHAYA", label: "Ayutthaya", kind: "specific" },
    { value: "VIETNAMESE", label: "Vietnamese", kind: "specific" },
    { value: "DAI_VIET", label: "Dai Viet", kind: "specific" },
    { value: "MALAY", label: "Malay", kind: "specific" },
    { value: "INDONESIAN", label: "Indonesian", kind: "specific" },
    { value: "JAVANESE", label: "Javanese", kind: "specific" },
    { value: "BALINESE", label: "Balinese", kind: "specific" },
    { value: "FILIPINO_PRECOLONIAL_PHILIPPINE", label: "Filipino / Precolonial Philippine", kind: "specific" },
    { value: "LAO", label: "Lao", kind: "specific" },
    { value: "CAMBODIAN", label: "Cambodian", kind: "specific" },
    { value: "OTHER_SOUTHEAST_ASIAN", label: "Other Southeast Asian", kind: "other" },
    { value: "CUSTOM_SOUTHEAST_ASIAN_CIVILIZATION", label: "Custom Southeast Asian Civilization", kind: "custom" },
    ],
  },
  {
    id: "Central Asia",
    options: [
    { value: "SCYTHIAN", label: "Scythian", kind: "specific" },
    { value: "SARMATIAN", label: "Sarmatian", kind: "specific" },
    { value: "HUNNIC", label: "Hunnic", kind: "specific" },
    { value: "TURKIC", label: "Turkic", kind: "specific" },
    { value: "GOKTURK", label: "Göktürk", kind: "specific" },
    { value: "MONGOL", label: "Mongol", kind: "specific" },
    { value: "MONGOL_EMPIRE", label: "Mongol Empire", kind: "specific" },
    { value: "TIMURID", label: "Timurid", kind: "specific" },
    { value: "UZBEK", label: "Uzbek", kind: "specific" },
    { value: "KAZAKH", label: "Kazakh", kind: "specific" },
    { value: "KYRGYZ", label: "Kyrgyz", kind: "specific" },
    { value: "UYGHUR", label: "Uyghur", kind: "specific" },
    { value: "PERSIANATE_CENTRAL_ASIAN", label: "Persianate Central Asian", kind: "specific" },
    { value: "SILK_ROAD", label: "Silk Road", kind: "specific" },
    { value: "OTHER_CENTRAL_ASIAN", label: "Other Central Asian", kind: "other" },
    { value: "CUSTOM_CENTRAL_ASIAN_CIVILIZATION", label: "Custom Central Asian Civilization", kind: "custom" },
    ],
  },
  {
    id: "North America",
    options: [
    { value: "INUIT", label: "Inuit", kind: "specific" },
    { value: "YUPIK", label: "Yupik", kind: "specific" },
    { value: "HAIDA", label: "Haida", kind: "specific" },
    { value: "TLINGIT", label: "Tlingit", kind: "specific" },
    { value: "IROQUOIS_HAUDENOSAUNEE", label: "Iroquois / Haudenosaunee", kind: "specific" },
    { value: "CHEROKEE", label: "Cherokee", kind: "specific" },
    { value: "CHOCTAW", label: "Choctaw", kind: "specific" },
    { value: "LAKOTA", label: "Lakota", kind: "specific" },
    { value: "SIOUX", label: "Sioux", kind: "specific" },
    { value: "NAVAJO_DINE", label: "Navajo / Diné", kind: "specific" },
    { value: "HOPI", label: "Hopi", kind: "specific" },
    { value: "PUEBLO", label: "Pueblo", kind: "specific" },
    { value: "MISSISSIPPIAN", label: "Mississippian", kind: "specific" },
    { value: "ANCESTRAL_PUEBLOAN", label: "Ancestral Puebloan", kind: "specific" },
    { value: "PACIFIC_NORTHWEST_INDIGENOUS", label: "Pacific Northwest Indigenous", kind: "specific" },
    { value: "GREAT_PLAINS_INDIGENOUS", label: "Great Plains Indigenous", kind: "specific" },
    { value: "WOODLAND_INDIGENOUS", label: "Woodland Indigenous", kind: "specific" },
    { value: "OTHER_INDIGENOUS_NORTH_AMERICAN", label: "Other Indigenous North American", kind: "other" },
    { value: "CUSTOM_INDIGENOUS_NORTH_AMERICAN", label: "Custom Indigenous North American", kind: "custom" },
    ],
  },
  {
    id: "Mesoamerica",
    options: [
    { value: "OLMEC", label: "Olmec", kind: "specific" },
    { value: "MAYA", label: "Maya", kind: "specific" },
    { value: "AZTEC_MEXICA", label: "Aztec / Mexica", kind: "specific" },
    { value: "TOLTEC", label: "Toltec", kind: "specific" },
    { value: "TEOTIHUACAN", label: "Teotihuacan", kind: "specific" },
    { value: "ZAPOTEC", label: "Zapotec", kind: "specific" },
    { value: "MIXTEC", label: "Mixtec", kind: "specific" },
    { value: "TARASCAN_PUREPECHA", label: "Tarascan / Purépecha", kind: "specific" },
    { value: "MESOAMERICAN", label: "Mesoamerican", kind: "specific" },
    { value: "OTHER_MESOAMERICAN", label: "Other Mesoamerican", kind: "other" },
    { value: "CUSTOM_MESOAMERICAN_CIVILIZATION", label: "Custom Mesoamerican Civilization", kind: "custom" },
    ],
  },
  {
    id: "South America",
    options: [
    { value: "INCA", label: "Inca", kind: "specific" },
    { value: "MOCHE", label: "Moche", kind: "specific" },
    { value: "NAZCA", label: "Nazca", kind: "specific" },
    { value: "CHIMU", label: "Chimú", kind: "specific" },
    { value: "TIWANAKU", label: "Tiwanaku", kind: "specific" },
    { value: "WARI", label: "Wari", kind: "specific" },
    { value: "MAPUCHE", label: "Mapuche", kind: "specific" },
    { value: "ARAWAK", label: "Arawak", kind: "specific" },
    { value: "TUPI", label: "Tupi", kind: "specific" },
    { value: "GUARANI", label: "Guarani", kind: "specific" },
    { value: "ANDEAN", label: "Andean", kind: "specific" },
    { value: "AMAZONIAN_INDIGENOUS", label: "Amazonian Indigenous", kind: "specific" },
    { value: "OTHER_SOUTH_AMERICAN_INDIGENOUS", label: "Other South American Indigenous", kind: "other" },
    { value: "CUSTOM_SOUTH_AMERICAN_CIVILIZATION", label: "Custom South American Civilization", kind: "custom" },
    ],
  },
  {
    id: "Oceania",
    options: [
    { value: "POLYNESIAN", label: "Polynesian", kind: "specific" },
    { value: "MAORI", label: "Māori", kind: "specific" },
    { value: "HAWAIIAN", label: "Hawaiian", kind: "specific" },
    { value: "SAMOAN", label: "Samoan", kind: "specific" },
    { value: "TONGAN", label: "Tongan", kind: "specific" },
    { value: "TAHITIAN", label: "Tahitian", kind: "specific" },
    { value: "MICRONESIAN", label: "Micronesian", kind: "specific" },
    { value: "MELANESIAN", label: "Melanesian", kind: "specific" },
    { value: "ABORIGINAL_AUSTRALIAN", label: "Aboriginal Australian", kind: "specific" },
    { value: "OTHER_PACIFIC_ISLANDER", label: "Other Pacific Islander", kind: "other" },
    { value: "CUSTOM_OCEANIAN_CIVILIZATION", label: "Custom Oceanian Civilization", kind: "custom" },
    ],
  },
  {
    id: "Religious-Historical",
    options: [
    { value: "EARLY_ISLAMIC", label: "Early Islamic", kind: "specific" },
    { value: "MEDIEVAL_ISLAMIC", label: "Medieval Islamic", kind: "specific" },
    { value: "EARLY_CHRISTIAN", label: "Early Christian", kind: "specific" },
    { value: "MEDIEVAL_CHRISTIAN_EUROPE", label: "Medieval Christian Europe", kind: "specific" },
    { value: "BYZANTINE_CHRISTIAN", label: "Byzantine Christian", kind: "specific" },
    { value: "ANCIENT_JEWISH_ISRAELITE", label: "Ancient Jewish / Israelite", kind: "specific" },
    { value: "SECOND_TEMPLE_JEWISH", label: "Second Temple Jewish", kind: "specific" },
    { value: "ANCIENT_HEBREW", label: "Ancient Hebrew", kind: "specific" },
    { value: "ZOROASTRIAN_PERSIAN", label: "Zoroastrian Persian", kind: "specific" },
    { value: "BUDDHIST", label: "Buddhist", kind: "specific" },
    { value: "HINDU", label: "Hindu", kind: "specific" },
    { value: "JAIN", label: "Jain", kind: "specific" },
    { value: "SIKH", label: "Sikh", kind: "specific" },
    { value: "SHINTO_JAPANESE", label: "Shinto Japanese", kind: "specific" },
    { value: "OTHER_RELIGIOUS_HISTORICAL", label: "Other Religious-Historical", kind: "other" },
    { value: "CUSTOM_RELIGIOUS_HISTORICAL", label: "Custom Religious-Historical", kind: "custom" },
    ],
  },
  {
    id: "Modern Regional",
    options: [
    { value: "MODERN_EGYPTIAN", label: "Modern Egyptian", kind: "specific" },
    { value: "MODERN_ARABIC", label: "Modern Arabic", kind: "specific" },
    { value: "MODERN_TURKISH", label: "Modern Turkish", kind: "specific" },
    { value: "MODERN_PERSIAN", label: "Modern Persian", kind: "specific" },
    { value: "MODERN_GREEK", label: "Modern Greek", kind: "specific" },
    { value: "MODERN_ITALIAN", label: "Modern Italian", kind: "specific" },
    { value: "MODERN_FRENCH", label: "Modern French", kind: "specific" },
    { value: "MODERN_BRITISH", label: "Modern British", kind: "specific" },
    { value: "MODERN_SPANISH", label: "Modern Spanish", kind: "specific" },
    { value: "MODERN_INDIAN", label: "Modern Indian", kind: "specific" },
    { value: "MODERN_CHINESE", label: "Modern Chinese", kind: "specific" },
    { value: "MODERN_JAPANESE", label: "Modern Japanese", kind: "specific" },
    { value: "MODERN_KOREAN", label: "Modern Korean", kind: "specific" },
    { value: "MODERN_SOUTHEAST_ASIAN", label: "Modern Southeast Asian", kind: "specific" },
    { value: "MODERN_AFRICAN", label: "Modern African", kind: "specific" },
    { value: "MODERN_LATIN_AMERICAN", label: "Modern Latin American", kind: "specific" },
    { value: "MODERN_NORTH_AMERICAN", label: "Modern North American", kind: "specific" },
    { value: "MODERN_SOUTH_AMERICAN", label: "Modern South American", kind: "specific" },
    { value: "MODERN_EUROPEAN", label: "Modern European", kind: "specific" },
    { value: "MODERN_MIDDLE_EASTERN", label: "Modern Middle Eastern", kind: "specific" },
    { value: "MODERN_ASIAN", label: "Modern Asian", kind: "specific" },
    { value: "MODERN_GLOBAL", label: "Modern Global", kind: "specific" },
    { value: "OTHER_MODERN_REGIONAL", label: "Other Modern Regional", kind: "other" },
    { value: "CUSTOM_MODERN_CIVILIZATION", label: "Custom Modern Civilization", kind: "custom" },
    ],
  },
  {
    id: "Fantasy",
    options: [
    { value: "HIGH_FANTASY", label: "High Fantasy", kind: "specific" },
    { value: "MEDIEVAL_FANTASY", label: "Medieval Fantasy", kind: "specific" },
    { value: "DARK_FANTASY", label: "Dark Fantasy", kind: "specific" },
    { value: "ARABIAN_FANTASY", label: "Arabian Fantasy", kind: "specific" },
    { value: "EGYPTIAN_FANTASY", label: "Egyptian Fantasy", kind: "specific" },
    { value: "GREEK_FANTASY", label: "Greek Fantasy", kind: "specific" },
    { value: "ROMAN_FANTASY", label: "Roman Fantasy", kind: "specific" },
    { value: "NORSE_FANTASY", label: "Norse Fantasy", kind: "specific" },
    { value: "CELTIC_FANTASY", label: "Celtic Fantasy", kind: "specific" },
    { value: "ASIAN_FANTASY", label: "Asian Fantasy", kind: "specific" },
    { value: "AFRICAN_FANTASY", label: "African Fantasy", kind: "specific" },
    { value: "DESERT_FANTASY", label: "Desert Fantasy", kind: "specific" },
    { value: "MYTHOLOGICAL_FANTASY", label: "Mythological Fantasy", kind: "specific" },
    { value: "STEAMPUNK_CIVILIZATION", label: "Steampunk Civilization", kind: "specific" },
    { value: "MIDDLE_EARTH", label: "Middle-earth", kind: "specific" },
    { value: "HOBBIT", label: "Hobbit", kind: "specific" },
    { value: "GONDOR", label: "Gondor", kind: "specific" },
    { value: "ROHAN", label: "Rohan", kind: "specific" },
    { value: "MORDOR", label: "Mordor", kind: "specific" },
    { value: "ELVEN_MIDDLE_EARTH", label: "Elven (Middle-earth)", kind: "specific" },
    { value: "DWARVEN_MIDDLE_EARTH", label: "Dwarven (Middle-earth)", kind: "specific" },
    { value: "ISENGARD", label: "Isengard", kind: "specific" },
    { value: "NUMENOREAN", label: "Númenórean", kind: "specific" },
    { value: "GONDORIAN", label: "Gondorian", kind: "specific" },
    { value: "ROHIRRIM", label: "Rohirrim", kind: "specific" },
    { value: "ORC_MIDDLE_EARTH", label: "Orc (Middle-earth)", kind: "specific" },
    { value: "URUK_HAI", label: "Uruk-hai", kind: "specific" },
    { value: "OTHER_MIDDLE_EARTH", label: "Other Middle-earth", kind: "other" },
    { value: "CUSTOM_MIDDLE_EARTH", label: "Custom Middle-earth", kind: "custom" },
    { value: "CUSTOM_FANTASY_CIVILIZATION", label: "Custom Fantasy Civilization", kind: "custom" },
    ],
  },
  {
    id: "Other",
    options: [
    { value: "OTHER", label: "Other", kind: "other" },
    ],
  },
  {
    id: "Custom",
    options: [
    { value: "CUSTOM", label: "Custom", kind: "custom" },
    ],
  },
];

export const CIVILIZATIONS: CivilizationOption[] =
  CIVILIZATIONS_BY_REGION.flatMap((group) => group.options);

const BY_VALUE = new Map<string, CivilizationOption>(
  CIVILIZATIONS.map((c) => [c.value, c]),
);

export function getCivilization(
  value: string | null | undefined,
): CivilizationOption | undefined {
  if (value === null || value === undefined) return undefined;
  return BY_VALUE.get(value);
}

export function getCivilizationLabel(
  value: string | null | undefined,
): string | null {
  return getCivilization(value)?.label ?? null;
}

export function isCustomCivilization(value: string | null | undefined): boolean {
  return getCivilization(value)?.kind === "custom";
}

export type StoryCivilization =
  | "ANCIENT_EGYPTIAN"
  | "EGYPTIAN"
  | "NUBIAN"
  | "KUSHITE"
  | "MEROITIC"
  | "AXUMITE"
  | "ETHIOPIAN"
  | "SOMALI"
  | "BERBER_AMAZIGH"
  | "CARTHAGINIAN"
  | "ANCIENT_NORTH_AFRICAN"
  | "WEST_AFRICAN"
  | "GHANA_EMPIRE"
  | "MALI_EMPIRE"
  | "SONGHAI_EMPIRE"
  | "YORUBA"
  | "IGBO"
  | "HAUSA"
  | "BENIN_KINGDOM"
  | "ASHANTI"
  | "KONGO"
  | "GREAT_ZIMBABWE"
  | "SWAHILI_COAST"
  | "ZULU"
  | "XHOSA"
  | "MAASAI"
  | "TUAREG"
  | "OTHER_AFRICAN"
  | "CUSTOM_AFRICAN_CIVILIZATION"
  | "ARABIC"
  | "SUMERIAN"
  | "AKKADIAN"
  | "BABYLONIAN"
  | "ASSYRIAN"
  | "PERSIAN"
  | "ACHAEMENID_PERSIAN"
  | "SASANIAN_PERSIAN"
  | "MEDIAN"
  | "ELAMITE"
  | "HITTITE"
  | "PHOENICIAN"
  | "CANAANITE"
  | "ANCIENT_LEVANTINE"
  | "ARAMAEAN"
  | "NABATAEAN"
  | "UGARITIC"
  | "MESOPOTAMIAN"
  | "ARABIAN"
  | "PRE_ISLAMIC_ARABIAN"
  | "ISLAMIC_ARABIAN"
  | "ABBASID"
  | "UMAYYAD"
  | "FATIMID"
  | "MAMLUK"
  | "OTTOMAN"
  | "LEVANTINE"
  | "KURDISH"
  | "ARMENIAN"
  | "GEORGIAN"
  | "MESOPOTAMIAN_ARAB"
  | "OTHER_MIDDLE_EASTERN"
  | "CUSTOM_MIDDLE_EASTERN_CIVILIZATION"
  | "ANCIENT_GREEK"
  | "GREEK"
  | "ROMAN"
  | "MYCENAEAN_GREEK"
  | "MINOAN"
  | "CLASSICAL_GREEK"
  | "HELLENISTIC"
  | "SPARTAN"
  | "ATHENIAN"
  | "MACEDONIAN"
  | "ANCIENT_ROMAN"
  | "ROMAN_REPUBLIC"
  | "ROMAN_EMPIRE"
  | "BYZANTINE"
  | "ETRUSCAN"
  | "ILLYRIAN"
  | "THRACIAN"
  | "DACIAN"
  | "CELTIC"
  | "PHOENICIAN_MEDITERRANEAN"
  | "OTHER_MEDITERRANEAN"
  | "CUSTOM_MEDITERRANEAN_CIVILIZATION"
  | "ANGLO_SAXON"
  | "VIKING_NORSE"
  | "MEDIEVAL_ENGLISH"
  | "MEDIEVAL_FRENCH"
  | "MEDIEVAL_GERMANIC"
  | "MEDIEVAL_SPANISH"
  | "MEDIEVAL_PORTUGUESE"
  | "MEDIEVAL_ITALIAN"
  | "MEDIEVAL_SCANDINAVIAN"
  | "MEDIEVAL_SLAVIC"
  | "RUSSIAN"
  | "KIEVAN_RUS"
  | "POLISH"
  | "BOHEMIAN"
  | "HUNGARIAN"
  | "BALKAN"
  | "VENETIAN"
  | "RENAISSANCE_ITALIAN"
  | "RENAISSANCE_EUROPEAN"
  | "VICTORIAN_BRITISH"
  | "GEORGIAN_BRITISH"
  | "EDWARDIAN_BRITISH"
  | "OTHER_EUROPEAN"
  | "CUSTOM_EUROPEAN_CIVILIZATION"
  | "INDUS_VALLEY"
  | "VEDIC"
  | "ANCIENT_INDIAN"
  | "MAURYAN"
  | "GUPTA"
  | "CHOLA"
  | "PALLAVA"
  | "MUGHAL"
  | "RAJPUT"
  | "MARATHA"
  | "VIJAYANAGARA"
  | "BENGALI"
  | "PUNJABI"
  | "TAMIL"
  | "TELUGU"
  | "SINHALA"
  | "NEPALESE"
  | "TIBETAN"
  | "KASHMIRI"
  | "INDO_ISLAMIC"
  | "OTHER_SOUTH_ASIAN"
  | "CUSTOM_SOUTH_ASIAN_CIVILIZATION"
  | "ANCIENT_CHINESE"
  | "SHANG"
  | "ZHOU"
  | "QIN"
  | "HAN"
  | "THREE_KINGDOMS_CHINA"
  | "TANG"
  | "SONG"
  | "YUAN"
  | "MING"
  | "QING"
  | "IMPERIAL_CHINESE"
  | "ANCIENT_JAPANESE"
  | "HEIAN_JAPANESE"
  | "KAMAKURA_JAPANESE"
  | "MUROMACHI_JAPANESE"
  | "EDO_JAPANESE"
  | "SAMURAI_JAPAN"
  | "ANCIENT_KOREAN"
  | "GOGURYEO"
  | "BAEKJE"
  | "SILLA"
  | "GORYEO"
  | "JOSEON"
  | "MONGOLIAN"
  | "MANCHU"
  | "OTHER_EAST_ASIAN"
  | "CUSTOM_EAST_ASIAN_CIVILIZATION"
  | "KHMER"
  | "ANGKOR"
  | "SRIVIJAYA"
  | "MAJAPAHIT"
  | "CHAMPA"
  | "PAGAN_BAGAN"
  | "BURMESE"
  | "THAI_SIAMESE"
  | "AYUTTHAYA"
  | "VIETNAMESE"
  | "DAI_VIET"
  | "MALAY"
  | "INDONESIAN"
  | "JAVANESE"
  | "BALINESE"
  | "FILIPINO_PRECOLONIAL_PHILIPPINE"
  | "LAO"
  | "CAMBODIAN"
  | "OTHER_SOUTHEAST_ASIAN"
  | "CUSTOM_SOUTHEAST_ASIAN_CIVILIZATION"
  | "SCYTHIAN"
  | "SARMATIAN"
  | "HUNNIC"
  | "TURKIC"
  | "GOKTURK"
  | "MONGOL"
  | "MONGOL_EMPIRE"
  | "TIMURID"
  | "UZBEK"
  | "KAZAKH"
  | "KYRGYZ"
  | "UYGHUR"
  | "PERSIANATE_CENTRAL_ASIAN"
  | "SILK_ROAD"
  | "OTHER_CENTRAL_ASIAN"
  | "CUSTOM_CENTRAL_ASIAN_CIVILIZATION"
  | "INUIT"
  | "YUPIK"
  | "HAIDA"
  | "TLINGIT"
  | "IROQUOIS_HAUDENOSAUNEE"
  | "CHEROKEE"
  | "CHOCTAW"
  | "LAKOTA"
  | "SIOUX"
  | "NAVAJO_DINE"
  | "HOPI"
  | "PUEBLO"
  | "MISSISSIPPIAN"
  | "ANCESTRAL_PUEBLOAN"
  | "PACIFIC_NORTHWEST_INDIGENOUS"
  | "GREAT_PLAINS_INDIGENOUS"
  | "WOODLAND_INDIGENOUS"
  | "OTHER_INDIGENOUS_NORTH_AMERICAN"
  | "CUSTOM_INDIGENOUS_NORTH_AMERICAN"
  | "OLMEC"
  | "MAYA"
  | "AZTEC_MEXICA"
  | "TOLTEC"
  | "TEOTIHUACAN"
  | "ZAPOTEC"
  | "MIXTEC"
  | "TARASCAN_PUREPECHA"
  | "MESOAMERICAN"
  | "OTHER_MESOAMERICAN"
  | "CUSTOM_MESOAMERICAN_CIVILIZATION"
  | "INCA"
  | "MOCHE"
  | "NAZCA"
  | "CHIMU"
  | "TIWANAKU"
  | "WARI"
  | "MAPUCHE"
  | "ARAWAK"
  | "TUPI"
  | "GUARANI"
  | "ANDEAN"
  | "AMAZONIAN_INDIGENOUS"
  | "OTHER_SOUTH_AMERICAN_INDIGENOUS"
  | "CUSTOM_SOUTH_AMERICAN_CIVILIZATION"
  | "POLYNESIAN"
  | "MAORI"
  | "HAWAIIAN"
  | "SAMOAN"
  | "TONGAN"
  | "TAHITIAN"
  | "MICRONESIAN"
  | "MELANESIAN"
  | "ABORIGINAL_AUSTRALIAN"
  | "OTHER_PACIFIC_ISLANDER"
  | "CUSTOM_OCEANIAN_CIVILIZATION"
  | "EARLY_ISLAMIC"
  | "MEDIEVAL_ISLAMIC"
  | "EARLY_CHRISTIAN"
  | "MEDIEVAL_CHRISTIAN_EUROPE"
  | "BYZANTINE_CHRISTIAN"
  | "ANCIENT_JEWISH_ISRAELITE"
  | "SECOND_TEMPLE_JEWISH"
  | "ANCIENT_HEBREW"
  | "ZOROASTRIAN_PERSIAN"
  | "BUDDHIST"
  | "HINDU"
  | "JAIN"
  | "SIKH"
  | "SHINTO_JAPANESE"
  | "OTHER_RELIGIOUS_HISTORICAL"
  | "CUSTOM_RELIGIOUS_HISTORICAL"
  | "MODERN_EGYPTIAN"
  | "MODERN_ARABIC"
  | "MODERN_TURKISH"
  | "MODERN_PERSIAN"
  | "MODERN_GREEK"
  | "MODERN_ITALIAN"
  | "MODERN_FRENCH"
  | "MODERN_BRITISH"
  | "MODERN_SPANISH"
  | "MODERN_INDIAN"
  | "MODERN_CHINESE"
  | "MODERN_JAPANESE"
  | "MODERN_KOREAN"
  | "MODERN_SOUTHEAST_ASIAN"
  | "MODERN_AFRICAN"
  | "MODERN_LATIN_AMERICAN"
  | "MODERN_NORTH_AMERICAN"
  | "MODERN_SOUTH_AMERICAN"
  | "MODERN_EUROPEAN"
  | "MODERN_MIDDLE_EASTERN"
  | "MODERN_ASIAN"
  | "MODERN_GLOBAL"
  | "OTHER_MODERN_REGIONAL"
  | "CUSTOM_MODERN_CIVILIZATION"
  | "HIGH_FANTASY"
  | "MEDIEVAL_FANTASY"
  | "DARK_FANTASY"
  | "ARABIAN_FANTASY"
  | "EGYPTIAN_FANTASY"
  | "GREEK_FANTASY"
  | "ROMAN_FANTASY"
  | "NORSE_FANTASY"
  | "CELTIC_FANTASY"
  | "ASIAN_FANTASY"
  | "AFRICAN_FANTASY"
  | "DESERT_FANTASY"
  | "MYTHOLOGICAL_FANTASY"
  | "STEAMPUNK_CIVILIZATION"
  | "MIDDLE_EARTH"
  | "HOBBIT"
  | "GONDOR"
  | "ROHAN"
  | "MORDOR"
  | "ELVEN_MIDDLE_EARTH"
  | "DWARVEN_MIDDLE_EARTH"
  | "ISENGARD"
  | "NUMENOREAN"
  | "GONDORIAN"
  | "ROHIRRIM"
  | "ORC_MIDDLE_EARTH"
  | "URUK_HAI"
  | "OTHER_MIDDLE_EARTH"
  | "CUSTOM_MIDDLE_EARTH"
  | "CUSTOM_FANTASY_CIVILIZATION"
  | "OTHER"
  | "CUSTOM"
  | "UNSPECIFIED";
