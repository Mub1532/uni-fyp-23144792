import type { IconType } from "react-icons";
import { FaCalendarAlt, FaCalendarDay, FaCog, FaHome } from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";

export enum NavPosition {
  PRIMARY,
  SECONDARY, // Desktop: below divider, Mobile: overflow menu'
  BOTTOM,
  HIDDEN,
}

export interface PageDataProps {
  name: string;
  path: string;
  authenticated?: boolean;
  icon?: IconType;
  hidden?: boolean;
  needAuth?: boolean;
}

export class Page {
  name: string;

  path: string;

  authenticated: boolean;

  icon?: IconType;

  hidden?: boolean = false;

  needAuth?: boolean = true;

  constructor(options: PageDataProps) {
    this.name = options.name;
    this.path = options.path;
    this.authenticated = options.authenticated || false;
    this.icon = options.icon;
    this.hidden = options.hidden ?? false;
    this.needAuth = options.needAuth ?? true;
  }
}

export const pages = [
  new Page({
    name: "Home",
    path: "/",
    icon: FaHome,
  }),
  new Page({
    name: "Calendar",
    path: "/calendar",
    icon: FaCalendarAlt,
  }),
  new Page({
    name: "AI Planner",
    path: "/plan",
    icon: FaCalendarDay,
  }),
  new Page({
    name: "Notes",
    path: "/notes",
    icon: FaNoteSticky,
  }),
  new Page({
    name: "Settings",
    path: "/settings",
    icon: FaCog,
  }),
  new Page({
    name: "Login",
    path: "/auth/login",
    icon: FaCog,
    hidden: true,
    needAuth: false,
  }),
  new Page({
    name: "Sign Up",
    path: "/auth/register",
    icon: FaCog,
    hidden: true,
    needAuth: false,
  }),
  new Page({
    name: "Privacy Policy",
    path: "/privacy",
    icon: FaCog,
    hidden: false,
    needAuth: false,
  }),
  new Page({
    name: "Terms Of Service",
    path: "/tos",
    icon: FaCog,
    hidden: false,
    needAuth: false,
  }),
];
