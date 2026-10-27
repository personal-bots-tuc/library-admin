export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export interface SidebarBrandProps {
  collapsed: boolean;
  schoolName: string;
  onToggle: () => void;
}

export interface SidebarNavItemProps extends NavItem {
  end: boolean;
  collapsed: boolean;
}

export interface SidebarFooterProps {
  collapsed: boolean;
  name: string;
  role: string;
  initials: string;
  onLogout: () => void;
}
