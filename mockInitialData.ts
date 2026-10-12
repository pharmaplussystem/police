import { 
  Officer, 
  WeeklyProgram, 
  MonthlyDutyRoster, 
  SpecialProgramItem, 
  Notice, 
  Sitrep, 
  PoliceFormItem, 
  Application, 
  ArmoryGun, 
  GunIssueRecord, 
  NotificationItem 
} from '../types';

export const UGANDA_BANKS = [
  'Stanbic Bank Uganda',
  'Centenary Rural Development Bank',
  'Absa Bank Uganda',
  'DFCU Bank',
  'Standard Chartered Bank Uganda',
  'Equity Bank Uganda',
  'PostBank Uganda',
  'Housing Finance Bank',
  'Bank of Baroda Uganda',
  'Diamond Trust Bank Uganda (DTB)',
  'KCB Bank Uganda',
  'NCBA Bank Uganda',
  'I&M Bank Uganda',
  'Finance Trust Bank',
  'Cairo Bank Uganda',
  'Tropical Bank Uganda',
  'Opportunity Bank Uganda',
  'Bank of Africa Uganda',
  'Ecobank Uganda',
  'UBA (United Bank for Africa)'
];

export const UGANDA_TRIBES = [
  'Iteso',
  'Samia',
  'Japadhola',
  'Bagisu',
  'Baganda',
  'Basoga',
  'Banyankole',
  'Bakiga',
  'Acholi',
  'Langi',
  'Lugbara',
  'Alur',
  'Batooro',
  'Banyoro',
  'Sebei',
  'Karamojong',
  'Madi',
  'Bamba',
  'Bakonzo',
  'Kumam'
];

export const UGANDA_DISTRICTS = [
  'Abim', 'Adjumani', 'Agago', 'Alebtong', 'Amolatar', 'Amudat', 'Amuria', 'Amuru', 'Apac', 'Arua',
  'Budaka', 'Bududa', 'Bugiri', 'Bugweri', 'Buhweju', 'Buikwe', 'Bukedea', 'Bukomansimbi', 'Bukwo', 'Bulambuli',
  'Buliisa', 'Bundibugyo', 'Bunyangabu', 'Bushenyi', 'Busia', 'Butaleja', 'Butambala', 'Butebo', 'Buvuma', 'Buyende',
  'Dokolo', 'Gomba', 'Gulu', 'Ibanda', 'Iganga', 'Isingiro', 'Jinja', 'Kaabong', 'Kabale', 'Kabarole',
  'Kaberamaido', 'Kagadi', 'Kakumiro', 'Kalangala', 'Kaliro', 'Kalungu', 'Kampala', 'Kamuli', 'Kamwenge', 'Kanungu',
  'Kapchorwa', 'Kapelebyong', 'Karenga', 'Kasanda', 'Kasese', 'Katakwi', 'Kayunga', 'Kazo', 'Kibaale', 'Kiboga',
  'Kibuku', 'Kikuube', 'Kiruhura', 'Kiryandongo', 'Kisoro', 'Kitagwenda', 'Kitgum', 'Koboko', 'Kole', 'Kotido',
  'Kumi', 'Kwania', 'Kween', 'Kyankwanzi', 'Kyegegwa', 'Kyenjojo', 'Kyotera', 'Lamwo', 'Lira', 'Luuka',
  'Luwero', 'Lwengo', 'Lyantonde', 'Madi-Okollo', 'Manafwa', 'Maracha', 'Masaka', 'Masindi', 'Mayuge', 'Mbale',
  'Mbarara', 'Mitooma', 'Mityana', 'Moroto', 'Moyo', 'Mpigi', 'Mubende', 'Mukono', 'Nabilatuk', 'Nakapiripirit',
  'Nakaseke', 'Nakasongola', 'Namayingo', 'Namisindwa', 'Namutumba', 'Napak', 'Nebbi', 'Ngora', 'Ntoroko', 'Ntungamo',
  'Nwoya', 'Obongi', 'Omoro', 'Otuke', 'Oyam', 'Pader', 'Pakwach', 'Pallisa', 'Rakai', 'Rubanda',
  'Rubirizi', 'Rukiga', 'Rukungiri', 'Rwampara', 'Sembabule', 'Serere', 'Sheema', 'Sironko', 'Soroti', 'Terego',
  'Tororo', 'Wakiso', 'Yumbe', 'Zombo'
];

