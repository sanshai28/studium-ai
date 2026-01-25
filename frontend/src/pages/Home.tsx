import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home: React.FC = () => {
  const { user, signout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signout()
    navigate('/signin')
  }

  if (!user) {
    return (
      <div className="home">
        <h1>Welcome to Studium AI</h1>
        <p>Your intelligent note-taking companion</p>
        <div style={{ marginTop: '2rem' }}>
          <button onClick={() => navigate('/signin')} style={{ marginRight: '1rem' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      <h1>Welcome back, {user.name || user.email}!</h1>
      <p>Your intelligent note-taking companion</p>
      <button onClick={handleSignOut} style={{ marginTop: '2rem' }}>
        Sign Out
      </button>
    </div>
  )
}

export default Home
