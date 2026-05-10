export type GenderCount = {
  m: number;
  f: number;
};

export type AgeRangeEnrolment = {
  '3-4': GenderCount;
  '5': GenderCount;
  '6-11': GenderCount;
  '12-18': GenderCount;
  '19+': GenderCount;
  total: GenderCount;
};

export type StaffCount = {
  '19-29': GenderCount;
  '30-39': GenderCount;
  '40-49': GenderCount;
  '50-59': GenderCount;
  '60+': GenderCount;
  total: GenderCount;
};

export type DamageLevel = 0 | 1 | 2 | 3 | 4;

export type FacilityDamage = {
  noDamage: number;
  minor: number;
  moderate: number;
  significant: number;
  completelyDestroyed: number;
  photos?: Array<{
    url: string;
    name: string;
    timestamp: string;
  }>;
};

export type FormData = {
  // Section 1
  hazardType: string;
  impactDates: string;
  province: string;
  wardCommunity: string;
  assessmentDate: string;
  schoolName: string;
  siemisRegistration: string;
  gpsLocation: string;
  locationType: string;
  learningCentreType: string;
  educationProvider: string;
  accessibility: string;

  // Section 2
  enrolment: Record<string, AgeRangeEnrolment>;
  staff: {
    teachers: StaffCount;
    otherStaff: StaffCount;
  };

  // Section 3
  operationalStatus: 'Operational' | 'Partially Operational' | 'Not Operational';
  closureDate: string;
  closureReason: string;
  reopeningDate: string;
  interimArrangements: string[];

  // Section 4
  overallDamageLevel: DamageLevel;
  facilityDamage: Record<string, FacilityDamage>;
  safeForUse: 'Yes' | 'No' | 'Pending Assessment';
  cordonedOff: 'Yes' | 'No';
  immediateRisks: string;

  // Section 5
  unusableClassrooms: number;
  disruptedDays: number;
  examsAffected: 'Yes' | 'No';
  materialsAffected: 'Yes' | 'No';
  materialLosses: string[];
  impactDescription: string;

  // Section 6
  studentsAffected: number;
  displacedStudents: number;
  disabilitiesAffected: 'Yes' | 'No';
  disabilityDetails: any[]; // Simplified for now
  boardingAffected: 'Yes' | 'No';
  observedRisks: string[];
  studentComments: string;

  // Section 7
  teachersAffected: number;
  teacherAccommodationDamaged: 'Yes' | 'No';
  teachersDisplaced: 'Yes' | 'No';
  substituteRequired: 'Yes' | 'No';
  substituteNumber: number;
  teacherImpactDetails: string;

  // Section 8
  priorityNeedsImmediate: string[];
  leadResponsibilityImmediate: string[];
  priorityNeedsDetails: string;
  priorityNeedsShortTerm: string[];
  leadResponsibilityShortTerm: string[];
  priorityNeedsShortTermDetails: string;

  // Section 9
  resourceRequirements: Array<{
    item: string;
    quantity: string;
    cost: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;

  // Section 10
  attachments: string[];
  photos: Array<{
    url: string;
    name: string;
    timestamp: string;
  }>;

  // Section 11
  recommendations: string;

  // Section 12
  assessor: {
    name: string;
    position: string;
    email: string;
    phone: string;
    date: string;
  };
  interviewee: {
    name: string;
    position: string;
    email: string;
    phone: string;
    date: string;
  };
};
