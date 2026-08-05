
// Extracted from User provided HTML

export const PROFILE_CREATORS = [
    "Self", "Parents", "Relatives", "Friends", "Guardian", "Sibling", "Agents"
];

export const MARITAL_STATUSES = [
    { label: "Unmarried", value: "Unmarried" },
    { label: "Widowed", value: "Widowed" },
    { label: "Divorced", value: "Divorced" },
    { label: "Separated", value: "Separated" },
    { label: "Married", value: "Married" }
];

export const CHILDREN_COUNTS = [
    { label: "None", value: "0" },
    { label: "1", value: "One" },
    { label: "2", value: "Two" },
    { label: "3", value: "Three" },
    { label: "4 and above", value: "Four and above" }
];

export const RELIGIONS = [
    "Muslim", "Hindu", "Christian", "Sikh", "Jain", "Parsi", "Buddhist", "Bahai", "Inter-Religion", "Others"
];

export const SECTS_SUNNI = [
    "Sunni" // HTML only showed this as selected, assuming simplified or dynamic. Will keep simplified for now or add common ones if needed, but request asked for "options make in profile". HTML has <option value="Sunni" selected>Sunni</option> only visible.
];

export const CASTES = [
    "Arain", "Ansari", "Awan", "Bangash", "Butt", "Gujjar", "Jatt", "Kamboh", "Khokhar", "Malik",
    "Mughal", "Pathan", "Qureshi", "Rajput", "Randhawa", "Shaikh", "Siddiqui", "Syed", "Wirk",
    "Others", "Prefer not to Say"
];

export const LANGUAGES = [
    "Urdu", "Punjabi", "Pushto", "Sindhi", "Balochi", "Saraiki", "Kashmiri", "Brahui", "Hindko",
    "Shina", "Balti", "Khowar", "Dhatki", "Marwari", "Wakhi", "English", "Arabic", "Persian", "Other"
];

export const COUNTRIES = [
    "Pakistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antigua & Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
    "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia & Herzegovina", "Botswana",
    "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
    "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo",
    "Congo (DRC)", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
    "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France",
    "French Guiana", "French Polynesia", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
    "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
    "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Republic of", "Kuwait",
    "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
    "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
    "Martinique", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montserrat",
    "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand",
    "Nicaragua", "Niger", "Nigeria", "Niue", "Norway", "Oman", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda",
    "Samoa", "San Marino", "Sao Tome & Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone",
    "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka",
    "St. Kitts & Nevis", "St. Lucia", "St. Vincent", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland",
    "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad & Tobago", "Tunisia",
    "Turkey", "Turkmenistan", "Turks & Caicos", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "USA", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands (British)",
    "Virgin Islands (US)", "Wallis & Futuna", "Yemen", "Zambia", "Zimbabwe", "Other"
];

export const CITIZENSHIPS = [
    "Pakistani", "American", "Australian", "British", "Canadian", "European Union (EU)", "Indian", "Other", "Prefer not to Say"
];

export const EDUCATIONS = [
    "Bachelors degree", "Masters", "Doctorate", "Diploma", "Undergraduate", "Associates degree",
    "Honours degree", "Trade school", "High school", "Less than high school"
];

export const OCCUPATIONS = [
    "Business", "Any", "Accounts/ Finance Professional", "Administrative Professional", "Advertising/PR Professional",
    "Agriculture & Farming Professional", "Air Hostess", "Air force", "Airline Professional", "Architect", "Army",
    "Arts & Craftsman", "Auditor", "Banking Service Professional", "Beautician", "Business Analyst", "CXO/President,Director, Chairman",
    "Chartered Accountant", "Civil Services", "Clerk", "Company Secretary", "Consultant", "Customer Care Professional",
    "Doctor", "Designer - IT & Engineering", "Designer - Media & Entertainment", "Education Professional", "Engineer - Non IT",
    "Entertainment Professional", "Event Management Professional", "Executive", "Financial Analyst / Planning",
    "Financial Accountant", "Fashion Designer", "Hardware Professional", "Health Care Professional",
    "Hotel / Hospitality Professional", "Human Resources Professional", "Interior Designer", "Journalist",
    "Law Enforcement Officer", "Lawyer & Legal Professional", "Librarian", "Manager", "Mariner / Merchant Navy",
    "Marketing Professional", "Media Professional", "Navy", "Nurse", "Officer", "Office assistant",
    "Paramedical Professional", "Pilot", "Professor / Lecturer", "Sales Professional", "Scientist / Researcher",
    "Social Worker", "Software Professional", "Sportsman", "Supervisor", "Student", "Teaching / Academician",
    "Technician", "Others", "Not working"
];

export const INCOMES = [
    // Monthly PKR
    "Under 10,000 Rs", "10,000 - 25,000 Rs", "25,001 - 50,000 Rs", "50,001 - 75,000 Rs", "75,001 - 100,000 Rs",
    "100,001 - 150,000 Rs", "150,001 - 200,000 Rs", "200,001 - 300,000 Rs", "300,001 Rs and above",
    // Yearly USD
    "Under $25,000", "$25,001 - $50,000", "$50,001 - $75,000", "$75,001 - $100,000", "$100,001 - $150,000",
    "$150,001 - $200,000", "$200,001 and above",
    "No Income", "Prefer not to say"
];

export const HEIGHTS = [
    "Below 4ft", "4ft 6in", "4ft 7in", "4ft 8in", "4ft 9in", "4ft 10in", "4ft 11in",
    "5ft", "5ft 1in", "5ft 2in", "5ft 3in", "5ft 4in", "5ft 5in", "5ft 6in", "5ft 7in", "5ft 8in", "5ft 9in", "5ft 10in", "5ft 11in",
    "6ft", "6ft 1in", "6ft 2in", "6ft 3in", "6ft 4in", "6ft 5in", "6ft 6in", "6ft 7in", "6ft 8in", "6ft 9in", "6ft 10in", "6ft 11in",
    "7ft", "Above 7ft"
];

export const WEIGHTS = Array.from({ length: 100 }, (_, i) => `${41 + i} kg`); // 41kg to 140kg roughly

export const COMPLEXIONS = [
    "Very Fair", "Fair", "Wheatish", "Wheatish Medium", "Wheatish Brown", "Dark"
];

export const BODY_TYPES = [
    "Slim", "Average", "Heavy", "Athletic"
];

export const SMOKE_DRINK_OPTIONS = [
    "Yes", "No", "Occasionally"
];

export const RELIGIOUSNESS = [
    "Very Religious", "Religious", "Somewhat Religious", "Not Religious", "Prefer not to say"
];

export const BROTHER_SISTER_COUNTS = ["0", "1", "2", "3", "4", "4 +"];

export const MARRIED_SIBLING_COUNTS = [
    "No married", "One married", "Two married", "Three married", "Four married", "Above four married"
];

export const LOOKING_FOR = [
    "Unmarried", "Widow/Widower", "Divorcee", "Separated", "Married", "Any"
];

export const AGES = Array.from({ length: 43 }, (_, i) => `${18 + i}`); // 18 to 60
