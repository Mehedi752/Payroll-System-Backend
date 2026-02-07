/**
 * Base Service Class - Provides common database operations
 * Demonstrates: Encapsulation, Abstraction, and Generic Programming
 */
export abstract class BaseService<T> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  /**
   * Find all records with optional filters
   * @param where - Filter conditions
   * @param include - Related data to include
   */
  protected async findAll(where: any = {}, include: any = {}): Promise<T[]> {
    return await this.model.findMany({ where, include });
  }

  /**
   * Find a record by ID
   * @param id - Record identifier
   * @param include - Related data to include
   */
  protected async findById(id: string, include: any = {}): Promise<T | null> {
    return await this.model.findUnique({ where: { id }, include });
  }

  /**
   * Create a new record
   * @param data - Data to create
   */
  protected async create(data: any): Promise<T> {
    return await this.model.create({ data });
  }

  /**
   * Update a record by ID
   * @param id - Record identifier
   * @param data - Data to update
   */
  protected async update(id: string, data: any): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  /**
   * Delete a record by ID
   * @param id - Record identifier
   */
  protected async delete(id: string): Promise<T> {
    return await this.model.delete({ where: { id } });
  }

  /**
   * Count records with optional filters
   * @param where - Filter conditions
   */
  protected async count(where: any = {}): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * Check if record exists
   * @param id - Record identifier
   */
  protected async exists(id: string): Promise<boolean> {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  }
}
