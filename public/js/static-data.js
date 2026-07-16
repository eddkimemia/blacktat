/**
 * Static fallback data when the Express API is unavailable
 * (e.g. GitHub Pages static hosting). Booking still needs a live API host.
 */
(function (global) {
  'use strict';

  global.BMI_STATIC = {
    sites: [
      {
        id: 'site-toronto',
        slug: 'toronto',
        name: 'Black Maple Ink Toronto',
        city: 'Toronto',
        region: 'ON',
        country: 'CA',
        postalCode: 'M6J 1J6',
        street: '1247 Queen Street West',
        phone: '+1 (416) 555-0199',
        email: 'toronto@blackmapleink.ca',
        hours: 'Tue–Fri 11–8 · Sat 10–8 · Sun 11–6 · Mon closed',
        image:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80&auto=format&fit=crop',
        blurb:
          'Our Queen West flagship — private suites, sterilization lab, and the full Black Maple experience.',
      },
      {
        id: 'site-vancouver',
        slug: 'vancouver',
        name: 'Black Maple Ink Vancouver',
        city: 'Vancouver',
        region: 'BC',
        country: 'CA',
        postalCode: 'V6B 1A1',
        street: '88 West Cordova Street',
        phone: '+1 (604) 555-0142',
        email: 'vancouver@blackmapleink.ca',
        hours: 'Tue–Thu 11–7 · Fri 11–8 · Sat 10–6 · Sun–Mon closed',
        image:
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80&auto=format&fit=crop',
        blurb:
          'Gastown / Cordova studio specializing in Japanese, blackwork, and West Coast custom work.',
      },
      {
        id: 'site-calgary',
        slug: 'calgary',
        name: 'Black Maple Ink Calgary',
        city: 'Calgary',
        region: 'AB',
        country: 'CA',
        postalCode: 'T2P 1J9',
        street: '220 8 Avenue SW',
        phone: '+1 (403) 555-0177',
        email: 'calgary@blackmapleink.ca',
        hours: 'Tue–Fri 12–8 · Sat 11–6 · Sun–Mon closed',
        image:
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80&auto=format&fit=crop',
        blurb:
          'Downtown Calgary atelier focused on geometric black & grey and large-scale custom pieces.',
      },
    ],
    artists: [
      {
        id: 'art-marcus',
        slug: 'marcus-chen',
        name: 'Marcus Chen',
        specialty: 'Realism & Large-Scale',
        bio: 'Specialist in photorealism and full-sleeve narratives with over a decade of studio leadership. Known for museum-grade portraits and cohesive full-arm compositions.',
        imageUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80&auto=format&fit=crop',
        siteId: 'site-toronto',
        city: 'Toronto',
      },
      {
        id: 'art-sofia',
        slug: 'sofia-reyes',
        name: 'Sofia Reyes',
        specialty: 'Color Realism',
        bio: 'Vibrant color work and portraiture with a fine-art foundation. Sofia builds saturation and depth for pieces that age with clarity.',
        imageUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80&auto=format&fit=crop',
        siteId: 'site-toronto',
        city: 'Toronto',
      },
      {
        id: 'art-kai',
        slug: 'kai-tanaka',
        name: 'Kai Tanaka',
        specialty: 'Japanese & Blackwork',
        bio: 'Traditional Japanese motifs reimagined with modern blackwork precision. Flow, negative space, and bold silhouettes define Kai’s work.',
        imageUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80&auto=format&fit=crop',
        siteId: 'site-vancouver',
        city: 'Vancouver',
      },
      {
        id: 'art-elena',
        slug: 'elena-voss',
        name: 'Elena Voss',
        specialty: 'Black & Grey & Geometric',
        bio: 'Architectural geometry and soft black & grey shading. Elena designs structured, elegant pieces built to last a lifetime.',
        imageUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80&auto=format&fit=crop',
        siteId: 'site-calgary',
        city: 'Calgary',
      },
    ],
    services: [
      {
        slug: 'sleeve',
        name: 'Custom Sleeve Tattoos',
        description:
          'Full or half-sleeve custom compositions built as cohesive art pieces — planned from concept to final pass.',
        minPrice: 'From $800+',
        image:
          'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600&q=80',
      },
      {
        slug: 'fineline',
        name: 'Fine Line Tattoos',
        description:
          'Delicate single-needle and micro detail work with lasting clarity and refined line weight.',
        minPrice: 'From $150',
        image:
          'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80',
      },
      {
        slug: 'bngrey',
        name: 'Black & Grey',
        description:
          'Classic black & grey realism and illustrative shading with controlled contrast and soft gradients.',
        minPrice: 'From $250',
        image:
          'https://images.unsplash.com/photo-1590246814883-57c511e3d5c0?w=600&q=80',
      },
      {
        slug: 'color',
        name: 'Color Realism',
        description:
          'Vivid color portraits and nature work engineered for lasting saturation and depth.',
        minPrice: 'From $300',
        image:
          'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&q=80',
      },
      {
        slug: 'coverup',
        name: 'Cover-Ups',
        description:
          'Thoughtful redesigns that honor your story and elevate existing work with intelligent composition.',
        minPrice: 'From $400',
        image:
          'https://images.unsplash.com/photo-1598371839696-5c5bb00bdf93?w=600&q=80',
      },
      {
        slug: 'piercing',
        name: 'Professional Piercing',
        description:
          'Hospital-grade technique with premium implant-grade jewelry and clear aftercare guidance.',
        minPrice: 'From $80',
        image:
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      },
    ],
  };
})(window);
