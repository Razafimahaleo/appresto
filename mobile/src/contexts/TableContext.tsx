import React, { createContext, useContext, useState } from 'react';

interface TableContextType {
  tableId: string;
  tableName: string;
  setTable: (id: string, name: string) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tableId, setTableId] = useState('');
  const [tableName, setTableName] = useState('');

  const setTable = (id: string, name: string) => {
    setTableId(id);
    setTableName(name);
  };

  return (
    <TableContext.Provider value={{ tableId, tableName, setTable }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const ctx = useContext(TableContext);
  if (ctx === undefined) throw new Error('useTable must be used within TableProvider');
  return ctx;
};
