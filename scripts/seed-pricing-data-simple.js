// Simple script to display the pricing data that should be added to Firebase

// Initial pricing data
const initialPricingData = [
  {
    title: 'Jamboree Game',
    subtitle: 'Registration + Jersey',
    price: 23.50,
    serviceFee: 3.00,
    features: [
      'Single game registration',
      'Official team jersey',
      'Game day participation',
      'Basic stats tracking',
      'Team photo inclusion'
    ],
    popular: false,
    buttonText: 'Register Now',
    buttonClass: 'btn-outline-primary',
    itemType: 'jamboree',
    category: 'player',
    isActive: true
  },
  {
    title: 'Jamboree + Season',
    subtitle: 'Complete package',
    price: 85.50,
    serviceFee: 3.00,
    features: [
      'Jamboree game registration',
      'Complete season access',
      'Official team jersey',
      'Priority team placement',
      'All games & playoffs',
      'Premium stats package',
      'Exclusive team events',
      'Season highlight reel'
    ],
    popular: true,
    buttonText: 'Get Started',
    buttonClass: 'btn-primary',
    itemType: 'bundle',
    category: 'player',
    isActive: true
  },
  {
    title: 'Complete Season',
    subtitle: 'Full season access',
    price: 56.00,
    serviceFee: 3.00,
    features: [
      'Complete season registration',
      'All regular season games',
      'Playoff eligibility',
      'Official team jersey',
      'Advanced stats tracking',
      'Team events access',
      'Season awards eligibility'
    ],
    popular: false,
    buttonText: 'Join Season',
    buttonClass: 'btn-outline-primary',
    itemType: 'season',
    category: 'player',
    isActive: true
  },
  {
    title: 'Assistant Coach',
    subtitle: 'Support role',
    price: 42.00,
    serviceFee: 3.00,
    features: [
      'Assistant coaching role',
      'Team management access',
      'Player development training',
      'Game day sideline access',
      'Coach certification',
      'Equipment provided'
    ],
    popular: false,
    buttonText: 'Apply Now',
    buttonClass: 'btn-outline-primary',
    itemType: 'assistant_coach',
    category: 'coach',
    isActive: true
  },
  {
    title: 'Head Coach',
    subtitle: 'Leadership role',
    price: 72.00,
    serviceFee: 3.00,
    features: [
      'Head coaching position',
      'Full team management',
      'Strategic planning authority',
      'Player recruitment rights',
      'Advanced coach training',
      'Leadership certification',
      'Premium equipment package'
    ],
    popular: true,
    buttonText: 'Lead Team',
    buttonClass: 'btn-primary',
    itemType: 'head_coach',
    category: 'coach',
    isActive: true
  }
];

console.log('Pricing data to be added to Firebase:');
console.log(JSON.stringify(initialPricingData, null, 2));
console.log('\nTo add this data to Firebase:');
console.log('1. Go to your Firebase Console');
console.log('2. Navigate to Firestore Database');
console.log('3. Create a new collection called "pricing"');
console.log('4. Add each of the above documents to the collection');
