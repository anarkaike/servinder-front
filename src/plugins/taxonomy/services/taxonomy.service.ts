import { db } from '@/core/database/db';
import { taxonomy } from '../models/taxonomy';
import { tradeable } from '../models/tradeable';
import { eq, and } from 'drizzle-orm';
import type { Taxonomy, Tradeable } from '../types';

export class TaxonomyService {
  private static instance: TaxonomyService;

  private constructor() {}

  public static getInstance(): TaxonomyService {
    if (!TaxonomyService.instance) {
      TaxonomyService.instance = new TaxonomyService();
    }
    return TaxonomyService.instance;
  }

  async getTaxonomies(tenantId: string, type?: string): Promise<Taxonomy[]> {
    const conditions = [eq(taxonomy.tenantId, tenantId)];
    if (type) {
      conditions.push(eq(taxonomy.type, type));
    }

    const taxonomies = await db.query.taxonomy.findMany({
      where: and(...conditions),
      with: {
        children: true,
        tradeables: true,
      },
    });

    return this.buildTaxonomyTree(taxonomies);
  }

  private buildTaxonomyTree(taxonomies: Taxonomy[], parentId: string | null = null): Taxonomy[] {
    return taxonomies
      .filter(tax => tax.parentId === parentId)
      .map(tax => ({
        ...tax,
        children: this.buildTaxonomyTree(taxonomies, tax.id),
      }));
  }

  async createTaxonomy(taxonomyData: Partial<Taxonomy>): Promise<Taxonomy> {
    const result = await db.insert(taxonomy)
      .values(taxonomyData)
      .returning();
    
    return result[0];
  }

  async linkTradeableToTaxonomy(tradeableId: string, taxonomyId: string): Promise<void> {
    await db.update(tradeable)
      .set({ taxonomyId })
      .where(eq(tradeable.id, tradeableId));
  }
}

export const taxonomyService = TaxonomyService.getInstance();
