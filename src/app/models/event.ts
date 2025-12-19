export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  dateDisplay: string;
  time?: string;
  location: string;
  borderColor: 'teal' | 'yellow' | 'orange';
  bgGradient: string;
  active: boolean;
}