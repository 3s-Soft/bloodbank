// Bangladesh Districts and Upazilas Data
// Source: Bangladesh Administrative Divisions

export const districts = [
    "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria",
    "Chandpur", "Chapainawabganj", "Chittagong", "Comilla", "Cox's Bazar",
    "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
    "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat",
    "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia",
    "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur",
    "Moulvibazar", "Munshiganj", "Mymensingh",
    "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Nawabganj", "Netrokona",
    "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur",
    "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
    "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
    "Tangail", "Thakurgaon"
];

export const upazilasByDistrict: Record<string, string[]> = {
    "Dhaka": [
        "Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar", "Tejgaon",
        "Gulshan", "Mirpur", "Mohammadpur", "Pallabi", "Uttara", "Cantonment",
        "Demra", "Jatrabari", "Kadamtali", "Motijheel", "Ramna", "Sutrapur"
    ],
    "Gazipur": [
        "Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi"
    ],
    "Narayanganj": [
        "Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"
    ],
    "Chittagong": [
        "Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari",
        "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"
    ],
    "Sylhet": [
        "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj",
        "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Sylhet Sadar", "Zakiganj"
    ],
    "Rajshahi": [
        "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur",
        "Paba", "Puthia", "Rajshahi Sadar", "Tanore"
    ],
    "Khulna": [
        "Batiaghata", "Dacope", "Dighalia", "Dumuria", "Khalishpur", "Khan Jahan Ali",
        "Koyra", "Paikgachha", "Phultala", "Rupsha", "Sonadanga", "Terokhada"
    ],
    "Rangpur": [
        "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha",
        "Pirganj", "Rangpur Sadar", "Taraganj"
    ],
    "Barisal": [
        "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Barisal Sadar",
        "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"
    ],
    "Comilla": [
        "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram",
        "Comilla Sadar", "Daudkandi", "Debidwar", "Homna", "Laksam",
        "Meghna", "Monohorgonj", "Muradnagar", "Nangalkot", "Titas"
    ],
    "Mymensingh": [
        "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat",
        "Ishwarganj", "Mymensingh Sadar", "Muktagachha", "Nandail", "Phulpur", "Trishal"
    ],
    "Cox's Bazar": [
        "Chakaria", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Pekua",
        "Ramu", "Teknaf", "Ukhia"
    ],
    "Bogra": [
        "Adamdighi", "Bogra Sadar", "Dhunat", "Dhupchanchia", "Gabtali",
        "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"
    ],
    "Dinajpur": [
        "Birampur", "Birganj", "Bochaganj", "Chirirbandar", "Dinajpur Sadar",
        "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"
    ],
    "Jessore": [
        "Abhaynagar", "Bagherpara", "Chaugachha", "Jessore Sadar", "Jhikargachha",
        "Keshabpur", "Manirampur", "Sharsha"
    ],
    "Tangail": [
        "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur",
        "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"
    ],
    "Faridpur": [
        "Alfadanga", "Bhanga", "Boalmari", "Char Bhadrasan", "Faridpur Sadar",
        "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"
    ],
    "Brahmanbaria": [
        "Akhaura", "Ashuganj", "Bancharampur", "Bijoynagar", "Brahmanbaria Sadar",
        "Kasba", "Nabinagar", "Nasirnagar", "Sarail"
    ],
    "Noakhali": [
        "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Noakhali Sadar",
        "Senbagh", "Sonaimuri", "Subarnachar"
    ],
    "Pabna": [
        "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi",
        "Pabna Sadar", "Santhia", "Sujanagar"
    ],
    "Sirajganj": [
        "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj",
        "Shahzadpur", "Sirajganj Sadar", "Tarash", "Ullapara"
    ],
    "Munshiganj": [
        "Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"
    ],
    "Manikganj": [
        "Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia",
        "Shivalaya", "Singair"
    ],
    "Narsingdi": [
        "Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"
    ],
    "Kishoreganj": [
        "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj",
        "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"
    ],
    "Habiganj": [
        "Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Habiganj Sadar",
        "Lakhai", "Madhabpur", "Nabiganj"
    ],
    "Moulvibazar": [
        "Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar",
        "Rajnagar", "Sreemangal"
    ],
    "Sunamganj": [
        "Bishwamvarpur", "Chhatak", "Derai", "Dharamapasha", "Dowarabazar",
        "Jagannathpur", "Jamalganj", "Sulla", "Sunamganj Sadar", "Tahirpur"
    ],
    "Netrokona": [
        "Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri",
        "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"
    ],
    "Sherpur": [
        "Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"
    ],
    "Jamalpur": [
        "Baksiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj",
        "Melandaha", "Sarishabari"
    ]
};

// Get upazilas for a district (with fallback for districts not yet added)
export function getUpazilasForDistrict(district: string): string[] {
    return upazilasByDistrict[district] || [];
}

// Blood groups
export const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// Urgency levels
export const urgencyLevels = [
    { value: "normal", label: "Normal", color: "green" },
    { value: "urgent", label: "Urgent", color: "orange" },
    { value: "emergency", label: "Emergency", color: "red" },
];

// Request statuses
export const requestStatuses = [
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "fulfilled", label: "Fulfilled", color: "green" },
    { value: "canceled", label: "Canceled", color: "gray" },
];

// User roles
export const userRoles = [
    { value: "patient", label: "Patient" },
    { value: "donor", label: "Donor" },
    { value: "volunteer", label: "Volunteer" },
    { value: "admin", label: "Admin" },
    { value: "super_admin", label: "Super Admin" },
];