export const UGANDA_CRIMINAL_CASES = [
  { name: 'Aggravated Defilement', section: 'Sec 129(3) Penal Code Act' },
  { name: 'Aggravated Robbery', section: 'Sec 285 & 286(2) Penal Code Act' },
  { name: 'Assault Occasioning Actual Bodily Harm', section: 'Sec 236 Penal Code Act' },
  { name: 'Attempted Murder', section: 'Sec 204 Penal Code Act' },
  { name: 'Burglary & Theft', section: 'Sec 294 Penal Code Act' },
  { name: 'Cattle Theft / Rustling', section: 'Sec 254 Penal Code Act' },
  { name: 'Causing Death by Rash & Negligent Act', section: 'Traffic & Road Safety Act' },
  { name: 'Common Assault', section: 'Sec 235 Penal Code Act' },
  { name: 'Counterfeit Currency Possession & Uttering', section: 'Sec 362 Penal Code Act' },
  { name: 'Criminal Trespass', section: 'Sec 302 Penal Code Act' },
  { name: 'Defilement Simple', section: 'Sec 129(1) Penal Code Act' },
  { name: 'Domestic Violence', section: 'Domestic Violence Act 2010' },
  { name: 'Drug Trafficking & Possession of Narcotics', section: 'Narcotic Drugs Act 2016' },
  { name: 'Elopement', section: 'Sec 127 Penal Code Act' },
  { name: 'Embezzlement', section: 'Sec 257 Penal Code Act' },
  { name: 'Extortion / Demanding Money with Menaces', section: 'Sec 292 Penal Code Act' },
  { name: 'Forgery & Uttering False Documents', section: 'Sec 342 & 347 Penal Code Act' },
  { name: 'Grievous Harm', section: 'Sec 219 Penal Code Act' },
  { name: 'Human Trafficking', section: 'Prevention of Trafficking in Persons Act' },
  { name: 'Illegal Cross-Border Trade & Customs Evasion', section: 'EACCMA Sec 200' },
  { name: 'Kidnapping with Intent to Murder or Extort', section: 'Sec 243 Penal Code Act' },
  { name: 'Malicious Damage to Property', section: 'Sec 335 Penal Code Act' },
  { name: 'Manslaughter', section: 'Sec 187 Penal Code Act' },
  { name: 'Murder', section: 'Sec 188 & 189 Penal Code Act' },
  { name: 'Obtaining Money by False Pretence', section: 'Sec 305 Penal Code Act' },
  { name: 'Possession of Government Stores / Ammunition', section: 'Sec 316 Penal Code Act' },
  { name: 'Rape', section: 'Sec 123 & 124 Penal Code Act' },
  { name: 'Robbery Simple', section: 'Sec 285 Penal Code Act' },
  { name: 'Stealing from a Motor Vehicle / Cargo', section: 'Sec 254 Penal Code Act' },
  { name: 'Stealing Motor Vehicle / Motorcycle', section: 'Sec 254 Penal Code Act' },
  { name: 'Threatening Violence', section: 'Sec 81 Penal Code Act' },
  { name: 'Unlawful Possession of Firearm', section: 'Firearms Act Cap 299' },
  { name: 'Unlawful Wounding', section: 'Sec 222 Penal Code Act' }
];

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'off-01',
    forceNumber: '14280 SP',
    rank: 'SP',
    name: 'Okello James Robert',
    sex: 'Male',
    contact: '+256 772 491 802',
    dateOfBirth: '1979-04-14',
    nin: 'CM79014102KLOP',
    ipps: '891042',
    department: 'general duties',
    homeDistrict: 'Tororo',
    tribe: 'Japadhola',
    bank: 'Stanbic Bank Uganda',
    branch: 'Tororo Main Branch',
    accountNumber: '9030018472911',
    tin: '1004928172',
    educationLevel: 'Master\'s Degree',
    dateOfEnlistment: '2004-06-15',
    dateOfAppointment: '2005-09-01',
    dateOfPromotion: '2021-08-10',
    dateOfPosting: '2023-01-12',
    status: 'active',
    roleTitle: 'OC Station',
    administrativeRole: 'OC Station'
  },
  {
    id: 'off-02',
    forceNumber: '28419 IP',
    rank: 'IP',
    name: 'Wabwire Ronald Peter',
    sex: 'Male',
    contact: '+256 782 309 441',
    dateOfBirth: '1984-11-20',
    nin: 'CM841120108PRT',
    ipps: '739201',
    department: 'general duties',
    homeDistrict: 'Busia',
    tribe: 'Samia',
    bank: 'Centenary Rural Development Bank',
    branch: 'Busia Main Branch',
    accountNumber: '31008472910',
    tin: '1008912301',
    educationLevel: 'Bachelor\'s Degree',
    dateOfEnlistment: '2008-03-10',
    dateOfAppointment: '2009-07-15',
    dateOfPromotion: '2022-12-05',
    dateOfPosting: '2023-02-01',
    status: 'active',
    roleTitle: 'Station Major',
    administrativeRole: 'Station Major'
  },
  {
    id: 'off-03',
    forceNumber: '31904 ASP',
    rank: 'ASP',
    name: 'Namaganda Sarah Christine',
    sex: 'Female',
    contact: '+256 701 552 899',
    dateOfBirth: '1986-07-08',
    nin: 'CF860708092BTY',
    ipps: '648210',
    department: 'CID',
    homeDistrict: 'Mukono',
    tribe: 'Baganda',
    bank: 'Absa Bank Uganda',
    branch: 'Jinja Branch',
    accountNumber: '0341829001',
    tin: '1006543219',
    educationLevel: 'Bachelor\'s Degree',
    dateOfEnlistment: '2010-09-01',
    dateOfAppointment: '2011-11-20',
    dateOfPromotion: '2020-04-15',
    dateOfPosting: '2023-05-18',
    status: 'active',
    roleTitle: 'OC CID',
    administrativeRole: 'OC CID'
  },
  {
    id: 'off-04',
    forceNumber: '39412 AIP',
    rank: 'AIP',
    name: 'Ochieng Moses David',
    sex: 'Male',
    contact: '+256 779 812 004',
    dateOfBirth: '1988-02-17',
    nin: 'CM880217983WXZ',
    ipps: '552194',
    department: 'CID',
    homeDistrict: 'Tororo',
    tribe: 'Iteso',
    bank: 'PostBank Uganda',
    branch: 'Tororo Branch',
    accountNumber: '1020491823',
    tin: '1007812904',
    educationLevel: 'Diploma',
    dateOfEnlistment: '2012-04-05',
    dateOfAppointment: '2013-06-10',
    dateOfPromotion: '2022-01-20',
    dateOfPosting: '2023-03-10',
    status: 'active',
    roleTitle: 'Admin CID',
    administrativeRole: 'Admin CID'
  },
  {
    id: 'off-05',
    forceNumber: '47201 SGT',
    rank: 'SGT',
    name: 'Ouma Emmanuel Bosco',
    sex: 'Male',
    contact: '+256 788 112 345',
    dateOfBirth: '1987-09-12',
    nin: 'CM870912001LMK',
    ipps: '491208',
    department: 'traffic',
    homeDistrict: 'Busia',
    tribe: 'Samia',
    bank: 'Stanbic Bank Uganda',
    branch: 'Tororo Main Branch',
    accountNumber: '90300293811',
    tin: '1009182341',
    educationLevel: 'Certificate',
    dateOfEnlistment: '2011-02-14',
    dateOfAppointment: '2012-05-18',
    dateOfPromotion: '2019-10-10',
    dateOfPosting: '2022-08-11',
    status: 'active'
  },
  {
    id: 'off-06',
    forceNumber: '52190 SGT',
    rank: 'SGT',
    name: 'Apio Grace Scovia',
    sex: 'Female',
    contact: '+256 754 601 228',
    dateOfBirth: '1989-05-30',
    nin: 'CF890530992TYQ',
    ipps: '412093',
    department: 'CFPU',
    homeDistrict: 'Kumi',
    tribe: 'Iteso',
    bank: 'Centenary Rural Development Bank',
    branch: 'Tororo Branch',
    accountNumber: '3100918274',
    tin: '1004128911',
    educationLevel: 'Diploma',
    dateOfEnlistment: '2013-07-22',
    dateOfAppointment: '2014-09-15',
    dateOfPromotion: '2021-03-05',
    dateOfPosting: '2023-01-15',
    status: 'active'
  },
  {
    id: 'off-07',
    forceNumber: '58902 CPL',
    rank: 'CPL',
    name: 'Wandera Paul Michael',
    sex: 'Male',
    contact: '+256 774 990 120',
    dateOfBirth: '1991-03-15',
    nin: 'CM910315891ASD',
    ipps: '381902',
    department: 'general duties',
    homeDistrict: 'Busia',
    tribe: 'Samia',
    bank: 'Equity Bank Uganda',
    branch: 'Tororo Branch',
    accountNumber: '1004819208',
    tin: '1003418290',
    educationLevel: 'A-Level',
    dateOfEnlistment: '2015-01-10',
    dateOfAppointment: '2016-04-12',
    dateOfPromotion: '2021-11-20',
    dateOfPosting: '2022-11-04',
    status: 'active'
  },
  {
    id: 'off-08',
    forceNumber: '61204 CPL',
    rank: 'CPL',
    name: 'Chebet Brenda',
    sex: 'Female',
    contact: '+256 781 405 918',
    dateOfBirth: '1993-10-04',
    nin: 'CF931004102LKJ',
    ipps: '341908',
    department: 'CI',
    homeDistrict: 'Kapchorwa',
    tribe: 'Sebei',
    bank: 'Stanbic Bank Uganda',
    branch: 'Mbale Branch',
    accountNumber: '90300481920',
    tin: '1008192031',
    educationLevel: 'Diploma',
    dateOfEnlistment: '2016-08-01',
    dateOfAppointment: '2017-10-15',
    dateOfPromotion: '2023-06-12',
    dateOfPosting: '2023-09-01',
    status: 'active'
  },
  {
    id: 'off-09',
    forceNumber: '68214 PC',
    rank: 'PC',
    name: 'Mukwana Derrick',
    sex: 'Male',
    contact: '+256 706 881 290',
    dateOfBirth: '1995-12-19',
    nin: 'CM951219801BNM',
    ipps: '291048',
    department: 'FFU',
    homeDistrict: 'Mbale',
    tribe: 'Bagisu',
    bank: 'PostBank Uganda',
    branch: 'Tororo Branch',
    accountNumber: '1020391820',
    tin: '1009128302',
    educationLevel: 'A-Level',
    dateOfEnlistment: '2018-05-14',
    dateOfAppointment: '2019-08-20',
    dateOfPromotion: '2020-01-10',
    dateOfPosting: '2023-04-15',
    status: 'active'
  },
  {
    id: 'off-10',
    forceNumber: '71008 PC',
    rank: 'PC',
    name: 'Akello Janet Mary',
    sex: 'Female',
    contact: '+256 777 301 928',
    dateOfBirth: '1996-04-22',
    nin: 'CF960422119WER',
    ipps: '264019',
    department: 'CT',
    homeDistrict: 'Tororo',
    tribe: 'Iteso',
    bank: 'Centenary Rural Development Bank',
    branch: 'Tororo Branch',
    accountNumber: '3100481920',
    tin: '1007182930',
    educationLevel: 'A-Level',
    dateOfEnlistment: '2019-02-11',
    dateOfAppointment: '2020-05-19',
    dateOfPromotion: '2021-01-15',
    dateOfPosting: '2022-06-20',
    status: 'active'
  },
  {
    id: 'off-11',
    forceNumber: '74129 PC',
    rank: 'PC',
    name: 'Kato Dennis Bryan',
    sex: 'Male',
    contact: '+256 789 220 184',
    dateOfBirth: '1997-08-11',
    nin: 'CM970811902QWE',
    ipps: '230194',
    department: 'ICT',
    homeDistrict: 'Jinja',
    tribe: 'Basoga',
    bank: 'DFCU Bank',
    branch: 'Tororo Branch',
    accountNumber: '0104819208',
    tin: '1005192841',
    educationLevel: 'Diploma',
    dateOfEnlistment: '2020-11-03',
    dateOfAppointment: '2021-12-01',
    dateOfPromotion: '2022-05-10',
    dateOfPosting: '2023-02-14',
    status: 'active'
  },
  {
    id: 'off-12',
    forceNumber: '80124 PPC',
    rank: 'PPC',
    name: 'Emukule Charles',
    sex: 'Male',
    contact: '+256 708 912 341',
    dateOfBirth: '1999-01-18',
    nin: 'CM990118029XZY',
    ipps: '184920',
    department: 'general duties',
    homeDistrict: 'Busia',
    tribe: 'Samia',
    bank: 'Stanbic Bank Uganda',
    branch: 'Tororo Main Branch',
    accountNumber: '90300918234',
    tin: '1009812401',
    educationLevel: 'O-Level',
    dateOfEnlistment: '2023-01-15',
    dateOfAppointment: '2024-03-01',
    dateOfPromotion: '2024-03-01',
    dateOfPosting: '2024-04-10',
    status: 'active'
  },
  {
    id: 'off-13',
    forceNumber: '83401 SPC',
    rank: 'SPC',
    name: 'Okware Patrick',
    sex: 'Male',
    contact: '+256 786 540 192',
    dateOfBirth: '1994-06-25',
    nin: 'CM940625910VBN',
    ipps: '160912',
    department: 'general duties',
    homeDistrict: 'Tororo',
    tribe: 'Japadhola',
    bank: 'PostBank Uganda',
    branch: 'Tororo Branch',
    accountNumber: '1020819204',
    tin: '1006182904',
    educationLevel: 'O-Level',
    dateOfEnlistment: '2021-03-10',
    dateOfAppointment: '2021-05-15',
    dateOfPromotion: '2021-05-15',
    dateOfPosting: '2022-01-05',
    status: 'active'
  },
  {
    id: 'off-14',
    forceNumber: '63901 PC',
    rank: 'PC',
    name: 'Nalubega Harriet',
    sex: 'Female',
    contact: '+256 773 992 108',
    dateOfBirth: '1994-09-14',
    nin: 'CF940914902PLM',
    ipps: '320914',
    department: 'medical',
    homeDistrict: 'Iganga',
    tribe: 'Basoga',
    bank: 'Centenary Rural Development Bank',
    branch: 'Tororo Branch',
    accountNumber: '3100781920',
    tin: '1004819201',
    educationLevel: 'Diploma',
    dateOfEnlistment: '2017-04-10',
    dateOfAppointment: '2018-07-12',
    dateOfPromotion: '2019-01-20',
    dateOfPosting: '2023-07-01',
    status: 'leave'
  },
  {
    id: 'off-16',
    forceNumber: '48921 PC',
    rank: 'PC',
    name: 'Mugisha Emmanuel',
    sex: 'Male',
    contact: '0772991044',
    dateOfBirth: '1989-03-12',
    nin: 'CM89012891901B',
    ipps: '882190',
    department: 'general duties',
    homeDistrict: 'Mbarara',
    tribe: 'Banyankole',
    bank: 'Stanbic Bank',
    branch: 'Tororo Branch',
    accountNumber: '903001849102',
    tin: '1004991204',
    educationLevel: 'UACE',
    dateOfEnlistment: '2011-02-15',
    dateOfAppointment: '2012-04-10',
    dateOfPromotion: '2012-04-10',
    dateOfPosting: '2022-01-15',
    status: 'transferred'
  },
  {
    id: 'off-17',
    forceNumber: '33910 SGT',
    rank: 'SGT',
    name: 'Waiswa Patrick',
    sex: 'Male',
    contact: '0782110992',
    dateOfBirth: '1976-11-20',
    nin: 'CM76019910291K',
    ipps: '661092',
    department: 'traffic',
    homeDistrict: 'Jinja',
    tribe: 'Basoga',
    bank: 'Centenary Bank',
    branch: 'Tororo Branch',
    accountNumber: '3100291048',
    tin: '1002910482',
    educationLevel: 'UCE',
    dateOfEnlistment: '1998-09-01',
    dateOfAppointment: '1999-10-15',
    dateOfPromotion: '2015-06-20',
    dateOfPosting: '2020-03-10',
    status: 'discharged'
  }
];

