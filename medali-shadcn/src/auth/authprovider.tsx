import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth, db } from "@/firebaseConfig"
import { ref, get } from "firebase/database"

type UserData = {
  uid: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  type?: string
  medicalId?: string | null
  doctors?: string[]
  secretaries?: string[]
  requestedTo?: string[]
  requestedBy:string[]
  field?: string | null
}

type AuthContextType = {
  user: UserData | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`)
        const snapshot = await get(userRef)
        const data = snapshot.exists() ? snapshot.val() : {}
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email!, ...data })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
