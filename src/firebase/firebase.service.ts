import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  public readonly firestore: admin.firestore.Firestore;
  public readonly auth: admin.auth.Auth;

    constructor(private configService: ConfigService) {
    const projectId   = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    let privateKey    = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase credentials are missing');
    }

    privateKey = privateKey.replace(/\\n/g, '\n');

    if (!admin.apps.length) {
        admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        projectId,
        });
    }

    this.firestore = admin.firestore();
    this.auth = admin.auth();
    }

    async onModuleInit() {
    try {
        await this.firestore.collection('_health').doc('check').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'connected',
        }, { merge: true });
        this.logger.log('✅ Firebase initialized successfully');
    } catch (error: any) {
        this.logger.error(`❌ Firebase initialization failed: ${error?.message ?? error}`);
    }
    }

    runTransaction<T>(fn: (tx: FirebaseFirestore.Transaction)=>Promise<T>) {
    return this.firestore.runTransaction(fn);
}

  getTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  getFieldValue() {
    return admin.firestore.FieldValue;
  }
}   