export const INITIAL_WEEKLY_PROGRAM: WeeklyProgram = {
  id: 'wp-2026-w41',
  weekNumber: 41,
  startDate: '2026-10-04',
  endDate: '2026-10-10',
  status: 'approved',
  approvedBy: 'SP Okello James Robert (OC Station)',
  approvedAt: '2026-10-03 16:30',
  createdBy: 'IP Wabwire Ronald (Station Major)',
  createdAt: '2026-10-03 11:15',
  assignments: [
    { id: 'wpa-1', dutyStation: 'counter day', officerIds: ['off-07', 'off-12'], notes: 'Receive complaints, OB register, customer care' },
    { id: 'wpa-2', dutyStation: 'counter night', officerIds: ['off-09'], notes: 'Overnight cell monitoring and intake' },
    { id: 'wpa-3', dutyStation: 'station guard day', officerIds: ['off-13'], notes: 'Main gate sentry and perimeter vigilance' },
    { id: 'wpa-4', dutyStation: 'station guard night', officerIds: ['off-10'], notes: 'Armed perimeter watch' },
    { id: 'wpa-5', dutyStation: 'small get day', officerIds: ['off-12'], notes: 'Pedestrian access screening' },
    { id: 'wpa-6', dutyStation: 'small gate night', officerIds: ['off-13'], notes: 'Pedestrian gate night lockdown' },
    { id: 'wpa-7', dutyStation: 'traffic day', officerIds: ['off-05'], notes: 'Highway roundabouts and weighbridge control' },
    { id: 'wpa-8', dutyStation: 'traffic night', officerIds: ['off-05'], notes: 'Border transit heavy truck compliance' },
    { id: 'wpa-9', dutyStation: 'sanje parking', officerIds: ['off-09'], notes: 'Long-distance cargo trailer holding area' },
    { id: 'wpa-10', dutyStation: 'railways', officerIds: ['off-07'], notes: 'Malaba border railway siding inspection' },
    { id: 'wpa-11', dutyStation: 'motorized patrol day', officerIds: ['off-05', 'off-09'], notes: 'Patrol Pickup UP-5401 - OSBP bypass corridor' },
    { id: 'wpa-12', dutyStation: 'motorized patrol night', officerIds: ['off-07', 'off-13'], notes: 'Border buffer line and smuggling footpaths' },
    { id: 'wpa-13', dutyStation: 'camera on duty', officerIds: ['off-11'], notes: 'Live monitoring of border perimeter cameras' },
    { id: 'wpa-14', dutyStation: 'communications fire standby', officerIds: ['off-11'], notes: 'VHF base radio monitoring & emergency relay' },
    { id: 'wpa-15', dutyStation: 'custom access gate day', officerIds: ['off-10'], notes: 'One Stop Border Post (OSBP) inbound gate' },
    { id: 'wpa-16', dutyStation: 'custom access gate night', officerIds: ['off-09'], notes: 'OSBP outbound freight barrier' },
    { id: 'wpa-17', dutyStation: 'baggage scanner day', officerIds: ['off-08'], notes: 'Customs shed cargo & baggage X-Ray inspection' },
    { id: 'wpa-18', dutyStation: 'baggage scanner night', officerIds: ['off-08'], notes: 'Transit baggage scan' },
    { id: 'wpa-19', dutyStation: 'CCTV', officerIds: ['off-11'], notes: 'Station operations & holding cell camera surveillance' },
    { id: 'wpa-20', dutyStation: 'clinic', officerIds: ['off-14'], notes: 'First aid, medical referral & suspect screening' },
    { id: 'wpa-21', dutyStation: 'CFPU', officerIds: ['off-06'], notes: 'Child and Family Protection Unit desk' },
    { id: 'wpa-22', dutyStation: 'court orderly', officerIds: ['off-04'], notes: 'Tororo Chief Magistrate Court remand dispatch' },
    { id: 'wpa-23', dutyStation: 'MCB', officerIds: ['off-02'], notes: 'Motorcycle squad border patrol' }
  ]
};

