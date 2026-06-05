import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { ref, get } from "firebase/database";
const AuthContext = createContext({
    user: null,
    loading: true,
    logout: async () => { },
});
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userRef = ref(db, `users/${firebaseUser.uid}`);
                const snapshot = await get(userRef);
                const data = snapshot.exists() ? snapshot.val() : {};
                setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...data });
            }
            else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, loading, logout }, children: children }));
};
export const useAuth = () => useContext(AuthContext);
