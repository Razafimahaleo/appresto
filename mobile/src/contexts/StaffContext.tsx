import React, { createContext, useContext, useState } from 'react';

export type StaffProfileInfo = {
  id: string;
  name: string;
  role: 'chef' | 'cashier';
};

type StaffContextType = {
  currentStaff: StaffProfileInfo | null;
  setCurrentStaff: (staff: StaffProfileInfo | null) => void;
  clearStaff: () => void;
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStaff, setCurrentStaff] = useState<StaffProfileInfo | null>(null);

  const clearStaff = () => setCurrentStaff(null);

  return (
    <StaffContext.Provider
      value={{ currentStaff, setCurrentStaff, clearStaff }}
    >
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const ctx = useContext(StaffContext);
  if (ctx === undefined)
    throw new Error('useStaff must be used within StaffProvider');
  return ctx;
};
