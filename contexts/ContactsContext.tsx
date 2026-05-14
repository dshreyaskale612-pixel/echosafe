import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface ContactsContextType {
  contacts: EmergencyContact[];
  addContact: (contact: Omit<EmergencyContact, "id">) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, contact: Omit<EmergencyContact, "id">) => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "@echosafe_contacts";

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setContacts(JSON.parse(data));
        } catch {
          setContacts([]);
        }
      }
    });
  }, []);

  const saveContacts = useCallback(async (updated: EmergencyContact[]) => {
    setContacts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addContact = useCallback(
    (contact: Omit<EmergencyContact, "id">) => {
      const newContact: EmergencyContact = {
        ...contact,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      saveContacts([...contacts, newContact]);
    },
    [contacts, saveContacts]
  );

  const removeContact = useCallback(
    (id: string) => {
      saveContacts(contacts.filter((c) => c.id !== id));
    },
    [contacts, saveContacts]
  );

  const updateContact = useCallback(
    (id: string, contact: Omit<EmergencyContact, "id">) => {
      saveContacts(contacts.map((c) => (c.id === id ? { ...contact, id } : c)));
    },
    [contacts, saveContacts]
  );

  return (
    <ContactsContext.Provider
      value={{ contacts, addContact, removeContact, updateContact }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
}
