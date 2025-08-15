import React from 'react';
import { Camera, Heart, Users, Footprints, ThumbsUp, MessageSquare, Award, Icon as LucideIcon } from 'lucide-react';

const icons: { [key: string]: LucideIcon } = {
  Camera,
  Heart,
  Users,
  Footprints,
  ThumbsUp,
  MessageSquare,
  Award, // Default
};

interface BadgeIconProps {
  name: string;
  className?: string;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({ name, className }) => {
  const Icon = icons[name] || icons['Award'];
  return <Icon className={className} />;
};

export default BadgeIcon;