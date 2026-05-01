import { getDb } from '../utils/db.util';
import type { CreateMember, UpdateMember } from '../utils/validate.util';

export interface IMember {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  joined_at: string;
  is_active: number;
}

export const MemberModel = {
  findAll(activeOnly = false): IMember[] {
    const where = activeOnly ? `WHERE is_active = 1` : '';
    return getDb().prepare(`SELECT * FROM members ${where} ORDER BY joined_at DESC`).all() as IMember[];
  },

  findById(id: number): IMember | undefined {
    return getDb().prepare(`SELECT * FROM members WHERE id = ?`).get(id) as IMember | undefined;
  },

  findByEmail(email: string): IMember | undefined {
    return getDb().prepare(`SELECT * FROM members WHERE email = ?`).get(email) as IMember | undefined;
  },

  create(data: CreateMember): IMember {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO members (name, email, phone) VALUES (@name, @email, @phone)
    `).run({ phone: null, ...data });
    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, data: UpdateMember): IMember | undefined {
    const db = getDb();
    const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
    if (!fields) return this.findById(id);
    db.prepare(`UPDATE members SET ${fields} WHERE id = @id`).run({ ...data, id });
    return this.findById(id);
  },

  setActive(id: number, active: boolean): IMember | undefined {
    getDb().prepare(`UPDATE members SET is_active = ? WHERE id = ?`).run(active ? 1 : 0, id);
    return this.findById(id);
  },
};
