import React, { createContext, useContext } from 'react';

interface UserContextType {
    isLegalRep: boolean;
    isEstablishment: boolean;
    openModule: boolean;
    isLegalRepstate: boolean;
    isEstablishmentstate: boolean;
    setOpenModule: (value: boolean) => void;
    setLegelRepState: (value: boolean) => void;
    setEstablishmentState: (value: boolean) => void;
    selected: string | null;
    setSelected: (value: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider: React.FC<
    Omit<UserContextType, 'setOpenModule'>
    & Omit<UserContextType, 'setLegelRepState'> &
    Omit<UserContextType, 'setEstablishmentState'> &
    { children: React.ReactNode }> = ({
        children,
        openModule,
        isLegalRep,
        isEstablishment
    }) => {
        const [moduleOpen, setModuleOpen] = React.useState(openModule);
        const [isLegalRepstate, setIsLegalRep] = React.useState(isLegalRep);
        const [isEstablishmentstate, setIsEstablishment] = React.useState(isEstablishment);
        const [selected, setSelected] = React.useState<string | null>(null);
        return (
            <UserContext.Provider value={{
                isLegalRep,
                isEstablishment,
                isLegalRepstate,
                isEstablishmentstate,
                openModule: moduleOpen,
                setOpenModule: setModuleOpen,
                setLegelRepState: setIsLegalRep,
                setEstablishmentState: setIsEstablishment,
                selected,
                setSelected
            }}>
                {children}
            </UserContext.Provider>
        );
    }; 