export const INITIAL_DUTY_NCOS: MonthlyDutyRoster = {
  id: 'roster-nco-2026-10',
  type: 'Duty NCOs',
  month: 'October 2026',
  year: 2026,
  monthIndex: 9,
  status: 'approved',
  approvedBy: 'SP Okello James Robert (OC Station)',
  approvedAt: '2026-10-01 08:00',
  createdBy: 'IP Wabwire Ronald (Station Major)',
  createdAt: '2026-09-30 17:00',
  entries: Array.from({ length: 31 }, (_, idx) => {
    const day = idx + 1;
    const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;
    // Rotate among NCO ranks (SGT, CPL)
    const ncoPool = [
      INITIAL_OFFICERS[4], // SGT Ouma
      INITIAL_OFFICERS[5], // SGT Apio
      INITIAL_OFFICERS[6], // CPL Wandera
      INITIAL_OFFICERS[7]  // CPL Chebet
    ];
    const nco = ncoPool[idx % ncoPool.length];
    return {
      dayNumber: day,
      date: dateStr,
      officerId: nco.id,
      forceNumber: nco.forceNumber,
      rank: nco.rank,
      name: nco.name,
      contact: nco.contact,
      remarks: `Shift 0600H to 0600H Day ${day}`
    };
  })
};

export const INITIAL_DUTY_OFFICERS: MonthlyDutyRoster = {
  id: 'roster-do-2026-10',
  type: 'Duty Officers',
  month: 'October 2026',
  year: 2026,
  monthIndex: 9,
  status: 'approved',
  approvedBy: 'SP Okello James Robert (OC Station)',
  approvedAt: '2026-10-01 08:30',
  createdBy: 'IP Wabwire Ronald (Station Major)',
  createdAt: '2026-09-30 17:30',
  entries: Array.from({ length: 31 }, (_, idx) => {
    const day = idx + 1;
    const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;
    // Rotate among senior officers (AIP, IP, ASP, SP)
    const doPool = [
      INITIAL_OFFICERS[1], // IP Wabwire
      INITIAL_OFFICERS[2], // ASP Namaganda
      INITIAL_OFFICERS[3], // AIP Ochieng
      INITIAL_OFFICERS[0]  // SP Okello
    ];
    const officer = doPool[idx % doPool.length];
    return {
      dayNumber: day,
      date: dateStr,
      officerId: officer.id,
      forceNumber: officer.forceNumber,
      rank: officer.rank,
      name: officer.name,
      contact: officer.contact,
      remarks: `Station Supervision & Emergency Command Day ${day}`
    };
  })
};

export const INITIAL_SPECIAL_PROGRAMS: SpecialProgramItem[] = [
  {
    id: 'spec-01',
    title: 'Cross-Border Smuggling Interception & OSBP Perimeter Sweep',
    operationType: 'Joint Border Security Operation',
    location: 'Malaba Railway Crossing & Sanje Bypass',
    startDate: '2026-10-08',
    endDate: '2026-10-12',
    officerInChargeId: 'off-02',
    officerIds: ['off-07', 'off-09', 'off-10', 'off-13'],
    briefingNotes: 'High alert for illicit fuel consignments and undocumented cross-border freight bypassing URA customs booths. Deploy spiked barriers at Sanje entry.',
    status: 'approved',
    approvedBy: 'SP Okello James Robert (OC Station)'
  },
  {
    id: 'spec-02',
    title: 'Tororo District VIP Transit Escort & Highway Clearing',
    operationType: 'VIP Protection & Traffic Management',
    location: 'Malaba-Tororo Highway Corridor',
    startDate: '2026-10-11',
    endDate: '2026-10-11',
    officerInChargeId: 'off-05',
    officerIds: ['off-07', 'off-09'],
    briefingNotes: 'Ministerial transit convoy from Kenya border entry to Tororo municipal boundary. Clear roundabouts 30 minutes prior.',
    status: 'approved',
    approvedBy: 'SP Okello James Robert (OC Station)'
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-01',
    notifyingOfficerId: 'off-01',
    officerName: 'Okello James Robert',
    officerRank: 'SP',
    date: '2026-10-09',
    theme: 'Strict Enforcement of Suspect Detention Timelines & OB Entry Protocol',
    targetRanks: ['SPC', 'PPC', 'PC', 'CPL', 'SGT', 'AIP', 'IP', 'ASP', 'SP'],
    targetDepartments: ['general duties', 'CID', 'CI', 'FFU', 'CT', 'CFPU', 'traffic'],
    content: 'All Counter NCOs and CID investigators are reminded that the 48-hour constitutional detention rule must be rigorously adhered to without exception. No suspect shall remain in Malaba Police Station cells beyond 48 hours without court arraignment or formal police bond approved by OC Station or OC CID.',
    attachmentName: 'IGP_Directive_Detention_Protocols_2026.pdf',
    createdAt: '2026-10-09 09:30'
  },
  {
    id: 'not-02',
    notifyingOfficerId: 'off-02',
    officerName: 'Wabwire Ronald Peter',
    officerRank: 'IP',
    date: '2026-10-08',
    theme: 'Parade and Weekly Uniform Inspection (Bukedi South Regional Standards)',
    targetRanks: ['SPC', 'PPC', 'PC', 'CPL', 'SGT'],
    targetDepartments: ['general duties', 'traffic', 'FFU', 'CT'],
    content: 'There will be a mandatory general station muster parade on Saturday at 0700 hours sharp at the main station yard. All duty personnel not on active shift must attend in full ceremonial gear with polished boots, berets, and valid police warrant cards.',
    attachmentName: 'Station_Routine_Orders_Oct2026.pdf',
    createdAt: '2026-10-08 14:15'
  },
  {
    id: 'not-03',
    notifyingOfficerId: 'off-03',
    officerName: 'Namaganda Sarah Christine',
    officerRank: 'ASP',
    date: '2026-10-07',
    theme: 'Prompt Transmission of Exhibits to Government Analytical Laboratory (GAL)',
    targetRanks: ['PC', 'CPL', 'SGT', 'AIP', 'IP'],
    targetDepartments: ['CID', 'CI', 'traffic'],
    content: 'Investigating Officers with biological samples, narcotics exhibits, or counterfeit currency must ensure Chain of Custody forms (PF 105) are counter-signed and dispatched to GAL Wandegeya within 72 hours of seizure.',
    createdAt: '2026-10-07 11:00'
  }
];

