/**
 * [DEPRECATED MOCK]
 * Ce hook mock simulait les partenaires. Il est remplacé par
 * un Server Component + DAL Supabase dans `PartnersContainer`.
 * Conservé à titre documentaire — NE PLUS UTILISER.
 */
// "use client";
// import { useState, useEffect } from 'react';
// import { Partner } from './types';
// const partnersData = [ /* mock data retirée */ ];
// export function usePartners() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [partners, setPartners] = useState<Partner[]>([]);
//   useEffect(() => { /* simulation retirée */ }, []);
//   return { partners, isLoading };
// }
/*

"use client";

import { useState, useEffect } from 'react';
import { Partner } from './types';

// Données mockées pour les partenaires
const partnersData = [
  {
    id: 1,
    name: "Théâtre de la Ville",
    type: "Partenaire principal",
    description: "Soutien artistique et technique pour nos créations",
    logo: "https://logo.clearbit.com/theatredelaville-paris.com",
    website: "https://theatredelaville.com"
  },
  {
    id: 2,
    name: "Région Île-de-France",
    type: "Soutien public",
    description: "Subvention pour le développement culturel",
    logo: "https://logo.clearbit.com/iledefrance.fr",
    website: "https://iledefrance.fr"
  },
  {
    id: 3,
    name: "Crédit Agricole",
    type: "Mécénat",
    description: "Soutien financier pour nos projets éducatifs",
    logo: "https://logo.clearbit.com/credit-agricole.fr",
    website: "https://fondation.credit-agricole.com"
  },
  {
    id: 4,
    name: "Orange",
    type: "Partenaire professionnel",
    description: "Partenaire technologique et mécénat culturel",
    logo: "https://logo.clearbit.com/orange.fr",
    website: "https://orange.fr"
  },
  {
    id: 5,
    name: "BNP Paribas",
    type: "Partenaire artistique",
    description: "Mécénat et soutien aux arts de la scène",
    logo: "https://logo.clearbit.com/bnpparibas.com",
    website: "https://bnpparibas.com"
  },
  {
    id: 6,
    name: "SNCF Connect",
    type: "Partenaire éducatif",
    description: "Partenaire mobilité pour les tournées",
    logo: "https://logo.clearbit.com/sncf-connect.com",
    website: "https://sncf-connect.com"
  }
];

export function usePartners() {
  const [isLoading, setIsLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => { 
    const fetchPartners = async () => {
      try {
        // Simuler un appel API avec un délai
        await new Promise(resolve => setTimeout(resolve, 600)); //TODO: remove
        
        // Dans un cas réel, nous récupérerions ces données depuis Supabase
        setPartners(partnersData);
      } catch (error) {
        console.error("Erreur lors de la récupération des partenaires", error);
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return {
    partners,
    isLoading
  };
}
*/