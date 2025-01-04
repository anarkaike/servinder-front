import { defineStore } from 'pinia'
import { User } from '../models/User'
import { UserService } from '../services/UserService'

interface UserState {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
}

export const useUserStore = defineStore('users', {
  state: (): UserState => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),

  getters: {
    getUserById: (state) => (id: string) => state.users.find(user => user.id === id),
    hasUsers: (state) => state.users.length > 0,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const userService = new UserService()
        this.users = await userService.getAllUsers()
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserById(userId: string) {
      this.loading = true
      this.error = null
      try {
        const userService = new UserService()
        const user = await userService.getUserById(userId)
        if (!user) {
          throw new Error(`User with id ${userId} not found`)
        }
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index] = user
        } else {
          this.users.push(user)
        }
        return user
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(userData: Partial<User>) {
      this.loading = true
      this.error = null
      try {
        const userService = new UserService()
        const newUser = await userService.createUser(userData)
        this.users.push(newUser)
        return newUser
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId: string, userData: Partial<User>) {
      this.loading = true
      this.error = null
      try {
        const userService = new UserService()
        const updatedUser = await userService.updateUser(userId, userData)
        if (!updatedUser) {
          throw new Error('User not found')
        }
        const index = this.users.findIndex(user => user.id === userId)
        if (index !== -1) {
          this.users[index] = updatedUser
        }
        if (this.currentUser?.id === userId) {
          this.currentUser = updatedUser
        }
        return updatedUser
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUser(userId: string) {
      this.loading = true
      this.error = null
      try {
        const userService = new UserService()
        await userService.deleteUser(userId)
        this.users = this.users.filter(user => user.id !== userId)
        if (this.currentUser?.id === userId) {
          this.currentUser = null
        }
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },

    setCurrentUser(user: User | null) {
      this.currentUser = user
    },

    clearError() {
      this.error = null
    }
  }
})