export const INITIAL_SITREP: Sitrep = {
  id: 'sitrep-2026-10-09',
  date: '2026-10-09',
  generatedByOfficerId: 'off-03',
  generatedByName: 'Namaganda Sarah Christine',
  generatedByRole: 'OC CID',
  cases: [
    {
      id: 'c-1',
      caseName: 'Aggravated Robbery',
      penalSection: 'Sec 285 & 286(2) Penal Code Act',
      frequency: 2,
      suspectsMale: 2,
      suspectsFemale: 0
    },
    {
      id: 'c-2',
      caseName: 'Illegal Cross-Border Trade & Customs Evasion',
      penalSection: 'EACCMA Sec 200',
      frequency: 4,
      suspectsMale: 3,
      suspectsFemale: 1
    },
    {
      id: 'c-3',
      caseName: 'Assault Occasioning Actual Bodily Harm',
      penalSection: 'Sec 236 Penal Code Act',
      frequency: 3,
      suspectsMale: 2,
      suspectsFemale: 1
    },
    {
      id: 'c-4',
      caseName: 'Burglary & Theft',
      penalSection: 'Sec 294 Penal Code Act',
      frequency: 2,
      suspectsMale: 1,
      suspectsFemale: 0
    },
    {
      id: 'c-5',
      caseName: 'Drug Trafficking & Possession of Narcotics',
      penalSection: 'Narcotic Drugs Act 2016',
      frequency: 1,
      suspectsMale: 1,
      suspectsFemale: 0
    }
  ],
  custodyDurations: [
    { id: 'cd-1', days: 1, suspectsCount: 6 },
    { id: 'cd-2', days: 2, suspectsCount: 3 },
    { id: 'cd-3', days: 3, suspectsCount: 1 }
  ],
  totalInCells: 10,
  totalMale: 9,
  totalFemale: 1,
  generalSituationRemarks: 'The general security situation in Malaba Town Council, customs bonded zones, and border crossing corridors remains calm and firmly under police control. Routine motorized patrols conducted along Sanje road and railway terminus without major incident.',
  borderMovementRemarks: 'Commercial freight transit flow at One Stop Border Post (OSBP) is normal. Inbound trucks: 412, Outbound trucks: 388. No congestion reported.',
  createdAt: '2026-10-09 18:30'
};

export const INITIAL_POLICE_FORMS: PoliceFormItem[] = [
  {
    id: 'form-01',
    formCode: 'PF 3',
    title: 'Police Form 3: Medical Examination of Victim of Sexual Offence or Assault',
    category: 'Criminal Investigation',
    uploadedBy: 'ASP Namaganda Sarah (OC CID)',
    uploadDate: '2026-09-12',
    fileSize: '412 KB',
    description: 'Statutory form for medical examination and evidentiary documentation by Police Surgeon or registered medical officer.'
  },
  {
    id: 'form-02',
    formCode: 'PF 83',
    title: 'Police Form 83: Request for Post-Mortem Examination',
    category: 'Criminal Investigation',
    uploadedBy: 'AIP Ochieng Moses (Admin CID)',
    uploadDate: '2026-09-12',
    fileSize: '280 KB',
    description: 'Official requisition to pathologist or Government Medical Officer for post-mortem in homicide or sudden death investigations.'
  },
  {
    id: 'form-03',
    formCode: 'PF 105',
    title: 'Police Form 105: Search Certificate and Seizure of Exhibits',
    category: 'Criminal Investigation',
    uploadedBy: 'ASP Namaganda Sarah (OC CID)',
    uploadDate: '2026-09-14',
    fileSize: '310 KB',
    description: 'Mandatory on-site inventory form signed by search officers, suspect, and local council witnesses during property search.'
  },
  {
    id: 'form-04',
    formCode: 'PF 18',
    title: 'Police Form 18: Recognizance on Police Bond and Bail Application',
    category: 'Court & Bond',
    uploadedBy: 'SP Okello James (OC Station)',
    uploadDate: '2026-08-20',
    fileSize: '350 KB',
    description: 'Official undertaking and bond form issued to suspects and sureties pending further inquiries or court appearance.'
  },
  {
    id: 'form-05',
    formCode: 'PF 4',
    title: 'Police Form 4: Criminal Charge Sheet (Formal Arraignment)',
    category: 'Court & Bond',
    uploadedBy: 'AIP Ochieng Moses (Admin CID)',
    uploadDate: '2026-08-20',
    fileSize: '295 KB',
    description: 'Prescribed charge sheet for filing cases before the Tororo Chief Magistrate Court.'
  },
  {
    id: 'form-06',
    formCode: 'PF 24',
    title: 'Police Form 24: Statement of Accused Person (Caution & Charge)',
    category: 'Criminal Investigation',
    uploadedBy: 'ASP Namaganda Sarah (OC CID)',
    uploadDate: '2026-09-01',
    fileSize: '240 KB',
    description: 'Official caution statement taken from suspects under the Evidence (Statements to Police Officers) Rules.'
  },
  {
    id: 'form-07',
    formCode: 'PF 8',
    title: 'Police Form 8: Property Found / Seized Inventory Register',
    category: 'Administrative',
    uploadedBy: 'IP Wabwire Ronald (Station Major)',
    uploadDate: '2026-09-05',
    fileSize: '215 KB',
    description: 'Registration sheet for items recovered from crime scenes or safekept from remanded suspects.'
  },
  {
    id: 'form-08',
    formCode: 'PF 47',
    title: 'Police Form 47: Shift Handover and Takeover Certificate',
    category: 'Administrative',
    uploadedBy: 'IP Wabwire Ronald (Station Major)',
    uploadDate: '2026-09-10',
    fileSize: '190 KB',
    description: 'Certificate documenting transfer of station custody, arms, live ammunition, keys, and prisoners between shifts.'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-01',
    applicantId: 'off-14',
    applicantName: 'Nalubega Harriet',
    applicantRank: 'PC',
    applicantForceNumber: '63901 PC',
    applicantDepartment: 'medical',
    type: 'Leave',
    leaveType: 'Annual',
    startDate: '2026-10-05',
    endDate: '2026-10-19',
    reasonOrDetails: 'Requesting 14 days annual leave to attend to family commitments and medical checkup in Iganga.',
    submittedAt: '2026-10-01 10:20',
    status: 'approved',
    ocComment: 'Approved. Relieved by medical auxiliary staff. Handover medical supplies before departure.',
    processedBy: 'SP Okello James Robert (OC Station)',
    processedAt: '2026-10-02 09:15'
  },
  {
    id: 'app-02',
    applicantId: 'off-09',
    applicantName: 'Mukwana Derrick',
    applicantRank: 'PC',
    applicantForceNumber: '68214 PC',
    applicantDepartment: 'FFU',
    type: 'Complaint',
    reasonOrDetails: 'Shortage of night patrol high-visibility reflective vests and flashlights for the OSBP buffer strip deployment.',
    submittedAt: '2026-10-07 14:00',
    status: 'answered',
    ocComment: 'Noted. Station Major has been directed to requisition 10 reflective jackets and heavy torches from the Bukedi South regional logistics store.',
    processedBy: 'SP Okello James Robert (OC Station)',
    processedAt: '2026-10-08 10:00'
  },
  {
    id: 'app-03',
    applicantId: 'off-07',
    applicantName: 'Wandera Paul Michael',
    applicantRank: 'CPL',
    applicantForceNumber: '58902 CPL',
    applicantDepartment: 'general duties',
    type: 'Point of Information',
    reasonOrDetails: 'Information regarding suspicious unmarked fuel tanker frequently parking near railway siding past 2300 hours.',
    submittedAt: '2026-10-08 16:45',
    status: 'answered',
    ocComment: 'Intelligence shared with OC CID and FFU motorized patrol for immediate surveillance and customs verification.',
    processedBy: 'SP Okello James Robert (OC Station)',
    processedAt: '2026-10-09 08:30'
  },
  {
    id: 'app-04',
    applicantId: 'off-12',
    applicantName: 'Emukule Charles',
    applicantRank: 'PPC',
    applicantForceNumber: '80124 PPC',
    applicantDepartment: 'general duties',
    type: 'Leave',
    leaveType: 'Compassionate',
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    reasonOrDetails: 'Urgent compassionate leave for 3 days to attend my grandmother burial in Busia district.',
    submittedAt: '2026-10-09 11:20',
    status: 'pending'
  }
];

