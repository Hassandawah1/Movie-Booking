import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Ban,
  Building2,
  CalendarDays,
  Check,
  CircleCheck,
  Clock3,
  Clapperboard,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  Film,
  Globe2,
  Info,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Monitor,
  Popcorn,
  Printer,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  Timer,
  TrendingUp,
  Trash2,
  UserRound,
  UsersRound,
  Volume2,
  X
} from "lucide-react"

const icons = {
  alert: AlertTriangle,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  badgeCheck: BadgeCheck,
  ban: Ban,
  building: Building2,
  calendar: CalendarDays,
  check: Check,
  circleCheck: CircleCheck,
  clock: Clock3,
  clapperboard: Clapperboard,
  creditCard: CreditCard,
  dollar: DollarSign,
  eye: Eye,
  eyeOff: EyeOff,
  film: Film,
  globe: Globe2,
  info: Info,
  key: KeyRound,
  dashboard: LayoutDashboard,
  lock: LockKeyhole,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  monitor: Monitor,
  popcorn: Popcorn,
  printer: Printer,
  radio: Radio,
  refresh: RefreshCw,
  search: Search,
  shield: ShieldCheck,
  star: Star,
  ticket: Ticket,
  timer: Timer,
  trending: TrendingUp,
  trash: Trash2,
  user: UserRound,
  users: UsersRound,
  volume: Volume2,
  close: X
}

const AppIcon = ({ name, size = 18, className, strokeWidth = 2, ...props }) => {
  const IconComponent = icons[name]
  if (!IconComponent) return null

  return (
    <IconComponent
      aria-hidden="true"
      focusable="false"
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  )
}

export default AppIcon
