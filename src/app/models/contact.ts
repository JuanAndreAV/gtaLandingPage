export interface Contact {
    address: string;
  phone: string;
  email: string;
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  schedule: {
    weekdays: string;
    saturday: string;
    sunday?: string;
  };
}