export const INITIAL_ARMORY_GUNS: ArmoryGun[] = [
  {
    id: 'gun-01',
    make: 'AK-47',
    gunNumber: 'UG-POL-449102',
    codeNumber: 'ARM-MAL-001',
    functionality: 'Functional',
    status: 'Issued Out',
    currentIssueId: 'iss-01'
  },
  {
    id: 'gun-02',
    make: 'AK-47',
    gunNumber: 'UG-POL-449108',
    codeNumber: 'ARM-MAL-002',
    functionality: 'Functional',
    status: 'Available'
  },
  {
    id: 'gun-03',
    make: 'AK-47',
    gunNumber: 'UG-POL-449115',
    codeNumber: 'ARM-MAL-003',
    functionality: 'Functional',
    status: 'Available'
  },
  {
    id: 'gun-04',
    make: 'SAR Semi-Automatic Rifle',
    gunNumber: 'UG-POL-310892',
    codeNumber: 'ARM-MAL-004',
    functionality: 'Functional',
    status: 'Available'
  },
  {
    id: 'gun-05',
    make: 'Jericho 9mm Pistol',
    gunNumber: 'UG-POL-992104',
    codeNumber: 'ARM-MAL-005',
    functionality: 'Functional',
    status: 'Available'
  },
  {
    id: 'gun-06',
    make: 'Pistol Star 9mm',
    gunNumber: 'UG-POL-883109',
    codeNumber: 'ARM-MAL-006',
    functionality: 'Functional',
    status: 'Available'
  },
  {
    id: 'gun-07',
    make: 'Teargas Dispersion Launcher',
    gunNumber: 'UG-POL-104928',
    codeNumber: 'ARM-MAL-007',
    functionality: 'Functional',
    status: 'Available'
  },
  {
    id: 'gun-08',
    make: 'AK-47',
    gunNumber: 'UG-POL-209148',
    codeNumber: 'ARM-MAL-008',
    functionality: 'Damaged',
    status: 'Under Maintenance'
  }
];

export const INITIAL_GUN_ISSUES: GunIssueRecord[] = [
  {
    id: 'iss-01',
    gunId: 'gun-01',
    gunNumber: 'UG-POL-449102',
    gunMake: 'AK-47',
    gunCodeNumber: 'ARM-MAL-001',
    officerId: 'off-09',
    officerName: 'Mukwana Derrick',
    officerRank: 'PC',
    officerForceNumber: '68214 PC',
    dutyStation: 'motorized patrol night',
    ammunitionsIssued: 30,
    issueDateTime: '2026-10-09 18:00',
    expectedReturnDateTime: '2026-10-10 06:30',
    issuingArmorerName: 'IP Wabwire Ronald (Station Major)',
    isReturned: false
  },
  {
    id: 'iss-02',
    gunId: 'gun-02',
    gunNumber: 'UG-POL-449108',
    gunMake: 'AK-47',
    gunCodeNumber: 'ARM-MAL-002',
    officerId: 'off-07',
    officerName: 'Wandera Paul Michael',
    officerRank: 'CPL',
    officerForceNumber: '58902 CPL',
    dutyStation: 'custom access gate day',
    ammunitionsIssued: 30,
    issueDateTime: '2026-10-08 06:00',
    expectedReturnDateTime: '2026-10-08 18:00',
    issuingArmorerName: 'IP Wabwire Ronald',
    actualReturnDateTime: '2026-10-08 18:15',
    ammunitionsReturned: 30,
    receivingArmorerName: 'IP Wabwire Ronald',
    returnCondition: 'Good / Intact',
    returnRemarks: 'Weapon cleaned, 30 live rounds verified and deposited to rack.',
    isReturned: true
  },
  {
    id: 'iss-03',
    gunId: 'gun-05',
    gunNumber: 'UG-POL-992104',
    gunMake: 'Jericho 9mm Pistol',
    gunCodeNumber: 'ARM-MAL-005',
    officerId: 'off-03',
    officerName: 'Namaganda Sarah Christine',
    officerRank: 'ASP',
    officerForceNumber: '31904 ASP',
    dutyStation: 'CID Field Interrogation',
    ammunitionsIssued: 15,
    issueDateTime: '2026-10-07 08:30',
    expectedReturnDateTime: '2026-10-07 20:00',
    issuingArmorerName: 'IP Wabwire Ronald',
    actualReturnDateTime: '2026-10-07 19:40',
    ammunitionsReturned: 15,
    receivingArmorerName: 'IP Wabwire Ronald',
    returnCondition: 'Good / Intact',
    returnRemarks: '15 rounds accounted for. Weapon clear.',
    isReturned: true
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    title: 'Weekly Duty Roster Week 41 Approved',
    message: 'Weekly Duty Program for Week 41 (04 Oct - 10 Oct 2026) has been approved by SP Okello James Robert (OC Station) and is now displayed on the notice board.',
    type: 'program_approved',
    timestamp: '2026-10-03 16:30',
    isRead: false,
    linkTab: 'programs'
  },
  {
    id: 'notif-02',
    title: 'New Directive: Detention Protocols',
    message: 'SP Okello James Robert has issued a high-priority station notice regarding 48-Hour detention compliance.',
    type: 'notice_posted',
    timestamp: '2026-10-09 09:30',
    isRead: false,
    linkTab: 'notices'
  },
  {
    id: 'notif-03',
    title: 'Leave Application Approved',
    message: 'Leave application for PC Nalubega Harriet (Medical) has been approved by OC Station.',
    type: 'application_update',
    timestamp: '2026-10-02 09:15',
    isRead: true,
    linkTab: 'applications'
  },
  {
    id: 'notif-04',
    title: 'Daily Evening Sitrep Dispatched',
    message: 'Sitrep for 09 Oct 2026 compiled by OC CID Namaganda Sarah has been submitted.',
    type: 'sitrep_generated',
    timestamp: '2026-10-09 18:30',
    isRead: false,
    linkTab: 'sitrep'
  }
];

