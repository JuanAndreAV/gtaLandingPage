export interface News {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: 'yellow' | 'orange' | 'blue' | 'teal';
  icon: string;
  iconGradient: string;
  link: string;
  linkText: string;
  createdAt: Date;
  active: boolean;
}