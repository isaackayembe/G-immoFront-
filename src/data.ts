import { Property } from './types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Penthouse Panoramique',
    price: '$ 4,250,000',
    numericPrice: 4250000,
    location: 'Kinshasa, Gombe',
    commune: 'Gombe',
    type: 'Résidentiel',
    status: 'Disponible',
    surface: 240,
    bedrooms: 4,
    tag: 'EXCLUSIVITÉ',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3apctYUCGHq-9Cp5FsUHDCIh5CRHq2BEx0Z9LhvbER9cm_FHt8-V3sbzMecyBNbsy8gNF5osYZdjb5oAJ3CUsCAHhFtt5LOr1D97cRla-IXI7EXHgPuzJPpXhbJc6dD0h_e7vmm_mYXU5cg87bIfQ8goIo8jC6ENAAjtlvZ2dsZnCNyZJUKuJMYO5XcjFDLk-Fp7Q52GQWtEcK8bDjxtl-3OdzsT9DeTMFunF-u5EjDWfszR1b3sq',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3apctYUCGHq-9Cp5FsUHDCIh5CRHq2BEx0Z9LhvbER9cm_FHt8-V3sbzMecyBNbsy8gNF5osYZdjb5oAJ3CUsCAHhFtt5LOr1D97cRla-IXI7EXHgPuzJPpXhbJc6dD0h_e7vmm_mYXU5cg87bIfQ8goIo8jC6ENAAjtlvZ2dsZnCNyZJUKuJMYO5XcjFDLk-Fp7Q52GQWtEcK8bDjxtl-3OdzsT9DeTMFunF-u5EjDWfszR1b3sq',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Exceptionnel penthouse offrant une vue imprenable à 360° sur la ville et le fleuve Congo. Prestations haut de gamme, domotique intégrée et terrasse privative.',
    amenities: ['Piscine', 'Sécurité 24/7', 'Domotique', 'Vue Fleuve']
  },
  {
    id: 'prop-2',
    title: 'Appartement Haussmannien',
    price: '$ 2,100,000',
    numericPrice: 2100000,
    location: 'Kinshasa, Ngaliema',
    commune: 'Ngaliema',
    type: 'Résidentiel',
    status: 'Disponible',
    surface: 180,
    bedrooms: 3,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD00bhHiH7znuWTlaeq1ilFb4l3EYL1-Y-Z0pDeYBRSQFduJjd6vFFmS-F0IIEW2uApVGOXHaDHHa8WWU9BjI5B15tlYR8SyD8-e9RgJJyoCARqE2KiwBu6PZhtHellLvu2faTG1VmpRcCJpPpc33j7sCJaXm3PBWmncE3dpdAORJZboCUyIu3EQZFW4vUgRn308jPWbX4MhupuCkO9GT6bEHxj5qaSjQWlz4fz0WTgZTlWJ0O4FLw0',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD00bhHiH7znuWTlaeq1ilFb4l3EYL1-Y-Z0pDeYBRSQFduJjd6vFFmS-F0IIEW2uApVGOXHaDHHa8WWU9BjI5B15tlYR8SyD8-e9RgJJyoCARqE2KiwBu6PZhtHellLvu2faTG1VmpRcCJpPpc33j7sCJaXm3PBWmncE3dpdAORJZboCUyIu3EQZFW4vUgRn308jPWbX4MhupuCkO9GT6bEHxj5qaSjQWlz4fz0WTgZTlWJ0O4FLw0',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Sublime appartement au style haussmannien revisité, alliant moulures d\'époque et parquet en point de Hongrie avec un aménagement contemporain.',
    amenities: ['Balcon', 'Sécurité 24/7', 'Ascenseur Privé']
  },
  {
    id: 'prop-3',
    title: 'Villa Contemporaine',
    price: '$ 3,800,000',
    numericPrice: 3800000,
    location: 'Kinshasa, Limete',
    commune: 'Limete',
    type: 'Villa',
    status: 'Disponible',
    surface: 320,
    rooms: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeg-UWy2PHXUP38Q7mTiQgPCMOlEsOXNHx1rqqN9rDiLxsk4qpSFQC7HqyNrj-UddPddvjGBHf5mut7Nm_ki3GCzXGU5Y36NN7OiCMBXIvpfUDu_Bmh_6ThunQl5bQ-8K8F672z1PokBZHZ5_Fp8ittDgMCoV6RDlf2hQ4ATN9KO_xuzOr44EHVm_27KVhbniUVpIpPmJFCzAufeZVgw7qJxazEtm9SVtddYK7dVlv6ELPiE2eavun',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCeg-UWy2PHXUP38Q7mTiQgPCMOlEsOXNHx1rqqN9rDiLxsk4qpSFQC7HqyNrj-UddPddvjGBHf5mut7Nm_ki3GCzXGU5Y36NN7OiCMBXIvpfUDu_Bmh_6ThunQl5bQ-8K8F672z1PokBZHZ5_Fp8ittDgMCoV6RDlf2hQ4ATN9KO_xuzOr44EHVm_27KVhbniUVpIpPmJFCzAufeZVgw7qJxazEtm9SVtddYK7dVlv6ELPiE2eavun',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Propriété d\'exception aux lignes épurées et géométriques, équipée d\'une piscine à débordement et d\'un jardin paysagé sécurisé.',
    amenities: ['Piscine', 'Sécurité 24/7', 'Domotique', 'Jardin']
  },
  {
    id: 'prop-4',
    title: 'Loft Industriel',
    price: '$ 1,250,000',
    numericPrice: 1250000,
    location: 'Limete, Kinshasa',
    commune: 'Limete',
    type: 'Commercial',
    status: 'En cours',
    surface: 290,
    rooms: 4,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Espace d\'architecte exceptionnel avec volumes généreux, briques apparentes et grandes verrières baignées de lumière.',
    amenities: ['Climatisation Centralisée', 'Parking']
  },
  {
    id: 'prop-5',
    title: 'Plateau Bureaux Premium',
    price: '$ 12,200,000',
    numericPrice: 12200000,
    location: 'Ngaliema, Kinshasa',
    commune: 'Ngaliema',
    type: 'Commercial',
    status: 'En cours',
    surface: 1200,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpphZaWxcD68QAGN8FXISzbr2EVl_4TDE_AS7ZuTVZH9WuM0wv5QxYT3T7z6PlkCyqk7fFtbNc-6rO0ho2w5By-uuLVUfM0c9v5i6BgQlYLRKJrp0tJxrhJemAM9mpkD9GEavQNJBTgwdaTXMxVklR4mUFgeH4YxL7nJYI-dU5wdkPEhxxxBaISi_grEFRIG2SN4WAZ-BaQczm--4Dg0kGRT_yIyjO1tNIkmAsUHLibx78cosT7oeH',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCpphZaWxcD68QAGN8FXISzbr2EVl_4TDE_AS7ZuTVZH9WuM0wv5QxYT3T7z6PlkCyqk7fFtbNc-6rO0ho2w5By-uuLVUfM0c9v5i6BgQlYLRKJrp0tJxrhJemAM9mpkD9GEavQNJBTgwdaTXMxVklR4mUFgeH4YxL7nJYI-dU5wdkPEhxxxBaISi_grEFRIG2SN4WAZ-BaQczm--4Dg0kGRT_yIyjO1tNIkmAsUHLibx78cosT7oeH',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Immeuble tertiaire haut de gamme pour siège social institutionnel, doté de normes environnementales internationales.',
    amenities: ['Sécurité 24/7', 'Fibre Optique', 'Parking 50 places']
  },
  {
    id: 'prop-6',
    title: 'Hôtel Particulier / Manoir',
    price: 'Confidentiel',
    numericPrice: 15000000,
    location: 'Limete, Kinshasa',
    commune: 'Limete',
    type: 'Hôtel Particulier',
    status: 'Vendu',
    surface: 850,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC03LIUrRZm9BgRfQ33GujMboBRmpUp-Ga1mUockk568Lpj1-lS3imK_MHEVV5LYywh9SuH9Ufc9imEnEQ8gOnbSWYtJTg38HfTgmT-dY-rIuJ6w9J0S5MBLmkFse4UpRepGeixyJYEhM36Pdb4frVPXjdu4jKb0xlRbnNFV_8tvdS7sja9IHTkiXHc939bvLXnrrZpvzLXcOcEnkCEpydGBHuardNdSEPZooDBTsIpcMRTig-lPtzw',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC03LIUrRZm9BgRfQ33GujMboBRmpUp-Ga1mUockk568Lpj1-lS3imK_MHEVV5LYywh9SuH9Ufc9imEnEQ8gOnbSWYtJTg38HfTgmT-dY-rIuJ6w9J0S5MBLmkFse4UpRepGeixyJYEhM36Pdb4frVPXjdu4jKb0xlRbnNFV_8tvdS7sja9IHTkiXHc939bvLXnrrZpvzLXcOcEnkCEpydGBHuardNdSEPZooDBTsIpcMRTig-lPtzw',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Résidence historique majestueuse au cœur d\'un parc arboré privé. Élégance intemporelle et discrétion garantie.',
    amenities: ['Parc Privé', 'Piscine', 'Maison de Gardien']
  },
  {
    id: 'prop-draft-1',
    title: 'Villa Tropicale Kinsuka Fleuve',
    price: '$ 1,850,000',
    numericPrice: 1850000,
    location: 'Kinshasa, Ngaliema',
    commune: 'Ngaliema',
    type: 'Villa',
    status: 'Brouillon',
    surface: 520,
    bedrooms: 5,
    rooms: 6,
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Brouillon en cours de validation : Villa contemporaine avec vue plongeante sur les rapides du fleuve, piscine miroir et finitions en marbre d\'Italie.',
    amenities: ['Piscine', 'Vue Fleuve', 'Sécurité 24/7', 'Groupe Électrogène'],
    address: 'Kinsuka Pêcheurs, Ngaliema'
  },
  {
    id: 'prop-draft-2',
    title: 'Duplex Haut Standing Batetela',
    price: '$ 950,000',
    numericPrice: 950000,
    location: 'Kinshasa, Gombe',
    commune: 'Gombe',
    type: 'Résidentiel',
    status: 'Brouillon',
    surface: 210,
    bedrooms: 3,
    rooms: 4,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Brouillon : Duplex lumineux en plein centre des affaires, idéal pour investissement locatif diplomatique.',
    amenities: ['Ascenseur', 'Sécurité 24/7', 'Parking Sous-sol'],
    address: 'Boulevard du 30 Juin, Gombe'
  }
];

export const LOGO_URL = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

