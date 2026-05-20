import React from "react";
import {
  AreaChart,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  Edit3,
  Eye,
  EyeOff,
  Gift,
  Heart,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MapPin,
  MessageCircle,
  Moon,
  Package,
  Phone,
  Plus,
  Send,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Truck,
  Upload,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";

const ICONS = {
  analytics: BarChart3,
  alert: CircleAlert,
  bell: Bell,
  book: BookOpen,
  bot: Bot,
  calendar: Calendar,
  cart: ShoppingCart,
  chart: AreaChart,
  check: Check,
  checkCircle: CheckCircle2,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clock: Clock3,
  creditCard: CreditCard,
  dashboard: LayoutDashboard,
  edit: Edit3,
  eye: Eye,
  eyeOff: EyeOff,
  gift: Gift,
  heart: Heart,
  home: Home,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  mapPin: MapPin,
  message: MessageCircle,
  moon: Moon,
  package: Package,
  phone: Phone,
  plus: Plus,
  send: Send,
  search: Search,
  shield: ShieldCheck,
  shoppingBag: ShoppingBag,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  trash: Trash2,
  truck: Truck,
  upload: Upload,
  user: User,
  users: Users,
  wallet: Wallet,
  x: X,
};

const AppIcon = ({ name, size = 18, className = "", strokeWidth = 2.2, ...props }) => {
  const Icon = ICONS[name] || CircleAlert;

  return (
    <Icon
      aria-hidden="true"
      className={`app-icon ${className}`.trim()}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export default AppIcon;
