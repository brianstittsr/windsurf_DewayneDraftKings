import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface EmailRecipient {
  email: string;
  name?: string;
  active: boolean;
  addedAt: Date;
}

export interface EmailConfig {
  registrationNotifications: EmailRecipient[];
  lastUpdated: Date;
}

const DEFAULT_CONFIG: EmailConfig = {
  registrationNotifications: [
    {
      email: 'dewayne.thomas2011@gmail.com',
      name: 'Dewayne Thomas',
      active: true,
      addedAt: new Date()
    }
  ],
  lastUpdated: new Date()
};

export const EMAIL_CONFIG_ID = 'registration_notifications';

/**
 * Get email configuration from Firestore
 */
export async function getEmailConfig(): Promise<EmailConfig> {
  try {
    if (!db) {
      console.warn('Firebase not available - using default email config');
      return DEFAULT_CONFIG;
    }

    const configDoc = await getDoc(doc(db, 'configuration', EMAIL_CONFIG_ID));
    
    if (!configDoc.exists()) {
      // Initialize with default config if it doesn't exist
      await setDoc(doc(db, 'configuration', EMAIL_CONFIG_ID), {
        ...DEFAULT_CONFIG,
        registrationNotifications: DEFAULT_CONFIG.registrationNotifications.map(recipient => ({
          ...recipient,
          addedAt: new Date()
        })),
        lastUpdated: new Date()
      });
      return DEFAULT_CONFIG;
    }

    const data = configDoc.data() as EmailConfig;
    return data;
  } catch (error) {
    console.error('Error getting email config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Add a new email recipient for registration notifications
 */
export async function addEmailRecipient(email: string, name?: string): Promise<boolean> {
  try {
    if (!db) {
      console.warn('Firebase not available - cannot add email recipient');
      return false;
    }

    const configRef = doc(db, 'configuration', EMAIL_CONFIG_ID);
    
    // Check if config exists
    const configDoc = await getDoc(configRef);
    
    if (!configDoc.exists()) {
      // Initialize with default config if it doesn't exist
      await setDoc(configRef, {
        ...DEFAULT_CONFIG,
        registrationNotifications: [
          ...DEFAULT_CONFIG.registrationNotifications,
          {
            email,
            name,
            active: true,
            addedAt: new Date()
          }
        ],
        lastUpdated: new Date()
      });
    } else {
      // Add new recipient to existing config
      await updateDoc(configRef, {
        registrationNotifications: arrayUnion({
          email,
          name,
          active: true,
          addedAt: new Date()
        }),
        lastUpdated: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding email recipient:', error);
    return false;
  }
}

/**
 * Remove an email recipient from registration notifications
 */
export async function removeEmailRecipient(email: string): Promise<boolean> {
  try {
    if (!db) {
      console.warn('Firebase not available - cannot remove email recipient');
      return false;
    }

    const config = await getEmailConfig();
    const recipient = config.registrationNotifications.find(r => r.email === email);
    
    if (!recipient) {
      return false;
    }

    const configRef = doc(db, 'configuration', EMAIL_CONFIG_ID);
    
    await updateDoc(configRef, {
      registrationNotifications: arrayRemove(recipient),
      lastUpdated: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error removing email recipient:', error);
    return false;
  }
}

/**
 * Get all active email recipients for registration notifications
 */
export async function getActiveEmailRecipients(): Promise<string[]> {
  try {
    const config = await getEmailConfig();
    return config.registrationNotifications
      .filter(recipient => recipient.active)
      .map(recipient => recipient.email);
  } catch (error) {
    console.error('Error getting active email recipients:', error);
    return ['dewayne.thomas2011@gmail.com']; // Fallback to default
  }
}
