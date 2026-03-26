import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppRole = "homeowner" | "tradesperson";

export interface AppProfile {
  id: number;
  userId: number;
  appRole: AppRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
  postcode: string;
  profilePhotoUrl?: string | null;
  subscriptionTier: "free" | "pro" | "business";
  loyaltyTier: "bronze" | "silver" | "gold";
  totalJobsCompleted: number;
  averageRating: string;
  reviewCount: number;
}

interface AppContextValue {
  profile: AppProfile | null;
  isLoading: boolean;
  setProfile: (p: AppProfile | null) => void;
  activeRole: AppRole;
  switchRole: (role: AppRole) => void;
  unreadCount: number;
  setUnreadCount: (n: number) => void;
}

const AppContext = createContext<AppContextValue>({
  profile: null,
  isLoading: true,
  setProfile: () => {},
  activeRole: "homeowner",
  switchRole: () => {},
  unreadCount: 0,
  setUnreadCount: () => {},
});

const ROLE_KEY = "tq_active_role";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<AppProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<AppRole>("homeowner");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(ROLE_KEY).then((r) => {
      if (r === "homeowner" || r === "tradesperson") setActiveRole(r);
      setIsLoading(false);
    });
  }, []);

  const setProfile = (p: AppProfile | null) => {
    setProfileState(p);
    if (p) setActiveRole(p.appRole);
  };

  const switchRole = async (role: AppRole) => {
    setActiveRole(role);
    await AsyncStorage.setItem(ROLE_KEY, role);
  };

  return (
    <AppContext.Provider value={{ profile, isLoading, setProfile, activeRole, switchRole, unreadCount, setUnreadCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