export const INITIAL_INCIDENT_REPORTS = [
  {
    id: 'inc-01',
    date: '2026-10-09',
    officerCompilingId: 'off-03',
    officerCompilingName: 'Namaganda Sarah Christine',
    officerCompilingRank: 'ASP',
    officerCompilingForceNumber: '31904 ASP',
    dateTimeOfOccurrence: '2026-10-09 02:40',
    placeOfOccurrence: 'Malaba-Tororo Highway near Railway Siding (Mile 3)',
    reporterParticulars: 'Waiswa John Baptist, Age 38, Commercial Truck Driver with Transit Freight Ltd, Contact: +256 774 219 008, NIN: CM860149021KLP',
    suspectParticulars: 'Three unidentified male adults armed with metallic iron bars and machetes, clad in dark jackets (Unknown, fled on unmarked motorcycle)',
    victimParticulars: 'Waiswa John Baptist (Driver) and Kasasira Moses (Turnboy)',
    deceasedParticulars: 'None reported',
    briefFacts: 'Reporter reported to Malaba Station counter that while driving trailer registration number UBL 492X carrying assorted containerized dry cargo from Mombasa port to Kampala, he was ambushed near the railway crossing by armed thugs who barricaded the road with heavy logs, smashed the cabin passenger window, and robbed cash amounting to UGX 1,450,000 and two smartphones.',
    policeAction: 'Scene was immediately visited by motorized patrol unit UP-5401 led by CPL Wandera Paul. Scene photographed, road obstruction cleared, and cordoned. Sniffer dog deployed towards Sanje village. Statements recorded from reporter and turnboy. Patrols intensified along the dark railway buffer corridor.',
    findings: 'Preliminary findings establish that the gang targeted slow-moving heavy transit trucks at the railway steep bump. One damaged Nokia phone belonging to the suspects was recovered at the scene and secured as exhibit for cyber-forensic analysis.',
    pendingInquiries: '1. Tracking IMEIs of stolen smartphones. 2. Processing recovered suspect phone for call data records. 3. Interviewing local residents around Sanje junction.',
    conclusion: 'A general inquiry file SD 04/09/10/2026 opened under Aggravated Robbery contrary to Sec 285 & 286(2) PCA. Operations ongoing to trace and apprehend suspects.',
    createdAt: '2026-10-09 08:30'
  },
  {
    id: 'inc-02',
    date: '2026-10-08',
    officerCompilingId: 'off-04',
    officerCompilingName: 'Ochieng Moses David',
    officerCompilingRank: 'AIP',
    officerCompilingForceNumber: '39412 AIP',
    dateTimeOfOccurrence: '2026-10-08 15:10',
    placeOfOccurrence: 'Malaba OSBP Inbound Customs Inspection Bay No. 4',
    reporterParticulars: 'Mukasa Dennis, Age 42, Uganda Revenue Authority (URA) Customs Enforcement Officer, Contact: +256 782 990 114',
    suspectParticulars: 'Owor Peter, Age 31, Resident of Malaba Town Council, Cell: Customs Ward',
    victimParticulars: 'State / Uganda Revenue Authority',
    deceasedParticulars: 'None',
    briefFacts: 'URA customs officers while running baggage scanner inspection on passenger luggage arriving from Kenya border intercepted a large carton containing 42 counterfeit $100 Federal Reserve banknotes disguised inside electronic sound equipment.',
    policeAction: 'CID Admin AIP Ochieng Moses responded and took custody of the suspect and exhibits. Counterfeit notes sealed under PF 105. Suspect detained in station cells. Caution statement recorded.',
    findings: 'Notes examined under ultraviolet light confirmed high-grade counterfeit notes with identical serial numbers. Suspect claims he was hired as a carrier from Busia town.',
    pendingInquiries: '1. Dispatching currency specimens to Bank of Uganda currency analysis lab. 2. Interrogating suspect regarding recipient in Kampala.',
    conclusion: 'Charged with Possession of Counterfeit Currency under Section 362 PCA.',
    createdAt: '2026-10-08 18:00'
  }
];

export const INITIAL_CONTACTS = [
  {
    id: 'cnt-01',
    name: 'SP Okello James Robert',
    designation: 'Officer in Charge (OC Station)',
    contact: '+256 772 491 802',
    category: 'Police Command',
    notes: 'Overall station commander - Malaba Police Station'
  },
  {
    id: 'cnt-02',
    name: 'IP Wabwire Ronald Peter',
    designation: 'Station Major / Operations Officer',
    contact: '+256 782 309 441',
    category: 'Police Command',
    notes: 'Station discipline, duty rosters, logistics & armory'
  },
  {
    id: 'cnt-03',
    name: 'ASP Namaganda Sarah Christine',
    designation: 'Officer in Charge CID (OC CID)',
    contact: '+256 701 552 899',
    category: 'Police Command',
    notes: 'Criminal investigations, crime intelligence, court arraignments'
  },
  {
    id: 'cnt-04',
    name: 'AIP Ochieng Moses David',
    designation: 'Admin CID / Court Liaison',
    contact: '+256 779 812 004',
    category: 'Police Command',
    notes: 'CID administration and Tororo Chief Magistrate Court liaison'
  },
  {
    id: 'cnt-05',
    name: 'SSP Mugabi Patrick',
    designation: 'District Police Commander (DPC) - Tororo',
    contact: '+256 772 884 901',
    category: 'Police Command',
    notes: 'Tororo District Police Headquarters'
  },
  {
    id: 'cnt-06',
    name: 'ACP Kyaligonza Julius',
    designation: 'Regional Police Commander (RPC) - Bukedi South',
    contact: '+256 772 110 994',
    category: 'Police Command',
    notes: 'Bukedi South Regional Police HQ Tororo'
  },
  {
    id: 'cnt-07',
    name: 'Malaba Counter Emergency Desk',
    designation: 'Station Duty NCO / Counter Desk (24 Hours)',
    contact: '+256 788 009 999',
    category: 'Internal Department',
    notes: 'Toll-free emergency line and public counter reception'
  },
  {
    id: 'cnt-08',
    name: 'URA Customs Enforcement Station Manager',
    designation: 'Manager Customs OSBP Malaba',
    contact: '+256 706 441 200',
    category: 'Sister Security Agencies',
    notes: 'One Stop Border Post (OSBP) joint customs operations'
  },
  {
    id: 'cnt-09',
    name: 'GISO Malaba Town Council',
    designation: 'Gombolola Internal Security Officer (ISO)',
    contact: '+256 781 229 045',
    category: 'Sister Security Agencies',
    notes: 'Internal security intelligence coordination'
  },
  {
    id: 'cnt-10',
    name: 'Tororo Chief Magistrate Court Registry',
    designation: 'Court Clerk & Remand Warrant Desk',
    contact: '+256 454 445 102',
    category: 'Local Administration',
    notes: 'Remand warrants, production warrants and criminal cause lists'
  },
  {
    id: 'cnt-11',
    name: 'Malaba Health Centre IV Emergency Ambulance',
    designation: 'Senior Medical Officer In-Charge',
    contact: '+256 774 918 333',
    category: 'Emergency & Health',
    notes: 'Emergency medical referral and Police Surgeon liaison'
  },
  {
    id: 'cnt-12',
    name: 'Tororo Fire & Rescue Station',
    designation: 'Fire Officer In-Charge',
    contact: '+256 772 999 112',
    category: 'Emergency & Health',
    notes: 'Fire standby & highway hazardous chemical accident response'
  }
];

