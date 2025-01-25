import { createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'

const UserContext = createContext<User | null>(null)

export const useUser = () => useContext(UserContext)

export default UserContext 