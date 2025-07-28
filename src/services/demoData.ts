// Demo data service for demonstration purposes
export interface DemoFacility {
  id: string;
  name: string;
  description: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  provider_id: string;
}

export interface DemoUnit {
  id: string;
  facility_id: string;
  unit_number: string;
  size_category: string;
  length_metres: number;
  width_metres: number;
  monthly_price_pence: number;
  status: string;
  features: string[];
}

export const DEMO_FACILITY: DemoFacility = {
  id: "demo-facility-1",
  name: "SecureStore Demo Facility",
  description: "A premier self-storage facility offering secure, convenient storage solutions for personal and business needs.",
  address: "123 Storage Lane, London, SW1A 1AA",
  contact_email: "demo@securestore.co.uk",
  contact_phone: "+44 20 7946 0958",
  provider_id: "demo-storage"
};

export const DEMO_UNITS: DemoUnit[] = [
  {
    id: "demo-unit-1",
    facility_id: "demo-facility-1",
    unit_number: "A101",
    size_category: "Small",
    length_metres: 2,
    width_metres: 2,
    monthly_price_pence: 4500, // £45/month
    status: "available",
    features: ["Ground Floor", "24/7 Access", "CCTV"]
  },
  {
    id: "demo-unit-2",
    facility_id: "demo-facility-1",
    unit_number: "B205",
    size_category: "Medium",
    length_metres: 3,
    width_metres: 3,
    monthly_price_pence: 7500, // £75/month
    status: "available",
    features: ["Climate Controlled", "Drive-Up Access", "24/7 Access", "CCTV"]
  },
  {
    id: "demo-unit-3",
    facility_id: "demo-facility-1",
    unit_number: "C308",
    size_category: "Large",
    length_metres: 4,
    width_metres: 4,
    monthly_price_pence: 12000, // £120/month
    status: "available",
    features: ["Climate Controlled", "Ground Floor", "24/7 Access", "CCTV", "Security Alarm"]
  },
  {
    id: "demo-unit-4",
    facility_id: "demo-facility-1",
    unit_number: "A103",
    size_category: "Small",
    length_metres: 2,
    width_metres: 1.5,
    monthly_price_pence: 3500, // £35/month
    status: "available",
    features: ["Ground Floor", "24/7 Access"]
  },
  {
    id: "demo-unit-5",
    facility_id: "demo-facility-1",
    unit_number: "B210",
    size_category: "Medium",
    length_metres: 3,
    width_metres: 2.5,
    monthly_price_pence: 6500, // £65/month
    status: "available",
    features: ["Drive-Up Access", "24/7 Access", "CCTV"]
  },
  {
    id: "demo-unit-6",
    facility_id: "demo-facility-1",
    unit_number: "C315",
    size_category: "Large",
    length_metres: 5,
    width_metres: 4,
    monthly_price_pence: 15000, // £150/month
    status: "available",
    features: ["Climate Controlled", "Drive-Up Access", "24/7 Access", "CCTV", "Security Alarm", "Premium Location"]
  }
];

// Demo data service functions
export const getDemoFacility = (providerId: string): DemoFacility | null => {
  if (providerId === "demo-storage") {
    return DEMO_FACILITY;
  }
  return null;
};

export const getDemoUnits = (facilityId?: string): DemoUnit[] => {
  if (facilityId === "demo-storage" || facilityId === "demo-facility-1") {
    return DEMO_UNITS;
  }
  return [];
};

export const getDemoUnit = (unitId: string): DemoUnit | null => {
  return DEMO_UNITS.find(unit => unit.id === unitId) || null;
};

export const isDemoProvider = (providerId?: string): boolean => {
  return providerId === "demo-storage";
};