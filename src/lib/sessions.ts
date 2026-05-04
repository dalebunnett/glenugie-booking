import { promises as fs } from 'fs';

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
}

// For admin sessions, we'll use a simple in-memory store with longer sessions
// In production, this should be replaced with Cloudflare KV or Durable Objects
const sessionsStore = new Map<string, Session>();

// For customer sessions, we'll use the same in-memory approach for now
const customerSessionsStore = new Map<string, { id: string; customerId: string; createdAt: string; expiresAt: string }>();

export const sessions = {
  create: (sessionId: string, expiresInHours = 24): Session => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    
    const session: Session = {
      id: sessionId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    sessionsStore.set(sessionId, session);
    console.log('[Sessions] Created admin session:', sessionId, 'expires:', expiresAt.toISOString());
    return session;
  },

  get: (sessionId: string): Session | undefined => {
    const session = sessionsStore.get(sessionId);
    
    // Check if session exists and is not expired
    if (session) {
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      if (now > expiresAt) {
        // Session expired, remove it
        console.log('[Sessions] Session expired:', sessionId);
        sessionsStore.delete(sessionId);
        return undefined;
      }
      
      console.log('[Sessions] Valid session found:', sessionId);
      return session;
    }
    
    console.log('[Sessions] Session not found:', sessionId);
    return undefined;
  },

  delete: (sessionId: string): boolean => {
    console.log('[Sessions] Deleting session:', sessionId);
    return sessionsStore.delete(sessionId);
  },

  cleanup: (): number => {
    // Remove all expired sessions
    const now = new Date();
    let count = 0;
    
    for (const [id, session] of sessionsStore.entries()) {
      const expiresAt = new Date(session.expiresAt);
      if (now > expiresAt) {
        sessionsStore.delete(id);
        count++;
      }
    }
    
    if (count > 0) {
      console.log('[Sessions] Cleaned up', count, 'expired sessions');
    }
    return count;
  },

  createCustomerSession: async (customerId: string, expiresInHours = 720): Promise<{ id: string; customerId: string }> => {
    const sessionId = `customer-session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    
    const session = {
      id: sessionId,
      customerId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    customerSessionsStore.set(sessionId, session);
    console.log('[Sessions] Created customer session:', sessionId, 'for customer:', customerId);
    return { id: sessionId, customerId };
  },

  getCustomerSession: async (sessionId: string): Promise<{ id: string; customerId: string } | undefined> => {
    const session = customerSessionsStore.get(sessionId);
    
    if (session) {
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      if (now > expiresAt) {
        console.log('[Sessions] Customer session expired:', sessionId);
        customerSessionsStore.delete(sessionId);
        return undefined;
      }
      
      console.log('[Sessions] Valid customer session found:', sessionId);
      return { id: session.id, customerId: session.customerId };
    }
    
    console.log('[Sessions] Customer session not found:', sessionId);
    return undefined;
  },

  deleteCustomerSession: async (sessionId: string): Promise<boolean> => {
    console.log('[Sessions] Deleting customer session:', sessionId);
    return customerSessionsStore.delete(sessionId);
  },

  cleanupCustomerSessions: async (): Promise<number> => {
    const now = new Date();
    let count = 0;
    
    for (const [id, session] of customerSessionsStore.entries()) {
      const expiresAt = new Date(session.expiresAt);
      if (now > expiresAt) {
        customerSessionsStore.delete(id);
        count++;
      }
    }
    
    if (count > 0) {
      console.log('[Sessions] Cleaned up', count, 'expired customer sessions');
    }
    return count;
  }
};