export const INITIAL_EQUIPMENT: import('../types').StationEquipment[] = [
  // Furniture
  {
    id: 'eq-01',
    itemCode: 'MPS/FURN/001',
    name: 'Executive Mahogany Desk & High-Back Leather Swivel Chair',
    category: 'Furniture',
    quantity: 1,
    condition: 'Good / Functional',
    location: 'OC Station Office',
    assignedCustodian: 'SP Okello James (OC Station)',
    status: 'In Service',
    dateAcquired: '2023-04-12',
    notes: 'Double pedestal with central locking drawer and glass top cover.'
  },
  {
    id: 'eq-02',
    itemCode: 'MPS/FURN/002',
    name: 'Heavy Steel 4-Drawer Fireproof Filing Cabinets',
    category: 'Furniture',
    quantity: 3,
    condition: 'Good / Functional',
    location: 'CID Registry & Archives',
    assignedCustodian: 'D/AIP Ochieng Moses',
    status: 'In Service',
    dateAcquired: '2022-08-15',
    notes: 'Secures active criminal dockets, CRB registers and confidential police case files.'
  },
  {
    id: 'eq-03',
    itemCode: 'MPS/FURN/003',
    name: 'Heavy Timber Long Benches (Public Counter Waiting Area)',
    category: 'Furniture',
    quantity: 4,
    condition: 'Good / Functional',
    location: 'Charge Office / Counter',
    assignedCustodian: 'Duty NCO',
    status: 'In Service',
    dateAcquired: '2021-11-20',
    notes: 'Mvule hardwood benches for complainants, witnesses and visitors.'
  },
  {
    id: 'eq-04',
    itemCode: 'MPS/FURN/004',
    name: 'Holding Cell Reinforced Concrete-Anchored Wooden Benches',
    category: 'Furniture',
    quantity: 2,
    condition: 'Good / Functional',
    location: 'Station Male & Female Cells',
    assignedCustodian: 'Cell Guard Orderly',
    status: 'In Service',
    dateAcquired: '2022-01-10',
    notes: 'Bolted heavy hardwood benches inside lockup cell rooms.'
  },
  {
    id: 'eq-05',
    itemCode: 'MPS/FURN/005',
    name: 'Steel Armor Safe (Dual Key & Digital Combination)',
    category: 'Furniture',
    quantity: 1,
    condition: 'Good / Functional',
    location: 'Armory & Cash Custody',
    assignedCustodian: 'Station Armorer (Sgt Wabwire)',
    status: 'In Service',
    dateAcquired: '2023-01-05',
    notes: 'Heavy Chubb safe for ammunition records, exhibit cash and high-value seized articles.'
  },
  {
    id: 'eq-06',
    itemCode: 'MPS/FURN/006',
    name: 'Office Desks & Fabric Typist Chairs',
    category: 'Furniture',
    quantity: 6,
    condition: 'Fair',
    location: 'General Administration Office',
    assignedCustodian: 'Station Clerk / Typist',
    status: 'In Service',
    dateAcquired: '2021-06-18',
    notes: '2 chairs require wheel caster replacement.'
  },
  // Transport & Vehicles
  {
    id: 'eq-07',
    itemCode: 'MPS/VEH/001',
    name: 'Toyota Land Cruiser 4WD Patrol Pickup (UP-5401)',
    category: 'Transport / Vehicles',
    quantity: 1,
    condition: 'Good / Functional',
    location: 'Station Motor Pool',
    assignedCustodian: 'Cpl Chebet David (Station Driver)',
    status: 'In Service',
    dateAcquired: '2023-09-10',
    notes: 'Fitted with police VHF antenna, siren, and canvas canopy. Fuel: 85%.'
  },
  {
    id: 'eq-08',
    itemCode: 'MPS/VEH/002',
    name: 'Yamaha DT 125 Police Motorcycle (UP-3108)',
    category: 'Transport / Vehicles',
    quantity: 2,
    condition: 'Good / Functional',
    location: 'Traffic Unit Shed',
    assignedCustodian: 'PC Musoke Brian',
    status: 'In Service',
    dateAcquired: '2022-03-24',
    notes: 'Highway patrol, traffic escort and rapid summons delivery.'
  },
  // Communications
  {
    id: 'eq-09',
    itemCode: 'MPS/COMM/001',
    name: 'Motorola VHF Base Station Transceiver & Mast Antenna',
    category: 'Communication',
    quantity: 1,
    condition: 'Good / Functional',
    location: 'Radio Communications Room',
    assignedCustodian: 'Signals Officer',
    status: 'In Service',
    dateAcquired: '2023-02-18',
    notes: 'Bukedi South regional police net (Channel 4 / 154.225 MHz).'
  },
  {
    id: 'eq-10',
    itemCode: 'MPS/COMM/002',
    name: 'Motorola DP4801 Handheld Digital Two-Way Radios (Walkie-Talkies)',
    category: 'Communication',
    quantity: 12,
    condition: 'Good / Functional',
    location: 'Counter & OSBP Deployment',
    assignedCustodian: 'Duty NCO',
    status: 'In Service',
    dateAcquired: '2023-05-14',
    notes: '10 active on field duty, 2 units in charging cradle.'
  },
  // Office Equipment
  {
    id: 'eq-11',
    itemCode: 'MPS/OFF/001',
    name: 'HP ProDesk Desktop Computer Core i7 & APC 1500VA UPS',
    category: 'Office Equipment',
    quantity: 2,
    condition: 'Good / Functional',
    location: 'Charge Office & OC CID Office',
    assignedCustodian: 'Station IT / Data Clerk',
    status: 'In Service',
    dateAcquired: '2024-01-11',
    notes: 'Used for police records, nominal roll maintenance and sitrep compilation.'
  },
  {
    id: 'eq-12',
    itemCode: 'MPS/OFF/002',
    name: 'HP LaserJet Enterprise MFP Multi-Function Printer / Scanner',
    category: 'Office Equipment',
    quantity: 1,
    condition: 'Good / Functional',
    location: 'OC Station Secretariat',
    assignedCustodian: 'Secretary',
    status: 'In Service',
    dateAcquired: '2023-10-02',
    notes: 'Prints circulars, nominal rolls and official letters.'
  },
  // Tactical & Security
  {
    id: 'eq-13',
    itemCode: 'MPS/TACT/001',
    name: 'Standard Issue Steel Hinged Handcuffs with Universal Keys',
    category: 'Tactical & Security',
    quantity: 24,
    condition: 'Good / Functional',
    location: 'Counter Drawer & Armory',
    assignedCustodian: 'Duty NCO',
    status: 'In Service',
    dateAcquired: '2022-07-19',
    notes: '18 pairs issued to active field officers, 6 pairs held in reserve.'
  },
  {
    id: 'eq-14',
    itemCode: 'MPS/TACT/002',
    name: 'Riot Control Polycarbonate Shields & Tactical Helmets',
    category: 'Tactical & Security',
    quantity: 15,
    condition: 'Good / Functional',
    location: 'Tactical Stores Room',
    assignedCustodian: 'Operations Officer',
    status: 'In Store',
    dateAcquired: '2021-09-08',
    notes: 'OSBP public order standby equipment.'
  },
  // Surveillance & Power
  {
    id: 'eq-15',
    itemCode: 'MPS/POW/001',
    name: 'Perkins 15kVA Automatic Diesel Standby Generator',
    category: 'Surveillance & Power',
    quantity: 1,
    condition: 'Good / Functional',
    location: 'Generator Shed (Rear Yard)',
    assignedCustodian: 'Station Quartermaster',
    status: 'In Service',
    dateAcquired: '2022-04-10',
    notes: 'Automatic transfer switch active; provides emergency power to cells, communications and floodlights.'
  }
];

export const INITIAL_NON_STATION_WEAPONS: import('../types').NonStationWeapon[] = [
  {
    id: 'nsw-01',
    depositorName: 'Capt. Musoke David',
    depositorForceNumber: 'RA/194012',
    agencyOrUnit: 'UPDF 4th Division Infantry (Gulu)',
    depositorContact: '0772481902',
    make: 'Pistol Jericho 9mm',
    gunNumber: 'UG-MOD-772910',
    ammunitionRounds: 15,
    depositDateTime: '2026-10-09 16:30',
    receivingArmorerName: 'CPL Wandera John (Incharge Armory)',
    purpose: 'Transit through Malaba OSBP border to Kenya for regional joint security liaison',
    status: 'In Safe Custody'
  },
  {
    id: 'nsw-02',
    depositorName: 'Sgt. Kidega Peter',
    depositorForceNumber: 'URA/ENF/849',
    agencyOrUnit: 'Uganda Revenue Authority (Enforcement Unit)',
    depositorContact: '0782390144',
    make: 'AK-47 Rifle',
    gunNumber: 'UG-URA-440192',
    ammunitionRounds: 30,
    depositDateTime: '2026-10-10 08:15',
    receivingArmorerName: 'CPL Wandera John (Incharge Armory)',
    purpose: 'Overnight transit custody during customs surveillance operation at Lwakhakha / Malaba border',
    status: 'In Safe Custody'
  },
  {
    id: 'nsw-03',
    depositorName: 'ASP Nsubuga Francis',
    depositorForceNumber: '44810 ASP',
    agencyOrUnit: 'Anti-Stock Theft Unit (ASTU Karamoja Command)',
    depositorContact: '0701948210',
    make: 'Pistol Star 9mm',
    gunNumber: 'UG-POL-108492',
    ammunitionRounds: 16,
    depositDateTime: '2026-10-06 14:00',
    receivingArmorerName: 'CPL Wandera John (Incharge Armory)',
    purpose: 'Court witness appearance at Tororo Chief Magistrates Court; deposited for safe custody',
    status: 'Retrieved / Released',
    retrievalDateTime: '2026-10-07 17:45',
    releasedByArmorerName: 'CPL Wandera John (Incharge Armory)',
    retrievalRemarks: 'Weapon returned to officer with all 16 rounds verified intact.'
  }
];
