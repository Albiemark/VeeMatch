interface ValidationError {
  field: string;
  message: string;
}

export interface ProfileData {
  userId?: string;
  displayName?: string;
  age?: number | null;
  gender?: string;
  interestedIn?: string[];
  bio?: string;
  photos?: string[];
  location?: {
    city?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  relationshipGoals?: string;
  passions?: string[];
  height?: number;
  drinking?: 'never' | 'rarely' | 'socially' | 'regularly';
  smoking?: 'never' | 'socially' | 'regularly';
  children?: 'have' | 'want' | 'don\'t want' | 'open to it';
  education?: string;
  occupation?: string;
  profileComplete?: boolean;
}

export function validateProfile(data: ProfileData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.displayName?.trim()) {
    errors.push({
      field: 'displayName',
      message: 'Name is required',
    });
  } else if (data.displayName.length < 2) {
    errors.push({
      field: 'displayName',
      message: 'Name must be at least 2 characters long',
    });
  }

  // Age validation
  if (!data.age || data.age < 18) {
    errors.push({
      field: 'age',
      message: 'You must be at least 18 years old',
    });
  }

  // Gender validation
  if (!data.gender) {
    errors.push({
      field: 'gender',
      message: 'Gender is required',
    });
  }

  // Location validation
  if (!data.location?.city?.trim() || !data.location?.country?.trim()) {
    errors.push({
      field: 'location',
      message: 'City and country are required',
    });
  }

  // Bio validation
  if (!data.bio?.trim()) {
    errors.push({
      field: 'bio',
      message: 'Bio is required',
    });
  } else if (data.bio.length < 50) {
    errors.push({
      field: 'bio',
      message: 'Bio must be at least 50 characters long',
    });
  }

  // Photos validation
  if (!data.photos?.length) {
    errors.push({
      field: 'photos',
      message: 'At least one photo is required',
    });
  }

  // Passions validation
  if (!data.passions?.length || data.passions.length < 3) {
    errors.push({
      field: 'passions',
      message: 'Please select at least 3 passions',
    });
  }

  // Relationship goals validation
  if (!data.relationshipGoals) {
    errors.push({
      field: 'relationshipGoals',
      message: 'Please select your relationship goals',
    });
  }

  return errors;
}

export function validateStep(step: number, data: any): boolean {
  switch (step) {
    case 1:
      if (!data.displayName?.trim()) {
        return false;
      }
      if (!data.age || parseInt(data.age) < 18 || parseInt(data.age) > 120) {
        return false;
      }
      if (!data.gender) {
        return false;
      }
      return true;

    case 2:
      if (!data.bio?.trim()) {
        return false;
      }
      if (!data.occupation?.trim()) {
        return false;
      }
      if (!data.education?.trim()) {
        return false;
      }
      return true;

    case 3:
      if (!data.locationCity?.trim()) {
        return false;
      }
      if (!data.locationCountry?.trim()) {
        return false;
      }
      if (!data.relationshipGoals) {
        return false;
      }
      return true;

    case 4:
      if (!data.drinking) {
        return false;
      }
      if (!data.smoking) {
        return false;
      }
      if (!data.children) {
        return false;
      }
      return true;

    default:
      return true;
  }
} 