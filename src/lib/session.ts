// Session management utilities
export interface SessionData {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string;
  };
  token: string;
  expiresAt: number;
}

const SESSION_KEY = 'nrgug_admin_session';
const TOKEN_KEY = 'nrgug_admin_token';

// Session duration: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const sessionManager = {
  // Create a new session
  createSession(user: SessionData['user'], token: string): void {
    const sessionData: SessionData = {
      user,
      token,
      expiresAt: Date.now() + SESSION_DURATION,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get current session
  getSession(): SessionData | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session: SessionData = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      this.clearSession();
      return null;
    }
  },

  // Get current user
  getUser(): SessionData['user'] | null {
    const session = this.getSession();
    return session?.user || null;
  },

  // Get auth token
  getToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  // Extend session (refresh expiry time)
  extendSession(): void {
    const session = this.getSession();
    if (session) {
      session.expiresAt = Date.now() + SESSION_DURATION;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  },

  // Clear session (logout)
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  // Check if session is about to expire (within 1 hour)
  isSessionExpiringSoon(): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    const oneHour = 60 * 60 * 1000;
    return session.expiresAt - Date.now() < oneHour;
  },

  // Get time until session expires (in minutes)
  getTimeUntilExpiry(): number {
    const session = this.getSession();
    if (!session) return 0;
    
    const timeLeft = session.expiresAt - Date.now();
    return Math.max(0, Math.floor(timeLeft / (60 * 1000)));
  }
};

// Auto-extend session on user activity
export const setupSessionAutoExtend = () => {
  const extendSession = () => {
    if (sessionManager.isAuthenticated()) {
      sessionManager.extendSession();
    }
  };

  // Extend session on user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  events.forEach(event => {
    document.addEventListener(event, extendSession, true);
  });

  // Extend session every 30 minutes
  const interval = setInterval(() => {
    if (sessionManager.isAuthenticated()) {
      sessionManager.extendSession();
    } else {
      clearInterval(interval);
    }
  }, 30 * 60 * 1000);

  return () => {
    events.forEach(event => {
      document.removeEventListener(event, extendSession, true);
    });
    clearInterval(interval);
  };
};
