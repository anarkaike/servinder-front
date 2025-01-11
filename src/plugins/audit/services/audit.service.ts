import { db } from '@/core/database/db';
import { audit } from '../models/audit';
import { entity } from '../models/entity';
import { eq, and, desc } from 'drizzle-orm';
import type { Audit, Entity } from '../types';

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  async createAudit(auditData: Partial<Audit>): Promise<Audit> {
    const result = await db.insert(audit)
      .values(auditData)
      .returning();
    
    return result[0];
  }

  async getAuditTrail(
    entityId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Audit[]> {
    return db.query.audit.findMany({
      where: eq(audit.entityId, entityId),
      with: {
        user: true,
      },
      orderBy: desc(audit.createdAt),
      limit: options.limit,
      offset: options.offset,
    });
  }

  async getEntityAudits(
    tenantId: string,
    entityType: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Audit[]> {
    return db.query.audit.findMany({
      where: and(
        eq(audit.tenantId, tenantId),
        eq(audit.entityType, entityType)
      ),
      with: {
        user: true,
        entity: true,
      },
      orderBy: desc(audit.createdAt),
      limit: options.limit,
      offset: options.offset,
    });
  }
}

export const auditService = AuditService.getInstance();
