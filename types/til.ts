export interface TIL {
  id: string;
  content: string;
  tags: string[];
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateTILInput = Pick<TIL, "content" | "tags">;
export type UpdateTILInput = Partial<Pick<TIL, "content" | "tags" | "is_published">>;
